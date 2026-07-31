import { useEffect, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import {
  changeLane,
  createInitialRunnerState,
  stepRunner,
  type ObstacleType,
  type RunnerState,
} from '../../lib/labs/packetRunner'

const TRACK_WIDTH_PX = 520
const LANE_HEIGHT_PX = 44
const PLAYER_X_UNITS = 10
const TICK_MS = 60

const OBSTACLE_COLOR: Record<ObstacleType, string> = {
  firewall: 'bg-danger',
  congestion: 'bg-warning',
  router: 'bg-success',
}

function unitsToPx(units: number): number {
  return (units / 100) * TRACK_WIDTH_PX
}

export function PacketRunner() {
  const [state, setState] = useState<RunnerState>(() => createInitialRunnerState())

  useEffect(() => {
    const id = window.setInterval(() => {
      setState((current) => stepRunner(current))
    }, TICK_MS)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowUp' || event.key === 'w') {
        event.preventDefault()
        setState((current) => changeLane(current, -1))
      } else if (event.key === 'ArrowDown' || event.key === 's') {
        event.preventDefault()
        setState((current) => changeLane(current, 1))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  function newGame() {
    setState(createInitialRunnerState())
  }

  return (
    <div className="py-12">
      <div className="mb-8">
        <Badge tone="accent">Labs</Badge>
        <h1 className="mt-3 text-2xl font-semibold">Packet runner</h1>
        <p className="mt-2 max-w-2xl text-fg-muted">
          Guide a packet through routers, firewalls, and congestion zones. Firewalls end the run,
          congestion costs points, routers are worth a bonus. Up/down or W/S to switch lanes.
        </p>
      </div>

      <Card className="flex flex-col items-center gap-4 py-8">
        <p className="font-mono text-sm text-fg-muted">Score: {state.score}</p>

        <div
          className="relative overflow-hidden border border-border bg-bg"
          style={{ width: TRACK_WIDTH_PX, height: LANE_HEIGHT_PX * 3 }}
        >
          {[0, 1, 2].map((lane) => (
            <div
              key={lane}
              className="absolute w-full border-t border-border/50"
              style={{ top: lane * LANE_HEIGHT_PX }}
            />
          ))}

          <div
            className="absolute rounded-full bg-accent shadow-[0_0_12px_-2px_var(--color-accent)] transition-[top] duration-100"
            style={{
              left: unitsToPx(PLAYER_X_UNITS) - 10,
              top: state.lane * LANE_HEIGHT_PX + LANE_HEIGHT_PX / 2 - 10,
              width: 20,
              height: 20,
            }}
          />

          {state.obstacles.map((obstacle) => (
            <div
              key={obstacle.id}
              className={`absolute rounded-sm ${OBSTACLE_COLOR[obstacle.type]}`}
              style={{
                left: unitsToPx(obstacle.x) - 12,
                top: obstacle.lane * LANE_HEIGHT_PX + LANE_HEIGHT_PX / 2 - 12,
                width: 24,
                height: 24,
              }}
            />
          ))}

          {state.gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-bg/90 text-center">
              <p className="font-mono text-sm text-danger">Blocked by a firewall.</p>
              <p className="font-mono text-xs text-fg-muted">Score: {state.score}</p>
              <Button variant="secondary" onClick={newGame}>
                Try again
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-3 text-xs text-fg-subtle">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-success" /> Router (+5)
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-warning" /> Congestion (-2)
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-danger" /> Firewall (game over)
          </span>
        </div>
      </Card>
    </div>
  )
}
