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
| 剧本与分镜 | Codex 辅助创作或手工录入；通用 OpenAI 兼容文本接口需另配模型 |
| 图片 | Codex 使用 `gpt-image-2-style-library` 优化提示词，再调用内置 `image_gen` |
| 视频 | Codex 调用可灵官方 MCP，按本次授权的预算生成，下载后导入 |
| 配音 | 本机 Qwen3-TTS，默认地址 `http://127.0.0.1:8880/v1` |
| 资产与成片 | 本地素材回填、列表/画布分镜管理，以及 FFmpeg 合成 |

`image_gen` 与可灵 MCP 由 Codex 会话调用，不是填入 API Key 后即可在页面内直连的服务。本机制作页负责服务检查、配音和产物接收；实际工具、提示词、模板、任务 ID 与素材版本应随制作记录保存。

## 项目结构

```text
muforge/
├── .agents/skills/     项目级导演技能
├── .github/            GitHub 模板与仓库配置
├── backend-node/       Express、SQLite、素材与合成服务
│   ├── configs/config.yaml                  后端配置
│   └── migrations/archive/desktop-initial/  原样保留的7份桌面迁移
├── frontweb/           Vue 3、Vite、Element Plus 界面
├── scripts/            Mac 本地启停与环境准备
├── docs/               当前文档与上游历史资料
├── tasks/              当前配置与验收进度
├── example_drama/      上游示例工程
└── 项目截图/           保留的上游历史素材
```

数据库和私有生产素材保存在 `backend-node/data/`；运行日志在 `.local/`。这些目录已排除出 Git。停止幕匠不会停止共享的 Qwen3-TTS 服务。Electron 运行与打包端已退役，历史迁移原样归档。

## 开发验证

```bash
cd backend-node
node --test test/*.test.js

cd ../frontweb
node --test test/*.test.js
npm run build
```

当前配置与验证进度见 [tasks/todo.md](tasks/todo.md)。MIT 原始版权见 [LICENSE](LICENSE)。

## 瘦身与验证

Electron、Mastra工具型助手、渠道锁和SD2远端认证已退役；已有工程格式、素材库、Take和全部迁移保留。按核心功能保留的6条图片/视频接口仍使用旧客户端兼容实现，尚未重写；本机制作主线使用Codex生成后导入。真实模型/模板/任务信息需要填写并保留制作清单，导入标签本身不是工具实证。

完整删除证据、保留依赖、隔离测试、配音对比和出片质量缺口见 [SLIM_REPORT](docs/SLIM_REPORT.md)。瘦身与后续正确性修复整合到主分支供审核；提交与push按用户当前授权，禁止擅自改写历史；既有上游示例/风格素材及文档引用截图未擅自删除。


## 审核入口

代码与真实生产测试的范围、验证证据及已知制作质量问题见 [审核交接](docs/prod-test/REVIEW_HANDOFF.md)。项目级导演技能原文位于 [.agents/skills/higgsfield-cinema/SKILL.md](.agents/skills/higgsfield-cinema/SKILL.md)；复制技能不代表此前制作已按其核心方法执行。
