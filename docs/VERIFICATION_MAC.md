# MuForge Mac 本机验收

日期：2026-10-27。目录：`~/Desktop/muforge`。上游基准：`caea265`；保留原历史和 MIT 版权。

## 已验证

| 检查 | 结果 |
| --- | --- |
| Mac 环境 | Node.js 22.22.2、npm 10.9.7；SQLite 原生模块与 sharp 可加载，系统 FFmpeg 可运行 |
| 锁文件安装 | 前后端 `npm ci --ignore-scripts`；仅按需重建 better-sqlite3；无新增运行时依赖 |
| 构建 | `cd frontweb && npm run build` 成功；存在上游大 chunk 提示，未改变体积告警阈值 |
| 后端测试 | `cd backend-node && node --test test/*.test.js`：142 项通过，0 失败 |
| 前端测试 | `cd frontweb && node --test test/*.test.js`：20 项通过，0 失败 |
| 差异与脚本 | `git diff --check`、Node 语法和 zsh 启停入口检查通过 |
| 进程启停 | 停止旧路径进程、移动目录、从新路径启动成功；仅监听 127.0.0.1:5679；共享 Qwen 服务未停止 |
| 本地 TTS | 健康检查与声线列表成功；默认配置为 qwen_local、qwen3-tts、audition_01，无 API Key |
| 真实配音 | 浏览器提交试听后生成 4.8 秒、48 kHz 单声道 PCM 24-bit WAV；FFprobe 与 FFmpeg 完整解码通过，浏览器音频 readyState=4 |
| 分镜配音 | `/audio/extract` 从已有分镜读取对白生成，音频路径回写到该分镜 |
| 真实图片 | 内置 image_gen 生成原创阿澄三联角色表；模板 character-design-sheet；图片复制进项目存储，并分别绑定角色与分镜首帧，保留提示词、工具与 SHA-256 |
| 原制作页兼容 | 浏览器进入原剧集/制作页，可读取新项目与分镜；导入的分镜图自然宽度 1672，成功加载 |
| 配置页面 | 可编辑并保存空密钥的本地 Qwen 配置；连接测试实际检查本地 health 与模型状态 |
| 页面布局 | Ego 浏览器实测 1440px 和 393px，无水平溢出；截图人工检查完成，未捕获 Runtime exceptionThrown |

## 独立审查与修复

改名由独立子 agent 完成；另两位只读审查者分别检查本地运行链路与品牌/UI。发现的问题已处理：

1. 原合成逻辑把 `storyboards.local_path` 静帧当视频：增加图→视频→合成选择回归，先复现失败后修复通过。
2. 分镜图导入未绑定首帧：复用现有 `bindStoryboardFrameImage`，更新首帧 ID 与 `storyboard_first` 类型，并验证。
3. 只读图片头无法发现截断 PNG：新增 64 字节截断文件回归；完整解码、格式与像素上限检查后拒绝。
4. 本地 Qwen 的空 API Key 校验提示错误：放行 qwen_local；表单校验失败不再继续提交；修正 TTS 接口预览与连接结果文案。
5. TTS 日志曾输出密钥、WAV 曾保存成 MP3 扩展名：移除敏感日志、保存实际音频格式；新增回归通过。

## 本地证据和边界

`.local/` 保存截图、测试项目 ID、图片生成提示词、回执、服务日志；`backend-node/data/` 保存测试项目、角色图、分镜图和试听音频。这些私有运行数据均排除出 Git。

未提交真实可灵付费生成任务。视频导入与合成路径以临时 FFmpeg 测试片段验证，不能当作可灵生成或完整短剧验收。此前官方 MCP 的只读 OAuth 能力检查成功；本 Web 服务由 Codex 回填素材，不直接持有 MCP 凭据。

未构建 Electron 安装包；未核验完整剧集的口型、音色连续性、表演与剪辑节奏。音频可解码、浏览器可加载不等于人耳已认可表演。内置文本助手尚未配置模型；文本创作由 Codex 或人工完成。
