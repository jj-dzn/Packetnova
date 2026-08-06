import { Button } from '../../components/ui/Button'
import type { StepPlayer } from '../../hooks/useStepPlayer'

interface StepControlsProps {
  player: StepPlayer
  totalSteps: number
}

export function StepControls({ player, totalSteps }: StepControlsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={player.previous} disabled={player.isFirst}>
            Previous
          </Button>
          {player.canAutoPlay && (
            <Button variant="secondary" onClick={player.togglePlay}>
              {player.isPlaying ? 'Pause' : 'Play'}
            </Button>
          )}
          <Button variant="secondary" onClick={player.next} disabled={player.isLast}>
            Next
          </Button>
          <Button variant="secondary" onClick={player.reset}>
            Reset
          </Button>
        </div>
        <p className="text-sm text-fg-muted">
          Step {player.step + 1} of {totalSteps}
        </p>
      </div>
      {totalSteps > 1 && (
        <input
          type="range"
          aria-label="Seek to step, drag to jump to any step directly"
          min={0}
          max={totalSteps - 1}
          step={1}
          value={player.step}
          onChange={(event) => player.goTo(Number(event.target.value))}
          className="w-full accent-accent"
        />
      )}
    </div>
  )
}
