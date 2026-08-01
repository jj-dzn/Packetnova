import { Link } from 'react-router'
import { SectionHeader } from './SectionHeader'
import { PreviewCard } from '../../components/ui/PreviewCard'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { useScrollReveal } from '../../hooks/useScrollReveal'

export function FeaturedVisualizers() {
  const { ref, revealed } = useScrollReveal<HTMLElement>()

  return (
    <section
      ref={ref}
      className={`py-14 transition-all duration-500 ease-out ${revealed ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
    >
      <SectionHeader
        title="Interactive visualizers"
        subtitle="Step-by-step animations of how protocols actually work"
        viewAllHref="/visualizers"
        viewAllLabel="View all visualizers"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <PreviewCard
          category="Visualizer"
          title="TCP three-way handshake"
          description="Watch SYN, SYN-ACK, and ACK establish a connection step by step."
          href="/visualizers/tcp-three-way-handshake"
          comingSoon={false}
        />
        <Link to="/visualizers" className="block">
          <Card interactive tilt className="flex h-full flex-col items-start justify-center gap-2">
            <Badge tone="accent">9 more</Badge>
            <p className="text-sm text-fg-muted">
              TLS handshake, packet encapsulation, and more on the way.
            </p>
          </Card>
        </Link>
      </div>
    </section>
  )
}
