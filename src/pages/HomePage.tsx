import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'

export function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
      <Badge tone="accent">Foundation</Badge>
      <h1 className="text-2xl font-semibold">PacketNova</h1>
      <p className="max-w-md text-fg-muted">
        Networking tools built for engineers. Calculators, protocol explorers, and interactive
        visualizers -- all client-side, all free.
      </p>
      <Card interactive className="max-w-sm text-left">
        <p className="text-sm text-fg-muted">
          Navigation and routing are online. The real homepage design lands in Milestone 4.
        </p>
      </Card>
    </div>
  )
}
