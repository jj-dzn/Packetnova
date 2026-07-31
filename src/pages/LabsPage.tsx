import { Badge } from '../components/ui/Badge'
import { PreviewCard } from '../components/ui/PreviewCard'

const labs = [
  {
    title: 'Ping pet',
    description: 'A small creature whose mood tracks live latency to a host you pick.',
    href: '/labs/ping-pet',
  },
]

export function LabsPage() {
  return (
    <div className="flex flex-col gap-8 py-16">
      <div className="text-center">
        <Badge tone="accent">Experimental</Badge>
        <h1 className="mt-4 text-2xl font-semibold">Labs</h1>
        <p className="mx-auto mt-2 max-w-xl text-fg-muted">
          Small, just-for-fun corners of PacketNova -- not part of the core toolkit.
        </p>
      </div>

      <div className="mx-auto grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
        {labs.map((lab) => (
          <PreviewCard
            key={lab.href}
            category="Labs"
            title={lab.title}
            description={lab.description}
            href={lab.href}
            comingSoon={false}
          />
        ))}
      </div>
    </div>
  )
}
