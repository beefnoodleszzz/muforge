const path = require('path');
const fs = require('fs');
const { getFfmpegPath, getFfprobePath, hasLocalFfmpeg } = require('../utils/ffmpegPath');
const storageLayout = require('./storageLayout');

function list(db, query) {
  let sql = 'FROM video_merges WHERE deleted_at IS NULL';
  const params = [];
  if (query.episode_id) {
    sql += ' AND episode_id = ?';
    params.push(query.episode_id);
  }
  if (query.drama_id) {
    sql += ' AND drama_id = ?';
    params.push(query.drama_id);
  }
  const rows = db.prepare('SELECT * ' + sql + ' ORDER BY created_at DESC').all(...params);
  return rows.map(rowToItem);
}

function rowToItem(r) {
  return {
    id: r.id,
    episode_id: r.episode_id,
    drama_id: r.drama_id,
    title: r.title,
    provider: r.provider,
    status: r.status,
    merged_url: r.merged_url,
    duration: r.duration ?? undefined,
    task_id: r.task_id,
    error_msg: r.error_msg ?? undefined,
    created_at: r.created_at,
    completed_at: r.completed_at,
  };
}

function getById(db, id) {
  const r = db.prepare('SELECT * FROM video_merges WHERE id = ? AND deleted_at IS NULL').get(Number(id));
  return r ? rowToItem(r) : null;
}

function create(db, log, req) {
  const now = new Date().toISOString();
  const taskService = require('./taskService');
  const task = taskService.createTask(db, log, 'video_merge', String(req.episode_id || ''));
  const mergeOptionsJson = (() => {
    const o = req.merge_options;
    if (o && typeof o === 'object') return JSON.stringify(o);
    return '{}';
  })();
  const info = db.prepare(
    `INSERT INTO video_merges (episode_id, drama_id, title, provider, model, status, scenes, merge_options, task_id, created_at)
     VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)`
  ).run(
    Number(req.episode_id) || 0,
    Number(req.drama_id) || 0,
    req.title ?? null,
    req.provider || 'ffmpeg',
    req.model ?? null,
    req.scenes ? JSON.stringify(req.scenes) : '[]',
    mergeOptionsJson,
    task.id,
    now
  );
  return { merge_id: info.lastInsertRowid, task_id: task.id, ...getById(db, info.lastInsertRowid) };
}

function deleteById(db, log, id) {
  const now = new Date().toISOString();
  const result = db.prepare('UPDATE video_merges SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL').run(now, Number(id));
  return result.changes > 0;
}

/** 获取 storage 根目录（绝对路径） */
function getStorageRoot() {
  const loadConfig = require('../config').loadConfig;
  const cfg = loadConfig();
  const p = cfg.storage?.local_path || './data/storage';
  return path.isAbsolute(p) ? p : path.join(process.cwd(), p);
}

/** 将 video_url 解析为本地文件路径，或下载到 temp 返回路径 */
async function resolveVideoToLocalPath(videoUrl, baseUrl, storageRoot, tempDir, index, log) {
  if (!videoUrl || typeof videoUrl !== 'string') return null;
  const u = videoUrl.trim();
  // 1) URL 以 baseUrl 开头（如 http://localhost:5679/static）-> 对应 storageRoot 下相对路径
  if (baseUrl && (u.startsWith(baseUrl) || u.startsWith(baseUrl.replace(/\/$/, '')))) {
    const base = baseUrl.replace(/\/$/, '');
    const rel = u.startsWith(base + '/') ? u.slice(base.length + 1) : u.slice(base.length).replace(/^\//, '');
    if (rel && !rel.startsWith('http')) {
      const localPath = path.join(storageRoot, rel.replace(/\//g, path.sep));
      if (fs.existsSync(localPath)) {
        log.info('Video merge: using local static file', { index, path: localPath });
        return localPath;
      }
    }
  }
  // 2) 已是本地绝对路径且存在
  if (path.isAbsolute(u) && fs.existsSync(u)) {
    log.info('Video merge: using absolute path', { index, path: u });
    return u;
  }
  // 3) 相对路径（相对 storageRoot）
  if (!u.startsWith('http://') && !u.startsWith('https://')) {
    const localPath = path.join(storageRoot, u.replace(/^\//, '').replace(/\//g, path.sep));
    if (fs.existsSync(localPath)) {
      log.info('Video merge: using relative path', { index, path: localPath });
      return localPath;
    }
  }
  // 4) 远程 URL：下载到 temp
  const ext = u.includes('.mp4') ? '.mp4' : u.includes('.webm') ? '.webm' : '.mp4';
  const destPath = path.join(tempDir, `dl_${Date.now()}_${index}${ext}`);
  try {
    const res = await fetch(u, { method: 'GET' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(destPath, buf);
    log.info('Video merge: downloaded to temp', { index, dest: destPath });
    return destPath;
  } catch (e) {
    log.warn('Video merge: download failed', { index, url: u, error: e.message });
    return null;
  }
}

/**
 * ffmpeg concat 参数构造：
 * - 默认 `-c copy` 流拷贝：快且无损，但要求各片段编码参数一致；
 * - transcode：重编码兜底。AI 分镜片段常出现编码/分辨率/采样率不一致，
 *   流拷贝 concat 会直接失败，整集退化成只有首段（issue #21 / #14）。
 */
function buildConcatArgs(listFile, outputPath, transcode = false) {
  if (!transcode) {
    return ['-f', 'concat', '-safe', '0', '-i', listFile, '-c', 'copy', '-y', outputPath];
  }
  return [
    '-f', 'concat', '-safe', '0', '-i', listFile,
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-ar', '44100', '-ac', '2',
    '-movflags', '+faststart',
    '-y', outputPath,
  ];
}

function runFfmpegConcatOnce(listFile, outputPath, transcode, log) {
  const ffmpegBin = getFfmpegPath();
  const { spawnSync } = require('child_process');
  const result = spawnSync(ffmpegBin, buildConcatArgs(listFile, outputPath, transcode), {
    encoding: 'utf8',
    maxBuffer: 4 * 1024 * 1024,
  });
  if (result.error) {
    log.warn('Video merge: ffmpeg spawn error', { error: result.error.message, transcode: !!transcode });
    return false;
  }
  if (result.status !== 0) {
    log.warn('Video merge: ffmpeg failed', {
      transcode: !!transcode,
      stderr: result.stderr?.slice(-500),
    });
    return false;
  }
  return true;
}

/** 使用 ffmpeg concat 合并多个视频文件：先流拷贝，失败再重编码兜底 */
function runFfmpegConcat(localPaths, outputPath, log) {
  const listFile = path.join(path.dirname(outputPath), `concat_list_${Date.now()}.txt`);
  try {
    const lines = localPaths.map((p) => {
      const normalized = p.replace(/\\/g, '/');
      return `file '${normalized.replace(/'/g, "'\\''")}'`;
    });
    fs.writeFileSync(listFile, lines.join('\n'), 'utf8');
    if (runFfmpegConcatOnce(listFile, outputPath, false, log)) return true;
    log.warn('Video merge: stream copy concat failed, retrying with re-encode', {
      clip_count: localPaths.length,
    });
    return runFfmpegConcatOnce(listFile, outputPath, true, log);
  } finally {
    try { if (fs.existsSync(listFile)) fs.unlinkSync(listFile); } catch (_) {}
  }
}

/** Probe the actual artifact instead of treating an exit code or input URL as a movie. */
function probeVideoDuration(file) {
  if (!fs.existsSync(file) || fs.statSync(file).size === 0) throw new Error('合成输出文件不存在或为空');
  const { spawnSync } = require('child_process');
  const result = spawnSync(getFfprobePath(), [
    '-v', 'error', '-show_entries', 'format=duration:stream=codec_type', '-of', 'json', file,
  ], { encoding: 'utf8', timeout: 15000, maxBuffer: 1024 * 1024 });
  if (result.error || result.status !== 0) throw new Error('无法验证视频输出');
  const meta = JSON.parse(result.stdout);
  const duration = Number(meta.format?.duration);
  if (!(duration > 0) || !Number.isFinite(duration) || !meta.streams?.some(x => x.codec_type === 'video')) {
    throw new Error('输出缺少有效视频轨道或时长');
  }
  return duration;
}

/** All requested clips and postprocessing must succeed. There is no implicit degradation. */
async function processVideoMerge(db, log, mergeId, baseUrl) {
  const r = db.prepare('SELECT * FROM video_merges WHERE id = ? AND deleted_at IS NULL').get(mergeId);
  if (!r) return;
  const taskService = require('./taskService');
  const episodeId = r.episode_id;
  const toCleanup = [];
  let outputPath = null;
  let postOutputPath = null;
  db.prepare('UPDATE video_merges SET status = ? WHERE id = ?').run('processing', mergeId);
  try {
    const scenes = JSON.parse(r.scenes || '[]');
    if (!Array.isArray(scenes) || scenes.length === 0 || scenes.length > 100) {
      throw new Error('视频片段数量必须为1到100');
    }
    if (!hasLocalFfmpeg()) throw new Error('FFmpeg不可用，不能合成');
    const storageRoot = getStorageRoot();
    const tempDir = path.join(require('os').tmpdir(), 'drama-video-merge');
    fs.mkdirSync(tempDir, { recursive: true });
    const localPaths = [];
    for (let i = 0; i < scenes.length; i++) {
      const local = await resolveVideoToLocalPath(scenes[i].video_url, baseUrl, storageRoot, tempDir, i, log);
      if (!local) throw new Error(`第${i + 1}个镜头视频不可用，禁止缺镜合成`);
      localPaths.push(local);
      if (local.startsWith(tempDir)) toCleanup.push(local);
    }
    const expectedDuration = localPaths.reduce((sum, file) => sum + probeVideoDuration(file), 0);
    const tolerance = Math.max(0.1, expectedDuration * 0.01);
    const projectSubdir = storageLayout.getProjectStorageSubdir(db, r.drama_id);
    const sub = projectSubdir && String(projectSubdir).trim();
    const mergedDir = sub ? path.join(storageRoot, sub, 'videos', 'merged') : path.join(storageRoot, 'videos', 'merged');
    fs.mkdirSync(mergedDir, { recursive: true });
    const outputFileName = `merged_${mergeId}_${Date.now()}.mp4`;
    outputPath = path.join(mergedDir, outputFileName);
    if (!runFfmpegConcat(localPaths, outputPath, log)) throw new Error('FFmpeg合成失败，禁止首片段兜底');
    let duration = probeVideoDuration(outputPath);
    if (Math.abs(duration - expectedDuration) > tolerance) throw new Error('合成输出时长不完整，禁止发布部分镜头');
    let relativePath = path.relative(storageRoot, outputPath).replace(/\\/g, '/');
    const mergeOpts = JSON.parse(r.merge_options || '{}');
    const postNeed = !!mergeOpts.burn_narration_subtitles || !!mergeOpts.burn_dialogue_audio
      || !!(mergeOpts.watermark_text && String(mergeOpts.watermark_text).trim());
    if (postNeed) {
      const post = await require('./mergedEpisodePostProcess').runMergedEpisodePostProcess(db, log, {
        mergedAbsPath: outputPath, storageRoot, scenes, episodeId, mergeOpts,
      });
      if (!post?.ok || !post.relativePath) throw new Error('合成后处理失败：' + (post?.error || '未返回成片'));
      const candidate = path.resolve(storageRoot, post.relativePath);
      if (!candidate.startsWith(path.resolve(storageRoot) + path.sep)
          || candidate === outputPath || localPaths.some(file => path.resolve(file) === candidate)) {
        throw new Error('后处理必须返回独立且位于存储目录的成片');
      }
      postOutputPath = candidate;
      duration = probeVideoDuration(postOutputPath);
      if (Math.abs(duration - expectedDuration) > tolerance) throw new Error('后处理成片时长不完整');
      relativePath = post.relativePath;
    }
    const now = new Date().toISOString();
    db.transaction(() => {
      db.prepare('UPDATE video_merges SET status=?, merged_url=?, duration=?, completed_at=?, error_msg=NULL WHERE id=?')
        .run('completed', relativePath, duration, now, mergeId);
      db.prepare('UPDATE episodes SET video_url=?, status=?, updated_at=? WHERE id=?')
        .run(relativePath, 'completed', now, episodeId);
      if (r.task_id) taskService.updateTaskResult(db, r.task_id, { merge_id: mergeId, video_url: relativePath, duration });
    })();
    log.info('Video merge completed', { merge_id: mergeId, episode_id: episodeId });
  } catch (error) {
    const message = '视频合成失败：' + (error.message || '未知错误');
    const now = new Date().toISOString();
    db.transaction(() => {
      db.prepare('UPDATE video_merges SET status=?, merged_url=NULL, duration=NULL, error_msg=?, completed_at=? WHERE id=?')
        .run('failed', message, now, mergeId);
      db.prepare('UPDATE episodes SET video_url=NULL, status=?, updated_at=? WHERE id=?').run('failed', now, episodeId);
      if (r.task_id) taskService.updateTaskError(db, r.task_id, message);
    })();
    for (const file of [outputPath].filter(Boolean)) {
      try { if (fs.existsSync(file)) fs.unlinkSync(file); } catch (_) {}
    }
    log.warn('Video merge failed', { merge_id: mergeId, error: message });
  } finally {
    for (const file of toCleanup) {
      try { if (fs.existsSync(file)) fs.unlinkSync(file); } catch (_) {}
    }
  }
}

module.exports = {
  list,
  getById,
  create,
  deleteById,
  processVideoMerge,
  buildConcatArgs,
  runFfmpegConcat,
};
