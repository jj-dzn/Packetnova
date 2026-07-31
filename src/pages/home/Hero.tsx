import { Link } from 'react-router'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { TrafficStarfield } from './TrafficStarfield'
import { HeroStatusLine } from './HeroStatusLine'

export function Hero() {
  return (
    <section className="relative overflow-hidden py-16 text-center sm:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-accent/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-1/4 top-1/3 h-64 w-64 rounded-full bg-accent-alt/20 blur-3xl"
      />
      <TrafficStarfield />

      <div className="relative flex flex-col items-center gap-6">
        <Badge tone="accent">Free & client-side -- no account needed</Badge>
        <h1 className="text-2xl font-semibold">PacketNova</h1>
        <p className="max-w-xl text-fg-muted">
          Networking tools built for engineers. Calculators, protocol explorers, and interactive
          visualizers -- all running in your browser, all free.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/tools">
            <Button>Browse tools</Button>
          </Link>
          <Link to="/visualizers">
            <Button variant="secondary">Explore visualizers</Button>
          </Link>
        </div>
        <HeroStatusLine />
      </div>
    </section>
  )
}
