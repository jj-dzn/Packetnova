import { Link } from 'react-router'
import { SectionHeader } from './SectionHeader'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'

export function FeaturedVisualizers() {
  return (
    <section className="py-14">
      <SectionHeader
        title="Interactive visualizers"
        subtitle="Step-by-step animations of how protocols actually work"
        viewAllHref="/visualizers"
        viewAllLabel="View all visualizers"
      />
      <Link to="/visualizers" className="block">
        <Card interactive className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Badge tone="accent">Visualizer</Badge>
            <span className="text-xs text-fg-subtle">Coming soon</span>
          </div>
          <p className="text-sm text-fg-muted">
            First up: TCP three-way handshake, TLS handshake, and packet encapsulation.
          </p>
        </Card>
      </Link>
    </section>
  )
}
