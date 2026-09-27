import type { CalendarDay, Pack, Video } from './types'

/** Weekday schedule used when a pack does not store its own time. Friday is the exception. */
export function suggestedPostTime(day: string): string {
  const key = day.trim().slice(0, 3).toLowerCase()
  if (key === 'fri') return '4:30 PM'
  if (key === 'sat') return '11:00 AM'
  if (key === 'sun') return '12:00 PM'
  return '5:30 PM'
}

export function dayPostTime(day: CalendarDay): string {
  const explicit = day.suggested_post_time?.trim()
  return explicit || suggestedPostTime(day.day)
}

/** Times for the calendar days that use this video, e.g. "Mon 5:30 PM · Fri 4:30 PM". */
export function videoPostTimes(pack: Pack, index: number): string {
  const ref = `Video ${index + 1}`
  const parts = pack.calendar.filter((day) => day.video_ref === ref).map((day) => `${day.day} ${dayPostTime(day)}`)
  return parts.length ? parts.join(' · ') : suggestedPostTime('Mon')
}

export function captionWithTags(v: Video): string {
  const tags = v.hashtags.join(' ')
  return tags ? `${v.caption}\n\n${tags}` : v.caption
}

/** Clean plain-text summary of the whole pack, for "Copy full plan" and Share. */
export function packToPlainText(pack: Pack, businessName?: string): string {
  const lines: string[] = []
  lines.push(`CONTENT RESCUE PACK${businessName ? ` — ${businessName}` : ''}`)
  lines.push('')
  lines.push(pack.business_summary)
  lines.push('')
  lines.push(`Content angle: ${pack.content_angle}`)
  lines.push('')
  lines.push('VIDEO IDEAS')
  pack.videos.forEach((v, i) => {
    lines.push('')
    lines.push(`${i + 1}. ${v.title}`)
    lines.push(`Hook: ${v.hook}`)
    lines.push(`Script: ${v.script}`)
    lines.push(`Visual direction: ${v.visual_direction}`)
    lines.push(`CTA: ${v.cta}`)
    lines.push(`Caption: ${v.caption.replace(/\n+/g, ' ')}`)
    lines.push(`Suggested post time: ${videoPostTimes(pack, i)}`)
    if (v.hashtags.length) lines.push(`Hashtags: ${v.hashtags.join(' ')}`)
  })
  lines.push('')
  lines.push('7-DAY PLAN')
  pack.calendar.forEach((c) => {
    lines.push('')
    lines.push(`${c.day} — ${c.goal}`)
    lines.push(`Format: ${c.format}`)
    lines.push(`Topic: ${c.topic}`)
    lines.push(`Video: ${c.video_ref}`)
    lines.push(`Suggested post time: ${dayPostTime(c)}`)
    lines.push(`CTA: ${c.cta}`)
  })
  if (pack.production_notes) {
    lines.push('')
    lines.push('PRODUCTION NOTES')
    lines.push(pack.production_notes)
  }
  return lines.join('\n')
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

export async function shareText(title: string, text: string): Promise<'shared' | 'copied' | 'failed'> {
  const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }
  if (nav.share) {
    try {
      await nav.share({ title, text })
      return 'shared'
    } catch (e) {
      // User cancelled — don't fall back to clipboard (would be surprising).
      if (e instanceof DOMException && e.name === 'AbortError') return 'failed'
    }
  }
  return (await copyText(text)) ? 'copied' : 'failed'
}
