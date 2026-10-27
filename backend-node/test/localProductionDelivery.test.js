const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const Database = require('better-sqlite3');
const { runMigrationsAndEnsure } = require('../src/db/migrate');
const { ensureTables, importMedia } = require('../src/services/localProductionService');

function setup(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'muforge-delivery-import-'));
  const db = new Database(':memory:'); runMigrationsAndEnsure(db); ensureTables(db);
  db.exec("INSERT INTO dramas(id,title) VALUES(1,'fixture');INSERT INTO episodes(id,drama_id) VALUES(1,1);INSERT INTO storyboards(id,episode_id,video_url) VALUES(1,1,'/static/shot.mp4')");
  t.after(() => { db.close(); fs.rmSync(dir, { recursive: true, force: true }); });
  return { dir, db, cfg: { storage: { local_path: path.join(dir,'storage'), base_url: '/static' } } };
}
function source(file) { return { path: file, size: fs.statSync(file).size }; }

test('a 48 kHz mono WAV is archived, receipted, and bound as storyboard dialogue audio', async t => {
  const {db,dir,cfg} = setup(t), f = path.join(dir,'voice.wav');
  execFileSync('ffmpeg',['-v','error','-f','lavfi','-i','sine=frequency=440:sample_rate=48000','-t','0.25','-ac','1',f]);
  const input = {kind:'audio',target_type:'storyboard',target_id:1,prompt:'unit-test text',model:'unit-fixture'};
  const one = await importMedia(db,cfg,source(f),input), two = await importMedia(db,cfg,source(f),input);
  assert.equal(one.provider,'qwen_local'); assert.equal(two.import_id,one.import_id);
  assert.equal(db.prepare('SELECT audio_local_path FROM storyboards WHERE id=1').get().audio_local_path,one.local_path);
  assert.equal(db.prepare("SELECT count(*) AS n FROM local_media_imports WHERE kind='audio'").get().n,1);
  assert.equal(db.prepare('SELECT count(*) AS n FROM video_generations').get().n,0);
});

test('a completed movie binds the episode and gets a merge record without replacing any shot', async t => {
  const {db,dir,cfg} = setup(t), f = path.join(dir,'movie.mp4');
  execFileSync('ffmpeg',['-v','error','-f','lavfi','-i','color=c=blue:s=64x64:r=24','-f','lavfi','-i','sine=sample_rate=48000','-t','0.25','-c:v','libx264','-pix_fmt','yuv420p','-c:a','aac','-ac','1',f]);
  const input = {kind:'video',target_type:'episode',target_id:1,prompt:'local assembly',model:'unit-fixture'};
  const one = await importMedia(db,cfg,source(f),input), two = await importMedia(db,cfg,source(f),input);
  assert.equal(one.provider,'ffmpeg'); assert.equal(one.import_id,two.import_id); assert.ok(one.merge_id); assert.equal(one.merge_id,two.merge_id);
  assert.equal(db.prepare('SELECT count(*) AS n FROM video_merges').get().n,1);
  assert.equal(db.prepare('SELECT count(*) AS n FROM video_generations').get().n,0);
  assert.equal(db.prepare('SELECT video_url FROM storyboards WHERE id=1').get().video_url,'/static/shot.mp4');
  const row=db.prepare('SELECT status,video_url FROM episodes WHERE id=1').get();assert.equal(row.status,'completed');assert.equal(row.video_url,one.local_path);
});

test('delivery bindings reject unsupported kind/target combinations', async t => {
  const {db,dir,cfg}=setup(t);const f=path.join(dir,'x.wav');fs.writeFileSync(f,'invalid');
  for(const input of [{kind:'audio',target_type:'character',target_id:1},{kind:'image',target_type:'episode',target_id:1}]) {
    await assert.rejects(importMedia(db,cfg,source(f),input));
  }
  assert.equal(db.prepare('SELECT count(*) AS n FROM local_media_imports').get().n,0);
});

test('audio import rejects a WAV that is not 48 kHz mono',async t=>{
  const {db,dir,cfg}=setup(t);const f=path.join(dir,'bad.wav');
  execFileSync('ffmpeg',['-v','error','-f','lavfi','-i','sine=sample_rate=44100','-t','0.25','-ac','2',f]);
  await assert.rejects(importMedia(db,cfg,source(f),{kind:'audio',target_type:'storyboard',target_id:1}));
});

for (const kind of ['audio', 'video']) test(`delivery rejects truncated ${kind} even when ffprobe can read its header`, async t => {
  const {db,dir,cfg}=setup(t); const file=path.join(dir,kind==='audio'?'cut.wav':'cut.mp4');
  const args=kind==='audio'?['-f','lavfi','-i','sine=sample_rate=48000','-t','1','-ac','1']:['-f','lavfi','-i','testsrc2=s=64x64:r=24','-t','1','-c:v','libx264','-movflags','+faststart'];
  execFileSync('ffmpeg',['-v','error',...args,file]);
  fs.truncateSync(file,fs.statSync(file).size-(kind==='audio'?1:100));
  const meta=JSON.parse(execFileSync('ffprobe',['-v','error','-show_format','-show_streams','-of','json',file]));
  assert.ok(Number(meta.format.duration)>0); assert.ok(meta.streams.length);
  await assert.rejects(importMedia(db,cfg,source(file),{kind,target_type:kind==='audio'?'storyboard':'episode',target_id:1}));
  assert.equal(db.prepare('SELECT count(*) AS n FROM local_media_imports').get().n,0);
});
