export type Direction = 'north' | 'south' | 'east' | 'west'

export interface Cell {
  x: number
  y: number
  open: Record<Direction, boolean>
}

export interface MazeResult {
  width: number
  height: number
  cells: Cell[][]
  start: { x: number; y: number }
  exit: { x: number; y: number }
  shortcut: { x: number; y: number } | null
}

export const DIRECTIONS: Direction[] = ['north', 'south', 'east', 'west']

export const OPPOSITE: Record<Direction, Direction> = {
  north: 'south',
  south: 'north',
  east: 'west',
  west: 'east',
}

export const DELTAS: Record<Direction, { dx: number; dy: number }> = {
  north: { dx: 0, dy: -1 },
  south: { dx: 0, dy: 1 },
  east: { dx: 1, dy: 0 },
  west: { dx: -1, dy: 0 },
}

function createCell(x: number, y: number): Cell {
  return { x, y, open: { north: false, south: false, east: false, west: false } }
}

function shuffled<T>(pool: T[]): T[] {
  const copy = [...pool]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j]!, copy[i]!]
  }
  return copy
}

// Recursive-backtracker carving -- guarantees a "perfect" maze: every cell
// reachable from the start, exactly one path between any two cells, no
// loops or isolated pockets.
export function generateMaze(width: number, height: number): MazeResult {
  const grid: Cell[][] = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => createCell(x, y)),
  )
  const key = (x: number, y: number) => `${x},${y}`
  const visited = new Set<string>([key(0, 0)])
  const stack: Cell[] = [grid[0]![0]!]

  while (stack.length > 0) {
    const current = stack[stack.length - 1]!
    const candidate = shuffled(DIRECTIONS)
      .map((direction) => {
        const { dx, dy } = DELTAS[direction]
        const nx = current.x + dx
        const ny = current.y + dy
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) return null
        if (visited.has(key(nx, ny))) return null
        return { direction, neighbor: grid[ny]![nx]! }
      })
      .find((entry) => entry !== null)

    if (!candidate) {
      stack.pop()
      continue
    }

    const { direction, neighbor } = candidate
    current.open[direction] = true
    neighbor.open[OPPOSITE[direction]] = true
    visited.add(key(neighbor.x, neighbor.y))
    stack.push(neighbor)
  }

  const start = { x: 0, y: 0 }
  const exit = { x: width - 1, y: height - 1 }

  const deadEnds: Cell[] = []
  for (const row of grid) {
    for (const cell of row) {
      const openCount = DIRECTIONS.filter((d) => cell.open[d]).length
      const isEndpoint =
        (cell.x === start.x && cell.y === start.y) || (cell.x === exit.x && cell.y === exit.y)
      if (openCount === 1 && !isEndpoint) deadEnds.push(cell)
    }
  }
  const shortcutCell =
    deadEnds.length > 0 ? deadEnds[Math.floor(Math.random() * deadEnds.length)]! : null

  return {
    width,
    height,
    cells: grid,
    start,
    exit,
    shortcut: shortcutCell ? { x: shortcutCell.x, y: shortcutCell.y } : null,
  }
}

export function isDeadEnd(maze: MazeResult, x: number, y: number): boolean {
  const cell = maze.cells[y]?.[x]
  if (!cell) return false
  const openCount = DIRECTIONS.filter((d) => cell.open[d]).length
  const isEndpoint =
    (x === maze.start.x && y === maze.start.y) || (x === maze.exit.x && y === maze.exit.y)
  return openCount === 1 && !isEndpoint
}

export function reachableCells(maze: MazeResult): Set<string> {
  const seen = new Set<string>()
  const key = (x: number, y: number) => `${x},${y}`
  const queue = [maze.start]
  seen.add(key(maze.start.x, maze.start.y))

  while (queue.length > 0) {
    const { x, y } = queue.shift()!
    const cell = maze.cells[y]![x]!
    for (const direction of DIRECTIONS) {
      if (!cell.open[direction]) continue
      const { dx, dy } = DELTAS[direction]
      const nx = x + dx
      const ny = y + dy
      if (!seen.has(key(nx, ny))) {
        seen.add(key(nx, ny))
        queue.push({ x: nx, y: ny })
      }
    }
  }
  return seen
}
