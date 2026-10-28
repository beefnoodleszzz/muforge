# 《换个老板》真实短剧生产与验收

**用户审看结论：制作质量未通过。** 配音与嘴型不匹配、男女角色实际共用一种声音、动作缓慢且AI感明显。下文“9项通过、3项未通过”是此前的技术及抽样检查记录，不能作为成片制作质量通过的结论。

本次使用静默图生视频后叠加配音，没有音频驱动或口型同步；也未落实 higgsfield-cinema 的动态角色资产、逐字台词与正常动作速度等关键制作方法。方法偏差与审核入口见 [REVIEW_HANDOFF.md](REVIEW_HANDOFF.md)。

## 交付

- 成片：`/Users/zhangxiaolong/Desktop/muforge-prod-test/2026-10-27/final.mp4`
- 规格：48.000秒，8镜各6秒，1080×1920，H.264 / yuv420p / 24fps，AAC 48kHz。可灵源视频为720×1280，成片经Lanczos放大，**非原生1080p**。
- SHA-256：`51bc4174232886f90be5027cc20e19f08afdaaee7b30a015b062cb161f8faf1e`
- 回填：`episode=1`，`import_id=28`，`merge_id=2`；来源回执 `receipts/final_import.json`。
- 原始首帧拼图 `contact_sheet.png`；成片8镜字幕拼图 `final_contact_sheet.png`；剧本 `script.json`；逐句字幕 `dialogue.srt` / `dialogue.ass`；所有来源 `manifest.json` / `provenance.csv`。

## 12项逐项验收

| 项目 | 结果 | 证据及范围 |
|---|---|---|
| 1 开场冲突 | 通过 | S01推文件夹和字幕“你的名字，不配在上面。”直接建立署名冲突；`final_qc/E01S01.png`、script.json。语音语义另见第5项。 |
| 2 单动作6秒 | **未通过** | 最终每镜精确6秒；S06除迈步还带轻微转身，未严格满足单动作要求。S02/S03动作幅度较小。保留真实产物，不伪称完全按提示执行。 |
| 3 角色一致 | 通过（抽样） | 角色定妆、8首帧及每段首/中/尾抽帧对照，发型、服装、左右站位基本一致；contact_sheet.png、video_qc/。不保证每帧身份零漂移。 |
| 4 无崩坏 | 通过（抽样） | 24张视频首/中/尾帧未见明显脸、手、肢体崩坏；8视频及成片完整解码成功。抽帧不能排除全部瞬时闪烁，未作逐帧人工运动审看。 |
| 5 台词清晰匹配 | **未通过（听审缺失）** | 8次Qwen真实推理、台词请求及回执齐全，48kHz单声道非静音WAV，均不超过6秒；本会话无可证实的语义听审，不能用数字检测声称发音/情绪/语义全部正确。两角色同用audition_01。 |
| 6 字幕安全区 | 通过 | 白字黑描边，底边距330/1920=17.19%，字体58；按各句实际WAV时长显示。8镜抽帧可读、无乱码，不挡脸和主要道具；dialogue.ass、subtitle_timing.json、final_contact_sheet.png。 |
| 7 响度/爆音/静音 | 通过（技术范围） | 成片实测-15.97 LUFS、-1.50 dBTP，max_volume=-1.5dB，8句均非静音。各镜对白结束后保留有意停顿，无全句缺音；日志见receipts/loudnorm_final.log、volume_final.log、silence_final.log。主观音质与意外声响仍需听审。 |
| 8 输出规格 | 通过 | ffprobe=48.000秒、1080×1920、24/1、H.264、AAC48kHz；全片解码通过；receipts/final_verification.json。 |
| 9 AI标识 | 通过 | 固定左上“AI生成”，0–48秒ASS事件，8镜截图可见。保留可灵原有水印。 |
| 10 溯源字段完整 | **未通过（工具字段缺失）** | 28项媒体均有文件、SHA、提示词/处理说明与真实导入回执，8视频有真实generationId和creditsConsumed；image_gen和Qwen未返回实际模型、任务ID、耗时，可灵未返回明确耗时。均诚实标“工具未返回”，本机墙钟另列，文件UUID不当任务ID；provenance.csv、manifest.json、receipts/。 |
| 11 未超预算 | 通过 | 图片11/22，单对象1/2；可灵8/10、432点，余额18832→18400；Qwen8/10、均audition_01。无生成重试。cost_log.md。 |
| 12 无隐式降级 | 通过 | 8张既有/新首帧、8段真实可灵、8句真实Qwen均使用；项目finalize确实成功8镜，没有失败后首片兜底。最终按授权精确裁齐、放大和补字幕；无替代生成，无_DEGRADED产物。 |

## 制作与绑定实证

续做前核对服务PID15387，cwd为`/private/tmp/muforge-prod-run-20261027/backend-node`，5679健康；复用了该独立clone。没有重复瘦身、全量审计、全量测试或已有6张图片生成。

本次追加E01S04–S08首帧，分别为import_id7–11。8条可灵任务均以官方MCP当前who_am_i 1.3.3声明的默认`kling-video-v4_0`、720p、6秒、单结果提交。真实generationId、提交与完成回执存于manifest和receipts，不在报告编造耗时。各原始视频实测约6.041667秒，最终逐镜裁齐6秒。

8句Qwen经沙箱`POST /api/v1/audio/extract`顺序推理，WAV时长依次2.72、2.16、2.64、1.76、1.44、2.80、2.64、2.16秒。音频再经local-production导入，import_id20–27；只读检测共享health和授权声线，没有修改配置、模型或默认声音，没有调用service.sh。

项目`POST /api/v1/episodes/1/finalize`使用`burn_dialogue_audio=true`、`burn_narration_subtitles=false`，实际8镜，merge_id1 completed，原合成为48.374349秒，保存在project_finalize.mp4。FFmpeg精修使用8段原始视频逐段裁齐6秒，并复用项目已对齐的对白混音，添加ASS字幕和标识，完成双遍响度处理；命令及日志见receipts/render_command.json、render_final.log。没有第二次TTS、变速或替代首片。

上传环节曾把本地exec转后台状态误判为失败，E01S04另上传了一次；随后等待至完成并取回真实URL。没有重复视频生成或额外生成扣点。所有8条视频任务终态COMPLETED；当前没有在途生成或配音请求。

本次运行和入库仅在生产clone与指定成果目录；真实仓库仅新增文字报告和更新交接文本，没有执行真实data/.local迁移或运行。本次未重新扫描真实用户数据指纹，不把“未执行写入”冒充新指纹验证。未commit、push或改写历史，既有CORRECTNESS_REPORT和剧本文档保持原状。

## 尚需人工决定（最多3条）

1. 试听final.mp4，确认8句发音、情绪与字幕匹配，并接受或拒绝两角色同声线。
2. 决定是否接受S06轻微转身及部分动作较弱；本轮未为此额外消费剩余视频额度。
3. 对模型/任务ID/耗时未返回的工具保留缺口；若发布需要更严格溯源，先明确可获得字段，不补造回执。
