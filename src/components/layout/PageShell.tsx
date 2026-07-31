import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Nav } from './Nav'
import { Footer } from './Footer'
import { useSyncDocumentMeta } from '../../hooks/useSyncDocumentMeta'
import { useKonamiCode } from '../../hooks/useKonamiCode'

interface PageShellProps {
  children: ReactNode
}

// Keying on the path forces React to remount this wrapper on every
// navigation, which restarts its CSS animations -- a fade-in plus a purple
// shimmer sweep layered on top, both skipped entirely under
// prefers-reduced-motion via the motion-safe: variant.
function PageTransition({ pathname, children }: { pathname: string; children: ReactNode }) {
  return (
    <div key={pathname} className="relative motion-safe:animate-pn-page-fade">
      {children}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[length:200%_100%] bg-[linear-gradient(100deg,transparent_35%,rgba(139,124,255,0.16)_50%,transparent_65%)] motion-safe:animate-pn-page-shimmer"
      />
    </div>
  )
}

export function PageShell({ children }: PageShellProps) {
  useSyncDocumentMeta()
  const navigate = useNavigate()
  const location = useLocation()
  useKonamiCode(() => navigate('/terminal'))

  // The retro terminal easter egg takes over the full viewport instead of
  // sitting inside the normal Nav/Footer chrome -- it's meant to feel like
  // a break from the rest of the site, not another themed page.
  if (location.pathname === '/terminal') {
    return (
      <div className="min-h-screen bg-bg text-fg">
        <PageTransition pathname={location.pathname}>{children}</PageTransition>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg text-fg">
      <Nav />
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 sm:px-6 lg:px-8">
        <PageTransition pathname={location.pathname}>{children}</PageTransition>
      </main>
      <Footer />
    </div>
  )
}
