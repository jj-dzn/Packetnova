import { useState } from 'react'
import { VisualizerPageLayout } from './VisualizerPageLayout'
import { SequenceDiagramContent, type SequenceStep } from './SequenceDiagramVisualizer'
import { MiddleboxFlowContent, type MiddleboxStep } from './MiddleboxFlowVisualizer'
import { Pill } from '../../components/ui/Pill'

// DORA: Discover, Offer, Request, Ack -- per RFC 2131. The client has no IP
// yet, so its first two messages (DISCOVER and REQUEST) are both broadcast
// to 255.255.255.255 rather than addressed to a specific server -- that's
// also why REQUEST is broadcast even though the client already knows which
// server it wants: every DHCP server on the segment needs to see it, so the
// ones that weren't picked know to withdraw their offer.
const SAME_SUBNET_STEPS: SequenceStep[] = [
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

// The same four messages, but the client and server sit on different
// subnets -- broadcasts never cross a router on their own, so nothing
// reaches the server without a relay agent (usually the client's own
// default gateway, configured with Cisco's "ip helper-address" or the
// equivalent) rewriting each broadcast into a unicast addressed directly to
// the server. The gateway IP address field (giaddr) the relay stamps into
// every relayed message is what tells the server which subnet's pool to
// allocate from -- without it, the server has no way to know the client
// isn't on its own local segment.
const RELAY_STEPS: MiddleboxStep[] = [
  {
    title: 'Ready to configure',
    description:
      "The client is on VLAN 20; the DHCP server lives on VLAN 10, a completely different subnet. A broadcast from the client would normally go nowhere beyond VLAN 20 -- routers don't forward broadcast traffic on their own.",
    middleValue: null,
    hop: null,
  },
  {
    title: '1. DHCPDISCOVER (broadcast, VLAN 20 only)',
    description:
      "The client broadcasts DISCOVER exactly as it would on a single-segment network. It only reaches devices on VLAN 20 -- including the router acting as the client's default gateway, which is configured as a DHCP relay agent and is listening for exactly this.",
    middleValue: null,
    hop: { direction: 'right', segment: 'left-middle', label: 'DHCPDISCOVER (broadcast)' },
  },
  {
    title: '2. Relay forwards DISCOVER to the server, with giaddr set',
    description:
      "The relay agent turns the broadcast into an ordinary unicast packet addressed directly to the DHCP server, and stamps its own IP address on VLAN 20 (10.0.20.1) into the packet's gateway IP address field (giaddr).",
    middleValue: 'giaddr = 10.0.20.1',
    hop: { direction: 'right', segment: 'middle-right', label: 'DHCPDISCOVER giaddr=10.0.20.1' },
  },
  {
    title: '3. Server picks an address from the matching pool',
    description:
      "The server reads giaddr=10.0.20.1, recognizes it as VLAN 20's gateway address, and offers an address from the scope configured for VLAN 20 -- not from whatever pool covers its own local subnet.",
    middleValue: 'giaddr = 10.0.20.1',
    hop: null,
  },
  {
    title: '4. DHCPOFFER, unicast back to the relay',
    description:
      'The reply goes straight back to the relay agent, unicast -- the server never talks to the client directly at any point in this whole exchange.',
    middleValue: 'giaddr = 10.0.20.1',
    hop: { direction: 'left', segment: 'middle-right', label: 'DHCPOFFER 10.0.20.50' },
  },
  {
    title: '5. Relay broadcasts the OFFER onto VLAN 20',
    description:
      "The relay puts the offer back out onto the client's own segment -- still broadcast, since the client still has no address of its own to receive a unicast reply at.",
    middleValue: 'Offer relayed: 10.0.20.50',
    hop: { direction: 'left', segment: 'left-middle', label: 'DHCPOFFER (broadcast)' },
  },
  {
    title: '6. DHCPREQUEST follows the same relay path',
    description:
      'The client broadcasts REQUEST for the offered address, exactly as on a single-segment network.',
    middleValue: 'Offer relayed: 10.0.20.50',
    hop: { direction: 'right', segment: 'left-middle', label: 'DHCPREQUEST (broadcast)' },
  },
  {
    title: '7. Relay forwards REQUEST, with giaddr set again',
    description:
      'The relay agent handles REQUEST exactly like it handled DISCOVER -- unicast to the server, giaddr stamped with its own VLAN 20 address.',
    middleValue: 'giaddr = 10.0.20.1',
    hop: { direction: 'right', segment: 'middle-right', label: 'DHCPREQUEST giaddr=10.0.20.1' },
  },
  {
    title: '8. DHCPACK, unicast back to the relay',
    description: 'The server confirms the lease, again addressed directly to the relay agent.',
    middleValue: 'giaddr = 10.0.20.1',
    hop: { direction: 'left', segment: 'middle-right', label: 'DHCPACK -- lease 86400s' },
  },
  {
    title: '9. Relay broadcasts the ACK -- lease bound',
    description:
      'The relay puts the final ACK back out onto VLAN 20. The client is now bound to an address from a pool it was never directly connected to, entirely because giaddr told the server which pool to use.',
    middleValue: 'Lease bound: 10.0.20.50',
    hop: { direction: 'left', segment: 'left-middle', label: 'DHCPACK (broadcast)' },
  },
]

type Mode = 'same-subnet' | 'relay'

export function DhcpDoraVisualizer() {
  const [mode, setMode] = useState<Mode>('same-subnet')

  return (
    <VisualizerPageLayout
      category="Visualizer"
      title="DHCP DORA sequence"
      description={
        mode === 'same-subnet'
          ? 'Watch Discover, Offer, Request, and Ack hand a client its first IP address.'
          : "The same four messages, but the client and server are on different subnets -- nothing crosses the router without a relay agent rewriting each broadcast, and a field called giaddr telling the server which subnet's pool to actually use."
      }
    >
      <div className="mb-6 flex flex-wrap gap-2">
        <Pill active={mode === 'same-subnet'} onClick={() => setMode('same-subnet')}>
          Same subnet
        </Pill>
        <Pill active={mode === 'relay'} onClick={() => setMode('relay')}>
          Different subnet (via relay)
        </Pill>
      </div>
      {mode === 'same-subnet' ? (
        <SequenceDiagramContent
          key="same-subnet"
          leftLabel="Client"
          rightLabel="DHCP server"
          steps={SAME_SUBNET_STEPS}
        />
      ) : (
        <MiddleboxFlowContent
          key="relay"
          leftLabel="Client (VLAN 20)"
          leftValue="No IP yet"
          middleLabel="Relay agent (router)"
          middleIdleValue="No requests relayed yet"
          rightLabel="DHCP server (VLAN 10)"
          rightValue="Scopes for VLAN 10 and VLAN 20"
          steps={RELAY_STEPS}
        />
      )}
    </VisualizerPageLayout>
  )
}
