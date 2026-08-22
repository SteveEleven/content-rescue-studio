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

## Backend — DONE and tested (server/index.mjs)
Zero-dependency Node server, `npm run server` (or `npm start` = server + vite). POST /api/generate +
GET /api/health. Reads .env: LLM_BASE_URL (GMI, OpenAI-compatible), LLM_API_KEY, LLM_MODEL
(anthropic/claude-haiku-4.5), PORT=3000, plus LLM_TIMEOUT_MS=50000, LLM_HEDGE_MS=20000 (hedged retry:
second request fired if the first is still running at 20s; first success wins; 0 disables),
LLM_THINKING (off). Prompt enforces the guardrails, short content_angle, Mon..Sun days, "Video N"
refs, 5 hashtags, footer on every caption; server also re-applies footer/hashtag hygiene.
Measured: 13–15s per pack; invalid/failed responses → 502 → client shows the demo pack with a badge.

## The AI seam (how the frontend talks to it)
All AI calls go through ONE function in src/lib/api.ts:

    generatePack(intake: Intake): Promise<{ pack: Pack; fallback: boolean }>

It POSTs the intake as JSON to `/api/generate` with a 45s timeout and validates the response with
`normalizePack()`. On ANY failure (network, timeout, non-2xx, malformed JSON, wrong shape) it silently
returns the embedded demo pack and the UI shows a small "Showing prepared demo pack" badge. The app
never shows a broken state.

vite.config.ts proxies `/api` → http://localhost:3000 in dev. In prod, serve dist/ statically and route
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
1. (done) Backend wired and tested end-to-end with the real model.
2. Demo polish for the pitch: tighten copy on the landing page, maybe a 3-step "demo script" for the
   presenter, and make sure the fallback badge is visible but not alarming.
3. Optional: real "Suggested post time" per platform; export as .txt/.md; per-video regenerate.
4. Optional: tests for normalizePack() and packToPlainText(); a Playwright happy-path test at 390×844.
