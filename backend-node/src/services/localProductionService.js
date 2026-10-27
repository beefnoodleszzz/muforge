const fs = require('node:fs');
const path = require('node:path');
const { randomUUID, createHash } = require('node:crypto');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const { getFfmpegPath, getFfprobePath, hasLocalFfmpeg } = require('../utils/ffmpegPath');
const runFile = promisify(execFile);
const targets = { storyboard: 'storyboards', character: 'characters', scene: 'scenes', prop: 'props', episode: 'episodes' };

function ensureTables(db) {
  db.exec(`CREATE TABLE IF NOT EXISTS local_media_imports (
    id INTEGER PRIMARY KEY AUTOINCREMENT, target_type TEXT NOT NULL, target_id INTEGER NOT NULL,
    kind TEXT NOT NULL, provider TEXT NOT NULL, local_path TEXT NOT NULL, sha256 TEXT NOT NULL,
    prompt TEXT, style_template TEXT, model TEXT, generation_id TEXT, created_at TEXT NOT NULL, idempotency_key TEXT
  )`);
  if (!db.prepare('PRAGMA table_info(local_media_imports)').all().some(c => c.name === 'idempotency_key')) {
    db.exec('ALTER TABLE local_media_imports ADD COLUMN idempotency_key TEXT');
  }
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_local_media_import_idempotency ON local_media_imports(idempotency_key) WHERE idempotency_key IS NOT NULL');
}

async function getStatus(db) {
  const config = require('./aiConfigService').listConfigs(db, 'tts').find(c => c.is_active && c.is_default);
  let tts = { ready: false, voices: [], message: '未配置本地 Qwen3-TTS' };
  if (config?.provider === 'qwen_local') {
    try {
      await require('./aiConfigService').testConnection({ ...config, service_type: 'tts' });
      const url = new URL('/v1/voices', config.base_url);
      const res = await fetch(url, { signal: AbortSignal.timeout(5000), redirect: 'error' });
      if (!res.ok) throw new Error(`声音列表 HTTP ${res.status}`);
      const body = await res.json();
      if (!Array.isArray(body.voices)) throw new Error('声音列表格式无效');
      tts = { ready: true, voices: body.voices, message: 'Qwen3-TTS 本地服务可用', voice_id: config.voice_id };
    } catch (_) { tts.message = 'Qwen3-TTS 未响应或模型未就绪，请启动本地配音服务'; }
  }
  return {
    tts, ffmpeg: hasLocalFfmpeg(),
    image: { mode: 'codex', tool: 'image_gen', message: '由 Codex 生图，完成后导入绑定素材' },
    video: { mode: 'codex', tool: 'Kling MCP', message: '由 Codex 通过官方 MCP 提交，下载后导入镜头' },
    text: { mode: 'codex', message: '剧本与分镜由 Codex 辅助创作或手工录入；内置文本 API 单独配置' },
  };
}

function getTarget(db, type, id) {
  if (!targets[type] || !Number.isSafeInteger(id) || id <= 0) throw new Error('素材绑定目标无效');
  if (type === 'storyboard') {
    return db.prepare(`SELECT s.*, e.drama_id FROM storyboards s JOIN episodes e ON s.episode_id=e.id
      JOIN dramas d ON d.id=e.drama_id WHERE s.id=? AND s.deleted_at IS NULL AND e.deleted_at IS NULL AND d.deleted_at IS NULL`).get(id);
  }
  return db.prepare(`SELECT t.* FROM ${targets[type]} t JOIN dramas d ON d.id=t.drama_id
    WHERE t.id=? AND t.deleted_at IS NULL AND d.deleted_at IS NULL`).get(id);
}

async function importMedia(db, cfg, file, input) {
  const type = input.target_type;
  const id = Number(input.target_id);
  const kind = input.kind;
  if (!['image', 'video', 'audio'].includes(kind)) throw new Error('kind 仅支持 image、video 或 audio');
  if (kind === 'video' && !['storyboard', 'episode'].includes(type)) throw new Error('视频仅支持分镜或剧集成片');
  if (kind === 'audio' && type !== 'storyboard') throw new Error('配音音频只能绑定分镜');
  if (kind === 'image' && type === 'episode') throw new Error('剧集成片仅接受视频');
  const target = getTarget(db, type, id);
  if (!target) throw new Error('绑定目标不存在或已删除');
  if (!file?.path || !file.size) throw new Error('请选择非空素材文件');
  for (const key of ['prompt', 'style_template', 'model', 'generation_id']) {
    if (input[key] != null && (typeof input[key] !== 'string' || input[key].length > (key === 'prompt' ? 20000 : 500))) {
      throw new Error(`${key} 格式或长度无效`);
    }
  }
  let extension, duration = null;
  if (kind === 'image') {
    const image = require('sharp')(file.path, { failOn: 'error', limitInputPixels: 40000000 });
    const meta = await image.metadata();
    if (!['png', 'jpeg', 'webp'].includes(meta.format) || !meta.width || !meta.height || (meta.pages || 1) > 1) throw new Error('仅支持有效的 PNG/JPEG/WebP 单帧图片');
    await image.stats(); // 完整解码，不能只验证文件头。
    extension = meta.format === 'jpeg' ? 'jpg' : meta.format;
  } else if (kind === 'audio') {
    const { stdout } = await runFile(getFfprobePath(), ['-v', 'error', '-show_entries', 'format=format_name,duration:stream=codec_type,sample_rate,channels', '-of', 'json', file.path], { timeout: 15000, maxBuffer: 1024 * 1024 });
    const meta = JSON.parse(stdout);
    const audio = meta.streams?.find(stream => stream.codec_type === 'audio');
    duration = Number(meta.format?.duration);
    if (!meta.format?.format_name?.includes('wav') || !audio || Number(audio.sample_rate) !== 48000 || audio.channels !== 1 || !(duration > 0)) {
      throw new Error('配音仅接受有效48kHz单声道WAV');
    }
    extension = 'wav';
  } else {
    const { stdout } = await runFile(getFfprobePath(), ['-v', 'error', '-show_entries', 'format=format_name,duration:stream=codec_type', '-of', 'json', file.path], { timeout: 15000, maxBuffer: 1024 * 1024 });
    const meta = JSON.parse(stdout);
    duration = Number(meta.format?.duration);
    if (!meta.format?.format_name?.includes('mp4') || !meta.streams?.some(s => s.codec_type === 'video') || !(duration > 0)) throw new Error('仅支持可解码的 MP4/MOV 视频');
    extension = 'mp4';
  }
  if (kind !== 'image') {
    try {
      await runFile(getFfmpegPath(), ['-v', 'error', '-xerror', '-i', file.path, '-f', 'null', '-'], { timeout: 60000, maxBuffer: 1024 * 1024 });
    } catch (_) { throw new Error('媒体完整解码失败，不能导入损坏或截断的文件'); }
  }
  const root = path.resolve(cfg.storage?.local_path || './data/storage');
  const relative = `external/${target.drama_id}/${kind}_${randomUUID()}.${extension}`;
  const dest = path.join(root, relative);
  const hash = createHash('sha256');
  for await (const chunk of fs.createReadStream(file.path)) hash.update(chunk);
  const sha = hash.digest('hex');
  const url = (cfg.storage?.base_url || '/static').replace(/\/$/, '') + '/' + relative;
  const idempotencyKey = createHash('sha256').update(`${target.drama_id}:${type}:${id}:${kind}:${sha}`).digest('hex');
  const provider = kind === 'image' ? 'image_gen' : kind === 'audio' ? 'qwen_local' : type === 'episode' ? 'ffmpeg' : 'kling_mcp';
  const now = new Date().toISOString();
  let copied = false;
  try {
    return db.transaction(() => {
      // The write lock serializes the lookup and creation across processes as well as requests.
      let existing = db.prepare('SELECT * FROM local_media_imports WHERE idempotency_key=?').get(idempotencyKey);
      if (!existing) existing = db.prepare(`SELECT * FROM local_media_imports
        WHERE idempotency_key IS NULL AND target_type=? AND target_id=? AND kind=? AND sha256=? ORDER BY id LIMIT 1`)
        .get(type, id, kind, sha);
      if (existing) {
        const stored = path.join(root, existing.local_path);
        if (!fs.existsSync(stored) || fs.statSync(stored).size === 0) throw new Error('已有导入素材缺失，不能伪报重复导入成功');
        if (!existing.idempotency_key) db.prepare('UPDATE local_media_imports SET idempotency_key=? WHERE id=?').run(idempotencyKey, existing.id);
        return {
          import_id: existing.id, local_path: existing.local_path,
          url: (cfg.storage?.base_url || '/static').replace(/\/$/, '') + '/' + existing.local_path,
          provider: existing.provider, duration, sha256: existing.sha256,
          idempotency_key: idempotencyKey, duplicate: true,
          ...(type === 'episode' ? { merge_id: db.prepare('SELECT id FROM video_merges WHERE episode_id=? AND merged_url=? ORDER BY id LIMIT 1').get(id, existing.local_path)?.id } : {}),
        };
      }
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(file.path, dest, fs.constants.COPYFILE_EXCL);
      copied = true;
      const receipt = db.prepare(`INSERT INTO local_media_imports
        (target_type,target_id,kind,provider,local_path,sha256,prompt,style_template,model,generation_id,created_at,idempotency_key)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(type,id,kind,provider,relative,sha,input.prompt || '',input.style_template || '',input.model || '',input.generation_id || '',now,idempotencyKey);
      let mergeId;
      if (kind === 'image') {
        const ids = { storyboard: null, character: null, scene: null };
        if (type in ids) ids[type] = id;
        const image = db.prepare(`INSERT INTO image_generations (drama_id,storyboard_id,character_id,scene_id,provider,prompt,model,frame_type,image_url,local_path,status,completed_at,created_at,updated_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,'completed',?,?,?)`).run(target.drama_id,ids.storyboard,ids.character,ids.scene,provider,input.prompt || '',input.model || '',type === 'storyboard' ? 'storyboard_first' : null,url,relative,now,now,now);
        if (type === 'storyboard') {
          require('./storyboardFrameBinding').bindStoryboardFrameImage(db,id,'storyboard_first',Number(image.lastInsertRowid),url,relative);
        } else db.prepare(`UPDATE ${targets[type]} SET image_url=?,local_path=?,updated_at=? WHERE id=?`).run(url,relative,now,id);
      } else if (kind === 'audio') {
        db.prepare('UPDATE storyboards SET audio_local_path=?,updated_at=? WHERE id=?').run(relative,now,id);
      } else if (type === 'episode') {
        const merged = db.prepare(`INSERT INTO video_merges
          (episode_id,drama_id,title,provider,model,status,merged_url,duration,scenes,merge_options,created_at,completed_at)
          VALUES(?,?,?,?,?,'completed',?,?,'[]','{}',?,?)`)
          .run(id,target.drama_id,target.title || '导入成片',provider,input.model || '',relative,duration,now,now);
        mergeId = Number(merged.lastInsertRowid);
        db.prepare('UPDATE episodes SET video_url=?,status=?,updated_at=? WHERE id=?').run(relative,'completed',now,id);
      } else {
        db.prepare(`INSERT INTO video_generations (drama_id,storyboard_id,provider,prompt,model,duration,video_url,local_path,status,completed_at,created_at,updated_at)
          VALUES (?,?,?,?,?,?,?,?,'completed',?,?,?)`).run(target.drama_id,id,provider,input.prompt || '',input.model || '',duration,url,relative,now,now,now);
        db.prepare('UPDATE storyboards SET video_url=?,updated_at=? WHERE id=?').run(url,now,id);
      }
      return { import_id: Number(receipt.lastInsertRowid), local_path: relative, url, provider, duration, sha256: sha, idempotency_key: idempotencyKey, duplicate: false, ...(mergeId ? { merge_id: mergeId } : {}) };
    }).immediate();
  } catch (err) {
    if (copied) fs.unlinkSync(dest);
    throw err;
  }
}

module.exports = { ensureTables, getStatus, importMedia };
