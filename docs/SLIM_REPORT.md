# MuForge 瘦身执行报告

基准：`pre-slim`（79a1f48）；工作分支：`slim/focus`。只做已批准删除、必要的悬空引用清理、锁文件和文档同步；没有新增制作功能。没有push、历史改写或真实用户数据迁移。

## 实际变化

| 指标 | 删除前 | 当前 |
| --- | --- | --- |
| 受版本管理文件 | 401 | 338 |
| 整文件删除 | — | 68份，原始逻辑体积103,534,375字节（98.74MiB）；迁移重命名不算删除 |
| 文本删行 | — | 整文本文件15,597行；保留文件裁剪5,658行（Git删除行，排除SQL归档移动/新增审计报告） |
| API注册 | 162 | 143，减少19；保留原拟删的6条核心接口 |
| 直接依赖声明 | 后端15+前端12+desktop17=44 | 后端10+前端12=22；共减少22项声明，含跨包重复 |
| 后端锁文件packages条目 | 386 | 168；减少218条，保留项版本变化0、新增条目0 |
| SQLite业务表 | 24 | 24；0表/0列删除 |
| 已有迁移 | 后端22+desktop7 | 29份全部保留；7份只归档不执行 |
| Git历史 | 263个原有提交，pack83.72MiB | 原有历史保留；新提交为独立批次，删除工作树不缩小既有历史pack |


以上体积是原文件逻辑字节，不是du占用或Git包体积；不包含用户data/.local、node_modules、未下载LFS正文。完整 `git diff --stat pre-slim..HEAD` 在最终交接时实时取得，本报告不把旧草案的86文件/25接口/23依赖估算写成执行结果。

## 批次与验证

每批都执行真实目录后端/前端测试及前端构建，并前后比对受保护目录文件路径、类型、大小、mtime_ns、SHA-256。沙箱独立clone、独立npm ci和原生SQLite构建；setup/start/status/health、本机制作/列表真实浏览器、两次PNG+一次MP4 curl导入、首帧/视频绑定、旧Take、来源/SHA、FFmpeg合成和完整解码均验证。每批结束只stop该沙箱记录的进程。

| 批次 | 范围 | 提交 | 后端/前端测试数 | 完整验证 |
| --- | --- | --- | --- | --- |
| 1b | 中转凭据配置 | 320ccdea3f77 | 142/20 | 全通过；真实指纹一致；沙箱已停止 |
| 2 | Windows平台与外部工具残留 | aa25896773e9 | 142/20 | 全通过；真实指纹一致；沙箱已停止 |
| 3 | Electron退休与历史迁移归档 | d4227546867d | 142/20 | 全通过；真实指纹一致；沙箱已停止 |
| 4b | Mastra工具型助手功能单元 | 0ec534811e05 | 132/18 | 全通过；真实指纹一致；沙箱已停止 |
| 5 | 渠道锁与远端SD2认证功能单元 | 94436d768f29 | 123/18 | 全通过；真实指纹一致；沙箱已停止 |
| 6 | 零保留调用的七个旧接口 | 25cf75ec0077 | 123/18 | 全通过；真实指纹一致；沙箱已停止 |
| 7 | 已解除引用的依赖与可复现锁文件 | eaaef05c7080 | 123/18 | 全通过；真实指纹一致；沙箱已停止 |
| 8 | 无引用素材死代码与运行文档 | 17a557a5df41 | 123/18 | 全通过；真实指纹一致；沙箱已停止 |


最终干净克隆：9号沙箱完整验证已通过；最终TTS见下表。 后端/前端setup使用README同一入口和锁文件；只在/tmp独立目录操作。Qwen普通批次只有只读health/模型/声线检测，未重复真实推理。测试数减少来自已退役助手/认证测试，核心导入、TTS、合成、画布等测试保留。

失败与回滚记录：第一次配置批次浏览器脚本错把document.title文案当body正文，已恢复11文件、停止沙箱，解释断言后独立重验1b通过；助手batch4启动发现残留createAgentHandlers工厂引用，整批24路径恢复，修正唯一悬空调用后新clone 4b全绿。平台裁剪的外部模板工具曾遗漏HTML void-tag解析配置，未进入验收即恢复候选并修正工具，随后5号完整验证通过。提交前新产生的空白由diff检查去除；没有压制测试或改宽校验。

## 按批次的路径、类别与证据

### 批次1b：中转凭据配置

| 路径 | 类别 | 一句话证据 |
| --- | --- | --- |
| docs/SLIM_BASELINE.md | 归档/审计文档 | 同步结构/验收及安全证据 |
| docs/SLIM_INVENTORY.md | 归档/审计文档 | 同步结构/验收及安全证据 |
| docs/SLIM_PLAN.md | 归档/审计文档 | 同步结构/验收及安全证据 |
| docs/SLIM_REPORT.md | 归档/审计文档 | 同步结构/验收及安全证据 |
| 各大平台中转站配置/302ai-302.json | 整文件删除 | 上游人工中转配置，不被运行配置加载器扫描；唯一链路不使用 |
| 各大平台中转站配置/comfyui配置.md | 整文件删除 | 上游人工中转配置，不被运行配置加载器扫描；唯一链路不使用 |
| 各大平台中转站配置/geeknow.json | 整文件删除 | 上游人工中转配置，不被运行配置加载器扫描；唯一链路不使用 |
| 各大平台中转站配置/n1n.json | 整文件删除 | 上游人工中转配置，不被运行配置加载器扫描；唯一链路不使用 |
| 各大平台中转站配置/stablediffusion webui接口.png | 整文件删除 | 上游人工中转配置，不被运行配置加载器扫描；唯一链路不使用 |
| 各大平台中转站配置/云雾ai.json | 整文件删除 | 上游人工中转配置，不被运行配置加载器扫描；唯一链路不使用 |
| 各大平台中转站配置/使用说明.txt | 整文件删除 | 上游人工中转配置，不被运行配置加载器扫描；唯一链路不使用 |
| 各大平台中转站配置/向量.json | 整文件删除 | 上游人工中转配置，不被运行配置加载器扫描；唯一链路不使用 |
| 各大平台中转站配置/官方即梦2.0配置.png | 整文件删除 | 上游人工中转配置，不被运行配置加载器扫描；唯一链路不使用 |
| 各大平台中转站配置/调用本地反向代理即梦freeapi的配置.png | 整文件删除 | 上游人工中转配置，不被运行配置加载器扫描；唯一链路不使用 |
| 各大平台中转站配置/飞儿api-ffir.cn.json | 整文件删除 | 上游人工中转配置，不被运行配置加载器扫描；唯一链路不使用 |


### 批次2：Windows平台与外部工具残留

| 路径 | 类别 | 一句话证据 |
| --- | --- | --- |
| backend-node/tools/ffmpeg/ffmpeg.exe | 整文件删除 | Windows脚本/PE二进制或未注册OpenClaw残留；Mac已使用系统FFmpeg验证 |
| docs/SLIM_PLAN.md | 裁剪/同步引用 | 同步结构/验收及安全证据 |
| docs/SLIM_REPORT.md | 裁剪/同步引用 | 同步结构/验收及安全证据 |
| openclaw-skill/README.md | 整文件删除 | Windows脚本/PE二进制或未注册OpenClaw残留；Mac已使用系统FFmpeg验证 |
| openclaw-skill/SKILL.md | 整文件删除 | Windows脚本/PE二进制或未注册OpenClaw残留；Mac已使用系统FFmpeg验证 |
| openclaw-skill/skill.json | 整文件删除 | Windows脚本/PE二进制或未注册OpenClaw残留；Mac已使用系统FFmpeg验证 |
| openclaw-skill/tools.json | 整文件删除 | Windows脚本/PE二进制或未注册OpenClaw残留；Mac已使用系统FFmpeg验证 |
| run_dev.bat | 整文件删除 | Windows脚本/PE二进制或未注册OpenClaw残留；Mac已使用系统FFmpeg验证 |
| run_dev.ps1 | 整文件删除 | Windows脚本/PE二进制或未注册OpenClaw残留；Mac已使用系统FFmpeg验证 |


### 批次3：Electron退休与历史迁移归档

| 路径 | 类别 | 一句话证据 |
| --- | --- | --- |
| .github/workflows/release.yml | 整文件删除 | Electron运行/发行已退役；7份SQL字节原样归档且不重复执行 |
| README.md | 裁剪/同步引用 | Electron运行/发行已退役；7份SQL字节原样归档且不重复执行 |
| backend-node/migrations/archive/README.md | 归档/审计文档 | Electron运行/发行已退役；7份SQL字节原样归档且不重复执行 |
| desktop/scripts/initial-migrations/01_init.sql → backend-node/migrations/archive/desktop-initial/01_init.sql | 迁移归档（不删SQL） | Electron运行/发行已退役；7份SQL字节原样归档且不重复执行 |
| desktop/scripts/initial-migrations/02_add_default_model.sql → backend-node/migrations/archive/desktop-initial/02_add_default_model.sql | 迁移归档（不删SQL） | Electron运行/发行已退役；7份SQL字节原样归档且不重复执行 |
| desktop/scripts/initial-migrations/03_add_props_episode_id.sql → backend-node/migrations/archive/desktop-initial/03_add_props_episode_id.sql | 迁移归档（不删SQL） | Electron运行/发行已退役；7份SQL字节原样归档且不重复执行 |
| desktop/scripts/initial-migrations/04_async_tasks_columns.sql → backend-node/migrations/archive/desktop-initial/04_async_tasks_columns.sql | 迁移归档（不删SQL） | Electron运行/发行已退役；7份SQL字节原样归档且不重复执行 |
| desktop/scripts/initial-migrations/05_add_image_generations_columns.sql → backend-node/migrations/archive/desktop-initial/05_add_image_generations_columns.sql | 迁移归档（不删SQL） | Electron运行/发行已退役；7份SQL字节原样归档且不重复执行 |
| desktop/scripts/initial-migrations/06_add_characters_local_path.sql → backend-node/migrations/archive/desktop-initial/06_add_characters_local_path.sql | 迁移归档（不删SQL） | Electron运行/发行已退役；7份SQL字节原样归档且不重复执行 |
| desktop/scripts/initial-migrations/07_add_scenes_image_columns.sql → backend-node/migrations/archive/desktop-initial/07_add_scenes_image_columns.sql | 迁移归档（不删SQL） | Electron运行/发行已退役；7份SQL字节原样归档且不重复执行 |
| backend-node/test/agent-routes.test.js | 裁剪/同步引用 | Electron运行/发行已退役；7份SQL字节原样归档且不重复执行 |
| desktop/.npmrc | 整文件删除 | Electron运行/发行已退役；7份SQL字节原样归档且不重复执行 |
| desktop/README.md | 整文件删除 | Electron运行/发行已退役；7份SQL字节原样归档且不重复执行 |
| desktop/dist-cn.bat | 整文件删除 | Electron运行/发行已退役；7份SQL字节原样归档且不重复执行 |
| desktop/dist-mac.sh | 整文件删除 | Electron运行/发行已退役；7份SQL字节原样归档且不重复执行 |
| desktop/dist/builder-debug.yml | 整文件删除 | Electron运行/发行已退役；7份SQL字节原样归档且不重复执行 |
| desktop/dist/builder-effective-config.yaml | 整文件删除 | Electron运行/发行已退役；7份SQL字节原样归档且不重复执行 |
| desktop/electron-builder-lite.json | 整文件删除 | Electron运行/发行已退役；7份SQL字节原样归档且不重复执行 |
| desktop/electron-builder-mac-lite.json | 整文件删除 | Electron运行/发行已退役；7份SQL字节原样归档且不重复执行 |
| desktop/electron-builder-mac.json | 整文件删除 | Electron运行/发行已退役；7份SQL字节原样归档且不重复执行 |
| desktop/ffmpeg-mac/README.txt | 整文件删除 | Electron运行/发行已退役；7份SQL字节原样归档且不重复执行 |
| desktop/main.js | 整文件删除 | Electron运行/发行已退役；7份SQL字节原样归档且不重复执行 |
| desktop/package-lock.json | 整文件删除 | Electron运行/发行已退役；7份SQL字节原样归档且不重复执行 |
| desktop/package.json | 整文件删除 | Electron运行/发行已退役；7份SQL字节原样归档且不重复执行 |
| desktop/scripts/clean-win-unpacked.js | 整文件删除 | Electron运行/发行已退役；7份SQL字节原样归档且不重复执行 |
| desktop/scripts/copy-backend.js | 整文件删除 | Electron运行/发行已退役；7份SQL字节原样归档且不重复执行 |
| desktop/scripts/copy-front.js | 整文件删除 | Electron运行/发行已退役；7份SQL字节原样归档且不重复执行 |
| desktop/scripts/dist-cn.js | 整文件删除 | Electron运行/发行已退役；7份SQL字节原样归档且不重复执行 |
| docs/SLIM_PLAN.md | 裁剪/同步引用 | 同步结构/验收及安全证据 |
| docs/SLIM_REPORT.md | 裁剪/同步引用 | 同步结构/验收及安全证据 |
| docs/UPSTREAM.md | 裁剪/同步引用 | Electron运行/发行已退役；7份SQL字节原样归档且不重复执行 |


### 批次4b：Mastra工具型助手功能单元

| 路径 | 类别 | 一句话证据 |
| --- | --- | --- |
| backend-node/skills/short-drama/SKILL.md | 整文件删除 | 已决定退役工具型助手，保留源码及本机技能无对应活动消费者 |
| backend-node/src/mastra/context.mjs | 整文件删除 | 已决定退役工具型助手，保留源码及本机技能无对应活动消费者 |
| backend-node/src/mastra/index.mjs | 整文件删除 | 已决定退役工具型助手，保留源码及本机技能无对应活动消费者 |
| backend-node/src/mastra/model.mjs | 整文件删除 | 已决定退役工具型助手，保留源码及本机技能无对应活动消费者 |
| backend-node/src/mastra/skills.mjs | 整文件删除 | 已决定退役工具型助手，保留源码及本机技能无对应活动消费者 |
| backend-node/src/mastra/sse.mjs | 整文件删除 | 已决定退役工具型助手，保留源码及本机技能无对应活动消费者 |
| backend-node/src/mastra/tools.mjs | 整文件删除 | 已决定退役工具型助手，保留源码及本机技能无对应活动消费者 |
| backend-node/src/routes/agent.js | 整文件删除 | 已决定退役工具型助手，保留源码及本机技能无对应活动消费者 |
| backend-node/src/routes/index.js | 裁剪/同步引用 | 已决定退役工具型助手，保留源码及本机技能无对应活动消费者 |
| backend-node/src/server.js | 裁剪/同步引用 | 已决定退役工具型助手，保留源码及本机技能无对应活动消费者 |
| backend-node/test/agent-context.test.js | 整文件删除 | 已决定退役工具型助手，保留源码及本机技能无对应活动消费者 |
| backend-node/test/agent-model-skills.test.js | 整文件删除 | 已决定退役工具型助手，保留源码及本机技能无对应活动消费者 |
| backend-node/test/agent-routes.test.js | 整文件删除 | 已决定退役工具型助手，保留源码及本机技能无对应活动消费者 |
| backend-node/test/agent-tools.test.js | 整文件删除 | 已决定退役工具型助手，保留源码及本机技能无对应活动消费者 |
| backend-node/test/helpers/agentTestDb.js | 整文件删除 | 已决定退役工具型助手，保留源码及本机技能无对应活动消费者 |
| docs/SLIM_PLAN.md | 裁剪/同步引用 | 同步结构/验收及安全证据 |
| docs/SLIM_REPORT.md | 裁剪/同步引用 | 同步结构/验收及安全证据 |
| docs/superpowers/plans/2026-10-16-mastra-agent.md | 整文件删除 | 已决定退役工具型助手，保留源码及本机技能无对应活动消费者 |
| docs/superpowers/specs/2026-10-16-mastra-agent-design.md | 整文件删除 | 已决定退役工具型助手，保留源码及本机技能无对应活动消费者 |
| frontweb/src/App.vue | 裁剪/同步引用 | 已决定退役工具型助手，保留源码及本机技能无对应活动消费者 |
| frontweb/src/api/agent.js | 整文件删除 | 已决定退役工具型助手，保留源码及本机技能无对应活动消费者 |
| frontweb/src/components/AgentDrawer.vue | 整文件删除 | 已决定退役工具型助手，保留源码及本机技能无对应活动消费者 |
| frontweb/src/stores/agentContext.js | 整文件删除 | 已决定退役工具型助手，保留源码及本机技能无对应活动消费者 |
| frontweb/src/utils/agentStream.js | 整文件删除 | 已决定退役工具型助手，保留源码及本机技能无对应活动消费者 |
| frontweb/src/views/DramaCanvas.vue | 裁剪/同步引用 | 已决定退役工具型助手，保留源码及本机技能无对应活动消费者 |
| frontweb/src/views/DramaDetail.vue | 裁剪/同步引用 | 已决定退役工具型助手，保留源码及本机技能无对应活动消费者 |
| frontweb/src/views/FilmCreate.vue | 裁剪/同步引用 | 已决定退役工具型助手，保留源码及本机技能无对应活动消费者 |
| frontweb/test/agentStream.test.js | 整文件删除 | 已决定退役工具型助手，保留源码及本机技能无对应活动消费者 |


### 批次5：渠道锁与远端SD2认证功能单元

| 路径 | 类别 | 一句话证据 |
| --- | --- | --- |
| backend-node/src/app.js | 裁剪/同步引用 | 非核心渠道锁或SD2远端认证单元；历史字段和规范化兼容仍保留 |
| backend-node/src/routes/aiConfig.js | 裁剪/同步引用 | 非核心渠道锁或SD2远端认证单元；历史字段和规范化兼容仍保留 |
| backend-node/src/routes/characters.js | 裁剪/同步引用 | 非核心渠道锁或SD2远端认证单元；历史字段和规范化兼容仍保留 |
| backend-node/src/routes/index.js | 裁剪/同步引用 | 非核心渠道锁或SD2远端认证单元；历史字段和规范化兼容仍保留 |
| backend-node/src/routes/upload.js | 裁剪/同步引用 | 非核心渠道锁或SD2远端认证单元；历史字段和规范化兼容仍保留 |
| backend-node/src/services/aiConfigService.js | 裁剪/同步引用 | 非核心渠道锁或SD2远端认证单元；历史字段和规范化兼容仍保留 |
| backend-node/src/services/characterLibraryService.js | 裁剪/同步引用 | 非核心渠道锁或SD2远端认证单元；历史字段和规范化兼容仍保留 |
| backend-node/src/services/jimengMaterialHubService.js | 裁剪/同步引用 | 非核心渠道锁或SD2远端认证单元；历史字段和规范化兼容仍保留 |
| backend-node/src/services/modelArkAssetConfigService.js | 整文件删除 | 非核心渠道锁或SD2远端认证单元；历史字段和规范化兼容仍保留 |
| backend-node/src/services/modelArkAssetProxyService.js | 整文件删除 | 非核心渠道锁或SD2远端认证单元；历史字段和规范化兼容仍保留 |
| backend-node/test/jimengMaterialHub.test.js | 裁剪/同步引用 | 非核心渠道锁或SD2远端认证单元；历史字段和规范化兼容仍保留 |
| backend-node/test/modelArkAssetConfig.test.js | 整文件删除 | 非核心渠道锁或SD2远端认证单元；历史字段和规范化兼容仍保留 |
| docs/SLIM_PLAN.md | 裁剪/同步引用 | 同步结构/验收及安全证据 |
| docs/SLIM_REPORT.md | 裁剪/同步引用 | 同步结构/验收及安全证据 |
| frontweb/src/api/ai.js | 裁剪/同步引用 | 非核心渠道锁或SD2远端认证单元；历史字段和规范化兼容仍保留 |
| frontweb/src/api/characters.js | 裁剪/同步引用 | 非核心渠道锁或SD2远端认证单元；历史字段和规范化兼容仍保留 |
| frontweb/src/components/AIConfigContent.vue | 裁剪/同步引用 | 非核心渠道锁或SD2远端认证单元；历史字段和规范化兼容仍保留 |
| frontweb/src/components/Sd2AssetManagement.vue | 整文件删除 | 非核心渠道锁或SD2远端认证单元；历史字段和规范化兼容仍保留 |
| frontweb/src/composables/filmCreate/useCharacters.js | 裁剪/同步引用 | 非核心渠道锁或SD2远端认证单元；历史字段和规范化兼容仍保留 |
| frontweb/src/views/FilmCreate.vue | 裁剪/同步引用 | 非核心渠道锁或SD2远端认证单元；历史字段和规范化兼容仍保留 |
| frontweb/src/views/FilmList.vue | 裁剪/同步引用 | 非核心渠道锁或SD2远端认证单元；历史字段和规范化兼容仍保留 |


### 批次6：零保留调用的七个旧接口

| 路径 | 类别 | 一句话证据 |
| --- | --- | --- |
| backend-node/src/routes/characters.js | 裁剪/同步引用 | 先退休无用API声明并重建，再全仓库/本机技能复扫无保留调用 |
| backend-node/src/routes/images.js | 裁剪/同步引用 | 先退休无用API声明并重建，再全仓库/本机技能复扫无保留调用 |
| backend-node/src/routes/index.js | 裁剪/同步引用 | 先退休无用API声明并重建，再全仓库/本机技能复扫无保留调用 |
| backend-node/src/routes/scenes.js | 裁剪/同步引用 | 先退休无用API声明并重建，再全仓库/本机技能复扫无保留调用 |
| backend-node/src/routes/videos.js | 裁剪/同步引用 | 先退休无用API声明并重建，再全仓库/本机技能复扫无保留调用 |
| docs/SLIM_PLAN.md | 裁剪/同步引用 | 同步结构/验收及安全证据 |
| docs/SLIM_REPORT.md | 裁剪/同步引用 | 同步结构/验收及安全证据 |
| frontweb/src/api/characters.js | 裁剪/同步引用 | 先退休无用API声明并重建，再全仓库/本机技能复扫无保留调用 |
| frontweb/src/api/scenes.js | 裁剪/同步引用 | 先退休无用API声明并重建，再全仓库/本机技能复扫无保留调用 |


### 批次7：已解除引用的依赖与可复现锁文件

| 路径 | 类别 | 一句话证据 |
| --- | --- | --- |
| backend-node/package-lock.json | 裁剪/同步引用 | 五项依赖的源码/脚本/动态加载/原生用途清零；独立npm ci与测试证实 |
| backend-node/package.json | 裁剪/同步引用 | 五项依赖的源码/脚本/动态加载/原生用途清零；独立npm ci与测试证实 |
| docs/SLIM_PLAN.md | 裁剪/同步引用 | 同步结构/验收及安全证据 |
| docs/SLIM_REPORT.md | 裁剪/同步引用 | 同步结构/验收及安全证据 |


### 批次8：无引用素材死代码与运行文档

| 路径 | 类别 | 一句话证据 |
| --- | --- | --- |
| AGENTS.md | 裁剪/同步引用 | 孤儿/未挂载占位代码或无README/docs/源码引用素材；文档同步实际结构 |
| README.md | 裁剪/同步引用 | 孤儿/未挂载占位代码或无README/docs/源码引用素材；文档同步实际结构 |
| backend-node/src/app.js | 裁剪/同步引用 | 孤儿/未挂载占位代码或无README/docs/源码引用素材；文档同步实际结构 |
| backend-node/src/routes/characters.js | 裁剪/同步引用 | 孤儿/未挂载占位代码或无README/docs/源码引用素材；文档同步实际结构 |
| backend-node/src/routes/images.js | 裁剪/同步引用 | 孤儿/未挂载占位代码或无README/docs/源码引用素材；文档同步实际结构 |
| backend-node/src/routes/stub.js | 裁剪/同步引用 | 孤儿/未挂载占位代码或无README/docs/源码引用素材；文档同步实际结构 |
| backend-node/src/services/narrationVideoPostProcess.js | 整文件删除 | 孤儿/未挂载占位代码或无README/docs/源码引用素材；文档同步实际结构 |
| docs/LOCAL_MAC.md | 裁剪/同步引用 | 孤儿/未挂载占位代码或无README/docs/源码引用素材；文档同步实际结构 |
| docs/SLIM_PLAN.md | 裁剪/同步引用 | 同步结构/验收及安全证据 |
| docs/SLIM_REPORT.md | 裁剪/同步引用 | 同步结构/验收及安全证据 |
| docs/quickstart.md | 裁剪/同步引用 | 孤儿/未挂载占位代码或无README/docs/源码引用素材；文档同步实际结构 |
| docs/微信支付.docx | 整文件删除 | 孤儿/未挂载占位代码或无README/docs/源码引用素材；文档同步实际结构 |
| frontweb/src/composables/filmCreate/libraryMembership.js | 整文件删除 | 孤儿/未挂载占位代码或无README/docs/源码引用素材；文档同步实际结构 |
| tasks/todo.md | 裁剪/同步引用 | 孤儿/未挂载占位代码或无README/docs/源码引用素材；文档同步实际结构 |
| 项目截图/1.png | 整文件删除 | 孤儿/未挂载占位代码或无README/docs/源码引用素材；文档同步实际结构 |
| 项目截图/2.png | 整文件删除 | 孤儿/未挂载占位代码或无README/docs/源码引用素材；文档同步实际结构 |
| 项目截图/3.png | 整文件删除 | 孤儿/未挂载占位代码或无README/docs/源码引用素材；文档同步实际结构 |
| 项目截图/4.png | 整文件删除 | 孤儿/未挂载占位代码或无README/docs/源码引用素材；文档同步实际结构 |
| 项目截图/5.png | 整文件删除 | 孤儿/未挂载占位代码或无README/docs/源码引用素材；文档同步实际结构 |


## 16个有调用接口：逐项处置

| 接口 | 处置 | 理由 |
| --- | --- | --- |
| POST /api/v1/ai-configs/jimeng2-list-assets | 整体删除 | 平台认证/渠道锁或内置工具型助手，非唯一生产链路必需 |
| POST /api/v1/ai-configs/model-ark-asset | 整体删除 | 平台认证/渠道锁或内置工具型助手，非唯一生产链路必需 |
| GET /api/v1/ai-configs/vendor-lock | 整体删除 | 平台认证/渠道锁或内置工具型助手，非唯一生产链路必需 |
| PUT /api/v1/ai-configs/bulk-update-key | 整体删除 | 平台认证/渠道锁或内置工具型助手，非唯一生产链路必需 |
| POST /api/v1/characters/:id/generate-image | 保留 | 角色资产制作，列表/画布/创作页仍调用 |
| POST /api/v1/characters/:id/sd2-certify | 整体删除 | 平台认证/渠道锁或内置工具型助手，非唯一生产链路必需 |
| POST /api/v1/characters/:id/sd2-certify/refresh | 整体删除 | 平台认证/渠道锁或内置工具型助手，非唯一生产链路必需 |
| POST /api/v1/characters/:id/sd2-voice-upload | 整体删除 | 平台认证/渠道锁或内置工具型助手，非唯一生产链路必需 |
| POST /api/v1/characters/:id/sd2-voice-refresh | 整体删除 | 平台认证/渠道锁或内置工具型助手，非唯一生产链路必需 |
| POST /api/v1/props/:id/generate | 保留 | 道具资产制作，核心页面仍调用 |
| POST /api/v1/scenes/generate-image | 保留 | 场景资产制作，核心页面仍调用 |
| POST /api/v1/images | 保留 | 分镜与首尾帧素材/画布流程仍调用 |
| POST /api/v1/videos | 保留 | 分镜视频与画布流程仍调用 |
| POST /api/v1/videos/:id/resume-poll | 保留 | 已有视频任务恢复入口与兼容性 |
| POST /api/v1/agent/chat | 整体删除 | 平台认证/渠道锁或内置工具型助手，非唯一生产链路必需 |
| GET /api/v1/agent/history | 整体删除 | 平台认证/渠道锁或内置工具型助手，非唯一生产链路必需 |


6条核心接口保留意味着imageClient、videoClient、klingJwt及相应协议测试仍有用途，不能当死代码删除；并未为凑原清单重写API或剥掉核心调用。实际生产主线仍是Codex image_gen/可灵官方MCP下载后import，兼容端口还留在代码中，是本轮范围的明确保留项。

原另外9条无可达前端调用的接口：agent/approve、agent/decline随助手单元退休；另7条（characters/batch-generate-images、characters/:id/generate-four-view-image、scenes/:scene_id/generate-four-view-image、images/episode/:episode_id/batch、images/scene/:scene_id、videos/image/:image_gen_id、videos/episode/:episode_id/batch）删前清理声明并重建dist，全仓库与本机技能全文检索未发现保留调用。扫描包括scripts/docs/OpenClaw，审计表的提及和路由注册定义不当作请求调用。

检索范围：仓库含ignored源码/构建产物，排除真实受保护data/.local、.git与node_modules；本机12个技能/plugin根（Codex/Claude/shared/Agents/OpenCode/OpenClaw），跟随符号链接并按真实路径去重。3个根有47个已断目标（无权限拒绝）；没有修复/读取不存在目标，不宣称全世界零调用。宽路径/images、/videos有其他服务/本地目录命中，未误当本项目调用；动态require及桌面动态后端/技能加载已人工交叉验证。

## 保留的依赖与用途

| 目录 | 依赖 | 版本声明 | 用途 |
| --- | --- | --- | --- |
| backend-node | adm-zip | ^0.5.16 | 工程ZIP导入/导出；dramaImportService/dramaExportService |
| backend-node | better-sqlite3 | ^11.6.0 | SQLite、迁移、数据和核心测试；必需原生模块 |
| backend-node | cors | ^2.8.5 | 本机Express跨域边界 |
| backend-node | express | ^4.21.0 | API、静态资源与SPA入口 |
| backend-node | js-yaml | ^4.1.0 | 本机配置读取与设置持久化 |
| backend-node | jsonrepair | ^3.13.3 | 文本模型JSON容错解析 |
| backend-node | jsonwebtoken | ^9.0.3 | 保留的视频直连接口通过klingJwt签名，非登录账号系统 |
| backend-node | multer | ^1.4.5-lts.1 | 图片/视频导入与上传 |
| backend-node | sharp | ^0.34.5 | 图像完整解码、校验与网格/尺寸处理；必需原生模块 |
| backend-node | uuid | ^10.0.0 | 通用异步任务ID |
| frontweb | @element-plus/icons-vue | ^2.3.0 | 核心页面图标 |
| frontweb | @vue-flow/background | ^1.3.2 | 画布背景 |
| frontweb | @vue-flow/controls | ^1.1.3 | 画布控制 |
| frontweb | @vue-flow/core | ^1.48.2 | 画布节点/连线/视口 |
| frontweb | @vue-flow/minimap | ^1.5.4 | 画布小地图 |
| frontweb | axios | ^1.6.0 | 通用API请求和核心页面 |
| frontweb | element-plus | ^2.5.0 | 表单、弹窗、列表组件 |
| frontweb | pinia | ^2.1.0 | 剧集及任务状态 |
| frontweb | vue | ^3.4.0 | 界面与响应式 |
| frontweb | vue-router | ^4.2.0 | 8条核心/兼容页面路由 |
| frontweb | @vitejs/plugin-vue | ^5.0.0 | Vue构建插件，配置引用 |
| frontweb | vite | ^5.0.0 | dev/build/preview脚本 |


删除的后端5项是@mastra/core、@mastra/libsql、@mastra/memory、zod、@volcengine/openapi；桌面17项声明随桌面package一起移除。jsonwebtoken在新核心判定后保留，所以实际移除22而不是旧估算23。锁文件保留包版本不变；没有手删跨平台原生可选锁项，也没有安装桌面Electron。

## 保留范围与NEEDS-CONFIRM

| 对象 | 保留理由/未执行项 |
| --- | --- |
| LICENSE / docs/UPSTREAM.md | MIT原版权未改、来源归因保留；UPSTREAM只同步退役状态 |
| 29份已有SQL | 后端顶层22份不改；desktop7份逐字节移动到migrations/archive/desktop-initial/；迁移器只读顶层，不重复执行 |
| desktop/.gitignore及根忽略规则 | 硬约束只允许添加忽略规则，不删除旧规则；desktop运行代码已退役但保留此文件 |
| example_drama/衣服设计天才302.zip | 唯一示例是上游caea265已包含的133字节LFS指针，正文82156132字节未下载；没有逐案例授权清单，无自制示例文件；不删除/不声称审核正文 |
| 通用MediaLibrary/assetService/assets | 本机导入本身只写local_media_imports/image_generations/video_generations并绑定目标，不依赖assets；但保留的角色/场景/道具归档入口仍依赖通用库，故整单元保留 |
| 已被文档引用的截图/视频与style-thumbs | 仅删除5张编号无引用截图；剩余14个历史素材有UPSTREAM_README/story引用，风格缩略图有动态运行引用，均保留。缺逐素材授权证据 |
| 6个核心接口及旧厂商客户端 | 按最新规则保留其角色/场景/道具/分镜/任务恢复用途；单一文本传输仍为aiClient的OpenAI兼容路径，DeepSeek/Ark选项和字段作为兼容保留 |
| FreeCreate、SceneModelMap及历史ComfyUI/低价视频文档 | 与保留核心接口/旧工程配置仍有交叉用途，无法沿用旧“全协议退休”假设；保持原样，后续若继续缩减需确认，不为凑数删 |
| 旧工程字段、导出格式、旧任务ID与Take | 保持原样，0表/列删除；不会因移除认证功能就抹掉asset://或声音参考解析 |
| stub唯一角色提取空任务入口 | 仍注册且已有API声明，不能因其余桩方法无用而整文件误删；保留并列后续决定 |
| 治理、历史归因及其他不明用途资料 | 不以无JS import判定GitHub自动发现的SECURITY/CONTRIBUTING等为死文件 |
| 真实backend-node/data、.local与共享local-dubbing | 未修改/删除/迁移；共享服务只做读取和明确批准次数的推理，无start/stop/restart/登记/模型或默认声线修改 |


## 配音基线、获准回归与最终对比

统一声线audition_01，统一台词“现在开始测试本地配音。”，模型qwen3-tts。每次调用前只读健康/监听进程/连接观察确认可用且无已建立客户端；服务没有原子busy锁，因此空闲是当时观察证据。通过沙箱正常/audio/extract入口，不调用service.sh、不并发、不重试，最大600秒；音频仅存在沙箱。

| 阶段 | 耗时 | 格式 | 时长/大小 | 平均/最大音量 | SHA-256 |
| --- | --- | --- | --- | --- | --- |
| 删除前基线 | 24.564秒 | wav/pcm_s24le/48000Hz/1ch | 2.48秒 / 357222字节 | -19.8/-3.9dB | 740de1f7481fc7263c82d5bfa9f95b1a0f2119cde4eae1a8f4519c462f141619 |
| 渠道共用代码回归（另获批准） | 31.812秒 | wav/pcm_s24le/48000Hz/1ch | 2.48秒 / 357222字节 | -19.8/-3.9dB | 740de1f7481fc7263c82d5bfa9f95b1a0f2119cde4eae1a8f4519c462f141619 |
| 最终验收 | 18.665秒 | wav/pcm_s24le/48000Hz/1ch | 2.48秒 / 357222字节 | -19.8/-3.9dB | 740de1f7481fc7263c82d5bfa9f95b1a0f2119cde4eae1a8f4519c462f141619 |


最终比较：格式、采样率、声道和时长与删除前基线全部一致；字节SHA也一致。ffprobe、完整解码和非静音检查通过，真实用户数据指纹一致。 波形/解码验证不是人耳音色、表演或口型验收。

真实配音到FFmpeg成片额外冒烟：{   "passed": true,   "reused_existing_audition_01": true,   "extra_inference_requests": 0,   "narration_enabled": false,   "actual_postprocessed_output": true,   "duration_seconds": 3.0,   "size_bytes": 57500,   "sha256": "6ad49bbd8e4bd97ed991a690d2c1462b8d4b2d55061857dd333895aede4bcc4e",   "max_volume_db": -3.8,   "path": "/tmp/muforge-sandbox-e9/backend-node/data/storage/projects/0001_20261027_SLIM_sandbox_smoke/videos/merged/merged_1793091275171_post.mp4",   "probe": {     "programs": [],     "stream_groups": [],     "streams": [       {         "codec_name": "h264",         "codec_type": "video"       },       {         "codec_name": "aac",         "codec_type": "audio",         "sample_rate": "48000",         "channels": 1       }     ],     "format": {       "duration": "3.000000"     }   } }

## 阶段G：出片能力缺口（仅报告，未实现）

| 能力 | 判定 | 文件位置（backend默认src/services） | 缺口与建议 |
| --- | --- | --- | --- |
| 1 结构化字段 | 存在/校验部分 | migrations/01_init.sql:36；src/db/migrate.js:160,171；episodeStoryboardService.js:558 | 已有时长、角色、动作、对白、景别、运镜、情绪、连续性字段；剧本正文仍自由文本。补统一必填契约和一致性检查 |
| 2 角色一致性 | 部分 | migrations/13_character_identity_anchors.sql:2；framePromptService.js:127,204,224；episodeStoryboardService.js:434,872,1387 | 部分入口自动带外观/锚点；不保证每个image_gen/MCP输入都带定妆图和固定片段。统一每镜参考版本清单 |
| 3 分镜约束 | 部分 | episodeStoryboardService.js:415；storyboardService.js:28–53,90 | 生成时仅限1–120秒，不是当次模型上限；更新缺同等限制，角色关联跳过非法项但未严格校验剧集归属。补提交前硬校验和单镜动作复杂度约束 |
| 4 首尾帧/参考素材 | 部分 | storyboardFrameBinding.js:6；tailFrameLinkService.js:121,154；routes/videos.js:56–65；localProductionService.js:91–105 | 已有分离帧绑定、尾帧衔接和导入回执；图片导入固定首帧，参考视频/音频和派生产物没有统一来源关系 |
| 5 多Take与回退 | 部分/已有路径风险 | localProductionService.js:91–105；FilmCreate.vue:1299,1470,3707–3711 | 导入追加Take，历史选择存在，但无完整工程版本快照；选历史视频会把video.local_path写入storyboards.local_path，可能污染静帧路径。优先修正路径边界，再做原子回退 |
| 6 成本/预算硬上限 | 缺失 | LocalProduction.vue:89,136；videoClient.js:2290–2300 | 预算是会话授权说明，credits只写日志；没有费用账本、参考视频计费核算、预留或超限拒绝。后续独立设计提交前预算门禁 |
| 7 异步/续跑 | 部分 | taskService.js:3–58,83–114；videoService.js:328–465；app.js:19–23 | 任务持久化和视频已有上游ID恢复；普通进程内任务重启标失败，取消不终止已发请求；外部MCP下载/导入缺持久步骤/幂等关联 |
| 8 配音/字幕/口型 | 部分；口型缺失 | mergedEpisodePostProcess.js:76,130,251,275,337,351；episodeStoryboardService.js:1629 | 对白可按镜头压缩/补静音，字幕按镜头整段；旁白合成会重新推理而不优先复用已有音频。缺词/音素强制对齐与viseme/口型实现 |
| 9 FFmpeg交付 | 部分/失败判定风险 | videoMergeService.js:136–141,291–310；mergedEpisodePostProcess.js:351,380；videoService.js:140,181 | 有concat、H264/AAC兜底、字幕/水印；缺统一转场、响度、竖屏和码率规格。后处理失败可仅warn、无成片可退首片段并标completed，必须后续优先修复 |
| 10 完整追溯 | 部分 | localProductionService.js:11–15,59–62,82–107；LocalProduction.vue:123–128；dramaExportService.js:295–310 | 回执有SHA/提示词/模板/model/task字段但可缺省，provider按kind硬编码，模板无版本；ZIP不往返local_media_imports，音频/成片无同等级收据 |
| 11 AI标记/素材授权 | 部分：技术来源有，权利字段缺失 | localProductionService.js:11–15；characterLibraryService rowToItem；mergedEpisodePostProcess.js:208–210,359 | source_type/provider不是授权证明；缺ai_generated、授权类型/来源URL/许可版本/用途与证据。watermark_text可选，不是固定AI标记；后续补机器可读字段与简洁对外标识 |


本轮没有修复这些既有问题；基础合成/导入冒烟不能证明完整短剧、复杂字幕混音、画质、动作连续性、口型或预算控制达到交付标准。

## 密钥扫描与需用户核实轮换的类型

A/B对完整原有263提交/全部refs执行官方gitleaks v8.30.1，全量redact、禁用inline allow、archive-depth=2；结果为同一历史打包文件2处generic-api-key候选。人工扫描另登记6份JSON各10个非空api_key。有效性与账号归属未确认，没有联网验证；本轮没有新增疑似密钥发现。

| 类型 | 路径 | 位置 | 用户行动 |
| --- | --- | --- | --- |
| 中转商API Key（302ai-302） | 各大平台中转站配置/302ai-302.json | 8,29,50,72,93,113,131,151,170,192 | 若曾填入/使用真实凭据，去对应服务商后台撤销/轮换；历史仍保留 |
| 中转商API Key（geeknow） | 各大平台中转站配置/geeknow.json | 8,29,50,72,93,113,131,151,170,192 | 若曾填入/使用真实凭据，去对应服务商后台撤销/轮换；历史仍保留 |
| 中转商API Key（n1n） | 各大平台中转站配置/n1n.json | 8,29,50,72,93,113,131,151,170,192 | 若曾填入/使用真实凭据，去对应服务商后台撤销/轮换；历史仍保留 |
| 中转商API Key（云雾ai） | 各大平台中转站配置/云雾ai.json | 8,29,50,72,93,113,131,151,170,192 | 若曾填入/使用真实凭据，去对应服务商后台撤销/轮换；历史仍保留 |
| 中转商API Key（向量） | 各大平台中转站配置/向量.json | 8,29,50,72,93,113,131,151,170,192 | 若曾填入/使用真实凭据，去对应服务商后台撤销/轮换；历史仍保留 |
| 中转商API Key（飞儿api-ffir.cn） | 各大平台中转站配置/飞儿api-ffir.cn.json | 8,29,50,72,93,113,131,151,170,192 | 若曾填入/使用真实凭据，去对应服务商后台撤销/轮换；历史仍保留 |
| generic-api-key，服务商未知 | desktop/backend-app-secure/src/app.js | 历史提交ececcdcb6b14f40b8d3fec42a38a2633593b4613，第1行两处 | 用户先核实历史凭据归属，再去所属服务商撤销/轮换；当前路径已不在工作树 |


不打印任何值，不把截图中的字段标签/付款二维码臆测成有效API凭据。删除当前文件不会清除Git历史；未历史清洗、force或push。官方OAuth凭据、共享Qwen声线和本机用户配置不复制进仓库。

## 风险、回滚与证据

保留的旧客户端/FreeCreate/配置兼容并不代表已经完成纯Codex端到端架构重写；本轮严格遵守不新增功能和核心接口保留决定。原启动器仍有Qwen不健康时自动启动分支，隔离验收始终以外部guard阻断service.sh，未修改其共享服务行为。真实node_modules未为瘦身清空，npm ci在独立沙箱验证；原.git与/tmp沙箱均保留，实际磁盘释放不等于逻辑删除体积。

回滚采用对应批次git revert（按依赖顺序逆序）或从pre-slim按路径恢复代码；不reset整棵工作树、不覆盖用户修改、不改历史，不回滚/恢复/搬动真实用户数据库或共享模型。所有提交留在slim/focus，main保持pre-slim。

原基线沙箱/tmp/muforge-sandbox、各批/tmp/muforge-sandbox-e*及安全审计目录 /var/folders/90/l9wxyby101xb8xvjw64v9cz00000gn/T/muforge-slim-e-preflight-r3rci6rn 均保留；正常验证完成后沙箱已stop，只有用户决定后才清理。原始指纹/日志/响应不提交Git。公开报告只包含必要路径、类型、统计和哈希；基线见SLIM_BASELINE，阶段B清单是pre-slim历史快照，阶段E决策见SLIM_PLAN。

## 收尾记录

最终报告/规则文档收尾提交不改业务代码，使用9号独立clone的123项后端、18项前端及完整运行验收证据；配置页、创作页和画布页也已实测，画布加载14个节点。最终配音18.665秒完成，2.48秒48kHz单声道WAV，与基线格式/时长/字节SHA全部一致。复用该音频实际完成3秒H264/AAC、48kHz单声道MP4，确认是_post成片而非首片段兜底；完整解码、非静音通过，没有追加推理。

音频输出位置：

- 删除前基线：`/private/tmp/muforge-sandbox/backend-node/data/storage/audio/tts_sb1_163f2d80.wav`
- 共用代码回归：`/private/tmp/muforge-sandbox-e5/backend-node/data/storage/audio/tts_sb1_aa7580f3.wav`
- 最终验收：`/private/tmp/muforge-sandbox-e9/backend-node/data/storage/audio/tts_sb1_c4cca8b7.wav`

所有沙箱均已停止并保留；共享Qwen未被启停。真实data/.local指纹与阶段B结束时一致。验收用的图像/视频都是本地生成的小测试文件，未冒充已调用image_gen或可灵生成完整剧情。

收尾文档路径：AGENTS.md（推理额度与规则）、backend-node/README.md（标注历史技术参考）、docs/SLIM_PLAN.md（最终决策状态）、docs/SLIM_REPORT.md（本报告）。这些文档不改已验收业务源码；本地Markdown链接检查无新悬空链接。
