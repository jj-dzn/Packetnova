import { Link } from 'react-router'
import { Button } from '../components/ui/Button'
import { JourneyShell, type JourneyStage } from '../features/journey/JourneyShell'
import { otherJourneys } from '../features/journey/journeyFamily'
import { PacketStackInspector } from '../features/journey/PacketStackInspector'
import {
  TopologyCanvas,
  type TopologyEdge,
  type TopologyNode,
} from '../features/diagram/TopologyCanvas'
import { VpnPacketFlowVisualizer } from '../features/visualizers/VpnPacketFlowVisualizer'

const SETUP_NODES: TopologyNode[] = [
  { id: 'officeA', x: 45, y: 75, label: 'Office A', icon: 'host' },
  {
    id: 'gatewayA',
    x: 190,
    y: 75,
    label: 'Gateway A',
    sublabel: '203.0.113.1',
    icon: 'vpn-gateway',
  },
  {
    id: 'gatewayB',
    x: 410,
    y: 75,
    label: 'Gateway B',
    sublabel: '198.51.100.1',
    icon: 'vpn-gateway',
  },
  { id: 'officeB', x: 555, y: 75, label: 'Office B', icon: 'host' },
]
const SETUP_EDGES: TopologyEdge[] = [
  { from: 'officeA', to: 'gatewayA' },
  {
    from: 'gatewayA',
    to: 'gatewayB',
    label: 'IPsec tunnel',
    dashed: true,
    stroke: 'var(--color-accent-alt)',
  },
  { from: 'gatewayB', to: 'officeB' },
]

function SetupStage() {
  return (
    <div className="flex flex-col gap-4">
      <TopologyCanvas
        nodes={SETUP_NODES}
        edges={SETUP_EDGES}
        viewWidth={600}
        viewHeight={150}
        className="mx-auto w-full max-w-2xl"
      />
      <p className="text-sm text-fg-subtle">
        Two offices, joined by a tunnel across the open internet. Neither gateway trusts the network
        in between -- everything that crosses it has to be wrapped and encrypted first.
      </p>
    </div>
  )
}

const ORIGINAL_LAYERS = [
  { label: 'Ethernet frame', detail: 'dst = Gateway A' },
  { label: 'IP header', detail: 'src = 10.0.0.5, dst = 10.0.1.20' },
  { label: 'TCP header', detail: 'dport = 443' },
  { label: 'Application data', detail: 'the actual request' },
]
const WRAPPED_LAYERS = [
  { label: 'Ethernet frame', detail: 'dst = Gateway B, next hop' },
  { label: 'Outer IP header', detail: 'src = 203.0.113.1, dst = 198.51.100.1' },
  { label: 'ESP header', detail: 'SPI + sequence number, in the clear' },
  { label: 'Encrypted original packet', detail: 'IP + TCP + data -- opaque without the key' },
]

function WrapStage() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-fg-muted">
        Tunnel mode doesn't just encrypt the payload -- it builds an entirely new outer packet
        around the original one, addressed gateway-to-gateway instead of host-to-host:
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <PacketStackInspector caption="Before it reaches Gateway A" layers={ORIGINAL_LAYERS} />
        <PacketStackInspector
          caption="What actually crosses the internet"
          layers={WRAPPED_LAYERS}
        />
      </div>
      <p className="text-xs text-fg-subtle">
        Two fields ride along outside this nested view rather than inside it: an ESP trailer
        (padding plus the next-header field) and an integrity check value, both appended after the
        encrypted block rather than wrapped around it. A router in the middle of the internet sees
        only the outer IP header and the ESP header -- the original addresses, ports, and data are
        gone from view until Gateway B decrypts it.
      </p>
    </div>
  )
}

function WhyTunnelStage() {
  return (
    <div className="rounded-lg border border-border bg-surface p-6 text-sm text-fg-muted">
      <p className="mb-3">
        Tunnel mode is the default for exactly this reason: neither office's internal addressing
        (10.0.0.5, 10.0.1.20) ever appears on the public internet at all, and no individual host on
        either side needs to know IPsec exists -- the gateways do all the work.
      </p>
      <p>
        Transport mode, which leaves the original IP header untouched and encrypts only the payload,
        needs both endpoints to run IPsec themselves. That makes it a niche choice in practice --
        host-to-host encryption between two servers that already have real, routable addresses, or
        as the inner layer underneath something like L2TP/IPsec -- rather than how most VPNs
        actually connect networks.
      </p>
    </div>
  )
}

function OverheadStage() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-fg-muted">
        Every layer added in the last stage costs real bytes -- the outer IP header, the ESP header,
        the trailer, the integrity check. That overhead comes out of the link's usable MTU, not on
        top of it, which is the single most common cause of a VPN that "works" for small requests
        but silently hangs on anything large.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link to="/tools/vpn-tunnel-overhead-calculator">
          <Button variant="secondary">Calculate this tunnel's overhead</Button>
        </Link>
        <Link to="/scenarios/site-to-site-vpn-failure">
          <Button variant="secondary">Diagnose the hang scenario</Button>
        </Link>
      </div>
    </div>
  )
}

const RECAP_ITEMS = [
  'Tunnel mode wraps the entire original packet in a new one, addressed gateway-to-gateway',
  'The original IP header, ports, and data are encrypted -- invisible to anything in between',
  'An ESP header (visible) and trailer plus integrity check (appended, not nested) ride along',
  'Tunnel mode hides internal addressing and needs no IPsec support on individual hosts',
  'Transport mode encrypts the payload only, and stays a host-to-host niche as a result',
  "That extra wrapping isn't free -- it eats directly into the link's usable MTU",
]

function RecapStage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-border bg-surface p-6">
        <p className="mb-3 text-sm font-medium">What just happened, in order</p>
        <ul className="flex flex-col gap-1.5 text-sm text-fg-muted">
          {RECAP_ITEMS.map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden="true" className="text-accent-alt">
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link to="/visualizers/vpn-packet-flow">
          <Button variant="secondary">Open the VPN packet flow visualizer</Button>
        </Link>
        <Link to="/scenarios/site-to-site-vpn-failure">
          <Button variant="secondary">Try the site-to-site scenario</Button>
        </Link>
      </div>
    </div>
  )
}

const STAGES: JourneyStage[] = [
  {
    id: 'setup',
    title: 'Two offices, one tunnel',
    mood: 'idle',
    narration:
      'A site-to-site VPN joins two private networks across a public one neither of them trusts. Before any real traffic moves, the gateways need a way to protect it in transit.',
    content: <SetupStage />,
  },
  {
    id: 'wrap',
    title: 'Encapsulate, then encrypt',
    mood: 'checking',
    narration:
      'Follow one packet from Office A into the tunnel. What actually crosses the internet looks almost nothing like what left the original host.',
    content: <WrapStage />,
  },
  {
    id: 'compare-modes',
    title: 'Tunnel mode vs. transport mode',
    mood: 'checking',
    narration:
      'The last stage showed tunnel mode. Switch to transport mode below and watch the original IP header survive the trip untouched instead.',
    content: <VpnPacketFlowVisualizer />,
  },
  {
    id: 'why-tunnel',
    title: 'Why tunnel mode wins by default',
    mood: 'checking',
    narration:
      'Two modes exist. One of them is what almost every real VPN actually uses, and here is exactly why.',
    content: <WhyTunnelStage />,
  },
  {
    id: 'overhead',
    title: "The wrapping isn't free",
    mood: 'medium',
    narration:
      'Every header added in the wrap stage has to fit inside the same link MTU as everything else -- which is where a healthy-looking tunnel starts causing real problems.',
    content: <OverheadStage />,
  },
  {
    id: 'recap',
    title: 'Arrival',
    mood: 'fast',
    narration:
      'The reply from Office B goes through the exact same wrap, cross, and unwrap sequence in reverse -- for every packet, in both directions, for as long as the tunnel stays up.',
    content: <RecapStage />,
  },
]

export function VpnTunnelJourneyPage() {
  return (
    <JourneyShell
      eyebrow="Packet journey"
      title="Inside a VPN tunnel"
      description="A whole packet wrapped inside another one, encrypted end to end, and unwrapped again at the far side of a site-to-site link."
      stages={STAGES}
      otherJourneys={otherJourneys('/journey/vpn-tunnel')}
    />
  )
}
