import { Link } from 'react-router'
import { Badge } from '../../components/ui/Badge'

export function LabsTeaser() {
  return (
    <section className="py-14">
      <Link
        to="/labs"
        className="group flex flex-col items-center justify-between gap-4 rounded-lg border border-border bg-surface p-6 text-center transition-colors hover:border-accent sm:flex-row sm:text-left"
      >
        <div>
          <Badge tone="accent">Experimental</Badge>
          <h2 className="mt-2 text-lg font-semibold">PacketNova Labs</h2>
          <p className="mt-1 text-sm text-fg-muted">
            Small, just-for-fun extras -- like a ping pet that reacts to live latency.
          </p>
        </div>
        <span className="whitespace-nowrap text-sm font-medium text-accent group-hover:underline">
          Visit Labs -&gt;
        </span>
      </Link>
    </section>
  )
}
