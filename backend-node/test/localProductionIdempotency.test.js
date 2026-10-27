const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const Database = require('better-sqlite3');
const sharp = require('sharp');
const { runMigrationsAndEnsure } = require('../src/db/migrate');
const service = require('../src/services/localProductionService');

function setup(t, persistent = false) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'muforge-import-idempotency-'));
  const dbPath = persistent ? path.join(dir, 'test.sqlite') : ':memory:';
  const ctx = { db: new Database(dbPath), dir, dbPath, cfg: { storage: { local_path: path.join(dir, 'storage'), base_url: '/static' } } };
  runMigrationsAndEnsure(ctx.db);
  service.ensureTables(ctx.db);
  ctx.db.exec(`INSERT INTO dramas(id,title) VALUES(1,'one'),(2,'two');
    INSERT INTO episodes(id,drama_id) VALUES(1,1),(2,2);
    INSERT INTO storyboards(id,episode_id) VALUES(1,1),(2,1),(3,2);
    INSERT INTO characters(id,drama_id,name) VALUES(1,1,'own');`);
  t.after(() => { ctx.db.close(); fs.rmSync(dir, { recursive: true, force: true }); });
  return ctx;
}
async function image(ctx, name = 'one.png', color = 'blue') {
  const file = path.join(ctx.dir, name);
  await sharp({ create: { width: 16, height: 16, channels: 3, background: color } }).png().toFile(file);
  return { path: file, size: fs.statSync(file).size };
}
function input(id = 1) { return { target_type: 'storyboard', target_id: id, kind: 'image', prompt: 'fixture', model: 'fixture', generation_id: 'unit-test' }; }
function count(db, table) { return db.prepare(`SELECT count(*) AS n FROM ${table}`).get().n; }

test('identical image retry returns the existing receipt without another file or Take', async t => {
  const c = setup(t), file = await image(c);
  const one = await service.importMedia(c.db, c.cfg, file, input());
  const two = await service.importMedia(c.db, c.cfg, file, input());
  assert.equal(two.import_id, one.import_id);
  assert.equal(two.local_path, one.local_path);
  assert.equal(two.duplicate, true);
  assert.ok(one.idempotency_key);
  assert.equal(one.idempotency_key, two.idempotency_key);
  assert.equal(count(c.db, 'local_media_imports'), 1);
  assert.equal(count(c.db, 'image_generations'), 1);
  assert.equal(fs.readdirSync(path.join(c.cfg.storage.local_path, 'external/1')).length, 1);
});

test('idempotency follows bytes rather than the upload filename', async t => {
  const c = setup(t), oneFile = await image(c), other = path.join(c.dir, 'other-name.png');
  fs.copyFileSync(oneFile.path, other);
  const one = await service.importMedia(c.db, c.cfg, oneFile, input());
  const two = await service.importMedia(c.db, c.cfg, { path: other, size: oneFile.size }, input());
  assert.equal(one.import_id, two.import_id);
});

test('new bytes create a new Take; retrying an old Take does not roll back the active selection', async t => {
  const c = setup(t), blue = await image(c), red = await image(c, 'two.png', 'red');
  const one = await service.importMedia(c.db, c.cfg, blue, input());
  const two = await service.importMedia(c.db, c.cfg, red, input());
  assert.notEqual(one.import_id, two.import_id);
  const active = c.db.prepare('SELECT first_frame_image_id,local_path FROM storyboards WHERE id=1').get();
  const retry = await service.importMedia(c.db, c.cfg, blue, input());
  assert.equal(retry.import_id, one.import_id);
  assert.deepEqual(c.db.prepare('SELECT first_frame_image_id,local_path FROM storyboards WHERE id=1').get(), active);
  assert.equal(count(c.db, 'image_generations'), 2);
});

test('the same file bound to different shots, projects or target kinds remains independent', async t => {
  const c = setup(t), file = await image(c), receipts = [];
  for (const id of [1, 2, 3]) receipts.push(await service.importMedia(c.db, c.cfg, file, input(id)));
  receipts.push(await service.importMedia(c.db, c.cfg, file, { ...input(), target_type: 'character' }));
  assert.equal(new Set(receipts.map(r => r.idempotency_key)).size, 4);
  assert.equal(count(c.db, 'local_media_imports'), 4);
});

test('parallel duplicate imports serialize to one receipt and one Take', async t => {
  const c = setup(t), file = await image(c);
  const rows = await Promise.all([service.importMedia(c.db, c.cfg, file, input()), service.importMedia(c.db, c.cfg, file, input())]);
  assert.equal(rows[0].import_id, rows[1].import_id);
  assert.equal(count(c.db, 'local_media_imports'), 1);
});

test('idempotency survives reopening the SQLite database', async t => {
  const c = setup(t, true), file = await image(c);
  const one = await service.importMedia(c.db, c.cfg, file, input());
  c.db.close(); c.db = new Database(c.dbPath); service.ensureTables(c.db);
  const two = await service.importMedia(c.db, c.cfg, file, input());
  assert.equal(two.import_id, one.import_id);
  assert.equal(count(c.db, 'local_media_imports'), 1);
});

test('reimporting the same real video returns its existing video record', async t => {
  const c = setup(t), file = path.join(c.dir, 'clip.mp4');
  execFileSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'color=c=blue:s=64x64:r=24', '-t', '0.25', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', file]);
  const source = { path: file, size: fs.statSync(file).size }, target = { ...input(), kind: 'video' };
  const one = await service.importMedia(c.db, c.cfg, source, target), two = await service.importMedia(c.db, c.cfg, source, target);
  assert.equal(one.import_id, two.import_id);
  assert.equal(count(c.db, 'video_generations'), 1);
});

test('the database itself rejects a second receipt with the same idempotency key', async t => {
  const c = setup(t), file = await image(c);
  await service.importMedia(c.db, c.cfg, file, input());
  assert.throws(() => c.db.prepare(`INSERT INTO local_media_imports
    (target_type,target_id,kind,provider,local_path,sha256,created_at,idempotency_key)
    SELECT target_type,target_id,kind,provider,local_path,sha256,created_at,idempotency_key FROM local_media_imports`).run(), /UNIQUE/);
  assert.equal(count(c.db, 'local_media_imports'), 1);
});

test('upgrading legacy receipts preserves duplicate history and reuses its earliest existing receipt', async t => {
  const c = setup(t), file = await image(c);
  await service.importMedia(c.db, c.cfg, file, input());
  const old = c.db.prepare('SELECT * FROM local_media_imports').get();
  const legacyPath = 'external/1/legacy-copy.png';
  fs.copyFileSync(path.join(c.cfg.storage.local_path, old.local_path), path.join(c.cfg.storage.local_path, legacyPath));
  const img = c.db.prepare('SELECT * FROM image_generations').get();
  delete img.id; img.local_path = legacyPath; img.image_url = '/static/' + legacyPath;
  const columns = Object.keys(img);
  const copy = c.db.prepare(`INSERT INTO image_generations(${columns.join(',')}) VALUES(${columns.map(() => '?').join(',')})`).run(...Object.values(img));
  c.db.prepare('UPDATE storyboards SET first_frame_image_id=?,local_path=? WHERE id=1').run(copy.lastInsertRowid, legacyPath);
  c.db.exec(`DROP TABLE local_media_imports;
    CREATE TABLE local_media_imports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,target_type TEXT NOT NULL,target_id INTEGER NOT NULL,
      kind TEXT NOT NULL,provider TEXT NOT NULL,local_path TEXT NOT NULL,sha256 TEXT NOT NULL,
      prompt TEXT,style_template TEXT,model TEXT,generation_id TEXT,created_at TEXT NOT NULL)`);
  const insert = c.db.prepare(`INSERT INTO local_media_imports(target_type,target_id,kind,provider,local_path,sha256,created_at)
    VALUES(?,?,?,?,?,?,?)`);
  insert.run(old.target_type,old.target_id,old.kind,old.provider,old.local_path,old.sha256,old.created_at);
  insert.run(old.target_type,old.target_id,old.kind,old.provider,legacyPath,old.sha256,old.created_at);
  service.ensureTables(c.db);
  const duplicate = await service.importMedia(c.db, c.cfg, file, input());
  assert.equal(duplicate.import_id, 1);
  assert.equal(duplicate.duplicate, true);
  assert.equal(count(c.db, 'local_media_imports'), 2);
  assert.equal(count(c.db, 'image_generations'), 2);
  assert.equal(c.db.prepare('SELECT local_path FROM storyboards WHERE id=1').get().local_path, legacyPath);
  assert.ok(fs.existsSync(path.join(c.cfg.storage.local_path, legacyPath)));
});
