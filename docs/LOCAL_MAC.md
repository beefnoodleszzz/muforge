# Mac 本机配置与制作

## 启动和停止

项目目录：`~/Desktop/muforge`。需要 Node.js 22+、npm、FFmpeg；本地配音复用 `~/AI/local-dubbing`，不在本项目复制或重新下载模型。

双击根目录 **启动幕匠.command**，或执行：

```bash
cd ~/Desktop/muforge
node scripts/local.mjs setup   # 首次安装、注册本机 TTS、构建前端；代码更新后重新构建
node scripts/local.mjs start
node scripts/local.mjs status
node scripts/local.mjs stop
```

页面：<http://127.0.0.1:5679/local-production>。项目列表：<http://127.0.0.1:5679/>。

停止也可双击 **停止幕匠.command**。只结束此项目记录且身份核对通过的进程，不停止共享 Qwen 服务，不结束占用端口的其他应用。日志在 `.local/server.log`。代码修改后先停止，运行 setup 重建，再启动；首次安装仅放行 SQLite 所需的原生构建，其他依赖安装脚本默认不执行。

开发热更新：在 `backend-node` 运行 `npm run dev`，在 `frontweb` 运行 `npm run dev`，分别监听本机 5679 和 3013；不要与上述后台启动重复占用 5679。

## 配音

- 服务地址：`http://127.0.0.1:8880/v1`；模型 `qwen3-tts`；厂商选择 `Qwen3-TTS（本机 Mac）`，API Key 留空。
- setup 在没有现存有效本地配置时注册一条配置；保留用户已有配置，不覆盖其他默认服务。
- 默认试听声线 `audition_01`，可选 `audition_02` 或已登记的声音 ID。带 `private` 的历史声线仅保留私人试听用途。
- 本机制作页可输入台词生成试听；分镜页的配音操作使用默认 TTS 配置。
- 输出保存为实际 WAV，48 kHz 单声道；本机合成逐条排队，最长等待 10 分钟，不自动重试推理。Qwen 当前不支持 speed 变速，使用 1.0。
- 声线设计、登记与模型维护继续使用 `~/AI/local-dubbing` 的既有工具。本项目不修改模型或默认声线。

如配音未就绪：

```bash
cd ~/AI/local-dubbing
./service.sh status
./service.sh start
```

## 图片与视频

这些工具由 Codex 会话调用，本 Web 服务不伪装成内置 image_gen 或可灵 MCP 客户端，也不复制 OAuth 凭据。

1. 与 Codex 确定剧本、角色、场景、道具和分镜。
2. 生图前使用 `gpt-image-2-style-library`，读取 `references/style-library.md` 选择模板，再调用内置 `image_gen`。保留最终提示词和模板名；不要把工具名称当成已核验的模型版本。
3. 图片生成后通过“本机制作 → 导入生成素材”绑定到角色、场景、道具或分镜。支持 PNG、JPEG、WebP；会检测实际图像内容。
4. 视频由 Codex 调用可灵官方 MCP，提交前按当次模型规格与预算执行。可灵 4.0 全能参考按秒计费，输入参考视频时长也计费。下载选中结果后导入 MP4/MOV，只绑定分镜。
5. 每次导入新增独立文件和生成记录，并更新目标当前素材；旧 Take 保留。记录实际工具、提示词、风格模板、实际模型、任务 ID 与 SHA-256。
6. 返回剧集、分镜或画布继续选片、配音与合成。视频导入检测容器和视频轨道，不代表人工画质或剧情连续性已验收。

Codex 也可通过本地接口回填，避免手工重复上传：

```bash
curl -f http://127.0.0.1:5679/api/v1/local-production/import \
  -F 'kind=image' -F 'target_type=character' -F 'target_id=1' \
  -F 'style_template=character-design-sheet' \
  -F 'prompt=实际最终提示词' \
  -F 'file=@/absolute/path/to/character.png'
```

使用本项目实际 ID。`kind` 为 `image` 或 `video`；`target_type` 为 `storyboard`、`character`、`scene`、`prop`，视频仅支持 `storyboard`。单次文件最大 300 MB。接口只接受上传文件，不接受任意本机路径或远程下载地址。

## 数据与 Git

`backend-node/data/` 保存 SQLite、配音、生成图与视频；`.local/` 保存 PID、日志与验收资料。两者不提交。完整备份时停止幕匠后备份这两个目录，避免只拷贝活动中的 SQLite 主文件遗漏 WAL 数据；Qwen 声线与模型另行备份。

代码保留上游历史与 MIT 许可。原仓库作为 `upstream`，新仓库为 `origin`。工程导出沿用上游格式；新增导入来源记录保存在本地 SQLite，当前不承诺随上游 ZIP 工程导出。

## 实际验证范围

详见 [本机验收记录](VERIFICATION_MAC.md)。本轮目标是本地 Web 环境，不包含 Electron 安装包、完整短剧制作或付费视频生成。内置自动故事/分镜和聊天助手仍需要另行配置文本 API；Codex 辅助创作无需为这些按钮填入虚构配置。
