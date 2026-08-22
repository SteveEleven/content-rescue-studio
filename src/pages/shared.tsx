export { NavRow, Footer, PageHeader } from '../components'

export function Icon({
  name,
}: {
  name: 'hook' | 'script' | 'caption' | 'calendar' | 'bolt' | 'shield' | 'phone' | 'copy'
}) {
  const paths: Record<string, JSX.Element> = {
    hook: <path d="M14 4v10a4 4 0 0 1-8 0v-1M14 4l-3 3M14 4l3 3" />,
    script: <path d="M6 4h12v16H6zM9 8h6M9 12h6M9 16h4" />,
    caption: <path d="M4 6h16v10H9l-4 4v-4H4zM8 10h8M8 13h5" />,
    calendar: <path d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4" />,
    bolt: <path d="M13 3 5 14h6l-1 7 8-11h-6z" />,
    shield: <path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6zM9 12l2 2 4-4" />,
    phone: <path d="M8 3h8v18H8zM11 18h2" />,
    copy: <path d="M9 9h11v11H9zM4 15V4h11" />,
  }
  return (
    <svg
      className="mini-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

export function PlayGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M4 2.5 L11.5 7 L4 11.5 Z" fill="currentColor" />
    </svg>
  )
}
