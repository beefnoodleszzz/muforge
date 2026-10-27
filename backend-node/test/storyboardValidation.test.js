const { test } = require('node:test');
const assert = require('node:assert/strict');
const Database = require('better-sqlite3');
const { runMigrationsAndEnsure } = require('../src/db/migrate');
const service = require('../src/services/storyboardService');
const makeRoutes = require('../src/routes/storyboards');
const log = { info() {}, warn() {}, error() {} };

function setup(t) {
  const db = new Database(':memory:');
  runMigrationsAndEnsure(db);
  db.exec(`INSERT INTO dramas(id,title) VALUES(1,'one'),(2,'two');
    INSERT INTO episodes(id,drama_id) VALUES(1,1);
    INSERT INTO characters(id,drama_id,name) VALUES(1,1,'own'),(2,2,'foreign'),(3,1,'deleted');
    UPDATE characters SET deleted_at='deleted' WHERE id=3;
    INSERT INTO character_libraries(id,drama_id,name) VALUES(11,1,'own'),(12,2,'foreign');
    INSERT INTO storyboards(id,episode_id,title,duration,characters) VALUES(1,1,'unchanged',6,'[1]');
    INSERT INTO storyboard_characters(storyboard_id,character_id) VALUES(1,11);`);
  t.after(() => db.close());
  return db;
}
const invalid = error => error.statusCode === 400;

for (const value of [0, -1, 121, NaN, Infinity, null, true, 'bad']) {
  test(`duration rejects ${String(value)} without changing the storyboard`, t => {
    const db = setup(t);
    assert.throws(() => service.updateStoryboard(db, log, 1, { duration: value, title: 'bad' }), invalid);
    assert.deepEqual(db.prepare('SELECT title,duration FROM storyboards WHERE id=1').get(), { title: 'unchanged', duration: 6 });
  });
}

for (const value of [1, 6, 120, '6']) {
  test(`duration accepts a finite in-range value ${value}`, t => {
    const db = setup(t);
    const row = service.updateStoryboard(db, log, 1, { duration: value });
    assert.equal(Number(row.duration), Number(value));
  });
}

for (const [label, characters] of [
  ['foreign drama', [2]], ['unknown', [999]], ['deleted', [3]],
  ['malformed id', ['bad']], ['malformed JSON', 'not-json'], ['non-array', { id: 1 }],
]) {
  test(`character update rejects ${label} and preserves all prior links`, t => {
    const db = setup(t);
    assert.throws(() => service.updateStoryboard(db, log, 1, { characters, title: 'bad' }), invalid);
    assert.equal(db.prepare('SELECT title FROM storyboards WHERE id=1').get().title, 'unchanged');
    assert.deepEqual(db.prepare('SELECT character_id FROM storyboard_characters WHERE storyboard_id=1').all(), [{ character_id: 11 }]);
  });
}

test('valid owned roles preserve name-to-library links and saved frame prompts', t => {
  const db = setup(t);
  db.exec("INSERT INTO frame_prompts(storyboard_id,frame_type,prompt) VALUES(1,'storyboard_first','keep prompt')");
  const row = service.updateStoryboard(db, log, 1, { character_ids: [1], duration: 6 });
  assert.deepEqual(row.characters, [1]);
  assert.deepEqual(db.prepare('SELECT character_id FROM storyboard_characters WHERE storyboard_id=1').all(), [{ character_id: 11 }]);
  assert.equal(db.prepare('SELECT prompt FROM frame_prompts WHERE storyboard_id=1').get().prompt, 'keep prompt');
});

test('invalid input is returned to the API as a client error, not success or HTTP 500', t => {
  const db = setup(t);
  const res = { code: 200, body: null, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
  makeRoutes(db, log, {}).update({ params: { id: '1' }, body: { duration: 121 } }, res);
  assert.equal(res.code, 400);
  assert.equal(res.body.success, false);
});
