#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { spawn, spawnSync } from 'node:child_process'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const backend = path.join(root, 'backend-node')
const frontend = path.join(root, 'frontweb')
const runtime = path.join(root, '.local')
const pidFile = path.join(runtime, 'server.pid')
const serverFile = path.join(backend, 'src/server.js')
const url = 'http://127.0.0.1:5679'
const requireBackend = createRequire(path.join(backend, 'package.json'))
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
fs.mkdirSync(runtime, { recursive: true })

function run(command, args, cwd) {
  const out = spawnSync(command, args, { cwd, stdio: 'inherit' })
  if (out.error || out.status !== 0) throw new Error(`${command} ${args.join(' ')} 执行失败`)
}
async function healthy(endpoint) {
  try { const r = await fetch(endpoint, { signal: AbortSignal.timeout(2000) }); return r.ok && (await r.json()).status === 'ok' }
  catch { return false }
}
function ownedPid() {
  if (!fs.existsSync(pidFile)) return null
  const pid = Number(fs.readFileSync(pidFile, 'utf8').trim())
  if (!Number.isSafeInteger(pid) || pid <= 0) return null
  const processInfo = spawnSync('ps', ['-p', String(pid), '-o', 'command='], { encoding: 'utf8' })
  return processInfo.status === 0 && processInfo.stdout.trim() === `${process.execPath} ${serverFile}` ? pid : null
}
function configure() {
  const originalCwd = process.cwd()
  process.chdir(backend)
  try {
    const { loadConfig } = requireBackend('./src/config/index.js')
    const { getDb, closeDb } = requireBackend('./src/db/index.js')
    const cfg = loadConfig()
    const db = getDb(cfg.database)
    requireBackend('./src/db/migrate.js').runMigrationsAndEnsure(db)
    requireBackend('./src/services/localProductionService.js').ensureTables(db)
    const service = requireBackend('./src/services/aiConfigService.js')
    const existing = service.listConfigs(db, 'tts')
    if (!existing.some(c => c.provider === 'qwen_local' && c.is_active)) {
      service.createConfig(db, { info() {} }, {
        service_type: 'tts', provider: 'qwen_local', name: 'Qwen3-TTS · 本机 Mac',
        base_url: 'http://127.0.0.1:8880/v1', api_key: '', model: ['qwen3-tts'], default_model: 'qwen3-tts',
        is_default: !existing.some(c => c.is_active && c.is_default),
        settings: JSON.stringify({ voice_id: 'audition_01', response_format: 'wav', speed: 1 }),
      })
    }
    closeDb()
  } finally { process.chdir(originalCwd) }
}
async function setup() {
  if (Number(process.versions.node.split('.')[0]) < 22) throw new Error('本机环境需要 Node.js 22 或更高版本')
  for (const folder of [backend, frontend]) {
    if (!fs.existsSync(path.join(folder, 'node_modules'))) run('npm', ['ci', '--ignore-scripts', '--no-audit', '--no-fund'], folder)
  }
  try { new (requireBackend('better-sqlite3'))(':memory:').close() }
  catch { run('npm', ['rebuild', 'better-sqlite3'], backend) }
  requireBackend('sharp')
  configure()
  run('npm', ['run', 'build'], frontend)
  console.log('依赖、Qwen 本地配置与前端构建已就绪。')
}
async function start() {
  if (await healthy(`${url}/health`)) {
    if (!ownedPid()) throw new Error('5679 已有其他服务，请先确认端口占用；不会接管现有进程')
    console.log(`幕匠已运行：${url}/local-production`)
    return
  }
  if (!fs.existsSync(path.join(frontend, 'dist/index.html'))) await setup()
  else configure()
  const dubbing = path.join(os.homedir(), 'AI/local-dubbing/service.sh')
  if (!(await healthy('http://127.0.0.1:8880/health')) && fs.existsSync(dubbing)) run('bash', [dubbing, 'start'], path.dirname(dubbing))
  const fd = fs.openSync(path.join(runtime, 'server.log'), 'a')
  const child = spawn(process.execPath, [serverFile], { cwd: backend, detached: true, stdio: ['ignore', fd, fd],
    env: { ...process.env, NODE_ENV: 'production' } })
  child.on('error', error => console.error(error.message))
  fs.closeSync(fd)
  if (!child.pid) throw new Error('后端进程启动失败')
  fs.writeFileSync(pidFile, String(child.pid))
  child.unref()
  for (let i = 0; i < 40; i++) {
    if (await healthy(`${url}/health`)) {
      if (!ownedPid()) throw new Error('端口由其他进程提供，启动未成功')
      console.log(`幕匠已启动：${url}/local-production`)
      return
    }
    try { process.kill(child.pid, 0) } catch { throw new Error('启动失败，请检查 .local/server.log') }
    await sleep(500)
  }
  throw new Error('启动未就绪，请检查 .local/server.log，不要重复启动')
}
async function stop() {
  const pid = ownedPid()
  if (!pid) { console.log('没有本项目管理的运行进程。'); return }
  process.kill(pid, 'SIGTERM')
  for (let i = 0; i < 30; i++) {
    try { process.kill(pid, 0) } catch { fs.rmSync(pidFile, { force: true }); console.log('幕匠已停止；共享 Qwen 服务继续运行。'); return }
    await sleep(250)
  }
  throw new Error('进程仍在退出，请检查日志；未强制终止')
}
try {
  const action = process.argv[2] || 'start'
  if (action === 'setup') await setup()
  else if (action === 'start') await start()
  else if (action === 'stop') await stop()
  else if (action === 'status') console.log({ managed_pid: ownedPid(), app: await healthy(`${url}/health`), qwen: await healthy('http://127.0.0.1:8880/health'), url: `${url}/local-production` })
  else throw new Error('用法：node scripts/local.mjs setup|start|stop|status')
} catch (error) { console.error(error.message); process.exitCode = 1 }
