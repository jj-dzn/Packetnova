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
  {
    title: 'IP address zodiac',
    description: 'Enter an IP and find out what its octets say about its personality.',
    href: '/labs/ip-zodiac',
  },
  {
    title: 'Handle generator',
    description: 'Generate a cyberpunk hacker alias and clearance level, movie-style.',
    href: '/labs/handle-generator',
  },
  {
    title: 'Cursed config generator',
    description: 'Authentic-looking router CLI syntax, completely fake settings.',
    href: '/labs/cursed-config',
  },
  {
    title: 'Hacker typer',
    description: "Mash any key. Look like you know exactly what you're doing.",
    href: '/labs/hacker-typer',
  },
  {
    title: 'Dial-up simulator',
    description: 'Relive the screech of a 56k modem connecting to the internet.',
    href: '/labs/dial-up',
  },
  {
    title: 'Blue screen button',
    description: 'Push it. Watch PacketNova "crash" into a fake blue screen.',
    href: '/labs/blue-screen',
  },
  {
    title: 'Traceroute ghost',
    description: 'A ghost travels hop by hop, getting more tired as latency climbs.',
    href: '/labs/traceroute-ghost',
  },
  {
    title: 'Ping pet duel',
    description: 'Two pets, two hosts, one latency duel. Fastest round trip wins.',
    href: '/labs/ping-pet-duel',
  },
  {
    title: 'Signal decoder',
    description: 'Watch any text ripple through Morse, binary, hex, and Base64.',
    href: '/labs/signal-decoder',
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

      <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
