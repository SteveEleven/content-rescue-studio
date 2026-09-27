// Pack JSON contract shared by the Gemini request and the server-side validator.
// Pure: no I/O, no environment, no logging of request headers.

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export const VIDEO_REFS = ['Video 1', 'Video 2', 'Video 3']

const VIDEO_STRINGS = ['title', 'hook', 'script', 'visual_direction', 'cta', 'caption']
const CALENDAR_STRINGS = ['goal', 'format', 'topic', 'cta']

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

/** First missing or invalid path, or null when the pack matches the required shape. */
export function packIssue(p) {
  if (!p || typeof p !== 'object' || Array.isArray(p)) return 'pack'
  if (!nonEmptyString(p.business_summary)) return 'business_summary'
  if (!nonEmptyString(p.content_angle)) return 'content_angle'
  if (!Array.isArray(p.videos)) return 'videos'
  if (p.videos.length !== 3) return 'videos.length'
  for (let i = 0; i < p.videos.length; i++) {
    const v = p.videos[i]
    if (!v || typeof v !== 'object' || Array.isArray(v)) return `videos[${i}]`
    for (const field of VIDEO_STRINGS) {
      if (!nonEmptyString(v[field])) return `videos[${i}].${field}`
    }
    if (!Array.isArray(v.hashtags) || v.hashtags.length !== 5) return `videos[${i}].hashtags`
    if (!v.hashtags.every((tag) => nonEmptyString(tag))) return `videos[${i}].hashtags`
  }
  if (!Array.isArray(p.calendar)) return 'calendar'
  if (p.calendar.length !== 7) return 'calendar.length'
  for (let i = 0; i < p.calendar.length; i++) {
    const day = p.calendar[i]
    if (!day || typeof day !== 'object' || Array.isArray(day)) return `calendar[${i}]`
    if (day.day !== DAYS[i]) return `calendar[${i}].day`
    for (const field of CALENDAR_STRINGS) {
      if (!nonEmptyString(day[field])) return `calendar[${i}].${field}`
    }
    if (!VIDEO_REFS.includes(day.video_ref)) return `calendar[${i}].video_ref`
  }
  if (!nonEmptyString(p.production_notes)) return 'production_notes'
  return null
}

function parseJson(text) {
  try { return JSON.parse(text) } catch { return undefined }
}

/** First `{...}` block, respecting strings, so trailing notes cannot swallow the pack. */
function sliceBalancedObject(text) {
  const start = text.indexOf('{')
  if (start < 0) return null
  let depth = 0
  let inString = false
  let escape = false
  for (let i = start; i < text.length; i++) {
    const c = text[i]
    if (inString) {
      if (escape) escape = false
      else if (c === '\\') escape = true
      else if (c === '"') inString = false
      continue
    }
    if (c === '"') inString = true
    else if (c === '{') depth++
    else if (c === '}') {
      depth--
      if (depth === 0) return text.slice(start, i + 1)
    }
  }
  return null
}

/** Models sometimes emit trailing commas or raw line breaks inside strings. */
function repairJson(text) {
  let out = ''
  let inString = false
  let escape = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inString) {
      if (escape) {
        out += c === "'" ? "'" : c
        escape = false
        continue
      }
      if (c === '\\') {
        if (text[i + 1] === "'") { out += "'"; i++; continue }
        out += c
        escape = true
        continue
      }
      if (c === '"') { inString = false; out += c; continue }
      if (c === '\n') { out += '\\n'; continue }
      if (c === '\r') { out += '\\r'; continue }
      if (c === '\t') { out += '\\t'; continue }
      out += c
      continue
    }
    if (c === '"') inString = true
    out += c
  }
  return out.replace(/,\s*([}\]])/g, '$1')
}

function parseCandidate(text) {
  const direct = parseJson(text)
  if (direct !== undefined) return direct
  const repaired = parseJson(repairJson(text))
  return repaired === undefined ? null : repaired
}

export function extractJson(text) {
  if (typeof text !== 'string') return null
  const direct = parseJson(text)
  if (direct !== undefined) return direct
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced) {
    const inner = parseCandidate(fenced[1])
    if (inner !== null) return inner
  }
  const balanced = sliceBalancedObject(text)
  if (balanced) {
    const parsed = parseCandidate(balanced)
    if (parsed !== null) return parsed
  }
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start >= 0 && end > start) {
    const parsed = parseCandidate(text.slice(start, end + 1))
    if (parsed !== null) return parsed
  }
  return null
}

function jsonErrorPosition(text) {
  try { JSON.parse(text) } catch (e) {
    const pos = String(e?.message || '').match(/position (\d+)/)
    return pos ? pos[1] : null
  }
  return null
}

/** Gemini sometimes returns content as a part list. Thoughts are not the pack. */
export function messageText(message) {
  const content = message?.content
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    return content.map((part) => {
      if (typeof part === 'string') return part
      if (part && typeof part === 'object' && part.thought) return ''
      if (part && typeof part.text === 'string') return part.text
      return ''
    }).join('')
  }
  return ''
}

/** Null when the text is a valid pack. Otherwise the missing or invalid field path. */
export function describePackIssue(text) {
  const raw = typeof text === 'string' ? text : ''
  const parsed = extractJson(raw)
  if (parsed == null) {
    if (!raw.trim()) return 'content empty'
    const pos = jsonErrorPosition(raw)
    return pos == null ? 'content is not valid JSON' : `content is not valid JSON at position ${pos}`
  }
  return packIssue(parsed)
}

function redactSnippet(text) {
  const raw = typeof text === 'string' ? text : ''
  return raw
    .slice(0, 400)
    .replace(/\n/g, ' ')
    .replace(/Bearer\s+\S+/gi, 'Bearer [redacted]')
    .replace(/\bAIza[\w-]{20,}/g, '[redacted]')
}

/** One log line. Never includes the request, headers, or the full pack. */
export function packFailureLog(label, issue, finishReason, text, usage) {
  const reasoning = usage?.completion_tokens_details?.reasoning_tokens
  const completion = usage?.completion_tokens
  return `[server] ${label}: invalid pack at ${issue}. finish_reason=${finishReason ?? 'unknown'} reasoning_tokens=${reasoning ?? 'n/a'} completion_tokens=${completion ?? 'n/a'} content head: ${redactSnippet(text)}`
}
