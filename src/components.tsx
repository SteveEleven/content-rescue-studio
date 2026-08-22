import { useEffect, useState } from 'react'
import { copyText } from './lib/text'
import { NAV_LINKS, href, type Route } from './lib/router'

/** Button that copies text and briefly shows a "Copied" state. */
export function CopyButton({
  text,
  label = 'Copy',
  className = 'btn btn--ghost btn--sm',
  onDone,
}: {
  text: string
  label?: string
  className?: string
  onDone?: (ok: boolean) => void
}) {
  const [state, setState] = useState<'idle' | 'done' | 'fail'>('idle')

  useEffect(() => {
    if (state === 'idle') return
    const t = setTimeout(() => setState('idle'), 1600)
    return () => clearTimeout(t)
  }, [state])

  const handle = async () => {
    const ok = await copyText(text)
    setState(ok ? 'done' : 'fail')
    onDone?.(ok)
  }

  return (
    <button
      type="button"
      className={`${className} ${state === 'done' ? 'btn--copied' : ''}`}
      onClick={handle}
      aria-live="polite"
    >
      {state === 'done' ? '✓ Copied' : state === 'fail' ? 'Copy failed' : label}
    </button>
  )
}

export function Toast({ message, withBar }: { message: string | null; withBar?: boolean }) {
  if (!message) return null
  return (
    <div className={`toast ${withBar ? '' : 'toast--no-bar'}`} role="status">
      {message}
    </div>
  )
}

/** Small hook: show a toast for ~1.8s. */
export function useToast(): [string | null, (m: string) => void] {
  const [msg, setMsg] = useState<string | null>(null)
  useEffect(() => {
    if (!msg) return
    const t = setTimeout(() => setMsg(null), 1800)
    return () => clearTimeout(t)
  }, [msg])
  return [msg, setMsg]
}

/** Lime geometric logo mark. */
export function LogoMark({ className = 'topbar-mark' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 28" aria-hidden="true">
      <rect width="28" height="28" rx="7" fill="#d1fe17" />
      <rect x="6" y="8" width="11" height="12" rx="2.5" fill="#0f1113" />
      <path d="M17 12 L22 9 L22 19 L17 16 Z" fill="#0f1113" />
      <path d="M10 11.5 L14.5 14 L10 16.5 Z" fill="#d1fe17" />
    </svg>
  )
}

/**
 * Slim sticky header shown on every screen.
 * Desktop: brand + inline nav links + action pill. Mobile: brand + action pill (nav lives in <NavRow/>).
 */
export function TopBar({
  current,
  action,
  onAction,
  onBrand,
}: {
  current?: Route
  action?: string
  onAction?: () => void
  onBrand?: () => void
}) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <a className="topbar-brand" href={href('/')} onClick={onBrand} aria-label="Content Rescue Studio — home">
          <LogoMark />
          <span className="topbar-word">
            Content Rescue
            <small>Studio</small>
          </span>
        </a>
        <nav className="topbar-nav" aria-label="Primary">
          {NAV_LINKS.map((n) => (
            <a key={n.to} href={href(n.to)} aria-current={current === n.to ? 'page' : undefined}>
              {n.label}
            </a>
          ))}
        </nav>
      </div>
      {action && onAction && (
        <button type="button" className="pill-btn" onClick={onAction}>
          <span className="tag">{action}</span>
        </button>
      )}
    </header>
  )
}

/** Horizontal nav pills for mobile (hidden on desktop where the header carries the links). */
export function NavRow({ current, sticky = true }: { current: Route; sticky?: boolean }) {
  return (
    <nav className={`nav-row ${sticky ? 'nav-row--sticky' : ''}`} aria-label="Pages">
      {NAV_LINKS.map((n) => (
        <a key={n.to} className="nav-link" href={href(n.to)} aria-current={current === n.to ? 'page' : undefined}>
          {n.label}
        </a>
      ))}
    </nav>
  )
}

/** Page-level header: mono eyebrow, uppercase title, grey lede. */
export function PageHeader({
  eyebrow,
  title,
  lede,
  size = 'md',
  children,
}: {
  eyebrow?: string
  title: React.ReactNode
  lede?: React.ReactNode
  size?: 'md' | 'lg'
  children?: React.ReactNode
}) {
  return (
    <section className="hero" style={size === 'md' ? { paddingBottom: 8 } : undefined}>
      {eyebrow && <span className="label">{eyebrow}</span>}
      <h1 className="hero-title" style={size === 'md' ? { fontSize: 'clamp(34px, 9vw, 52px)' } : undefined}>
        {title}
      </h1>
      {lede && <p className="hero-sub">{lede}</p>}
      {children}
    </section>
  )
}

/** Site footer: brand, link columns, and the demo disclaimer. */
export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <LogoMark className="topbar-mark" />
          <div>
            <div className="topbar-word">
              Content Rescue
              <small>Studio</small>
            </div>
            <p className="footer-blurb">
              Turns what a local business already says about itself into a week of short-form video.
            </p>
          </div>
        </div>

        <div className="footer-col">
          <span className="label">Product</span>
          {NAV_LINKS.filter((n) => n.to !== '/').map((n) => (
            <a key={n.to} href={href(n.to)}>
              {n.label}
            </a>
          ))}
        </div>

        <div className="footer-col">
          <span className="label">Studio</span>
          <a href={href('/studio')}>Start a rescue</a>
          <a href={href('/templates')}>Browse templates</a>
          <a href={`${href('/how-it-works')}`}>Guardrails &amp; FAQ</a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Content Rescue Studio · Hackathon build</span>
        <span>Example pack is an unofficial demo created from public business information</span>
      </div>
    </footer>
  )
}
