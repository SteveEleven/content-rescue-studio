# Grok handoff — Content Rescue Studio backend

You are taking over **item 1** of the "Direction" list below: wire the real `POST /api/generate` backend for an existing, finished Vite + React frontend. Do not change the frontend contract. Everything you need is in this single message: the project handoff, the exact TypeScript types, the client function that calls you, and the Vite config where the dev stub currently lives.

## Your task
1. Build a small server (Node/Express, or a single serverless function — your call, but keep it to one file if possible) that accepts the `Intake` JSON below at `POST /api/generate` and returns a `Pack` JSON that passes `normalizePack()` exactly (3 videos, 7 calendar days, all fields strings, `hashtags` a string array).
2. Use one LLM call with a JSON-only system prompt. Starter prompt from the hackathon playbook:
   > You are an expert short-form video strategist for local businesses. Using only the supplied business information, produce a practical seven-day short-form content plan for {platform}. The audience is {target_customer}; the offer is {offer_goal}; the tone is {tone}. Avoid unsupported claims, invented pricing, legal/medical promises, and generic marketing language. Return valid JSON only with: business_summary, content_angle, videos (exactly 3: title, hook, script, visual_direction, cta, caption, hashtags), calendar (exactly 7: day, goal, format, topic, video_ref, cta), and production_notes. Each script must be 25–35 seconds when spoken and must begin with a strong hook.
3. Guardrails: never imply intoxication, drinking and driving, or health benefits; never state pricing, times, or discounts; append `required_footer` to every caption when it is non-empty.
4. Respond within the client's 20-second budget (set your own LLM timeout ~15s). On any failure return a 4xx/5xx — the client then falls back to its embedded demo pack, so never return partial JSON with a 200.
5. Keep the API key server-side (env var). Tell me how to run it and how to update `vite.config.ts` (replace the stub or add `server: { proxy: { '/api': 'http://localhost:3000' } }`).

---

## HANDOFF.md

# Content Rescue Studio — project handoff

## What it is
A mobile-first (iPhone-first) web app for a one-day hackathon. It turns a local business's existing
information (website / About / menu text) into a ready-to-produce week of short-form video content:
3 video ideas (hook, 25–35s script, visual direction, CTA), 3 captions with hashtags, and a 7-day
posting calendar. One polished workflow, not many features.

Working directory: /Users/dreaming/Codecaetha (not a git repo yet).

## Tech
- Vite 5 + React 18 + TypeScript, plain CSS (single file src/styles.css), no UI framework, no router
  dependency (tiny hash router), no auth, no database.
- `npm run dev` → http://localhost:5173 · `npm run build` → tsc + vite (currently passes with zero errors)
- PWA bits: public/manifest.webmanifest, SVG + PNG icons, viewport-fit=cover, safe-area insets,
  44px+ tap targets, no horizontal scroll. Dark-only.
- Dev-only iPhone preview frame: http://localhost:5173/dev/iphone.html (true 390×844 viewport).

## Routes (hash-based, src/lib/router.ts)
- `#/`             Landing — hero, 3 example video tiles, how it works, what's in a pack, CTA banner
- `#/templates`    8 industry templates; tapping one prefills the studio intake (src/lib/templates.ts)
- `#/how-it-works` steps, what you get, guardrails, FAQ
- `#/studio`       the core flow: Start a Rescue (intake form) → Generate (progress) → Content Rescue Pack
Marketing pages hand data into the studio via src/lib/handoff.ts (prefill intake, or open a pack instantly).

## The AI seam (the one thing still to wire up)
All AI calls go through ONE function in src/lib/api.ts:

    generatePack(intake: Intake): Promise<{ pack: Pack; fallback: boolean }>

It POSTs the intake as JSON to `/api/generate` with a 20s timeout and validates the response with
`normalizePack()`. On ANY failure (network, timeout, non-2xx, malformed JSON, wrong shape) it silently
returns the embedded demo pack and the UI shows a small "Showing prepared demo pack" badge. The app
never shows a broken state.

Currently `/api/generate` is a stub in vite.config.ts (`apiStub()` middleware) that answers 501 so the
client falls back. To wire the real backend: replace the stub, or delete it and add
`server: { proxy: { '/api': 'http://localhost:3000' } }`. In prod, serve dist/ statically and route
/api/generate to the backend on the same origin.

### Request body (Intake)
    {
      business_name: string, industry: string, location: string,
      offer_goal: string, target_customer: string,
      platform: 'Instagram Reels' | 'TikTok' | 'Facebook Reels' | 'YouTube Shorts',
      tone: string[],            // chips: Warm, Playful, Confident, Craft-focused, Locally proud, Bold, Calm, Responsible
      required_footer: string,   // optional; appended to every caption
      source_text: string        // pasted website/about/services text
    }

### Response body (Pack) — must match exactly
    {
      business_summary: string,
      content_angle: string,
      videos: [ { title, hook, script, visual_direction, cta, caption, hashtags: string[] } ],  // exactly 3
      calendar: [ { day, goal, format, topic, video_ref, cta } ],                                // exactly 7
      production_notes: string
    }
Scripts should be 25–35s spoken. Guardrails the copy must follow: never imply intoxication, drinking
and driving, or health benefits; never state pricing, times, or discounts; append required_footer to
every caption when set.

## Embedded demo pack (src/lib/demoPack.ts)
Ryes & Shine Craft Distillery, 2323 Millstream Road, Langford, BC — labelled "Unofficial demo created
from public business information". Angle: "Sunday Soundtrack at Ryes & Shine". Footer:
"19+ | Please enjoy responsibly". Used as the fallback AND the "See an example pack" preview.

## Persistence
localStorage key `crs.savedPacks.v1`, max 3 saved packs (newest first), src/lib/storage.ts.

## Design system (Higgsfield.ai-inspired; tokens at top of src/styles.css)
- Canvas #0f1113 · cards #1c1e20 · raised/inputs #23262a · hairline borders rgba(255,255,255,.05)
- Text #f7f7f8 · muted #9a9fa6 · labels #8b9199 · accent lime #d1fe17 with dark text #1a1a1a
- Fonts (Google Fonts): Space Grotesk 700 uppercase −4% tracking for titles; Inter for body;
  Space Mono 11–12px uppercase for micro-labels/tags
- Radii 8/10/16px, flat cards (no drop shadows), lime CTAs with a hard off-white offset shadow
  (`.btn--hard`), white secondary button, ghost tertiary. One blue→black gradient for hero/banners.
- Header: sticky, blurred; desktop shows inline nav links, mobile shows a pill nav row (`NavRow`).
  Footer: brand + two link columns + disclaimer line. Both on every page incl. the studio.

## File map
    index.html                 fonts, meta, manifest link
    vite.config.ts             react plugin + /api/generate stub (replace/proxy here)
    dev/iphone.html            dev-only 390×844 preview frame (not in build)
    public/                    manifest.webmanifest, icon.svg, icon-192/512.png, apple-touch-icon.png
    src/main.tsx               entry
    src/App.tsx                route switch
    src/styles.css             all styling (tokens → components → marketing sections)
    src/components.tsx         TopBar, NavRow, PageHeader, Footer, LogoMark, CopyButton, Toast, useToast
    src/lib/types.ts           Intake / Pack / SavedPack types, PLATFORMS, TONES
    src/lib/api.ts             generatePack(), normalizePack(), 20s timeout, fallback
    src/lib/demoPack.ts        DEMO_INTAKE, DEMO_PACK, DEMO_LABEL
    src/lib/storage.ts         load/save/delete saved packs (max 3)
    src/lib/text.ts            packToPlainText(), copyText(), shareText() (Web Share → clipboard)
    src/lib/router.ts          useRoute(), navigate(), href(), NAV_LINKS
    src/lib/handoff.ts         setHandoff / peekHandoff / clearHandoff (StrictMode-safe)
    src/lib/templates.ts       8 industry templates
    src/screens/Studio.tsx     start → generate → pack state machine, save/load
    src/screens/StartScreen.tsx   intake form, "Load demo: Ryes & Shine", Reset, saved packs list
    src/screens/GenerateScreen.tsx progress bar + cycling "Finding hooks… / Building scripts… / Planning the week…"
    src/screens/PackScreen.tsx    hero card, tabs (Video ideas / Captions / 7-day plan), sticky bar:
                                  Copy full plan · Share · Save pack · Start new rescue
    src/pages/Landing.tsx, Templates.tsx, HowItWorks.tsx, shared.tsx

## Verified so far
- Build clean, no console errors.
- 390×844: Load demo → Build → 3 scripts + 21 hashtags + Mon–Sun → Copy full plan → Save → reload →
  saved pack listed. No horizontal scroll on any route; no tap target under 44px; sticky bottom bar
  doesn't cover content. Contrast: body ≥5.7:1, lime on dark ≥14:1, labels ≥4.78:1.
- Desktop (≥720px): header nav, 3/4-column grids, 3-column footer.

## Known caveats
- Fonts come from Google Fonts; offline they fall back to system fonts (app still works).
- "Suggested post time" in Captions is a literal "[placeholder]" by spec.
- Platform is a single select; the demo's intent spans Reels/TikTok/FB Reels.
- Not a git repo yet — run `git init` before sharing.

## Direction / what I want help with next
1. Wire the real `/api/generate` backend (LLM prompt that returns the exact Pack JSON above, with the
   guardrails; handle the 20s budget; return 4xx/5xx on failure so the client falls back).
2. Demo polish for the pitch: tighten copy on the landing page, maybe a 3-step "demo script" for the
   presenter, and make sure the fallback badge is visible but not alarming.
3. Optional: real "Suggested post time" per platform; export as .txt/.md; per-video regenerate.
4. Optional: tests for normalizePack() and packToPlainText(); a Playwright happy-path test at 390×844.


## src/lib/types.ts

```ts
export type Platform = 'Instagram Reels' | 'TikTok' | 'Facebook Reels' | 'YouTube Shorts'

export const PLATFORMS: Platform[] = ['Instagram Reels', 'TikTok', 'Facebook Reels', 'YouTube Shorts']

export const TONES = ['Warm', 'Playful', 'Confident', 'Craft-focused', 'Locally proud', 'Bold', 'Calm', 'Responsible'] as const

export interface Intake {
  business_name: string
  industry: string
  location: string
  offer_goal: string
  target_customer: string
  platform: Platform
  tone: string[]
  required_footer: string
  source_text: string
}

export interface Video {
  title: string
  hook: string
  script: string
  visual_direction: string
  cta: string
  caption: string
  hashtags: string[]
}

export interface CalendarDay {
  day: string
  goal: string
  format: string
  topic: string
  video_ref: string
  cta: string
}

export interface Pack {
  business_summary: string
  content_angle: string
  videos: Video[] // exactly 3
  calendar: CalendarDay[] // exactly 7
  production_notes: string
}

export interface SavedPack {
  id: string
  name: string
  saved_at: string // ISO
  intake: Intake
  pack: Pack
  is_demo: boolean
}

export const EMPTY_INTAKE: Intake = {
  business_name: '',
  industry: '',
  location: '',
  offer_goal: '',
  target_customer: '',
  platform: 'Instagram Reels',
  tone: [],
  required_footer: '',
  source_text: '',
}
```

## src/lib/api.ts

```ts
import type { Intake, Pack } from './types'
import { DEMO_PACK } from './demoPack'

export const GENERATE_TIMEOUT_MS = 20_000

export interface GenerateResult {
  pack: Pack
  /** true when the embedded demo pack was used instead of a live response */
  fallback: boolean
}

/**
 * The single AI entry point. POSTs the intake to /api/generate and expects a Pack as JSON.
 * Any failure (network, timeout > 20s, non-2xx, malformed JSON, wrong shape) silently
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
```

## vite.config.ts

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev-only stub for POST /api/generate.
// Replace with your real backend (or proxy to it) — see README "Plugging in the backend".
function apiStub() {
  return {
    name: 'api-generate-stub',
    configureServer(server: any) {
      server.middlewares.use('/api/generate', (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end()
          return
        }
        // Returning 501 makes the client fall back to the embedded demo pack.
        res.statusCode = 501
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'Backend not wired yet — client falls back to demo pack.' }))
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), apiStub()],
})
```
