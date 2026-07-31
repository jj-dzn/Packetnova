import { VisualizerPageLayout } from './VisualizerPageLayout'
import { StepControls } from './StepControls'
import { Badge } from '../../components/ui/Badge'
import { useStepPlayer } from '../../hooks/useStepPlayer'

export interface Candidate {
  id: string
  label: string
  detail: string
}

export interface EliminationStep {
  title: string
  description: string
  /** IDs of candidates still alive after this step. */
  remainingIds: string[]
}

interface EliminationVisualizerProps {
  category: string
  title: string
  description: string
  candidates: Candidate[]
  steps: EliminationStep[]
}

// Shared "narrow a fixed set of candidates down to a winner, one
// tie-breaker at a time" visualizer -- backs the routing decision and BGP
// best-path visualizers. Deliberately a short, narrated walkthrough of one
// illustrative example rather than a configurable calculator: the existing
// routing/BGP tools already let you plug in your own table and see an
// instant answer (BGP's tool even shows the full 11-step trace as a static
// table) -- this is the "watch it happen" teaching companion to that.
export function EliminationVisualizer({
  category,
  title,
  description,
  candidates,
  steps,
}: EliminationVisualizerProps) {
  const player = useStepPlayer(steps.length)
  const current = steps[player.step]!
  const isFinal = player.step === steps.length - 1
  const hasWinner = isFinal && current.remainingIds.length === 1

  return (
    <VisualizerPageLayout category={category} title={title} description={description}>
      <div
        tabIndex={0}
        onKeyDown={player.onKeyDown}
        aria-label={`${title} visualizer. Use the Previous and Next buttons, or the left and right arrow keys, to step through.`}
        className="flex flex-col gap-8 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <div className="flex flex-col gap-2">
          {candidates.map((candidate) => {
            const stillIn = current.remainingIds.includes(candidate.id)
            const isWinner = hasWinner && stillIn
            return (
              <div
                key={candidate.id}
                className={`flex flex-wrap items-center justify-between gap-2 rounded-md border px-4 py-2.5 text-sm transition-opacity ${
                  isWinner ? 'border-success/40 bg-success/10' : 'border-border bg-bg'
                } ${stillIn ? '' : 'opacity-40'}`}
              >
                <span className={`font-medium ${stillIn ? '' : 'line-through'}`}>
                  {candidate.label}
                </span>
                <span className="flex items-center gap-2">
                  <span className="font-mono text-xs text-fg-muted">{candidate.detail}</span>
                  {isWinner && <Badge tone="success">Winner</Badge>}
                </span>
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
