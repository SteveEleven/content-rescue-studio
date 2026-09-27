// Checks the prepared Ryes & Shine pack and that the generation prompt still has the accuracy rules.
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { packIssue } from '../server/pack.mjs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'esbuild'

const root = fileURLToPath(new URL('..', import.meta.url))
const serverSrc = readFileSync(new URL('../server/index.mjs', import.meta.url), 'utf8')

const promptRules = [
  'Preserve the exact business name',
  'Canadian spelling',
  'locally sourced',
  'opening hours',
  'online booking',
  'tasting flights',
  'View current details',
  'absolute promise',
  'Book now',
  'Hashtags must not contain unsupported factual claims',
  'cautious wording',
  'intoxication',
  'Preserve any required footer exactly',
]
for (const rule of promptRules) {
  if (!serverSrc.includes(rule)) throw new Error(`generation prompt is missing: ${rule}`)
}
if (!serverSrc.includes('max_tokens: 6000')) throw new Error('Gemini max_tokens changed')
if (!serverSrc.includes("process.env.LLM_THINKING === '1'")) throw new Error('Gemini thinking guard changed')
if (!serverSrc.includes('LLM_TIMEOUT_MS || 50_000')) throw new Error('backend timeout changed')

const dir = mkdtempSync(join(tmpdir(), 'crs-demo-pack-'))
const outfile = join(dir, 'demo.mjs')
try {
  await build({
    absWorkingDir: root,
    entryPoints: ['src/lib/demoPack.ts'],
    bundle: true,
    format: 'esm',
    platform: 'neutral',
    outfile,
    logLevel: 'silent',
  })
  const { DEMO_INTAKE, DEMO_PACK } = await import(pathToFileURL(outfile).href)
  const blob = JSON.stringify({ DEMO_INTAKE, DEMO_PACK })
  const footer = '19+ | Please enjoy responsibly | View current menu and hours at ryesandshine.ca'

  if (!blob.includes('Ryes & Shine')) throw new Error('pack is missing the exact name Ryes & Shine')
  if (/Ryes and Shine/i.test(blob) || blob.includes('RyesAndShine')) {
    throw new Error('pack rewrites the brand ampersand as "and"')
  }

  const banned = [
    'local grains',
    'locally grown',
    'locally sourced',
    'book a tour online',
    'book now',
    'book online',
    'happy hour',
    'brunch',
    'live music',
    'live-music',
    'sunday soundtrack',
    'musician',
  ]
  const lower = blob.toLowerCase()
  for (const phrase of banned) {
    if (lower.includes(phrase)) throw new Error(`pack still contains "${phrase}"`)
  }

  if (DEMO_INTAKE.required_footer !== footer) throw new Error('intake footer is not the required footer')
  if (!DEMO_PACK.videos.every((video) => video.caption.includes(footer))) {
    throw new Error('a caption is missing the required footer')
  }
  if (DEMO_PACK.videos.map((video) => video.title).join('|') !== 'The Craft of Distilling|Tasting Room Atmosphere|Explore Tastings and Tours') {
    throw new Error('video themes changed')
  }
  if (!/favourite|flavour|centre/i.test(blob)) throw new Error('demo does not use Canadian spelling')

  const words = (text) => text.trim().split(/\s+/).filter(Boolean).length
  DEMO_PACK.videos.forEach((video, i) => {
    const count = words(video.script)
    if (count < 65 || count > 90) throw new Error(`video ${i + 1} script is ${count} words`)
    if (!video.script.startsWith(video.hook)) throw new Error(`video ${i + 1} script does not begin with its hook`)
    const beforeFooter = video.caption.split(footer)[0]
    const captionWords = words(beforeFooter)
    if (captionWords > 30) throw new Error(`video ${i + 1} caption is ${captionWords} words before the footer`)
    if (video.hashtags.length !== 5) throw new Error(`video ${i + 1} does not have 5 hashtags`)
  })
  const days = DEMO_PACK.calendar.map((day) => day.day).join(',')
  if (days !== 'Mon,Tue,Wed,Thu,Fri,Sat,Sun') throw new Error(`calendar days are ${days}`)
  if (words(DEMO_PACK.production_notes) > 50) throw new Error('production notes exceed 50 words')

  const shape = packIssue(DEMO_PACK)
  if (shape) throw new Error(`demo pack failed validation at ${shape}`)
  if (blob.includes('[placeholder]')) throw new Error('demo pack contains [placeholder]')
  const screen = readFileSync(new URL('../src/screens/PackScreen.tsx', import.meta.url), 'utf8')
  if (screen.includes('[placeholder]')) throw new Error('captions still show [placeholder]')
  const expectedTimes = {
    Mon: '5:30 PM',
    Tue: '5:30 PM',
    Wed: '5:30 PM',
    Thu: '5:30 PM',
    Fri: '4:30 PM',
    Sat: '11:00 AM',
    Sun: '12:00 PM',
  }
  for (const day of DEMO_PACK.calendar) {
    if (day.suggested_post_time !== expectedTimes[day.day]) {
      throw new Error(`${day.day} suggested post time is ${day.suggested_post_time}`)
    }
  }

  console.log('PASS demo pack keeps “Ryes & Shine” and the responsible-service footer')
  console.log('PASS demo pack omits unsupported claims')
  console.log('PASS demo pack matches the required JSON shape')
  console.log('PASS demo pack has specific suggested post times and no [placeholder]')
  console.log('PASS generation prompt includes the accuracy rules')
  console.log('PASS Gemini settings and backend timeout are unchanged')
} finally {
  rmSync(dir, { recursive: true, force: true })
}
