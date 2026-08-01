import type { ReactNode } from 'react'
import { VisualizerPageLayout } from './VisualizerPageLayout'
import { StepControls } from './StepControls'
import { useStepPlayer } from '../../hooks/useStepPlayer'

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
}

// Ordered innermost-first (closest to the data) so each visible wrapper can
// be folded around the accumulated content in one pass, ending with
// Ethernet as the outermost box -- matching how encapsulation actually
// nests: each layer's header (and, for Ethernet, trailer) physically wraps
// everything added before it, not just appends alongside it.
const WRAPPERS: Wrapper[] = [
  { key: 'tcp', headerLabel: 'TCP', headerTitle: 'TCP header', revealStep: 1 },
  { key: 'ip', headerLabel: 'IP', headerTitle: 'IP header', revealStep: 2 },
  {
    key: 'eth',
    headerLabel: 'ETH',
    headerTitle: 'Ethernet header',
    trailerLabel: 'FCS',
    trailerTitle: 'Ethernet trailer (FCS)',
    revealStep: 3,
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
  animate,
  children,
}: {
  headerLabel: string
  headerTitle: string
  trailerLabel?: string
  trailerTitle?: string
  animate: boolean
  children: ReactNode
}) {
  return (
    <div
      className={`flex items-stretch gap-1.5 rounded-md border border-accent/40 bg-surface p-1.5 ${animate ? 'animate-pn-fade-in' : ''}`}
    >
      <LabelChip label={headerLabel} title={headerTitle} />
      <div className="flex items-center">{children}</div>
      {trailerLabel && <LabelChip label={trailerLabel} title={trailerTitle} />}
    </div>
  )
}

function DataBox({ animate }: { animate: boolean }) {
  return (
    <div
      className={`flex min-w-[4.5rem] items-center justify-center rounded-sm bg-accent/15 px-3 py-4 text-center font-mono text-xs text-accent ${animate ? 'animate-pn-fade-in' : ''}`}
    >
      Data
    </div>
  )
}

function LabelChip({ label, title }: { label: string; title?: string }) {
  return (
    <div
      className="flex min-w-[2.25rem] items-center justify-center rounded-sm border border-accent/30 bg-accent/10 px-1.5 py-2 text-center font-mono text-[10px] font-medium text-accent"
      title={title}
    >
      {label}
    </div>
  )
}
