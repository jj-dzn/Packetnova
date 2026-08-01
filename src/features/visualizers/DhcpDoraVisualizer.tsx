import { SequenceDiagramVisualizer, type SequenceStep } from './SequenceDiagramVisualizer'

// DORA: Discover, Offer, Request, Ack -- per RFC 2131. The client has no IP
// yet, so its first two messages (DISCOVER and REQUEST) are both broadcast
// to 255.255.255.255 rather than addressed to a specific server -- that's
// also why REQUEST is broadcast even though the client already knows which
// server it wants: every DHCP server on the segment needs to see it, so the
// ones that weren't picked know to withdraw their offer.
const STEPS: SequenceStep[] = [
  {
    title: 'Ready to configure',
    description:
      'The client has just joined the network with no IP address of its own (0.0.0.0). It has no way to reach a specific server yet, so everything it sends has to be a broadcast.',
    leftState: 'No IP (0.0.0.0)',
    rightState: 'Listening',
    segment: null,
  },
  {
    title: '1. DHCPDISCOVER',
    description:
      'The client broadcasts a DISCOVER to 255.255.255.255 -- "is any DHCP server out there?" Every DHCP server on the segment receives it.',
    leftState: 'Discovering...',
    rightState: 'Listening',
    segment: { direction: 'right', label: 'DHCPDISCOVER (broadcast)' },
  },
  {
    title: '2. DHCPOFFER',
    description:
      'The server proposes an IP address and lease terms, still addressed to the broadcast address (the client has no unicast address to receive it at yet). If multiple servers are configured, the client may see more than one offer and picks one.',
    leftState: 'Discovering...',
    rightState: 'Offer sent',
    segment: { direction: 'left', label: 'DHCPOFFER 192.168.1.50' },
  },
  {
    title: '3. DHCPREQUEST',
    description:
      "The client broadcasts a REQUEST for the specific offer it accepted -- broadcast, not unicast, so that any other server that made an offer sees this and knows its offer wasn't chosen.",
    leftState: 'Requesting 192.168.1.50',
    rightState: 'Offer sent',
    segment: { direction: 'right', label: 'DHCPREQUEST 192.168.1.50 (broadcast)' },
  },
  {
    title: '4. DHCPACK',
    description:
      'The server confirms the lease. The client can now use the address -- this is also the point at which it would receive a DHCPNAK instead if the requested address had become invalid in the meantime.',
    leftState: 'Bound: 192.168.1.50',
    rightState: 'Lease active',
    segment: { direction: 'left', label: 'DHCPACK -- lease 86400s' },
  },
]

export function DhcpDoraVisualizer() {
  return (
    <SequenceDiagramVisualizer
      category="Visualizer"
      title="DHCP DORA sequence"
      description="Watch Discover, Offer, Request, and Ack hand a client its first IP address."
      leftLabel="Client"
      rightLabel="DHCP server"
      steps={STEPS}
    />
  )
}
