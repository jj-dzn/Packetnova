import { Link } from 'react-router'
import { Badge } from '../../components/ui/Badge'
import { PingPetCreature } from '../../features/labs/PingPetCreature'

export function LabsTeaser() {
  return (
    <section className="py-10">
      <Link
        to="/labs"
        className="group relative flex flex-col items-center gap-6 overflow-hidden rounded-lg border border-accent/30 bg-surface p-8 text-center transition-colors hover:border-accent hover:shadow-[0_0_32px_-12px_var(--color-accent)] sm:flex-row sm:text-left"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-accent/20 blur-3xl"
        />
        <PingPetCreature status="fast" className="h-24 w-24 shrink-0" />
        <div className="relative flex-1">
          <Badge tone="accent">Just for fun</Badge>
          <h2 className="mt-2 text-lg font-semibold">Meet the PacketNova Labs corner</h2>
          <p className="mt-1 text-sm text-fg-muted">
            A ping pet whose mood follows live latency to a host you pick, a retro hacking terminal,
            and more playful extras to come.
          </p>
        </div>
        <span className="relative whitespace-nowrap text-sm font-medium text-accent group-hover:underline">
          Visit Labs -&gt;
        </span>
      </Link>
    </section>
  )
}
