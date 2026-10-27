const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const cp = require('node:child_process');
const Database = require('better-sqlite3');
const { runMigrationsAndEnsure } = require('../src/db/migrate');
const config = require('../src/config');
const merge = require('../src/services/videoMergeService');
const post = require('../src/services/mergedEpisodePostProcess');
const log = { info() {}, warn() {}, error() {} };

function setup(t, scenes = null, mergeOptions = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'muforge-merge-correctness-'));
  const db = new Database(':memory:');
  runMigrationsAndEnsure(db);
  db.exec("INSERT INTO dramas(id,title) VALUES(1,'fixture'); INSERT INTO episodes(id,drama_id) VALUES(1,1)");
  const clip = path.join(dir, 'one.mp4');
  cp.execFileSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'color=c=blue:s=64x64:r=24', '-t', '0.25', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', clip]);
  t.mock.method(config, 'loadConfig', () => ({ storage: { local_path: dir } }));
  const job = merge.create(db, log, { drama_id: 1, episode_id: 1, scenes: scenes || [{ scene_id: 1, video_url: 'one.mp4', duration: 0.25 }], merge_options: mergeOptions });
  t.after(() => { db.close(); fs.rmSync(dir, { recursive: true, force: true }); });
  return { db, dir, job };
}

function assertFailed(db, job) {
  const row = merge.getById(db, job.merge_id);
  assert.equal(row.status, 'failed');
  assert.ok(row.error_msg, 'failure must carry an API-visible reason');
  assert.equal(row.merged_url, null, 'failure must not publish a partial or fallback clip');
  const episode = db.prepare('SELECT status,video_url FROM episodes WHERE id=1').get();
  assert.equal(episode.status, 'failed');
  assert.equal(episode.video_url, null);
  const task = db.prepare('SELECT status,error FROM async_tasks WHERE id=?').get(job.task_id);
  assert.equal(task.status, 'failed');
  assert.ok(task.error);
}

test('merge refuses partial output when one required clip is missing', async t => {
  const { db, job } = setup(t, [{ scene_id: 1, video_url: 'one.mp4', duration: .25 }, { scene_id: 2, video_url: 'missing.mp4', duration: .25 }]);
  await merge.processVideoMerge(db, log, job.merge_id, '/static');
  assertFailed(db, job);
});

test('merge fails when FFmpeg is unavailable instead of falling back to the first clip', async t => {
  const { db, job } = setup(t);
  t.mock.method(cp, 'spawnSync', () => ({ status: 1, stderr: 'unavailable' }));
  await merge.processVideoMerge(db, log, job.merge_id, '/static');
  assertFailed(db, job);
});

test('requested postprocessing failure makes the merge and task fail', async t => {
  const { db, job } = setup(t, null, { watermark_text: 'AI生成' });
  t.mock.method(post, 'runMergedEpisodePostProcess', async () => ({ ok: false, error: 'fixture filter failure' }));
  await merge.processVideoMerge(db, log, job.merge_id, '/static');
  assertFailed(db, job);
  assert.match(merge.getById(db, job.merge_id).error_msg, /fixture filter failure/);
});

test('a claimed postprocessed output must exist before publishing success', async t => {
  const { db, job } = setup(t, null, { watermark_text: 'AI生成' });
  t.mock.method(post, 'runMergedEpisodePostProcess', async () => ({ ok: true, relativePath: 'does-not-exist.mp4' }));
  await merge.processVideoMerge(db, log, job.merge_id, '/static');
  assertFailed(db, job);
});

test('postprocessing exceptions also persist an explicit failed state', async t => {
  const { db, job } = setup(t, null, { watermark_text: 'AI生成' });
  t.mock.method(post, 'runMergedEpisodePostProcess', async () => { throw new Error('fixture crash'); });
  await merge.processVideoMerge(db, log, job.merge_id, '/static');
  assertFailed(db, job);
});

test('a real complete concat still succeeds and publishes its own output', async t => {
  const { db, dir, job } = setup(t);
  await merge.processVideoMerge(db, log, job.merge_id, '/static');
  const row = merge.getById(db, job.merge_id);
  assert.equal(row.status, 'completed');
  assert.notEqual(row.merged_url, 'one.mp4');
  assert.ok(fs.statSync(path.join(dir, row.merged_url)).size > 0);
});

test('FFmpeg success with only the first clip is rejected by output duration', async t => {
  const { db, dir, job } = setup(t, [{ scene_id: 1, video_url: 'one.mp4', duration: .25 }, { scene_id: 2, video_url: 'one.mp4', duration: .25 }]);
  const original = cp.spawnSync;
  t.mock.method(cp, 'spawnSync', (command, args, options) => {
    if (args.includes('concat')) {
      fs.copyFileSync(path.join(dir, 'one.mp4'), args[args.length - 1]);
      return { status: 0, stdout: '', stderr: '' };
    }
    return original(command, args, options);
  });
  await merge.processVideoMerge(db, log, job.merge_id, '/static');
  assertFailed(db, job);
});

for (const inside of [false,true]) {
  test(`existing input ${inside ? 'inside' : 'sharing the prefix of'} the download directory is never deleted`, async t => {
    const { db, dir, job } = setup(t);
    const parent=path.join(os.tmpdir(),'drama-video-merge');fs.mkdirSync(parent,{recursive:true});
    const owned=fs.mkdtempSync(inside ? path.join(parent,'existing-source-') : parent+'-backup-');
    t.after(()=>fs.rmSync(owned,{recursive:true,force:true}));
    const input=path.join(owned,'source.mp4');fs.copyFileSync(path.join(dir,'one.mp4'),input);
    db.prepare('UPDATE video_merges SET scenes=? WHERE id=?').run(JSON.stringify([{scene_id:1,video_url:input,duration:.25}]),job.merge_id);
    await merge.processVideoMerge(db,log,job.merge_id,'/static');
    assert.equal(merge.getById(db,job.merge_id).status,'completed');
    assert.ok(fs.existsSync(input),'cleanup must preserve an existing input file');
  });
}
