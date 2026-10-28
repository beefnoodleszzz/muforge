# MuForge 真实生产｜产物已归档，制作质量未通过

**用户审看未通过：口型与配音不匹配、男女同声线、动作慢且AI味重。先审核代码与制作方法，不自动追加生成。**

**禁止按下方旧交接重复生成。** 最新结果：final.mp4已生成并导入（import_id28 / merge_id2），48秒、1080×1920、24fps、H.264/AAC48kHz；源视频720p放大。当前无在途任务。

图片累计11张（单对象均1/2）、可灵8/10任务共432点、Qwen8/10请求；8视频全部COMPLETED，8句已入库。12项为9通过、3未通过（S06单动作偏差、未语义听审、工具溯源字段未返回）。完整证据和待人工决定见[PROD_TEST_REPORT.md](PROD_TEST_REPORT.md)，唯一资产状态仍为成果目录manifest.json。不要自动重做、追加推理或重复导入。

代码审核交接见 [REVIEW_HANDOFF.md](REVIEW_HANDOFF.md)；项目级导演技能为 `.agents/skills/higgsfield-cinema/SKILL.md`。当前用户已明确授权将代码整合至main并push供他人审核，下方历史“禁止push”不覆盖这次新授权；不允许force push、改写历史或追加付费生成。

以下保留原交接作为历史记录：

---

# MuForge 真实生产｜新会话交接

直接继续创作，阶段0已完成。不要重跑瘦身/全仓审计/无变化的整套测试，不重建已有角色/剧集，不重复生成已有图。没有在途生成任务。

## 位置与当前状态
- 真实代码仓库：/Users/zhangxiaolong/Desktop/muforge；分支fix/correctness；HEAD fef5f8c8dbcbc2bcc701c67b639bdeff10f4aa69。
- 正式生产独立clone：/tmp/muforge-prod-run-20261027；独立npm ci与空库初始化，已录入原创剧集。生产服务正在127.0.0.1:5679运行，.local/server.pid记录其PID；只读核实PID归属后复用，不抢端口。
- 成果目录：/Users/zhangxiaolong/Desktop/muforge-prod-test/2026-10-27/。虽然续做日期已到28日，继续同一目录，不分散现有成果。
- 资产唯一真相：成果目录manifest.json（含路径、提示词、SHA-256、导入回执和计数）；prompts.json（后续首帧提示词）；script.json/script.md；cost_log.md。
- 审计及辅助脚本：/tmp/muforge-prod-audit-hs7gdk7h；成果目录production_helpers有备份。
- 数据ID：drama=1，episode=1，CH01=character1，CH02=character2，SC01=scene1，E01S01…08=storyboard1…8。production-ids.json有正式映射。

## 已完成，勿重复
1. 用户指定四项正确性修复均有先RED再GREEN测试及独立提交：合成失败不得兜底首片；历史视频选片不写静帧local_path；更新分镜校验时长1–120秒及角色所属；导入增加持久幂等键/唯一索引/23号新迁移（保留旧迁移）。
2. 用户额外批准的最小支持已提交：audio→storyboard、video→episode，来源回执与幂等重复返回；媒体完整解码后才入库。文件所有权清理回归也已修复。
3. 验证clone /tmp/muforge-prod-validation-20261027：后端167/167、前端21/21、前端构建、setup/start/status/health、真实浏览器本机制作与项目列表、图片/视频/音频/成片导入、重复成片回执、FFmpeg合成与完整解码通过。验证实例已stop。真实data/.local指纹未变。详情CORRECTNESS_REPORT.md及审计validation/。
4. 剧本《换个老板》8镜×6秒=48秒，两名成年原创角色，一个会议室，8句台词，剧本已录入生产沙箱。剧本自检已通过。无正脸讲话特写，避免口型同步。
5. 已真实image_gen生成、逐张查看通过、经local-production导入6张：CH01、CH02、SC01、E01S01、E01S02、E01S03，对应import_id1…6。源文件生产clone的production/assets/，成果目录assets/有副本。外观/左右站位/文件夹位置基本一致。不是占位图。
6. E01S04此前只作提交前登记，没有调用image_gen，已撤销预占，status=not_submitted、attempt=0。不能误算已生成或跳过。

## 当前唯一下一步
生成E01S04首帧，继续S05–S08，共剩5张。先查看CH01/CH02/SC01及S03，然后使用image_gen（referenced_image_paths），沿用prompts.json的锚点和统一风格；每张检查后import。不要重新生成前三镜。之后contact_sheet，再可灵视频，再TTS，再合成。

## 授权与硬上限（延续有效，不再重复问）
- 原创都市逆袭打脸漫剧，不用真人肖像/品牌/既有IP；角色均成年人，安全内容。
- 用户明确修改规格为8镜×6秒，总48秒（目标45–60秒），竖屏9:16；最终1080×1920 H.264/AAC48kHz、统一帧率。标准档可灵720p素材再放大，报告写明非原生1080p。
- 每个角色定妆图/每个场景图/每镜首帧最多2候选。本项目2角色、1场景、8首帧，每对象最多2；不能用全局22来突破任一对象2张。当前6张全部首候选，无重做。
- 可灵每镜1正式任务，失败最多重试1，整个任务总数硬上限10。当前0/10。
- Qwen每句一次，最多重试一次，整体8句+2=10；顺序不并发。当前0/10。仅audition_01，原创非private，多角色同声线如实记录限制。地址http://127.0.0.1:8880/v1、配置模型qwen3-tts；只正常推理，不修改共享任何状态。
- 每次付费/推理提交前cost_log记用途、当前计数/上限；失败请求也记账，不凭超时自动重提。
- 不push、不改写历史；不碰真实仓库backend-node/data/或.local/，不碰~/AI/local-dubbing和共享Qwen配置/模型/默认声线。所有运行/入库/媒体仅生产clone及成果目录。媒体不进Git。
- 启动器遗留自动启动Qwen分支，任何本地脚本setup/start必须node --require /tmp/muforge-prod-audit-hs7gdk7h/no-shared-start.cjs scripts/local.mjs ...；guard阻断service.sh。不调用共享service.sh，不启停共享Qwen。
- 立即停止并报告：工具不可用/鉴权失败/额度不足、将超预算、同一生产环节连续失败2次、新疑似密钥、需要启停共享服务、生成违反内容安全。不要替代、伪造或重试掩盖。

## 工具与流程（只读复核，不重做环境工程）
- 图片仅内置image_gen。技能imagegen+gpt-image-2-style-library，已选character-design-sheet模板并读style-library参考；后续必要时只读对应模板，不整库重读。short-drama-agent/higgsfield方法用于锚点、单动作、固定轴线；用户既有预算授权覆盖技能的重复付款确认。
- 工具输出仅image_url和output_hint，未返回模型/任务ID/耗时/额度：必须写“工具未返回”。不要将文件UUID充当任务ID。manifest另有local_elapsed_seconds，只是本机墙钟观察，不能冒充工具返回耗时。
- 可灵官方MCP连接已确认，who_am_i版本1.3.3。新会话调用who_am_i取最新参数，不输出完整用户资料。支持6秒720p的I2V有v3_0_turbo/v3_0/v4_0，默认v4_0；依据当次规格选标准档单镜头，不能误用pro，不能发付费试验任务。现阶段尚未选定/提交任何视频模型。
- MCP生成信封：model正式名称，arguments=[{name,value字符串}]，inputs=[{name:'first_image',inputType:'URL',url:公开上传URL}]；字段仅取who_am_i声明。
- 本地图片需file_upload申请ticket，然后multipart上传ticket+file到upload_url；ticket疑似凭据不打印；将返回URL用于I2V。不能直接传本地路径。所有工具用同一taskTraceId UUIDv7（尚未创建，首次视频时新建）。生成后保存真实generationId、creditsConsumed；query_tasks只轮询真实ID，不重复提交。
- 每镜首帧I2V：动作/运镜/情绪/保持外观；不要台词文字；720p、6秒、imageCount1。下载后ffprobe时长/尺寸/编码，抽首中尾3帧查看脸/肢体/闪烁；通过后import视频，保留旧Take。
- TTS走POST /api/v1/audio/extract，body={storyboard_id,text,voice_id:'audition_01'}，最长600秒，每句顺序一次。输出local_path只在沙箱storage下取文件，再经local-production音频导入写来源回执（正常入口的绑定本身不是导入回执）。先GET共享/health与/v1/voices，只显示非private可用声线，不输出private信息。
- audio/extract返回local_path/url，不返回实际模型/任务ID/耗时；这些真实回执缺失字段同样标“工具未返回”，另记录请求模型qwen3-tts与本地墙钟。ffprobe WAV必须48k单声道，volumedetect非静音；台词超6秒先精简，变速不得超过±10%。
- 所有素材POST /api/v1/local-production/import multipart：kind=image/video/audio、target_type=character/scene/storyboard/episode、target_id、file、prompt、style_template、model、generation_id。缺工具字段填“工具未返回”，不要捏造。服务算SHA。首次201、重传200、duplicate=true；同目标同类型同SHA不加Take、不回退当前选择。audio仅storyboard；成片video→episode，会创建video_merges并绑定episodes。
- 辅助assets.py：reserve/complete-image/import（见源码，先读用法；reserve最多2次每对象，总计数image22仅额外保护）；目前仅实现图片完成操作，后续Kling/TTS自己最小扩展本地工作脚本，不改产品代码。

## 合成与交付要求
优先项目POST /api/v1/episodes/1/finalize。burn_dialogue_audio可用；burn_narration_subtitles=false（不要触发二次TTS）。实际库里scene_id字段常指storyboard_id，保持现有流程。合成后用FFmpeg补精确对白字幕、固定“AI生成”角标、统一1080×1920、H.264/AAC48kHz、响度loudnorm约-16LUFS。硬切统一即可。绝不单片段兜底；失败明确failed，有降级必须_DEGRADED。
字幕在离底边15–20%的安全区，清晰不挡主体；每句按实际音频时长排布，讲话镜头不用正脸大特写。ffprobe规格、完整解码、volumedetect、loudnorm实测、每镜截帧拼图验证。声音试听只能据实际音频能力如实判断，不能把数值检测冒充语义听审。
最终成片再kind=video,target_type=episode,target_id=1导入；全媒体有来源回执，媒体不入Git。
成果目录必须有final.mp4、contact_sheet.png、script.json、provenance.csv（素材类型/镜头或角色/提示词/工具/模型/任务ID/耗时/文件/SHA256/状态）、cost_log.md、PROD_TEST_REPORT.md；文本报告副本放真实仓库docs/prod-test/。当前provenance.csv为6张图的阶段快照，需继续追加，不重建丢记录。
报告12项逐项通过/不通过+证据：开场冲突；单动作6秒；角色一致附图；无崩坏；台词清晰匹配；字幕安全区；响度无爆音/意外静音；规格；AI标识；溯源字段完整；未超预算；无隐式降级。字段工具未返回时诚实记缺口，不伪称12项全过。最多3条改进建议。
最终回复保持5项：成片路径规格、12项结果、失败/降级、实际用量/工具额度、待用户决定。

## 代码与证据索引
- docs/prod-test/CORRECTNESS_REPORT.md、script.json/md；前者有尚未提交的最终验收补记，后两者未跟踪。不丢弃或重置；不自动commit交接。
- 实现提交0b257ef、c96ba38、78f17b1、819d42c、53b9ec5、fef5f8c（后者是导入扩展）。
- 真实指纹baseline：/tmp/muforge-prod-audit-hs7gdk7h/real-before-correctness.json；后续snapshot.py在/ tmp旧审计路径，production_helpers有备份；只读取真实目录metadata/hash。
- /tmp/muforge-prod-audit-hs7gdk7h/validation/verification.json及日志为当前fef5f8c证据。纯制作没有代码变化，不需要再全量回归。
- Ego Browser同一目标TaskSpace ID10，page p1；若需要制作UI观察复用该空间，不新建多个。
- 当前没有在途生成、没有可灵任务ID、没有TTS请求，不要轮询或补造。

## 节奏
用户已明确反馈1.5小时过慢。现在只做创作闭环，不扩大开发/审计；读此文件、manifest、剧本并核实服务后立即S04；每完成素材更新manifest/回执，按可见里程碑汇报。生图/云端视频耗时不可控，不承诺虚假交付分钟数。不要反复加载完整技能库或历史报告。
