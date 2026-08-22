// Content Rescue Studio — backend for POST /api/generate
// Zero dependencies. Node 18+. Talks to any OpenAI-compatible chat-completions endpoint.
// Run:  node server/index.mjs     (reads .env from project root)

import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'

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
Rules:
- Avoid unsupported claims, invented pricing, hours, event times, discounts, partnerships, legal/medical promises, and generic marketing language.
- Never imply intoxication, drinking and driving, excessive drinking, health benefits, or social/sexual success.
- content_angle is a SHORT campaign title (3-6 words, e.g. "Sunday Soundtrack at Ryes & Shine") — not a sentence.
- Each script must be 25-35 seconds when spoken: AT LEAST 65 words and at most 90 words. It must BEGIN with the hook.
- If a required_footer is provided, append it verbatim at the end of EVERY caption.
- hashtags: exactly 5 per video, each starting with #.
- visual_direction: one line, max 25 words (a shot list, semicolon-separated). caption: max 30 words before the footer.
- calendar.topic: max 15 words. production_notes: max 50 words.
- Be concise everywhere; no filler adjectives.
- calendar.day must be exactly "Mon","Tue","Wed","Thu","Fri","Sat","Sun" in that order. calendar.video_ref must be "Video 1", "Video 2" or "Video 3" (matching the videos array order).
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
      max_tokens: 3000,
      response_format: { type: 'json_object' },
      // DeepSeek-V4-Flash is a reasoning model: with thinking on it spends 500-4000 tokens reasoning
      // (counted against max_tokens) and takes 25-40s. Off: ~17s, same quality for this task.
      enable_thinking: process.env.LLM_THINKING === '1',
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

createServer(async (req, res) => {
  const send = (code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }); res.end(JSON.stringify(obj)) }
  if (req.method === 'OPTIONS') { res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST' }); return res.end() }
  if (req.url === '/api/health') return send(200, { ok: true, model: MODEL, base: BASE_URL, keySet: !!API_KEY })
  if (req.url !== '/api/generate' || req.method !== 'POST') return send(404, { error: 'not found' })
  if (!API_KEY) return send(500, { error: 'LLM_API_KEY not set' })
  try {
    const intake = JSON.parse(await readBody(req))
    if (!intake || typeof intake !== 'object' || !intake.business_name) return send(400, { error: 'invalid intake' })
    const t0 = Date.now()
    const pack = await callLLM(intake)
    console.log(`[server] generated pack for "${intake.business_name}" in ${Date.now() - t0}ms`)
    send(200, pack)
  } catch (e) {
    console.error('[server]', e.message)
    send(502, { error: e.message })
  }
}).listen(PORT, () => console.log(`[server] listening on http://localhost:${PORT}  model=${MODEL}  base=${BASE_URL}`))
