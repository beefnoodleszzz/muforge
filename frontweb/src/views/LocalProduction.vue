<script setup>
import { computed, onMounted, reactive, ref, shallowRef, watch } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import { dramaAPI } from '@/api/drama'

const status = shallowRef(null)
const error = shallowRef('')
const busy = shallowRef(false)
const speaking = shallowRef(false)
const importing = shallowRef(false)
const dramas = ref([])
const drama = shallowRef(null)
const dramaId = shallowRef(null)
const voice = shallowRef('audition_01')
const text = shallowRef('你好，本地短剧工作台已经准备好了。让我们从第一个镜头开始。')
const audio = shallowRef('')
const media = shallowRef('')
const file = shallowRef(null)
const form = reactive({ kind: 'image', target_type: 'storyboard', target_id: null, prompt: '', style_template: '', model: '', generation_id: '' })
const targetOptions = computed(() => {
  if (!drama.value) return []
  if (form.target_type === 'storyboard') return (drama.value.episodes || []).flatMap(ep => (ep.storyboards || []).map(sb => ({ id: sb.id, label: `第 ${ep.episode_number} 集 · 镜头 ${sb.storyboard_number} ${sb.title || ''}` })))
  const keys = { character: 'characters', scene: 'scenes', prop: 'props' }
  return (drama.value[keys[form.target_type]] || []).map(item => ({ id: item.id, label: item.name || item.location || `素材 ${item.id}` }))
})
watch(() => form.kind, kind => { media.value = ''; file.value = null; if (kind === 'video') form.target_type = 'storyboard' })
watch(() => form.target_type, () => { form.target_id = null })
watch(dramaId, async id => {
  form.target_id = null
  drama.value = null
  if (id) { try { const result = await dramaAPI.get(id); if (dramaId.value === id) drama.value = result } catch (e) { error.value = e.message } }
})

async function refresh() {
  busy.value = true
  error.value = ''
  try {
    const [state, projects] = await Promise.all([request.get('/local-production/status'), dramaAPI.list({ page_size: 100 })])
    status.value = state
    dramas.value = projects.items || []
    if (!state.tts.voices.some(v => v.voice_id === voice.value)) voice.value = state.tts.voices[0]?.voice_id || ''
  } catch (e) { error.value = e.message }
  finally { busy.value = false }
}
async function speak() {
  if (speaking.value) return
  speaking.value = true
  error.value = ''
  try {
    const result = await request.post('/audio/extract', { text: text.value, voice_id: voice.value })
    audio.value = result.url
  } catch (e) { error.value = e.message }
  finally { speaking.value = false }
}
async function importMedia() {
  if (importing.value || !file.value || !form.target_id) return
  importing.value = true
  error.value = ''
  const data = new FormData()
  data.append('file', file.value)
  Object.entries(form).forEach(([key, value]) => data.append(key, value ?? ''))
  try {
    const result = await request.post('/local-production/import', data, { headers: { 'Content-Type': 'multipart/form-data' } })
    media.value = result.url
    ElMessage.success('素材已归档并绑定，原分镜页面可直接使用')
  } catch (e) { error.value = e.message }
  finally { importing.value = false }
}
onMounted(refresh)
</script>

<template>
  <div class="production-page">
    <header class="production-header">
      <router-link to="/" class="back-link">← 项目列表</router-link>
      <span>MuForge / 本机制作</span>
      <el-button :loading="busy" @click="refresh">刷新状态</el-button>
    </header>
    <main class="production-main">
      <div class="intro">
        <p class="eyebrow">MAC · 本地制作环境</p>
        <h1>从剧本到镜头，在这里衔接。</h1>
        <p>Codex 创作与生图，可灵生成镜头，Qwen3-TTS 本地配音。素材归档后，继续在剧集和分镜页面制作。</p>
      </div>
      <el-alert v-if="error" :title="error" type="error" :closable="false" show-icon role="alert" />
      <section v-if="status" class="connections" aria-label="制作工具状态">
        <article><span class="tool-label">图片</span><h2>image_gen</h2><p>由 Codex 调用</p><small>gpt-image-2 风格库优化提示词</small></article>
        <article><span class="tool-label">视频</span><h2>可灵 MCP</h2><p>由 Codex 调用</p><small>付费生成按本次预算授权执行</small></article>
        <article><span class="tool-label">配音</span><h2>Qwen3-TTS</h2><p :class="{ ready: status.tts.ready }">{{ status.tts.ready ? '本地服务可用' : '服务未就绪' }}</p><small>{{ status.tts.message }}</small></article>
        <article><span class="tool-label">后期</span><h2>FFmpeg</h2><p :class="{ ready: status.ffmpeg }">{{ status.ffmpeg ? '本机已安装' : '未检测到' }}</p><small>剪辑合成、字幕与音轨处理</small></article>
      </section>
      <div class="production-grid">
        <section class="panel" aria-labelledby="voice-title">
          <h2 id="voice-title">本地配音试听</h2>
          <p class="hint">先试听声线，再用于分镜对白或解说。本机逐条合成，首次推理可能较慢。</p>
          <el-form label-position="top" @submit.prevent="speak">
            <el-form-item label="声线">
              <el-select v-model="voice" aria-label="声线" placeholder="选择本地声线" style="width: 100%">
                <el-option v-for="v in status?.tts.voices || []" :key="v.voice_id" :value="v.voice_id" :label="v.voice_id" />
              </el-select>
            </el-form-item>
            <el-form-item label="试听台词">
              <el-input v-model="text" aria-label="试听台词" type="textarea" :rows="5" :maxlength="5000" show-word-limit />
            </el-form-item>
            <el-button type="primary" :loading="speaking" :disabled="!status?.tts.ready || !text.trim() || !voice" @click="speak">{{ speaking ? '正在本机合成…' : '生成试听' }}</el-button>
          </el-form>
          <audio v-if="audio" :src="audio" controls preload="metadata" aria-label="配音试听结果" />
          <p class="hint">默认试听使用已登记的原创声线 audition_01；带 private 的声线保留为私人试听用途。</p>
        </section>
        <section class="panel" aria-labelledby="import-title">
          <h2 id="import-title">导入生成素材</h2>
          <p class="hint">把 Codex 生成的图片或可灵镜头绑定到项目。每次导入保留独立文件与来源记录。</p>
          <el-form label-position="top" @submit.prevent="importMedia">
            <div class="form-row">
              <el-form-item label="素材类型"><el-select v-model="form.kind" aria-label="素材类型"><el-option label="image_gen 图片" value="image" /><el-option label="可灵 MCP 视频" value="video" /></el-select></el-form-item>
              <el-form-item label="绑定类型"><el-select v-model="form.target_type" aria-label="绑定类型" :disabled="form.kind === 'video'"><el-option label="分镜" value="storyboard" /><el-option label="角色" value="character" /><el-option label="场景" value="scene" /><el-option label="道具" value="prop" /></el-select></el-form-item>
            </div>
            <el-form-item label="项目"><el-select v-model="dramaId" aria-label="项目" placeholder="选择项目" style="width:100%"><el-option v-for="d in dramas" :key="d.id" :label="d.title" :value="d.id" /></el-select></el-form-item>
            <el-form-item label="绑定目标"><el-select v-model="form.target_id" aria-label="绑定目标" placeholder="选择已有分镜或素材" style="width:100%"><el-option v-for="target in targetOptions" :key="target.id" :label="target.label" :value="target.id" /></el-select></el-form-item>
            <p v-if="dramaId && !targetOptions.length" class="hint">请先在剧集页面建立对应的分镜、角色、场景或道具。</p>
            <el-form-item label="素材文件"><input :key="form.kind" type="file" aria-label="素材文件" :accept="form.kind === 'image' ? 'image/png,image/jpeg,image/webp' : 'video/mp4,video/quicktime'" @change="file = $event.target.files?.[0] || null" /></el-form-item>
            <el-form-item label="最终提示词"><el-input v-model="form.prompt" aria-label="最终提示词" type="textarea" :rows="3" :maxlength="20000" /></el-form-item>
            <div class="form-row">
              <el-form-item label="风格模板"><el-input v-model="form.style_template" aria-label="风格模板" :maxlength="500" placeholder="记录所选模板名" /></el-form-item>
              <el-form-item label="实际模型（可选）"><el-input v-model="form.model" aria-label="实际模型" :maxlength="500" placeholder="按工具实际返回填写" /></el-form-item>
            </div>
            <el-form-item v-if="form.kind === 'video'" label="可灵任务 ID（可选）"><el-input v-model="form.generation_id" aria-label="可灵任务 ID" :maxlength="500" /></el-form-item>
            <el-button type="primary" :loading="importing" :disabled="!file || !form.target_id" @click="importMedia">导入并绑定</el-button>
          </el-form>
          <div v-if="media" class="media-result"><video v-if="form.kind === 'video'" :src="media" controls preload="metadata" /><img v-else :src="media" alt="刚导入的生成素材" /></div>
        </section>
      </div>
      <section class="panel workflow">
        <h2>制作顺序</h2>
        <ol><li>与 Codex 确定剧本、风格、角色与分镜；在项目内保存。</li><li>Codex 用风格库优化提示词并调用 image_gen，导入角色、场景和分镜图。</li><li>确认镜头与预算后，Codex 调用可灵 MCP，下载并导入选中 Take。</li><li>本地生成配音，回到分镜页面选片、合成，再完成剪辑与声音检查。</li></ol>
        <router-link to="/ai-config">查看 AI 配置 →</router-link>
        <p class="hint">图片与视频在 Codex 会话中调用。此页面负责接收产物；内置助手与自动写剧本按钮需要另外配置文本模型。</p>
      </section>
    </main>
  </div>
</template>

<style scoped>
.production-page { min-height:100vh; background:var(--bg-page); color:var(--text-primary); }
.production-header { display:flex; align-items:center; gap:24px; padding:20px 32px; border-bottom:1px solid var(--border-color, #404049); flex-wrap:wrap; }
.production-header span { flex:1; color:var(--text-muted); }
.back-link, .workflow a { color:var(--el-color-primary); text-decoration:none; }
.production-main { max-width:1240px; margin:auto; padding:40px 24px 64px; }
.intro { margin-bottom:28px; max-width:800px; }
.eyebrow { letter-spacing:.12em; font-size:12px; color:var(--text-muted); }
.intro h1 { font-size:clamp(25px, 3vw, 38px); line-height:1.35; margin:14px 0; }
.intro > p:last-child, .hint { color:var(--text-muted); line-height:1.7; font-size:14px; }
.connections { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin:24px 0; }
.connections article, .panel { background:var(--bg-card, var(--bg-page)); border:1px solid var(--border-color, #404049); border-radius:12px; padding:24px; }
.connections h2 { font-size:19px; margin:14px 0 10px; }
.connections p { font-size:14px; }.connections small, .tool-label { color:var(--text-muted); line-height:1.5; }
.connections .ready { color:var(--el-color-success); }
.production-grid { display:grid; grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr); align-items:start; gap:24px; }
.panel h2 { margin:0 0 12px; font-size:20px; }
.panel .hint { margin:10px 0 20px; }
.form-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
.form-row > * { min-width:0; }
audio, video { width:100%; margin-top:24px; }
.media-result img { display:block; max-width:100%; max-height:400px; margin-top:24px; border-radius:8px; }
input[type=file] { width:100%; font:inherit; }
.workflow { margin-top:24px; }.workflow ol { padding-left:22px; line-height:2; font-size:14px; }
@media(max-width:900px) { .connections { grid-template-columns:repeat(2,1fr); }.production-grid { grid-template-columns:1fr; } }
@media(max-width:480px) { .production-header { padding:16px; gap:12px; }.production-header span { display:none; }.production-main { padding:24px 16px; }.connections { grid-template-columns:1fr; }.form-row { grid-template-columns:1fr; gap:0; }.panel { padding:20px; } }
</style>
