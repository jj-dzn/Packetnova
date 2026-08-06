import { useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { PingPetCreature, type PetStatus } from './PingPetCreature'
import { DuelResultCard } from './DuelResultCard'
import {
  classifyLatency,
  measureLatency,
  PING_TARGETS,
  type PingTarget,
} from '../../lib/labs/pingPet'

interface DuelSide {
  target: PingTarget
  status: PetStatus
  latencyMs: number | null
}

function createInitialSide(target: PingTarget): DuelSide {
  return { target, status: 'idle', latencyMs: null }
}

export function PingPetDuel() {
  const [left, setLeft] = useState<DuelSide>(() => createInitialSide(PING_TARGETS[0]!))
  const [right, setRight] = useState<DuelSide>(() =>
    createInitialSide(PING_TARGETS[1] ?? PING_TARGETS[0]!),
  )
  const [running, setRunning] = useState(false)
  const [winner, setWinner] = useState<'left' | 'right' | 'tie' | null>(null)

  async function startDuel() {
    setRunning(true)
    setWinner(null)
    setLeft((side) => ({ ...side, status: 'checking', latencyMs: null }))
    setRight((side) => ({ ...side, status: 'checking', latencyMs: null }))

    const [leftMs, rightMs] = await Promise.all([
      measureLatency(left.target.host),
      measureLatency(right.target.host),
    ])

    setLeft((side) => ({ ...side, status: classifyLatency(leftMs), latencyMs: leftMs }))
    setRight((side) => ({ ...side, status: classifyLatency(rightMs), latencyMs: rightMs }))
    setRunning(false)

    if (leftMs === null && rightMs === null) setWinner('tie')
    else if (leftMs === null) setWinner('right')
    else if (rightMs === null) setWinner('left')
    else if (leftMs === rightMs) setWinner('tie')
    else setWinner(leftMs < rightMs ? 'left' : 'right')
  }

  return (
    <div className="py-12">
      <div className="mb-8">
        <Badge tone="accent">Fun Labs</Badge>
        <h1 className="mt-3 text-2xl font-semibold">Ping pet duel</h1>
        <p className="mt-2 max-w-2xl text-fg-muted">
          Two pets, two hosts, one latency duel. Whichever round trip comes back faster wins.
        </p>
      </div>

      <Card className="flex flex-col gap-8 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <DuelPanel
            side={left}
            label="Player 1"
            isWinner={winner === 'left'}
            disabled={running}
            onPick={(target) => setLeft(createInitialSide(target))}
          />
          <DuelPanel
            side={right}
            label="Player 2"
            isWinner={winner === 'right'}
            disabled={running}
            onPick={(target) => setRight(createInitialSide(target))}
          />
        </div>

        {winner === 'tie' && <p className="text-center text-sm text-fg-muted">It's a tie!</p>}

        <div className="flex justify-center">
          <Button onClick={startDuel} disabled={running}>
            {running ? 'Dueling...' : 'Start duel'}
          </Button>
        </div>

        {winner && (
          <DuelResultCard
            leftLabel="Player 1"
            leftHost={left.target.host}
            leftMs={left.latencyMs}
            rightLabel="Player 2"
            rightHost={right.target.host}
            rightMs={right.latencyMs}
            winner={winner}
          />
        )}
      </Card>
    </div>
  )
}

function DuelPanel({
  side,
  label,
  isWinner,
  disabled,
  onPick,
}: {
  side: DuelSide
  label: string
  isWinner: boolean
  disabled: boolean
  onPick: (target: PingTarget) => void
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="text-xs font-medium text-fg-subtle">{label}</p>
      <PingPetCreature status={side.status} />
      {isWinner && <Badge tone="success">Winner!</Badge>}
      <p className="font-mono text-lg">
        {side.latencyMs === null ? '--' : `${Math.round(side.latencyMs)} ms`}
      </p>
      <p className="text-xs text-fg-subtle">{side.target.host}</p>
      <div className="flex flex-wrap justify-center gap-1.5">
        {PING_TARGETS.map((option) => (
          <button
            key={option.host}
            type="button"
            disabled={disabled}
            onClick={() => onPick(option)}
            className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 ${
              side.target.host === option.host
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-border text-fg-muted hover:text-fg'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
