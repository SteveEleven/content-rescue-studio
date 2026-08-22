import { navigate } from '../lib/router'
import { Footer, Icon, NavRow, PageHeader } from './shared'

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Do I need an account or to upload anything?',
    a: 'No. Paste text, pick a goal, build. Saved packs live in your browser only — up to three on this device.',
  },
  {
    q: 'What happens if the AI is slow or unavailable?',
    a: 'If generation fails, takes longer than 20 seconds, or returns something malformed, the studio shows a prepared demo pack and labels it clearly. You never see a broken screen.',
  },
  {
    q: 'How long are the scripts?',
    a: 'Every script is written for 25–35 seconds of spoken delivery — the sweet spot for Reels, TikTok, and Shorts.',
  },
  {
    q: 'Can I use this for a bar or brewery?',
    a: 'Yes. Add a required footer like “19+ | Please enjoy responsibly” and it is appended to every caption. Scripts never imply intoxication, drinking and driving, or health benefits.',
  },
  {
    q: 'Will it invent prices, hours, or discounts?',
    a: 'No. Packs point viewers to the venue for details instead of stating pricing, times, or offers that might be wrong by the time you post.',
  },
  {
    q: 'Where does the example pack come from?',
    a: 'It is an unofficial demo created from public business information about Ryes & Shine Craft Distillery in Langford, BC, used here to show the shape of a finished pack.',
  },
]

export function HowItWorks() {
  return (
    <main className="page">
      <NavRow current="/how-it-works" />

      <PageHeader
        eyebrow="How it works"
        title={
          <>
            From paste
            <br />
            <em>to posted.</em>
          </>
        }
        lede="Content Rescue Studio reads what your business already says about itself and turns it into a week of short-form video you can actually produce."
      />

      <section>
        <div className="sec-head">
          <div>
            <h2 className="sec-title">Three steps</h2>
            <p className="sec-sub">Under a minute end to end.</p>
          </div>
        </div>
        <div className="steps">
          <div className="step">
            <div className="step-num">1</div>
            <div>
              <div className="card-title" style={{ fontSize: 16 }}>
                Intake
              </div>
              <p className="card-sub">
                Business name, industry, location, the goal for the week, who you want in the door, platform, tone,
                and the text you already have — About page, menu, services, reviews.
              </p>
            </div>
          </div>
          <div className="step">
            <div className="step-num">2</div>
            <div>
              <div className="card-title" style={{ fontSize: 16 }}>
                Generate
              </div>
              <p className="card-sub">
                One call finds the content angle, writes three hooks and scripts, drafts captions with your footer,
                and lays out seven days with a goal each.
              </p>
            </div>
          </div>
          <div className="step">
            <div className="step-num">3</div>
            <div>
              <div className="card-title" style={{ fontSize: 16 }}>
                Produce
              </div>
              <p className="card-sub">
                Copy a script, copy a caption, or copy the whole plan as plain text. Share it to your phone. Save up to
                three packs.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="sec-head">
          <div>
            <h2 className="sec-title">What you get</h2>
            <p className="sec-sub">The same five parts every time, so your team knows where to look.</p>
          </div>
        </div>
        <div className="grid grid--2">
          <div className="mini">
            <Icon name="bolt" />
            <div className="mini-title">Content angle</div>
            <div className="mini-sub">One idea that ties the whole week together.</div>
          </div>
          <div className="mini">
            <Icon name="hook" />
            <div className="mini-title">3 video ideas</div>
            <div className="mini-sub">Title, hook, 25–35s script, visual direction, CTA.</div>
          </div>
          <div className="mini">
            <Icon name="caption" />
            <div className="mini-title">3 captions</div>
            <div className="mini-sub">Caption, hashtags, and your required footer.</div>
          </div>
          <div className="mini">
            <Icon name="calendar" />
            <div className="mini-title">7-day calendar</div>
            <div className="mini-sub">Day, goal, format, topic, which video, and CTA.</div>
          </div>
          <div className="mini">
            <Icon name="shield" />
            <div className="mini-title">Production notes</div>
            <div className="mini-sub">Shot list plus the guardrails for your category.</div>
          </div>
          <div className="mini">
            <Icon name="copy" />
            <div className="mini-title">Plain-text export</div>
            <div className="mini-sub">Paste into Notes, Slack, or a shot list app.</div>
          </div>
        </div>
      </section>

      <section>
        <div className="sec-head">
          <div>
            <h2 className="sec-title">Guardrails</h2>
            <p className="sec-sub">Built in, not bolted on.</p>
          </div>
        </div>
        <ul className="list-check">
          <li>Never implies intoxication, drinking and driving, or health benefits.</li>
          <li>Never states pricing, opening times, or discounts — points viewers to the venue instead.</li>
          <li>Required footer appended to every caption when you set one.</li>
          <li>Cheers framed as celebration, never excess. Adults-only audiences stay 19+.</li>
          <li>Falls back to a clearly labelled demo pack rather than a broken screen.</li>
        </ul>
      </section>

      <section>
        <div className="sec-head">
          <div>
            <h2 className="sec-title">Questions</h2>
          </div>
        </div>
        <div className="faq">
          {FAQ.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <div className="faq-body">{f.a}</div>
            </details>
          ))}
        </div>
      </section>

      <section>
        <div className="banner stack" style={{ gap: 12 }}>
          <h2 className="sec-title">
            Ready when
            <br />
            you are.
          </h2>
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
