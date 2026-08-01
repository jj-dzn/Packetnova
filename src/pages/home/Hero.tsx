import { useEffect, useRef, type CSSProperties, type RefObject } from 'react'
import { Link } from 'react-router'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { TrafficStarfield } from './TrafficStarfield'
import { HeroStatusLine } from './HeroStatusLine'

// Ties the hero's ambient glow (the two blur blobs + the status line) to how
// much of the hero is actually still in view -- full intensity at the top,
// fading out smoothly as it scrolls away, rather than the atmosphere just
// cutting off abruptly at the section boundary. Skipped entirely under
// prefers-reduced-motion (stays at full, static intensity) since it's a
// continuous scroll-driven effect, not something reduced-motion visitors
// should have to sit through.
function useScrollSignal(sectionRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const thresholds = Array.from({ length: 21 }, (_, i) => i / 20)
    const observer = new IntersectionObserver(
      ([entry]) => {
        section.style.setProperty('--pn-signal', String(entry?.intersectionRatio ?? 1))
      },
      { threshold: thresholds },
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [sectionRef])
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  useScrollSignal(sectionRef)

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-16 text-center sm:py-24"
      style={{ '--pn-signal': 1 } as CSSProperties}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-accent/20 blur-3xl transition-opacity duration-300"
        style={{ opacity: 'var(--pn-signal, 1)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-1/4 top-1/3 h-64 w-64 rounded-full bg-accent-alt/20 blur-3xl transition-opacity duration-300"
        style={{ opacity: 'var(--pn-signal, 1)' }}
      />
      <TrafficStarfield />

      {/* pointer-events-none here for the same reason TrafficStarfield's own
          wrapper needs it: this div is `relative` (positioned), so without
          it, its empty flex gaps would sit above -- and block clicks
          through to -- any starfield node that happens to land underneath
          them. The two real links opt back into pointer-events-auto. */}
      <div className="relative pointer-events-none flex flex-col items-center gap-6">
        <Badge tone="accent">Free & client-side -- no account needed</Badge>
        <h1 className="text-2xl font-semibold">PacketNova</h1>
        <p className="max-w-xl text-fg-muted">
          Networking tools built for engineers. Calculators, protocol explorers, and interactive
          visualizers -- all running in your browser, all free.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/journey" className="pointer-events-auto">
            <Button>Follow a packet's journey</Button>
          </Link>
          <Link to="/tools" className="pointer-events-auto">
            <Button variant="secondary">Browse tools</Button>
          </Link>
          <Link to="/visualizers" className="pointer-events-auto">
            <Button variant="secondary">Explore visualizers</Button>
          </Link>
        </div>
        <div className="transition-opacity duration-300" style={{ opacity: 'var(--pn-signal, 1)' }}>
          <HeroStatusLine />
        </div>
      </div>
    </section>
  )
}
