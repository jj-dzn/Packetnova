import { useState, type ReactNode } from 'react'
import { VisualizerPageLayout } from './VisualizerPageLayout'
import { StepControls } from './StepControls'
import { StepNarration } from './StepNarration'
import { Pill } from '../../components/ui/Pill'
import { useStepPlayer } from '../../hooks/useStepPlayer'
import {
  tcpIpLayerColorClasses,
  type LayerColorClasses,
} from '../../content/reference/networkStackLayers'

// TCP/IP layer numbers (Application=4 ... Network Access=1), reused here so
// the same accent/accent-alt checkerboard from the OSI and TCP/IP stack
// explorers applies to these layers too.
const TCP_LAYER_NUMBER = 3
const IP_LAYER_NUMBER = 2
const ETH_LAYER_NUMBER = 1

interface EncapLayer {
  key: string
  headerLabel: string
  headerTitle: string
  trailerLabel?: string
  trailerTitle?: string
  tcpIpLayerNumber: number
}

const TCP_LAYER: EncapLayer = {
  key: 'tcp',
  headerLabel: 'TCP',
  headerTitle: 'TCP header',
  tcpIpLayerNumber: TCP_LAYER_NUMBER,
}
const UDP_LAYER: EncapLayer = {
  key: 'udp',
  headerLabel: 'UDP',
  headerTitle: 'UDP header',
  tcpIpLayerNumber: TCP_LAYER_NUMBER,
}
const IP_LAYER: EncapLayer = {
  key: 'ip',
  headerLabel: 'IP',
  headerTitle: 'IP header',
  tcpIpLayerNumber: IP_LAYER_NUMBER,
}
const ETH_LAYER: EncapLayer = {
  key: 'eth',
  headerLabel: 'ETH',
  headerTitle: 'Ethernet header',
  trailerLabel: 'FCS',
  trailerTitle: 'Ethernet trailer (FCS)',
  tcpIpLayerNumber: ETH_LAYER_NUMBER,
}

interface EncapStep {
  title: string
  description: string
  unitName: string
  payloadLabel: string
  /** Every header/trailer currently wrapped around the payload at this
   * step, innermost first -- an empty array means just the raw payload.
   * Declaring the full layer set per step (rather than a "reveal
   * threshold" that only works for a monotonically-growing wrap sequence)
   * is what lets the exact same rendering handle decapsulation too, where
   * the set shrinks instead of grows. */
  layers: EncapLayer[]
}

// HTTP over TCP: the "full stack" case, wrapped at the source and then
// unwrapped again at the destination -- not just built up and left there.
const HTTP_STEPS: EncapStep[] = [
  {
    title: 'Application data',
    description: 'The application generates data to send -- for example, an HTTP GET request.',
    unitName: 'Data',
    payloadLabel: 'Data',
    layers: [],
  },
  {
    title: '1. Transport layer adds a TCP header',
    description:
      'TCP adds a header with source/destination ports and sequence numbers, so the reply can find its way back to the right connection. Data + TCP header is now called a segment.',
    unitName: 'Segment',
    payloadLabel: 'Data',
    layers: [TCP_LAYER],
  },
  {
    title: '2. Network layer adds an IP header',
    description:
      'IP adds a header with source/destination IP addresses. Segment + IP header is now called a packet.',
    unitName: 'Packet',
    payloadLabel: 'Data',
    layers: [TCP_LAYER, IP_LAYER],
  },
  {
    title: '3. Link layer adds an Ethernet header and trailer',
    description:
      'Ethernet adds a header with source/destination MAC addresses, plus a trailer (FCS) for error checking. Packet + Ethernet header/trailer is now called a frame -- ready to go on the wire.',
    unitName: 'Frame',
    payloadLabel: 'Data',
    layers: [TCP_LAYER, IP_LAYER, ETH_LAYER],
  },
  {
    title: "4. The frame arrives -- Ethernet's job is done",
    description:
      "At the destination NIC, the Ethernet header and trailer are stripped off. They only ever needed to get the frame across this one physical hop -- what's left gets handed up to IP.",
    unitName: 'Packet',
    payloadLabel: 'Data',
    layers: [TCP_LAYER, IP_LAYER],
  },
  {
    title: '5. IP hands off based on the destination address',
    description:
      'The IP header is stripped -- the destination address already did its job, getting the packet to this exact host. The protocol field inside it says what to hand the remainder to: TCP.',
    unitName: 'Segment',
    payloadLabel: 'Data',
    layers: [TCP_LAYER],
  },
  {
    title: '6. TCP delivers the data to the application',
    description:
      "The TCP header is stripped -- its port numbers identified exactly which application should receive this. What's left is the original data, byte-for-byte identical to what the sender's application generated.",
    unitName: 'Data',
    payloadLabel: 'Data',
    layers: [],
  },
]

// DHCP over UDP: same overall shape as HTTP/TCP, but UDP instead of TCP
// (DHCP just re-broadcasts if nothing answers, so it doesn't need TCP's
// reliability machinery) and IP addresses that only make sense because the
// client has no real address yet.
const DHCP_STEPS: EncapStep[] = [
  {
    title: 'DHCPDISCOVER message',
    description: 'The client, with no IP address of its own yet, builds a DHCPDISCOVER message.',
    unitName: 'Data',
    payloadLabel: 'DISCOVER',
    layers: [],
  },
  {
    title: '1. Transport layer adds a UDP header',
    description:
      "UDP adds source port 68 (the client) and destination port 67 (the server) -- DHCP doesn't need TCP's connection setup or retransmission logic, since the client just re-broadcasts if nothing answers.",
    unitName: 'Datagram',
    payloadLabel: 'DISCOVER',
    layers: [UDP_LAYER],
  },
  {
    title: '2. Network layer adds an IP header',
    description:
      'Source 0.0.0.0 (the client has no address to put here yet), destination 255.255.255.255 (broadcast) -- both chosen specifically because a real address on either side is exactly what this exchange is trying to obtain.',
    unitName: 'Packet',
    payloadLabel: 'DISCOVER',
    layers: [UDP_LAYER, IP_LAYER],
  },
  {
    title: '3. Link layer adds an Ethernet header and trailer',
    description:
      'Destination MAC is the broadcast address ff:ff:ff:ff:ff:ff, so every device on the local segment receives and processes this frame -- there is no DHCP server address to target directly yet.',
    unitName: 'Frame',
    payloadLabel: 'DISCOVER',
    layers: [UDP_LAYER, IP_LAYER, ETH_LAYER],
  },
  {
    title: '4. Every device on the segment receives it',
    description:
      "Because this is a broadcast frame, every host on the local segment strips its Ethernet header and looks at what's inside -- only the DHCP server actually acts on it.",
    unitName: 'Packet',
    payloadLabel: 'DISCOVER',
    layers: [UDP_LAYER, IP_LAYER],
  },
  {
    title: '5. IP hands off to the transport layer',
    description:
      'The IP header is stripped. Everything addressed to the broadcast address and this UDP port range gets handed up.',
    unitName: 'Datagram',
    payloadLabel: 'DISCOVER',
    layers: [UDP_LAYER],
  },
  {
    title: '6. UDP delivers it to the DHCP service',
    description:
      'The UDP header is stripped -- destination port 67 identified this as DHCP traffic specifically. The DHCP service on the server receives the original DISCOVER message and starts building an OFFER.',
    unitName: 'Data',
    payloadLabel: 'DISCOVER',
    layers: [],
  },
]

// ARP has no transport or network layer at all -- the clearest possible
// illustration that not every packet uses the whole stack. It's carried
// directly inside an Ethernet frame, nothing more.
const ARP_STEPS: EncapStep[] = [
  {
    title: 'ARP request',
    description:
      'A host knows the IP address 192.168.1.1 but not its MAC address, and needs the MAC to actually address a frame to it. It builds an ARP request.',
    unitName: 'Message',
    payloadLabel: 'ARP req',
    layers: [],
  },
  {
    title: '1. Link layer adds an Ethernet header and trailer -- and stops there',
    description:
      "ARP has no transport-layer or network-layer header of its own -- it goes directly inside an Ethernet frame (EtherType 0x0806), addressed to the broadcast MAC ff:ff:ff:ff:ff:ff, since not knowing anyone's MAC address yet is exactly the problem ARP exists to solve.",
    unitName: 'Frame',
    payloadLabel: 'ARP req',
    layers: [ETH_LAYER],
  },
  {
    title: '2. Every device on the segment receives it',
    description:
      'Every host on the segment strips the Ethernet header and inspects the ARP message inside. Only the host whose own IP address matches the request actually replies -- with a unicast ARP reply carrying its MAC address, going through the exact same one-layer wrap in reverse.',
    unitName: 'Message',
    payloadLabel: 'ARP req',
    layers: [],
  },
]

type ScenarioKey = 'http' | 'dhcp' | 'arp'

interface Scenario {
  key: ScenarioKey
  label: string
  description: string
  steps: EncapStep[]
}

const SCENARIOS: Scenario[] = [
  {
    key: 'http',
    label: 'HTTP over TCP',
    description:
      "Follow a packet as it's wrapped from application data down to a frame -- then unwrapped again at the destination, layer by layer, in reverse.",
    steps: HTTP_STEPS,
  },
  {
    key: 'dhcp',
    label: 'DHCP over UDP',
    description:
      "DHCP takes the same trip through UDP instead of TCP, with source and destination addresses that only make sense because the client doesn't have a real address yet.",
    steps: DHCP_STEPS,
  },
  {
    key: 'arp',
    label: 'ARP (no IP at all)',
    description:
      'Not every packet uses the whole stack: ARP has no transport or network layer of its own, and goes straight from raw message to Ethernet frame.',
    steps: ARP_STEPS,
  },
]

export function PacketEncapsulationVisualizer() {
  const [scenarioKey, setScenarioKey] = useState<ScenarioKey>('http')
  const scenario = SCENARIOS.find((s) => s.key === scenarioKey)!

  return (
    <VisualizerPageLayout
      category="Visualizer"
      title="Packet encapsulation"
      description={scenario.description}
      related={[
        { to: '/visualizers/osi-model-explorer', label: 'OSI model explorer' },
        { to: '/visualizers/tcp-ip-stack-explorer', label: 'TCP/IP stack explorer' },
      ]}
    >
      <div className="mb-6 flex flex-wrap gap-2">
        {SCENARIOS.map((s) => (
          <Pill key={s.key} active={scenarioKey === s.key} onClick={() => setScenarioKey(s.key)}>
            {s.label}
          </Pill>
        ))}
      </div>
      <EncapWalkthrough key={scenario.key} steps={scenario.steps} />
    </VisualizerPageLayout>
  )
}

function EncapWalkthrough({ steps }: { steps: EncapStep[] }) {
  const player = useStepPlayer(steps.length)
  const current = steps[player.step]!

  let content: ReactNode = <DataBox animate={player.canAutoPlay} label={current.payloadLabel} />
  for (const layer of current.layers) {
    content = (
      <NestBox
        key={layer.key}
        headerLabel={layer.headerLabel}
        headerTitle={layer.headerTitle}
        trailerLabel={layer.trailerLabel}
        trailerTitle={layer.trailerTitle}
        colors={tcpIpLayerColorClasses(layer.tcpIpLayerNumber)}
        animate={player.canAutoPlay}
      >
        {content}
      </NestBox>
    )
  }

  return (
    <div
      tabIndex={0}
      onKeyDown={player.onKeyDown}
      aria-label="Packet encapsulation visualizer. Use the Previous and Next buttons, or the left and right arrow keys, to step through."
      className="flex flex-col gap-8 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div>
        <p className="mb-2 text-center text-sm font-medium text-fg-muted">{current.unitName}</p>
        <div className="flex items-center justify-center overflow-x-auto rounded-lg border border-border bg-bg p-4">
          {content}
        </div>
      </div>

      <StepNarration steps={steps} currentIndex={player.step} />

      <StepControls player={player} totalSteps={steps.length} />
    </div>
  )
}

function NestBox({
  headerLabel,
  headerTitle,
  trailerLabel,
  trailerTitle,
  colors,
  animate,
  children,
}: {
  headerLabel: string
  headerTitle: string
  trailerLabel?: string
  trailerTitle?: string
  colors: LayerColorClasses
  animate: boolean
  children: ReactNode
}) {
  return (
    <div
      className={`flex items-stretch gap-1.5 rounded-md border bg-surface p-1.5 ${colors.borderStrong} ${animate ? 'animate-pn-fade-in' : ''}`}
    >
      <LabelChip label={headerLabel} title={headerTitle} colors={colors} />
      <div className="flex items-center">{children}</div>
      {trailerLabel && <LabelChip label={trailerLabel} title={trailerTitle} colors={colors} />}
    </div>
  )
}

function DataBox({ animate, label }: { animate: boolean; label: string }) {
  const colors = tcpIpLayerColorClasses(4)
  return (
    <div
      className={`flex min-w-[4.5rem] items-center justify-center rounded-sm px-3 py-4 text-center font-mono text-xs ${colors.activeBg} ${colors.activeText} ${animate ? 'animate-pn-fade-in' : ''}`}
    >
      {label}
    </div>
  )
}

function LabelChip({
  label,
  title,
  colors,
}: {
  label: string
  title?: string
  colors: LayerColorClasses
}) {
  return (
    <div
      className={`flex min-w-[2.25rem] items-center justify-center rounded-sm border px-1.5 py-2 text-center font-mono text-[10px] font-medium ${colors.borderMuted} ${colors.activeBg} ${colors.activeText}`}
      title={title}
    >
      {label}
    </div>
  )
}
