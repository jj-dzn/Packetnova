import type { ReactNode } from 'react'
import { VisualizerPageLayout } from './VisualizerPageLayout'
import { StepControls } from './StepControls'
import { useStepPlayer } from '../../hooks/useStepPlayer'
import {
  tcpIpLayerColorClasses,
  type LayerColorClasses,
} from '../../content/reference/networkStackLayers'

// TCP/IP layer numbers (Application=4 ... Network Access=1), reused here so
// the same accent/accent-alt checkerboard from the OSI and TCP/IP stack
// explorers applies to these layers too: Data is the application-layer
// payload, TCP is transport, IP is internet, Ethernet is network access.
const DATA_LAYER_NUMBER = 4
const TCP_LAYER_NUMBER = 3
const IP_LAYER_NUMBER = 2
const ETH_LAYER_NUMBER = 1

interface EncapStep {
  title: string
  description: string
  unitName: string
}

const STEPS: EncapStep[] = [
  {
    title: 'Application data',
    description: 'The application generates data to send -- for example, an HTTP request.',
    unitName: 'Data',
  },
  {
    title: '1. Transport layer adds a TCP header',
    description:
      'TCP adds a header with source/destination ports and sequence numbers. Data + TCP header is now called a segment.',
    unitName: 'Segment',
  },
  {
    title: '2. Network layer adds an IP header',
    description:
      'IP adds a header with source/destination IP addresses. Segment + IP header is now called a packet.',
    unitName: 'Packet',
  },
  {
    title: '3. Link layer adds an Ethernet header and trailer',
    description:
      'Ethernet adds a header with source/destination MAC addresses, plus a trailer (FCS) for error checking. Packet + Ethernet header/trailer is now called a frame -- ready to go on the wire.',
    unitName: 'Frame',
  },
]

interface Wrapper {
  key: string
  headerLabel: string
  headerTitle: string
  trailerLabel?: string
  trailerTitle?: string
  revealStep: number
  tcpIpLayerNumber: number
}

// Ordered innermost-first (closest to the data) so each visible wrapper can
// be folded around the accumulated content in one pass, ending with
// Ethernet as the outermost box -- matching how encapsulation actually
// nests: each layer's header (and, for Ethernet, trailer) physically wraps
// everything added before it, not just appends alongside it.
const WRAPPERS: Wrapper[] = [
  {
    key: 'tcp',
    headerLabel: 'TCP',
    headerTitle: 'TCP header',
    revealStep: 1,
    tcpIpLayerNumber: TCP_LAYER_NUMBER,
  },
  {
    key: 'ip',
    headerLabel: 'IP',
    headerTitle: 'IP header',
    revealStep: 2,
    tcpIpLayerNumber: IP_LAYER_NUMBER,
  },
  {
    key: 'eth',
    headerLabel: 'ETH',
    headerTitle: 'Ethernet header',
    trailerLabel: 'FCS',
    trailerTitle: 'Ethernet trailer (FCS)',
    revealStep: 3,
    tcpIpLayerNumber: ETH_LAYER_NUMBER,
  },
]

export function PacketEncapsulationVisualizer() {
  const player = useStepPlayer(STEPS.length)
  const current = STEPS[player.step]!

  let content: ReactNode = <DataBox animate={player.canAutoPlay} />
  for (const wrapper of WRAPPERS) {
    if (player.step >= wrapper.revealStep) {
      content = (
        <NestBox
          key={wrapper.key}
          headerLabel={wrapper.headerLabel}
          headerTitle={wrapper.headerTitle}
          trailerLabel={wrapper.trailerLabel}
          trailerTitle={wrapper.trailerTitle}
          colors={tcpIpLayerColorClasses(wrapper.tcpIpLayerNumber)}
          animate={player.canAutoPlay}
        >
          {content}
        </NestBox>
      )
    }
  }

  return (
    <VisualizerPageLayout
      category="Visualizer"
      title="Packet encapsulation"
      description="Follow a packet as it's wrapped from application data down to frames."
    >
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

        <div aria-live="polite">
          <h2 className="font-medium">{current.title}</h2>
          <p className="mt-1 text-sm text-fg-muted">{current.description}</p>
        </div>

        <StepControls player={player} totalSteps={STEPS.length} />
      </div>
    </VisualizerPageLayout>
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

function DataBox({ animate }: { animate: boolean }) {
  const colors = tcpIpLayerColorClasses(DATA_LAYER_NUMBER)
  return (
    <div
      className={`flex min-w-[4.5rem] items-center justify-center rounded-sm px-3 py-4 text-center font-mono text-xs ${colors.activeBg} ${colors.activeText} ${animate ? 'animate-pn-fade-in' : ''}`}
    >
      Data
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
