# MuForge · 幕匠

A local AI short-drama and motion-comic workbench for macOS, derived from [LocalMiniDrama](https://github.com/xuanyustudio/LocalMiniDrama) under the MIT license.

MuForge keeps projects, characters, scenes, props, storyboards, and production assets organized locally. Codex assists with writing, optimizes image prompts with the style-library skill, calls built-in `image_gen`, and submits authorized video jobs through the official Kling MCP. Qwen3-TTS runs on this Mac for speech synthesis. Generated assets are imported back into the project before editing and merging.

## Run locally

Double-click `启动幕匠.command`, or use:

```bash
node scripts/local.mjs setup
node scripts/local.mjs start
node scripts/local.mjs status
node scripts/local.mjs stop
```

Open [Local production](http://127.0.0.1:5679/local-production) or the [project list](http://127.0.0.1:5679/). The app listens on loopback only. Qwen3-TTS normally uses `http://127.0.0.1:8880/v1`.

The image and video tools are invoked from a Codex session; they are not browser-side API integrations. The in-app text assistant needs a separately configured text model. Electron packaging sources are included, but this setup targets the local web service first.

See the [Chinese README](../README.md), [Mac setup](LOCAL_MAC.md), and [upstream attribution](UPSTREAM.md). The original copyright and [MIT license](../LICENSE) remain intact. The project repository is [beefnoodleszzz/muforge](https://github.com/beefnoodleszzz/muforge); packaged releases require separate build verification.
