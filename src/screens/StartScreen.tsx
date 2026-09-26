import { useState } from 'react'
import type { Intake, Platform, SavedPack } from '../lib/types'
import { EMPTY_INTAKE, PLATFORMS, TONES } from '../lib/types'
import { DEMO_INTAKE, DEMO_LABEL } from '../lib/demoPack'
import { Footer, NavRow } from '../components'

interface Props {
  intake: Intake
  onChange: (next: Intake) => void
  onSubmit: () => void
  savedPacks: SavedPack[]
  onOpenSaved: (p: SavedPack) => void
  onDeleteSaved: (id: string) => void
}

export function StartScreen({ intake, onChange, onSubmit, savedPacks, onOpenSaved, onDeleteSaved }: Props) {
  const [touched, setTouched] = useState(false)
  const set = <K extends keyof Intake>(key: K, value: Intake[K]) => onChange({ ...intake, [key]: value })

  const toggleTone = (t: string) => {
    const has = intake.tone.includes(t)
    set('tone', has ? intake.tone.filter((x) => x !== t) : [...intake.tone, t])
  }

  const isDemo = intake.business_name === DEMO_INTAKE.business_name
  const canSubmit = intake.business_name.trim().length > 0

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!canSubmit) {
      document.getElementById('business_name')?.focus()
      return
    }
    onSubmit()
  }

  return (
    <form className="screen stack stack--lg" onSubmit={submit} noValidate>
      <NavRow current="/studio" sticky={false} />
      <header>
        <h1 className="title">
          Start a<br />
          Rescue
        </h1>
        <p className="subtitle">
          Paste what your business already says about itself. We turn it into a week of short-form video you can
          shoot tomorrow.
        </p>
      </header>

      <div className="stack" style={{ gap: 8 }}>
        <div className="btn-row">
          <button type="button" className="btn btn--ghost" onClick={() => onChange(DEMO_INTAKE)}>
            Load demo: Ryes &amp; Shine
          </button>
          <button
            type="button"
            className="btn btn--text"
            onClick={() => {
              setTouched(false)
              onChange(EMPTY_INTAKE)
            }}
          >
            Reset
          </button>
        </div>
        {isDemo && <p className="demo-note">{DEMO_LABEL}</p>}
      </div>

      <section className="card stack">
        <div>
          <h2 className="section-title">About the business</h2>
          <p className="section-sub">Who you are and where you are.</p>
        </div>

        <div className="field">
          <label htmlFor="business_name">Business name</label>
          <input
            id="business_name"
            className="input"
            value={intake.business_name}
            onChange={(e) => set('business_name', e.target.value)}
            placeholder="e.g. Ryes & Shine Craft Distillery"
            autoComplete="organization"
            aria-invalid={touched && !canSubmit}
          />
          {touched && !canSubmit && (
            <span className="hint hint--warn">A business name is all we need to get going.</span>
          )}
        </div>

        <div className="field">
          <label htmlFor="industry">Industry</label>
          <input
            id="industry"
            className="input"
            value={intake.industry}
            onChange={(e) => set('industry', e.target.value)}
            placeholder="e.g. Craft distillery & cocktail bar"
          />
        </div>

        <div className="field">
          <label htmlFor="location">Location</label>
          <input
            id="location"
            className="input"
            value={intake.location}
            onChange={(e) => set('location', e.target.value)}
            placeholder="e.g. Langford, BC"
          />
        </div>
      </section>

      <section className="card stack">
        <div>
          <h2 className="section-title">What we&apos;re going for</h2>
          <p className="section-sub">The goal, the audience, and the voice.</p>
        </div>

        <div className="field">
          <label htmlFor="offer_goal">Offer / goal</label>
          <textarea
            id="offer_goal"
            className="textarea"
            style={{ minHeight: 92 }}
            value={intake.offer_goal}
            onChange={(e) => set('offer_goal', e.target.value)}
            placeholder="e.g. Explain the craft and point people to current details"
          />
        </div>

        <div className="field">
          <label htmlFor="target_customer">Target customer</label>
          <textarea
            id="target_customer"
            className="textarea"
            style={{ minHeight: 92 }}
            value={intake.target_customer}
            onChange={(e) => set('target_customer', e.target.value)}
            placeholder="e.g. Adults 19+ in Greater Victoria looking for a local night out"
          />
        </div>

        <div className="field">
          <label htmlFor="platform">Platform</label>
          <div className="select-wrap">
            <select
              id="platform"
              className="select"
              value={intake.platform}
              onChange={(e) => set('platform', e.target.value as Platform)}
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label id="tone-label">Tone</label>
          <div className="chips" role="group" aria-labelledby="tone-label">
            {TONES.map((t) => (
              <button
                key={t}
                type="button"
                className="chip"
                aria-pressed={intake.tone.includes(t)}
                onClick={() => toggleTone(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label htmlFor="required_footer">
            Required footer <span style={{ fontWeight: 400, color: 'var(--text-3)' }}>(optional)</span>
          </label>
          <input
            id="required_footer"
            className="input"
            value={intake.required_footer}
            onChange={(e) => set('required_footer', e.target.value)}
            placeholder="e.g. 19+ | Please enjoy responsibly"
          />
          <span className="hint">Added to the end of every caption.</span>
        </div>
      </section>

      <section className="card stack">
        <div>
          <h2 className="section-title">Source material</h2>
          <p className="section-sub">Website, About page, menu, services — anything that describes what you do.</p>
        </div>
        <div className="field">
          <label htmlFor="source_text" className="sr-only">
            Paste website / about / services text
          </label>
          <textarea
            id="source_text"
            className="textarea textarea--lg"
            value={intake.source_text}
            onChange={(e) => set('source_text', e.target.value)}
            placeholder="Paste website / about / services text"
          />
        </div>
      </section>

      <button type="submit" className="btn btn--primary btn--hard btn--lg btn--block">
        Build my 7-day content plan
      </button>

      {savedPacks.length > 0 && (
        <section className="card stack" id="saved-packs">
          <div className="card-head">
            <div>
              <h2 className="section-title">Saved packs</h2>
              <p className="section-sub">Stored on this device.</p>
            </div>
            <span className="tag tag--muted">{savedPacks.length} / 3</span>
          </div>
          <div className="saved-list">
            {savedPacks.map((p) => (
              <div key={p.id} className="saved-item">
                <button type="button" className="saved-item-main" onClick={() => onOpenSaved(p)}>
                  <div className="saved-item-name">{p.name}</div>
                  <div className="saved-item-sub">
                    {p.pack.content_angle} · {formatDate(p.saved_at)}
                  </div>
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`Delete ${p.name}`}
                  onClick={() => onDeleteSaved(p.id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </form>
  )
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}
