const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { synthesize } = require('../src/services/ttsService');
const { testConnection } = require('../src/services/aiConfigService');

test('local Qwen speech preserves WAV bytes/extension, voice and no credentials in logs', async (t) => {
  const requests = [];
  const wav = Buffer.from('RIFF0000WAVEfmt test');
  const server = http.createServer(async (req, res) => {
    let body = '';
    for await (const chunk of req) body += chunk;
    requests.push({ url: req.url, body: JSON.parse(body) });
    res.writeHead(200, { 'Content-Type': 'audio/wav' });
    res.end(wav);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => server.close());
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lmd-tts-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const config = { provider: 'qwen_local', base_url: `http://127.0.0.1:${server.address().port}/v1`,
    default_model: 'qwen3-tts', api_key: 'TEST_SECRET_NOT_FOR_LOG', settings: JSON.stringify({ voice_id: 'audition_01', response_format: 'wav' }) };
  const messages = [];
  t.mock.method(console, 'log', (...args) => messages.push(args.join(' ')));
  const out = await synthesize(null, { info() {} }, { text: '本地配音测试', config, storage_base: dir, voice_id: 'audition_02' });
  assert.match(out.local_path, /\.wav$/);
  assert.deepEqual(fs.readFileSync(path.join(dir, out.local_path)), wav);
  assert.equal(requests[0].url, '/v1/audio/speech');
  assert.equal(requests[0].body.response_format, 'wav');
  assert.equal(requests[0].body.voice, 'audition_02');
  assert.ok(!messages.join('\n').includes(config.api_key));
});

test('Qwen connection test requires a real healthy service and never synthesizes speech', async (t) => {
  const seen = [];
  let healthy = true;
  const server = http.createServer((req, res) => {
    seen.push(req.method + ' ' + req.url);
    res.writeHead(healthy ? 200 : 503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(healthy ? { status: 'ok', models: { clone: true } } : { error: 'offline' }));
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => server.close());
  const config = { provider: 'qwen_local', service_type: 'tts', base_url: `http://127.0.0.1:${server.address().port}/v1`, api_key: '' };
  await testConnection(config);
  healthy = false;
  await assert.rejects(testConnection(config));
  assert.deepEqual(seen, ['GET /health', 'GET /health']);
});
