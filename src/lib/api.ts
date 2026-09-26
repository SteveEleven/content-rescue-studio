import type { Intake, Pack } from './types'
import { DEMO_PACK } from './demoPack'

export const GENERATE_TIMEOUT_MS = 90_000 // free-host cold start plus generation; then fall back to the demo pack

export interface GenerateResult {
  pack: Pack
  /** true when the embedded demo pack was used instead of a live response */
  fallback: boolean
}

/**
 * The single AI entry point. POSTs the intake to /api/generate and expects a Pack as JSON.
 * Any failure (network, timeout after 90s, non-2xx, malformed JSON, wrong shape) silently
 * falls back to the embedded demo pack so the app never shows a broken state.
 */
export async function generatePack(intake: Intake): Promise<GenerateResult> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), GENERATE_TIMEOUT_MS)
  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(intake),
      signal: controller.signal,
    })
    if (!res.ok) return { pack: DEMO_PACK, fallback: true }
    const data: unknown = await res.json()
    const pack = normalizePack(data)
    if (!pack) return { pack: DEMO_PACK, fallback: true }
    return { pack, fallback: false }
  } catch {
    return { pack: DEMO_PACK, fallback: true }
  } finally {
    clearTimeout(timer)
  }
}

const isStr = (v: unknown): v is string => typeof v === 'string'
const str = (v: unknown): string => (isStr(v) ? v : '')

/** Validates an unknown JSON value against the Pack contract. Returns null if unusable. */
export function normalizePack(data: unknown): Pack | null {
  if (!data || typeof data !== 'object') return null
  const d = data as Record<string, unknown>
  if (!isStr(d.business_summary) || !isStr(d.content_angle)) return null
  if (!Array.isArray(d.videos) || d.videos.length !== 3) return null
  if (!Array.isArray(d.calendar) || d.calendar.length !== 7) return null

  const videos = d.videos.map((v) => {
    if (!v || typeof v !== 'object') return null
    const o = v as Record<string, unknown>
    if (!isStr(o.title) || !isStr(o.script)) return null
    return {
      title: o.title,
      hook: str(o.hook),
      script: o.script,
      visual_direction: str(o.visual_direction),
      cta: str(o.cta),
      caption: str(o.caption),
      hashtags: Array.isArray(o.hashtags) ? o.hashtags.filter(isStr) : [],
    }
  })
  if (videos.some((v) => v === null)) return null

  const calendar = d.calendar.map((c) => {
    if (!c || typeof c !== 'object') return null
    const o = c as Record<string, unknown>
    if (!isStr(o.day)) return null
    return {
      day: o.day,
      goal: str(o.goal),
      format: str(o.format),
      topic: str(o.topic),
      video_ref: str(o.video_ref),
      cta: str(o.cta),
    }
  })
  if (calendar.some((c) => c === null)) return null

  return {
    business_summary: d.business_summary,
    content_angle: d.content_angle,
    videos: videos as Pack['videos'],
    calendar: calendar as Pack['calendar'],
    production_notes: str(d.production_notes),
  }
}
