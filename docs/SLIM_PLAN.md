# MuForge 瘦身方案（阶段 E 获批，分批执行）

**阶段 A/B 已完成；用户已批准阶段 E 高置信项连续分批执行及独立提交，仍禁止 push 与历史改写。** 基准 `pre-slim`（79a1f48），工作分支 `slim/focus`。基线详见 [SLIM_BASELINE](SLIM_BASELINE.md)，完整162路由/49服务/24表/29迁移/前端与依赖清单见 [SLIM_INVENTORY](SLIM_INVENTORY.md)。

## 预计变化（草案，不是已经完成）

| 项目 | 当前 | 高置信候选执行后 |
| --- | --- | --- |
| 受版本管理文件 | 401 | 整文件删除 86 份；新增审计报告另计 |
| 整文件逻辑体积 | 112,280,921 字节 | 减少 101,367,607 字节（96.67 MiB） |
| 文本行数 | 按UTF-8且不含NUL文件计 | 整文件删除约 25,165 行；局部裁剪另计 |
| 直接依赖声明 | 后端15 / 前端12 / desktop17 | 后端减6、desktop减17，共减23项声明；前端暂不减 |
| 后端API注册 | 162 | 减25候选；剩137（含18项待确认） |
| 前端页面路由 | 8 | 减 /free-create 1项；/media-library 待确认 |
| 数据库表 / 迁移 | 24表；后端22+桌面7份SQL | 删除0表、0列、0迁移 |
| 历史Git对象 | size-pack83.72MiB | 不改历史，不承诺缩小.git；历史秘密不会因工作树删文件消失 |


体积为基准401个受版本管理文件的逻辑字节，不包括用户data/.local、node_modules、Git历史、远端LFS正文；不将目录 du 与 Git pack 叠加。以上是已枚举的整文件候选下限，混合模块局部裁剪尚不预估行数/字节，不能把整个混合文件体积算作节约。

## 三项决策的执行边界

1. Electron：退役桌面代码、package/锁、构建配置与release工作流。发现 desktop/scripts/initial-migrations 下7份SQL，硬约束“不得删除任何已有迁移”优先，原地保留；不是完整删除desktop目录。若希望移走归档须另行决定，本轮不搬动。
2. 文本：保留既有 aiClient 的通用 OpenAI chat/completions、流式、视觉输入转文本和调用链；删除 Mastra 工具型助手及 DeepSeek/Ark 专属分支。视觉描述属于文本输出，不误删为生图直连。保留本机TTS配置类型。
3. 图片/视频：删除厂商提交、签名、认证、远程轮询和对应界面；保留导入、记录查询/旧Take、资产绑定、首尾帧、提示词、任务、合成。imageService/videoService/FilmCreate/Canvas 等均为混合文件，不整文件删除。

## 分类与证据

| 路径/对象 | 类别 | 证据 | 置信度 | 处置 |
| --- | --- | --- | --- | --- |
| LICENSE、docs/UPSTREAM.md | KEEP-CORE | 用户硬性要求、上游MIT版权；不依赖付款二维码 | 高/明确约束 | 保留；仅必要更新桌面状态说明，不删归因 |
| scripts/local.mjs、启动/停止幕匠.command | KEEP-CORE | README实际入口；沙箱setup/start/status/stop已通过 | 高/明确约束 | 保留；共享Qwen生命周期调用后续必须隔离，不新增功能 |
| drama/character/scene/prop/storyboard 模型、服务、界面 | KEEP-CORE | 入口可达、API和数据库读写均有证据；核心剧集/资产/分镜管理 | 高/明确约束 | 保留CRUD、引用、库、画布、模板和文本生成 |
| localProductionService、localProduction路由、LocalProduction.vue | KEEP-CORE | 图片/视频导入实测；绑定、来源、SHA与旧Take保存已通过 | 高/明确约束 | KEEP-CORE，尤其bindStoryboardFrameImage及local_media_imports |
| ttsService、audio路由、本机TTS配置与测试 | KEEP-CORE | 获准单次真实推理成功；48kHz单声道WAV、非静音 | 高/明确约束 | 保留；每批只读检测，最终再一次真实推理 |
| videoMergeService、mergedEpisodePostProcess、tailFrameLinkService、ffmpegPath | KEEP-CORE | 合成和解码实测；真实后处理调用图明确 | 高/明确约束 | 保留；仅删除Windows专用二进制 |
| backend-node/migrations/*.sql、desktop/scripts/initial-migrations/*.sql | KEEP-CORE | 用户禁止删除迁移；共29份已有SQL | 高/明确约束 | 全部保留；不对真实数据库做迁移 |
| backend-node/data/、.local/、~/AI/local-dubbing | KEEP-CORE | 受保护用户数据/共享服务；真实指纹一致 | 高/明确约束 | 不修改、不删除、不复制内容进报告 |
| aiClient、aiConfigService、imageService、videoService及其路由 | KEEP-CORE | 通用核心与旧适配器共用；数据库/导入/提示词仍调用 | 高/明确约束 | 仅最小局部删除悬空调用和退休接口，禁止顺手重构 |
| universalOmniMultiBeatFormat / universalSegment* / persisted beat字段 | KEEP-CORE | 实际分镜文本与持久化格式使用，不能按名字删除 | 高/明确约束 | 保留兼容；若要改格式列NEEDS-CONFIRM |


| 路径（逐文件） | 类别 | 独立证据 | 置信度 | 处置 |
| --- | --- | --- | --- | --- |
| 各大平台中转站配置/302ai-302.json | DELETE | 上游厂商中转配置，与保留链路无关；配置加载器不扫描此目录，且用户已退役直连 | 高 | 批次1：删除整目录；先登记凭据字段，仅删除受版本管理文件 |
| 各大平台中转站配置/comfyui配置.md | DELETE | 上游厂商中转配置，与保留链路无关；配置加载器不扫描此目录，且用户已退役直连 | 高 | 批次1：删除整目录；先登记凭据字段，仅删除受版本管理文件 |
| 各大平台中转站配置/geeknow.json | DELETE | 上游厂商中转配置，与保留链路无关；配置加载器不扫描此目录，且用户已退役直连 | 高 | 批次1：删除整目录；先登记凭据字段，仅删除受版本管理文件 |
| 各大平台中转站配置/n1n.json | DELETE | 上游厂商中转配置，与保留链路无关；配置加载器不扫描此目录，且用户已退役直连 | 高 | 批次1：删除整目录；先登记凭据字段，仅删除受版本管理文件 |
| 各大平台中转站配置/stablediffusion webui接口.png | DELETE | 上游厂商中转配置，与保留链路无关；配置加载器不扫描此目录，且用户已退役直连 | 高 | 批次1：删除整目录；先登记凭据字段，仅删除受版本管理文件 |
| 各大平台中转站配置/云雾ai.json | DELETE | 上游厂商中转配置，与保留链路无关；配置加载器不扫描此目录，且用户已退役直连 | 高 | 批次1：删除整目录；先登记凭据字段，仅删除受版本管理文件 |
| 各大平台中转站配置/使用说明.txt | DELETE | 上游厂商中转配置，与保留链路无关；配置加载器不扫描此目录，且用户已退役直连 | 高 | 批次1：删除整目录；先登记凭据字段，仅删除受版本管理文件 |
| 各大平台中转站配置/向量.json | DELETE | 上游厂商中转配置，与保留链路无关；配置加载器不扫描此目录，且用户已退役直连 | 高 | 批次1：删除整目录；先登记凭据字段，仅删除受版本管理文件 |
| 各大平台中转站配置/官方即梦2.0配置.png | DELETE | 上游厂商中转配置，与保留链路无关；配置加载器不扫描此目录，且用户已退役直连 | 高 | 批次1：删除整目录；先登记凭据字段，仅删除受版本管理文件 |
| 各大平台中转站配置/调用本地反向代理即梦freeapi的配置.png | DELETE | 上游厂商中转配置，与保留链路无关；配置加载器不扫描此目录，且用户已退役直连 | 高 | 批次1：删除整目录；先登记凭据字段，仅删除受版本管理文件 |
| 各大平台中转站配置/飞儿api-ffir.cn.json | DELETE | 上游厂商中转配置，与保留链路无关；配置加载器不扫描此目录，且用户已退役直连 | 高 | 批次1：删除整目录；先登记凭据字段，仅删除受版本管理文件 |
| backend-node/tools/ffmpeg/ffmpeg.exe | DELETE | 明确的 Windows 平台脚本/PE 二进制；Mac 沙箱已使用系统 FFmpeg 完成合成 | 高 | 批次2：删除；保留 ffmpegPath 通用查找器、README 与目录占位 |
| run_dev.bat | DELETE | 明确的 Windows 平台脚本/PE 二进制；Mac 沙箱已使用系统 FFmpeg 完成合成 | 高 | 批次2：删除；保留 ffmpegPath 通用查找器、README 与目录占位 |
| run_dev.ps1 | DELETE | 明确的 Windows 平台脚本/PE 二进制；Mac 沙箱已使用系统 FFmpeg 完成合成 | 高 | 批次2：删除；保留 ffmpegPath 通用查找器、README 与目录占位 |
| .github/workflows/release.yml | DELETE | 用户明确移除 Electron；desktop/main.js 和打包工作流仅服务桌面发行，Mac Web 启动不依赖它们 | 高 | 批次3：删除非 SQL 桌面代码/锁文件/打包配置；7 份迁移原地保留 |
| desktop/.gitignore | DELETE | 用户明确移除 Electron；desktop/main.js 和打包工作流仅服务桌面发行，Mac Web 启动不依赖它们 | 高 | 批次3：删除非 SQL 桌面代码/锁文件/打包配置；7 份迁移原地保留 |
| desktop/.npmrc | DELETE | 用户明确移除 Electron；desktop/main.js 和打包工作流仅服务桌面发行，Mac Web 启动不依赖它们 | 高 | 批次3：删除非 SQL 桌面代码/锁文件/打包配置；7 份迁移原地保留 |
| desktop/README.md | DELETE | 用户明确移除 Electron；desktop/main.js 和打包工作流仅服务桌面发行，Mac Web 启动不依赖它们 | 高 | 批次3：删除非 SQL 桌面代码/锁文件/打包配置；7 份迁移原地保留 |
| desktop/dist-cn.bat | DELETE | 用户明确移除 Electron；desktop/main.js 和打包工作流仅服务桌面发行，Mac Web 启动不依赖它们 | 高 | 批次3：删除非 SQL 桌面代码/锁文件/打包配置；7 份迁移原地保留 |
| desktop/dist-mac.sh | DELETE | 用户明确移除 Electron；desktop/main.js 和打包工作流仅服务桌面发行，Mac Web 启动不依赖它们 | 高 | 批次3：删除非 SQL 桌面代码/锁文件/打包配置；7 份迁移原地保留 |
| desktop/dist/builder-debug.yml | DELETE | 用户明确移除 Electron；desktop/main.js 和打包工作流仅服务桌面发行，Mac Web 启动不依赖它们 | 高 | 批次3：删除非 SQL 桌面代码/锁文件/打包配置；7 份迁移原地保留 |
| desktop/dist/builder-effective-config.yaml | DELETE | 用户明确移除 Electron；desktop/main.js 和打包工作流仅服务桌面发行，Mac Web 启动不依赖它们 | 高 | 批次3：删除非 SQL 桌面代码/锁文件/打包配置；7 份迁移原地保留 |
| desktop/electron-builder-lite.json | DELETE | 用户明确移除 Electron；desktop/main.js 和打包工作流仅服务桌面发行，Mac Web 启动不依赖它们 | 高 | 批次3：删除非 SQL 桌面代码/锁文件/打包配置；7 份迁移原地保留 |
| desktop/electron-builder-mac-lite.json | DELETE | 用户明确移除 Electron；desktop/main.js 和打包工作流仅服务桌面发行，Mac Web 启动不依赖它们 | 高 | 批次3：删除非 SQL 桌面代码/锁文件/打包配置；7 份迁移原地保留 |
| desktop/electron-builder-mac.json | DELETE | 用户明确移除 Electron；desktop/main.js 和打包工作流仅服务桌面发行，Mac Web 启动不依赖它们 | 高 | 批次3：删除非 SQL 桌面代码/锁文件/打包配置；7 份迁移原地保留 |
| desktop/ffmpeg-mac/README.txt | DELETE | 用户明确移除 Electron；desktop/main.js 和打包工作流仅服务桌面发行，Mac Web 启动不依赖它们 | 高 | 批次3：删除非 SQL 桌面代码/锁文件/打包配置；7 份迁移原地保留 |
| desktop/main.js | DELETE | 用户明确移除 Electron；desktop/main.js 和打包工作流仅服务桌面发行，Mac Web 启动不依赖它们 | 高 | 批次3：删除非 SQL 桌面代码/锁文件/打包配置；7 份迁移原地保留 |
| desktop/package-lock.json | DELETE | 用户明确移除 Electron；desktop/main.js 和打包工作流仅服务桌面发行，Mac Web 启动不依赖它们 | 高 | 批次3：删除非 SQL 桌面代码/锁文件/打包配置；7 份迁移原地保留 |
| desktop/package.json | DELETE | 用户明确移除 Electron；desktop/main.js 和打包工作流仅服务桌面发行，Mac Web 启动不依赖它们 | 高 | 批次3：删除非 SQL 桌面代码/锁文件/打包配置；7 份迁移原地保留 |
| desktop/scripts/clean-win-unpacked.js | DELETE | 用户明确移除 Electron；desktop/main.js 和打包工作流仅服务桌面发行，Mac Web 启动不依赖它们 | 高 | 批次3：删除非 SQL 桌面代码/锁文件/打包配置；7 份迁移原地保留 |
| desktop/scripts/copy-backend.js | DELETE | 用户明确移除 Electron；desktop/main.js 和打包工作流仅服务桌面发行，Mac Web 启动不依赖它们 | 高 | 批次3：删除非 SQL 桌面代码/锁文件/打包配置；7 份迁移原地保留 |
| desktop/scripts/copy-front.js | DELETE | 用户明确移除 Electron；desktop/main.js 和打包工作流仅服务桌面发行，Mac Web 启动不依赖它们 | 高 | 批次3：删除非 SQL 桌面代码/锁文件/打包配置；7 份迁移原地保留 |
| desktop/scripts/dist-cn.js | DELETE | 用户明确移除 Electron；desktop/main.js 和打包工作流仅服务桌面发行，Mac Web 启动不依赖它们 | 高 | 批次3：删除非 SQL 桌面代码/锁文件/打包配置；7 份迁移原地保留 |
| frontweb/src/components/AgentDrawer.vue | DELETE | Agent 和 Sd2 界面仅接退役助手/平台；FreeCreate 仅直连生成；对应 API/路由和测试交叉确认 | 高 | 批次4：删除专属文件，并最小裁剪 App、路由和配置页引用；不是不可达页误判 |
| frontweb/src/api/agent.js | DELETE | Agent 和 Sd2 界面仅接退役助手/平台；FreeCreate 仅直连生成；对应 API/路由和测试交叉确认 | 高 | 批次4：删除专属文件，并最小裁剪 App、路由和配置页引用；不是不可达页误判 |
| frontweb/src/stores/agentContext.js | DELETE | Agent 和 Sd2 界面仅接退役助手/平台；FreeCreate 仅直连生成；对应 API/路由和测试交叉确认 | 高 | 批次4：删除专属文件，并最小裁剪 App、路由和配置页引用；不是不可达页误判 |
| frontweb/src/utils/agentStream.js | DELETE | Agent 和 Sd2 界面仅接退役助手/平台；FreeCreate 仅直连生成；对应 API/路由和测试交叉确认 | 高 | 批次4：删除专属文件，并最小裁剪 App、路由和配置页引用；不是不可达页误判 |
| frontweb/src/components/Sd2AssetManagement.vue | DELETE | Agent 和 Sd2 界面仅接退役助手/平台；FreeCreate 仅直连生成；对应 API/路由和测试交叉确认 | 高 | 批次4：删除专属文件，并最小裁剪 App、路由和配置页引用；不是不可达页误判 |
| frontweb/src/views/FreeCreate.vue | DELETE | Agent 和 Sd2 界面仅接退役助手/平台；FreeCreate 仅直连生成；对应 API/路由和测试交叉确认 | 高 | 批次4：删除专属文件，并最小裁剪 App、路由和配置页引用；不是不可达页误判 |
| frontweb/test/agentStream.test.js | DELETE | Agent 和 Sd2 界面仅接退役助手/平台；FreeCreate 仅直连生成；对应 API/路由和测试交叉确认 | 高 | 批次4：删除专属文件，并最小裁剪 App、路由和配置页引用；不是不可达页误判 |
| backend-node/src/services/deepseekConfig.js | DELETE | 内容为专属厂商协议、签名或工具型助手；调用方与对应测试已定位，通用文本与导入不依赖这些协议 | 高 | 批次5：按接口清单同步裁剪调用方；混合测试保留有用断言，不整文件误删 |
| backend-node/src/services/imageClient.js | DELETE | 内容为专属厂商协议、签名或工具型助手；调用方与对应测试已定位，通用文本与导入不依赖这些协议 | 高 | 批次5：按接口清单同步裁剪调用方；混合测试保留有用断言，不整文件误删 |
| backend-node/src/services/videoClient.js | DELETE | 内容为专属厂商协议、签名或工具型助手；调用方与对应测试已定位，通用文本与导入不依赖这些协议 | 高 | 批次5：按接口清单同步裁剪调用方；混合测试保留有用断言，不整文件误删 |
| backend-node/src/services/jimengMaterialHubService.js | DELETE | 内容为专属厂商协议、签名或工具型助手；调用方与对应测试已定位，通用文本与导入不依赖这些协议 | 高 | 批次5：按接口清单同步裁剪调用方；混合测试保留有用断言，不整文件误删 |
| backend-node/src/services/klingJwt.js | DELETE | 内容为专属厂商协议、签名或工具型助手；调用方与对应测试已定位，通用文本与导入不依赖这些协议 | 高 | 批次5：按接口清单同步裁剪调用方；混合测试保留有用断言，不整文件误删 |
| backend-node/src/services/modelArkAssetConfigService.js | DELETE | 内容为专属厂商协议、签名或工具型助手；调用方与对应测试已定位，通用文本与导入不依赖这些协议 | 高 | 批次5：按接口清单同步裁剪调用方；混合测试保留有用断言，不整文件误删 |
| backend-node/src/services/modelArkAssetProxyService.js | DELETE | 内容为专属厂商协议、签名或工具型助手；调用方与对应测试已定位，通用文本与导入不依赖这些协议 | 高 | 批次5：按接口清单同步裁剪调用方；混合测试保留有用断言，不整文件误删 |
| backend-node/src/services/propImageGenerationService.js | DELETE | 内容为专属厂商协议、签名或工具型助手；调用方与对应测试已定位，通用文本与导入不依赖这些协议 | 高 | 批次5：按接口清单同步裁剪调用方；混合测试保留有用断言，不整文件误删 |
| backend-node/src/mastra/context.mjs | DELETE | 内容为专属厂商协议、签名或工具型助手；调用方与对应测试已定位，通用文本与导入不依赖这些协议 | 高 | 批次5：按接口清单同步裁剪调用方；混合测试保留有用断言，不整文件误删 |
| backend-node/src/mastra/index.mjs | DELETE | 内容为专属厂商协议、签名或工具型助手；调用方与对应测试已定位，通用文本与导入不依赖这些协议 | 高 | 批次5：按接口清单同步裁剪调用方；混合测试保留有用断言，不整文件误删 |
| backend-node/src/mastra/model.mjs | DELETE | 内容为专属厂商协议、签名或工具型助手；调用方与对应测试已定位，通用文本与导入不依赖这些协议 | 高 | 批次5：按接口清单同步裁剪调用方；混合测试保留有用断言，不整文件误删 |
| backend-node/src/mastra/skills.mjs | DELETE | 内容为专属厂商协议、签名或工具型助手；调用方与对应测试已定位，通用文本与导入不依赖这些协议 | 高 | 批次5：按接口清单同步裁剪调用方；混合测试保留有用断言，不整文件误删 |
| backend-node/src/mastra/sse.mjs | DELETE | 内容为专属厂商协议、签名或工具型助手；调用方与对应测试已定位，通用文本与导入不依赖这些协议 | 高 | 批次5：按接口清单同步裁剪调用方；混合测试保留有用断言，不整文件误删 |
| backend-node/src/mastra/tools.mjs | DELETE | 内容为专属厂商协议、签名或工具型助手；调用方与对应测试已定位，通用文本与导入不依赖这些协议 | 高 | 批次5：按接口清单同步裁剪调用方；混合测试保留有用断言，不整文件误删 |
| backend-node/src/routes/agent.js | DELETE | 内容为专属厂商协议、签名或工具型助手；调用方与对应测试已定位，通用文本与导入不依赖这些协议 | 高 | 批次5：按接口清单同步裁剪调用方；混合测试保留有用断言，不整文件误删 |
| backend-node/skills/short-drama/SKILL.md | DELETE | 内容为专属厂商协议、签名或工具型助手；调用方与对应测试已定位，通用文本与导入不依赖这些协议 | 高 | 批次5：按接口清单同步裁剪调用方；混合测试保留有用断言，不整文件误删 |
| backend-node/test/agent-context.test.js | DELETE | 内容为专属厂商协议、签名或工具型助手；调用方与对应测试已定位，通用文本与导入不依赖这些协议 | 高 | 批次5：按接口清单同步裁剪调用方；混合测试保留有用断言，不整文件误删 |
| backend-node/test/agent-model-skills.test.js | DELETE | 内容为专属厂商协议、签名或工具型助手；调用方与对应测试已定位，通用文本与导入不依赖这些协议 | 高 | 批次5：按接口清单同步裁剪调用方；混合测试保留有用断言，不整文件误删 |
| backend-node/test/agent-routes.test.js | DELETE | 内容为专属厂商协议、签名或工具型助手；调用方与对应测试已定位，通用文本与导入不依赖这些协议 | 高 | 批次5：按接口清单同步裁剪调用方；混合测试保留有用断言，不整文件误删 |
| backend-node/test/agent-tools.test.js | DELETE | 内容为专属厂商协议、签名或工具型助手；调用方与对应测试已定位，通用文本与导入不依赖这些协议 | 高 | 批次5：按接口清单同步裁剪调用方；混合测试保留有用断言，不整文件误删 |
| backend-node/test/agnesImageSize.test.js | DELETE | 内容为专属厂商协议、签名或工具型助手；调用方与对应测试已定位，通用文本与导入不依赖这些协议 | 高 | 批次5：按接口清单同步裁剪调用方；混合测试保留有用断言，不整文件误删 |
| backend-node/test/agnesVideoBody.test.js | DELETE | 内容为专属厂商协议、签名或工具型助手；调用方与对应测试已定位，通用文本与导入不依赖这些协议 | 高 | 批次5：按接口清单同步裁剪调用方；混合测试保留有用断言，不整文件误删 |
| backend-node/test/agnesVideoPoll.test.js | DELETE | 内容为专属厂商协议、签名或工具型助手；调用方与对应测试已定位，通用文本与导入不依赖这些协议 | 高 | 批次5：按接口清单同步裁剪调用方；混合测试保留有用断言，不整文件误删 |
| backend-node/test/cheapSeedance2Video.test.js | DELETE | 内容为专属厂商协议、签名或工具型助手；调用方与对应测试已定位，通用文本与导入不依赖这些协议 | 高 | 批次5：按接口清单同步裁剪调用方；混合测试保留有用断言，不整文件误删 |
| backend-node/test/dashScopeWanInterleaveStream.test.js | DELETE | 内容为专属厂商协议、签名或工具型助手；调用方与对应测试已定位，通用文本与导入不依赖这些协议 | 高 | 批次5：按接口清单同步裁剪调用方；混合测试保留有用断言，不整文件误删 |
| backend-node/test/deepseekConfig.test.js | DELETE | 内容为专属厂商协议、签名或工具型助手；调用方与对应测试已定位，通用文本与导入不依赖这些协议 | 高 | 批次5：按接口清单同步裁剪调用方；混合测试保留有用断言，不整文件误删 |
| backend-node/test/imageProxyCache.test.js | DELETE | 内容为专属厂商协议、签名或工具型助手；调用方与对应测试已定位，通用文本与导入不依赖这些协议 | 高 | 批次5：按接口清单同步裁剪调用方；混合测试保留有用断言，不整文件误删 |
| backend-node/test/jimengMaterialHub.test.js | DELETE | 内容为专属厂商协议、签名或工具型助手；调用方与对应测试已定位，通用文本与导入不依赖这些协议 | 高 | 批次5：按接口清单同步裁剪调用方；混合测试保留有用断言，不整文件误删 |
| backend-node/test/minimaxH3.test.js | DELETE | 内容为专属厂商协议、签名或工具型助手；调用方与对应测试已定位，通用文本与导入不依赖这些协议 | 高 | 批次5：按接口清单同步裁剪调用方；混合测试保留有用断言，不整文件误删 |
| backend-node/test/modelArkAssetConfig.test.js | DELETE | 内容为专属厂商协议、签名或工具型助手；调用方与对应测试已定位，通用文本与导入不依赖这些协议 | 高 | 批次5：按接口清单同步裁剪调用方；混合测试保留有用断言，不整文件误删 |
| backend-node/test/volcOmniEndpoints.test.js | DELETE | 内容为专属厂商协议、签名或工具型助手；调用方与对应测试已定位，通用文本与导入不依赖这些协议 | 高 | 批次5：按接口清单同步裁剪调用方；混合测试保留有用断言，不整文件误删 |
| backend-node/test/helpers/agentTestDb.js | DELETE | 内容为专属厂商协议、签名或工具型助手；调用方与对应测试已定位，通用文本与导入不依赖这些协议 | 高 | 批次5：按接口清单同步裁剪调用方；混合测试保留有用断言，不整文件误删 |
| docs/comfyui原理.txt | DELETE | 内容明确为退役 ComfyUI、付费生成器/工具助手设计或支付指南；当前 README 无引用、运行入口无加载 | 高 | 批次7：删除并检查剩余历史文档的悬空链接；保留 LICENSE 和 UPSTREAM |
| docs/comfyui资料1.md | DELETE | 内容明确为退役 ComfyUI、付费生成器/工具助手设计或支付指南；当前 README 无引用、运行入口无加载 | 高 | 批次7：删除并检查剩余历史文档的悬空链接；保留 LICENSE 和 UPSTREAM |
| docs/comfyui配置.md | DELETE | 内容明确为退役 ComfyUI、付费生成器/工具助手设计或支付指南；当前 README 无引用、运行入口无加载 | 高 | 批次7：删除并检查剩余历史文档的悬空链接；保留 LICENSE 和 UPSTREAM |
| docs/微信支付.docx | DELETE | 内容明确为退役 ComfyUI、付费生成器/工具助手设计或支付指南；当前 README 无引用、运行入口无加载 | 高 | 批次7：删除并检查剩余历史文档的悬空链接；保留 LICENSE 和 UPSTREAM |
| docs/superpowers/plans/2026-10-02-cheap-seedance2-video-provider.md | DELETE | 内容明确为退役 ComfyUI、付费生成器/工具助手设计或支付指南；当前 README 无引用、运行入口无加载 | 高 | 批次7：删除并检查剩余历史文档的悬空链接；保留 LICENSE 和 UPSTREAM |
| docs/superpowers/plans/2026-10-16-mastra-agent.md | DELETE | 内容明确为退役 ComfyUI、付费生成器/工具助手设计或支付指南；当前 README 无引用、运行入口无加载 | 高 | 批次7：删除并检查剩余历史文档的悬空链接；保留 LICENSE 和 UPSTREAM |
| docs/superpowers/specs/2026-10-02-cheap-seedance2-video-provider-design.md | DELETE | 内容明确为退役 ComfyUI、付费生成器/工具助手设计或支付指南；当前 README 无引用、运行入口无加载 | 高 | 批次7：删除并检查剩余历史文档的悬空链接；保留 LICENSE 和 UPSTREAM |
| docs/superpowers/specs/2026-10-16-mastra-agent-design.md | DELETE | 内容明确为退役 ComfyUI、付费生成器/工具助手设计或支付指南；当前 README 无引用、运行入口无加载 | 高 | 批次7：删除并检查剩余历史文档的悬空链接；保留 LICENSE 和 UPSTREAM |
| openclaw-skill/README.md | DELETE | OpenClaw 外部工具描述未被本应用加载且包含退役生成接口；两个孤儿文件无入口可达、无业务调用和测试依赖 | 高 | 批次8：删除工具残留和孤儿文件；不批量清空注释/日志 |
| openclaw-skill/SKILL.md | DELETE | OpenClaw 外部工具描述未被本应用加载且包含退役生成接口；两个孤儿文件无入口可达、无业务调用和测试依赖 | 高 | 批次8：删除工具残留和孤儿文件；不批量清空注释/日志 |
| openclaw-skill/skill.json | DELETE | OpenClaw 外部工具描述未被本应用加载且包含退役生成接口；两个孤儿文件无入口可达、无业务调用和测试依赖 | 高 | 批次8：删除工具残留和孤儿文件；不批量清空注释/日志 |
| openclaw-skill/tools.json | DELETE | OpenClaw 外部工具描述未被本应用加载且包含退役生成接口；两个孤儿文件无入口可达、无业务调用和测试依赖 | 高 | 批次8：删除工具残留和孤儿文件；不批量清空注释/日志 |
| backend-node/src/services/narrationVideoPostProcess.js | DELETE | OpenClaw 外部工具描述未被本应用加载且包含退役生成接口；两个孤儿文件无入口可达、无业务调用和测试依赖 | 高 | 批次8：删除工具残留和孤儿文件；不批量清空注释/日志 |
| frontweb/src/composables/filmCreate/libraryMembership.js | DELETE | OpenClaw 外部工具描述未被本应用加载且包含退役生成接口；两个孤儿文件无入口可达、无业务调用和测试依赖 | 高 | 批次8：删除工具残留和孤儿文件；不批量清空注释/日志 |


DELETE 的“高”只表示符合本次裁剪方向和引用证据，**不表示允许现在删除**。用户本轮要求审阅前不删，仍需等待审阅。测试只随其专属退役对象删除；retiredOfficialModels、volcOmniMultiReference、videoResumePoll、sceneQuadGridRoutes 等混合测试不在整文件删除清单，后续保留核心断言，失败先判断误删。

### 混合文件中的局部 DELETE 候选

162端点中具体25条DELETE已逐项列于盘点路由表。它们由前端按钮/批量工作流和后端处理器共同引用，是“用户明确退役功能”，不能谎称当前无调用。实施时同步最小剪除消费者，直到无悬空引用。

| 文件范围 | 最小裁剪边界 |
| --- | --- |
| backend-node/src/routes/index.js、agent.js、app.js | 厂商直连/助手/渠道注册和启动恢复；保留任务收敛与核心路由 |
| backend-node/src/services/aiClient.js、aiConfigService.js | 专属厂商参数、模型预设/渠道锁；保留通用文本、配置和本机TTS注册 |
| imageService.js、videoService.js、characters/scene/prop相关服务 | 只裁掉远程提交/轮询、平台资产认证；保留导入绑定/查删/本地处理 |
| frontweb/src/App.vue、router/index.js、AIConfigContent.vue | 移除Agent挂件、free-create路由、退役平台选项；保留文本和TTS配置 |
| FilmCreate.vue、DramaCanvas.vue、composables/useCanvas*、src/api/*.js | 仅退役直连生成消费者；保留分镜编辑、画布、查记录、首尾帧、导入和合成 |
| backend-node/src/routes/stub.js | 未挂载的假处理器有注册表和无消费者双证据，可局部删；唯一挂载空角色提取仍待确认 |
| README.md、AGENTS.md、docs/LOCAL_MAC.md、docs/UPSTREAM.md | 后续同步实际结构/入口/桌面状态，清理过期Cursor Cloud段落；不得删MIT和归因 |


## NEEDS-CONFIRM（保持原样，不与高置信删除捆绑）

| 路径/对象 | 类别 | 证据 | 置信度 | 待决定的处置 |
| --- | --- | --- | --- | --- |
| example_drama/衣服设计天才302.zip；/dramas/examples、/dramas/import-example | NEEDS-CONFIRM | 仍被首页/后端引用；仅LFS指针，正文未审核，涉及工程导入 | 不足/兼容边界 | 是否去掉示例入口与指针；真实工程ZIP导入/导出仍保留 |
| MediaLibrary.vue、assetService、/assets/*、assets表 | NEEDS-CONFIRM | 独立媒体库仍可直达；核心角色/场景/道具也有add-to-material-library调用 | 不足/兼容边界 | 保留通用归档库还是退役独立页面；无论如何不删表 |
| SceneModelMap.vue、sceneModelMap、ai_model_map | NEEDS-CONFIRM | 同时服务文本模型与旧图/视频映射；涉及现有持久化配置 | 不足/兼容边界 | 单一通用文本适配器是否还需要按场景选模型；未答前保留 |
| 旧厂商字段、旧pending任务、历史Take/导出内容 | NEEDS-CONFIRM | 历史工程兼容、恢复任务语义和保存来源可能受影响 | 不足/兼容边界 | 只列清单，任何表/列处理等新迁移确认；本轮0变更 |
| 项目截图/、frontweb/public/wx.jpg 与联系入口 | NEEDS-CONFIRM | 上游历史文档引用；有联系/付款二维码；运行UI也引用public/wx.jpg | 不足/兼容边界 | 是否整批退休历史截图与联系入口；先保留归因文档 |
| frontweb/public/style-thumbs 与风格预设 | NEEDS-CONFIRM | StylePickerButton实际引用；逐素材授权不明 | 不足/兼容边界 | 保留预览还是只保留文本风格选择；未答前不动 |
| CHANGELOG、docs/UPSTREAM_README、story/en/quickstart/configuration及历史plans | NEEDS-CONFIRM | 可能承载上游说明、历史引用与有效格式参考 | 不足/兼容边界 | 是否保留历史文档区；不以“无JS引用”判无用 |
| CODE_OF_CONDUCT、CONTRIBUTING、SECURITY、.github Issue/FUNDING | NEEDS-CONFIRM | GitHub自动发现，非应用入口图范围 | 不足/兼容边界 | 是否保留治理/赞助资料；无账号/商业化后端可据此误删 |
| root index.html；settings/language；重复GET分镜生成入口 | NEEDS-CONFIRM | 无明确退役决定，可能有外部消费者/历史书签 | 不足/兼容边界 | 是否缩减；未答前不删 |
| POST episodes/:episode_id/characters/extract 的stub方法 | NEEDS-CONFIRM | 仍注册、前端API仍声明，实际只返回空角色任务结果 | 不足/兼容边界 | 决定退役还是后续修复；本轮不新增实现 |
| desktop/scripts/initial-migrations 7份SQL归档位置 | NEEDS-CONFIRM | Electron移除与不得删迁移同时存在 | 不足/兼容边界 | 默认原地保留；是否日后单独归档，不阻塞其余代码退休 |


候选线索中实际不存在：ohos_hap、frontweb-edu、build_edu、deploy-pack、qudao/外发配置、.trae/.cursor/.opencode/.superpowers/.worktrees、参考前端、win-unpacked、release-icon-test*、backend-app-secure。只作为忽略规则或历史线索，删除计数为0；不会为清理旧规则而改写.gitignore。

## 后续固定批次（尚未执行）

| 批次 | 类别 | 整文件候选数 | 逻辑字节 | 同步工作 |
| --- | --- | --- | --- | --- |
| 1 | 配置/外发 | 11 | 285,925 | 删除整目录；先登记凭据字段，仅删除受版本管理文件 |
| 2 | 其他平台/变体 | 3 | 99,265,444 | 删除；保留 ffmpegPath 通用查找器、README 与目录占位 |
| 3 | Electron | 19 | 322,558 | 删除非 SQL 桌面代码/锁文件/打包配置；7 份迁移原地保留 |
| 4 | 前端退休界面 | 7 | 54,726 | 删除专属文件，并最小裁剪 App、路由和配置页引用；不是不可达页误判 |
| 5 | 后端适配器/助手 | 32 | 402,787 | 按接口清单同步裁剪调用方；混合测试保留有用断言，不整文件误删 |
| 6 | 无用依赖 | 0 | 0 | 更新后端 package.json/锁；不提前删除依赖 |
| 7 | 无关文档/素材 | 8 | 999,468 | 删除并检查剩余历史文档的悬空链接；保留 LICENSE 和 UPSTREAM |
| 8 | 死代码/工具残留 | 6 | 36,699 | 删除工具残留和孤儿文件；不批量清空注释/日志 |


顺序依赖：前端先移除退役消费者，后端后移除提交接口；依赖等代码与测试调用解除后再删。若单批无法保持全绿，停止该批并回滚该批，不扩大范围强行剪除。NEEDS-CONFIRM对象保持原样。每批经授权后独立提交 `chore(slim): <类别> - <概述>`，正文记录证据和验收。当前未提交。

## 每批验证与回滚

真实工作目录只执行测试/前端构建，前后指纹必须一致，不运行setup/start/stop。沙箱使用独立clone和npm ci；当前/tmp/muforge-sandbox保留，不删除。后续若需重新克隆，在不覆盖保留沙箱的前提下建立带批次后缀的新目录，或先按用户决定安排保留目录；不擅自清理。

沙箱每批完成后端/前端测试、构建、setup/start/status、health、本机制作/列表页面；图片/视频curl导入检查绑定/旧Take/来源、FFmpeg合成。端口先检测，不能覆盖5679的启动器不得抢占真实实例；用户若已重启真实实例则等待其自行停止。共享Qwen每批仅只读health/连通检测，禁止服务脚本和配置/模型/声线修改。所有本机启动通过外部防护preload阻止launcher意外调用共享service.sh。结束只stop沙箱记录的进程。

一次删除前真实配音已完成：audition_01、文本“现在开始测试本地配音。”、24.564秒、WAV pcm_s24le/48kHz/mono、2.48秒、357222字节、非静音，详见基线。阶段E不得重复；全部完成最终验收再一次同声线同文本，比较格式和时长，不要求字节一致。若某批实际触及TTS相关代码，先告知用户，按用户已给例外额外一次推理；失败不重试、保留错误并停止。

任何检查失败先保留日志与差异，立即回滚**该批代码**（按该批路径恢复/必要时revert该批提交），不reset整个工作树、不覆盖用户改动，不恢复/篡改真实用户数据。若真实指纹变化立即停止报告，不尝试自动“修复”。所有回滚保持pre-slim可追溯，不改历史、不推送。

## 密钥扫描摘要

完整263提交/全refs的gitleaks扫描有2处generic-api-key候选，均在历史 `desktop/backend-app-secure/src/app.js:1`、提交 `ececcdcb6b14f40b8d3fec42a38a2633593b4613`；当前路径不存在，有效性未确认。6份中转JSON各10个非空凭据字段；路径/行号/类型见盘点，未打印值、未联网验证。截图OCR含字段标签及第三方联系/付款二维码，未展示内容。工作树删除不会清除历史秘密；本轮不改历史。

## 本轮停止点与后续交付

A/B已经完成，等待用户审阅本草稿；不进入删除阶段。阶段G出片能力缺口、SLIM_REPORT最终删除/行数/依赖差异和README/AGENTS/LOCAL_MAC更新留到获准瘦身执行后；不把计划当作已完成结果，不在本轮顺手实现功能。

## 阶段 E 开始前追加核实（2026-10-27；零引用门禁待确认）

执行节奏以用户最新指令为准：高置信项依序连续执行，不逐批等待；只有无法解释的回滚后失败、NEEDS-CONFIRM、触及TTS需额外推理、新疑似密钥时停下询问。每批仍独立提交和隔离验证。前文“等待审阅/本轮不删”描述的是已完成的A/B阶段，已由本节授权覆盖。

### 1. 桌面迁移关系与完整性

`desktop/scripts/copy-backend.js:8,27–35` 先复制backend-node的22份迁移，再用desktop的7份按文件名覆盖/追加，桌面包最终23份。用原迁移执行器在沙箱目录内的两个独立内存空库比较：后端22份和桌面合并23份均生成23张迁移表，integrity_check=ok、foreign_key_check=0；local_media_imports由localProduction.ensureTables额外创建，不属于SQL迁移缺失。
| 桌面SQL | 后端对应关系 | 处置 |
| --- | --- | --- |
| desktop/scripts/initial-migrations/01_init.sql | 01_init版本不同；需结合后续迁移与ensureAllColumns比较 | 不删除；保留历史快照 |
| desktop/scripts/initial-migrations/02_add_default_model.sql | 去注释/空白后的SQL一致：02_add_default_model.sql | 不删除；保留历史快照 |
| desktop/scripts/initial-migrations/03_add_props_episode_id.sql | 字节一致：03_add_props_episode_id.sql | 不删除；保留历史快照 |
| desktop/scripts/initial-migrations/04_async_tasks_columns.sql | 字节一致：04_async_tasks_columns.sql | 不删除；保留历史快照 |
| desktop/scripts/initial-migrations/05_add_image_generations_columns.sql | 去注释/空白后的SQL一致：05_add_image_generations_completed_at.sql | 不删除；保留历史快照 |
| desktop/scripts/initial-migrations/06_add_characters_local_path.sql | 去注释/空白后的SQL一致：06_add_characters_local_path.sql | 不删除；保留历史快照 |
| desktop/scripts/initial-migrations/07_add_scenes_image_columns.sql | 去注释/空白后的SQL一致：07_add_scenes_image_columns.sql | 不删除；保留历史快照 |

01_init的差异最终仅造成character_libraries/scene_libraries/prop_libraries三表物理列序不同；最终字段集合、逐字段类型/默认值/约束、索引、外键一致。没有缺失的桌面独有表/列，无需为Mac链路移入额外可执行迁移，更不能用旧init覆盖新init。既有7份仍保留原位；本次Electron批次只删除非SQL，desktop目录不整目录删除。兼容格式与旧库均不改。

### 2. 全仓库与本机技能的25接口引用核实

使用rg全文检索（跟随技能符号链接）加AST消费者交叉核验，覆盖tracked/untracked/ignored源码、scripts、docs、openclaw-skill；排除真实受保护data/.local、Git对象与node_modules。本机覆盖下表技能/plugin目录，不查看对话历史、账号凭据、浏览器状态或无关用户文件。
| 本机/仓库检索根 | rg退出码 | 匹配行数 |
| --- | --- | --- |
| /Users/zhangxiaolong/Desktop/muforge | 0 | 154 |
| /Users/zhangxiaolong/.codex/skills | 0 | 55 |
| /Users/zhangxiaolong/.codex/plugins | 0 | 4 |
| /Users/zhangxiaolong/.claude/skills | 0 | 55 |
| /Users/zhangxiaolong/.claude/plugins | 0 | 102 |
| /Users/zhangxiaolong/.codex-shared/plugins | 0 | 4 |
| /Users/zhangxiaolong/.agents/skills | 0 | 67 |
| /Users/zhangxiaolong/.config/opencode/skills | 2 | 3 |
| /Users/zhangxiaolong/.openclaw/skills | 2 | 1 |
| /Users/zhangxiaolong/.openclaw/plugin-skills | 1 | 0 |
| /Users/zhangxiaolong/.openclaw/plugins | 1 | 0 |
| /Users/zhangxiaolong/.openclaw/skill-backups | 2 | 0 |

3个根的rg退出2均为共47个断开的符号链接（No such file or directory），非权限拒绝；不存在的目标无法检索，不伪称全机绝对零调用。符号链接不修复、不删除。宽路径/images、/videos在本机技能有177个候选位置（去重104文件），包含其他服务API和本地图片/视频目录，不能当作MuForge真实调用。未发现明确指向MuForge的本机技能调用证据，仍不以负面搜索证明全机零调用。

**当前不能确认零调用方：25接口中16个存在可达前端静态消费者，其余仍有API声明、Mastra工具、文档或schema引用。** 不把它们当死接口直接拔掉。用户要求三项核实完成后再删除，且确认25接口零调用方；这个全局前置条件目前不成立。此前将门禁自行后移到实际删接口前，是未经批准的解释，已撤回。第一批11文件已全部恢复，没有提交。此项归NEEDS-CONFIRM：需用户决定是否允许按对象删除前清零（先配置/平台，再清理消费者，最后接口/依赖），或要求首先清理全部调用方再启动既定删除批次。最新“连续执行”仅改变逐批等待节奏，不撤销该前置门禁。
| 拟删接口 | 可达前端调用点数 | 调用位置示例 | 仓库全文引用示例 | 外部宽匹配数 | 门禁 |
| --- | --- | --- | --- | --- | --- |
| POST /api/v1/ai-configs/jimeng2-list-assets | 1 | frontweb/src/components/AIConfigContent.vue:2099 | /Users/zhangxiaolong/Desktop/muforge/backend-node/src/routes/index.js:98；/Users/zhangxiaolong/Desktop/muforge/frontweb/src/api/ai.js:24 | 0 | 未清零；随退役消费者同步清理后复查 |
| POST /api/v1/ai-configs/model-ark-asset | 1 | frontweb/src/components/Sd2AssetManagement.vue:543 | /Users/zhangxiaolong/Desktop/muforge/backend-node/src/routes/index.js:99；/Users/zhangxiaolong/Desktop/muforge/frontweb/src/api/ai.js:28 | 0 | 未清零；随退役消费者同步清理后复查 |
| GET /api/v1/ai-configs/vendor-lock | 2 | frontweb/src/components/AIConfigContent.vue:2405；frontweb/src/views/FilmList.vue:793 | /Users/zhangxiaolong/Desktop/muforge/backend-node/src/routes/index.js:100；/Users/zhangxiaolong/Desktop/muforge/frontweb/src/api/ai.js:31 | 0 | 未清零；随退役消费者同步清理后复查 |
| PUT /api/v1/ai-configs/bulk-update-key | 1 | frontweb/src/components/AIConfigContent.vue:2070 | /Users/zhangxiaolong/Desktop/muforge/openclaw-skill/SKILL.md:540；/Users/zhangxiaolong/Desktop/muforge/backend-node/src/routes/index.js:101 | 0 | 未清零；随退役消费者同步清理后复查 |
| POST /api/v1/characters/batch-generate-images | 0 | — | /Users/zhangxiaolong/Desktop/muforge/backend-node/src/routes/index.js:167；/Users/zhangxiaolong/Desktop/muforge/frontweb/src/api/characters.js:14 | 0 | 未清零；随退役消费者同步清理后复查 |
| POST /api/v1/characters/:id/generate-image | 5 | frontweb/src/composables/filmCreate/useCharacters.js:342；frontweb/src/composables/useCanvasAssetGenerate.js:46 | /Users/zhangxiaolong/Desktop/muforge/backend-node/README.md:274；/Users/zhangxiaolong/Desktop/muforge/openclaw-skill/SKILL.md:197 | 0 | 未清零；随退役消费者同步清理后复查 |
| POST /api/v1/characters/:id/generate-four-view-image | 0 | — | /Users/zhangxiaolong/Desktop/muforge/openclaw-skill/SKILL.md:207；/Users/zhangxiaolong/Desktop/muforge/backend-node/src/routes/index.js:169 | 0 | 未清零；随退役消费者同步清理后复查 |
| POST /api/v1/characters/:id/sd2-certify | 1 | frontweb/src/composables/filmCreate/useCharacters.js:639 | /Users/zhangxiaolong/Desktop/muforge/backend-node/src/routes/index.js:176；/Users/zhangxiaolong/Desktop/muforge/frontweb/src/api/characters.js:48 | 0 | 未清零；随退役消费者同步清理后复查 |
| POST /api/v1/characters/:id/sd2-certify/refresh | 2 | frontweb/src/composables/filmCreate/useCharacters.js:646；frontweb/src/composables/filmCreate/useCharacters.js:664 | /Users/zhangxiaolong/Desktop/muforge/backend-node/src/routes/index.js:177；/Users/zhangxiaolong/Desktop/muforge/frontweb/src/api/characters.js:51 | 0 | 未清零；随退役消费者同步清理后复查 |
| POST /api/v1/characters/:id/sd2-voice-upload | 1 | frontweb/src/composables/filmCreate/useCharacters.js:752 | /Users/zhangxiaolong/Desktop/muforge/backend-node/src/routes/index.js:178；/Users/zhangxiaolong/Desktop/muforge/frontweb/src/api/characters.js:56 | 0 | 未清零；随退役消费者同步清理后复查 |
| POST /api/v1/characters/:id/sd2-voice-refresh | 1 | frontweb/src/composables/filmCreate/useCharacters.js:731 | /Users/zhangxiaolong/Desktop/muforge/backend-node/src/routes/index.js:179；/Users/zhangxiaolong/Desktop/muforge/frontweb/src/api/characters.js:61 | 0 | 未清零；随退役消费者同步清理后复查 |
| POST /api/v1/props/:id/generate | 10 | frontweb/src/composables/filmCreate/useProps.js:304；frontweb/src/composables/useCanvasAssetGenerate.js:50 | /Users/zhangxiaolong/Desktop/muforge/openclaw-skill/SKILL.md:271；/Users/zhangxiaolong/Desktop/muforge/backend-node/src/routes/index.js:188 | 0 | 未清零；随退役消费者同步清理后复查 |
| POST /api/v1/scenes/generate-image | 5 | frontweb/src/composables/filmCreate/useScenes.js:319；frontweb/src/composables/useCanvasAssetGenerate.js:48 | /Users/zhangxiaolong/Desktop/muforge/backend-node/test/sceneQuadGridRoutes.test.js:36；/Users/zhangxiaolong/Desktop/muforge/backend-node/src/routes/index.js:234 | 0 | 未清零；随退役消费者同步清理后复查 |
| POST /api/v1/scenes/:scene_id/generate-four-view-image | 0 | — | /Users/zhangxiaolong/Desktop/muforge/backend-node/src/routes/index.js:236；/Users/zhangxiaolong/Desktop/muforge/frontweb/src/api/scenes.js:41 | 0 | 未清零；随退役消费者同步清理后复查 |
| POST /api/v1/images | 10 | frontweb/src/composables/useCanvasWorkflowRunner.js:36；frontweb/src/views/DramaDetail.vue:605 | /Users/zhangxiaolong/Desktop/muforge/backend-node/README.md:235；/Users/zhangxiaolong/Desktop/muforge/backend-node/README.md:237 | 131 | 未清零；随退役消费者同步清理后复查 |
| POST /api/v1/images/episode/:episode_id/batch | 0 | — | /Users/zhangxiaolong/Desktop/muforge/openclaw-skill/SKILL.md:373；/Users/zhangxiaolong/Desktop/muforge/openclaw-skill/SKILL.md:676 | 0 | 未清零；随退役消费者同步清理后复查 |
| POST /api/v1/images/scene/:scene_id | 0 | — | /Users/zhangxiaolong/Desktop/muforge/backend-node/src/routes/index.js:247 | 0 | 未清零；随退役消费者同步清理后复查 |
| POST /api/v1/videos | 6 | frontweb/src/composables/useCanvasWorkflowRunner.js:60；frontweb/src/views/FilmCreate.vue:6565 | /Users/zhangxiaolong/Desktop/muforge/backend-node/README.md:244；/Users/zhangxiaolong/Desktop/muforge/backend-node/README.md:346 | 46 | 未清零；随退役消费者同步清理后复查 |
| POST /api/v1/videos/image/:image_gen_id | 0 | — | /Users/zhangxiaolong/Desktop/muforge/backend-node/src/routes/index.js:255 | 0 | 未清零；随退役消费者同步清理后复查 |
| POST /api/v1/videos/episode/:episode_id/batch | 0 | — | /Users/zhangxiaolong/Desktop/muforge/openclaw-skill/SKILL.md:405；/Users/zhangxiaolong/Desktop/muforge/openclaw-skill/SKILL.md:682 | 0 | 未清零；随退役消费者同步清理后复查 |
| POST /api/v1/videos/:id/resume-poll | 1 | frontweb/src/views/FilmCreate.vue:6613 | /Users/zhangxiaolong/Desktop/muforge/backend-node/src/routes/index.js:257；/Users/zhangxiaolong/Desktop/muforge/frontweb/src/api/videos.js:13 | 0 | 未清零；随退役消费者同步清理后复查 |
| POST /api/v1/agent/chat | 1 | frontweb/src/components/AgentDrawer.vue:171 | /Users/zhangxiaolong/Desktop/muforge/docs/superpowers/specs/2026-10-16-mastra-agent-design.md:131；/Users/zhangxiaolong/Desktop/muforge/docs/superpowers/specs/2026-10-16-mastra-agent-design.md:146 | 0 | 未清零；随退役消费者同步清理后复查 |
| POST /api/v1/agent/approve | 0 | — | /Users/zhangxiaolong/Desktop/muforge/docs/superpowers/specs/2026-10-16-mastra-agent-design.md:163；/Users/zhangxiaolong/Desktop/muforge/docs/superpowers/plans/2026-10-16-mastra-agent.md:559 | 0 | 未清零；随退役消费者同步清理后复查 |
| POST /api/v1/agent/decline | 0 | — | /Users/zhangxiaolong/Desktop/muforge/docs/superpowers/specs/2026-10-16-mastra-agent-design.md:163；/Users/zhangxiaolong/Desktop/muforge/docs/superpowers/plans/2026-10-16-mastra-agent.md:560 | 0 | 未清零；随退役消费者同步清理后复查 |
| GET /api/v1/agent/history | 1 | frontweb/src/components/AgentDrawer.vue:200 | /Users/zhangxiaolong/Desktop/muforge/docs/superpowers/specs/2026-10-16-mastra-agent-design.md:167；/Users/zhangxiaolong/Desktop/muforge/docs/superpowers/plans/2026-10-16-mastra-agent.md:561 | 0 | 未清零；随退役消费者同步清理后复查 |

完整路径/行号元数据（不含匹配内容）保存在本机 /var/folders/90/l9wxyby101xb8xvjw64v9cz00000gn/T/muforge-slim-e-preflight-r3rci6rn/endpoint-preflight.json。引用计数不是HTTP覆盖率，API声明和审计报告提及不算实际请求；动态路径不能只用完整字面URL检索。

### 3. 23项依赖逐项核实

这里的23项是“计划随功能退休移除的声明”，不是“当前未使用依赖”。后端6项仍被对应助手/厂商源码导入，desktop17项仍被桌面动态后端、脚本、配置或原生打包使用；不能先删依赖。对每项复查源码import/require、package scripts、electron-builder配置、copy-backend动态加载与native rebuild。
| 包目录 | 声明 | 现有用途/证据 | 脚本/原生核对 | 允许移除的前提 |
| --- | --- | --- | --- | --- |
| backend-node | @mastra/core | backend-node/src/mastra/index.mjs:6；backend-node/src/mastra/index.mjs:7 | 源码/动态后端用途 | 专属源码/测试和动态调用清零后 |
| backend-node | @mastra/libsql | backend-node/src/mastra/index.mjs:10 | 原生/构建相关，不能当纯JS孤儿 | 专属源码/测试和动态调用清零后 |
| backend-node | @mastra/memory | backend-node/src/mastra/index.mjs:11 | 源码/动态后端用途 | 专属源码/测试和动态调用清零后 |
| backend-node | @volcengine/openapi | backend-node/src/services/modelArkAssetProxyService.js:4 | 源码/动态后端用途 | 专属源码/测试和动态调用清零后 |
| backend-node | jsonwebtoken | backend-node/src/services/klingJwt.js:9 | 源码/动态后端用途 | 专属源码/测试和动态调用清零后 |
| backend-node | zod | backend-node/src/mastra/index.mjs:5 | 源码/动态后端用途 | 专属源码/测试和动态调用清零后 |
| desktop | @mastra/core | main.js:219–230 动态运行复制后端；copy-backend.js:8 复制源码 | 源码/动态后端用途 | desktop代码与打包入口移除后 |
| desktop | @mastra/libsql | main.js:219–230 动态运行复制后端；copy-backend.js:8 复制源码；package.json asarUnpack/native打包依赖 | 原生/构建相关，不能当纯JS孤儿 | desktop代码与打包入口移除后 |
| desktop | @mastra/memory | main.js:219–230 动态运行复制后端；copy-backend.js:8 复制源码 | 源码/动态后端用途 | desktop代码与打包入口移除后 |
| desktop | @volcengine/openapi | main.js:219–230 动态运行复制后端；copy-backend.js:8 复制源码 | 源码/动态后端用途 | desktop代码与打包入口移除后 |
| desktop | adm-zip | main.js:219–230 动态运行复制后端；copy-backend.js:8 复制源码 | 源码/动态后端用途 | desktop代码与打包入口移除后 |
| desktop | better-sqlite3 | main.js:219–230 动态运行复制后端；copy-backend.js:8 复制源码；package.json asarUnpack/native打包依赖 | 原生/构建相关，不能当纯JS孤儿 | desktop代码与打包入口移除后 |
| desktop | cors | main.js:219–230 动态运行复制后端；copy-backend.js:8 复制源码 | 源码/动态后端用途 | desktop代码与打包入口移除后 |
| desktop | express | main.js:219–230 动态运行复制后端；copy-backend.js:8 复制源码 | 源码/动态后端用途 | desktop代码与打包入口移除后 |
| desktop | js-yaml | main.js:219–230 动态运行复制后端；copy-backend.js:8 复制源码；desktop/main.js:83 直接读取配置 | 源码/动态后端用途 | desktop代码与打包入口移除后 |
| desktop | jsonrepair | main.js:219–230 动态运行复制后端；copy-backend.js:8 复制源码 | 源码/动态后端用途 | desktop代码与打包入口移除后 |
| desktop | jsonwebtoken | main.js:219–230 动态运行复制后端；copy-backend.js:8 复制源码 | 源码/动态后端用途 | desktop代码与打包入口移除后 |
| desktop | multer | main.js:219–230 动态运行复制后端；copy-backend.js:8 复制源码 | 源码/动态后端用途 | desktop代码与打包入口移除后 |
| desktop | sharp | main.js:219–230 动态运行复制后端；copy-backend.js:8 复制源码；package.json asarUnpack/native打包依赖 | 原生/构建相关，不能当纯JS孤儿 | desktop代码与打包入口移除后 |
| desktop | uuid | main.js:219–230 动态运行复制后端；copy-backend.js:8 复制源码 | 源码/动态后端用途 | desktop代码与打包入口移除后 |
| desktop | zod | main.js:219–230 动态运行复制后端；copy-backend.js:8 复制源码 | 源码/动态后端用途 | desktop代码与打包入口移除后 |
| desktop | electron | desktop/main.js:1,267；scripts start/pack/dist；Electron下载/启动 | 原生/构建相关，不能当纯JS孤儿 | desktop代码与打包入口移除后 |
| desktop | electron-builder | desktop/package.json pack/dist/postinstall；install-app-deps重建native | 原生/构建相关，不能当纯JS孤儿 | desktop代码与打包入口移除后 |

desktop/package.json启用postinstall copy-backend与electron-builder install-app-deps，并对better-sqlite3/sharp/@img/@libsql解包；不能因desktop/node_modules未安装就判断依赖无用。后端保留better-sqlite3、sharp及其锁定原生依赖；不把桌面打包所用版本移植到后端。后端6项的锁文件减法在源码清理完成后以npm更新，再由独立npm ci验证。

### 已按用户条件收紧的待确认项
| 对象 | 只读证明 | 当前处置 |
| --- | --- | --- |
| example_drama/衣服设计天才302.zip | 唯一受版本管理示例文件；caea265已包含，上游来源。当前只有133字节LFS指针，82,156,132字节正文未下载；没有逐案例授权证据；MIT源码许可不代表独立素材授权 | 不删除、不下载；没有发现自制示例文件 |
| 通用媒体库 | localProductionService.js:91–103只写local_media_imports/image_generations/video_generations并绑定storyboards；不导入assetService，不读写assets。三类add-to-material-library另依赖assetService | 导入/绑定/多Take本身不依赖通用assets；其他已保留归档入口仍依赖，保留通用库及页面/API/表 |
| 历史截图 | 以后只按实际README/docs引用裁剪；审计清单本身提及不算产品引用 | 有引用的保留；无引用且无动态/运行调用的才可删 |
| 风格素材 | StylePickerButton/styleOptions存在动态缩略图引用；只查文件名会漏判 | 有任何运行/文档/样式/动态引用的保留；本轮无充分证明的无用素材不删 |
| 兼容格式 | 旧厂商字段、Take、universal分段和ZIP导入导出仍可能存在持久化数据 | 保持原样，0表/列/迁移删除 |


### 首批尝试、回滚与当前状态

首批曾尝试删除11个中转配置/截图/说明文件（285,925字节）；所有真实/沙箱测试、构建、setup/start/status、health、3次curl导入、多Take/绑定/SHA来源、FFmpeg合成/解码均通过。真实data/.local前后指纹一致，共享Qwen仅只读检测，无真实推理。

浏览器项目列表验收脚本以body包含“项目列表”为断言而失败，按约束立即恢复11文件并停止沙箱。诊断发现document.title实际为“项目列表 - MuForge”，页面已挂载、显示“幕匠MuForge/快速开始/SLIM sandbox smoke”，没有Vite错误遮罩；原因是验收脚本把标题文案当成正文文案，不是已证实的应用回归。没有据此把本批算作通过。

并行复核另指出全局零引用前置条件被后移，已撤回这一解释并记录NEEDS-CONFIRM。在用户明确门禁顺序之前，不重做删除、不提交后续批次。不涉及TTS源码；无新增疑似密钥。本次没有任何有效删除/依赖/路由/表变化。

保留原基线沙箱/tmp/muforge-sandbox及首批尝试沙箱/tmp/muforge-sandbox-e1（均已停止），由用户决定以后是否删除。完整本机验证日志位于 /var/folders/90/l9wxyby101xb8xvjw64v9cz00000gn/T/muforge-slim-e-preflight-r3rci6rn/batch1。

## 门禁顺序获准更新（用户最新授权）

用户明确批准：先删无运行依赖的配置/平台文件，再按功能单元退休调用方，各接口和依赖在删除前核实零引用；连续执行，不逐批询问。此前全局零引用NEEDS-CONFIRM已解除。仍保留TTS/新密钥/真正待确认范围及无法解释的验证失败停止条件。以下执行记录覆盖旧的暂停说明。16个有调用接口将按“出片链路则保留”的新要求重新分类，不为满足旧25接口/23依赖估算而删除。

执行记录：批次 1b（中转凭据配置）隔离验证全部通过，详见SLIM_REPORT有效批次。第一批曾回滚的门禁问题现已有用户明确授权，不再阻塞。TTS共用配置代码修改及该批额外一次真实推理也已另获明确批准。

执行记录：批次 2（Windows平台与外部工具残留）隔离验证全部通过，详见SLIM_REPORT有效批次。第一批曾回滚的门禁问题现已有用户明确授权，不再阻塞。TTS共用配置代码修改及该批额外一次真实推理也已另获明确批准。

Electron批次细化：7份SQL原样移动至backend-node/migrations/archive/desktop-initial/，顶层22份正式迁移不改且归档不执行。desktop/.gitignore按硬约束10保留，因此不承诺目录字面消失；删除其余桌面源/打包/发布工作流。只移除agent测试中针对退役copy-backend脚本的2行断言，其余skill断言保留至助手功能单元退役。

执行记录：批次 3（Electron退休与历史迁移归档）隔离验证全部通过，详见SLIM_REPORT有效批次。第一批曾回滚的门禁问题现已有用户明确授权，不再阻塞。TTS共用配置代码修改及该批额外一次真实推理也已另获明确批准。

执行记录：批次 4b（Mastra工具型助手功能单元）隔离验证全部通过，详见SLIM_REPORT有效批次。第一批曾回滚的门禁问题现已有用户明确授权，不再阻塞。TTS共用配置代码修改及该批额外一次真实推理也已另获明确批准。

## 16个有调用接口的最终处置依据

用户要求按功能是否属于出片链路判断，取代原25条全删估算。以下6条保留，因此imageClient/videoClient/klingJwt等当前仍被核心调用的实现、测试与依赖不能当死代码删除。没有新写接口或把生成请求伪装成import；生产image_gen/Kling MCP仍通过既有导入链路。

| 接口 | 处置 | 理由 |
| --- | --- | --- |
| POST /api/v1/ai-configs/jimeng2-list-assets | DELETE-UNIT | 平台认证/渠道锁或内置工具型助手，非唯一生产链路必需 |
| POST /api/v1/ai-configs/model-ark-asset | DELETE-UNIT | 平台认证/渠道锁或内置工具型助手，非唯一生产链路必需 |
| GET /api/v1/ai-configs/vendor-lock | DELETE-UNIT | 平台认证/渠道锁或内置工具型助手，非唯一生产链路必需 |
| PUT /api/v1/ai-configs/bulk-update-key | DELETE-UNIT | 平台认证/渠道锁或内置工具型助手，非唯一生产链路必需 |
| POST /api/v1/characters/:id/generate-image | KEEP-CORE | 角色资产制作，列表/画布/创作页仍调用 |
| POST /api/v1/characters/:id/sd2-certify | DELETE-UNIT | 平台认证/渠道锁或内置工具型助手，非唯一生产链路必需 |
| POST /api/v1/characters/:id/sd2-certify/refresh | DELETE-UNIT | 平台认证/渠道锁或内置工具型助手，非唯一生产链路必需 |
| POST /api/v1/characters/:id/sd2-voice-upload | DELETE-UNIT | 平台认证/渠道锁或内置工具型助手，非唯一生产链路必需 |
| POST /api/v1/characters/:id/sd2-voice-refresh | DELETE-UNIT | 平台认证/渠道锁或内置工具型助手，非唯一生产链路必需 |
| POST /api/v1/props/:id/generate | KEEP-CORE | 道具资产制作，核心页面仍调用 |
| POST /api/v1/scenes/generate-image | KEEP-CORE | 场景资产制作，核心页面仍调用 |
| POST /api/v1/images | KEEP-CORE | 分镜与首尾帧素材/画布流程仍调用 |
| POST /api/v1/videos | KEEP-CORE | 分镜视频与画布流程仍调用 |
| POST /api/v1/videos/:id/resume-poll | KEEP-CORE | 已有视频任务恢复入口与兼容性 |
| POST /api/v1/agent/chat | DELETE-UNIT | 平台认证/渠道锁或内置工具型助手，非唯一生产链路必需 |
| GET /api/v1/agent/history | DELETE-UNIT | 平台认证/渠道锁或内置工具型助手，非唯一生产链路必需 |

执行记录：批次 5（渠道锁与远端SD2认证功能单元）隔离验证全部通过，详见SLIM_REPORT有效批次。第一批曾回滚的门禁问题现已有用户明确授权，不再阻塞。TTS共用配置代码修改及该批额外一次真实推理也已另获明确批准。

执行记录：批次 6（零保留调用的七个旧接口）隔离验证全部通过，详见SLIM_REPORT有效批次。第一批曾回滚的门禁问题现已有用户明确授权，不再阻塞。TTS共用配置代码修改及该批额外一次真实推理也已另获明确批准。
