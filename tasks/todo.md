# 当前进度

- [x] Mac 依赖、启动入口、本机监听与首页验证
- [x] Qwen3-TTS 配置、音频格式、声线与实际配音验证
- [x] Codex 生图/可灵视频素材回填、来源记录与页面验证
- [x] MuForge / 幕匠 全面改名；目录改为桌面 muforge，保留上游来源与许可
- [x] 142 项后端测试、20 项前端测试、构建及独立审查；证据见 docs/VERIFICATION_MAC.md

发布交接目标：`https://github.com/beefnoodleszzz/muforge.git` 的 `main` 分支；用户已明确授权提交与推送，最终状态以 Git 记录为准。

当前入口：http://127.0.0.1:5679/local-production 。本轮未提交可灵付费任务、未构建 Electron；内置文本模型未配置。

当前瘦身任务覆盖前述发布交接授权：仅在slim/focus本地分批提交，禁止push和改写历史。Electron/Mastra/渠道/认证单元及依赖的实际处置与质量缺口，以docs/SLIM_REPORT.md为准。
