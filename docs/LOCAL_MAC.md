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
- 本轮验收固定使用 `audition_01`，不调用带 `private` 的声线；其他制作声线需按用户授权选择。
- 本机制作页可输入台词生成试听；分镜页的配音操作使用默认 TTS 配置。
- 输出保存为实际 WAV，48 kHz 单声道；本机合成逐条排队，最长等待 10 分钟，不自动重试推理。Qwen 当前不支持 speed 变速，使用 1.0。
- 声线设计、登记与模型维护继续使用 `~/AI/local-dubbing` 的既有工具。本项目不修改模型或默认声线。

如配音未就绪，先只读检查 `curl -f http://127.0.0.1:8880/health`；共享服务启停、模型与声线维护由用户通过原有维护流程处理，本轮不调用service.sh。原启动器仍有Qwen未就绪时自动启动的旧分支，隔离验收使用外部guard阻断该分支。

## 图片与视频

这些工具由 Codex 会话调用，本 Web 服务不伪装成内置 image_gen 或可灵 MCP 客户端，也不复制 OAuth 凭据。

1. 与 Codex 确定剧本、角色、场景、道具和分镜。
2. 生图前使用 `gpt-image-2-style-library`，读取 `references/style-library.md` 选择模板，再调用内置 `image_gen`。保留最终提示词和模板名；不要把工具名称当成已核验的模型版本。
3. 图片生成后通过“本机制作 → 导入生成素材”绑定到角色、场景、道具或分镜。支持 PNG、JPEG、WebP；会检测实际图像内容。
4. 视频由 Codex 调用可灵官方 MCP，提交前按当次模型规格与预算执行。模型能力与计费以官方MCP当次who_am_i规格为准；预算应记录输出和参考素材时长。下载选中结果后导入 MP4/MOV，只绑定分镜。
5. 每次导入新增独立文件和生成记录，并更新目标当前素材；旧 Take 保留。SHA-256由服务计算；填写实际提示词、模板、模型与任务ID。provider目前按媒体类型标记，文字元数据可缺省，不能单凭标签证明实际生成工具。
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

详见 [本机验收记录](VERIFICATION_MAC.md)。本轮目标是本地 Web 环境，不包含 Electron 安装包、完整短剧制作或付费视频生成。通用OpenAI兼容文本接口可用于故事/分镜；Mastra聊天助手已移除。Codex辅助创作无需虚构API配置。

## 本轮隔离验收

真实工作树不运行setup/start/stop，不做迁移或注册；仅测试/构建并校验真实data/.local指纹。每批另在/tmp/muforge-sandbox-e*独立clone、npm ci，完成setup、start、status、页面、导入和合成后stop，仅结束该沙箱记录进程。基线及各批沙箱保留，未经用户决定不清理。

最终结果见 [SLIM_REPORT](SLIM_REPORT.md)。基础合成冒烟不代表字幕、混音、选片回退和工程ZIP追溯已经可靠；这些既有缺口只报告，本轮不新增功能。代码保留的核心生成兼容接口不会在验证中调用付费厂商。
