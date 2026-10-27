import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import { parse } from '@vue/compiler-sfc'

function mountHandler() {
  const sfc = fs.readFileSync(new URL('../src/views/FilmCreate.vue', import.meta.url), 'utf8')
  const script = parse(sfc).descriptor.scriptSetup.content
  const functionSource = name => {
    const match = script.match(new RegExp(`function ${name}\\([^]*?\\n\\}`))
    assert.ok(match, `missing actual UI handler ${name}`)
    return match[0]
  }
  const calls = []
  const state = { value: { 99: 100 } }
  const context = vm.createContext({
    sbSelectedVideoId: state,
    storyboardsAPI: { update(id, payload) { calls.push({ id, payload: JSON.parse(JSON.stringify(payload)) }); return Promise.resolve() } },
    imageUrl: url => url,
    console,
  })
  const handler = vm.runInContext(`${functionSource('assetVideoUrl')}\n${functionSource('onSelectSbMainVideo')}\nonSelectSbMainVideo`, context)
  return { handler, calls, state }
}

test('selecting a historical video preserves the storyboard still frame path', () => {
  const { handler, calls, state } = mountHandler()
  const storyboard = { id: 5, local_path: 'frames/first.png' }
  handler(storyboard, { id: 11, video_url: 'https://example.invalid/old.mp4', local_path: 'videos/take11.mp4' })
  assert.equal(storyboard.local_path, 'frames/first.png')
  assert.equal(Object.hasOwn(calls[0].payload, 'local_path'), false)
  assert.equal(calls[0].payload.video_url, '/static/videos/take11.mp4')
  assert.equal(state.value[99], 100)
  assert.equal(state.value[5], 11)
})

test('a local-only historical video is persisted as a playable video URL', () => {
  const { handler, calls } = mountHandler()
  handler({ id: 5, local_path: 'frames/first.png' }, { id: 12, local_path: 'videos/local.mp4' })
  assert.equal(calls[0].payload.video_url, '/static/videos/local.mp4')
  assert.equal(Object.hasOwn(calls[0].payload, 'local_path'), false)
})

test('remote-only video history remains selectable', () => {
  const { handler, calls } = mountHandler()
  handler({ id: 5 }, { id: 13, video_url: 'https://example.invalid/remote.mp4' })
  assert.equal(calls[0].payload.video_url, 'https://example.invalid/remote.mp4')
})
