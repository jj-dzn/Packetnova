import { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '../components/ui/Button'
import { Pill } from '../components/ui/Pill'
import { JourneyShell, type JourneyStage } from '../features/journey/JourneyShell'
import { otherJourneys } from '../features/journey/journeyFamily'
import {
  TopologyCanvas,
  type TopologyEdge,
  type TopologyNode,
} from '../features/diagram/TopologyCanvas'
import { TcpHandshakeVisualizer } from '../features/visualizers/TcpHandshakeVisualizer'
import { TlsHandshakeVisualizer } from '../features/visualizers/TlsHandshakeVisualizer'
import { PacketEncapsulationVisualizer } from '../features/visualizers/PacketEncapsulationVisualizer'
import { Dot1qExplorer } from '../features/tools/switching/Dot1qExplorer'
import { RoutingDecisionVisualizer } from '../features/visualizers/RoutingDecisionVisualizer'
import { NatFlowVisualizer } from '../features/visualizers/NatFlowVisualizer'
import { VpnPacketFlowVisualizer } from '../features/visualizers/VpnPacketFlowVisualizer'
import { BgpBestPathVisualizer } from '../features/visualizers/BgpBestPathVisualizer'

const INTRO_NODES: TopologyNode[] = [
  { id: 'client', x: 75, y: 50, label: 'Your browser' },
  { id: 'server', x: 400, y: 50, label: 'Destination server' },
]
const INTRO_EDGES: TopologyEdge[] = [
  { from: 'client', to: 'server', label: '?', dashed: true, stroke: 'var(--color-accent-alt)' },
]

function IntroStage() {
  return (
    <div className="flex flex-col gap-4">
      <TopologyCanvas
        nodes={INTRO_NODES}
        edges={INTRO_EDGES}
        viewWidth={480}
        viewHeight={110}
        className="mx-auto w-full max-w-lg"
      />
      <p className="text-sm text-fg-subtle">
        Everything between those two boxes is what this page actually walks through -- nine more
        stages, each one a real, permanent part of how this request actually gets there.
      </p>
    </div>
  )
}

function NoTranslationStage() {
  return (
    <div className="rounded-lg border border-border bg-surface p-6 text-sm text-fg-muted">
      <p>
        No translation needed here -- this device already has a public, globally-routable address,
        so the source address in the packet's IP header doesn't change at all on its way out. That's
        the exception, not the rule: most devices, on most networks, don't get this one.
      </p>
    </div>
  )
}

function NoTunnelStage() {
  return (
    <div className="rounded-lg border border-border bg-surface p-6 text-sm text-fg-muted">
      <p>
        No tunnel this time. The packet -- already TLS-encrypted at the application layer back in
        stage 2 -- travels directly to the destination, without a second layer of VPN encapsulation
        wrapped around it.
      </p>
    </div>
  )
}

const RECAP_ITEMS = [
  'TCP handshake -- a channel both sides agreed to open',
  'TLS handshake -- keys negotiated, everything after this point encrypted',
  'Encapsulation -- TCP, IP, and Ethernet headers wrapped around the request in order',
  '802.1Q tagging -- kept separate from other VLANs crossing the same trunk',
  'Routing -- a next-hop decision, longest prefix match first',
  'Address translation -- handled, or not, depending on the choice you made',
  'A VPN tunnel -- or not, depending on the other choice you made',
  'BGP -- handed off autonomous system to autonomous system across the open internet',
]

function ArrivalStage() {
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
      <p className="text-sm text-fg-muted">
        The destination server processes the request, and the entire process -- encryption,
        encapsulation, translation, routing -- happens again in reverse for the reply. Every concept
        on this page is a real, permanent part of every page load you've ever made.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link to="/tools">
          <Button variant="secondary">Browse tools</Button>
        </Link>
        <Link to="/visualizers">
          <Button variant="secondary">Explore visualizers</Button>
        </Link>
        <Link to="/scenarios">
          <Button variant="secondary">Try a scenario</Button>
        </Link>
      </div>
    </div>
  )
}

export function NetworkJourneyPage() {
  const [natChoice, setNatChoice] = useState<'nat' | 'public'>('nat')
  const [vpnChoice, setVpnChoice] = useState<'vpn' | 'direct'>('direct')

  const stages: JourneyStage[] = [
    {
      id: 'intro',
      title: 'A browser wants a page',
      mood: 'idle',
      narration:
        "You type an address and hit enter. Before a single byte of that page shows up, your packet survives roughly a dozen separate handoffs -- security negotiations, address translations, routing decisions made by routers that have never heard of you. Let's follow one packet through all of it.",
      content: <IntroStage />,
    },
    {
      id: 'tcp',
      title: 'TCP handshake',
      mood: 'checking',
      narration:
        'First, a reliable channel. TCP\'s three-way handshake -- SYN, SYN-ACK, ACK -- makes sure both sides are actually listening before any real data moves. Try the "SYN lost" scenario below to see what happens when the first attempt doesn\'t survive the trip.',
      content: <TcpHandshakeVisualizer />,
    },
    {
      id: 'tls',
      title: 'TLS handshake',
      mood: 'checking',
      narration:
        'Next, privacy. Nothing sent so far was encrypted -- TLS negotiates that now, agreeing on keys before the actual request ever leaves the browser.',
      content: <TlsHandshakeVisualizer />,
    },
    {
      id: 'encapsulation',
      title: 'Encapsulation',
      mood: 'checking',
      narration:
        'The request itself now needs wrapping -- a TCP header for the connection, an IP header for addressing, an Ethernet frame for the physical wire. Each layer adds exactly what the next hop needs and nothing else.',
      content: <PacketEncapsulationVisualizer />,
    },
    {
      id: 'vlan',
      title: 'VLAN tagging',
      mood: 'checking',
      narration:
        'On its way out of the building, the frame likely crosses a trunk link between switches -- multiple VLANs sharing one physical cable, kept separate by an 802.1Q tag added right here.',
      content: <Dot1qExplorer />,
    },
    {
      id: 'routing',
      title: 'Routing decision',
      mood: 'checking',
      narration:
        'The local router has to decide where this packet goes next. Longest prefix match picks the most specific route; administrative distance only breaks a tie between equally specific ones.',
      content: <RoutingDecisionVisualizer />,
    },
    {
      id: 'nat',
      title: 'Address translation',
      mood: 'checking',
      narration:
        "Most home and office networks share one public IP across every device inside them. Pick which is true for this connection -- it's the first of two choices on this page that actually change the story.",
      choice: (
        <div className="flex flex-wrap gap-2">
          <Pill active={natChoice === 'nat'} onClick={() => setNatChoice('nat')}>
            Behind NAT (most common)
          </Pill>
          <Pill active={natChoice === 'public'} onClick={() => setNatChoice('public')}>
            Already has a public IP
          </Pill>
        </div>
      ),
      content: natChoice === 'nat' ? <NatFlowVisualizer /> : <NoTranslationStage />,
    },
    {
      id: 'vpn',
      title: 'VPN tunnel?',
      mood: 'checking',
      narration:
        'Some connections tunnel through a VPN before ever reaching the open internet -- encrypting and re-wrapping the entire packet a second time. Others go straight out. Second choice:',
      choice: (
        <div className="flex flex-wrap gap-2">
          <Pill active={vpnChoice === 'vpn'} onClick={() => setVpnChoice('vpn')}>
            Through a VPN
          </Pill>
          <Pill active={vpnChoice === 'direct'} onClick={() => setVpnChoice('direct')}>
            Direct, no tunnel
          </Pill>
        </div>
      ),
      content: vpnChoice === 'vpn' ? <VpnPacketFlowVisualizer /> : <NoTunnelStage />,
    },
    {
      id: 'bgp',
      title: 'Crossing the internet',
      mood: 'checking',
      narration:
        "Once it's out on the open internet, no single router knows the whole path -- each one just picks the best next hop it knows about, using BGP's attribute-by-attribute tie-breaking order, autonomous system by autonomous system, until the packet is close enough to hand off to the destination's own network.",
      content: <BgpBestPathVisualizer />,
    },
    {
      id: 'arrival',
      title: 'Arrival',
      mood: 'fast',
      narration:
        'It made it. Every stage on this page just happened, in order, in the time it took you to read this sentence the first time -- most of it in under a second, every single time you load a page.',
      content: <ArrivalStage />,
    },
  ]

  return (
    <JourneyShell
      eyebrow="Flagship experience"
      title="Follow a packet's journey"
      description="One request, from your browser to a server on the other side of the internet -- every concept this site teaches separately, in the order it actually happens."
      stages={stages}
      otherJourneys={otherJourneys('/journey')}
    />
  )
}
