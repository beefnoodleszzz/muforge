# 幕匠快速开始

当前推荐在 Mac 本机运行 MuForge Web 服务；本分支尚未制作安装包。

1. 安装 Node.js 22+，确认 `node --version` 和 `ffmpeg -version` 可用。
2. 双击项目根目录 `启动幕匠.command`；也可运行 `node scripts/local.mjs setup` 后再运行 `node scripts/local.mjs start`。
3. 打开 [本机制作](http://127.0.0.1:5679/local-production)，检查 Qwen3-TTS 与 FFmpeg，生成一条配音试听。
4. 回到 [项目列表](http://127.0.0.1:5679/) 建立剧集和分镜。与 Codex 完成提示词、image_gen 生图和已授权的可灵镜头生成，再导入绑定素材。
5. 运行 `node scripts/local.mjs stop` 或双击 `停止幕匠.command` 停止工作台；共享 Qwen3-TTS 服务继续运行。

具体端口、日志、数据位置和排错见 [Mac 配置与运行](LOCAL_MAC.md)。内置文本助手、云端图片/视频 API 需要独立配置；本机路线不自动启用这些外部服务。

Electron桌面运行/打包代码已退役，7份历史SQL原样归档在backend-node/migrations/archive/desktop-initial/；上游发行版与历史资料见 [UPSTREAM](UPSTREAM.md)。
