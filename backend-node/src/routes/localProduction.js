const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const multer = require('multer');
const response = require('../response');
const service = require('../services/localProductionService');

module.exports = function localProduction(db, cfg, log) {
  service.ensureTables(db);
  const r = express.Router();
  const tmp = path.resolve(path.dirname(cfg.database.path), 'import-tmp');
  fs.mkdirSync(tmp, { recursive: true });
  const upload = multer({ storage: multer.diskStorage({ destination: tmp, filename: (_req, _file, done) => done(null, randomUUID()) }),
    limits: { fileSize: 300 * 1024 * 1024, files: 1, fields: 12, fieldSize: 80000 } }).single('file');
  r.get('/status', async (_req, res) => {
    try { response.success(res, await service.getStatus(db)); }
    catch (err) { log.error('local production status', { error: err.message }); response.internalError(res, '读取本地制作状态失败'); }
  });
  r.post('/import', (req, res) => {
    const origin = req.get('origin');
    if (origin && !(cfg.server?.cors_origins || []).includes(origin)) return response.forbidden(res, '仅允许本机制作页面导入');
    upload(req, res, async (err) => {
      if (err) return response.badRequest(res, err.code === 'LIMIT_FILE_SIZE' ? '素材不能超过 300MB' : '素材上传失败');
      try {
        const result = await service.importMedia(db, cfg, req.file, req.body);
        if (result.duplicate) response.success(res, result);
        else response.created(res, result);
      }
      catch (error) { log.warn('local media import rejected', { error: error.message }); response.badRequest(res, '导入失败：请检查目标、文件类型和媒体完整性'); }
      finally { if (req.file?.path) fs.rmSync(req.file.path, { force: true }); }
    });
  });
  return r;
};
