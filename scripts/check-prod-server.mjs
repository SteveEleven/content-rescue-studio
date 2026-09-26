// Focused production checks. Builds the app, starts a separate Node process
// (not the local demo), and shuts down only that process.
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const PORT = 3999
const BASE = `http://127.0.0.1:${PORT}`
const root = fileURLToPath(new URL('..', import.meta.url))

function redact(text) {
  let out = String(text)
  try {
    for (const line of readFileSync(join(root, '.env'), 'utf8').split('\n')) {
      const m = line.match(/^LLM_API_KEY\s*=\s*(.*?)\s*$/)
      const value = m?.[1]?.replace(/^["']|["']$/g, '')
      if (value && value.length >= 8) out = out.split(value).join('[redacted]')
    }
  } catch {}
  return out
}

function envLeaked(body) {
  let text = ''
  try { text = readFileSync(join(root, '.env'), 'utf8') } catch { return false }
  if (text.trim() && body.includes(text.trim())) return true
  for (const line of text.split('\n')) {
    const m = line.match(/^LLM_API_KEY\s*=\s*(.*?)\s*$/)
    const value = m?.[1]?.replace(/^["']|["']$/g, '')
    if (value && value.length >= 8 && body.includes(value)) return true
  }
  return false
}

function assert(cond, message) {
  if (!cond) throw new Error(message)
}

async function get(path, init) {
  const res = await fetch(BASE + path, init)
  const buf = Buffer.from(await res.arrayBuffer())
  const text = buf.toString('utf8')
  if (envLeaked(text)) throw new Error(`response for ${path} contained the API key`)
  return { status: res.status, type: res.headers.get('content-type') || '', text, buf }
}

const envBefore = (() => {
  try { return createHash('sha256').update(readFileSync(join(root, '.env'))).digest('hex') } catch { return null }
})()

console.log('build')
await new Promise((resolvePromise, reject) => {
  const child = spawn('npm', ['run', 'build'], { cwd: root, stdio: 'inherit' })
  child.on('exit', (code) => (code === 0 ? resolvePromise() : reject(new Error(`build exited ${code}`))))
})

const env = { ...process.env, NODE_ENV: 'production', PORT: String(PORT) }
env.LLM_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/openai'
env.LLM_MODEL = 'gemini-3-flash-preview'
env.LLM_API_KEY = 'check-prod-not-a-real-key'
delete env.LLM_THINKING

const server = spawn(process.execPath, ['server/index.mjs'], {
  cwd: root,
  env,
  stdio: ['ignore', 'pipe', 'pipe'],
})
let logs = ''
server.stdout.on('data', (c) => { logs += c })
server.stderr.on('data', (c) => { logs += c })

const outside = join(tmpdir(), `crs-outside-${process.pid}.txt`)
const link = join(root, 'dist', 'secret-link')
writeFileSync(outside, 'outside-dist-marker')

try {
  let healthy = false
  for (let i = 0; i < 40; i++) {
    if (server.exitCode != null) throw new Error(`server exited early ${server.exitCode}\n${redact(logs)}`)
    try {
      const res = await get('/api/health')
      if (res.status === 200) { healthy = true; break }
    } catch {}
    await new Promise((r) => setTimeout(r, 100))
  }
  assert(healthy, `server did not become healthy\n${redact(logs)}`)

  const index = readFileSync(join(root, 'dist', 'index.html'), 'utf8')
  const home = await get('/')
  assert(home.status === 200, `/ status ${home.status}`)
  assert(home.type.startsWith('text/html'), `/ content-type ${home.type}`)
  assert(home.text === index, '/ did not serve dist/index.html')
  assert(home.text.includes('id="root"'), '/ missing app root')

  const health = await get('/api/health')
  assert(health.status === 200, `health status ${health.status}`)
  assert(health.type.startsWith('application/json'), `health content-type ${health.type}`)
  const healthBody = JSON.parse(health.text)
  assert(healthBody.ok === true, 'health ok is not true')
  assert(healthBody.model === 'gemini-3-flash-preview', 'health model mismatch')
  assert(!health.text.includes('<'), 'health returned HTML')

  const spa = await get('/this-route-is-not-real')
  assert(spa.status === 200, `spa status ${spa.status}`)
  assert(spa.type.startsWith('text/html'), `spa content-type ${spa.type}`)
  assert(spa.text === index, 'unknown browser route did not serve index.html')

  const missingApi = await get('/api/does-not-exist')
  assert(missingApi.status === 404, `unknown api status ${missingApi.status}`)
  assert(missingApi.type.startsWith('application/json'), `unknown api content-type ${missingApi.type}`)
  assert(JSON.parse(missingApi.text).error === 'not found', 'unknown api body')
  assert(!missingApi.text.includes('<html') && !missingApi.text.includes('id="root"'), 'unknown api returned HTML')

  const generateGet = await get('/api/generate')
  assert(generateGet.status === 404 && generateGet.type.startsWith('application/json'), 'GET /api/generate fell through')

  const generatePost = await get('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  })
  assert(generatePost.status === 400 && generatePost.type.startsWith('application/json'), 'POST /api/generate did not stay on the API')

  const assets = readdirSync(join(root, 'dist', 'assets'))
  const js = assets.find((f) => f.endsWith('.js'))
  const css = assets.find((f) => f.endsWith('.css'))
  assert(js && css, 'build did not emit js and css')
  const jsRes = await get('/assets/' + js)
  const cssRes = await get('/assets/' + css)
  assert(jsRes.status === 200 && jsRes.type.includes('javascript'), `js content-type ${jsRes.type}`)
  assert(cssRes.status === 200 && cssRes.type.includes('text/css'), `css content-type ${cssRes.type}`)
  assert(jsRes.buf.equals(readFileSync(join(root, 'dist', 'assets', js))), 'js bytes mismatch')

  const manifest = await get('/manifest.webmanifest')
  assert(manifest.status === 200 && manifest.type.includes('manifest'), `manifest content-type ${manifest.type}`)

  const blocked = [
    '/.env',
    '/.ENV',
    '/../.env',
    '/%2e%2e/.env',
    '/%2e%2e%2f.env',
    '/assets/../../.env',
    '/%2e%2e/%2e%2e/.env',
    '/api/../../.env',
    '/foo/%2e%2e/%2e%2e/.env',
  ]
  for (const path of blocked) {
    const res = await get(path)
    assert(res.status === 404, `${path} status ${res.status}`)
    assert(res.type.startsWith('application/json'), `${path} content-type ${res.type}`)
    assert(!res.text.includes('outside-dist-marker'), `${path} escaped dist`)
    assert(!res.text.includes('LLM_API_KEY'), `${path} looked like an env file`)
    assert(res.text !== index, `${path} served index.html`)
  }

  symlinkSync(outside, link)
  const linked = await get('/secret-link')
  assert(linked.status === 404, `symlink status ${linked.status}`)
  assert(!linked.text.includes('outside-dist-marker'), 'symlink escaped dist')
  assert(linked.type.startsWith('application/json'), 'symlink served a file')

  const missingAsset = await get('/assets/does-not-exist.js')
  assert(missingAsset.status === 404 && missingAsset.type.startsWith('application/json'), 'missing asset fell through to HTML')

  console.log('PASS production build')
  console.log('PASS / serves dist/index.html')
  console.log('PASS /api/health returns JSON')
  console.log('PASS unknown browser route serves index.html')
  console.log('PASS unknown /api route returns JSON 404')
  console.log('PASS static js/css/manifest content types')
  console.log('PASS traversal, .env, and symlink escape are blocked')
} finally {
  rmSync(link, { force: true })
  rmSync(outside, { force: true })
  server.kill('SIGTERM')
  await new Promise((r) => {
    if (server.exitCode != null || server.signalCode != null) return r()
    server.once('exit', () => r())
    setTimeout(() => { server.kill('SIGKILL'); r() }, 2000)
  })
}

const localEnv = { ...env, PORT: '4001' }
delete localEnv.NODE_ENV
const local = spawn(process.execPath, ['server/index.mjs'], {
  cwd: root,
  env: localEnv,
  stdio: ['ignore', 'pipe', 'pipe'],
})
try {
  let ready = false
  for (let i = 0; i < 40; i++) {
    if (local.exitCode != null) throw new Error(`local-mode server exited ${local.exitCode}`)
    try {
      const res = await fetch('http://127.0.0.1:4001/api/health')
      if (res.status === 200) { ready = true; break }
    } catch {}
    await new Promise((r) => setTimeout(r, 100))
  }
  assert(ready, 'local-mode server did not start')
  const page = await fetch('http://127.0.0.1:4001/')
  const pageType = page.headers.get('content-type') || ''
  const pageText = await page.text()
  if (envLeaked(pageText)) throw new Error('local-mode / contained the API key')
  assert(page.status === 404 && pageType.startsWith('application/json'), 'local mode served the built app')
  const healthRes = await fetch('http://127.0.0.1:4001/api/health')
  const healthType = healthRes.headers.get('content-type') || ''
  assert(healthRes.status === 200 && healthType.startsWith('application/json'), 'local mode health failed')
  console.log('PASS local mode stays API-only')
} finally {
  local.kill('SIGTERM')
  await new Promise((r) => {
    if (local.exitCode != null || local.signalCode != null) return r()
    local.once('exit', () => r())
    setTimeout(() => { local.kill('SIGKILL'); r() }, 2000)
  })
}

const envAfter = (() => {
  try { return createHash('sha256').update(readFileSync(join(root, '.env'))).digest('hex') } catch { return null }
})()
assert(envBefore === envAfter, '.env changed during the check')
console.log(envBefore ? 'PASS .env unchanged' : 'PASS no .env file to modify')
