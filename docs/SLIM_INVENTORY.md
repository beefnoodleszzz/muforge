# MuForge 只读盘点（阶段 B）

基准：`pre-slim` / `79a1f48`。本文件记录当前实现，不代表已经删除。共解析 220 个 JS/MJS/Vue 文件，解析失败 0；AST 引用图加 `rg` 交叉检查，并人工核对路由挂载、动态 require、配置加载、桌面入口。没有运行 depcheck/knip，也不把静态无命中视为充分删除证据。

## B1 顶层逐项

| 路径 | 基线实际占用 KiB | 用途/链路 |
| --- | --- | --- |
| .git | 86680 | 历史与版本对象；保留，删除工作树文件不会缩小历史包 |
| .gitattributes | 4 | Git LFS 与文本属性；示例 ZIP 是指针，保留兼容 |
| .github | 24 | Issue/赞助/桌面发布；只退役 Electron release 工作流，其余待确认 |
| .gitignore | 4 | 保护数据与产物；本轮不改，后续不删除规则 |
| .local | 272 | 真实运行日志/PID，受保护，不读内容、不修改 |
| AGENTS.md | 4 | 工作约定；后续纠正过期 Cursor Cloud、桌面与文本助手说明 |
| CHANGELOG.md | 44 | 上游历史变更；不是运行依赖，归因/历史保留待确认 |
| CODE_OF_CONDUCT.md | 4 | 社区治理，GitHub 自动发现；不是静态死代码 |
| CONTRIBUTING.md | 4 | 协作指引；保留/缩减待确认 |
| LICENSE | 4 | MIT 原版权，硬性保留 |
| README.md | 4 | 当前本机入口；后续按实际瘦身更新 |
| SECURITY.md | 4 | 安全上报规则，GitHub 自动发现；待确认 |
| backend-node | 325452 | Express/SQLite、数据模型、通用文本、导入/TTS/合成核心与旧适配器混合 |
| desktop | 396 | Electron 及打包文件；移除非 SQL 文件，保留 7 份迁移 |
| docs | 1136 | 本机文档、归因、上游历史与退役方案；分类见计划 |
| example_drama | 4 | 上游示例 ZIP 的 LFS 指针；首页和导入 API 仍引用 |
| frontweb | 139984 | Vue 界面、列表/画布/本机制作与退役厂商/助手界面混合 |
| index.html | 4 | 根级历史静态页面；Vite 使用 frontweb/index.html，外部书签用途不足，待确认 |
| openclaw-skill | 32 | 上游 OpenClaw 接入说明、工具 schema；当前应用未加载 |
| run_dev.bat | 4 | Windows 开发启动入口，退役 |
| run_dev.ps1 | 4 | Windows 开发启动入口，退役 |
| scripts | 8 | Mac setup/start/status/stop 保留 |
| tasks | 8 | 前次配置验收进度，包含旧推送授权描述；当前任务明确禁止推送 |
| 停止幕匠.command | 4 | 本机停止入口，保留 |
| 各大平台中转站配置 | 308 | 上游人工导入的中转商配置/截图/说明，退役 |
| 启动幕匠.command | 4 | 本机启动入口，保留 |
| 项目截图 | 7016 | 上游历史截图/联系及付款图，运行图与授权逐项待确认 |


## B2 后端：全部 API 路由

共 **162** 个 `/api/v1/*` 注册项：KEEP-CORE 119、DELETE 候选 25、NEEDS-CONFIRM 18。静态发现 116 个有可达前端消费者，沙箱日志实际观察 13 个；这不是 116 个已通过 HTTP 测试。无前端消费者不等于无外部消费者。`routes/index.js` 统一注册，`localProduction.js` 子路由挂载；没有目录扫描自动注册。`/health`、静态资源和 SPA fallback 在此计数之外。

“测试”栏：沙箱 HTTP = 基线真实请求；模块测试仅证明该处理器模块被测试引用，不保证此端点每个分支都覆盖；— = 未找到直接证据。完整前端静态消费者和行号保存在本机审计 JSON。

| 端点 | 注册位置/处理器 | 前端消费者 | 测试证据 | 链路分类 |
| --- | --- | --- | --- | --- |
| GET /api/v1/dramas | drama.listDramas @ backend-node/src/routes/index.js:53 | `frontweb/src/views/FilmCreate.vue:5050` 等 | 沙箱 HTTP； | KEEP-CORE |
| POST /api/v1/dramas | drama.createDrama @ backend-node/src/routes/index.js:54 | `frontweb/src/composables/useStoryGeneration.js:46` 等 | 沙箱 HTTP； | KEEP-CORE |
| GET /api/v1/dramas/stats | drama.getDramaStats @ backend-node/src/routes/index.js:55 | 未发现静态调用 | — | KEEP-CORE |
| GET /api/v1/dramas/:id/export | drama.exportDrama @ backend-node/src/routes/index.js:57 | 仅 API 声明 `frontweb/src/api/drama.js:62` | — | KEEP-CORE |
| POST /api/v1/dramas/import | drama.importDrama @ backend-node/src/routes/index.js:60 | `frontweb/src/views/FilmList.vue:759` | — | KEEP-CORE |
| POST /api/v1/dramas/import-novel | inline @ backend-node/src/routes/index.js:61 | 未发现静态调用 | — | KEEP-CORE |
| GET /api/v1/dramas/examples | drama.listExamples @ backend-node/src/routes/index.js:81 | `frontweb/src/views/FilmList.vue:606` | 沙箱 HTTP； | NEEDS-CONFIRM |
| POST /api/v1/dramas/import-example | drama.importExample @ backend-node/src/routes/index.js:82 | `frontweb/src/views/FilmList.vue:614` | — | NEEDS-CONFIRM |
| PUT /api/v1/dramas/:id/outline | drama.saveOutline @ backend-node/src/routes/index.js:83 | `frontweb/src/views/DramaDetail.vue:905` 等 | — | KEEP-CORE |
| GET /api/v1/dramas/:id/characters | drama.getCharacters @ backend-node/src/routes/index.js:84 | 未发现静态调用 | — | KEEP-CORE |
| PUT /api/v1/dramas/:id/characters | drama.saveCharacters @ backend-node/src/routes/index.js:85 | `frontweb/src/composables/filmCreate/useCharacters.js:239` 等 | — | KEEP-CORE |
| PUT /api/v1/dramas/:id/episodes | drama.saveEpisodes @ backend-node/src/routes/index.js:86 | `frontweb/src/composables/useCanvasCrud.js:139` 等 | 沙箱 HTTP； | KEEP-CORE |
| PUT /api/v1/dramas/:id/progress | drama.saveProgress @ backend-node/src/routes/index.js:87 | 仅 API 声明 `frontweb/src/api/drama.js:30` | — | KEEP-CORE |
| PUT /api/v1/dramas/:id/canvas-layout | drama.saveCanvasLayout @ backend-node/src/routes/index.js:88 | `frontweb/src/views/DramaCanvas.vue:565` | — | KEEP-CORE |
| GET /api/v1/dramas/:id/props | drama.listProps @ backend-node/src/routes/index.js:89 | `frontweb/src/composables/filmCreate/useProps.js:370` | — | KEEP-CORE |
| GET /api/v1/dramas/:id | drama.getDrama @ backend-node/src/routes/index.js:90 | `frontweb/src/views/DramaCanvas.vue:708` 等 | 沙箱 HTTP； | KEEP-CORE |
| PUT /api/v1/dramas/:id | drama.updateDrama @ backend-node/src/routes/index.js:91 | `frontweb/src/views/DramaDetail.vue:904` 等 | — | KEEP-CORE |
| DELETE /api/v1/dramas/:id | drama.deleteDrama @ backend-node/src/routes/index.js:92 | `frontweb/src/views/FilmList.vue:781` | — | KEEP-CORE |
| GET /api/v1/ai-configs | aiConfig.list @ backend-node/src/routes/index.js:95 | `frontweb/src/components/AIConfigContent.vue:1870` 等 | — | KEEP-CORE |
| POST /api/v1/ai-configs | aiConfig.create @ backend-node/src/routes/index.js:96 | `frontweb/src/components/AIConfigContent.vue:2048` 等 | — | KEEP-CORE |
| POST /api/v1/ai-configs/test | aiConfig.testConnection @ backend-node/src/routes/index.js:97 | `frontweb/src/components/AIConfigContent.vue:2143` | — | KEEP-CORE |
| POST /api/v1/ai-configs/jimeng2-list-assets | aiConfig.listJimeng2MaterialAssets @ backend-node/src/routes/index.js:98 | `frontweb/src/components/AIConfigContent.vue:2099` | — | DELETE |
| POST /api/v1/ai-configs/model-ark-asset | aiConfig.modelArkAsset @ backend-node/src/routes/index.js:99 | `frontweb/src/components/Sd2AssetManagement.vue:543` | — | DELETE |
| GET /api/v1/ai-configs/vendor-lock | aiConfig.vendorLock @ backend-node/src/routes/index.js:100 | `frontweb/src/components/AIConfigContent.vue:2405` 等 | 沙箱 HTTP； | DELETE |
| PUT /api/v1/ai-configs/bulk-update-key | aiConfig.bulkUpdateKey @ backend-node/src/routes/index.js:101 | `frontweb/src/components/AIConfigContent.vue:2070` | — | DELETE |
| GET /api/v1/ai-configs/:id | aiConfig.get @ backend-node/src/routes/index.js:102 | 仅 API 声明 `frontweb/src/api/ai.js:8` | 沙箱 HTTP； | KEEP-CORE |
| PUT /api/v1/ai-configs/:id | aiConfig.update @ backend-node/src/routes/index.js:103 | `frontweb/src/components/AIConfigContent.vue:2045` 等 | — | KEEP-CORE |
| DELETE /api/v1/ai-configs/:id | aiConfig.delete @ backend-node/src/routes/index.js:104 | `frontweb/src/components/AIConfigContent.vue:2164` 等 | — | KEEP-CORE |
| POST /api/v1/generation/characters | inline @ backend-node/src/routes/index.js:107 | `frontweb/src/composables/filmCreate/useCharacters.js:118` 等 | — | KEEP-CORE |
| POST /api/v1/generation/story | inline @ backend-node/src/routes/index.js:123 | `frontweb/src/composables/useStoryGeneration.js:77` | — | KEEP-CORE |
| GET /api/v1/character-library | charLibrary.list @ backend-node/src/routes/index.js:143 | `frontweb/src/composables/filmCreate/useCharacters.js:374` 等 | — | KEEP-CORE |
| POST /api/v1/character-library | charLibrary.create @ backend-node/src/routes/index.js:144 | `frontweb/src/views/DramaDetail.vue:1134` | — | KEEP-CORE |
| GET /api/v1/character-library/:id | charLibrary.get @ backend-node/src/routes/index.js:145 | 仅 API 声明 `frontweb/src/api/characterLibrary.js:8` | — | KEEP-CORE |
| PUT /api/v1/character-library/:id | charLibrary.update @ backend-node/src/routes/index.js:146 | `frontweb/src/composables/filmCreate/useCharacters.js:476` 等 | — | KEEP-CORE |
| DELETE /api/v1/character-library/:id | charLibrary.delete @ backend-node/src/routes/index.js:147 | `frontweb/src/composables/filmCreate/useCharacters.js:499` 等 | — | KEEP-CORE |
| GET /api/v1/scene-library | sceneLibrary.list @ backend-node/src/routes/index.js:150 | `frontweb/src/composables/filmCreate/useScenes.js:356` 等 | — | KEEP-CORE |
| POST /api/v1/scene-library | sceneLibrary.create @ backend-node/src/routes/index.js:151 | `frontweb/src/views/DramaDetail.vue:1146` | — | KEEP-CORE |
| GET /api/v1/scene-library/:id | sceneLibrary.get @ backend-node/src/routes/index.js:152 | 仅 API 声明 `frontweb/src/api/sceneLibrary.js:8` | — | KEEP-CORE |
| PUT /api/v1/scene-library/:id | sceneLibrary.update @ backend-node/src/routes/index.js:153 | `frontweb/src/composables/filmCreate/useScenes.js:460` 等 | — | KEEP-CORE |
| DELETE /api/v1/scene-library/:id | sceneLibrary.delete @ backend-node/src/routes/index.js:154 | `frontweb/src/composables/filmCreate/useScenes.js:485` 等 | — | KEEP-CORE |
| GET /api/v1/prop-library | propLibrary.list @ backend-node/src/routes/index.js:157 | `frontweb/src/composables/filmCreate/useProps.js:336` 等 | — | KEEP-CORE |
| POST /api/v1/prop-library | propLibrary.create @ backend-node/src/routes/index.js:158 | `frontweb/src/views/DramaDetail.vue:1160` | — | KEEP-CORE |
| GET /api/v1/prop-library/:id | propLibrary.get @ backend-node/src/routes/index.js:159 | 仅 API 声明 `frontweb/src/api/propLibrary.js:8` | — | KEEP-CORE |
| PUT /api/v1/prop-library/:id | propLibrary.update @ backend-node/src/routes/index.js:160 | `frontweb/src/composables/filmCreate/useProps.js:439` 等 | — | KEEP-CORE |
| DELETE /api/v1/prop-library/:id | propLibrary.delete @ backend-node/src/routes/index.js:161 | `frontweb/src/composables/filmCreate/useProps.js:462` 等 | — | KEEP-CORE |
| GET /api/v1/characters/:id | characters.getOne @ backend-node/src/routes/index.js:164 | `frontweb/src/composables/filmCreate/useCharacters.js:178` 等 | — | KEEP-CORE |
| PUT /api/v1/characters/:id | characters.update @ backend-node/src/routes/index.js:165 | `frontweb/src/components/dramaCanvas/CanvasAssetPanel.vue:217` 等 | — | KEEP-CORE |
| DELETE /api/v1/characters/:id | characters.delete @ backend-node/src/routes/index.js:166 | `frontweb/src/components/dramaCanvas/CanvasAssetPanel.vue:265` 等 | — | KEEP-CORE |
| POST /api/v1/characters/batch-generate-images | characters.batchGenerateImages @ backend-node/src/routes/index.js:167 | 仅 API 声明 `frontweb/src/api/characters.js:14` | — | DELETE |
| POST /api/v1/characters/:id/generate-image | characters.generateImage @ backend-node/src/routes/index.js:168 | `frontweb/src/composables/filmCreate/useCharacters.js:342` 等 | — | DELETE |
| POST /api/v1/characters/:id/generate-four-view-image | characters.generateFourViewImage @ backend-node/src/routes/index.js:169 | 未发现静态调用 | — | DELETE |
| POST /api/v1/characters/:id/generate-prompt | characters.generatePrompt @ backend-node/src/routes/index.js:170 | `frontweb/src/composables/filmCreate/useCharacters.js:270` | — | KEEP-CORE |
| POST /api/v1/characters/:id/upload-image | characters.uploadImage @ backend-node/src/routes/index.js:171 | 未发现静态调用 | — | KEEP-CORE |
| PUT /api/v1/characters/:id/image | characters.putImage @ backend-node/src/routes/index.js:172 | `frontweb/src/views/DramaDetail.vue:673` 等 | — | KEEP-CORE |
| PUT /api/v1/characters/:id/image-from-library | characters.imageFromLibrary @ backend-node/src/routes/index.js:173 | 未发现静态调用 | — | KEEP-CORE |
| POST /api/v1/characters/:id/add-to-library | characters.addToLibrary @ backend-node/src/routes/index.js:174 | `frontweb/src/composables/filmCreate/useCharacters.js:512` | — | KEEP-CORE |
| POST /api/v1/characters/:id/add-to-material-library | characters.addToMaterialLibrary @ backend-node/src/routes/index.js:175 | `frontweb/src/composables/filmCreate/useCharacters.js:526` | — | KEEP-CORE |
| POST /api/v1/characters/:id/sd2-certify | characters.sd2Certify @ backend-node/src/routes/index.js:176 | `frontweb/src/composables/filmCreate/useCharacters.js:639` | — | DELETE |
| POST /api/v1/characters/:id/sd2-certify/refresh | characters.sd2CertifyRefresh @ backend-node/src/routes/index.js:177 | `frontweb/src/composables/filmCreate/useCharacters.js:646` 等 | — | DELETE |
| POST /api/v1/characters/:id/sd2-voice-upload | characters.sd2VoiceUpload @ backend-node/src/routes/index.js:178 | `frontweb/src/composables/filmCreate/useCharacters.js:752` | — | DELETE |
| POST /api/v1/characters/:id/sd2-voice-refresh | characters.sd2VoiceRefresh @ backend-node/src/routes/index.js:179 | `frontweb/src/composables/filmCreate/useCharacters.js:731` | — | DELETE |
| POST /api/v1/characters/:id/extract-from-image | characters.extractFromImage @ backend-node/src/routes/index.js:180 | `frontweb/src/composables/filmCreate/useCharacters.js:288` | — | KEEP-CORE |
| POST /api/v1/characters/:id/extract-anchors | characters.extractAnchors @ backend-node/src/routes/index.js:181 | `frontweb/src/composables/filmCreate/useCharacters.js:603` | — | KEEP-CORE |
| GET /api/v1/props/:id | prop.getPropById @ backend-node/src/routes/index.js:184 | `frontweb/src/composables/filmCreate/useProps.js:152` | — | KEEP-CORE |
| POST /api/v1/props | prop.createProp @ backend-node/src/routes/index.js:185 | `frontweb/src/composables/filmCreate/useProps.js:256` 等 | — | KEEP-CORE |
| PUT /api/v1/props/:id | prop.updateProp @ backend-node/src/routes/index.js:186 | `frontweb/src/components/dramaCanvas/CanvasAssetPanel.vue:238` 等 | — | KEEP-CORE |
| DELETE /api/v1/props/:id | prop.deleteProp @ backend-node/src/routes/index.js:187 | `frontweb/src/components/dramaCanvas/CanvasAssetPanel.vue:269` 等 | — | KEEP-CORE |
| POST /api/v1/props/:id/generate | prop.generateImage @ backend-node/src/routes/index.js:188 | `frontweb/src/composables/filmCreate/useProps.js:304` 等 | — | DELETE |
| POST /api/v1/props/:id/generate-prompt | prop.generatePropPrompt @ backend-node/src/routes/index.js:189 | `frontweb/src/composables/filmCreate/useProps.js:175` | — | KEEP-CORE |
| POST /api/v1/props/:id/add-to-library | prop.addToLibrary @ backend-node/src/routes/index.js:190 | `frontweb/src/composables/filmCreate/useProps.js:475` | — | KEEP-CORE |
| POST /api/v1/props/:id/add-to-material-library | prop.addToMaterialLibrary @ backend-node/src/routes/index.js:191 | `frontweb/src/composables/filmCreate/useProps.js:489` | — | KEEP-CORE |
| POST /api/v1/props/:id/extract-from-image | prop.extractPropFromImage @ backend-node/src/routes/index.js:192 | `frontweb/src/composables/filmCreate/useProps.js:218` | — | KEEP-CORE |
| POST /api/v1/extract-description-from-image | inline @ backend-node/src/routes/index.js:195 | `frontweb/src/composables/filmCreate/useProps.js:558` 等 | — | KEEP-CORE |
| POST /api/v1/upload/image | uploadHandlers.uploadImage @ backend-node/src/routes/index.js:211 | `frontweb/src/composables/filmCreate/useCharacters.js:203` 等 | — | KEEP-CORE |
| POST /api/v1/episodes/:episode_id/storyboards | drama.generateStoryboard @ backend-node/src/routes/index.js:216 | `frontweb/src/composables/useCanvasEpisodeGenerate.js:128` 等 | — | KEEP-CORE |
| POST /api/v1/episodes/:episode_id/props/extract | prop.extractProps @ backend-node/src/routes/index.js:217 | `frontweb/src/composables/filmCreate/useProps.js:111` 等 | — | KEEP-CORE |
| POST /api/v1/episodes/:episode_id/characters/extract | stub.episodeCharactersExtract @ backend-node/src/routes/index.js:218 | 仅 API 声明 `frontweb/src/api/drama.js:59` | — | NEEDS-CONFIRM |
| GET /api/v1/episodes/:episode_id/storyboards | storyboards.episodeStoryboardsGet @ backend-node/src/routes/index.js:219 | `frontweb/src/views/FilmCreate.vue:6726` | — | KEEP-CORE |
| POST /api/v1/episodes/:episode_id/finalize | drama.finalizeEpisode @ backend-node/src/routes/index.js:220 | `frontweb/src/views/FilmCreate.vue:7094` 等 | 沙箱 HTTP； | KEEP-CORE |
| GET /api/v1/episodes/:episode_id/download | drama.downloadEpisodeVideo @ backend-node/src/routes/index.js:221 | 未发现静态调用 | — | KEEP-CORE |
| GET /api/v1/tasks/:task_id | task.getTaskStatus @ backend-node/src/routes/index.js:224 | `frontweb/src/components/AgentDrawer.vue:96` 等 | — | KEEP-CORE |
| POST /api/v1/tasks/:task_id/cancel | task.cancelTaskStatus @ backend-node/src/routes/index.js:225 | `frontweb/src/stores/generationTaskStore.js:179` | — | KEEP-CORE |
| GET /api/v1/tasks | task.getResourceTasks @ backend-node/src/routes/index.js:226 | `frontweb/src/stores/generationTaskStore.js:506` 等 | — | KEEP-CORE |
| GET /api/v1/scenes/:scene_id | scenes.getOne @ backend-node/src/routes/index.js:229 | `frontweb/src/composables/filmCreate/useScenes.js:152` | 模块测试 sceneQuadGridRoutes.test.js | KEEP-CORE |
| POST /api/v1/scenes/:scene_id/generate-prompt | scenes.generatePrompt @ backend-node/src/routes/index.js:230 | `frontweb/src/composables/filmCreate/useScenes.js:175` 等 | 模块测试 sceneQuadGridRoutes.test.js | KEEP-CORE |
| PUT /api/v1/scenes/:scene_id | scenes.update @ backend-node/src/routes/index.js:231 | `frontweb/src/components/dramaCanvas/CanvasAssetPanel.vue:228` 等 | 模块测试 sceneQuadGridRoutes.test.js | KEEP-CORE |
| PUT /api/v1/scenes/:scene_id/prompt | scenes.updatePrompt @ backend-node/src/routes/index.js:232 | 未发现静态调用 | 模块测试 sceneQuadGridRoutes.test.js | KEEP-CORE |
| DELETE /api/v1/scenes/:scene_id | scenes.delete @ backend-node/src/routes/index.js:233 | `frontweb/src/components/dramaCanvas/CanvasAssetPanel.vue:267` 等 | 模块测试 sceneQuadGridRoutes.test.js | KEEP-CORE |
| POST /api/v1/scenes/generate-image | scenes.generateImage @ backend-node/src/routes/index.js:234 | `frontweb/src/composables/filmCreate/useScenes.js:319` 等 | 模块测试 sceneQuadGridRoutes.test.js | DELETE |
| POST /api/v1/scenes | scenes.create @ backend-node/src/routes/index.js:235 | `frontweb/src/composables/filmCreate/useScenes.js:264` 等 | 模块测试 sceneQuadGridRoutes.test.js | KEEP-CORE |
| POST /api/v1/scenes/:scene_id/generate-four-view-image | scenes.generateFourViewImage @ backend-node/src/routes/index.js:236 | 仅 API 声明 `frontweb/src/api/scenes.js:41` | 模块测试 sceneQuadGridRoutes.test.js | DELETE |
| POST /api/v1/scenes/:scene_id/add-to-library | scenes.addToLibrary @ backend-node/src/routes/index.js:237 | `frontweb/src/composables/filmCreate/useScenes.js:498` | 模块测试 sceneQuadGridRoutes.test.js | KEEP-CORE |
| POST /api/v1/scenes/:scene_id/add-to-material-library | scenes.addToMaterialLibrary @ backend-node/src/routes/index.js:238 | `frontweb/src/composables/filmCreate/useScenes.js:512` | 模块测试 sceneQuadGridRoutes.test.js | KEEP-CORE |
| POST /api/v1/scenes/:scene_id/extract-from-image | scenes.extractFromImage @ backend-node/src/routes/index.js:239 | `frontweb/src/composables/filmCreate/useScenes.js:236` | 模块测试 sceneQuadGridRoutes.test.js | KEEP-CORE |
| GET /api/v1/images | images.list @ backend-node/src/routes/index.js:242 | `frontweb/src/composables/useCanvasStoryboardMedia.js:28` 等 | — | KEEP-CORE |
| POST /api/v1/images | images.create @ backend-node/src/routes/index.js:243 | `frontweb/src/composables/useCanvasWorkflowRunner.js:36` 等 | — | DELETE |
| GET /api/v1/images/episode/:episode_id/backgrounds | images.episodeBackgrounds @ backend-node/src/routes/index.js:244 | 未发现静态调用 | — | KEEP-CORE |
| POST /api/v1/images/episode/:episode_id/backgrounds/extract | images.episodeBackgroundsExtract @ backend-node/src/routes/index.js:245 | `frontweb/src/composables/useCanvasScript.js:106` 等 | — | KEEP-CORE |
| POST /api/v1/images/episode/:episode_id/batch | images.episodeBatch @ backend-node/src/routes/index.js:246 | 未发现静态调用 | — | DELETE |
| POST /api/v1/images/scene/:scene_id | images.scene @ backend-node/src/routes/index.js:247 | 未发现静态调用 | — | DELETE |
| POST /api/v1/images/upload | images.upload @ backend-node/src/routes/index.js:248 | `frontweb/src/views/FilmCreate.vue:4442` 等 | — | KEEP-CORE |
| GET /api/v1/images/:id | images.get @ backend-node/src/routes/index.js:249 | 未发现静态调用 | — | KEEP-CORE |
| DELETE /api/v1/images/:id | images.delete @ backend-node/src/routes/index.js:250 | `frontweb/src/views/FilmCreate.vue:4109` | — | KEEP-CORE |
| GET /api/v1/videos | videos.list @ backend-node/src/routes/index.js:253 | `frontweb/src/composables/useCanvasStoryboardMedia.js:29` 等 | — | KEEP-CORE |
| POST /api/v1/videos | videos.create @ backend-node/src/routes/index.js:254 | `frontweb/src/composables/useCanvasWorkflowRunner.js:60` 等 | — | DELETE |
| POST /api/v1/videos/image/:image_gen_id | videos.fromImage @ backend-node/src/routes/index.js:255 | 未发现静态调用 | — | DELETE |
| POST /api/v1/videos/episode/:episode_id/batch | videos.episodeBatch @ backend-node/src/routes/index.js:256 | 未发现静态调用 | — | DELETE |
| POST /api/v1/videos/:id/resume-poll | videos.resumePoll @ backend-node/src/routes/index.js:257 | `frontweb/src/views/FilmCreate.vue:6613` | — | DELETE |
| GET /api/v1/videos/:id | videos.get @ backend-node/src/routes/index.js:258 | 未发现静态调用 | — | KEEP-CORE |
| DELETE /api/v1/videos/:id | videos.delete @ backend-node/src/routes/index.js:259 | 未发现静态调用 | — | KEEP-CORE |
| GET /api/v1/video-merges | videoMerges.list @ backend-node/src/routes/index.js:262 | 未发现静态调用 | — | KEEP-CORE |
| POST /api/v1/video-merges | videoMerges.create @ backend-node/src/routes/index.js:263 | 未发现静态调用 | — | KEEP-CORE |
| GET /api/v1/video-merges/:merge_id | videoMerges.get @ backend-node/src/routes/index.js:264 | 未发现静态调用 | 沙箱 HTTP； | KEEP-CORE |
| DELETE /api/v1/video-merges/:merge_id | videoMerges.delete @ backend-node/src/routes/index.js:265 | 未发现静态调用 | — | KEEP-CORE |
| GET /api/v1/assets | assets.list @ backend-node/src/routes/index.js:268 | `frontweb/src/views/MediaLibrary.vue:191` | — | NEEDS-CONFIRM |
| POST /api/v1/assets | assets.create @ backend-node/src/routes/index.js:269 | 未发现静态调用 | — | NEEDS-CONFIRM |
| POST /api/v1/assets/import/image/:image_gen_id | assets.importImage @ backend-node/src/routes/index.js:270 | 未发现静态调用 | — | NEEDS-CONFIRM |
| POST /api/v1/assets/import/video/:video_gen_id | assets.importVideo @ backend-node/src/routes/index.js:271 | 未发现静态调用 | — | NEEDS-CONFIRM |
| GET /api/v1/assets/:id | assets.get @ backend-node/src/routes/index.js:272 | 未发现静态调用 | — | NEEDS-CONFIRM |
| PUT /api/v1/assets/:id | assets.update @ backend-node/src/routes/index.js:273 | 未发现静态调用 | — | NEEDS-CONFIRM |
| DELETE /api/v1/assets/:id | assets.delete @ backend-node/src/routes/index.js:274 | `frontweb/src/views/MediaLibrary.vue:241` 等 | — | NEEDS-CONFIRM |
| GET /api/v1/storyboards/episode/:episode_id/generate | storyboards.episodeStoryboardsGenerate @ backend-node/src/routes/index.js:277 | 未发现静态调用 | — | NEEDS-CONFIRM |
| POST /api/v1/storyboards | storyboards.create @ backend-node/src/routes/index.js:278 | `frontweb/src/composables/useCanvasCrud.js:99` 等 | 沙箱 HTTP； | KEEP-CORE |
| POST /api/v1/storyboards/:id/insert-before | storyboards.insertBefore @ backend-node/src/routes/index.js:279 | `frontweb/src/views/FilmCreate.vue:6838` | — | KEEP-CORE |
| GET /api/v1/storyboards/:id | storyboards.getOne @ backend-node/src/routes/index.js:280 | `frontweb/src/views/FilmCreate.vue:6231` | — | KEEP-CORE |
| PUT /api/v1/storyboards/:id | storyboards.update @ backend-node/src/routes/index.js:281 | `frontweb/src/components/dramaCanvas/CanvasStoryboardPanel.vue:270` 等 | — | KEEP-CORE |
| DELETE /api/v1/storyboards/:id | storyboards.delete @ backend-node/src/routes/index.js:282 | `frontweb/src/components/dramaCanvas/CanvasStoryboardPanel.vue:341` 等 | — | KEEP-CORE |
| POST /api/v1/storyboards/:id/props | prop.associateProps @ backend-node/src/routes/index.js:283 | 未发现静态调用 | — | KEEP-CORE |
| POST /api/v1/storyboards/:id/frame-prompt | storyboards.framePrompt @ backend-node/src/routes/index.js:284 | `frontweb/src/views/FilmCreate.vue:4173` | — | KEEP-CORE |
| GET /api/v1/storyboards/:id/frame-prompts | storyboards.framePromptsGet @ backend-node/src/routes/index.js:285 | `frontweb/src/views/FilmCreate.vue:4155` 等 | — | KEEP-CORE |
| PUT /api/v1/storyboards/:id/frame-prompts/:frame_type | storyboards.framePromptSave @ backend-node/src/routes/index.js:286 | `frontweb/src/views/FilmCreate.vue:4218` | — | KEEP-CORE |
| POST /api/v1/storyboards/:id/link-tail-frame | tailFrameLink.linkTailFrame @ backend-node/src/routes/index.js:287 | `frontweb/src/views/FilmCreate.vue:6659` | — | KEEP-CORE |
| POST /api/v1/storyboards/:id/polish-prompt | storyboards.polishPrompt @ backend-node/src/routes/index.js:288 | `frontweb/src/components/dramaCanvas/CanvasStoryboardPanel.vue:356` 等 | — | KEEP-CORE |
| POST /api/v1/storyboards/:id/universal-segment-polish-stream | storyboards.polishUniversalSegmentStream @ backend-node/src/routes/index.js:289 | 未发现静态调用 | — | KEEP-CORE |
| POST /api/v1/storyboards/:id/classic-video-prompt-polish-stream | storyboards.polishClassicVideoPromptStream @ backend-node/src/routes/index.js:290 | 未发现静态调用 | — | KEEP-CORE |
| POST /api/v1/storyboards/:id/universal-segment-prompt-stream | storyboards.generateUniversalSegmentStream @ backend-node/src/routes/index.js:291 | 未发现静态调用 | — | KEEP-CORE |
| POST /api/v1/storyboards/:id/universal-segment-prompt | storyboards.generateUniversalSegmentPrompt @ backend-node/src/routes/index.js:292 | 仅 API 声明 `frontweb/src/api/storyboards.js:97` | — | KEEP-CORE |
| POST /api/v1/storyboards/batch-infer-params | storyboards.batchInferParams @ backend-node/src/routes/index.js:293 | `frontweb/src/composables/useCanvasEpisodeGenerate.js:140` 等 | — | KEEP-CORE |
| POST /api/v1/storyboards/:id/upscale | storyboards.upscale @ backend-node/src/routes/index.js:294 | `frontweb/src/views/FilmCreate.vue:5513` | — | KEEP-CORE |
| POST /api/v1/storyboards/:id/regenerate-layout-description | storyboards.regenerateLayoutDescription @ backend-node/src/routes/index.js:295 | `frontweb/src/views/FilmCreate.vue:6459` | — | KEEP-CORE |
| POST /api/v1/storyboards/:id/rebuild-video-prompt | storyboards.rebuildVideoPrompt @ backend-node/src/routes/index.js:296 | `frontweb/src/views/FilmCreate.vue:6343` | — | KEEP-CORE |
| POST /api/v1/storyboards/:id/split-by-audio | storyboards.splitByAudio @ backend-node/src/routes/index.js:297 | `frontweb/src/views/FilmCreate.vue:6412` | — | KEEP-CORE |
| POST /api/v1/audio/extract | audio.extract @ backend-node/src/routes/index.js:300 | `frontweb/src/composables/useCanvasWorkflowRunner.js:81` 等 | 沙箱 HTTP； | KEEP-CORE |
| POST /api/v1/audio/extract/batch | audio.extractBatch @ backend-node/src/routes/index.js:301 | 未发现静态调用 | — | KEEP-CORE |
| GET /api/v1/settings/language | settings.getLanguage @ backend-node/src/routes/index.js:304 | 未发现静态调用 | — | NEEDS-CONFIRM |
| PUT /api/v1/settings/language | settings.updateLanguage @ backend-node/src/routes/index.js:305 | 未发现静态调用 | — | NEEDS-CONFIRM |
| GET /api/v1/settings/generation | settings.getGenerationSettings @ backend-node/src/routes/index.js:306 | `frontweb/src/components/AIConfigContent.vue:1218` 等 | — | KEEP-CORE |
| PUT /api/v1/settings/generation | settings.updateGenerationSettings @ backend-node/src/routes/index.js:307 | `frontweb/src/components/AIConfigContent.vue:1248` | — | KEEP-CORE |
| GET /api/v1/settings/prompts | promptOverrides.list @ backend-node/src/routes/index.js:310 | `frontweb/src/components/PromptEditor.vue:122` | — | KEEP-CORE |
| PUT /api/v1/settings/prompts/:key | promptOverrides.update @ backend-node/src/routes/index.js:311 | `frontweb/src/components/PromptEditor.vue:157` | — | KEEP-CORE |
| DELETE /api/v1/settings/prompts/:key | promptOverrides.reset @ backend-node/src/routes/index.js:312 | `frontweb/src/components/PromptEditor.vue:174` | — | KEEP-CORE |
| GET /api/v1/scene-model-map | sceneModelMap.list @ backend-node/src/routes/index.js:315 | `frontweb/src/components/SceneModelMap.vue:286` | — | NEEDS-CONFIRM |
| POST /api/v1/scene-model-map | sceneModelMap.create @ backend-node/src/routes/index.js:316 | `frontweb/src/components/SceneModelMap.vue:348` | — | NEEDS-CONFIRM |
| GET /api/v1/scene-model-map/:key | sceneModelMap.get @ backend-node/src/routes/index.js:317 | 仅 API 声明 `frontweb/src/api/sceneModelMap.js:8` | — | NEEDS-CONFIRM |
| PUT /api/v1/scene-model-map/:key | sceneModelMap.update @ backend-node/src/routes/index.js:318 | `frontweb/src/components/SceneModelMap.vue:345` | — | NEEDS-CONFIRM |
| DELETE /api/v1/scene-model-map/:key | sceneModelMap.delete @ backend-node/src/routes/index.js:319 | `frontweb/src/components/SceneModelMap.vue:367` | — | NEEDS-CONFIRM |
| POST /api/v1/agent/chat | agent.chat @ backend-node/src/routes/index.js:323 | `frontweb/src/components/AgentDrawer.vue:171` | 模块测试 agent-routes.test.js | DELETE |
| POST /api/v1/agent/approve | agent.approve @ backend-node/src/routes/index.js:324 | 仅 API 声明 `frontweb/src/api/agent.js:44` | 模块测试 agent-routes.test.js | DELETE |
| POST /api/v1/agent/decline | agent.decline @ backend-node/src/routes/index.js:325 | 仅 API 声明 `frontweb/src/api/agent.js:47` | 模块测试 agent-routes.test.js | DELETE |
| GET /api/v1/agent/history | agent.history @ backend-node/src/routes/index.js:326 | `frontweb/src/components/AgentDrawer.vue:200` | 模块测试 agent-routes.test.js | DELETE |
| GET /api/v1/local-production/status | inline @ backend-node/src/routes/localProduction.js:16 | `frontweb/src/views/LocalProduction.vue:39` | 沙箱 HTTP； | KEEP-CORE |
| POST /api/v1/local-production/import | inline @ backend-node/src/routes/localProduction.js:20 | `frontweb/src/views/LocalProduction.vue:64` | 沙箱 HTTP； | KEEP-CORE |


## B2 服务、定时任务、中间件与动态加载

| 服务（共49） | 用途 | 直接调用者示例 | 直接测试 | 处置边界 |
| --- | --- | --- | --- | --- |
| backend-node/src/services/aiClient.js | 通用文本、流式文本、视觉输入转文本；保留 OpenAI 兼容路径，裁剪厂商特判 | `backend-node/src/routes/index.js:200`；`backend-node/src/routes/storyboards.js:7` 等 | `backend-node/test/maxTokensRetry.test.js:4` 等 | 保留/局部裁剪，见方案 |
| backend-node/src/services/aiConfigService.js | 通用配置和本机 TTS 注册；移除渠道锁与专属厂商逻辑 | `backend-node/src/app.js:18`；`backend-node/src/routes/aiConfig.js:1` 等 | `backend-node/test/localTts.test.js:8` 等 | 保留/局部裁剪，见方案 |
| backend-node/src/services/angleService.js | 镜头角度结构化 | `backend-node/src/routes/storyboards.js:9`；`backend-node/src/services/episodeStoryboardService.js:9` 等 | — | 保留/局部裁剪，见方案 |
| backend-node/src/services/assetService.js | 素材记录/通用库，角色等 add-to-material-library 也调用；不整文件删 | `backend-node/src/routes/assets.js:2` | — | 保留/局部裁剪，见方案 |
| backend-node/src/services/backgroundExtractionService.js | 剧本场景提取 | `backend-node/src/routes/images.js:4` | — | 保留/局部裁剪，见方案 |
| backend-node/src/services/characterGenerationService.js | 文本角色提取 | `backend-node/src/routes/characters.js:246`；`backend-node/src/routes/index.js:108` | — | 保留/局部裁剪，见方案 |
| backend-node/src/services/characterLibraryService.js | 角色库 CRUD 与平台资产字段混合 | `backend-node/src/routes/characterLibrary.js:2`；`backend-node/src/routes/characters.js:4` 等 | `backend-node/test/libraryDedup.test.js:5` | 保留/局部裁剪，见方案 |
| backend-node/src/services/deepseekConfig.js | DeepSeek 专属参数适配 | `backend-node/src/services/aiClient.js:3`；`backend-node/src/services/aiConfigService.js:12` | `backend-node/test/deepseekConfig.test.js:7` | DELETE |
| backend-node/src/services/dramaExportService.js | 工程 ZIP 导出兼容 | `backend-node/src/routes/drama.js:4` | — | 保留/局部裁剪，见方案 |
| backend-node/src/services/dramaImportService.js | 工程 ZIP 导入兼容 | `backend-node/src/routes/drama.js:5` | — | 保留/局部裁剪，见方案 |
| backend-node/src/services/dramaService.js | 剧集与剧本数据管理 | `backend-node/src/routes/drama.js:1`；`backend-node/src/services/storyGenerationService.js:5` | `backend-node/test/localProduction.test.js:77` | 保留/局部裁剪，见方案 |
| backend-node/src/services/episodeStoryboardService.js | 文本分镜、角色外观和连续性提示 | `backend-node/src/routes/storyboards.js:5`；`backend-node/src/routes/stub.js:4` 等 | `backend-node/test/characterAppearanceVideoPrompt.test.js:4` | 保留/局部裁剪，见方案 |
| backend-node/src/services/framePromptService.js | 首尾帧提示词 | `backend-node/src/routes/storyboards.js:6`；`backend-node/src/services/imageService.js:184` 等 | — | 保留/局部裁剪，见方案 |
| backend-node/src/services/imageClient.js | 多厂商图片协议/轮询/代理缓存 | `backend-node/src/services/characterLibraryService.js:4`；`backend-node/src/services/imageService.js:58` 等 | `backend-node/test/agnesImageSize.test.js:3` 等 | DELETE |
| backend-node/src/services/imageService.js | 图片记录、上传、网格/帧绑定与远程生成混合 | `backend-node/src/routes/images.js:2`；`backend-node/src/routes/scenes.js:4` 等 | — | 保留/局部裁剪，见方案 |
| backend-node/src/services/jimengMaterialHubService.js | 即梦平台主体/声音认证 | `backend-node/src/routes/aiConfig.js:170`；`backend-node/src/routes/aiConfig.js:175` 等 | `backend-node/test/jimengMaterialHub.test.js:10` | DELETE |
| backend-node/src/services/klingJwt.js | 可灵直连签名，非账号登录 | `backend-node/src/services/videoClient.js:20` | — | DELETE |
| backend-node/src/services/libraryDedup.js | 三类素材库复用去重 | `backend-node/src/services/characterLibraryService.js:19`；`backend-node/src/services/propLibraryService.js:8` 等 | — | 保留/局部裁剪，见方案 |
| backend-node/src/services/localProductionService.js | 本机导入、目标绑定、多 Take 来源/SHA 与状态 | `backend-node/src/routes/localProduction.js:7` | `backend-node/test/localProduction.test.js:9` | 保留/局部裁剪，见方案 |
| backend-node/src/services/mediaAspectRatioSpec.js | 画幅/尺寸约束 | `backend-node/src/services/videoClient.js:14` | — | 保留/局部裁剪，见方案 |
| backend-node/src/services/mergedEpisodePostProcess.js | 实际被 videoMergeService 调用的合成后处理 | `backend-node/src/services/videoMergeService.js:280` | — | 保留/局部裁剪，见方案 |
| backend-node/src/services/modelArkAssetConfigService.js | ModelArk 平台资产配置 | `backend-node/src/services/characterLibraryService.js:10` | `backend-node/test/modelArkAssetConfig.test.js:10` | DELETE |
| backend-node/src/services/modelArkAssetProxyService.js | ModelArk SDK 代理 | `backend-node/src/routes/aiConfig.js:136`；`backend-node/src/services/modelArkAssetConfigService.js:3` | — | DELETE |
| backend-node/src/services/modelId.js | 通用模型标识兼厂商特判 | `backend-node/src/services/aiClient.js:4`；`backend-node/src/services/aiConfigService.js:13` 等 | — | 保留/局部裁剪，见方案 |
| backend-node/src/services/narrationVideoPostProcess.js | 未接入的旁白后处理孤儿 | 未发现静态导入 | — | DELETE |
| backend-node/src/services/novelImportService.js | 小说/剧本文本导入 | `backend-node/src/routes/index.js:63` | — | 保留/局部裁剪，见方案 |
| backend-node/src/services/promptI18n.js | 文本提示词模板，体积大但有核心调用 | `backend-node/src/routes/index.js:330`；`backend-node/src/routes/promptOverrides.js:2` 等 | `backend-node/test/promptI18nConsistency.test.js:3` | 保留/局部裁剪，见方案 |
| backend-node/src/services/promptOverridesService.js | 提示词模板覆盖存储 | `backend-node/src/routes/index.js:331`；`backend-node/src/routes/promptOverrides.js:1` | — | 保留/局部裁剪，见方案 |
| backend-node/src/services/propExtractionService.js | 文本道具提取 | `backend-node/src/routes/prop.js:66` | — | 保留/局部裁剪，见方案 |
| backend-node/src/services/propImageGenerationService.js | 道具远程图片生成 | `backend-node/src/routes/prop.js:47` | — | DELETE |
| backend-node/src/services/propLibraryService.js | 道具库 CRUD | `backend-node/src/routes/prop.js:2`；`backend-node/src/routes/propLibrary.js:2` | `backend-node/test/libraryDedup.test.js:7` | 保留/局部裁剪，见方案 |
| backend-node/src/services/propService.js | 道具 CRUD/提示词/图库与远程生成混合 | `backend-node/src/routes/drama.js:2`；`backend-node/src/routes/prop.js:1` 等 | — | 保留/局部裁剪，见方案 |
| backend-node/src/services/sceneLibraryService.js | 场景库 CRUD | `backend-node/src/routes/sceneLibrary.js:2`；`backend-node/src/routes/scenes.js:3` | `backend-node/test/libraryDedup.test.js:6` | 保留/局部裁剪，见方案 |
| backend-node/src/services/sceneService.js | 场景 CRUD/图片绑定与远程生成混合 | `backend-node/src/routes/scenes.js:2`；`backend-node/src/services/backgroundExtractionService.js:5` 等 | `backend-node/test/sceneQuadGridRoutes.test.js:4` | 保留/局部裁剪，见方案 |
| backend-node/src/services/settingsService.js | 通用设置、语言与生成参数混合 | `backend-node/src/routes/settings.js:1` | — | 保留/局部裁剪，见方案 |
| backend-node/src/services/storageLayout.js | 存储布局/项目路径 | `backend-node/src/routes/characters.js:5`；`backend-node/src/routes/upload.js:5` 等 | — | 保留/局部裁剪，见方案 |
| backend-node/src/services/storyGenerationService.js | 文本剧本生成 | `backend-node/src/routes/index.js:124` | — | 保留/局部裁剪，见方案 |
| backend-node/src/services/storyboardFrameBinding.js | bindStoryboardFrameImage 核心，必须保留 | `backend-node/src/services/imageService.js:1505`；`backend-node/src/services/imageService.js:1606` 等 | — | 保留/局部裁剪，见方案 |
| backend-node/src/services/storyboardService.js | 分镜 CRUD、引用与参数 | `backend-node/src/routes/storyboards.js:4`；`backend-node/src/services/episodeStoryboardService.js:1473` 等 | — | 保留/局部裁剪，见方案 |
| backend-node/src/services/tailFrameLinkService.js | 视频尾帧提取与下一镜绑定 | `backend-node/src/routes/storyboards_tail_link.js:1` | — | 保留/局部裁剪，见方案 |
| backend-node/src/services/taskService.js | 任务状态、取消和孤儿任务收敛 | `backend-node/src/app.js:22`；`backend-node/src/routes/images.js:3` 等 | `backend-node/test/taskService.test.js:4` | 保留/局部裁剪，见方案 |
| backend-node/src/services/ttsService.js | 本机 Qwen 与旧服务分支；本轮保留，后续只读检测 | `backend-node/src/routes/audio.js:45`；`backend-node/src/routes/audio.js:88` 等 | `backend-node/test/localTts.test.js:7` | 保留/局部裁剪，见方案 |
| backend-node/src/services/universalOmniMultiBeatFormat.js | 已持久化分段格式，不能仅按名称认定厂商专属 | `backend-node/src/services/promptI18n.js:283` | — | 保留/局部裁剪，见方案 |
| backend-node/src/services/universalSegmentDurationNormalize.js | 分段时长格式兼容 | `backend-node/src/routes/storyboards.js:11` | — | 保留/局部裁剪，见方案 |
| backend-node/src/services/universalSegmentPromptBundle.js | 分段提示词组装/文本润色 | `backend-node/src/routes/storyboards.js:10` | — | 保留/局部裁剪，见方案 |
| backend-node/src/services/uploadService.js | 本地上传保存 | `backend-node/src/routes/index.js:36`；`backend-node/src/routes/upload.js:4` 等 | — | 保留/局部裁剪，见方案 |
| backend-node/src/services/videoClient.js | 多厂商视频协议、签名和轮询 | `backend-node/src/routes/videos.js:4`；`backend-node/src/services/videoService.js:89` | `backend-node/test/agnesVideoBody.test.js:9` 等 | DELETE |
| backend-node/src/services/videoMergeService.js | FFmpeg 合成 | `backend-node/src/routes/videoMerges.js:2`；`backend-node/src/services/dramaService.js:803` | `backend-node/test/localProduction.test.js:73` 等 | 保留/局部裁剪，见方案 |
| backend-node/src/services/videoService.js | 视频记录管理与厂商提交、恢复轮询混合 | `backend-node/src/app.js:25`；`backend-node/src/routes/videos.js:2` | `backend-node/test/videoResumePoll.test.js:4` | 保留/局部裁剪，见方案 |


动态加载人工核验：`backend-node/src/mastra/index.mjs:52` 使用 `require(` 字符串拼接，但调用点服务名来自固定的 generationDeps 字面量集合；不是随意从文件名判断孤儿。`mastra/skills.mjs` 读取内置 skill 和运行数据 skill，后者属用户数据，不处理。`desktop/main.js:219–230` 从开发/打包路径动态加载后端和 Mastra，因此 desktop 包中没有直接 import 的依赖不能据此认定未使用。

启动时 `app.js` 执行迁移、渠道锁同步、孤儿异步任务收敛、视频恢复轮询。后两者要区分通用任务与退役视频厂商。AST 未发现 setInterval/cron；setTimeout 存在于任务超时、网络超时、视频/图片轮询、上传、分镜和 stub 假任务。移除厂商循环不能删除通用 taskService。

中间件：`app.js` 的 Express JSON/urlencoded、CORS、请求日志、静态存储、API/SPA 404 和错误处理；上传使用 multer。本地链路使用 sharp、better-sqlite3、adm-zip。没有发现独立用户登录、授权码、付费交易或营销服务；JWT 依赖的唯一业务引用为 Kling 签名。

遗留悬空引用：`ttsService.js:190` 可选 `require(./cloudService)` 对应文件不存在，处于 try/catch，localQwen 路径跳过；只登记，不在本轮修复。`stub.js:65` 唯一仍挂载的方法创建空角色结果；其余大量 stub 方法未挂载，可局部裁剪，不能把整个 stub 文件当作不可达。

## B2 数据库与迁移

以下结构来自**沙箱空库**的 sqlite_master/PRAGMA，只读查看；没有打开真实用户数据库。READ/WRITE 为字面 SQL 的静态证据，NAME/DYNAMIC 为表名传参/多行 SQL 等，需要结合动态路径；不能据此断言没有写入或未用列。所有 24 张表与所有已有 SQL 迁移均保留，预计删除表/列 **0**。

| 表 | 列数 | 代码读写引用数 | 位置示例 | 判定 |
| --- | --- | --- | --- | --- |
| ai_model_map | 8 | READ:8, WRITE:3, NAME/DYNAMIC:2 | `backend-node/src/routes/sceneModelMap.js:6`；`backend-node/src/routes/sceneModelMap.js:19`；`backend-node/src/routes/sceneModelMap.js:43` 等 | 混合通用/旧平台用途，待确认；表保留 |
| ai_service_configs | 18 | READ:9, NAME/DYNAMIC:2, WRITE:8 | `backend-node/src/mastra/model.mjs:15`；`backend-node/src/services/aiClient.js:1`；`backend-node/src/services/aiConfigService.js:40` 等 | 混合通用/旧平台用途，待确认；表保留 |
| assets | 17 | NAME/DYNAMIC:28, READ:3, WRITE:3 | `backend-node/src/app.js:72`；`backend-node/src/routes/assets.js:12`；`backend-node/src/routes/assets.js:21` 等 | 混合通用/旧平台用途，待确认；表保留 |
| async_tasks | 12 | READ:7, WRITE:5 | `backend-node/src/mastra/context.mjs:53`；`backend-node/src/mastra/tools.mjs:308`；`backend-node/src/services/backgroundExtractionService.js:188` 等 | 核心/兼容保留 |
| character_libraries | 18 | NAME/DYNAMIC:11, READ:11, WRITE:2 | `backend-node/src/routes/storyboards.js:488`；`backend-node/src/routes/storyboards.js:491`；`backend-node/src/services/characterLibraryService.js:103` 等 | 核心/兼容保留 |
| characters | 26 | NAME/DYNAMIC:206, READ:48, WRITE:30 | `backend-node/src/constants/generationStylePresets.js:31`；`backend-node/src/mastra/context.mjs:29`；`backend-node/src/mastra/tools.mjs:69` 等 | 核心/兼容保留 |
| dramas | 14 | NAME/DYNAMIC:35, READ:45, WRITE:10 | `backend-node/src/constants/generationStylePresets.js:5`；`backend-node/src/constants/generationStylePresets.js:53`；`backend-node/src/mastra/context.mjs:6` 等 | 核心/兼容保留 |
| episode_characters | 2 | WRITE:6, READ:4, NAME/DYNAMIC:1 | `backend-node/src/mastra/tools.mjs:171`；`backend-node/src/services/characterGenerationService.js:107`；`backend-node/src/services/characterGenerationService.js:111` 等 | 核心/兼容保留 |
| episodes | 13 | READ:37, NAME/DYNAMIC:51, WRITE:9 | `backend-node/src/mastra/context.mjs:11`；`backend-node/src/mastra/context.mjs:17`；`backend-node/src/mastra/context.mjs:18` 等 | 核心/兼容保留 |
| frame_prompts | 8 | NAME/DYNAMIC:12, READ:5, WRITE:6 | `backend-node/src/routes/storyboards.js:314`；`backend-node/src/services/dramaExportService.js:6`；`backend-node/src/services/dramaExportService.js:42` 等 | 核心/兼容保留 |
| global_settings | 3 | NAME/DYNAMIC:2, READ:1, WRITE:1 | `backend-node/src/services/settingsService.js:48`；`backend-node/src/services/settingsService.js:52`；`backend-node/src/services/settingsService.js:59` 等 | 核心/兼容保留 |
| image_generations | 26 | NAME/DYNAMIC:16, READ:19, WRITE:25 | `backend-node/src/routes/storyboards.js:208`；`backend-node/src/routes/storyboards.js:222`；`backend-node/src/services/assetService.js:92` 等 | 核心/兼容保留 |
| image_proxy_cache | 4 | NAME/DYNAMIC:5, READ:1, WRITE:2 | `backend-node/src/services/characterLibraryService.js:711`；`backend-node/src/services/characterLibraryService.js:742`；`backend-node/src/services/imageClient.js:1135` 等 | 旧图片代理缓存；退役后可能闲置，表/列仅报告 |
| local_media_imports | 12 | NAME/DYNAMIC:1, WRITE:1 | `backend-node/src/services/localProductionService.js:11`；`backend-node/src/services/localProductionService.js:91` | 核心/兼容保留 |
| prompt_overrides | 4 | READ:2, WRITE:2 | `backend-node/src/services/promptOverridesService.js:5`；`backend-node/src/services/promptOverridesService.js:9`；`backend-node/src/services/promptOverridesService.js:15` 等 | 核心/兼容保留 |
| prop_libraries | 14 | NAME/DYNAMIC:8, READ:3, WRITE:2 | `backend-node/src/services/libraryDedup.js:6`；`backend-node/src/services/propLibraryService.js:29`；`backend-node/src/services/propLibraryService.js:63` 等 | 核心/兼容保留 |
| props | 16 | NAME/DYNAMIC:69, READ:12, WRITE:13 | `backend-node/src/routes/drama.js:144`；`backend-node/src/routes/drama.js:145`；`backend-node/src/routes/index.js:89` 等 | 核心/兼容保留 |
| scene_libraries | 15 | NAME/DYNAMIC:8, READ:3, WRITE:2 | `backend-node/src/services/libraryDedup.js:5`；`backend-node/src/services/sceneLibraryService.js:30`；`backend-node/src/services/sceneLibraryService.js:64` 等 | 核心/兼容保留 |
| scenes | 18 | READ:23, NAME/DYNAMIC:90, WRITE:20 | `backend-node/src/mastra/context.mjs:36`；`backend-node/src/mastra/tools.mjs:78`；`backend-node/src/mastra/tools.mjs:79` 等 | 核心/兼容保留 |
| storyboard_characters | 4 | NAME/DYNAMIC:8, READ:6, WRITE:3 | `backend-node/src/routes/storyboards.js:472`；`backend-node/src/routes/storyboards.js:488`；`backend-node/src/routes/storyboards.js:489` 等 | 核心/兼容保留 |
| storyboard_props | 2 | NAME/DYNAMIC:8, READ:9, WRITE:10 | `backend-node/src/services/dramaExportService.js:185`；`backend-node/src/services/dramaExportService.js:191`；`backend-node/src/services/dramaExportService.js:246` 等 | 核心/兼容保留 |
| storyboards | 50 | READ:71, NAME/DYNAMIC:129, WRITE:44 | `backend-node/src/mastra/context.mjs:44`；`backend-node/src/mastra/tools.mjs:51`；`backend-node/src/mastra/tools.mjs:57` 等 | 核心/兼容保留 |
| video_generations | 27 | WRITE:13, READ:12, NAME/DYNAMIC:4 | `backend-node/src/routes/videos.js:65`；`backend-node/src/services/assetService.js:105`；`backend-node/src/services/dramaExportService.js:116` 等 | 核心/兼容保留 |
| video_merges | 16 | READ:3, WRITE:6 | `backend-node/src/services/videoMergeService.js:7`；`backend-node/src/services/videoMergeService.js:39`；`backend-node/src/services/videoMergeService.js:53` 等 | 核心/兼容保留 |


三类库的公共 helpers 使用表名参数拼接，character/scene/prop library 调用方已交叉确认；不能用无 `FROM 表名` 字面命中删除。旧厂商相关列（平台主体/声音认证、provider/model/task 字段）、universal 分段字段、历史 pending 任务均有数据/导出兼容风险，不动格式。Mastra 还可使用独立 libSQL memory 存储，未读取真实 memory 数据；退役助手不等于有权清理它的用户文件。

| 已有迁移（全部保留，共29份） | 范围 |
| --- | --- |
| backend-node/migrations/01_init.sql | 后端正式迁移 |
| backend-node/migrations/02_add_default_model.sql | 后端正式迁移 |
| backend-node/migrations/03_add_props_episode_id.sql | 后端正式迁移 |
| backend-node/migrations/04_async_tasks_columns.sql | 后端正式迁移 |
| backend-node/migrations/05_add_image_generations_completed_at.sql | 后端正式迁移 |
| backend-node/migrations/06_add_characters_local_path.sql | 后端正式迁移 |
| backend-node/migrations/07_add_scenes_image_columns.sql | 后端正式迁移 |
| backend-node/migrations/08_add_video_generations_completed_at.sql | 后端正式迁移 |
| backend-node/migrations/09_scene_prop_libraries.sql | 后端正式迁移 |
| backend-node/migrations/10_prompt_overrides.sql | 后端正式迁移 |
| backend-node/migrations/11_add_api_protocol.sql | 后端正式迁移 |
| backend-node/migrations/12_image_proxy_cache.sql | 后端正式迁移 |
| backend-node/migrations/13_character_identity_anchors.sql | 后端正式迁移 |
| backend-node/migrations/14_storyboard_segments_and_model_map.sql | 后端正式迁移 |
| backend-node/migrations/15_storyboard_angle_structured.sql | 后端正式迁移 |
| backend-node/migrations/16_character_polished_prompt.sql | 后端正式迁移 |
| backend-node/migrations/17_character_stages.sql | 后端正式迁移 |
| backend-node/migrations/18_storyboard_narration.sql | 后端正式迁移 |
| backend-node/migrations/19_storyboard_universal_mode.sql | 后端正式迁移 |
| backend-node/migrations/20_character_seedance2_asset.sql | 后端正式迁移 |
| backend-node/migrations/21_asset_negative_prompt.sql | 后端正式迁移 |
| backend-node/migrations/22_library_source_id.sql | 后端正式迁移 |
| desktop/scripts/initial-migrations/01_init.sql | Electron 初始迁移快照；硬约束优先保留 |
| desktop/scripts/initial-migrations/02_add_default_model.sql | Electron 初始迁移快照；硬约束优先保留 |
| desktop/scripts/initial-migrations/03_add_props_episode_id.sql | Electron 初始迁移快照；硬约束优先保留 |
| desktop/scripts/initial-migrations/04_async_tasks_columns.sql | Electron 初始迁移快照；硬约束优先保留 |
| desktop/scripts/initial-migrations/05_add_image_generations_columns.sql | Electron 初始迁移快照；硬约束优先保留 |
| desktop/scripts/initial-migrations/06_add_characters_local_path.sql | Electron 初始迁移快照；硬约束优先保留 |
| desktop/scripts/initial-migrations/07_add_scenes_image_columns.sql | Electron 初始迁移快照；硬约束优先保留 |


## B3 前端可达性

入口 `main.js → App.vue + router → 懒加载页面`。8 个页面均已注册，不能把首页按钮被注释的 `/free-create`、`/media-library` 当作页面不可达。下表完整列出解析到的 src 页面、组件、store、API、composable 和工具。CSS/静态资源另依构建与模板引用判断。

| 文件 | 可达性 | 导入者示例 | 处置 |
| --- | --- | --- | --- |
| frontweb/src/App.vue | 入口可达 | `frontweb/src/main.js:11` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/api/agent.js | 入口可达 | `frontweb/src/components/AgentDrawer.vue:46` | 整文件 DELETE 候选 |
| frontweb/src/api/ai.js | 入口可达 | `frontweb/src/components/AIConfigContent.vue:1201`；`frontweb/src/components/SceneModelMap.vue:163` 等 | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/api/characterLibrary.js | 入口可达 | `frontweb/src/composables/filmCreate/useCharacters.js:4`；`frontweb/src/views/DramaDetail.vue:536` 等 | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/api/characters.js | 入口可达 | `frontweb/src/components/dramaCanvas/CanvasAssetPanel.vue:137`；`frontweb/src/composables/filmCreate/useCharacters.js:3` 等 | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/api/drama.js | 入口可达 | `frontweb/src/composables/filmCreate/useCharacters.js:5`；`frontweb/src/composables/useCanvasCrud.js:3` 等 | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/api/generation.js | 入口可达 | `frontweb/src/composables/filmCreate/useCharacters.js:6`；`frontweb/src/composables/useCanvasScript.js:4` 等 | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/api/images.js | 入口可达 | `frontweb/src/composables/useCanvasStoryboardMedia.js:2`；`frontweb/src/composables/useCanvasWorkflowRunner.js:2` 等 | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/api/prompts.js | 入口可达 | `frontweb/src/components/AIConfigContent.vue:1202`；`frontweb/src/components/PromptEditor.vue:105` 等 | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/api/propLibrary.js | 入口可达 | `frontweb/src/composables/filmCreate/useProps.js:4`；`frontweb/src/views/DramaDetail.vue:538` 等 | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/api/props.js | 入口可达 | `frontweb/src/components/dramaCanvas/CanvasAssetPanel.vue:139`；`frontweb/src/composables/filmCreate/useProps.js:3` 等 | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/api/sceneLibrary.js | 入口可达 | `frontweb/src/composables/filmCreate/useScenes.js:4`；`frontweb/src/views/DramaDetail.vue:537` 等 | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/api/sceneModelMap.js | 入口可达 | `frontweb/src/components/SceneModelMap.vue:162` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/api/scenes.js | 入口可达 | `frontweb/src/components/dramaCanvas/CanvasAssetPanel.vue:138`；`frontweb/src/composables/filmCreate/useScenes.js:3` 等 | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/api/storyboards.js | 入口可达 | `frontweb/src/components/dramaCanvas/CanvasStoryboardPanel.vue:179`；`frontweb/src/composables/useCanvasCrud.js:4` 等 | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/api/task.js | 入口可达 | `frontweb/src/components/AgentDrawer.vue:47`；`frontweb/src/composables/useCanvasAssetGenerate.js:1` 等 | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/api/upload.js | 入口可达 | `frontweb/src/composables/filmCreate/useCharacters.js:7`；`frontweb/src/composables/filmCreate/useProps.js:5` 等 | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/api/videos.js | 入口可达 | `frontweb/src/composables/useCanvasStoryboardMedia.js:3`；`frontweb/src/composables/useCanvasWorkflowRunner.js:3` 等 | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/components/AIConfigContent.vue | 入口可达 | `frontweb/src/views/AiConfig.vue:26`；`frontweb/src/views/FilmCreate.vue:2661` 等 | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/components/AgentDrawer.vue | 入口可达 | `frontweb/src/App.vue:12` | 整文件 DELETE 候选 |
| frontweb/src/components/EpisodeBatchImportDialog.vue | 入口可达 | `frontweb/src/views/DramaDetail.vue:531` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/components/PromptEditor.vue | 入口可达 | `frontweb/src/components/AIConfigContent.vue:1203` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/components/SceneModelMap.vue | 入口可达 | `frontweb/src/components/AIConfigContent.vue:1204` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/components/Sd2AssetManagement.vue | 入口可达 | `frontweb/src/components/AIConfigContent.vue:1205` | 整文件 DELETE 候选 |
| frontweb/src/components/StylePickerButton.vue | 入口可达 | `frontweb/src/views/DramaDetail.vue:532`；`frontweb/src/views/FilmCreate.vue:2660` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/components/UniversalSegmentOmniAtEditor.vue | 入口可达 | `frontweb/src/views/FilmCreate.vue:2662` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/components/dramaCanvas/CanvasAddButtonNode.vue | 入口可达 | `frontweb/src/views/DramaCanvas.vue:318` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/components/dramaCanvas/CanvasAssetNode.vue | 入口可达 | `frontweb/src/views/DramaCanvas.vue:311` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/components/dramaCanvas/CanvasAssetPanel.vue | 入口可达 | `frontweb/src/components/dramaCanvas/CanvasAssetNode.vue:43` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/components/dramaCanvas/CanvasContextMenu.vue | 入口可达 | `frontweb/src/views/DramaCanvas.vue:317` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/components/dramaCanvas/CanvasCreateDialog.vue | 入口可达 | `frontweb/src/views/DramaCanvas.vue:316` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/components/dramaCanvas/CanvasDramaHeaderNode.vue | 入口可达 | `frontweb/src/views/DramaCanvas.vue:310` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/components/dramaCanvas/CanvasEpisodeNode.vue | 入口可达 | `frontweb/src/views/DramaCanvas.vue:312` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/components/dramaCanvas/CanvasFloatingToolbar.vue | 入口可达 | `frontweb/src/views/DramaCanvas.vue:319` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/components/dramaCanvas/CanvasFlowAligner.vue | 入口可达 | `frontweb/src/views/DramaCanvas.vue:320` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/components/dramaCanvas/CanvasLabelNode.vue | 入口可达 | `frontweb/src/views/DramaCanvas.vue:309` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/components/dramaCanvas/CanvasMediaNode.vue | 入口可达 | `frontweb/src/views/DramaCanvas.vue:315` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/components/dramaCanvas/CanvasMediaPanel.vue | 入口可达 | `frontweb/src/components/dramaCanvas/CanvasMediaNode.vue:45` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/components/dramaCanvas/CanvasNodeStatusOverlay.vue | 入口可达 | `frontweb/src/components/dramaCanvas/CanvasAssetNode.vue:44`；`frontweb/src/components/dramaCanvas/CanvasMediaNode.vue:46` 等 | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/components/dramaCanvas/CanvasScriptNode.vue | 入口可达 | `frontweb/src/views/DramaCanvas.vue:313` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/components/dramaCanvas/CanvasScriptPanel.vue | 入口可达 | `frontweb/src/components/dramaCanvas/CanvasScriptNode.vue:37` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/components/dramaCanvas/CanvasStoryboardNode.vue | 入口可达 | `frontweb/src/views/DramaCanvas.vue:314` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/components/dramaCanvas/CanvasStoryboardPanel.vue | 入口可达 | `frontweb/src/components/dramaCanvas/CanvasStoryboardNode.vue:36` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/composables/filmCreate/libraryMembership.js | 静态不可达 | 入口/无静态引用 | 整文件 DELETE 候选 |
| frontweb/src/composables/filmCreate/useCharacters.js | 入口可达 | `frontweb/src/views/FilmCreate.vue:2673` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/composables/filmCreate/useNavigation.js | 入口可达 | `frontweb/src/views/FilmCreate.vue:2671` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/composables/filmCreate/useProps.js | 入口可达 | `frontweb/src/views/FilmCreate.vue:2674` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/composables/filmCreate/useScenes.js | 入口可达 | `frontweb/src/views/FilmCreate.vue:2675` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/composables/useCanvasAssetGenerate.js | 入口可达 | `frontweb/src/components/dramaCanvas/CanvasAssetPanel.vue:141` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/composables/useCanvasContext.js | 入口可达 | `frontweb/src/components/dramaCanvas/CanvasAddButtonNode.vue:14`；`frontweb/src/components/dramaCanvas/CanvasAssetNode.vue:42` 等 | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/composables/useCanvasCrud.js | 入口可达 | `frontweb/src/views/DramaCanvas.vue:282` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/composables/useCanvasEpisodeGenerate.js | 入口可达 | `frontweb/src/views/DramaCanvas.vue:283` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/composables/useCanvasNodeStatus.js | 入口可达 | `frontweb/src/components/dramaCanvas/CanvasMediaPanel.vue:64`；`frontweb/src/components/dramaCanvas/CanvasStoryboardPanel.vue:181` 等 | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/composables/useCanvasScript.js | 入口可达 | `frontweb/src/views/DramaCanvas.vue:284` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/composables/useCanvasStoryboardMedia.js | 入口可达 | `frontweb/src/views/DramaCanvas.vue:281` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/composables/useCanvasWorkflowRunner.js | 入口可达 | `frontweb/src/components/dramaCanvas/CanvasMediaPanel.vue:65`；`frontweb/src/components/dramaCanvas/CanvasStoryboardPanel.vue:188` 等 | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/composables/useGenerationTaskSync.js | 入口可达 | `frontweb/src/composables/filmCreate/useCharacters.js:9`；`frontweb/src/composables/filmCreate/useProps.js:7` 等 | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/composables/useStoryGeneration.js | 入口可达 | `frontweb/src/views/FilmCreate.vue:2672` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/composables/useTheme.js | 入口可达 | `frontweb/src/main.js:4`；`frontweb/src/views/DramaCanvas.vue:278` 等 | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/constants/styleOptions.js | 入口可达 | `frontweb/src/components/StylePickerButton.vue:119`；`frontweb/src/composables/useStoryGeneration.js:4` 等 | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/main.js | 入口可达 | 入口/无静态引用 | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/router/index.js | 入口可达 | `frontweb/src/main.js:12` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/stores/agentContext.js | 入口可达 | `frontweb/src/components/AgentDrawer.vue:48`；`frontweb/src/views/DramaCanvas.vue:263` 等 | 整文件 DELETE 候选 |
| frontweb/src/stores/film.js | 入口可达 | `frontweb/src/views/FilmCreate.vue:2639` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/stores/generationTaskStore.js | 入口可达 | `frontweb/src/composables/filmCreate/useCharacters.js:8`；`frontweb/src/composables/filmCreate/useProps.js:6` 等 | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/utils/agentStream.js | 入口可达 | `frontweb/src/api/agent.js:2`；`frontweb/test/agentStream.test.js:3` | 整文件 DELETE 候选 |
| frontweb/src/utils/canvasEntityIds.js | 入口可达 | `frontweb/src/components/dramaCanvas/CanvasStoryboardPanel.vue:182` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/utils/canvasLayout.js | 入口可达 | `frontweb/src/composables/useCanvasEpisodeGenerate.js:6`；`frontweb/src/utils/canvasWorkflow.js:1` 等 | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/utils/canvasWorkflow.js | 入口可达 | `frontweb/src/components/dramaCanvas/CanvasMediaPanel.vue:66`；`frontweb/src/components/dramaCanvas/CanvasStoryboardPanel.vue:189` 等 | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/utils/dramaCanvasAdapter.js | 入口可达 | `frontweb/src/views/DramaCanvas.vue:286` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/utils/exportStoryboardSheet.js | 入口可达 | `frontweb/src/views/FilmCreate.vue:2659` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/utils/mediaUrl.js | 入口可达 | `frontweb/src/components/dramaCanvas/CanvasAssetNode.vue:41`；`frontweb/src/components/dramaCanvas/CanvasAssetPanel.vue:142` 等 | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/utils/modelSelection.js | 入口可达 | `frontweb/src/components/SceneModelMap.vue:164`；`frontweb/test/modelSelection.test.js:4` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/utils/request.js | 入口可达 | `frontweb/src/api/agent.js:1`；`frontweb/src/api/ai.js:1` 等 | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/utils/scriptEpisodes.js | 入口可达 | `frontweb/src/views/FilmCreate.vue:2657` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/utils/storyboardMedia.js | 入口可达 | `frontweb/src/composables/useCanvasEpisodeGenerate.js:9`；`frontweb/src/composables/useCanvasWorkflowRunner.js:12` 等 | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/utils/videoOmniSupport.js | 入口可达 | `frontweb/src/views/FilmCreate.vue:2658`；`frontweb/test/videoOmniSupport.test.js:4` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/views/AiConfig.vue | 入口可达 | `frontweb/src/router/index.js:39` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/views/DramaCanvas.vue | 入口可达 | `frontweb/src/router/index.js:33` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/views/DramaDetail.vue | 入口可达 | `frontweb/src/router/index.js:21` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/views/FilmCreate.vue | 入口可达 | `frontweb/src/router/index.js:27` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/views/FilmList.vue | 入口可达 | `frontweb/src/router/index.js:15` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/views/FreeCreate.vue | 入口可达 | `frontweb/src/router/index.js:45` | 整文件 DELETE 候选 |
| frontweb/src/views/LocalProduction.vue | 入口可达 | `frontweb/src/router/index.js:9` | 保留；含旧生成消费者的文件后续最小裁剪 |
| frontweb/src/views/MediaLibrary.vue | 入口可达 | `frontweb/src/router/index.js:51` | NEEDS-CONFIRM：独立通用媒体库 |


唯一前端静态孤儿 `composables/filmCreate/libraryMembership.js`：入口图不可达，rg 查找仅定义，无测试依赖；后端孤儿 `narrationVideoPostProcess.js` 同理，真实合成调用的是 `mergedEpisodePostProcess`。两者列为高置信候选，本轮未删。

列表与画布仍包含直连按钮/批量生成工作流；保留节点布局、CRUD、素材浏览和分镜编辑，只裁剪通向退役 API 的入口。不能删除整个 FilmCreate、DramaCanvas、generationTaskStore 或图像/视频 API 文件，因为记录查询、绑定和合成仍依赖。

## B4 依赖审计（等价工具 + 人工确认）

当前 44 项直接依赖声明（后端15、前端12、desktop17）均能找到源码、构建脚本或桌面动态后端用途；**没有把当前依赖直接判为未使用**。退役功能完成后预计后端可减6项：`@mastra/core`、`@mastra/libsql`、`@mastra/memory`、`zod`、`@volcengine/openapi`、`jsonwebtoken`；desktop 包移除另减17项声明，合计23项声明（含跨包重复名称）。不预估传递依赖数量或 node_modules 可释放体积。

| 包目录 | 依赖 | 声明版本 | 使用证据 | 拟处置 |
| --- | --- | --- | --- | --- |
| backend-node | @mastra/core | ^1.78.0 | `backend-node/src/mastra/index.mjs:6`；`backend-node/src/mastra/index.mjs:7` 等 | 随退役删除 |
| backend-node | @mastra/libsql | ^1.26.2 | `backend-node/src/mastra/index.mjs:10` | 随退役删除 |
| backend-node | @mastra/memory | ^1.38.0 | `backend-node/src/mastra/index.mjs:11` | 随退役删除 |
| backend-node | @volcengine/openapi | ^1.36.1 | `backend-node/src/services/modelArkAssetProxyService.js:4` | 随退役删除 |
| backend-node | adm-zip | ^0.5.16 | `backend-node/src/services/dramaExportService.js:4`；`backend-node/src/services/dramaImportService.js:4` | 保留 |
| backend-node | better-sqlite3 | ^11.6.0 | `backend-node/src/db/index.js:1`；`backend-node/test/characterAppearanceVideoPrompt.test.js:3` 等 | 保留 |
| backend-node | cors | ^2.8.5 | `backend-node/src/app.js:3` | 保留 |
| backend-node | express | ^4.21.0 | `backend-node/src/app.js:2`；`backend-node/src/routes/index.js:1` 等 | 保留 |
| backend-node | js-yaml | ^4.1.0 | `backend-node/src/config/index.js:3`；`backend-node/src/services/settingsService.js:3` | 保留 |
| backend-node | jsonrepair | ^3.13.3 | `backend-node/src/utils/safeJson.js:3` | 保留 |
| backend-node | jsonwebtoken | ^9.0.3 | `backend-node/src/services/klingJwt.js:9` | 随退役删除 |
| backend-node | multer | ^1.4.5-lts.1 | `backend-node/src/routes/index.js:58`；`backend-node/src/routes/localProduction.js:5` 等 | 保留 |
| backend-node | sharp | ^0.34.5 | `backend-node/src/routes/storyboards.js:1043`；`backend-node/src/services/imageClient.js:38` 等 | 保留 |
| backend-node | uuid | ^10.0.0 | `backend-node/src/services/taskService.js:1` | 保留 |
| backend-node | zod | ^4.6.7 | `backend-node/src/mastra/index.mjs:5` | 随退役删除 |
| frontweb | @element-plus/icons-vue | ^2.3.0 | `frontweb/src/components/AIConfigContent.vue:1200`；`frontweb/src/components/EpisodeBatchImportDialog.vue:99` 等 | 保留 |
| frontweb | @vue-flow/background | ^1.3.2 | `frontweb/src/views/DramaCanvas.vue:266` | 保留 |
| frontweb | @vue-flow/controls | ^1.1.3 | `frontweb/src/views/DramaCanvas.vue:267`；`frontweb/src/views/DramaCanvas.vue:274` | 保留 |
| frontweb | @vue-flow/core | ^1.48.2 | `frontweb/src/components/dramaCanvas/CanvasAssetNode.vue:40`；`frontweb/src/components/dramaCanvas/CanvasEpisodeNode.vue:11` 等 | 保留 |
| frontweb | @vue-flow/minimap | ^1.5.4 | `frontweb/src/views/DramaCanvas.vue:268`；`frontweb/src/views/DramaCanvas.vue:275` | 保留 |
| frontweb | axios | ^1.6.0 | `frontweb/src/utils/request.js:1`；`frontweb/src/views/FilmCreate.vue:5196` | 保留 |
| frontweb | element-plus | ^2.5.0 | `frontweb/src/components/AIConfigContent.vue:1199`；`frontweb/src/components/EpisodeBatchImportDialog.vue:98` 等 | 保留 |
| frontweb | pinia | ^2.1.0 | `frontweb/src/main.js:5`；`frontweb/src/stores/agentContext.js:1` 等 | 保留 |
| frontweb | vue | ^3.4.0 | `frontweb/src/App.vue:10`；`frontweb/src/components/AIConfigContent.vue:1198` 等 | 保留 |
| frontweb | vue-router | ^4.2.0 | `frontweb/src/App.vue:11`；`frontweb/src/components/AgentDrawer.vue:45` 等 | 保留 |
| frontweb | @vitejs/plugin-vue | ^5.0.0 | `frontweb/vite.config.js:1` | 保留 |
| frontweb | vite | ^5.0.0 | `frontweb/vite.config.js:3`；scripts:dev,build,preview | 保留 |
| desktop | @mastra/core | ^1.78.0 | desktop 动态加载 backend/main，见 main.js:219–230 | 随退役删除 |
| desktop | @mastra/libsql | ^1.26.2 | desktop 动态加载 backend/main，见 main.js:219–230 | 随退役删除 |
| desktop | @mastra/memory | ^1.38.0 | desktop 动态加载 backend/main，见 main.js:219–230 | 随退役删除 |
| desktop | @volcengine/openapi | ^1.36.1 | desktop 动态加载 backend/main，见 main.js:219–230 | 随退役删除 |
| desktop | adm-zip | ^0.5.16 | desktop 动态加载 backend/main，见 main.js:219–230 | 随退役删除 |
| desktop | better-sqlite3 | ^13.0.3 | desktop 动态加载 backend/main，见 main.js:219–230 | 随退役删除 |
| desktop | cors | ^2.8.5 | desktop 动态加载 backend/main，见 main.js:219–230 | 随退役删除 |
| desktop | express | ^4.21.0 | desktop 动态加载 backend/main，见 main.js:219–230 | 随退役删除 |
| desktop | js-yaml | ^4.1.0 | `desktop/main.js:83` | 随退役删除 |
| desktop | jsonrepair | ^3.13.3 | desktop 动态加载 backend/main，见 main.js:219–230 | 随退役删除 |
| desktop | jsonwebtoken | ^9.0.3 | desktop 动态加载 backend/main，见 main.js:219–230 | 随退役删除 |
| desktop | multer | ^1.4.5-lts.1 | desktop 动态加载 backend/main，见 main.js:219–230 | 随退役删除 |
| desktop | sharp | ^0.34.5 | desktop 动态加载 backend/main，见 main.js:219–230 | 随退役删除 |
| desktop | uuid | ^10.0.0 | desktop 动态加载 backend/main，见 main.js:219–230 | 随退役删除 |
| desktop | zod | ^4.6.7 | desktop 动态加载 backend/main，见 main.js:219–230 | 随退役删除 |
| desktop | electron | ^44.0.0 | `desktop/main.js:1`；`desktop/main.js:267`；scripts:start,pack,dist,postinstall | 随退役删除 |
| desktop | electron-builder | ^26.15.3 | desktop 动态加载 backend/main，见 main.js:219–230；scripts:pack,dist,postinstall | 随退役删除 |


better-sqlite3 为必需原生模块；测试/迁移/生产均使用。Vite/plugin-vue 仅脚本/配置导入也算有效用途；VueFlow 全套仍被画布引用；sharp 仍用于本机导入和图像处理。依赖变更必须 npm 更新锁文件并在干净沙箱 npm ci，不能仅手工删锁项。

## B5 配置与密钥

| 配置文件 | 用途 | 处置 |
| --- | --- | --- |
| .github/FUNDING.yml | GitHub 平台配置/工作流 | 保留/对应包后续更新 |
| .github/ISSUE_TEMPLATE/config.yml | GitHub 平台配置/工作流 | 保留/对应包后续更新 |
| .github/workflows/release.yml | GitHub 平台配置/工作流 | DELETE |
| backend-node/configs/config.yaml | 后端本机 YAML 配置 | 保留/对应包后续更新 |
| backend-node/package-lock.json | 对应包的可复现依赖锁 | 保留/对应包后续更新 |
| backend-node/package.json | 对应运行/构建包定义 | 保留/对应包后续更新 |
| desktop/dist/builder-debug.yml | Electron 打包配置/生成调试快照 | DELETE |
| desktop/dist/builder-effective-config.yaml | Electron 打包配置/生成调试快照 | DELETE |
| desktop/electron-builder-lite.json | Electron 打包配置/生成调试快照 | DELETE |
| desktop/electron-builder-mac-lite.json | Electron 打包配置/生成调试快照 | DELETE |
| desktop/electron-builder-mac.json | Electron 打包配置/生成调试快照 | DELETE |
| desktop/package-lock.json | 对应包的可复现依赖锁 | DELETE |
| desktop/package.json | 对应运行/构建包定义 | DELETE |
| frontweb/package-lock.json | 对应包的可复现依赖锁 | 保留/对应包后续更新 |
| frontweb/package.json | 对应运行/构建包定义 | 保留/对应包后续更新 |
| openclaw-skill/skill.json | 外部 skill 元数据/API schema；非当前应用配置 | DELETE |
| openclaw-skill/tools.json | 外部 skill 元数据/API schema；非当前应用配置 | DELETE |
| 各大平台中转站配置/302ai-302.json | 手工导入中转商配置；非空凭据字段见下，不自动加载 | DELETE |
| 各大平台中转站配置/geeknow.json | 手工导入中转商配置；非空凭据字段见下，不自动加载 | DELETE |
| 各大平台中转站配置/n1n.json | 手工导入中转商配置；非空凭据字段见下，不自动加载 | DELETE |
| 各大平台中转站配置/云雾ai.json | 手工导入中转商配置；非空凭据字段见下，不自动加载 | DELETE |
| 各大平台中转站配置/向量.json | 手工导入中转商配置；非空凭据字段见下，不自动加载 | DELETE |
| 各大平台中转站配置/飞儿api-ffir.cn.json | 手工导入中转商配置；非空凭据字段见下，不自动加载 | DELETE |


排除真实 data/.local、.git 与 node_modules 后查找，未发现实际 `.env` / `.env.*` 文件（未遍历受保护数据内容）。后端配置加载顺序见 `src/config/index.js`，不自动读取“各大平台中转站配置/”。运行期模型/TTS 配置可持久化至 SQLite；未读取真实配置行。

`backend-node/configs/config.yaml` 未发现固定 JWT secret、管理员密码、加密盐或 token 字段；host 为127.0.0.1，insecure_tls=false，vendor_lock=false。这不意味着历史或数据库不存在凭据。所有环境变量名称及位置如下，不列任何值。

| 环境变量名 | 位置 |
| --- | --- |
| WEB_DIST_PATH | `backend-node/src/app.js:69` |
| DEBUG | `backend-node/src/db/index.js:15` |
| LOG_FILE | `backend-node/src/logger.js:17` |
| EXAMPLE_DRAMA_PATH | `backend-node/src/routes/drama.js:207` |
| EXAMPLE_DRAMA_PATH | `backend-node/src/routes/drama.js:207` |
| EXAMPLE_DRAMA_PATH | `backend-node/src/routes/drama.js:208` |
| NODE_TLS_REJECT_UNAUTHORIZED | `backend-node/src/server.js:11` |
| PORT | `backend-node/src/server.js:21` |
| DEBUG_STORYBOARD_PROMPTS | `backend-node/src/services/episodeStoryboardService.js:97` |
| JIMENG2_CHARACTER_AUTH_URL | `backend-node/src/services/jimengMaterialHubService.js:74` |
| JIMENG_MATERIAL_HUB_BASE_URL | `backend-node/src/services/jimengMaterialHubService.js:76` |
| SILVAMUX_HUB_BASE_URL | `backend-node/src/services/jimengMaterialHubService.js:77` |
| JIMENG2_CHARACTER_AUTH_TOKEN | `backend-node/src/services/jimengMaterialHubService.js:85` |
| JIMENG_MATERIAL_HUB_TOKEN | `backend-node/src/services/jimengMaterialHubService.js:87` |
| SILVAMUX_HUB_TOKEN | `backend-node/src/services/jimengMaterialHubService.js:88` |
| HUB_TOKEN | `backend-node/src/services/jimengMaterialHubService.js:89` |
| JIMENG2_CHARACTER_AUTH_TOKEN | `backend-node/src/services/jimengMaterialHubService.js:98` |
| JIMENG_MATERIAL_HUB_TOKEN | `backend-node/src/services/jimengMaterialHubService.js:99` |
| SILVAMUX_HUB_TOKEN | `backend-node/src/services/jimengMaterialHubService.js:100` |
| HUB_TOKEN | `backend-node/src/services/jimengMaterialHubService.js:101` |
| KLING_JWT_NBF_SKEW_SECONDS | `backend-node/src/services/klingJwt.js:13` |
| SystemRoot | `backend-node/src/services/mergedEpisodePostProcess.js:185` |
| KLING_FFIR_BASE_URL | `backend-node/src/services/videoClient.js:138` |
| KLING_FFIR_BASE_URL | `backend-node/src/services/videoClient.js:139` |
| KLING_FFIR_API_KEY | `backend-node/src/services/videoClient.js:141` |
| KLING_FFIR_API_KEY | `backend-node/src/services/videoClient.js:142` |
| KLING_FFIR_CREATE_PATH | `backend-node/src/services/videoClient.js:144` |
| KLING_FFIR_CREATE_PATH | `backend-node/src/services/videoClient.js:145` |
| KLING_FFIR_CREATE_PATH | `backend-node/src/services/videoClient.js:146` |
| KLING_FFIR_CREATE_PATH | `backend-node/src/services/videoClient.js:147` |
| KLING_FFIR_QUERY_PATH | `backend-node/src/services/videoClient.js:149` |
| KLING_FFIR_QUERY_PATH | `backend-node/src/services/videoClient.js:150` |
| KLING_OFFICIAL_ACCESS_KEY | `backend-node/src/services/videoClient.js:152` |
| KLING_OFFICIAL_ACCESS_KEY | `backend-node/src/services/videoClient.js:153` |
| KLING_OFFICIAL_SECRET_KEY | `backend-node/src/services/videoClient.js:155` |
| KLING_OFFICIAL_SECRET_KEY | `backend-node/src/services/videoClient.js:156` |
| KLING_OFFICIAL_BASE_URL | `backend-node/src/services/videoClient.js:158` |
| KLING_OFFICIAL_BASE_URL | `backend-node/src/services/videoClient.js:159` |
| KLING_SECRET_KEY_BASE64 | `backend-node/src/services/videoClient.js:181` |
| VIDEO_POLL_LOG_MAX | `backend-node/src/services/videoClient.js:4474` |
| FFMPEG_PATH | `backend-node/src/utils/ffmpegPath.js:68` |
| MUFORGE_DEVTOOLS | `desktop/main.js:198` |
| WEB_DIST_PATH | `desktop/main.js:208` |
| LOG_FILE | `desktop/main.js:210` |
| EXAMPLE_DRAMA_PATH | `desktop/main.js:211` |
| EXAMPLE_DRAMA_PATH | `desktop/main.js:213` |
| ELECTRON_MIRROR | `desktop/scripts/dist-cn.js:1` |
| ELECTRON_BUILDER_BINARIES_MIRROR | `desktop/scripts/dist-cn.js:2` |


`ffmpegPath.js` 还有下标访问的 `FFPROBE_PATH`，AST 点号扫描已人工补核。`import.meta.env.BASE_URL` 属 Vite 路由基址。脚本还按正常系统 HOME/PATH 查找工具，未覆盖用户环境。

凭据发现（只列位置/类型）：6 份中转 JSON 中每份10个非空 api_key 字段，均位于8、29、50、72、93、113、131、151、170、192行。是否样例或可用未确认，未发送任何验证请求。目录来源经 `git cat-file -e caea265:路径` 证明上游基准已包含；无证据证明账号属于当前用户。

| 路径 | 行号 | 类型 |
| --- | --- | --- |
| 各大平台中转站配置/302ai-302.json | 8,29,50,72,93,113,131,151,170,192 | 非空 api_key，真实性/有效性未知 |
| 各大平台中转站配置/geeknow.json | 8,29,50,72,93,113,131,151,170,192 | 非空 api_key，真实性/有效性未知 |
| 各大平台中转站配置/n1n.json | 8,29,50,72,93,113,131,151,170,192 | 非空 api_key，真实性/有效性未知 |
| 各大平台中转站配置/云雾ai.json | 8,29,50,72,93,113,131,151,170,192 | 非空 api_key，真实性/有效性未知 |
| 各大平台中转站配置/向量.json | 8,29,50,72,93,113,131,151,170,192 | 非空 api_key，真实性/有效性未知 |
| 各大平台中转站配置/飞儿api-ffir.cn.json | 8,29,50,72,93,113,131,151,170,192 | 非空 api_key，真实性/有效性未知 |


openclaw-skill 的 manifest/schema 未发现静态凭据值字段；内容是上游 OpenClaw 操作说明与本应用 API 工具描述，未被本应用注册，包含退役直连生成接口。不能据此清理用户自行安装的外部 skill。

## B6 资产、文档、授权与大文件

已执行 NUL 安全等价命令 `git ls-files -z | xargs -0 du -h | sort -rh | head -50`。下表按受版本管理文件逻辑字节排序；目录 du 和 Git 压缩体积不可与此混算。

| 最大50文件 | 字节 |
| --- | --- |
| backend-node/tools/ffmpeg/ffmpeg.exe | 99264000 |
| docs/微信支付.docx | 927641 |
| 项目截图/武侠分镜.png | 806690 |
| 项目截图/3.png | 776960 |
| 项目截图/5.png | 775549 |
| 项目截图/武侠.png | 734868 |
| 项目截图/新版本4宫格分镜.png | 672624 |
| 项目截图/专业分镜.png | 542015 |
| 项目截图/本剧场景库.png | 534348 |
| 项目截图/1.png | 527785 |
| 项目截图/画布模式.png | 517406 |
| frontweb/src/views/FilmCreate.vue | 432897 |
| 项目截图/2.png | 422224 |
| desktop/package-lock.json | 284503 |
| 项目截图/首页截图.png | 256613 |
| backend-node/package-lock.json | 186892 |
| backend-node/src/services/videoClient.js | 184568 |
| 项目截图/微信群.jpg | 152051 |
| 项目截图/ali.jpg | 140260 |
| backend-node/src/services/promptI18n.js | 135828 |
| 项目截图/weixinpay.jpg | 128396 |
| 项目截图/wx.jpg | 124454 |
| frontweb/src/components/AIConfigContent.vue | 119509 |
| frontweb/public/style-thumbs/realisticanime.png | 109084 |
| 各大平台中转站配置/调用本地反向代理即梦freeapi的配置.png | 99298 |
| backend-node/src/services/imageService.js | 84383 |
| backend-node/src/services/imageClient.js | 83480 |
| 各大平台中转站配置/官方即梦2.0配置.png | 83007 |
| backend-node/src/services/episodeStoryboardService.js | 76694 |
| frontweb/public/style-thumbs/cartoon.jpg | 75074 |
| frontweb/public/style-thumbs/0cartoon.jpg | 73346 |
| frontweb/src/views/DramaDetail.vue | 71957 |
| frontweb/public/wx.jpg | 71729 |
| 各大平台中转站配置/stablediffusion webui接口.png | 67316 |
| frontweb/package-lock.json | 65712 |
| frontweb/src/views/FilmList.vue | 55229 |
| frontweb/public/style-thumbs/historical.jpg | 54385 |
| backend-node/src/routes/storyboards.js | 51496 |
| backend-node/src/services/characterLibraryService.js | 49366 |
| frontweb/public/style-thumbs/2d-animation.jpg | 44574 |
| frontweb/public/style-thumbs/anime.jpg | 41721 |
| CHANGELOG.md | 41519 |
| frontweb/public/style-thumbs/ink-wash.jpg | 38208 |
| frontweb/public/style-thumbs/comic.jpg | 38196 |
| frontweb/public/style-thumbs/neo-chinese-guochao.jpg | 35419 |
| frontweb/src/views/DramaCanvas.vue | 35407 |
| backend-node/src/services/aiClient.js | 35246 |
| docs/superpowers/plans/2026-10-16-mastra-agent.md | 34730 |
| backend-node/src/services/dramaService.js | 33796 |
| backend-node/src/services/framePromptService.js | 33320 |


Windows ffmpeg.exe 为99,264,000字节；Mac 沙箱实测使用系统FFmpeg。当前没有 ffprobe.exe，历史出现的打包大文件不计入本次工作树释放量。

`example_drama/衣服设计天才302.zip` 实际133字节 LFS 指针，远端声明82,156,132字节但未下载/未解包。`routes/drama.js` 的 example 目录查找和两个首页 API 仍用它，故 NEEDS-CONFIRM；不能声称删它可立即节约82MB。

`项目截图/`、中转截图、示例指针与支付指南在上游 caea265 中已存在；仅证明继承来源，不证明每张图或案例的独立版权/肖像/商标授权。仓库有MIT代码许可，但没有逐素材来源授权清单。示例正文未 materialize，无法审核其内容/授权。`docs/微信支付.docx` 是支付相关OOXML文档，与生产链路无关；本轮仅离线解析，未访问其中第三方服务。

离线 Swift Vision OCR 检查28张本地图片/Word嵌入图，不输出识别原文或二维码内容：3张中转截图有凭据字段标签；`项目截图/微信群.jpg`、`项目截图/ali.jpg`、`项目截图/weixinpay.jpg` 为第三方联系/付款二维码；`项目截图/wx.jpg` 和 `frontweb/public/wx.jpg` 有未分类二维码。OCR 没命中不证明没有秘密，未把截图上传外部工具。

当前根 README 无图片引用。`frontweb/public/wx.jpg` 被 FilmList 的联系上游作者 UI 引用，不能当作死资源；如移除该入口，只能同步最小删除引用。style-thumbs 被 StylePickerButton/styleOptions 使用，不能整目录删除。历史截图有 UPSTREAM_README/story/en 等引用，暂留待确认；保留上游署名不依赖保留付款二维码。

| 图像资产 | 引用示例 | 分类 |
| --- | --- | --- |
| frontweb/public/favicon.svg | `frontweb/index.html:5`；`index.html:8` 等 | NEEDS-CONFIRM |
| frontweb/public/style-thumbs/0cartoon.jpg | 未找到文本引用；仍需模板/动态路径复核 | NEEDS-CONFIRM |
| frontweb/public/style-thumbs/0comic - 副本.jpg | 未找到文本引用；仍需模板/动态路径复核 | NEEDS-CONFIRM |
| frontweb/public/style-thumbs/2d-animation.jpg | `frontweb/src/constants/styleOptions.js:53` | NEEDS-CONFIRM |
| frontweb/public/style-thumbs/2d-gufeng.jpg | `frontweb/src/constants/styleOptions.js:91` | NEEDS-CONFIRM |
| frontweb/public/style-thumbs/3d-render.jpg | `frontweb/src/constants/styleOptions.js:61`；`frontweb/src/constants/styleOptions.js:178` | NEEDS-CONFIRM |
| frontweb/public/style-thumbs/anime.jpg | `frontweb/src/constants/styleOptions.js:41` | NEEDS-CONFIRM |
| frontweb/public/style-thumbs/cartoon - 副本.jpg | 未找到文本引用；仍需模板/动态路径复核 | NEEDS-CONFIRM |
| frontweb/public/style-thumbs/cartoon.jpg | `frontweb/src/constants/styleOptions.js:49` | NEEDS-CONFIRM |
| frontweb/public/style-thumbs/chinese.jpg | `frontweb/src/constants/styleOptions.js:74` | NEEDS-CONFIRM |
| frontweb/public/style-thumbs/cinematic.jpg | `frontweb/src/constants/styleOptions.js:16` | NEEDS-CONFIRM |
| frontweb/public/style-thumbs/comic.jpg | `frontweb/src/constants/styleOptions.js:45`；`frontweb/src/constants/styleOptions.js:111` | NEEDS-CONFIRM |
| frontweb/public/style-thumbs/cyberpunk.jpg | `frontweb/src/constants/styleOptions.js:161` | NEEDS-CONFIRM |
| frontweb/public/style-thumbs/dark-fantasy.jpg | `frontweb/src/constants/styleOptions.js:153` | NEEDS-CONFIRM |
| frontweb/public/style-thumbs/documentary.jpg | `frontweb/src/constants/styleOptions.js:20` | NEEDS-CONFIRM |
| frontweb/public/style-thumbs/dreamy.jpg | `frontweb/src/constants/styleOptions.js:194` | NEEDS-CONFIRM |
| frontweb/public/style-thumbs/fantasy.jpg | `frontweb/src/constants/styleOptions.js:149`；`frontweb/src/constants/styleOptions.js:153` | NEEDS-CONFIRM |
| frontweb/public/style-thumbs/gufeng-3d.jpg | `frontweb/src/constants/styleOptions.js:99` | NEEDS-CONFIRM |
| frontweb/public/style-thumbs/historical.jpg | `frontweb/src/constants/styleOptions.js:78` | NEEDS-CONFIRM |
| frontweb/public/style-thumbs/horror.jpg | `frontweb/src/constants/styleOptions.js:32` | NEEDS-CONFIRM |
| frontweb/public/style-thumbs/impressionist.jpg | `frontweb/src/constants/styleOptions.js:140` | NEEDS-CONFIRM |
| frontweb/public/style-thumbs/ink-wash.jpg | `frontweb/src/constants/styleOptions.js:70` | NEEDS-CONFIRM |
| frontweb/public/style-thumbs/korean-romance-webtoon.jpg | `frontweb/src/constants/styleOptions.js:115` | NEEDS-CONFIRM |
| frontweb/public/style-thumbs/low-poly.jpg | `frontweb/src/constants/styleOptions.js:186` | NEEDS-CONFIRM |
| frontweb/public/style-thumbs/minimalist.jpg | `frontweb/src/constants/styleOptions.js:190` | NEEDS-CONFIRM |
| frontweb/public/style-thumbs/neo-chinese-guochao.jpg | `frontweb/src/constants/styleOptions.js:103` | NEEDS-CONFIRM |
| frontweb/public/style-thumbs/neo-gufeng.jpg | `frontweb/src/constants/styleOptions.js:107` | NEEDS-CONFIRM |
| frontweb/public/style-thumbs/noir.jpg | `frontweb/src/constants/styleOptions.js:24` | NEEDS-CONFIRM |
| frontweb/public/style-thumbs/oil-painting.jpg | `frontweb/src/constants/styleOptions.js:128` | NEEDS-CONFIRM |
| frontweb/public/style-thumbs/pixel-art.jpg | `frontweb/src/constants/styleOptions.js:182` | NEEDS-CONFIRM |
| frontweb/public/style-thumbs/post-apoc.jpg | `frontweb/src/constants/styleOptions.js:169` | NEEDS-CONFIRM |
| frontweb/public/style-thumbs/realistic.jpg | `frontweb/src/constants/styleOptions.js:12` | NEEDS-CONFIRM |
| frontweb/public/style-thumbs/realisticanime.png | `frontweb/src/constants/styleOptions.js:57` | NEEDS-CONFIRM |
| frontweb/public/style-thumbs/retro.jpg | `frontweb/src/constants/styleOptions.js:28` | NEEDS-CONFIRM |
| frontweb/public/style-thumbs/sci-fi.jpg | `frontweb/src/constants/styleOptions.js:157` | NEEDS-CONFIRM |
| frontweb/public/style-thumbs/sketch.jpg | `frontweb/src/constants/styleOptions.js:132` | NEEDS-CONFIRM |
| frontweb/public/style-thumbs/steampunk.jpg | `frontweb/src/constants/styleOptions.js:165` | NEEDS-CONFIRM |
| frontweb/public/style-thumbs/urban-romance-comic.jpg | `frontweb/src/constants/styleOptions.js:111` | NEEDS-CONFIRM |
| frontweb/public/style-thumbs/watercolor.jpg | `frontweb/src/constants/styleOptions.js:124` | NEEDS-CONFIRM |
| frontweb/public/style-thumbs/woodblock.jpg | `frontweb/src/constants/styleOptions.js:136` | NEEDS-CONFIRM |
| frontweb/public/style-thumbs/wuxia.jpg | `frontweb/src/constants/styleOptions.js:82` | NEEDS-CONFIRM |
| frontweb/public/style-thumbs/xianxia-3d.jpg | `frontweb/src/constants/styleOptions.js:95` | NEEDS-CONFIRM |
| frontweb/public/wx.jpg | `backend-node/src/app.js:73`；`docs/story.md:71` 等 | NEEDS-CONFIRM |
| 各大平台中转站配置/stablediffusion webui接口.png | 未找到文本引用；仍需模板/动态路径复核 | DELETE 目录成员 |
| 各大平台中转站配置/官方即梦2.0配置.png | 未找到文本引用；仍需模板/动态路径复核 | DELETE 目录成员 |
| 各大平台中转站配置/调用本地反向代理即梦freeapi的配置.png | `backend-node/README.md:394` | DELETE 目录成员 |
| 项目截图/1.png | 未找到文本引用；仍需模板/动态路径复核 | NEEDS-CONFIRM |
| 项目截图/2.png | 未找到文本引用；仍需模板/动态路径复核 | NEEDS-CONFIRM |
| 项目截图/3.png | 未找到文本引用；仍需模板/动态路径复核 | NEEDS-CONFIRM |
| 项目截图/4.png | `backend-node/test/agent-tools.test.js:100` | NEEDS-CONFIRM |
| 项目截图/5.png | 未找到文本引用；仍需模板/动态路径复核 | NEEDS-CONFIRM |
| 项目截图/ali.jpg | `docs/UPSTREAM_README.md:306` | NEEDS-CONFIRM |
| 项目截图/weixinpay.jpg | `docs/UPSTREAM_README.md:305` | NEEDS-CONFIRM |
| 项目截图/wx.jpg | `backend-node/src/app.js:73`；`docs/story.md:71` 等 | NEEDS-CONFIRM |
| 项目截图/专业分镜.png | `docs/UPSTREAM_README.md:91` | NEEDS-CONFIRM |
| 项目截图/微信群.jpg | `docs/story.md:73` | NEEDS-CONFIRM |
| 项目截图/新版本4宫格分镜.png | `docs/UPSTREAM_README.md:90` | NEEDS-CONFIRM |
| 项目截图/本剧场景库.png | `docs/UPSTREAM_README.md:94` | NEEDS-CONFIRM |
| 项目截图/武侠.png | `docs/UPSTREAM_README.md:86` | NEEDS-CONFIRM |
| 项目截图/武侠分镜.png | `docs/UPSTREAM_README.md:87` | NEEDS-CONFIRM |
| 项目截图/画布模式.png | `docs/UPSTREAM_README.md:78` | NEEDS-CONFIRM |
| 项目截图/首页截图.png | `docs/UPSTREAM_README.md:71` | NEEDS-CONFIRM |


## B7 全历史密钥扫描

使用官方 gitleaks v8.30.1 Darwin arm64（发布包 SHA-256 对照官方 checksums），扫描完整263提交、所有本地refs；仓库非浅克隆。命令含 `git --log-opts=--all --redact=100 --ignore-gitleaks-allow --max-archive-depth=2`；未使用项目自定义 allowlist，无历史改写。扫描退出1表示发现候选，不是未扫描。

| 路径 | 提交 | 行/列 | 类型 |
| --- | --- | --- | --- |
| desktop/backend-app-secure/src/app.js | ececcdcb6b14f40b8d3fec42a38a2633593b4613 | 1:1177168–1177255 | generic-api-key |
| desktop/backend-app-secure/src/app.js | ececcdcb6b14f40b8d3fec42a38a2633593b4613 | 1:1294132–1294197 | generic-api-key |


2处候选均在同一历史压缩打包文件内，当前工作树该路径不存在。有效性未确认，不因为同一压缩行别处有占位词就判误报；未联网验证。删除当前目录不会清除历史候选。若将来确认真实泄露，需要单独决定凭据轮换；本轮禁止推送与改历史。Gitleaks 对中转 JSON 的非空字段未报命中，人工配置扫描结果单独登记，不能宣称零风险。

本机扫描细节及安全元数据：`/tmp/muforge-slim-audit-me4faz31`；没有把原始凭据、响应数据库、用户文件指纹内容提交到仓库。
