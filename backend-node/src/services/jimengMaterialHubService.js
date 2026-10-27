'use strict';

// 仅保留已有配置的凭据格式兼容；远端素材库业务已退役。
function normalizeMaterialHubToken(raw) {
  let s = String(raw || '').trim();
  if (/^bearer\s+/i.test(s)) s = s.replace(/^bearer\s+/i, '').trim();
  // 兼容误填为 "token" / 'token' 的场景
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  // 去除不可见空白，避免网关把 header 判定为无效
  s = s.replace(/[\r\n\t\u200b-\u200d\ufeff]/g, '').trim();
  // 全角空格等
  s = s.replace(/\u00a0/g, ' ').trim();
  return s;
}

module.exports = { normalizeMaterialHubToken };
