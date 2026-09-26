// Content Rescue Studio — POST /api/generate, plus the built app in production.
// Zero dependencies. Node 18+. Talks to any OpenAI-compatible chat-completions endpoint.
// Dev:  node server/index.mjs                  (API only; Vite serves the frontend)
// Prod: NODE_ENV=production node server/index.mjs   (dist/ and /api on one origin)
// Reads .env from the project root. Does not override variables that are already set.

import { createServer } from 'node:http'
import { createReadStream, readFileSync, realpathSync, statSync } from 'node:fs'
import { basename, extname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

// --- tiny .env loader ---------------------------------------------------
try {
  for (const line of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
} catch {}

const PORT = Number(process.env.PORT || 3000)
const BASE_URL = (process.env.LLM_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '')
const API_KEY = process.env.LLM_API_KEY
const MODEL = process.env.LLM_MODEL || 'gpt-4o-mini'
const LLM_TIMEOUT_MS = Number(process.env.LLM_TIMEOUT_MS || 50_000) // overall deadline per /api/generate request
// Hedged retry: if the primary LLM call hasn't answered after this long (or failed transiently), fire a
// second identical request and return whichever succeeds first. Covers gateway stalls. 0 disables.
const LLM_HEDGE_MS = Number(process.env.LLM_HEDGE_MS ?? 20_000)

if (!API_KEY) console.warn('[server] LLM_API_KEY is not set — every request will 500 and the app will fall back to the demo pack.')

const SYSTEM = `You are an expert short-form video strategist for local businesses.
Using ONLY the supplied business information, produce a practical seven-day short-form content plan.
These rules apply to every business:
- Preserve the exact business name, including punctuation, capitalization, symbols, and spacing. For example, never change "Ryes & Shine" to "Ryes and Shine."
- Use the spelling conventions appropriate to the business location. Use Canadian spelling for Canadian businesses, such as "favourite," "flavour," and "centre."
- Never infer that ingredients, materials, or products are locally sourced merely because the business is local.
- Never invent prices, discounts, opening hours, event dates, performers, specials, awards, product availability, or seasonal availability.
- Never claim that online booking is available unless the supplied source material explicitly confirms it.
- Never state that tours, guided tours, tastings, tasting flights, or other experiences are currently available unless the source explicitly confirms their present availability.
- When availability may change, use wording such as "View current details," "Explore current options," or "Check the business website before visiting."
- Do not turn a general feature into an absolute promise. For example, change "food designed to pair perfectly" to "food options to enjoy alongside."
- CTAs must be supported by the supplied information. Do not use "Book now" or "Book online" without verified booking information.
- Hashtags must not contain unsupported factual claims, such as locally grown ingredients.
- When the source is incomplete, use cautious wording instead of inventing details.
- Content for alcohol businesses must not imply intoxication, excessive consumption, drinking and driving, health benefits, or that alcohol causes social or personal success.
- Preserve any required footer exactly. If a required_footer is provided, append it verbatim at the end of EVERY caption.
- Avoid unsupported claims, invented partnerships, legal or medical promises, and generic marketing language.
- content_angle is a SHORT campaign title (3-6 words, e.g. "Craft Distilling at Ryes & Shine") — not a sentence. Keep the business name exactly as supplied.
- Each script must be 25-35 seconds when spoken: AT LEAST 65 words and at most 90 words. It must BEGIN with the hook.
- hashtags: exactly 5 per video, each starting with #.
- visual_direction: one line, max 25 words (a shot list, semicolon-separated). caption: max 30 words before the footer.
- calendar.topic: max 15 words. production_notes: max 50 words.
- Be concise everywhere; no filler adjectives.
- calendar.day must be exactly "Mon","Tue","Wed","Thu","Fri","Sat","Sun" in that order. calendar.video_ref must be "Video 1", "Video 2" or "Video 3" (matching the videos array order).
- The generated JSON must follow the schema below exactly.
Return VALID JSON ONLY (no markdown, no commentary) with exactly this shape:
{
  "business_summary": string,
  "content_angle": string,
  "videos": [ { "title", "hook", "script", "visual_direction", "cta", "caption", "hashtags": string[] } ],  // exactly 3
  "calendar": [ { "day", "goal", "format", "topic", "video_ref", "cta" } ],                                // exactly 7
  "production_notes": string
}`

function userPrompt(i) {
  return `Business name: ${i.business_name}
Industry: ${i.industry}
Location: ${i.location}
Offer / goal: ${i.offer_goal}
Target customer: ${i.target_customer}
Platform: ${i.platform}
Tone: ${(i.tone || []).join(', ') || 'warm, clear, local'}
Required footer for every caption: ${i.required_footer || '(none)'}

Instructions:
- Use the business name exactly as written above. Do not respell it, expand symbols, or change capitalization or spacing.
- Match spelling to the business location. Use Canadian spelling when the location is in Canada.
- Use only the source text. Where it is incomplete, stay cautious instead of inventing details.
- If a required footer is provided, copy it onto every caption exactly.

Source text (website / about / services):
"""
${(i.source_text || '').slice(0, 12000)}
"""`
}

function extractJson(text) {
  try { return JSON.parse(text) } catch {}
  const m = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (m) { try { return JSON.parse(m[1]) } catch {} }
  const a = text.indexOf('{'), b = text.lastIndexOf('}')
  if (a >= 0 && b > a) { try { return JSON.parse(text.slice(a, b + 1)) } catch {} }
  return null
}

function validate(p) {
  return p && typeof p === 'object'
    && typeof p.business_summary === 'string' && typeof p.content_angle === 'string'
    && Array.isArray(p.videos) && p.videos.length === 3
    && Array.isArray(p.calendar) && p.calendar.length === 7
    && p.videos.every(v => v && typeof v.title === 'string' && typeof v.script === 'string')
    && p.calendar.every(c => c && typeof c.day === 'string')
}

/** One LLM attempt. Rejects on abort, non-2xx, or an invalid pack shape. */
async function llmAttempt(intake, signal, label) {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
    signal,
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.7,
      max_tokens: 6000,
      response_format: { type: 'json_object' },
      // DeepSeek-V4-Flash is a reasoning model: with thinking on it spends 500-4000 tokens reasoning
      // (counted against max_tokens) and takes 25-40s. Off: ~17s, same quality for this task.
      // Only send this field when explicitly enabled. Gemini rejects the name even when the value is false.
      ...(process.env.LLM_THINKING === '1' ? { enable_thinking: true } : {}),
      messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: userPrompt(intake) }],
    }),
  })
  if (!res.ok) {
    const err = new Error(`LLM ${res.status}: ${(await res.text()).slice(0, 300)}`)
    err.status = res.status
    throw err
  }
  const data = await res.json()
  const text = data?.choices?.[0]?.message?.content ?? ''
  const pack = extractJson(text)
  if (!validate(pack)) {
    console.error('[server] %s: invalid pack. finish_reason=%s content head: %s', label, data?.choices?.[0]?.finish_reason, text.slice(0, 400).replace(/\n/g, ' '))
    throw new Error('LLM returned an invalid pack shape')
  }
  // enforce footer + hashtag hygiene server-side
  const footer = (intake.required_footer || '').trim()
  for (const v of pack.videos) {
    v.hashtags = Array.isArray(v.hashtags) ? v.hashtags.map(h => String(h).trim()).filter(Boolean).map(h => h.startsWith('#') ? h : '#' + h.replace(/\s+/g, '')) : []
    if (footer && !(v.caption || '').includes(footer)) v.caption = `${(v.caption || '').trim()} ${footer}`.trim()
  }
  return pack
}

const isClientError = (e) => e && e.status >= 400 && e.status < 500 && e.status !== 408 && e.status !== 429

/**
 * Hedged call: start the primary; if it is still running after LLM_HEDGE_MS (or failed with something
 * retryable), start a second attempt and return the first one that succeeds. Every attempt is bound to
 * one overall deadline (LLM_TIMEOUT_MS from the start) and losers are aborted.
 */
async function callLLM(intake) {
  const t0 = Date.now()
  const deadline = t0 + LLM_TIMEOUT_MS
  const ctrls = []
  const timers = []
  const attempt = (label) => {
    const ctrl = new AbortController()
    ctrls.push(ctrl)
    timers.push(setTimeout(() => ctrl.abort(), Math.max(0, deadline - Date.now())))
    return llmAttempt(intake, ctrl.signal, label).then(
      (pack) => { console.log(`[server] ${label} succeeded in ${Date.now() - t0}ms`); return pack },
      (e) => { if (!ctrl.signal.aborted) console.warn(`[server] ${label} failed after ${Date.now() - t0}ms: ${e.message}`); throw e },
    )
  }
  try {
    const primary = attempt('primary')
    if (!LLM_HEDGE_MS) return await primary
    // Wait for the primary or the hedge timer, whichever comes first.
    const outcome = await Promise.race([
      primary.then((pack) => ({ pack }), (err) => ({ err })),
      new Promise((r) => timers.push(setTimeout(() => r({ slow: true }), LLM_HEDGE_MS))),
    ])
    if (outcome.pack) return outcome.pack
    if (outcome.err && isClientError(outcome.err)) throw outcome.err // 401/400 etc. — a retry won't help
    console.warn(`[server] primary ${outcome.slow ? 'still running' : 'failed'} at ${Date.now() - t0}ms → firing hedged request`)
    const hedge = attempt('hedge')
    // First success wins; if both fail, surface the last error.
    return await Promise.any([primary, hedge]).catch((agg) => { throw agg.errors[agg.errors.length - 1] })
  } finally {
    timers.forEach(clearTimeout)
    ctrls.forEach((c) => c.abort()) // cancel the loser (no-op for the winner)
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let s = ''
    req.on('data', c => { s += c; if (s.length > 1e6) reject(new Error('body too large')) })
    req.on('end', () => resolve(s))
    req.on('error', reject)
  })
}

// Render sets NODE_ENV=production at runtime. Local `npm start` / `npm run server` leave it unset,
// so Vite keeps serving the frontend and this process stays API-only.
const SERVE_APP = process.env.NODE_ENV === 'production'
const DIST_DIR = fileURLToPath(new URL('../dist/', import.meta.url))

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
}

function sendJson(res, code, obj) {
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'X-Content-Type-Options': 'nosniff',
  })
  res.end(JSON.stringify(obj))
}

/** Decode the request path once. Traversal and any `.env` segment are denied before the filesystem. */
function decodeRequestPath(url) {
  const cut = url.search(/[?#]/)
  const raw = cut === -1 ? url : url.slice(0, cut)
  if (!raw.startsWith('/')) return { bad: true }
  let decoded
  try { decoded = decodeURIComponent(raw) } catch { return { bad: true } }
  if (decoded.includes('\0')) return { bad: true }
  const segments = decoded.replaceAll('\\', '/').split('/')
  if (segments.slice(1).some((s) => s === '..' || s.toLowerCase() === '.env')) return { deny: true }
  const path = '/' + segments.slice(1).filter((s) => s !== '' && s !== '.').join('/')
  return { path }
}

function insideDir(root, target) {
  const prefix = root.endsWith(sep) ? root : root + sep
  return target === root || target.startsWith(prefix)
}

/** A regular file inside dist/, or null if it should fall through. `{ deny: true }` never falls through to index.html. */
function resolveDistFile(urlPath) {
  let root
  try { root = realpathSync(DIST_DIR) } catch { return null }
  const rel = urlPath.replace(/^\/+/, '')
  if (!rel) return null
  const candidate = resolve(root, rel)
  if (!insideDir(root, candidate)) return { deny: true }
  let real
  try {
    if (!statSync(candidate).isFile()) return null
    real = realpathSync(candidate)
  } catch { return null }
  if (!insideDir(root, real) || basename(real).toLowerCase() === '.env') return { deny: true }
  return { file: real }
}

function serveFile(req, res, filePath) {
  let st
  try { st = statSync(filePath) } catch { return sendJson(res, 404, { error: 'not found' }) }
  const ext = extname(filePath).toLowerCase()
  const headers = {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Content-Length': st.size,
    'X-Content-Type-Options': 'nosniff',
  }
  if (ext === '.html') headers['Cache-Control'] = 'no-cache'
  res.writeHead(200, headers)
  if (req.method === 'HEAD') return res.end()
  const stream = createReadStream(filePath)
  stream.on('error', () => { if (!res.writableEnded) res.destroy() })
  res.on('close', () => stream.destroy())
  stream.pipe(res)
}

async function handleGenerate(req, res) {
  if (!API_KEY) return sendJson(res, 500, { error: 'LLM_API_KEY not set' })
  try {
    const intake = JSON.parse(await readBody(req))
    if (!intake || typeof intake !== 'object' || !intake.business_name) return sendJson(res, 400, { error: 'invalid intake' })
    const t0 = Date.now()
    const pack = await callLLM(intake)
    console.log(`[server] generated pack for "${intake.business_name}" in ${Date.now() - t0}ms`)
    sendJson(res, 200, pack)
  } catch (e) {
    console.error('[server]', e.message)
    sendJson(res, 502, { error: e.message })
  }
}

function handleApi(req, res, path) {
  if (path === '/api/health' && req.method === 'GET') {
    return sendJson(res, 200, { ok: true, model: MODEL, base: BASE_URL, keySet: !!API_KEY })
  }
  if (path === '/api/generate' && req.method === 'POST') return handleGenerate(req, res)
  return sendJson(res, 404, { error: 'not found' })
}

createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST',
    })
    return res.end()
  }
  const decoded = decodeRequestPath(req.url || '/')
  if (decoded.bad) return sendJson(res, 400, { error: 'bad request' })
  if (decoded.deny) return sendJson(res, 404, { error: 'not found' })
  const path = decoded.path
  // API wins over static files and never falls through to index.html.
  if (path === '/api' || path.startsWith('/api/')) return handleApi(req, res, path)
  if (!SERVE_APP || (req.method !== 'GET' && req.method !== 'HEAD')) return sendJson(res, 404, { error: 'not found' })
  const hit = resolveDistFile(path)
  if (hit?.deny) return sendJson(res, 404, { error: 'not found' })
  if (hit?.file) return serveFile(req, res, hit.file)
  // Missing assets stay 404. Extension-less browser paths get the SPA shell.
  if (extname(path)) return sendJson(res, 404, { error: 'not found' })
  const index = resolveDistFile('/index.html')
  if (!index?.file) return sendJson(res, 404, { error: 'not found' })
  return serveFile(req, res, index.file)
}).listen(PORT, '0.0.0.0', () => console.log(`[server] listening on http://localhost:${PORT}  model=${MODEL}  base=${BASE_URL}  static=${SERVE_APP}`))
