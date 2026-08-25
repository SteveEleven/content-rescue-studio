# Content Rescue Studio

Mobile-first web app that turns a local business's existing information into a ready-to-produce
week of short-form video content. Built for a one-day hackathon demo: one polished workflow.

## Demo video

**[▶ Watch the 60-second pitch video](https://github.com/SteveEleven/content-rescue-studio/blob/main/demo/pitch.mp4)**







## Run

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-checks (tsc) and builds to dist/
npm run preview   # serves the production build
```

### Pages

Hash-routed, no router dependency (`src/lib/router.ts`):

| Route            | What it is                                                                 |
| ---------------- | -------------------------------------------------------------------------- |
| `#/`             | Landing — hero, example-pack tiles, how it works, what's in a pack, CTA    |
| `#/templates`    | 8 industry templates; tapping one prefills the studio intake               |
| `#/how-it-works` | Steps, what you get, guardrails, FAQ                                       |
| `#/studio`       | The rescue flow: Start a Rescue → Generate → Content Rescue Pack           |

Marketing pages hand data into the studio via `src/lib/handoff.ts` (a template prefills the
intake; "See an example pack" opens the demo pack instantly).

Happy path (works fully offline):
**Start a Rescue → "Load demo: Ryes & Shine" → "Build my 7-day content plan" → Content Rescue Pack**
(3 scripts, captions, 7-day plan) → "Copy full plan" → "Save pack" → reload → pack still listed.

### Design

Dark-only, media-forward system inspired by higgsfield.ai: near-black canvas (`#0f1113`), flat
hairline-bordered cards, uppercase **Space Grotesk** titles with grey subtitles, **Inter** body,
**Space Mono** micro-labels, and an electric-lime accent (`#d1fe17`) with dark text. All tokens live
at the top of `src/styles.css`. Fonts load from Google Fonts; offline they fall back to system fonts
and the app still works.

### iPhone-size preview on desktop

`npm run dev` also serves **http://localhost:5173/dev/iphone.html** — the app inside a true
390×844 viewport (no DevTools device mode needed). `dev/` is not part of the production build.

### On an iPhone

Open the dev/preview URL in Safari → Share → **Add to Home Screen**. The app ships a web manifest,
`viewport-fit=cover`, safe-area insets, and 44px+ tap targets.

## Plugging in the backend

All AI calls go through **one** function:

```ts
// src/lib/api.ts
generatePack(intake: Intake): Promise<{ pack: Pack; fallback: boolean }>
```

It `POST`s the intake as JSON to **`/api/generate`** and expects a JSON body matching the contract
in `src/lib/types.ts`:

```ts
{
  business_summary: string,
  content_angle: string,
  videos: [ { title, hook, script, visual_direction, cta, caption, hashtags: string[] } ], // exactly 3
  calendar: [ { day, goal, format, topic, video_ref, cta } ],                              // exactly 7
  production_notes: string
}
```

The request body is the `Intake` shape (`business_name`, `industry`, `location`, `offer_goal`,
`target_customer`, `platform`, `tone: string[]`, `required_footer`, `source_text`).

If the call fails, takes longer than **45 s**, returns non-2xx, or returns JSON that doesn't match
the contract (`normalizePack` in `src/lib/api.ts`), the app silently falls back to the embedded demo
pack (`src/lib/demoPack.ts`) and shows a small **"Showing prepared demo pack"** badge. It never shows
a broken state.

### Backend (server/index.mjs)

Zero-dependency Node server: `npm run server` (or `npm start` for server + Vite together). Reads `.env`:

| Var              | Default   | Meaning                                                                 |
| ---------------- | --------- | ----------------------------------------------------------------------- |
| `LLM_BASE_URL`   | OpenAI    | OpenAI-compatible `/chat/completions` base (currently GMI)              |
| `LLM_API_KEY`    | —         | Bearer token (never commit; `.env` is gitignored)                        |
| `LLM_MODEL`      | gpt-4o-mini | Model id                                                              |
| `PORT`           | 3000      | Server port (Vite proxies `/api` here in dev)                            |
| `LLM_TIMEOUT_MS` | 50000     | Overall deadline per request; client falls back to the demo pack at 45s |
| `LLM_HEDGE_MS`   | 20000     | Hedged retry: fire a 2nd identical request if the 1st is still running after this long (or failed transiently); first success wins. `0` disables. |
| `LLM_THINKING`   | off       | `1` re-enables reasoning for thinking models (DeepSeek); off is faster   |

Typical latency with `anthropic/claude-haiku-4.5` via GMI: 13–15 s per pack.

### Where to wire it

- **Dev:** `vite.config.ts` proxies `/api` → `http://localhost:3000`. If the server is down the
  proxy errors and the client silently shows the demo pack.

- **Prod:** serve `dist/` as static files and route `/api/generate` to your backend on the same
  origin (or change the URL in `generatePack`).

## Project layout

```
src/
  App.tsx                 route switch (landing / templates / how-it-works / studio)
  components.tsx          TopBar (header + desktop nav), NavRow (mobile), PageHeader, Footer, CopyButton, Toast
  styles.css              design tokens (dark), safe areas, components
  pages/
    Landing.tsx           marketing home
    Templates.tsx         industry template gallery → prefills studio
    HowItWorks.tsx        steps, guardrails, FAQ
    shared.tsx            re-exports NavRow/Footer/PageHeader + icons
  lib/
    router.ts             tiny hash router (useRoute / navigate / href) + NAV_LINKS
    handoff.ts            one-shot intake/pack handoff into the studio
    templates.ts          the 8 industry templates
    types.ts              Intake / Pack data contract
    api.ts                generatePack() + normalizePack() validation + fallback
    demoPack.ts           embedded Ryes & Shine demo intake + pack
    storage.ts            localStorage (max 3 saved packs)
    text.ts               plain-text export, copy, Web Share (clipboard fallback)
  screens/
    Studio.tsx            screen state machine (start → generate → pack), save/load
    StartScreen.tsx       intake form, demo loader, saved packs list
    GenerateScreen.tsx    progress state
    PackScreen.tsx        tabs: Video ideas / Captions / 7-day plan + sticky bar
public/
  manifest.webmanifest, icons
dev/iphone.html           dev-only 390×844 preview frame
```

The demo pack is labelled *"Unofficial demo created from public business information"*.
