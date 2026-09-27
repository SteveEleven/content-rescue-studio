// Focused checks for the Gemini pack shape and validation-error paths.
// Does not call Gemini and does not read .env.
import { readFileSync } from 'node:fs'
import { describePackIssue, extractJson, messageText, packFailureLog, packIssue } from '../server/pack.mjs'

const serverSrc = readFileSync(new URL('../server/index.mjs', import.meta.url), 'utf8')

function assert(cond, message) {
  if (!cond) throw new Error(message)
}

const shapeLines = [
  'business_summary: string, at most 45 words.',
  'content_angle: string, 3 to 6 words.',
  'videos: array of exactly 3 objects.',
  'hook (string, at most 16 words)',
  'script (string, 65 to 90 words, beginning with that hook)',
  'visual_direction (string, at most 25 words)',
  'caption (string, at most 30 words, then the required footer when one was provided)',
  'hashtags (array of exactly 5 strings, each starting with #)',
  'calendar: array of exactly 7 objects, in order.',
  '"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"',
  '"Video 1", "Video 2", "Video 3"',
  'production_notes: string, at most 50 words.',
]
for (const line of shapeLines) {
  assert(serverSrc.includes(line), `Gemini instructions are missing: ${line}`)
}
assert(!serverSrc.includes('{ "title", "hook"'), 'prompt still uses shorthand keys with no types')
assert(serverSrc.includes('max_tokens: 6000'), 'max_tokens changed')
assert(serverSrc.includes('LLM_TIMEOUT_MS || 50_000'), 'backend timeout changed')
assert(serverSrc.includes("reasoning_effort: 'minimal'"), 'Gemini thinking level was not constrained')

function video() {
  return {
    title: 'Title',
    hook: 'Hook',
    script: 'Hook and then the spoken script.',
    visual_direction: 'Still; pour; room.',
    cta: 'Plan your visit',
    caption: 'A short caption.',
    hashtags: ['#one', '#two', '#three', '#four', '#five'],
  }
}

function validPack() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return {
    business_summary: 'A local business summary.',
    content_angle: 'Craft at the source',
    videos: [video(), video(), video()],
    calendar: days.map((day, i) => ({
      day,
      goal: 'Show the work',
      format: 'Short cuts',
      topic: 'One concrete topic for the day.',
      video_ref: `Video ${(i % 3) + 1}`,
      cta: 'View current details',
    })),
    production_notes: 'Film in the room. Do not invent hours.',
  }
}

assert(packIssue(validPack()) === null, 'complete pack was rejected')
assert(describePackIssue(JSON.stringify(validPack())) === null, 'complete JSON text was rejected')

function expectIssue(mutate, path) {
  const pack = validPack()
  mutate(pack)
  const issue = packIssue(pack)
  assert(issue === path, `expected ${path}, got ${issue}`)
}

expectIssue((p) => { delete p.business_summary }, 'business_summary')
expectIssue((p) => { p.content_angle = '   ' }, 'content_angle')
expectIssue((p) => { p.videos.pop() }, 'videos.length')
expectIssue((p) => { delete p.videos[1].script }, 'videos[1].script')
expectIssue((p) => { p.videos[0].hook = '' }, 'videos[0].hook')
expectIssue((p) => { p.videos[2].hashtags = ['#one', '#two', '#three', '#four'] }, 'videos[2].hashtags')
expectIssue((p) => { p.calendar.pop() }, 'calendar.length')
expectIssue((p) => { p.calendar[4].day = 'Friday' }, 'calendar[4].day')
expectIssue((p) => { p.calendar[6].video_ref = 'Video 4' }, 'calendar[6].video_ref')
expectIssue((p) => { delete p.calendar[3].topic }, 'calendar[3].topic')
expectIssue((p) => { p.production_notes = '' }, 'production_notes')

assert(describePackIssue('') === 'content empty', 'empty content path')
assert(describePackIssue('{"business_summary":').startsWith('content is not valid JSON'), 'truncated JSON path')
const wrapped = '```json\n' + JSON.stringify(validPack()) + '\n```'
assert(describePackIssue(wrapped) === null, 'fenced JSON was rejected')
const withTrailer = JSON.stringify(validPack()) + '\nNote: extra } after the pack'
assert(describePackIssue(withTrailer) === null, 'trailing note hid a valid pack')
const withComma = JSON.stringify(validPack()).replace('"production_notes":', '"production_notes":').replace(/}$/, ',}')
assert(describePackIssue(withComma) === null, 'trailing comma hid a valid pack')
const withBreak = JSON.stringify(validPack()).replace('A local business summary.', 'A local business summary.\nSecond line.')
assert(describePackIssue(withBreak) === null, 'raw newline inside a string hid a valid pack')
const recovered = extractJson(withComma)
recovered.videos[1].script = ''
assert(packIssue(recovered) === 'videos[1].script', 'repaired JSON still has to pass validation')

const thought = messageText({
  content: [
    { thought: true, text: '{"not":"the pack"}' },
    { text: JSON.stringify(validPack()) },
  ],
})
assert(describePackIssue(thought) === null, 'thought text was treated as the pack')

const secret = 'Bearer sk-live-should-not-appear'
const truncated = '{"business_summary":"cut off'
const text = `${secret} ${truncated} ${'y'.repeat(500)} TAIL-SHOULD-NOT-LOG`
const log = packFailureLog('primary', 'content is not valid JSON', 'length', text, {
  completion_tokens: 6000,
  completion_tokens_details: { reasoning_tokens: 5900 },
})
assert(log.includes('invalid pack at content is not valid JSON'), 'log missing the field path')
assert(log.includes('finish_reason=length'), 'log missing finish_reason')
assert(log.includes('reasoning_tokens=5900'), 'log missing reasoning token count')
assert(!log.includes('sk-live-should-not-appear'), 'log kept an authorization token')
assert(log.includes('Bearer [redacted]'), 'log did not redact the bearer token')
assert(!log.includes('TAIL-SHOULD-NOT-LOG'), 'log included text past the 400 character head')
assert(!log.includes('LLM_API_KEY'), 'log mentioned the env key name')
assert(!log.includes('Authorization:'), 'log included an authorization header')

const geminiKey = 'AIzaSyA-this-is-a-fake-key-value-123456'
const keyLog = packFailureLog('hedge', 'videos[1].script', 'stop', geminiKey + ' {"videos":[]}', null)
assert(!keyLog.includes('AIzaSyA'), 'log kept a Gemini-style key')
assert(keyLog.includes('videos[1].script'), 'log missing the invalid field path')

console.log('PASS complete Gemini JSON shape is accepted')
console.log('PASS validation errors name the missing or invalid field')
console.log('PASS failure logs redact secrets and omit the rest of the pack')
console.log('PASS Gemini instructions list every required field, type, length, and permitted value')
