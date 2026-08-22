import { useEffect, useState } from 'react'

export type Route = '/' | '/studio' | '/templates' | '/how-it-works'

const ROUTES: Route[] = ['/', '/studio', '/templates', '/how-it-works']

/** Primary navigation, shared by the header, the mobile nav row, and the footer. */
export const NAV_LINKS: { to: Route; label: string }[] = [
  { to: '/', label: 'Home' },
  { to: '/templates', label: 'Templates' },
  { to: '/how-it-works', label: 'How it works' },
  { to: '/studio', label: 'Studio' },
]

function parse(hash: string): Route {
  const path = hash.replace(/^#/, '').split('?')[0] || '/'
  return (ROUTES as string[]).includes(path) ? (path as Route) : '/'
}

export function navigate(to: Route) {
  if (parse(window.location.hash) === to) {
    window.scrollTo({ top: 0 })
    return
  }
  window.location.hash = to
}

/** Tiny hash router — no dependency, works on file:// and static hosts. */
export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash))
  useEffect(() => {
    const on = () => setRoute(parse(window.location.hash))
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [route])
  return route
}

export function href(to: Route): string {
  return `#${to}`
}
