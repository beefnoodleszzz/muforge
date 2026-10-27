# 幕匠安全说明 / Security

MuForge 当前主要面向本机 Mac 使用。服务默认只监听 `127.0.0.1`；不应直接向公网开放。

## 报告问题

本项目仓库为 [beefnoodleszzz/muforge](https://github.com/beefnoodleszzz/muforge)。若仓库已启用私密漏洞报告，请通过 GitHub Security 页面提交；不要在公开 Issue 中贴出密钥、私人素材或可被直接利用的敏感细节。当前没有承诺固定的响应时限。

## 数据与外部调用

剧集数据库、素材和日志保存在本机。Qwen3-TTS 使用本地模型；image_gen 与可灵生成会调用外部服务，所选参考素材会按实际工具流程发送给对应服务。因此，“本地存储”不代表生成过程完全离线。

不要把 `backend-node/data/`、`.local/`、密钥或私人配音参考提交到 Git。本机生成服务与共享 Qwen3-TTS 的生命周期分别管理。

上游的原始许可证与历史来源见 [UPSTREAM](docs/UPSTREAM.md)。此文档描述当前使用边界，不代表整个上游代码已经完成安全审计。
