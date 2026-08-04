import { useRef, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Nav } from './Nav'
import { Footer } from './Footer'
import { CommandPalette } from '../ui/CommandPalette'
import { useSyncDocumentMeta } from '../../hooks/useSyncDocumentMeta'
import { useKonamiCode } from '../../hooks/useKonamiCode'
import { useFocusMainOnNavigate } from '../../hooks/useFocusMainOnNavigate'

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
        className="pointer-events-none absolute inset-0 bg-[length:200%_100%] bg-[linear-gradient(100deg,transparent_40%,rgba(139,124,255,0.07)_50%,transparent_60%)] motion-safe:animate-pn-page-shimmer"
      />
    </div>
  )
}

export function PageShell({ children }: PageShellProps) {
  useSyncDocumentMeta()
  const navigate = useNavigate()
  const location = useLocation()
  const mainRef = useRef<HTMLElement | null>(null)
  useKonamiCode(() => navigate('/terminal'))
  useFocusMainOnNavigate(mainRef)

  // The retro terminal easter egg takes over the full viewport instead of
  // sitting inside the normal Nav/Footer chrome -- it's meant to feel like
  // a break from the rest of the site, not another themed page.
  if (location.pathname === '/terminal') {
    return (
      <div className="min-h-screen bg-bg text-fg">
        <main ref={mainRef} tabIndex={-1} className="outline-none">
          <PageTransition pathname={location.pathname}>{children}</PageTransition>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg text-fg">
      <Nav />
      <main
        ref={mainRef}
        tabIndex={-1}
        className="mx-auto w-full max-w-[1200px] flex-1 px-4 outline-none sm:px-6 lg:px-8"
      >
        <PageTransition pathname={location.pathname}>{children}</PageTransition>
      </main>
      <Footer />
      <CommandPalette />
    </div>
  )
}
