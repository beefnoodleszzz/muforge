# MuForge 瘦身执行报告（进行中）

基准pre-slim，分支slim/focus；禁止push和历史改写。阶段E已获批，下面仅记录实测结果，不把计划写成完成。

## 凭据轮换登记（不验证有效性）

以下是此前A/B已登记的疑似凭据，不是本轮新增发现。尚不能确认真实有效；若这些字段曾填入实际服务商凭据或被使用，应由用户在相应后台撤销/轮换。当前文件删除不会清理Git历史。

| 类型/服务商位置 | 文件路径 | 行号/说明 |
| --- | --- | --- |
| 中转商API Key：302ai-302 | 各大平台中转站配置/302ai-302.json | 8,29,50,72,93,113,131,151,170,192；非空，示例/有效性未确认 |
| 中转商API Key：geeknow | 各大平台中转站配置/geeknow.json | 8,29,50,72,93,113,131,151,170,192；非空，示例/有效性未确认 |
| 中转商API Key：n1n | 各大平台中转站配置/n1n.json | 8,29,50,72,93,113,131,151,170,192；非空，示例/有效性未确认 |
| 中转商API Key：云雾ai | 各大平台中转站配置/云雾ai.json | 8,29,50,72,93,113,131,151,170,192；非空，示例/有效性未确认 |
| 中转商API Key：向量 | 各大平台中转站配置/向量.json | 8,29,50,72,93,113,131,151,170,192；非空，示例/有效性未确认 |
| 中转商API Key：飞儿api-ffir.cn | 各大平台中转站配置/飞儿api-ffir.cn.json | 8,29,50,72,93,113,131,151,170,192；非空，示例/有效性未确认 |
| generic-api-key（所属服务商未知） | desktop/backend-app-secure/src/app.js | 历史提交ececcdcb6b14f40b8d3fec42a38a2633593b4613，第1行两处候选；当前路径不存在，需用户核实归属后轮换 |


不打印值、不探测有效性、不改写历史、不强推。截图中的凭据字段标签和联系/付款二维码不等同于已确认API凭据，不臆造轮换对象。

## 批次1：中转/渠道配置（已回滚，未提交）

- 尝试删除：各大平台中转站配置/ 下11份受版本管理文件，共285,925字节。不存在的外发/渠道包未计数；渠道运行逻辑未动。
- 回滚：11份文件全部恢复，SHA/字节恢复为HEAD；没有提交、push或历史改写。
- 原因一：浏览器项目列表标题断言失败，立即回滚。诊断为body文案断言错误：document.title正确、页面已挂载、无Vite错误遮罩；不宣称本批最终验收通过。
- 原因二：用户要求25接口先确认零调用方，当前16个接口仍有可达前端调用；这是NEEDS-CONFIRM。将门禁挪到删接口前的解释未经批准，已撤回，等待用户明确顺序。

| 检查 | 结果 |
| --- | --- |
| 真实目录后端 / 前端测试 | 142 / 20项通过 |
| 真实目录前端构建 | 通过，既有大chunk警告 |
| 真实data/.local前后指纹 | 一致（13 / 10条目） |
| 新沙箱独立clone + npm ci + native SQLite | 通过；候选源码逐文件与真实工作树一致 |
| 沙箱后端 / 前端测试 | 142 / 20项通过 |
| 沙箱setup / build / start / status / health | 通过 |
| 本机制作状态、HTTP页面 | 通过 |
| curl导入 | 两次PNG、一次MP4通过 |
| 分镜绑定、多Take、来源字段、SHA | 3收据、2图片Take、1视频Take，旧Take保留 |
| FFmpeg合成、ffprobe、完整解码 | 通过；未使用TTS推理 |
| 浏览器本机制作页 | 脚本断言通过 |
| 浏览器项目列表页 | 文案断言失败；诊断为测试断言不当，已回滚，不记最终通过 |
| 共享Qwen | 仅GET健康/模型/声线连通检测，0次真实推理、0次生命周期操作 |
| 收尾 | 只停止沙箱记录进程；原基线沙箱及新沙箱均保留 |

日志与安全元数据保存在本机审计目录，见SLIM_PLAN。并行安全审查未发现报告泄露密钥值；并行正确性审查发现并纠正前置条件解释问题。

## 首次回滚时的累计变化（历史状态）

有效删除0文件、0行、0字节；依赖减少0，路由减少0，表/列减少0。仅4份未提交审计报告新增/更新；git diff --stat pre-slim..HEAD为空，HEAD仍为pre-slim。

## 保留与待确认

全部原业务代码、29份迁移、LICENSE及UPSTREAM保留。示例只有上游LFS指针，正文授权未确认，不删除；通用媒体库的assetService仍被现存归档入口使用，保留；风格素材/历史截图不删除有引用或无法排除动态引用者；兼容格式保持原样。

首次回滚时阻止重启第一批的问题是零引用门禁顺序（用户现已明确批准，已解除）：是否允许逐对象在其删除之前清零，而不是要求全仓库25接口及23依赖在任何删除开始前均零使用。前置核实的完整25接口/23依赖/7迁移逐项表见 [SLIM_PLAN](SLIM_PLAN.md)。

阶段G缺口清单与最终README/AGENTS/LOCAL_MAC更新尚未执行；待瘦身继续后完成，本报告不是最终交付完成声明。

## 有效批次 1b：中转凭据配置

本批已通过真实目录与独立沙箱测试/构建、setup/start/status/health、本机制作/项目列表浏览器、两次PNG及一次MP4 curl导入、分镜绑定/旧Take/来源SHA、FFmpeg合成及完整解码；真实data/.local前后指纹一致。共享Qwen仅只读检测；沙箱已停止并保留。

| 路径 | 变更 | 原文件字节 |
| --- | --- | --- |
| 各大平台中转站配置/302ai-302.json | D | 5913 |
| 各大平台中转站配置/comfyui配置.md | D | 673 |
| 各大平台中转站配置/geeknow.json | D | 5922 |
| 各大平台中转站配置/n1n.json | D | 5913 |
| 各大平台中转站配置/stablediffusion webui接口.png | D | 67316 |
| 各大平台中转站配置/云雾ai.json | D | 5895 |
| 各大平台中转站配置/使用说明.txt | D | 108 |
| 各大平台中转站配置/向量.json | D | 5994 |
| 各大平台中转站配置/官方即梦2.0配置.png | D | 83007 |
| 各大平台中转站配置/调用本地反向代理即梦freeapi的配置.png | D | 99298 |
| 各大平台中转站配置/飞儿api-ffir.cn.json | D | 5886 |

本批有效删除 11 文件，285925 字节。证据和日志：/var/folders/90/l9wxyby101xb8xvjw64v9cz00000gn/T/muforge-slim-e-preflight-r3rci6rn/batch1b。前文回滚尝试仅作过程记录，不影响本次独立重验结果。

## 有效批次 2：Windows平台与外部工具残留

本批已通过真实目录与独立沙箱测试/构建、setup/start/status/health、本机制作/项目列表浏览器、两次PNG及一次MP4 curl导入、分镜绑定/旧Take/来源SHA、FFmpeg合成及完整解码；真实data/.local前后指纹一致。共享Qwen仅只读检测；沙箱已停止并保留。

| 路径 | 变更 | 原文件字节 |
| --- | --- | --- |
| backend-node/tools/ffmpeg/ffmpeg.exe | D | 99264000 |
| openclaw-skill/README.md | D | 3719 |
| openclaw-skill/SKILL.md | D | 18073 |
| openclaw-skill/skill.json | D | 1280 |
| openclaw-skill/tools.json | D | 614 |
| run_dev.bat | D | 766 |
| run_dev.ps1 | D | 678 |

本批有效删除 7 文件，99289130 字节。证据和日志：/var/folders/90/l9wxyby101xb8xvjw64v9cz00000gn/T/muforge-slim-e-preflight-r3rci6rn/batch2。前文回滚尝试仅作过程记录，不影响本次独立重验结果。

## 有效批次 3：Electron退休与历史迁移归档

本批已通过真实目录与独立沙箱测试/构建、setup/start/status/health、本机制作/项目列表浏览器、两次PNG及一次MP4 curl导入、分镜绑定/旧Take/来源SHA、FFmpeg合成及完整解码；真实data/.local前后指纹一致。共享Qwen仅只读检测；沙箱已停止并保留。

| 路径 | 变更 | 原文件字节 |
| --- | --- | --- |
| .github/workflows/release.yml | D | 2078 |
| README.md | M | 2971 |
| backend-node/migrations/archive/README.md | A | 0 |
| desktop/scripts/initial-migrations/01_init.sql → backend-node/migrations/archive/desktop-initial/01_init.sql | R100 | 6174 |
| desktop/scripts/initial-migrations/02_add_default_model.sql → backend-node/migrations/archive/desktop-initial/02_add_default_model.sql | R100 | 139 |
| desktop/scripts/initial-migrations/03_add_props_episode_id.sql → backend-node/migrations/archive/desktop-initial/03_add_props_episode_id.sql | R100 | 143 |
| desktop/scripts/initial-migrations/04_async_tasks_columns.sql → backend-node/migrations/archive/desktop-initial/04_async_tasks_columns.sql | R100 | 239 |
| desktop/scripts/initial-migrations/05_add_image_generations_columns.sql → backend-node/migrations/archive/desktop-initial/05_add_image_generations_columns.sql | R100 | 180 |
| desktop/scripts/initial-migrations/06_add_characters_local_path.sql → backend-node/migrations/archive/desktop-initial/06_add_characters_local_path.sql | R100 | 96 |
| desktop/scripts/initial-migrations/07_add_scenes_image_columns.sql → backend-node/migrations/archive/desktop-initial/07_add_scenes_image_columns.sql | R100 | 146 |
| backend-node/test/agent-routes.test.js | M | 3836 |
| desktop/.npmrc | D | 136 |
| desktop/README.md | D | 5924 |
| desktop/dist-cn.bat | D | 46 |
| desktop/dist-mac.sh | D | 1457 |
| desktop/dist/builder-debug.yml | D | 6029 |
| desktop/dist/builder-effective-config.yaml | D | 131 |
| desktop/electron-builder-lite.json | D | 963 |
| desktop/electron-builder-mac-lite.json | D | 829 |
| desktop/electron-builder-mac.json | D | 920 |
| desktop/ffmpeg-mac/README.txt | D | 436 |
| desktop/main.js | D | 10725 |
| desktop/package-lock.json | D | 284503 |
| desktop/package.json | D | 2695 |
| desktop/scripts/clean-win-unpacked.js | D | 1841 |
| desktop/scripts/copy-backend.js | D | 1388 |
| desktop/scripts/copy-front.js | D | 515 |
| desktop/scripts/dist-cn.js | D | 1885 |
| docs/SLIM_PLAN.md | M | 59517 |
| docs/UPSTREAM.md | M | 1701 |

本批有效删除 18 文件，322501 字节。证据和日志：/var/folders/90/l9wxyby101xb8xvjw64v9cz00000gn/T/muforge-slim-e-preflight-r3rci6rn/batch3。前文回滚尝试仅作过程记录，不影响本次独立重验结果。

## 有效批次 4b：Mastra工具型助手功能单元

本批已通过真实目录与独立沙箱测试/构建、setup/start/status/health、本机制作/项目列表浏览器、两次PNG及一次MP4 curl导入、分镜绑定/旧Take/来源SHA、FFmpeg合成及完整解码；真实data/.local前后指纹一致。共享Qwen仅只读检测；沙箱已停止并保留。

| 路径 | 变更 | 原文件字节 |
| --- | --- | --- |
| backend-node/skills/short-drama/SKILL.md | D | 698 |
| backend-node/src/mastra/context.mjs | D | 3975 |
| backend-node/src/mastra/index.mjs | D | 12143 |
| backend-node/src/mastra/model.mjs | D | 1199 |
| backend-node/src/mastra/skills.mjs | D | 1108 |
| backend-node/src/mastra/sse.mjs | D | 1811 |
| backend-node/src/mastra/tools.mjs | D | 13395 |
| backend-node/src/routes/agent.js | D | 3366 |
| backend-node/src/routes/index.js | M | 16849 |
| backend-node/src/server.js | M | 1729 |
| backend-node/test/agent-context.test.js | D | 2016 |
| backend-node/test/agent-model-skills.test.js | D | 4319 |
| backend-node/test/agent-routes.test.js | D | 3695 |
| backend-node/test/agent-tools.test.js | D | 10155 |
| backend-node/test/helpers/agentTestDb.js | D | 5438 |
| docs/superpowers/plans/2026-10-16-mastra-agent.md | D | 34730 |
| docs/superpowers/specs/2026-10-16-mastra-agent-design.md | D | 13569 |
| frontweb/src/App.vue | M | 1136 |
| frontweb/src/api/agent.js | D | 1427 |
| frontweb/src/components/AgentDrawer.vue | D | 8159 |
| frontweb/src/stores/agentContext.js | D | 525 |
| frontweb/src/utils/agentStream.js | D | 451 |
| frontweb/src/views/DramaCanvas.vue | M | 35407 |
| frontweb/src/views/DramaDetail.vue | M | 71957 |
| frontweb/src/views/FilmCreate.vue | M | 432897 |
| frontweb/test/agentStream.test.js | D | 510 |

本批有效删除 20 文件，122689 字节。证据和日志：/var/folders/90/l9wxyby101xb8xvjw64v9cz00000gn/T/muforge-slim-e-preflight-r3rci6rn/batch4b。前文回滚尝试仅作过程记录，不影响本次独立重验结果。

助手批次首轮回滚说明：batch4 的启动验收发现残留 createAgentHandlers 工厂调用，整批代码已立即恢复并停止沙箱；删除遗漏的工厂调用后，以新的独立clone/空库batch4b完整重验通过。属于已解释并修正的删除悬空引用，没有扩大功能范围。并行只读审查通过。
