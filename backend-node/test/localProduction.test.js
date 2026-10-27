const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const Database = require('better-sqlite3');
const sharp = require('sharp');
const { ensureTables, importMedia } = require('../src/services/localProductionService');

function setup(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'muforge-media-'));
  const db = new Database(':memory:');
  db.exec(fs.readFileSync(path.join(__dirname, '../migrations/01_init.sql'), 'utf8'));
  db.exec('ALTER TABLE storyboards ADD COLUMN image_url TEXT; ALTER TABLE storyboards ADD COLUMN local_path TEXT; ALTER TABLE storyboards ADD COLUMN first_frame_image_id INTEGER');
  ensureTables(db);
  db.exec(`INSERT INTO dramas(id,title) VALUES(1,'demo'); INSERT INTO episodes(id,drama_id) VALUES(1,1);
    INSERT INTO storyboards(id,episode_id) VALUES(1,1); INSERT INTO characters(id,drama_id,name) VALUES(1,1,'阿澄')`);
  t.after(() => { db.close(); fs.rmSync(dir, { recursive: true, force: true }); });
  return { db, dir, cfg: { storage: { local_path: path.join(dir,'storage'), base_url: '/static' } } };
}

test('image import validates bytes, binds target, records provenance and preserves previous takes', async t => {
  const { db, dir, cfg } = setup(t);
  const file = path.join(dir, 'anything.txt');
  await sharp({ create: { width: 8, height: 8, channels: 3, background: '#7a9ab0' } }).png().toFile(file);
  const source = { path: file, size: fs.statSync(file).size };
  const input = { target_type: 'character', target_id: '1', kind: 'image', prompt: '角色设定', style_template: 'character-design-sheet' };
  const one = await importMedia(db,cfg,source,input);
  await sharp({ create: { width: 8, height: 8, channels: 3, background: '#aa5522' } }).png().toFile(file);
  const secondSource = { path: file, size: fs.statSync(file).size };
  const two = await importMedia(db,cfg,secondSource,input);
  assert.notEqual(one.local_path,two.local_path);
  assert.notEqual(one.sha256,two.sha256);
  assert.equal(db.prepare('SELECT local_path FROM characters WHERE id=1').get().local_path,two.local_path);
  assert.ok(fs.existsSync(path.join(cfg.storage.local_path,one.local_path)));
  const receipt = db.prepare('SELECT * FROM local_media_imports ORDER BY id DESC LIMIT 1').get();
  assert.equal(receipt.provider,'image_gen');
  assert.equal(receipt.style_template,'character-design-sheet');
  assert.equal(db.prepare('SELECT count(*) AS n FROM image_generations').get().n,2);
  fs.writeFileSync(file,'not a png');
  await assert.rejects(importMedia(db,cfg,source,input));
  assert.equal(db.prepare('SELECT count(*) AS n FROM local_media_imports').get().n,2);
});

test('invalid and deleted targets cannot receive files', async t => {
  const { db,cfg } = setup(t);
  for (const input of [
    {target_type:'storyboards; DROP TABLE dramas',target_id:1,kind:'image'},
    {target_type:'storyboard',target_id:-1,kind:'image'},
    {target_type:'storyboard',target_id:999,kind:'image'},
    {target_type:'character',target_id:1,kind:'video'},
  ]) await assert.rejects(importMedia(db,cfg,{path:'/not-used',size:1},input));
  db.exec("UPDATE dramas SET deleted_at='deleted' WHERE id=1");
  await assert.rejects(importMedia(db,cfg,{path:'/not-used',size:1},{target_type:'storyboard',target_id:1,kind:'image'}));
  assert.equal(fs.existsSync(cfg.storage.local_path),false);
});

test('Kling clip is probed, archived, and visible to normal storyboard/video readers', async t => {
  const { db,dir,cfg }=setup(t);
  const file=path.join(dir,'clip.mp4');
  const image=path.join(dir,'first.png');
  await sharp({create:{width:4,height:4,channels:3,background:'blue'}}).png().toFile(image);
  const still=await importMedia(db,cfg,{path:image,size:fs.statSync(image).size},{target_type:'storyboard',target_id:1,kind:'image'});
  const first=db.prepare('SELECT id,frame_type FROM image_generations WHERE storyboard_id=1').get();
  assert.equal(first.frame_type,'storyboard_first');
  assert.equal(db.prepare('SELECT first_frame_image_id FROM storyboards WHERE id=1').get().first_frame_image_id,first.id);
  execFileSync('ffmpeg',['-v','error','-f','lavfi','-i','color=c=blue:s=64x64:r=24','-t','0.5','-c:v','libx264','-pix_fmt','yuv420p',file]);
  const out=await importMedia(db,cfg,{path:file,size:fs.statSync(file).size},{target_type:'storyboard',target_id:1,kind:'video',generation_id:'local-fixture-only'});
  assert.equal(out.provider,'kling_mcp');
  assert.ok(out.duration>0);
  assert.equal(db.prepare('SELECT video_url FROM storyboards WHERE id=1').get().video_url,out.url);
  assert.equal(db.prepare('SELECT status FROM video_generations').get().status,'completed');
  assert.equal(db.prepare("SELECT generation_id FROM local_media_imports WHERE kind='video'").get().generation_id,'local-fixture-only');
  const mergeService=require('../src/services/videoMergeService');
  let mergeInput;
  t.mock.method(mergeService,'create',(_db,_log,input)=>{ mergeInput=input; return {merge_id:1}; });
  t.mock.method(mergeService,'processVideoMerge',()=>{});
  require('../src/services/dramaService').finalizeEpisode(db,{warn(){}},1,'/static');
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(mergeInput.scenes[0].video_url,out.url);
  assert.equal(db.prepare('SELECT local_path FROM storyboards WHERE id=1').get().local_path,still.local_path);
});

test('truncated image header is rejected before binding any target', async t => {
  const {db,dir,cfg}=setup(t);
  const source=await sharp({create:{width:256,height:256,channels:3,background:'red'}}).png().toBuffer();
  const file=path.join(dir,'broken.png');
  fs.writeFileSync(file,source.subarray(0,64));
  await assert.rejects(importMedia(db,cfg,{path:file,size:64},{target_type:'storyboard',target_id:1,kind:'image'}));
  assert.equal(db.prepare('SELECT count(*) AS n FROM local_media_imports').get().n,0);
});

test('failed database write rolls back receipt and removes only the new copied file', async t => {
  const { db,dir,cfg }=setup(t);
  const file=path.join(dir,'source.png');
  await sharp({create:{width:4,height:4,channels:3,background:'red'}}).png().toFile(file);
  db.exec("CREATE TRIGGER fail_import BEFORE INSERT ON image_generations BEGIN SELECT RAISE(ABORT, 'test failure'); END");
  await assert.rejects(importMedia(db,cfg,{path:file,size:fs.statSync(file).size},{target_type:'storyboard',target_id:1,kind:'image'}));
  assert.equal(db.prepare('SELECT count(*) AS n FROM local_media_imports').get().n,0);
  assert.deepEqual(fs.readdirSync(path.join(cfg.storage.local_path,'external/1')),[]);
  assert.ok(fs.existsSync(file));
});
