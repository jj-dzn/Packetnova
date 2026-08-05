import { useState } from 'react'
import { VisualizerPageLayout } from './VisualizerPageLayout'
import { StepControls } from './StepControls'
import { StepNarration } from './StepNarration'
import { useStepPlayer } from '../../hooks/useStepPlayer'

export interface SequenceStep {
  title: string
  description: string
  leftState: string
  rightState: string
  segment: { direction: 'right' | 'left'; label: string; lost?: boolean } | null
  /** Round trips completed so far, at this step -- when set, rendered as a
   * live counter (e.g. for comparing TLS 1.2 vs. 1.3's RTT cost). Omit for
   * flows where round-trip count isn't a meaningful thing to track. */
  roundTripsSoFar?: number
}

interface SequenceDiagramContentProps {
  leftLabel: string
  rightLabel: string
  steps: SequenceStep[]
}

interface SequenceDiagramVisualizerProps extends SequenceDiagramContentProps {
  category: string
  title: string
  description: string
}

// A lost segment has an X mid-flight in Mermaid's own notation for exactly
// that ("-x" instead of "->>"), so the exported diagram still shows a
// dropped SYN or lost ACK, not just a clean happy-path sequence.
function buildMermaidSequence(
  leftLabel: string,
  rightLabel: string,
  steps: SequenceStep[],
): string {
  const lines = [
    'sequenceDiagram',
    `    participant A as ${leftLabel}`,
    `    participant B as ${rightLabel}`,
  ]
  for (const step of steps) {
    if (!step.segment) continue
    const { direction, label, lost } = step.segment
    const from = direction === 'right' ? 'A' : 'B'
    const to = direction === 'right' ? 'B' : 'A'
    lines.push(`    ${from}${lost ? '-x' : '->>'}${to}: ${label}`)
  }
  return lines.join('\n')
}

function CopyMermaidButton({ mermaid }: { mermaid: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(mermaid)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard API unavailable -- nothing to recover into.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-md border border-border px-2 py-1 text-xs font-medium text-fg-muted transition-colors hover:border-accent/40 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {copied ? 'Copied!' : 'Copy as Mermaid'}
    </button>
  )
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
  ...contentProps
}: SequenceDiagramVisualizerProps) {
  return (
    <VisualizerPageLayout category={category} title={title} description={description}>
      <SequenceDiagramContent {...contentProps} />
    </VisualizerPageLayout>
  )
}

// Split out so a page hosting multiple variants behind its own mode toggle
// (e.g. the VPN packet flow's tunnel-mode vs. transport-mode switch) can
// reuse this rendering without nesting a second VisualizerPageLayout card.
export function SequenceDiagramContent({
  leftLabel,
  rightLabel,
  steps,
}: SequenceDiagramContentProps) {
  const player = useStepPlayer(steps.length)
  const current = steps[player.step]!
  const isFinal = player.step === steps.length - 1

  return (
    <div
      tabIndex={0}
      onKeyDown={player.onKeyDown}
      aria-label={`${leftLabel} and ${rightLabel} sequence visualizer. Use the Previous and Next buttons, or the left and right arrow keys, to step through.`}
      className="flex flex-col gap-8 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div className="grid grid-cols-2 gap-8">
        <HostBox label={leftLabel} state={current.leftState} highlight={isFinal} />
        <HostBox label={rightLabel} state={current.rightState} highlight={isFinal} />
      </div>

      {current.roundTripsSoFar !== undefined && (
        <p className="text-center text-sm text-fg-muted">
          Round trips completed:{' '}
          <span className="font-mono font-semibold text-accent">{current.roundTripsSoFar}</span>
        </p>
      )}

      <div className="mx-4 flex min-h-[2.5rem] flex-col gap-4">
        {steps.map((step, index) => {
          if (index === 0 || !step.segment || player.step < index) return null
          const { direction, label, lost } = step.segment
          const arrow = direction === 'right' ? '→' : '←'
          return (
            <div key={index} className="relative h-9">
              <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
              <div
                className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border px-3 py-1 font-mono text-xs ${
                  lost
                    ? 'border-dashed border-danger/50 bg-bg text-danger'
                    : 'border-accent/40 bg-bg text-accent'
                } ${
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
                {lost ? '✕ ' : ''}
                {arrow} {label}
              </div>
            </div>
          )
        })}
      </div>

      <StepNarration steps={steps} currentIndex={player.step} />

      <div className="flex items-center justify-between gap-3">
        <StepControls player={player} totalSteps={steps.length} />
        <CopyMermaidButton mermaid={buildMermaidSequence(leftLabel, rightLabel, steps)} />
      </div>
    </div>
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
