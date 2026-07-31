import { Link } from 'react-router'
import { SectionHeader } from './SectionHeader'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'

export function LatestArticles() {
  return (
    <section className="py-14">
      <SectionHeader
        title="From the blog"
        subtitle="Networking write-ups, coming soon"
        viewAllHref="/blog"
        viewAllLabel="Visit the blog"
      />
      <Link to="/blog" className="block">
        <Card interactive className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Badge tone="accent">Blog</Badge>
            <span className="text-xs text-fg-subtle">Coming soon</span>
          </div>
          <p className="text-sm text-fg-muted">
            First posts: understanding MTU, BGP best path, and troubleshooting packet loss.
          </p>
        </Card>
      </Link>
    </section>
  )
}
