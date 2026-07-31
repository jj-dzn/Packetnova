import { VisualizerPageLayout } from './VisualizerPageLayout'
import { StepControls } from './StepControls'
import { useStepPlayer } from '../../hooks/useStepPlayer'

export interface SequenceStep {
  title: string
  description: string
  leftState: string
  rightState: string
  segment: { direction: 'right' | 'left'; label: string } | null
}

interface SequenceDiagramVisualizerProps {
  category: string
  title: string
  description: string
  leftLabel: string
  rightLabel: string
  steps: SequenceStep[]
}

// Shared "two parties exchange messages" visualizer: each message gets its
// own line that appears and stays (sequence-diagram style) as later ones
// are added below it, rather than a single line being overwritten each
// step. Backs the TCP/TLS handshakes, NAT flow, and VPN packet flow --
// anything that's fundamentally "party A and party B trade messages."
export function SequenceDiagramVisualizer({
  category,
  title,
  description,
  leftLabel,
  rightLabel,
  steps,
}: SequenceDiagramVisualizerProps) {
  const player = useStepPlayer(steps.length)
  const current = steps[player.step]!
  const isFinal = player.step === steps.length - 1

  return (
    <VisualizerPageLayout category={category} title={title} description={description}>
      <div
        tabIndex={0}
        onKeyDown={player.onKeyDown}
        aria-label={`${title} visualizer. Use the Previous and Next buttons, or the left and right arrow keys, to step through.`}
        className="flex flex-col gap-8 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <div className="grid grid-cols-2 gap-8">
          <HostBox label={leftLabel} state={current.leftState} highlight={isFinal} />
          <HostBox label={rightLabel} state={current.rightState} highlight={isFinal} />
        </div>

        <div className="mx-4 flex min-h-[2.5rem] flex-col gap-4">
          {steps.map((step, index) => {
            if (index === 0 || !step.segment || player.step < index) return null
            const { direction, label } = step.segment
            const arrow = direction === 'right' ? '→' : '←'
            return (
              <div key={index} className="relative h-9">
                <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
                <div
                  className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-accent/40 bg-bg px-3 py-1 font-mono text-xs text-accent ${
                    player.canAutoPlay
                      ? direction === 'right'
                        ? 'animate-pn-slide-right'
                        : 'animate-pn-slide-left'
                      : ''
                  }`}
                  style={
                    player.canAutoPlay ? undefined : { left: direction === 'right' ? '96%' : '4%' }
                  }
                >
                  {arrow} {label}
                </div>
              </div>
            )
          })}
        </div>

        <div aria-live="polite">
          <h2 className="font-medium">{current.title}</h2>
          <p className="mt-1 text-sm text-fg-muted">{current.description}</p>
        </div>

        <StepControls player={player} totalSteps={steps.length} />
      </div>
    </VisualizerPageLayout>
  )
}

function HostBox({
  label,
  state,
  highlight,
}: {
  label: string
  state: string
  highlight: boolean
}) {
  return (
    <div className="rounded-lg border border-border bg-bg p-4 text-center">
      <p className="text-sm font-medium">{label}</p>
      <p className={`mt-1 font-mono text-xs ${highlight ? 'text-success' : 'text-fg-muted'}`}>
        {state}
      </p>
    </div>
  )
}
