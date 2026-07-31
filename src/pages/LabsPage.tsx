import { Badge } from '../components/ui/Badge'
import { PreviewCard } from '../components/ui/PreviewCard'

const labs = [
  {
    title: 'Ping pet',
    description: 'A small creature whose mood tracks live latency to a host you pick.',
    href: '/labs/ping-pet',
  },
  {
    title: 'Retro terminal',
    description: 'A fake boot sequence and a handful of commands, dressed up as a hacking console.',
    href: '/terminal',
  },
]

export function LabsPage() {
  return (
    <div className="flex flex-col gap-8 py-16">
      <div className="text-center">
        <Badge tone="accent">Just for fun</Badge>
        <h1 className="mt-4 text-2xl font-semibold">Labs</h1>
        <p className="mx-auto mt-2 max-w-xl text-fg-muted">
          A small, playful corner of PacketNova -- built for fun, not diagnostics.
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

      <p className="text-center text-xs text-fg-subtle">
        The retro terminal also answers to the classic cheat code, if you know it.
      </p>
    </div>
  )
}
