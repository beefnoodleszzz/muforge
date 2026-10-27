# 上游来源与改名记录

MuForge（幕匠）基于 [xuanyustudio/LocalMiniDrama](https://github.com/xuanyustudio/LocalMiniDrama) 二次开发。

- 上游基准提交：`caea265`。
- 上游包版本：`1.2.9`，本次改名不虚构新的发布版本。
- 原始版权：`Copyright (c) 2026 xuanyustudio`，完整 MIT 许可证保留在根目录 [LICENSE](../LICENSE)。
- 当前产品名称：幕匠 / MuForge；包名前缀 `muforge`；Electron app ID 为 `com.muforge.desktop`。
- 当前仓库：[beefnoodleszzz/muforge](https://github.com/beefnoodleszzz/muforge)。原始 Git 历史保留；上游链接用于来源参考。

## 本分支方向

将本机 Mac 作为创作环境，使用本地 Qwen3-TTS 配音，由 Codex 调用 image_gen 与可灵官方 MCP，保存并回填生成素材。当前接入状态以 [Mac 运行文档](LOCAL_MAC.md)、[待办](../tasks/todo.md)及实际运行证据为准。

## 为什么还能看到旧名称

[上游 README 快照](UPSTREAM_README.md)、[CHANGELOG](../CHANGELOG.md)、上游作者故事以及带日期的历史设计文档保留原名，避免把上游历史说成 MuForge 已完成的工作。历史截图、示例和有效的上游源码/资源链接也保留原始出处。`desktop/dist/builder-debug.yml` 是上游历史构建日志，原 Windows 路径保留作历史记录，不用于当前启动。

Electron 使用独立的 `muforge-desktop` 用户数据目录，不自动搬动上游原安装的数据。若已有旧项目，应先从原软件导出工程，再导入 MuForge；未对旧安装做自动迁移或覆盖。

MuForge 名称是本次本地产品命名，尚未做商标、域名或公开仓库名称可用性核查。
