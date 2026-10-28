---
name: higgsfield-cinema
description: "Higgsfield 官方 AI 电影工业化制作工作流（The New Playbook）。基于 Higgsfield 官方 21 分钟大师课，涵盖：角色多板设计表生成、4图质感降噪（去塑料感 Deslop）、Video Element 动态视频资产制作（真人录音驱动自然面部微动与神态）、Room Tour 与走位图（Blocking Map）锁定空间物理、Claude 导演三大核心技能（Scene Prompt 分镜结构化、Fight Choreography 物理格斗武指、Hixel Acting 斯坦尼目标策略表演）、原视频多机位重拍（Video-to-Video Re-Coverage）、Forward Extend 延伸与 480p 草稿/1080p 交付控本法则。当用户提到 Higgsfield、AI电影大师课、The New Playbook、动态视频资产、去塑料感贴图、动作格斗提示词、走位图Blocking、Re-Coverage多机位重拍时使用。"
---

# Higgsfield AI 电影工业制作工作流 (The New Playbook)

本 Skill 提炼自 Higgsfield 官方大师课《Forget Everything You Know About AI Filmmaking. Here's the New Playbook》。提供从角色设计、去塑料感贴图、动态视频资产、空间走位锁定、物理格斗武指、斯坦尼表演指导到多机位重拍的全套端到端实战法则。

## 核心模型快速参考

| 用途 | 模型参数名 | 备注 |
|:---|:---|:---|
| 角色/场景图像（便宜、创意强） | `soul_cinematic` | Ron、场景图首选 |
| 纹理细化/去塑料感 Deslop | `seedream_v5_pro` | 视频里口语称"Cream" |
| 初始角色生成（带人像参考） | GPT Image 2.5 | Image-to-Image 模式，用于 Adam |
| 视频资产 + 所有正片分镜 | `seedance_2_5` | 视频资产 10s/16:9/1080p，正片 30s/21:9/1080p |

---

## 阶段一：资产工程化与角色三联板设计

严禁生成孤立的单张半身像作为角色参考。必须生成多面板设计表（Character Sheet）：

### 1. 角色设计表提示词模板 (Multi-Panel Character Sheet)
```text
'COMPOSITION': {
  'Framing': 'three equal vertical panels side by side, two full-figure and one face close-up',
  'Layout': 'LEFT panel — full-length front view, head to shoes, planted confident stance; CENTER panel — full-length back view of the same figure at identical scale showing hair, shoulders, back and trousers; RIGHT panel — a large tight close-up of face filling the panel, looking directly into the camera; thin gaps between panels, balanced grey negative space, matched scale and lighting across all three',
  'Perspective': 'straight-on eye-level, static, front and rear elevations plus face close-up, no distortion'
},
'Subject Characteristics': '[详细面部特征、伤疤、骨骼、发型、肤色微观细节]',
'Color Palette': '70% [主服装颜色与材质], 18% cool neutral grey backdrop, 12% [肤色、发色与点缀金属]',
'Texture': 'Cinematic film still texture with fine organic grain, visible skin pores, true-to-life proportions, no visible logos, patches or text.'
```

---

## 阶段二：纹理细化与去塑料感 (Texture Refinement / Deslop)

避免图像模型（如 GPT Image）生成的角色在动态化时产生“蜡质皮肤、死发丝、流动噪点（Crawling Artifacts）”：
1. **4 图材质组合输入**：
   - 角色初步设计表
   - 真实高精毛发微距参考图（Hair Reference）
   - 真实高精毛孔与血管参考图（Skin Reference）
   - 真实服装织物微观纹理图（Fabric Reference）
2. **细化提示词指令**：
   - “从图1提取发丝边缘毛流与高光；从图2提取自然毛孔与微小血管泛红（拒绝光滑塑料蜡皮）；从图3提取皮革缝线与折痕；五官骨骼与比例保持与主体图 100% 绝对一致。”

---

## 阶段三：动态视频资产 (Video Element)

**核心铁律：永远用视频资产（Video Element）替代单张图片资产！**
- 单张图只能传递“长相”，给不了“面部肌肉动态、眼神流转与说话节奏”。
- **制作流程**：
  1. 角色三面图 + 人类真人语音（甚至手机录制一段随性的语气词与句子，带有自然呼吸和停顿）。
  2. 生成 **10 秒**基础视频资产（`duration=10, seedance_2_5, 1080p, 16:9`）。Prompt 核心：保留外貌、三 quarter 面角、轻微头部转动、眨眼与静默呼吸，挂载附加真人语音录音（无需台词，音质与语气比内容更重要）。
  3. 将该视频在 Cinema Studio 命名保存为 `@char_name_video_v1`。
  4. 后续所有正片分镜，全部挂载该 Video Element，彻底消除木偶脸与机械假嘴。

---

## 阶段四：空间漫游与走位图 (Room Tour & Blocking Map)

防止双人打斗或对话时角色越轴、瞬移、左右站位颠倒：
1. **Room Tour**：用 Seedance 生成一段空房间 360 度镜头漫游。
2. **Blocking Reference 图**：
   - 截取鸟瞰或高机位全景帧。
   - 标出双方起始点（如：Adam 在门前红点，Victor 在沙发前蓝点）。
   - 将图喂入模型并声明：`Blocking Reference: use for initial physical positions. Do not mirror or flip characters.`
3. **缩小战场原则（Shrink the Stage）**：动作戏范围收窄在 2 米核心物理区域（如“沙发周围 2 米内”），避免扩散模型空间发散。
4. **两面机位（Two-Sided Room）**：对话戏设定清晰的正反打背景基准（如 Victor 身后永远是沙发，Adam 身后永远是木门）。

---

## 阶段五：Claude 导演的三大专业 Skill

### 1. 场景结构化分镜技能 (Scene Prompt Skill)
分镜提示词必须包含六大核心模块：
- **ELEMENTS**: 绑定的资产 Tag（`@char_adam`, `@loc_study`, `@prop_bike`）。
- **OBJECTS & FRAMING**: 前景遮挡物、景深参考物（如通过桌角威士忌酒杯穿透构图）。
- **CAMERA**: 镜头规格（如 24mm Anamorphic 宽银幕视角，椭圆焦外光斑）、机位倾角与运镜速度。
- **ACTION TIMING (秒级时间轴)**：
  - `00-04s`: 站姿、重心与环境审视
  - `04-08s`: 启动动作与脚步位移
  - `08-12s`: 核心接触与结果反馈
- **LIGHTING**: 主光、轮廓光、暗部细节保留（lifted blacks, never crushed）。
- **SOUND & DIALOGUE**: 逐字台词（word-for-word），严禁 AI 自由发挥。

### 2. 物理格斗武指技能 (Fight Choreography Skill)
- 动作严禁虚焦概括。必须写出：**进攻方重心 -> 击打路线 -> 受力部位 -> 受力方力学反馈与倒地轨迹**。
- **中景交代招式，特写展现肉体冲击**。
- **动作剪辑点（Cut on Movement & Whip-Pan）**：在打斗高潮处安排急速横移甩镜头（Whip-pan），利用高速模糊无缝隐藏两个不同生成 Take 的接缝。

### 3. 斯坦尼表演技能 (Hixel Acting Skill)
- **TACTIC（行动策略）注入**：
  - 角色每一句台词和眼神必须服务于内心目标。
  - 示例：“`TACTIC: no hurry that shows. He rides steady, upright, shoulders down, hands quiet on the bars; the speed is in the world moving past him, not in him.`”
  - 情绪泄露于微表情（微小的眼神下垂、喉结吞咽、嘴角抽动），禁止夸张的面部失真。

---

## 阶段六：原片多机位重拍 (Video-to-Video Re-Coverage)

当生成了一段动作物理与节奏完美的 30 秒母片（如 `<<<video_29>>>`）：
- **重拍指令模版**：
```text
— THE FIGHT, RE-COVERAGE of the reference video. 30.0 s.
<<<video_29>>> is the SOURCE: the same fight, the same two fighters, the same room, the same thirty seconds — every movement the two men make in <<<video_29>>> they make here, at the same second, in the same place in the room, with the same result.
What is NEW is the CAMERA and the SPEED:
1. The camera: Cover the same fight in SEVEN STRANGE SHOTS with a hard cut every 4.4 seconds. Every one of them a DUTCH ANGLE (tipped 25 to 35 degrees), wide and medium, shot THROUGH OBJECTS (through decanter glasses, up through glass table, past banker lamp).
2. The speed: REAL SPEED from the first frame to the last. Every movement performed at the speed a real human body moves.
REFERENCES: <<<video_29>>> is MOTION and PERFORMANCE reference.
```

---

## 阶段七：算力与后期延伸控制 (Production Rules)

1. **480p 草稿原则 (The 480p Rule)**：所有盲抽探索、构图确认、走位测试全部在 480p 下执行。仅对中选的胜出 Take 在 1080p 重建，节约 80% 算力点数。
2. **Forward Extend**：动作在视频末尾差 2 秒收尾时，使用 Cinema Studio 的前向延伸功能补足收招或特写推镜头，杜绝废片重拍。
3. **台词重合剪辑点 (Audio Overlap)**：生成下一镜头时，包含前一镜头最后半句台词，为剪辑台提供无缝重叠裁切余量。
