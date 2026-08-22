import type { Intake, Pack } from './types'

export const DEMO_LABEL = 'Unofficial demo created from public business information'

export const DEMO_INTAKE: Intake = {
  business_name: 'Ryes & Shine Craft Distillery',
  industry: 'Craft distillery, cocktail bar, food venue & local-events destination',
  location: '2323 Millstream Road, Langford, BC',
  offer_goal: 'Drive Sunday live-music visits and highlight the full food / cocktail / events experience.',
  target_customer:
    'Adults 19+ in Langford / Greater Victoria looking for local outings, date nights, patio drinks, food, live music, and group plans.',
  platform: 'Instagram Reels',
  tone: ['Warm', 'Playful', 'Craft-focused', 'Locally proud', 'Responsible'],
  required_footer: '19+ | Please enjoy responsibly',
  source_text: `Ryes & Shine Craft Distillery — 2323 Millstream Road, Langford, BC.

Small-batch craft distillery, cocktail bar, food venue, and local-events destination on Millstream Road. We distill in small batches on site and build our cocktail list around what comes off the still — rye-forward spirits, seasonal infusions, and house-made mixers.

The kitchen serves shareable plates and comfort food built to pair with cocktails. Our patio is open for sunny afternoons, and the room fills up for live music, with a rotating lineup of local musicians on Sunday afternoons.

Come for a date night, a group catch-up, a midweek drink, or a lazy Sunday with a live soundtrack. Tours, tastings, and private events available.

Music-forward. Craft-focused. Proudly Langford. 19+ | Please enjoy responsibly.`,
}

export const DEMO_PACK: Pack = {
  business_summary:
    'Ryes & Shine is a small-batch craft distillery, cocktail bar, food venue, and local-events destination on Millstream Road in Langford, BC. Warm, playful, and music-forward, it gives adults 19+ across Greater Victoria an easy local plan for date nights, patio drinks, group outings, and live music — especially on Sundays.',
  content_angle: 'Sunday Soundtrack at Ryes & Shine',
  videos: [
    {
      title: 'Choose Your Sunday Soundtrack',
      hook: 'Your Sunday plans just found their soundtrack.',
      script:
        'Skip the usual Sunday scroll. At Ryes & Shine in Langford, live music, crafted cocktails, and food come together for an easy afternoon out. Find your table, choose your drink, settle into the patio energy, and let the soundtrack do the rest. Bring your favourite people and make Sunday feel like an occasion.',
      visual_direction:
        '1-second patio arrival; close-up cocktail pour; musician performance; food landing at table; cheers without portraying excess; wide venue shot.',
      cta: 'Plan your Sunday visit.',
      caption:
        'Live music, crafted cocktails, and an easy Sunday plan. Find your soundtrack at Ryes & Shine.\n\n19+ | Please enjoy responsibly',
      hashtags: ['#RyesAndShine', '#LangfordBC', '#SundayLiveMusic', '#CraftDistillery', '#YYJ', '#WestShore', '#PatioSeason'],
    },
    {
      title: 'From Playlist to Pour',
      hook: 'What if your favourite song was a cocktail?',
      script:
        'Every song has a mood — so does every cocktail. At Ryes & Shine, our bartenders build drinks the way a good playlist builds a night: a clear opening note, a little surprise in the middle, and a finish you remember. Small-batch spirits distilled right here in Langford, fresh garnish, and a pour that matches the music in the room. Tell us your track, and we will find your glass.',
      visual_direction:
        'Bartender builds a music-inspired signature cocktail — ice cracking into the glass, a slow spirit pour, garnish placed with care, final glass lifted into soft light. Cut on the beat of the backing track.',
      cta: 'Find your next favourite cocktail in Langford.',
      caption:
        'Pick a song. We will pour the cocktail to match. Small-batch spirits, fresh garnish, and a little Langford flair at Ryes & Shine.\n\n19+ | Please enjoy responsibly',
      hashtags: ['#RyesAndShine', '#CraftCocktails', '#LangfordBC', '#SmallBatch', '#Mixology', '#YYJDrinks', '#VictoriaBC'],
    },
    {
      title: 'The Millstream Night-Out Plan',
      hook: 'Looking for a different kind of Langford night out?',
      script:
        'Here is the plan. Pull up on Millstream Road and step into a working craft distillery. Start with a cocktail built from spirits made a few feet from your table. Order a few plates for the group. Then let the live music take over — no reservations for the dance floor required. Date night, crew night, or just a Thursday that deserves better. Ryes & Shine has the whole evening covered.',
      visual_direction:
        'Exterior arrival at dusk; door opening into warm light; plates landing on the table; cocktail close-up; live-music atmosphere from the crowd’s point of view; friendly staff and guest moments; end on the glowing sign.',
      cta: 'Visit Ryes & Shine at Millstream Road.',
      caption:
        'Craft cocktails, good food, live music — all under one roof on Millstream Road. Your Langford night out, sorted.\n\n19+ | Please enjoy responsibly',
      hashtags: ['#RyesAndShine', '#LangfordNightOut', '#DateNightYYJ', '#WestShore', '#LiveMusicVictoria', '#CraftDistillery', '#LangfordBC'],
    },
  ],
  calendar: [
    {
      day: 'Mon',
      goal: 'Build anticipation',
      format: 'Teaser · 3 quick clips',
      topic: '“This week’s soundtrack” teaser — three fast cuts of music, cocktails, and patio.',
      video_ref: 'Video 1',
      cta: 'Save this for weekend plans.',
    },
    {
      day: 'Tue',
      goal: 'Tell the craft story',
      format: 'Talking-head explainer',
      topic: 'Bartender or distiller explains one ingredient or product detail.',
      video_ref: 'Video 2',
      cta: 'Explore the menu.',
    },
    {
      day: 'Wed',
      goal: 'Drive early-week visits',
      format: 'Pairing reminder',
      topic: 'Happy-hour reminder with a cocktail and food pairing.',
      video_ref: 'Video 3',
      cta: 'Make a midweek plan.',
    },
    {
      day: 'Thu',
      goal: 'Create an excuse to share',
      format: 'Reveal',
      topic: 'Cocktail reveal with a playful music-led hook.',
      video_ref: 'Video 2',
      cta: 'Tag your cocktail crew.',
    },
    {
      day: 'Fri',
      goal: 'Promote date night',
      format: 'Venue montage',
      topic: '“Where are we going tonight?” venue montage — food, drinks, music, room.',
      video_ref: 'Video 3',
      cta: 'Plan your Friday night.',
    },
    {
      day: 'Sat',
      goal: 'Build Sunday demand',
      format: 'Live-music preview',
      topic: 'Musician, patio, drinks, and a brunch cue for tomorrow.',
      video_ref: 'Video 1',
      cta: 'Make Sunday plans.',
    },
    {
      day: 'Sun',
      goal: 'Convert / social proof',
      format: 'Live ambience or recap',
      topic: 'Live ambience from the room or a same-day recap of the afternoon.',
      video_ref: 'Video 1',
      cta: 'Visit today / follow for events.',
    },
  ],
  production_notes:
    'Shot list suitable for an AI-avatar or stock-assisted video workflow: patio arrival, cocktail pour close-ups, bartender hands building a drink, live musician (wide + close), food landing at table, group cheers framed as celebration (never excess), exterior arrival at dusk, glowing sign. Keep every video 25–35 seconds with on-screen captions. Never imply intoxication, drinking and driving, or health benefits. Do not state pricing, times, or discounts — point viewers to the venue for details. End every caption with the required footer: “19+ | Please enjoy responsibly”.',
}
