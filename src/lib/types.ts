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
  /** Set on the prepared demo pack. Live packs fall back to the weekday schedule. */
  suggested_post_time?: string
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
