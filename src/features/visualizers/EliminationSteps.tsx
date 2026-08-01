import { Badge } from '../../components/ui/Badge'

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

interface EliminationStepsProps {
  candidates: Candidate[]
  step: EliminationStep
  isFinal: boolean
}

// The "narrow a fixed set of candidates down to a winner" display -- split
// out of EliminationVisualizer so the same visual grammar works both for a
// fixed illustrative example (the routing-decision and BGP visualizers)
// and for BGP path comparison's guided mode, which drives the identical
// display from a visitor's own entered candidates instead.
export function EliminationSteps({ candidates, step, isFinal }: EliminationStepsProps) {
  const hasWinner = isFinal && step.remainingIds.length === 1

  return (
    <div className="flex flex-col gap-2">
      {candidates.map((candidate) => {
        const stillIn = step.remainingIds.includes(candidate.id)
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
  )
}
