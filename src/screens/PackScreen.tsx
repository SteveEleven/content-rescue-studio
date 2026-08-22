import { useState } from 'react'
import type { Pack, Video, CalendarDay } from '../lib/types'
import { captionWithTags, copyText, packToPlainText, shareText } from '../lib/text'
import { CopyButton, Footer, Toast, useToast } from '../components'
import { DEMO_LABEL } from '../lib/demoPack'

type Tab = 'videos' | 'captions' | 'plan'

interface Props {
  pack: Pack
  businessName: string
  platform: string
  isDemo: boolean
  showFallbackBadge: boolean
  isSaved: boolean
  canSave: boolean
  onSave: () => void
  onStartNew: () => void
}

export function PackScreen({
  pack,
  businessName,
  platform,
  isDemo,
  showFallbackBadge,
  isSaved,
  canSave,
  onSave,
  onStartNew,
}: Props) {
  const [tab, setTab] = useState<Tab>('videos')
  const [toast, showToast] = useToast()

  const fullText = packToPlainText(pack, businessName)

  const copyAll = async () => {
    showToast((await copyText(fullText)) ? 'Full plan copied' : 'Could not copy — try again')
  }

  const share = async () => {
    const r = await shareText(`Content Rescue Pack — ${businessName}`, fullText)
    if (r === 'copied') showToast('Copied — paste it anywhere')
    else if (r === 'failed') showToast('Share cancelled')
  }

  return (
    <>
      <div className="screen screen--with-bar stack stack--lg">
        <header className="card card--hero stack" style={{ gap: 10 }}>
          <span className="label" style={{ marginBottom: 0 }}>
            Content Rescue Pack
          </span>
          {showFallbackBadge && (
            <div>
              <span className="tag">Showing prepared demo pack</span>
            </div>
          )}
          <h1 className="title">{pack.content_angle}</h1>
          <p className="body body--muted" style={{ color: 'rgba(247,247,248,0.78)' }}>
            {pack.business_summary}
          </p>
          <div className="day-meta">
            <span className="tag tag--soft">{platform}</span>
            <span className="tag tag--soft">3 videos</span>
            <span className="tag tag--soft">7-day plan</span>
          </div>
          {isDemo && <p className="demo-note">{DEMO_LABEL}</p>}
        </header>

        <div className="tabs" role="tablist" aria-label="Pack sections">
          <TabButton id="videos" active={tab} onSelect={setTab}>
            Video ideas
          </TabButton>
          <TabButton id="captions" active={tab} onSelect={setTab}>
            Captions
          </TabButton>
          <TabButton id="plan" active={tab} onSelect={setTab}>
            7-day plan
          </TabButton>
        </div>

        {tab === 'videos' && (
          <div className="tab-panel stack" role="tabpanel" id="panel-videos" key="videos">
            {pack.videos.map((v, i) => (
              <VideoCard key={i} index={i} video={v} />
            ))}
            {pack.production_notes && (
              <section className="card stack" style={{ gap: 8 }}>
                <div>
                  <h2 className="card-title">Production notes</h2>
                  <p className="card-sub">Shot list and guardrails for the whole week.</p>
                </div>
                <p className="body body--muted">{pack.production_notes}</p>
              </section>
            )}
          </div>
        )}

        {tab === 'captions' && (
          <div className="tab-panel stack" role="tabpanel" id="panel-captions" key="captions">
            {pack.videos.map((v, i) => (
              <CaptionCard key={i} index={i} video={v} />
            ))}
          </div>
        )}

        {tab === 'plan' && (
          <div className="tab-panel stack" role="tabpanel" id="panel-plan" key="plan">
            {pack.calendar.map((d, i) => (
              <DayCard key={i} day={d} />
            ))}
          </div>
        )}

        <Footer />
      </div>

      <div className="bottom-bar">
        <div className="bottom-bar-inner">
          <div className="btn-row">
            <button type="button" className="btn btn--primary btn--hard" onClick={copyAll}>
              Copy full plan
            </button>
            <button type="button" className="btn btn--white" onClick={share}>
              Share
            </button>
          </div>
          <div className="btn-row">
            <button type="button" className="btn btn--ghost btn--sm" onClick={onSave} disabled={isSaved}>
              {isSaved ? '✓ Saved' : canSave ? 'Save pack' : 'Save pack (replaces oldest)'}
            </button>
            <button type="button" className="btn btn--text btn--sm" onClick={onStartNew}>
              Start new rescue
            </button>
          </div>
        </div>
      </div>

      <Toast message={toast} withBar />
    </>
  )
}

function TabButton({
  id,
  active,
  onSelect,
  children,
}: {
  id: Tab
  active: Tab
  onSelect: (t: Tab) => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="tab"
      className="tab"
      aria-selected={active === id}
      aria-controls={`panel-${id}`}
      onClick={() => onSelect(id)}
    >
      {children}
    </button>
  )
}

function PlayGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M4 2.5 L11.5 7 L4 11.5 Z" fill="currentColor" />
    </svg>
  )
}

function VideoCard({ index, video }: { index: number; video: Video }) {
  return (
    <article className="card card--flush">
      <div className="thumb">
        <div className="thumb-play">
          <PlayGlyph />
        </div>
        <span className="tag thumb-tag">Video {index + 1}</span>
        <div className="thumb-hook">{video.hook}</div>
      </div>

      <div className="card-body stack" style={{ gap: 14 }}>
        <div>
          <h2 className="card-title">{video.title}</h2>
          <p className="card-sub">25–35s · {video.cta}</p>
        </div>

        <div className="rule" />

        <div className="stack" style={{ gap: 8 }}>
          <div className="card-head" style={{ alignItems: 'center' }}>
            <span className="label" style={{ marginBottom: 0 }}>
              Script · 25–35s
            </span>
            <CopyButton text={video.script} label="Copy script" />
          </div>
          <p className="block body">{video.script}</p>
        </div>

        <div>
          <span className="label">Visual direction</span>
          <p className="body body--muted">{video.visual_direction}</p>
        </div>

        <div>
          <span className="label">CTA</span>
          <p className="cta-line">{video.cta}</p>
        </div>
      </div>
    </article>
  )
}

function CaptionCard({ index, video }: { index: number; video: Video }) {
  return (
    <article className="card stack">
      <div className="card-head">
        <div>
          <span className="label">Video {index + 1}</span>
          <h2 className="card-title">{video.title}</h2>
        </div>
        <CopyButton text={captionWithTags(video)} label="Copy" />
      </div>

      <p className="block body">{video.caption}</p>

      {video.hashtags.length > 0 && (
        <div className="hashtags">
          {video.hashtags.map((h) => (
            <span key={h} className="tag tag--soft">
              {h}
            </span>
          ))}
        </div>
      )}

      <p className="body body--muted" style={{ fontSize: 14 }}>
        Suggested post time: <strong style={{ color: 'var(--text)' }}>[placeholder]</strong>
      </p>
    </article>
  )
}

const HOT_DAYS = new Set(['sat', 'sun', 'saturday', 'sunday'])

function DayCard({ day }: { day: CalendarDay }) {
  const hot = HOT_DAYS.has(day.day.trim().toLowerCase())
  const short = day.day.trim().length > 4 ? day.day.trim().slice(0, 3) : day.day.trim()
  return (
    <article className="card day-card">
      <div className={`day-tile ${hot ? 'day-tile--hot' : ''}`} aria-label={day.day}>
        {short}
      </div>
      <div className="stack" style={{ gap: 8 }}>
        <h2 className="card-title" style={{ fontSize: 17 }}>
          {day.goal}
        </h2>
        <p className="body body--muted">{day.topic}</p>
        <div className="day-meta">
          {day.format && <span className="tag tag--soft tag--wrap">{day.format}</span>}
          {day.video_ref && <span className="tag">{day.video_ref}</span>}
        </div>
        <p className="cta-line">
          <span className="label" style={{ display: 'inline', marginRight: 8 }}>
            CTA
          </span>
          {day.cta}
        </p>
      </div>
    </article>
  )
}
