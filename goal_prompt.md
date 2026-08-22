Restyle the existing Content Rescue Studio frontend (Vite + React + TS, plain CSS in src/styles.css) to match the visual language of https://higgsfield.ai — a dark, media-forward, AI-creative-tool aesthetic. This is a RESTYLE, not a rebuild: keep all three screens, the data contract, generatePack()/fallback logic, localStorage saving, the iPhone-first layout rules (safe-area insets, 44px+ tap targets, no horizontal scroll), and the dev/iphone.html preview. Only change CSS, markup structure where needed for the new look, and fonts.

DESIGN SYSTEM (derived from higgsfield.ai — implement as CSS custom properties)
Colour — dark-only, no light theme (remove the prefers-color-scheme light palette; set color-scheme: dark and theme-color to match):
- --bg: #0F1113 (page)         - --surface: #1C1E20 (cards)
- --surface-2: #23262A (raised / inputs / chips)
- --border: rgba(255,255,255,0.05) hairline on cards, rgba(255,255,255,0.10) on hover/focus
- --text: #F7F7F8   - --text-2: #9A9FA6 (muted grey)   - --text-3: #6B7078
- --accent: #D1FE17 (electric lime) with --on-accent: #1A1A1A (dark text on lime — never white on lime)
- --accent-soft: rgba(209,254,23,0.12) for tinted pills/badges; lime text on it
- One featured gradient allowed for the pack header/hero card: deep blue → near-black (e.g. linear-gradient(135deg,#1E3A8A,#0F1113 70%)), like their "Seedance" feature tile.
- Pink/magenta only for a tiny "20% off"-style tag — we don't need it; skip.

Typography (load from Google Fonts):
- Headings: "Space Grotesk" 700, UPPERCASE, letter-spacing -0.04em, tight line-height 1.05. Screen titles ~28–32px on mobile; card titles 16–18px uppercase.
- Body/UI: "Inter" 400/500, 14–16px, line-height 1.5. Muted descriptions in --text-2 at 14–15px under every uppercase title (their pattern: UPPERCASE TITLE / grey one-line subtitle).
- Labels/meta (HOOK, SCRIPT · 25–35S, CTA, day names, "Video 1"): "Space Mono" 11–12px uppercase, tracking 0.06em, --text-3.

Shape & surfaces:
- Radii: 8px small elements, 10px buttons/inputs, 16px cards. Cards are flat --surface with the 1px hairline border, NO drop shadows. Hover/active: border brightens, bg shifts to --surface-2.
- Generous dark whitespace; content blocks separated by 1px rgba(255,255,255,0.06) hairlines rather than card stacks where it reads cleaner.

Buttons:
- Primary: lime --accent bg, dark text, 500 weight, 14–15px, 10px radius, 44–48px tall. Give the main CTAs ("Build my 7-day content plan", "Copy full plan") their signature hard offset shadow: box-shadow: 0 4px 0 0 rgba(255,255,255,0.85) (a solid off-white block beneath the lime button), translateY(2px) + shorter shadow on :active.
- Secondary: white (#FFFFFF) bg with dark text, same size ("Learn more" style) — use for Share.
- Tertiary/ghost: --surface-2 bg, --text, hairline border — Save pack, Reset, Load demo.
- Text links in lime.
- Small pill tags (like their "New", "Layers", "Available now"): lime bg, dark text, 11px Space Mono uppercase, 4px radius, 2px 6px padding. Use for "Video 1/2/3", "Showing prepared demo pack", "New". Use --accent-soft + lime text for the quieter variant (format chips on the 7-day plan).

Navigation / chrome:
- Add a slim top bar on every screen (sticky, bg --bg at 85% + backdrop-blur): a small lime geometric logo mark (simple SVG, ~28px) + "CONTENT RESCUE" wordmark in Space Grotesk uppercase, and on the right a small lime "New rescue" or "Saved" pill depending on screen. Keep it ≤56px tall + safe-area top.
- Tabs on the Pack screen become their nav-pill style: a row in --surface-2 with 10px radius; active tab = --surface bg with white text, inactive grey; optional lime 2px underline instead if cleaner.

Media-forward cards:
- Video idea cards should feel like their content tiles: a 16:9 "thumbnail" area at the top of each card (dark gradient placeholder #23262A→#0F1113 with a subtle lime play-glyph and the hook as large Space Grotesk text overlaid, like their "Fac…" tile), then UPPERCASE TITLE, grey subtitle line, then the script/visual/CTA blocks.
- 7-day plan rows: horizontal card with a square day tile on the left (--surface-2, Space Grotesk uppercase day, lime text for the weekend/Sunday conversion day), goal as uppercase title, topic as grey body, CTA in lime.
- Captions: caption in a --surface-2 block in Inter, hashtags as small --accent-soft chips.

Form (Start screen):
- Inputs/textareas/selects: --surface-2 bg, hairline border, 10px radius, 15–16px Inter, lime focus ring (0 0 0 2px rgba(209,254,23,0.35)). Placeholders --text-3. Section headings uppercase Space Grotesk with grey subtitle.
- Tone chips: --surface-2 pills, selected = lime bg dark text.

Generate screen:
- Full-bleed dark with a lime progress treatment: a thin lime progress bar across the top plus the cycling messages in large uppercase Space Grotesk; three small dots → lime when active. Replace the round spinner with a minimal lime pulse or the bar.

Motion: 150–200ms ease on hover/active colour and border changes; screen transitions fade + 8px rise; respect prefers-reduced-motion.

Meta/PWA: update theme-color and manifest background_color/theme_color to #0F1113 / #D1FE17; regenerate icons with a lime mark on dark.

DONE WHEN
- npm run dev and npm run build pass with zero errors.
- All existing behaviour still works: Load demo → Build → 3 scripts + captions + 7-day plan → Copy full plan → Save → reload → saved pack listed.
- Verified at 390×844 via /dev/iphone.html: no horizontal scroll, every button/tab/chip ≥44px, sticky bottom bar doesn't cover the last card, lime-on-dark contrast ≥ 4.5:1 for body text and ≥ 3:1 for large uppercase headings.
- Screens visually read as "Higgsfield": near-black canvas, hairline-bordered flat cards, uppercase Space Grotesk titles with grey subtitles, electric-lime CTAs with the hard offset shadow, Space Mono micro-labels.