import type { Pack, Video } from './types'

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
