# AGENTS.md

## MuForge 本机工作约定

- 当前产品名：幕匠 / MuForge；桌面目录 `muforge`。新仓库 `https://github.com/beefnoodleszzz/muforge.git`，上游来源与版权见 `docs/UPSTREAM.md` 和 `LICENSE`。保留上游署名，不把历史案例说成本分支成果。
- 先读 `README.md`、`docs/LOCAL_MAC.md` 与 `tasks/todo.md`。本机生产入口 `node scripts/local.mjs start`，监听 `127.0.0.1:5679`；开发 Vite 监听 `127.0.0.1:3013`。
- 生图由 Codex 调用内置 `image_gen`；提示词先用已安装的 `gpt-image-2-style-library`，选择模板前读其 `references/style-library.md`。归档最终提示词、模板、实际工具与产物，不自行切换付费图片服务。
- 导演方法使用已安装的 `higgsfield-cinema`，按实际可灵能力转译分镜、角色一致性、表演和空间走位，不照搬 Seedance 参数或保证生成效果。
- 视频由 Codex 通过可灵官方 MCP 调用，先读取 `who_am_i` 的当前规格；提交付费任务必须有当前预算授权。OAuth 凭据留在官方工具中，不复制进本项目。
- 配音复用 `~/AI/local-dubbing` 的 Qwen3-TTS，默认 `http://127.0.0.1:8880/v1`；本项目不重新安装模型或修改默认声音。原创试听声线为 `audition_01/02`，带 private 的声线只作私人试听。
- 图片/视频使用 `/api/v1/local-production/import` 回填到已有目标；不要只拷文件不写绑定，不覆盖旧 Take。分镜首帧使用 `bindStoryboardFrameImage`；`storyboards.local_path` 为静帧路径，不能当视频路径。
- `backend-node/data/`、`.local/`、模型、参考音、生成素材和日志留本地，不提交。提交前检查忽略规则与敏感信息；提交、推送和发布按用户当前授权执行。
- 按 `docs/LOCAL_MAC.md` 验证启动、配音、素材和页面。Web 本机运行不能冒充 Electron 安装包或完整短剧已验收。

## Cursor Cloud specific instructions

### Project Overview

MuForge (幕匠) — an AI-powered local short drama creation tool. Single product, three sub-projects sharing one repo (no monorepo tooling).

### Services

| Service | Directory | Port | Start Command |
|---------|-----------|------|---------------|
| Backend (Express + SQLite) | `backend-node/` | 5679 | `npm run dev` |
| Frontend (Vite + Vue 3) | `frontweb/` | 3013 | `npm run dev` |

Frontend proxies `/api` and `/static` to backend via Vite config. REST API routes are under `/api/v1/` (e.g. `GET /api/v1/dramas`); health check is `GET /health` on the backend (port 5679).

### Running Tests

```bash
# Backend tests (Node.js built-in test runner)
cd backend-node && node --test test/*.test.js

# Frontend tests (ESM, Node.js built-in test runner)
cd frontweb && node --test test/*.test.js
```

No ESLint or other lint tool is configured in this codebase.

### Building

```bash
cd frontweb && npm run build
```

### Key Development Notes

- Pure JavaScript (no TypeScript) throughout.
- Backend uses `node --watch` for hot reloading in dev mode (`npm run dev`).
- Database is SQLite (embedded via `better-sqlite3`), auto-created in `backend-node/data/`.
- Migrations run automatically on backend startup (`ensureColumns()`); explicit `npm run migrate` only needed for first-time setup or after adding new migration SQL files.
- Config file at `backend-node/configs/config.yaml` already exists in the repo — no need to copy from example.
- AI content generation requires external API keys (configured via the app's "AI 配置" page), but the app fully functions without them for development/testing purposes.
- The backend also serves the built frontend from `frontweb/dist/` at port 5679 when the dist folder exists; during development, use the Vite dev server at port 3013 instead.
- Video merge / tail-frame features require `ffmpeg` on PATH (or in `backend-node/tools/ffmpeg/`); UI and CRUD work without it.
