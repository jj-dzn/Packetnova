import { useEffect, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import {
  createInitialState,
  isOppositeDirection,
  stepSnake,
  type SnakeDirection,
  type SnakeState,
} from '../../lib/labs/packetSnake'

const GRID_WIDTH = 16
const GRID_HEIGHT = 16
const CELL_SIZE = 20
const TICK_MS = 130

const KEY_DIRECTIONS: Record<string, SnakeDirection> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
}

export function PacketSnake() {
  const [state, setState] = useState<SnakeState>(() => createInitialState(GRID_WIDTH, GRID_HEIGHT))

  useEffect(() => {
    const id = window.setInterval(() => {
      setState((current) => stepSnake(current, GRID_WIDTH, GRID_HEIGHT))
    }, TICK_MS)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const newDirection = KEY_DIRECTIONS[event.key]
      if (!newDirection) return
      event.preventDefault()
      setState((current) => {
        if (current.gameOver) return current
        if (isOppositeDirection(current.direction, newDirection)) return current
        return { ...current, direction: newDirection }
      })
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  function newGame() {
    setState(createInitialState(GRID_WIDTH, GRID_HEIGHT))
  }

  return (
    <div className="py-12">
      <div className="mb-8">
        <Badge tone="accent">Labs</Badge>
        <h1 className="mt-3 text-2xl font-semibold">Packet snake</h1>
        <p className="mt-2 max-w-2xl text-fg-muted">
          Classic Snake, reskinned as a data stream eating loose packets. Running into yourself ends
          the game as a routing loop. Arrow keys or WASD to steer.
        </p>
      </div>

      <Card className="flex flex-col items-center gap-4 py-8">
        <p className="font-mono text-sm text-fg-muted">Score: {state.score}</p>

        <div
          className="relative border border-border bg-bg"
          style={{ width: GRID_WIDTH * CELL_SIZE, height: GRID_HEIGHT * CELL_SIZE }}
        >
          {state.snake.map((segment, index) => (
            <div
              key={index}
              className={`absolute rounded-sm ${index === 0 ? 'bg-accent' : 'bg-accent/60'}`}
              style={{
                left: segment.x * CELL_SIZE,
                top: segment.y * CELL_SIZE,
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
              }}
            />
          ))}
          <div
            className="absolute rounded-full bg-success"
            style={{
              left: state.food.x * CELL_SIZE,
              top: state.food.y * CELL_SIZE,
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
            }}
          />

          {state.gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-bg/90 text-center">
              <p className="font-mono text-sm text-danger">Game over -- routing loop detected.</p>
              <Button variant="secondary" onClick={newGame}>
                Play again
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
