# MuForge 瘦身基线（阶段 A 通过，删除前）

- 基准提交：`79a1f48c5f6320b386a10635b41ce277536e121c`；分支 `slim/focus`；保护标签 `pre-slim`。
- 本轮仅获准执行 A/B 与方案草稿；未删除文件、未修改运行代码、未提交或推送。
- 两层隔离：真实目录只运行统计、npm ls、测试和前端构建；setup/start/stop 只能在沙箱执行。

## 第 1 层：真实目录只读验证

| 检查 | 结果 |
| --- | --- |
| 开始 Git 状态 | `slim/focus`，工作区干净 |
| 后端测试 | 142 项通过，0 失败、0 跳过 |
| 前端测试 | 20 项通过，0 失败、0 跳过 |
| 前端构建 | 成功；仍有上游大 chunk 警告，未改变阈值 |
| 运行数据保护 | 测试后、构建后两次比对均完全一致 |
| 真实服务操作 | 未运行 setup/start/stop；未向真实 MuForge 发出 HTTP 请求 |

指纹包括每个条目的相对路径、类型、大小、mtime 纳秒值；常规文件逐字节计算 SHA-256，符号链接不跟随。仅读取，不修改、恢复或覆盖任何用户数据。

| 受保护目录 | 文件及子目录条目数 | 测试后 | 构建后 |
| --- | ---: | --- | --- |
| `backend-node/data/` | 15 | 完全一致 | 完全一致 |
| `.local/` | 11 | 完全一致 | 完全一致 |

完整前后指纹与原始日志保存在本机 `/tmp/muforge-slim-audit-me4faz31`，未放入用户数据目录，也不提交到 Git。

## 体积与文件数

- `du -sh .`：`548M	.`，含 Git、node_modules 和被忽略的运行数据，不等于可删除源码体积。
- Git 跟踪文件数：401。
- `git count-objects -vH`：

```text
count: 96
size: 740.00 KiB
in-pack: 3490
packs: 2
size-pack: 83.72 MiB
prune-packable: 0
garbage: 0
size-garbage: 0 bytes
```

| 顶层路径 | 实际磁盘占用 KiB |
| --- | ---: |
| `backend-node` | 325452 |
| `frontweb` | 139984 |
| `.git` | 86680 |
| `项目截图` | 7016 |
| `docs` | 1136 |
| `desktop` | 396 |
| `各大平台中转站配置` | 308 |
| `.local` | 272 |
| `CHANGELOG.md` | 44 |
| `openclaw-skill` | 32 |
| `.github` | 24 |
| `scripts` | 8 |
| `tasks` | 8 |
| `.gitattributes` | 4 |
| `.gitignore` | 4 |
| `AGENTS.md` | 4 |
| `CODE_OF_CONDUCT.md` | 4 |
| `CONTRIBUTING.md` | 4 |
| `LICENSE` | 4 |
| `README.md` | 4 |
| `SECURITY.md` | 4 |
| `example_drama` | 4 |
| `index.html` | 4 |
| `run_dev.bat` | 4 |
| `run_dev.ps1` | 4 |
| `停止幕匠.command` | 4 |
| `启动幕匠.command` | 4 |

## npm ls --depth=0

| 子项目 | 退出码 | 声明的直接依赖/开发依赖数 | 状态 |
| --- | ---: | ---: | --- |
| `backend-node` | 0 | 15 | 已安装，检查通过 |
| `frontweb` | 0 | 12 | 已安装，检查通过 |
| `desktop` | 1 | 17 | 未安装 desktop/node_modules，报告缺失依赖；未补装 Electron |

desktop 的缺失是安装状态盘点，不能当作 Electron 已通过基线。用户已选择后续移除 desktop；本轮不安装或删除它。

## 第 2 层：沙箱验证

用户已自行停止真实 5679 实例。助手未运行真实目录的 setup/start/stop；随后确认端口已释放，共享 Qwen 仍为原 PID 21434。

- 沙箱：`/tmp/muforge-sandbox`，从真实仓库克隆 `pre-slim`（79a1f48），初始无 data/.local/node_modules。
- 前后端分别执行 `npm ci --ignore-scripts --no-audit --no-fund`，未复用真实目录 node_modules；仅在沙箱重建 better-sqlite3。
- setup/start 使用仓库外审计守卫 `/tmp/muforge-slim-audit-me4faz31/no-shared-start.cjs`。守卫只会阻止共享 Qwen 的 service.sh 生命周期操作，不修改或替代应用功能；沙箱源码 `git status --short` 为空。
- 端口：完整启停脚本仍固定 5679。真实实例已停止后使用该端口，未抢占真实进程；未启动 Vite 3013。

| 沙箱检查 | 结果 |
| --- | --- |
| setup | 成功；空库迁移和 Qwen 配置注册均只在沙箱发生 |
| start / status | 成功；沙箱 PID 26785，健康检查与进程归属核对通过 |
| /health | status=ok |
| /local-production | Ego 真实浏览器打开成功，正确显示 MuForge 与本地 Qwen 连通状态 |
| 项目列表 | Ego 真实浏览器打开成功 |
| curl 图片导入 | 导入两张沙箱生成的小 PNG 到同一分镜；旧文件仍在、SHA-256 不变、保留 2 个图片记录 |
| curl 视频导入 | 导入沙箱 FFmpeg 生成的小 MP4；视频绑定正确，保留 1 个视频记录 |
| 首帧与来源 | 首帧绑定 ID 有效；3 条导入来源记录保留提示词、模板/模型、任务标记及 SHA-256；均明确是本地审计样本，非实际 AI 生成 |
| FFmpeg 合成 | 通过正常 episodes finalize 接口完成；合成输出 H.264 128×72 / AAC 48 kHz 单声道，时长约 1.021 秒，完整解码通过 |
| 共享 Qwen 只读检测 | /health、工具状态与声音列表读取通过；未调用语音合成、设计声线或生命周期操作 |
| 真实 Qwen 配音试听 | 用户后续批准一次真实推理，已通过；详见下方删除前配音基线 |
| stop | 已执行，仅结束沙箱记录的进程；5679 释放，8880 原 Qwen 进程继续运行 |
| 真实数据复核 | 沙箱运行前后文件清单、大小、mtime、SHA-256 完全一致 |

用户自行停止真实实例后，原 SQLite WAL/SHM 和 PID 的正常退出变化不算作测试写入。沙箱阶段重新取证：真实 data/ 13 个条目、.local/ 10 个条目，前后完全一致；对应 before-sandbox.json、after-sandbox.json 和 sandbox-integrity-comparison.json 均在上述审计目录。

沙箱与测试证据已保留，没有删除。合成样片自带本地生成的测试音轨，不可当作 Qwen 配音试听通过。

## 这是删除前的配音基线

用户明确批准：只通过沙箱正常配音入口调用一次共享 Qwen，不并发、不自动重试；不调用共享 service.sh，不改配置、模型、默认声线或登记数据。

调用前 GET /health 返回 ok、clone/design 模型文件就绪；检查时 8880 无 ESTABLISHED 客户端连接，服务进程 CPU 约 0.1%。健康接口没有原子 busy/队列字段，因此空闲依据为当时的只读观测，不声称具有跨进程互斥保证。

| 项目 | 实测结果 |
| --- | --- |
| 请求时间 UTC | `2026-10-27T06:24:42Z` |
| 入口 | `沙箱 POST /api/v1/audio/extract → 共享 /v1/audio/speech` |
| 模型 | `qwen3-tts` |
| 声线 | `audition_01` |
| 台词 | `现在开始测试本地配音。` |
| 字符数 | `11` |
| 推理请求数 / 重试数 | `1 / 0` |
| 超时上限 | `600 秒（沿用项目现有设置）` |
| 耗时 | `24.564 秒` |
| 格式 / 编码 | `wav / pcm_s24le` |
| 采样率 / 声道 | `48000 Hz / 1` |
| 时长 | `2.48 秒` |
| 文件大小 | `357222 字节` |
| SHA-256 | `740de1f7481fc7263c82d5bfa9f95b1a0f2119cde4eae1a8f4519c462f141619` |
| 平均 / 最大音量 | `-19.8 / -3.9 dB` |
| 输出位置 | `/private/tmp/muforge-sandbox/backend-node/data/storage/audio/tts_sb1_163f2d80.wav` |
| 真实目录保护 | `before-tts.json 与 after-tts.json 完全一致` |
| 结束状态 | `仅停止沙箱；共享 Qwen 原 PID 21434 保持运行` |

ffprobe 与 FFmpeg 完整解码、volumedetect 已通过；这些证明格式和非静音，不代替人耳对音色、表演与口型的验收。音频仅在沙箱中保存，没有复制到真实 data/ 或报告目录。请求、响应和测量元数据在沙箱 .local/slim-tts-*；真实目录指纹证据在 /tmp/muforge-slim-audit-me4faz31。

## 后续推理预算与当前结论

- 阶段 E 每批只对共享 Qwen 做只读连通检测；不重复本次推理。
- 全部瘦身结束后的最终验收允许再调用一次，继续使用同一台词与 audition_01，比对格式、时长，不要求音频逐字节一致。
- 如果某批触及 TTS 代码，按用户要求先告知，再额外验证一次；任何失败均不自动重试。
- 阶段 A 已通过，阶段 B 只读盘点已完成；本轮未删除、提交、推送或实现新功能。

## 只读盘点结束复核

阶段 B 完成后再次记录真实用户目录文件清单、大小、mtime_ns 与 SHA-256，与 after-tts 快照完全一致：backend-node/data/ 13 个条目、.local/ 10 个条目。证据为本机审计目录的 after-inventory.json。沙箱保持停止且保留。

完整盘点见 [SLIM_INVENTORY](SLIM_INVENTORY.md)，分类与分批方案草稿见 [SLIM_PLAN](SLIM_PLAN.md)。仅新增三份审计报告；等待用户审阅，不进入删除阶段。
