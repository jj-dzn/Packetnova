import { useCallback, useEffect, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { DirectionPad, type PadDirection } from './DirectionPad'
import {
  DELTAS,
  generateMaze,
  isDeadEnd,
  type Direction,
  type MazeResult,
} from '../../lib/labs/maze404'

const PAD_TO_MAZE_DIRECTION: Record<PadDirection, Direction> = {
  up: 'north',
  down: 'south',
  left: 'west',
  right: 'east',
}

const MAZE_WIDTH = 9
const MAZE_HEIGHT = 9
const CELL_SIZE = 32
const SHORTCUT_DELAY_MS = 700

const KEY_DIRECTIONS: Record<string, Direction> = {
  ArrowUp: 'north',
  ArrowDown: 'south',
  ArrowLeft: 'west',
  ArrowRight: 'east',
  w: 'north',
  s: 'south',
  a: 'west',
  d: 'east',
}

export function Maze404() {
  const [maze, setMaze] = useState<MazeResult>(() => generateMaze(MAZE_WIDTH, MAZE_HEIGHT))
  const [position, setPosition] = useState(() => maze.start)

  const won = position.x === maze.exit.x && position.y === maze.exit.y
  const isOnShortcut =
    maze.shortcut !== null && position.x === maze.shortcut.x && position.y === maze.shortcut.y
  const message = won
    ? '200 OK -- you made it!'
    : isOnShortcut
      ? '304 -- cache hit! Shortcut taken.'
      : isDeadEnd(maze, position.x, position.y)
        ? '404 -- dead end.'
        : null

  function newGame() {
    const next = generateMaze(MAZE_WIDTH, MAZE_HEIGHT)
    setMaze(next)
    setPosition(next.start)
  }

  const move = useCallback(
    (direction: Direction) => {
      if (won) return
      setPosition((current) => {
        const cell = maze.cells[current.y]![current.x]!
        if (!cell.open[direction]) return current
        const { dx, dy } = DELTAS[direction]
        return { x: current.x + dx, y: current.y + dy }
      })
    },
    [maze, won],
  )

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const direction = KEY_DIRECTIONS[event.key]
      if (!direction) return
      event.preventDefault()
      move(direction)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [move])

  // The shortcut cell's only real side effect: after a short beat to let
  // the "cache hit" message register, teleport straight to the exit.
  useEffect(() => {
    if (!isOnShortcut || won) return
    const id = window.setTimeout(() => setPosition(maze.exit), SHORTCUT_DELAY_MS)
    return () => window.clearTimeout(id)
  }, [isOnShortcut, won, maze])

  return (
    <div className="py-12">
      <div className="mb-8">
        <Badge tone="accent">Labs</Badge>
        <h1 className="mt-3 text-2xl font-semibold">404 maze</h1>
        <p className="mt-2 max-w-2xl text-fg-muted">
          A minimalist maze where dead ends are fake HTTP errors and one lucky cell is a cached
          shortcut. Arrow keys or WASD to move, or use the on-screen controls on mobile.
        </p>
      </div>

      <Card className="flex flex-col items-center gap-4 py-8">
        <div
          className="relative border border-border"
          style={{ width: MAZE_WIDTH * CELL_SIZE, height: MAZE_HEIGHT * CELL_SIZE }}
        >
          {maze.cells.flatMap((row) =>
            row.map((cell) => (
              <div
                key={`${cell.x}-${cell.y}`}
                className="absolute border-border"
                style={{
                  left: cell.x * CELL_SIZE,
                  top: cell.y * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  borderRightWidth: cell.open.east ? 0 : 1,
                  borderBottomWidth: cell.open.south ? 0 : 1,
                  borderRightStyle: 'solid',
                  borderBottomStyle: 'solid',
                }}
              >
                {cell.x === maze.exit.x && cell.y === maze.exit.y && (
                  <span className="flex h-full w-full items-center justify-center text-[9px] text-success">
                    200
                  </span>
                )}
                {maze.shortcut && cell.x === maze.shortcut.x && cell.y === maze.shortcut.y && (
                  <span className="flex h-full w-full items-center justify-center text-[9px] text-accent">
                    304
                  </span>
                )}
              </div>
            )),
          )}
          <div
            className="absolute rounded-full bg-accent transition-all duration-150"
            style={{
              left: position.x * CELL_SIZE + CELL_SIZE * 0.25,
              top: position.y * CELL_SIZE + CELL_SIZE * 0.25,
              width: CELL_SIZE * 0.5,
              height: CELL_SIZE * 0.5,
            }}
          />
        </div>

        <p className={`h-5 text-sm font-mono ${won ? 'text-success' : 'text-fg-muted'}`}>
          {message ?? ' '}
        </p>

        <DirectionPad
          onPress={(direction) => move(PAD_TO_MAZE_DIRECTION[direction])}
          disabled={won}
        />

        <Button variant="secondary" onClick={newGame}>
          {won ? 'Play again' : 'New maze'}
        </Button>
      </Card>
    </div>
  )
}
