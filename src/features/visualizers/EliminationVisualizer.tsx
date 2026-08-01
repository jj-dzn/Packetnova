import { VisualizerPageLayout } from './VisualizerPageLayout'
import { StepControls } from './StepControls'
import { StepNarration } from './StepNarration'
import { useStepPlayer } from '../../hooks/useStepPlayer'
import { EliminationSteps, type Candidate, type EliminationStep } from './EliminationSteps'

export type { Candidate, EliminationStep }

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

  return (
    <VisualizerPageLayout category={category} title={title} description={description}>
      <div
        tabIndex={0}
        onKeyDown={player.onKeyDown}
        aria-label={`${title} visualizer. Use the Previous and Next buttons, or the left and right arrow keys, to step through.`}
        className="flex flex-col gap-8 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <EliminationSteps candidates={candidates} step={current} isFinal={isFinal} />

        <StepNarration steps={steps} currentIndex={player.step} />

        <StepControls player={player} totalSteps={steps.length} />
      </div>
    </VisualizerPageLayout>
  )
}
