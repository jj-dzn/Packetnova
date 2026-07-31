import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Nav } from './Nav'
import { Footer } from './Footer'
import { useSyncDocumentMeta } from '../../hooks/useSyncDocumentMeta'
import { useKonamiCode } from '../../hooks/useKonamiCode'

interface PageShellProps {
  children: ReactNode
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
    return <div className="min-h-screen bg-bg text-fg">{children}</div>
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg text-fg">
      <Nav />
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 sm:px-6 lg:px-8">{children}</main>
      <Footer />
    </div>
  )
}
