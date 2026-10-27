# Mac 本地制作环境

目标：在本机运行独立 MuForge，以本地 Qwen3-TTS 配音，由 Codex 调用 image_gen 生图、可灵官方 MCP 出视频并回填素材。保留原有剧集、分镜和后期流程。

## 验收与执行顺序

1. 安装锁文件依赖，限定本机监听，提供启动、停止、状态与双击入口；实际浏览器访问成功。
2. 注册 Qwen3-TTS 本地配置，修复音频格式与日志；接口能生成可解码 WAV，页面能试听并选择声线。
3. 增加本地制作页面：服务状态、工作流说明、图片/视频导入，绑定角色/场景/道具/分镜并记录提示词、模板与来源；回填素材可通过原有页面读取。
4. 跑后端/前端测试、构建和浏览器验收，记录证据与实际边界。

## 接口边界

- `GET /api/v1/local-production/status`：只读检查本地 TTS 与 FFmpeg；image_gen/Kling 标记为 Codex 调用，不伪造直连。
- `POST /api/v1/local-production/import`：multipart 文件，`target_type`、`target_id`、`kind`、`prompt`、`style_template`、`model`、`generation_id`。仅上传字节，不接受任意本地路径或远程 URL；校验目标存在及媒体内容，文件唯一命名，保留历史 Take，不删除旧素材。
- 配音沿用 `/audio/extract`，新增可选 `voice_id`；Qwen 请求为 WAV，串行排队、有限超时、不自动重试推理。
- 本轮不提交付费视频、不更换本地模型、不更改现有广告工作台。用户已追加授权：主/子任务完成后，将目录改为 muforge，并关联 https://github.com/beefnoodleszzz/muforge.git 提交推送。
- 文本创作由 Codex 辅助/手工录入；未配置文本 API 时不声称内置助手已就绪。
