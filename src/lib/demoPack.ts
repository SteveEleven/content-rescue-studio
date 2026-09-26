import type { Intake, Pack } from './types'

export const DEMO_LABEL = 'Unofficial demo created from public business information'

const FOOTER = '19+ | Please enjoy responsibly | View current menu and hours at ryesandshine.ca'

export const DEMO_INTAKE: Intake = {
  business_name: 'Ryes & Shine Craft Distillery',
  industry: 'Craft distillery, tasting room, cocktails and food',
  location: '#103-2323 Millstream Road, Langford, British Columbia',
  offer_goal: 'Explain the grain-to-glass craft and point people to current tastings, tours, menu, and hours.',
  target_customer: 'Adults 19+ in Langford and Greater Victoria planning a visit to a craft distillery.',
  platform: 'Instagram Reels',
  tone: ['Warm', 'Craft-focused', 'Calm', 'Responsible'],
  required_footer: FOOTER,
  source_text: `Ryes & Shine Craft Distillery
#103-2323 Millstream Road, Langford, British Columbia
Website: ryesandshine.ca

A craft distillery with a tasting room, cocktails, and food. Spirits are grain-to-glass and made in house in small batches.

Tastings, tours, bottle sales, and a seasonal patio may be offered. Availability can change. View current details, explore current options, and check the business website before visiting.`,
}

export const DEMO_PACK: Pack = {
  business_summary:
    'Ryes & Shine Craft Distillery is a craft distillery and tasting room at #103-2323 Millstream Road in Langford, British Columbia, with cocktails, food, and in-house small-batch spirits made grain to glass. Tastings, tours, bottle sales, and a seasonal patio may be available; check ryesandshine.ca for current details.',
  content_angle: 'Craft Distilling at Ryes & Shine',
  videos: [
    {
      title: 'The Craft of Distilling',
      hook: 'Grain goes in. A spirit comes out. That is the craft.',
      script:
        'Grain goes in. A spirit comes out. That is the craft. At Ryes & Shine Craft Distillery in Langford, British Columbia, small-batch spirits are made in house, grain to glass. This is a working distillery and tasting room at #103-2323 Millstream Road, with cocktails and food alongside. Nothing here asks you to guess the menu. View current details before you visit, and come for the craft itself.',
      visual_direction:
        'Still and spirit close-ups; grain-to-glass process; tasting-room wide shot; cocktail pour; exterior at #103-2323 Millstream Road.',
      cta: 'Discover the grain-to-glass story',
      caption: `In-house small-batch spirits, grain to glass, at Ryes & Shine in Langford. View current details before you visit.\n\n${FOOTER}`,
      hashtags: ['#RyesShine', '#CraftDistillery', '#GrainToGlass', '#LangfordBC', '#SmallBatch'],
    },
    {
      title: 'Tasting Room Atmosphere',
      hook: 'This is the room where the spirits are made.',
      script:
        'This is the room where the spirits are made. Ryes & Shine is a craft distillery and tasting room in Langford, British Columbia. Settle in for cocktails and food options to enjoy alongside in-house small-batch spirits. A seasonal patio may be open; check the business website before visiting rather than assuming it is. Bring your favourite people, plan your visit, and let the room tell the story.',
      visual_direction:
        'Tasting-room entrance; seated guests with cocktails and plates; bottle on the bar; warm wide shot of the room.',
      cta: 'Plan your visit',
      caption: `Cocktails, food, and a tasting room at Ryes & Shine. A seasonal patio may be available. Check current details before you visit.\n\n${FOOTER}`,
      hashtags: ['#RyesShine', '#TastingRoom', '#LangfordBC', '#CraftDistillery', '#BritishColumbia'],
    },
    {
      title: 'Explore Tastings and Tours',
      hook: 'Curious about tastings and tours?',
      script:
        'Curious about tastings and tours? At Ryes & Shine they may be part of a visit, and the lineup can change. Explore current options at ryesandshine.ca before you go. Bottle sales, the tasting room, cocktails, and food are reasons to look up current details, not reasons to assume. View current menu and hours, then plan your visit to the distillery in Langford, British Columbia today.',
      visual_direction:
        'Distillery exterior sign; tasting-room interior; bottle shelf; guest reading current details on a phone.',
      cta: 'Explore current tastings and tours',
      caption: `Explore current tastings and tours at Ryes & Shine. Check the website for what is available now.\n\n${FOOTER}`,
      hashtags: ['#RyesShine', '#LangfordBC', '#CraftDistillery', '#TastingRoom', '#PlanYourVisit'],
    },
  ],
  calendar: [
    {
      day: 'Mon',
      goal: 'Show the craft',
      format: 'Process · short cuts',
      topic: 'How grain becomes a spirit at Ryes & Shine.',
      video_ref: 'Video 1',
      cta: 'Discover the grain-to-glass story',
    },
    {
      day: 'Tue',
      goal: 'Show the room',
      format: 'Room atmosphere',
      topic: 'A look inside the Langford tasting room.',
      video_ref: 'Video 2',
      cta: 'Plan your visit',
    },
    {
      day: 'Wed',
      goal: 'Point to current options',
      format: 'Detail reminder',
      topic: 'Tastings and tours: check current details first.',
      video_ref: 'Video 3',
      cta: 'Explore current tastings and tours',
    },
    {
      day: 'Thu',
      goal: 'Food alongside a drink',
      format: 'Table scene',
      topic: 'Food options to enjoy alongside a cocktail.',
      video_ref: 'Video 2',
      cta: 'View current menu and hours',
    },
    {
      day: 'Fri',
      goal: 'Invite a planned visit',
      format: 'Craft montage',
      topic: 'Grain-to-glass craft, told in one short visit.',
      video_ref: 'Video 1',
      cta: 'Plan your visit',
    },
    {
      day: 'Sat',
      goal: 'Send people to the source',
      format: 'Website reminder',
      topic: 'Check the website for menu, hours, and current options.',
      video_ref: 'Video 3',
      cta: 'View current menu and hours',
    },
    {
      day: 'Sun',
      goal: 'Keep the visit easy',
      format: 'Soft close',
      topic: 'A calm visit to the distillery in Langford.',
      video_ref: 'Video 2',
      cta: 'Plan your visit',
    },
  ],
  production_notes:
    'Film the still, tasting room, cocktails, food, and the Millstream Road exterior. Keep each video 25–35 seconds. Do not show intoxication or excess. Do not state prices, hours, discounts, or that tastings, tours, or the patio are open today. Point viewers to ryesandshine.ca. End every caption with the required footer.',
}
