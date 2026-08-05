import { Button } from '../../components/ui/Button'
import { StepControls } from './StepControls'
import { useStepPlayer, type StepPlayer } from '../../hooks/useStepPlayer'
import type { SequenceStep } from './SequenceDiagramVisualizer'

// Two independent useStepPlayer instances, started together -- each ticks
// on its own fixed-interval timer (see useStepPlayer), so starting both at
// the same moment is enough to show the real difference this whole page
// exists to make concrete: one side reaching "done" in fewer ticks than
// the other, with no synchronization logic needed beyond "press both play
// buttons at once."
function usePairedPlayback(leftSteps: number, rightSteps: number) {
  const left = useStepPlayer(leftSteps)
  const right = useStepPlayer(rightSteps)

  function playBoth() {
    if (!left.isPlaying) left.togglePlay()
    if (!right.isPlaying) right.togglePlay()
  }
  function resetBoth() {
    left.reset()
    right.reset()
  }

  return { left, right, playBoth, resetBoth }
}

function PlaybackControls({
  canAutoPlay,
  onPlayBoth,
  onResetBoth,
}: {
  canAutoPlay: boolean
  onPlayBoth: () => void
  onResetBoth: () => void
}) {
  return (
    <div className="flex justify-center gap-2">
      {canAutoPlay && <Button onClick={onPlayBoth}>&#9654; Play both side by side</Button>}
      <Button variant="secondary" onClick={onResetBoth}>
        Reset both
      </Button>
    </div>
  )
}

export interface ComparisonSequenceSide {
  label: string
  sublabel?: string
  steps: SequenceStep[]
}

function SequenceColumn({ side, player }: { side: ComparisonSequenceSide; player: StepPlayer }) {
  const current = side.steps[player.step]!

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-bg p-4">
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <h3 className="font-semibold">{side.label}</h3>
          {side.sublabel && <p className="text-xs text-fg-subtle">{side.sublabel}</p>}
        </div>
        {current.roundTripsSoFar !== undefined && (
          <span className="shrink-0 font-mono text-xs text-accent">
            {current.roundTripsSoFar} RTT
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        {side.steps.map((step, index) => {
          if (index === 0 || !step.segment) return null
          const reached = player.step >= index
          const isCurrent = player.step === index
          return (
            <div
              key={index}
              className={`rounded-md border px-2.5 py-1.5 font-mono text-xs transition-colors ${
                isCurrent
                  ? 'border-accent bg-accent/10 text-fg'
                  : reached
                    ? 'border-border text-fg-muted'
                    : 'border-border/40 text-fg-subtle opacity-40'
              }`}
            >
              {step.segment.direction === 'right' ? '→' : '←'} {step.segment.label}
            </div>
          )
        })}
      </div>
      <p className="min-h-8 text-xs text-fg-muted">{current.description}</p>
      <StepControls player={player} totalSteps={side.steps.length} />
    </div>
  )
}

// Side-by-side "message exchange" comparison -- reuses the exact
// SequenceStep data each protocol's own standalone visualizer already
// authored (e.g. TLS_12_STEPS/TLS_13_STEPS), just rendered two at once
// with a synchronized start instead of one at a time behind a toggle.
export function ProtocolComparisonSequence({
  left,
  right,
}: {
  left: ComparisonSequenceSide
  right: ComparisonSequenceSide
}) {
  const {
    left: leftPlayer,
    right: rightPlayer,
    playBoth,
    resetBoth,
  } = usePairedPlayback(left.steps.length, right.steps.length)

  return (
    <div className="flex flex-col gap-4">
      <PlaybackControls
        canAutoPlay={leftPlayer.canAutoPlay}
        onPlayBoth={playBoth}
        onResetBoth={resetBoth}
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SequenceColumn side={left} player={leftPlayer} />
        <SequenceColumn side={right} player={rightPlayer} />
      </div>
    </div>
  )
}

export interface StateTimelineStep {
  time: string
  state: string
  description: string
}

export interface ComparisonTimelineSide {
  label: string
  sublabel?: string
  steps: StateTimelineStep[]
}

function TimelineColumn({ side, player }: { side: ComparisonTimelineSide; player: StepPlayer }) {
  const current = side.steps[player.step]!

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-bg p-4">
      <div>
        <h3 className="font-semibold">{side.label}</h3>
        {side.sublabel && <p className="text-xs text-fg-subtle">{side.sublabel}</p>}
      </div>
      <div className="flex items-center justify-between rounded-md border border-accent/40 bg-accent/10 px-3 py-2">
        <span className="font-mono text-sm font-semibold text-accent">{current.state}</span>
        <span className="font-mono text-xs text-accent">t = {current.time}</span>
      </div>
      <p className="min-h-8 text-xs text-fg-muted">{current.description}</p>
      <div className="flex gap-1">
        {side.steps.map((step, index) => (
          <div
            key={index}
            title={`${step.time}: ${step.state}`}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              player.step >= index ? 'bg-accent' : 'bg-border'
            }`}
          />
        ))}
      </div>
      <StepControls player={player} totalSteps={side.steps.length} />
    </div>
  )
}

// Side-by-side "state over time" comparison -- for protocols that aren't
// two parties exchanging messages so much as one thing transitioning
// through states at its own pace (e.g. a switch port's STP vs. RSTP
// state machine). Same paired-playback mechanic as the sequence version.
export function ProtocolComparisonTimeline({
  left,
  right,
}: {
  left: ComparisonTimelineSide
  right: ComparisonTimelineSide
}) {
  const {
    left: leftPlayer,
    right: rightPlayer,
    playBoth,
    resetBoth,
  } = usePairedPlayback(left.steps.length, right.steps.length)

  return (
    <div className="flex flex-col gap-4">
      <PlaybackControls
        canAutoPlay={leftPlayer.canAutoPlay}
        onPlayBoth={playBoth}
        onResetBoth={resetBoth}
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TimelineColumn side={left} player={leftPlayer} />
        <TimelineColumn side={right} player={rightPlayer} />
      </div>
    </div>
  )
}
