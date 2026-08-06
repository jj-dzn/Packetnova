import { useEffect, useState, type ReactNode } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { StructuredData } from '../../components/seo/StructuredData'
import { useBreadcrumbSchema } from '../../lib/seo/useBreadcrumbSchema'
import { countWrongTurns, formatElapsedTime } from '../../lib/scenarios/branchingScoring'
import { reportMascotMood } from '../../lib/mascotMood'
import { ScenarioEmbedContext } from './ScenarioEmbedContext'
import { ChallengeResultCard } from './ChallengeResultCard'

export interface BranchingScenarioNode {
  id: string
  title: string
  narration: ReactNode
  /** An embedded real tool/visualizer, rendered in its own card below the
   * narration -- same convention as a linear ScenarioStage's children. */
  content?: ReactNode
  /** Present on a decision node; absent everywhere else (a wrong turn or
   * the resolution are both dead ends with no further choices). */
  choices?: { label: string; to: string }[]
  /** Absent on an ordinary node. 'wrong-turn' is a dead end with its own
   * explanation and a way back; 'resolution' ends the scenario. */
  outcome?: 'wrong-turn' | 'resolution'
}

interface BranchingScenarioProps {
  category: string
  title: string
  setup: ReactNode
  nodes: Record<string, BranchingScenarioNode>
  rootId: string
}

const TICK_MS = 1000

// The branching counterpart to ScenarioPageLayout's linear ScenarioStage
// sequence -- instead of a fixed list of stages read top to bottom, this
// walks a tree keyed by node id. Navigation (`currentId`/`previousId`) and
// scoring (`visitLog`) are deliberately separate: "back" only ever needs to
// return to the one decision node a wrong turn came from (every wrong turn
// in this engine is a direct, choice-less dead end -- never more than one
// hop deep), but the wrong-turn count has to survive that "back" action
// rather than being erased by it, so it's tracked in an append-only log
// instead of derived from wherever navigation currently is.
export function BranchingScenario({
  category,
  title,
  setup,
  nodes,
  rootId,
}: BranchingScenarioProps) {
  const breadcrumbSchema = useBreadcrumbSchema('Scenarios', '/scenarios', title)
  const [currentId, setCurrentId] = useState(rootId)
  const [previousId, setPreviousId] = useState<string | null>(null)
  const [visitLog, setVisitLog] = useState<string[]>([rootId])
  const [challengeActive, setChallengeActive] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedMs, setElapsedMs] = useState(0)

  const node = nodes[currentId]!
  const wrongTurns = countWrongTurns(visitLog, nodes)
  const isResolved = node.outcome === 'resolution'
  const isWrongTurn = node.outcome === 'wrong-turn'
  const isAtStart = currentId === rootId && previousId === null

  useEffect(() => {
    if (!challengeActive || isResolved || startTime === null) return
    const interval = setInterval(() => setElapsedMs(Date.now() - startTime), TICK_MS)
    return () => clearInterval(interval)
  }, [challengeActive, isResolved, startTime])

  // A clean challenge clear (zero wrong turns) is a real achievement the
  // engine already computes -- worth a "fast" mascot reaction, distinct
  // from just finishing with a mistake or two along the way.
  useEffect(() => {
    if (challengeActive && isResolved) {
      reportMascotMood(wrongTurns === 0 ? 'fast' : 'medium')
    }
  }, [challengeActive, isResolved, wrongTurns])

  function startChallenge() {
    setChallengeActive(true)
    setStartTime(Date.now())
    setElapsedMs(0)
  }

  function choose(to: string) {
    setPreviousId(currentId)
    setCurrentId(to)
    setVisitLog((log) => [...log, to])
  }

  function goBack() {
    if (previousId === null) return
    setCurrentId(previousId)
    setPreviousId(null)
  }

  function restart() {
    setCurrentId(rootId)
    setPreviousId(null)
    setVisitLog([rootId])
    setChallengeActive(false)
    setStartTime(null)
    setElapsedMs(0)
  }

  return (
    <div className="py-12">
      <StructuredData data={breadcrumbSchema} />
      <div className="mb-8 max-w-2xl">
        <Badge tone="accent">{category}</Badge>
        <h1 className="mt-3 text-2xl font-semibold">{title}</h1>
        <div className="mt-3 flex flex-col gap-3 text-fg-muted">{setup}</div>
      </div>

      {!challengeActive && isAtStart && (
        <div className="mb-8 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface p-4">
          <p className="flex-1 text-sm text-fg-muted">
            Some choices below are wrong turns, each with its own explanation, not a straight
            read-through. Start a timed challenge to track wrong turns and get a shareable result,
            or just explore -- no timer, no scoring.
          </p>
          <Button onClick={startChallenge}>Start timed challenge</Button>
        </div>
      )}

      {challengeActive && !isResolved && (
        <div className="mb-6 flex items-center gap-4 rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 text-sm">
          <span className="font-mono text-accent">{formatElapsedTime(elapsedMs)}</span>
          <span className="text-fg-muted">
            {wrongTurns} wrong turn{wrongTurns === 1 ? '' : 's'} so far
          </span>
        </div>
      )}

      <div className="flex flex-col gap-5">
        <div
          className={`rounded-lg border p-6 ${
            isWrongTurn
              ? 'border-danger/40 bg-danger/5'
              : isResolved
                ? 'border-success/40 bg-success/5'
                : 'border-border bg-surface'
          }`}
        >
          {isWrongTurn && <Badge tone="danger">Wrong turn</Badge>}
          {isResolved && <Badge tone="success">Resolved</Badge>}
          <h2 className={`font-semibold ${isWrongTurn || isResolved ? 'mt-2' : ''} text-lg`}>
            {node.title}
          </h2>
          <div className="mt-2 flex flex-col gap-2 text-sm text-fg-muted">{node.narration}</div>

          {isWrongTurn && (
            <Button variant="secondary" className="mt-4" onClick={goBack}>
              Back to try again
            </Button>
          )}
        </div>

        {node.content && (
          <ScenarioEmbedContext.Provider value={true}>
            <div className="rounded-lg border border-border bg-surface/50 p-4 sm:p-6">
              {node.content}
            </div>
          </ScenarioEmbedContext.Provider>
        )}

        {node.choices && (
          <div className="flex flex-col gap-2">
            {node.choices.map((choice) => (
              <button
                key={choice.to}
                type="button"
                onClick={() => choose(choice.to)}
                className="rounded-lg border border-border bg-surface p-4 text-left text-sm font-medium transition-colors hover:border-accent/40"
              >
                {choice.label}
              </button>
            ))}
          </div>
        )}

        {isResolved && (
          <div className="flex flex-col gap-4">
            <Button variant="secondary" onClick={restart} className="self-start">
              Try again from the start
            </Button>
            {challengeActive && (
              <ChallengeResultCard
                scenarioTitle={title}
                elapsedMs={elapsedMs}
                wrongTurns={wrongTurns}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
