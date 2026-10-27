# AGENTS.md

## MuForge 本机工作约定

- 当前产品名：幕匠 / MuForge；桌面目录 `muforge`。新仓库 `https://github.com/beefnoodleszzz/muforge.git`，上游来源与版权见 `docs/UPSTREAM.md` 和 `LICENSE`。保留上游署名，不把历史案例说成本分支成果。
- 先读 `README.md`、`docs/LOCAL_MAC.md` 与 `tasks/todo.md`。本机生产入口 `node scripts/local.mjs start`，监听 `127.0.0.1:5679`；开发 Vite 监听 `127.0.0.1:3013`。
- 生图由 Codex 调用内置 `image_gen`；提示词先用已安装的 `gpt-image-2-style-library`，选择模板前读其 `references/style-library.md`。归档最终提示词、模板、实际工具与产物，不自行切换付费图片服务。
- 导演方法使用已安装的 `higgsfield-cinema`，按实际可灵能力转译分镜、角色一致性、表演和空间走位，不照搬 Seedance 参数或保证生成效果。
- 视频由 Codex 通过可灵官方 MCP 调用，先读取 `who_am_i` 的当前规格；提交付费任务必须有当前预算授权。OAuth 凭据留在官方工具中，不复制进本项目。
- 配音复用 `~/AI/local-dubbing` 的 Qwen3-TTS，默认 `http://127.0.0.1:8880/v1`；本项目不重新安装模型或修改默认声音。本轮验收仅使用 `audition_01`，不调用带 private 的声线；共享服务仅只读检测，真实推理按用户明确的次数授权。
- 图片/视频使用 `/api/v1/local-production/import` 回填到已有目标；不要只拷文件不写绑定，不覆盖旧 Take。分镜首帧使用 `bindStoryboardFrameImage`；`storyboards.local_path` 为静帧路径，不能当视频路径。
- `backend-node/data/`、`.local/`、模型、参考音、生成素材和日志留本地，不提交。提交前检查忽略规则与敏感信息；提交、推送和发布按用户当前授权执行。
- 按 `docs/LOCAL_MAC.md` 验证启动、配音、素材和页面。Web 本机运行不能冒充 Electron 安装包或完整短剧已验收。

## 当前结构与验证约定

- 运行结构为 backend-node（Express/SQLite）和 frontweb（Vue/Vite）。Electron、Mastra工具型助手、渠道锁及SD2远端认证已退役；desktop/仅保留原.gitignore，不删除任何既有忽略规则。
- 后端正式迁移仍为migrations/顶层22份SQL；archive/desktop-initial/原样保存7份历史SQL，不递归执行。不得删除旧迁移或操作真实data/.local。
- 保留通用OpenAI兼容文本适配器、列表/画布、资产库、素材导入/绑定、多Take、Qwen配音与FFmpeg。按用户的核心接口保留决定，旧图片/视频客户端和仍被使用的依赖暂保留；不要为了达到预估删除数字拔掉核心调用。
- backend-node执行 `node --test test/*.test.js`；frontweb执行 `node --test test/*.test.js` 与 `npm run build`。仓库未配置lint/typecheck，不宣称执行了不存在的检查。
- 瘦身中真实目录只做测试/构建，前后比较backend-node/data/与.local/的路径、大小、mtime_ns、SHA-256；setup/start/stop/迁移/导入只在独立clone、独立npm ci的/tmp沙箱中进行。
- 运行前检查5679/3013，不能抢占其他实例。原启动器仍有共享Qwen自动启动分支，审计启动必须通过外部guard阻断service.sh；不修改共享服务、模型或默认声线。
- 每批独立提交并完成沙箱测试、构建、启动、health、页面、图片/视频curl导入、旧Take/来源SHA、FFmpeg合成；失败立即回滚该批。普通批次对Qwen仅只读检测；不自动重试真实推理。
- 当前禁止push与历史改写；历史推送授权不能覆盖这条新约束。保留LICENSE和UPSTREAM归因。最终报告、保留范围和既有缺口见docs/SLIM_REPORT.md。
