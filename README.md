# 幕匠 · MuForge

面向 Mac 本机的 AI 短剧与漫剧制作工作台。用剧集、角色、场景、道具与分镜组织制作，由 Codex 串联图像生成、可灵视频与本地配音，再把产物归档到项目。

本项目基于 [xuanyustudio/LocalMiniDrama](https://github.com/xuanyustudio/LocalMiniDrama) 二次开发，沿用 MIT 许可证。上游基准为 `caea265`（v1.2.9），来源与历史资料见 [UPSTREAM](docs/UPSTREAM.md)。本项目仓库为 [beefnoodleszzz/muforge](https://github.com/beefnoodleszzz/muforge)。上游链接仅用于来源与历史参考。

## 本机启动

双击项目根目录的 **`启动幕匠.command`**。启动后打开：

- [本机制作](http://127.0.0.1:5679/local-production)：服务状态、配音试听和素材回填。
- [项目列表](http://127.0.0.1:5679/)：剧集、素材与分镜管理。

终端也可运行：

```bash
node scripts/local.mjs setup
node scripts/local.mjs start
node scripts/local.mjs status
node scripts/local.mjs stop
```

首次准备使用 Node.js 22+、npm 锁文件依赖与本机 FFmpeg。后端在 `127.0.0.1:5679` 托管构建前端；开发时 Vue/Vite 使用 `127.0.0.1:3013`。详见 [Mac 配置与运行](docs/LOCAL_MAC.md)。

## 制作链路

| 环节 | 使用方式 |
| --- | --- |
| 剧本与分镜 | Codex 辅助创作或手工录入；内置文本助手需另外配置模型 |
| 图片 | Codex 使用 `gpt-image-2-style-library` 优化提示词，再调用内置 `image_gen` |
| 视频 | Codex 调用可灵官方 MCP，按本次授权的预算生成，下载后导入 |
| 配音 | 本机 Qwen3-TTS，默认地址 `http://127.0.0.1:8880/v1` |
| 资产与成片 | 本地素材回填、列表/画布分镜管理，以及 FFmpeg 合成 |

`image_gen` 与可灵 MCP 由 Codex 会话调用，不是填入 API Key 后即可在页面内直连的服务。本机制作页负责服务检查、配音和产物接收；实际工具、提示词、模板、任务 ID 与素材版本应随制作记录保存。

## 项目结构

```text
muforge/
├── backend-node/       Express、SQLite、素材与合成服务
├── frontweb/           Vue 3、Vite、Element Plus 界面
├── backend-node/migrations/archive/  保留的桌面历史迁移
├── scripts/            Mac 本地启停与环境准备
├── docs/               当前文档与上游历史资料
└── tasks/              当前配置与验收进度
```

数据库和私有生产素材保存在 `backend-node/data/`；运行日志在 `.local/`。这些目录已排除出 Git。停止幕匠不会停止共享的 Qwen3-TTS 服务。Electron 运行与打包端已退役，历史迁移原样归档；desktop/ 仅保留不可删除的忽略规则。

## 开发验证

```bash
cd backend-node
node --test test/*.test.js

cd ../frontweb
node --test test/*.test.js
npm run build
```

当前配置与验证进度见 [tasks/todo.md](tasks/todo.md)。MIT 原始版权见 [LICENSE](LICENSE)。
