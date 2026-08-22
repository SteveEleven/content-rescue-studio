import type { Intake } from './types'
import { DEMO_INTAKE } from './demoPack'

export interface Template {
  id: string
  name: string
  industry: string
  angle: string
  blurb: string
  hue: string // gradient hue for the tile
  intake: Intake
  featured?: boolean
}

const base = (partial: Partial<Intake>): Intake => ({
  business_name: '',
  industry: '',
  location: '',
  offer_goal: '',
  target_customer: '',
  platform: 'Instagram Reels',
  tone: [],
  required_footer: '',
  source_text: '',
  ...partial,
})

export const TEMPLATES: Template[] = [
  {
    id: 'ryes-and-shine',
    name: 'Ryes & Shine',
    industry: 'Craft distillery & live music',
    angle: 'Sunday Soundtrack',
    blurb: 'Drive Sunday live-music visits with cocktails, food, and patio energy.',
    hue: '#1e3a8a',
    featured: true,
    intake: DEMO_INTAKE,
  },
  {
    id: 'neighbourhood-cafe',
    name: 'Neighbourhood café',
    industry: 'Coffee & bakery',
    angle: 'The 7am Ritual',
    blurb: 'Turn the morning rush into a habit people film themselves being part of.',
    hue: '#5b3a1e',
    intake: base({
      industry: 'Independent café & bakery',
      offer_goal: 'Grow weekday morning regulars and push the new seasonal drink.',
      target_customer: 'Commuters, remote workers, and parents within a 10-minute walk.',
      tone: ['Warm', 'Calm', 'Craft-focused', 'Locally proud'],
      source_text:
        'We roast small batches in-house, bake every morning from 5am, and keep the wifi fast and the music low. Oat milk is free. Loyalty card: buy nine, the tenth is on us.',
    }),
  },
  {
    id: 'boutique-gym',
    name: 'Boutique gym',
    industry: 'Fitness studio',
    angle: 'Show Up Season',
    blurb: 'Make the first class feel easy and the hundredth feel earned.',
    hue: '#7f1d1d',
    intake: base({
      industry: 'Boutique strength & conditioning studio',
      offer_goal: 'Fill the 6am and 6pm classes and sell the intro 2-week pass.',
      target_customer: 'Beginners and returners aged 25–45 who are nervous about big-box gyms.',
      tone: ['Confident', 'Warm', 'Bold'],
      source_text:
        'Small classes (max 12), coached every minute, no mirrors, no egos. Every session is scaled to you. First class is free — just show up.',
    }),
  },
  {
    id: 'hair-salon',
    name: 'Hair salon',
    industry: 'Beauty & hair',
    angle: 'Before / After / Always',
    blurb: 'Transformations, technique close-ups, and the chair-side conversation.',
    hue: '#581c87',
    intake: base({
      industry: 'Hair salon & colour studio',
      offer_goal: 'Book out Tuesday–Thursday and promote balayage.',
      target_customer: 'Women 25–50 looking for a stylist they can trust for colour.',
      tone: ['Playful', 'Confident', 'Warm'],
      source_text:
        'Colour specialists with 10+ years each. Free consultations. We use low-ammonia colour and a bond-builder on every service. Walk-ins welcome midweek.',
    }),
  },
  {
    id: 'taco-spot',
    name: 'Taco spot',
    industry: 'Restaurant',
    angle: 'Tuesday Is Not Enough',
    blurb: 'Food that looks loud, a kitchen with personality, and a line worth joining.',
    hue: '#9a3412',
    intake: base({
      industry: 'Fast-casual taqueria',
      offer_goal: 'Lift weekday dinner traffic and launch the new birria special.',
      target_customer: 'Students, young families, and after-work groups within 15 minutes.',
      tone: ['Playful', 'Bold', 'Locally proud'],
      source_text:
        'Handmade corn tortillas daily. Slow-braised birria, al pastor off the trompo, house salsas from mild to unreasonable. Family-owned since 2016.',
    }),
  },
  {
    id: 'realtor',
    name: 'Local realtor',
    industry: 'Real estate',
    angle: 'Know the Block',
    blurb: 'Hyper-local expertise: streets, schools, coffee, commute — not just listings.',
    hue: '#134e4a',
    intake: base({
      industry: 'Residential real estate agent',
      offer_goal: 'Generate seller consultations in two target neighbourhoods.',
      target_customer: 'Homeowners 35–60 thinking about selling in the next 12 months.',
      tone: ['Confident', 'Calm', 'Locally proud', 'Responsible'],
      source_text:
        'Fifteen years selling in the west side. Free home-value walkthroughs. I live here, my kids go to school here, and I know which streets sell fast and why.',
    }),
  },
  {
    id: 'dental',
    name: 'Family dental',
    industry: 'Healthcare',
    angle: 'Nothing to Fear',
    blurb: 'Calm, friendly, demystifying — the clinic people recommend to anxious friends.',
    hue: '#164e63',
    intake: base({
      industry: 'Family dental clinic',
      offer_goal: 'Attract new-patient bookings and reduce no-shows for hygiene visits.',
      target_customer: 'Families and nervous adults who have put off the dentist.',
      tone: ['Calm', 'Warm', 'Responsible'],
      required_footer: 'Results vary. Book a consultation for personal advice.',
      source_text:
        'Gentle, judgement-free care. Same-week emergency appointments. Direct billing to most insurers. Kids’ first visit is free.',
    }),
  },
  {
    id: 'brewery',
    name: 'Taproom',
    industry: 'Brewery',
    angle: 'Fresh Off the Tank',
    blurb: 'Release days, brewer stories, and the taproom as the town’s living room.',
    hue: '#3f3f12',
    intake: base({
      industry: 'Craft brewery & taproom',
      offer_goal: 'Promote the Friday release and build trivia-night regulars.',
      target_customer: 'Adults 19+ within 20 minutes who like trying new beers with friends.',
      tone: ['Playful', 'Craft-focused', 'Locally proud', 'Responsible'],
      required_footer: '19+ | Please enjoy responsibly',
      source_text:
        'Twelve rotating taps brewed on site. Dog-friendly patio. Food trucks Thursday–Sunday. Trivia Wednesdays. Growler fills and cans to go.',
    }),
  },
]
