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

interface LayerBox {
  key: string
  label: string
  revealStep: number
}

const LAYER_ORDER: LayerBox[] = [
  { key: 'eth-header', label: 'Ethernet header', revealStep: 3 },
  { key: 'ip', label: 'IP header', revealStep: 2 },
  { key: 'tcp', label: 'TCP header', revealStep: 1 },
  { key: 'data', label: 'Data', revealStep: 0 },
]

const TRAILER: LayerBox = { key: 'eth-trailer', label: 'Ethernet trailer (FCS)', revealStep: 3 }

export function PacketEncapsulationVisualizer() {
  const player = useStepPlayer(STEPS.length)
  const current = STEPS[player.step]!

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
          <div className="flex flex-wrap items-stretch justify-center gap-1 rounded-lg border border-border bg-bg p-4">
            {LAYER_ORDER.filter((layer) => player.step >= layer.revealStep).map((layer) => (
              <LayerChip key={layer.key} label={layer.label} animate={player.canAutoPlay} />
            ))}
            {player.step >= TRAILER.revealStep && (
              <LayerChip key={TRAILER.key} label={TRAILER.label} animate={player.canAutoPlay} />
            )}
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

function LayerChip({ label, animate }: { label: string; animate: boolean }) {
  return (
    <div
      className={`flex min-w-[6.5rem] items-center justify-center rounded-md border border-accent/40 bg-surface px-3 py-4 text-center font-mono text-xs text-accent ${animate ? 'animate-pn-fade-in' : ''}`}
    >
      {label}
    </div>
  )
}
