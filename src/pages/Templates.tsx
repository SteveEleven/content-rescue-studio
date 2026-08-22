import { setHandoff } from '../lib/handoff'
import { navigate } from '../lib/router'
import { TEMPLATES, type Template } from '../lib/templates'
import { DEMO_PACK } from '../lib/demoPack'
import { Footer, NavRow, PageHeader, PlayGlyph } from './shared'

export function Templates() {
  const use = (t: Template) => {
    setHandoff(t.featured ? { intake: t.intake, pack: DEMO_PACK } : { intake: t.intake })
    navigate('/studio')
  }

  return (
    <main className="page">
      <NavRow current="/templates" />

      <PageHeader
        eyebrow="Templates"
        title={
          <>
            Start from
            <br />
            <em>your block.</em>
          </>
        }
        lede="Each template prefills the intake with a realistic goal, audience, tone, and source text. Swap in your own details, or just hit build to see the shape of a pack."
      />

      <section>
        <div className="grid grid--3">
          {TEMPLATES.map((t) => (
            <button key={t.id} type="button" className="tpl" onClick={() => use(t)}>
              <div
                className="tpl-thumb"
                style={{ background: `linear-gradient(150deg, ${t.hue} 0%, #0f1113 80%)` }}
              >
                <div className="thumb-play">
                  <PlayGlyph />
                </div>
                <span className="tag thumb-tag">{t.featured ? 'Example pack' : 'Template'}</span>
                <div className="thumb-hook">{t.angle}</div>
              </div>
              <div className="tpl-body">
                <div className="card-title" style={{ fontSize: 16 }}>
                  {t.name}
                </div>
                <div className="card-sub">{t.blurb}</div>
                <div className="tpl-foot">
                  <span className="tag tag--soft">{t.industry}</span>
                  <span className="cta-line">{t.featured ? 'Open →' : 'Use →'}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="banner stack" style={{ gap: 12 }}>
          <h2 className="sec-title">
            Don&apos;t see your
            <br />
            kind of business?
          </h2>
          <p className="body" style={{ color: 'rgba(247,247,248,0.8)' }}>
            Start blank. The studio only needs a name and whatever text you already have.
          </p>
          <button
            type="button"
            className="btn btn--primary btn--hard btn--lg"
            onClick={() => navigate('/studio')}
            style={{ alignSelf: 'flex-start' }}
          >
            Start a rescue
          </button>
        </div>
      </section>

      <Footer />
    </main>
  )
}
