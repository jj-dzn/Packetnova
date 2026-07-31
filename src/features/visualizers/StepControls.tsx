import { Button } from '../../components/ui/Button'
import type { StepPlayer } from '../../hooks/useStepPlayer'

interface StepControlsProps {
  player: StepPlayer
  totalSteps: number
}

export function StepControls({ player, totalSteps }: StepControlsProps) {
  return (
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
  )
}
