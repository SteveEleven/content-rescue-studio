import { useEffect, useState } from 'react'

const MESSAGES = ['Finding hooks…', 'Building scripts…', 'Planning the week…']

export function GenerateScreen({ businessName }: { businessName: string }) {
  const [i, setI] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % MESSAGES.length), 1400)
    return () => clearInterval(t)
  }, [])

  return (
    <>
      <div className="progress-track" aria-hidden="true">
        <div className="progress-fill" />
      </div>
      <div className="screen generate" role="status" aria-live="polite">
        <div className="pulse" aria-hidden="true" />
        <div className="stack" style={{ gap: 10, alignItems: 'center' }}>
          <span className="label">Rescuing {businessName.trim() || 'your content'}</span>
          <div className="progress-msg" key={i}>
            {MESSAGES[i]}
          </div>
        </div>
        <div className="dots" aria-hidden="true">
          {MESSAGES.map((_, n) => (
            <span key={n} className={`dot ${n === i ? 'dot--on' : ''}`} />
          ))}
        </div>
        <p className="body body--muted" style={{ maxWidth: 300 }}>
          Reading what your business already says and turning it into a week of videos.
        </p>
      </div>
    </>
  )
}
