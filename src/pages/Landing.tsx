import { DEMO_INTAKE, DEMO_PACK, DEMO_LABEL } from '../lib/demoPack'
import { setHandoff } from '../lib/handoff'
import { href, navigate } from '../lib/router'
import { TEMPLATES } from '../lib/templates'
import { Footer, Icon, NavRow, PageHeader, PlayGlyph } from './shared'

export function Landing() {
  const openExample = () => {
    setHandoff({ intake: DEMO_INTAKE, pack: DEMO_PACK })
    navigate('/studio')
  }
  const startFresh = () => navigate('/studio')

  return (
    <main className="page">
      <NavRow current="/" />

      <PageHeader
        size="lg"
        eyebrow="AI content studio for local business"
        title={
          <>
            Your business
            <br />
            already wrote
            <br />
            <em>the script.</em>
          </>
        }
        lede="Paste your website, menu, or About page. Get three short-form videos with hooks, 25–35s scripts, captions, and a 7-day posting plan — ready to shoot tomorrow."
      >
        <div className="hero-actions">
          <button type="button" className="btn btn--primary btn--hard btn--lg" onClick={startFresh}>
            Start a rescue
          </button>
          <button type="button" className="btn btn--white btn--lg" onClick={openExample}>
            See an example pack
          </button>
        </div>
        <div className="stat-row">
          <span className="tag tag--soft">3 videos</span>
          <span className="tag tag--soft">3 captions</span>
          <span className="tag tag--soft">7-day plan</span>
          <span className="tag tag--soft">Under a minute</span>
        </div>
      </PageHeader>

      <section>
        <div className="sec-head">
          <div>
            <h2 className="sec-title">This week&apos;s example</h2>
            <p className="sec-sub">{DEMO_PACK.content_angle} · Langford, BC</p>
          </div>
          <button type="button" className="sec-link" onClick={openExample}>
            Open pack →
          </button>
        </div>
        <div className="tile-row">
          {DEMO_PACK.videos.map((v, i) => (
            <button key={i} type="button" className="tile" onClick={openExample}>
              <div className="thumb">
                <div className="thumb-play">
                  <PlayGlyph />
                </div>
                <span className="tag thumb-tag">Video {i + 1}</span>
                <div className="thumb-hook">{v.hook}</div>
              </div>
              <div className="tile-body">
                <div className="card-title" style={{ fontSize: 16 }}>
                  {v.title}
                </div>
                <div className="card-sub">{v.cta}</div>
              </div>
            </button>
          ))}
        </div>
        <p className="demo-note" style={{ marginTop: 4 }}>
          {DEMO_LABEL}
        </p>
      </section>

      <section>
        <div className="sec-head">
          <div>
            <h2 className="sec-title">How it works</h2>
            <p className="sec-sub">One workflow. No accounts, no uploads.</p>
          </div>
          <a className="sec-link" href={href('/how-it-works')}>
            Details →
          </a>
        </div>
        <div className="steps">
          <div className="step">
            <div className="step-num">1</div>
            <div>
              <div className="card-title" style={{ fontSize: 16 }}>
                Paste what you have
              </div>
              <p className="card-sub">Website copy, menu, services, a Google Business description.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-num">2</div>
            <div>
              <div className="card-title" style={{ fontSize: 16 }}>
                Pick a goal and a tone
              </div>
              <p className="card-sub">Drive Sunday visits. Fill the 6am class. Launch the special.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-num">3</div>
            <div>
              <div className="card-title" style={{ fontSize: 16 }}>
                Shoot the week
              </div>
              <p className="card-sub">Scripts, shot lists, captions, and a day-by-day plan. Copy and go.</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="sec-head">
          <div>
            <h2 className="sec-title">What&apos;s in a pack</h2>
            <p className="sec-sub">Everything a one-person marketing team needs for seven days.</p>
          </div>
        </div>
        <div className="grid grid--2">
          <div className="mini">
            <Icon name="hook" />
            <div className="mini-title">Hooks that stop the scroll</div>
            <div className="mini-sub">One line, first second, built from your own words.</div>
          </div>
          <div className="mini">
            <Icon name="script" />
            <div className="mini-title">25–35s scripts</div>
            <div className="mini-sub">Timed for Reels, TikTok, and Shorts. Read it, shoot it.</div>
          </div>
          <div className="mini">
            <Icon name="caption" />
            <div className="mini-title">Captions + hashtags</div>
            <div className="mini-sub">With your required footer on every post.</div>
          </div>
          <div className="mini">
            <Icon name="calendar" />
            <div className="mini-title">7-day calendar</div>
            <div className="mini-sub">A goal, a format, and a CTA for every day.</div>
          </div>
        </div>
      </section>

      <section>
        <div className="sec-head">
          <div>
            <h2 className="sec-title">Built for your block</h2>
            <p className="sec-sub">Start from a template tuned to your kind of business.</p>
          </div>
          <a className="sec-link" href={href('/templates')}>
            All templates →
          </a>
        </div>
        <div className="chips">
          {TEMPLATES.map((t) => (
            <a key={t.id} className="chip" href={href('/templates')} style={{ textDecoration: 'none' }}>
              {t.industry}
            </a>
          ))}
        </div>
      </section>

      <section>
        <div className="banner stack" style={{ gap: 12 }}>
          <span className="tag">Free during the hackathon</span>
          <h2 className="sec-title">
            Seven days of content.
            <br />
            One paste.
          </h2>
          <div className="stack" style={{ gap: 6 }}>
            <span className="check">Works offline with the prepared demo pack</span>
            <span className="check">Saves up to three packs on this device</span>
            <span className="check">Never implies pricing, times, or health claims</span>
          </div>
          <button type="button" className="btn btn--primary btn--hard btn--lg" onClick={startFresh} style={{ alignSelf: 'flex-start' }}>
            Build my 7-day content plan
          </button>
        </div>
      </section>

      <Footer />
    </main>
  )
}
