import { VisualizerPageLayout } from './VisualizerPageLayout'
import { StepControls } from './StepControls'
import { useStepPlayer } from '../../hooks/useStepPlayer'

export interface MiddleboxHop {
  direction: 'right' | 'left'
  /** Which of the two segments this hop travels: left<->middle, or middle<->right. */
  segment: 'left-middle' | 'middle-right'
  label: string
}

export interface MiddleboxStep {
  title: string
  description: string
  middleValue: string | null
  hop: MiddleboxHop | null
}

interface MiddleboxFlowContentProps {
  leftLabel: string
  leftValue: string
  middleLabel: string
  middleIdleValue: string
  rightLabel: string
  rightValue: string
  steps: MiddleboxStep[]
}

interface MiddleboxFlowVisualizerProps extends MiddleboxFlowContentProps {
  category: string
  title: string
  description: string
}

// Shared "client <-> middlebox <-> destination" visualizer for flows where a
// device in the middle rewrites or wraps each packet (NAT translation, VPN
// encapsulation) -- the two-party SequenceDiagramVisualizer can't represent
// the rewrite itself, since there's a third participant doing the work.
export function MiddleboxFlowVisualizer({
  category,
  title,
  description,
  ...contentProps
}: MiddleboxFlowVisualizerProps) {
  return (
    <VisualizerPageLayout category={category} title={title} description={description}>
      <MiddleboxFlowContent {...contentProps} />
    </VisualizerPageLayout>
  )
}

// Split out from MiddleboxFlowVisualizer so a page that needs its own
// wrapper around multiple flow variants (e.g. the NAT visualizer's static
// vs. PAT mode toggle) can reuse the step-flow rendering without nesting a
// second VisualizerPageLayout card inside the first.
export function MiddleboxFlowContent({
  leftLabel,
  leftValue,
  middleLabel,
  middleIdleValue,
  rightLabel,
  rightValue,
  steps,
}: MiddleboxFlowContentProps) {
  const player = useStepPlayer(steps.length)
  const current = steps[player.step]!
  const isFinal = player.step === steps.length - 1

  return (
    <div
      tabIndex={0}
      onKeyDown={player.onKeyDown}
      aria-label={`${leftLabel} to ${rightLabel} flow visualizer. Use the Previous and Next buttons, or the left and right arrow keys, to step through.`}
      className="flex flex-col gap-8 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div className="grid grid-cols-3 gap-4">
        <Box label={leftLabel} value={leftValue} highlight={false} />
        <Box label={middleLabel} value={current.middleValue ?? middleIdleValue} highlight={false} />
        <Box label={rightLabel} value={rightValue} highlight={isFinal} />
      </div>

      <div className="mx-2 flex min-h-[2.5rem] flex-col gap-4">
        {steps.map((step, index) => {
          if (index === 0 || !step.hop || player.step < index) return null
          const { direction, segment, label } = step.hop
          const arrow = direction === 'right' ? '→' : '←'
          // Left<->middle spans the left two-thirds; middle<->right spans
          // the right two-thirds -- each hop's 0%/100% animation range is
          // scoped to just its own segment via this nested positioned box,
          // not the full three-box width.
          const spanClass = segment === 'left-middle' ? 'left-0 w-2/3' : 'right-0 w-2/3'
          return (
            <div key={index} className="relative h-9">
              <div className={`absolute inset-y-0 ${spanClass}`}>
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
  )
}

function Box({ label, value, highlight }: { label: string; value: string; highlight: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-bg p-4 text-center">
      <p className="text-sm font-medium">{label}</p>
      <p className={`mt-1 font-mono text-xs ${highlight ? 'text-success' : 'text-fg-muted'}`}>
        {value}
      </p>
    </div>
  )
}
