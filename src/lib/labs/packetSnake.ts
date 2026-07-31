export interface Point {
  x: number
  y: number
}

export type SnakeDirection = 'up' | 'down' | 'left' | 'right'

export interface SnakeState {
  snake: Point[]
  direction: SnakeDirection
  food: Point
  score: number
  gameOver: boolean
}

const DIRECTION_DELTAS: Record<SnakeDirection, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

const OPPOSITE_DIRECTION: Record<SnakeDirection, SnakeDirection> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
}

export function isOppositeDirection(a: SnakeDirection, b: SnakeDirection): boolean {
  return OPPOSITE_DIRECTION[a] === b
}

function randomEmptyCell(width: number, height: number, occupied: Point[]): Point {
  const occupiedKeys = new Set(occupied.map((p) => `${p.x},${p.y}`))
  const candidates: Point[] = []
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!occupiedKeys.has(`${x},${y}`)) candidates.push({ x, y })
    }
  }
  return candidates[Math.floor(Math.random() * candidates.length)]!
}

export function createInitialState(width: number, height: number): SnakeState {
  const startY = Math.floor(height / 2)
  const startX = Math.floor(width / 2)
  const snake: Point[] = [
    { x: startX, y: startY },
    { x: startX - 1, y: startY },
    { x: startX - 2, y: startY },
  ]
  return {
    snake,
    direction: 'right',
    food: randomEmptyCell(width, height, snake),
    score: 0,
    gameOver: false,
  }
}

export function stepSnake(state: SnakeState, width: number, height: number): SnakeState {
  if (state.gameOver) return state

  const delta = DIRECTION_DELTAS[state.direction]
  const head = state.snake[0]!
  const newHead: Point = { x: head.x + delta.x, y: head.y + delta.y }

  const hitWall = newHead.x < 0 || newHead.x >= width || newHead.y < 0 || newHead.y >= height
  const hitSelf = state.snake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)

  if (hitWall || hitSelf) {
    return { ...state, gameOver: true }
  }

  const ateFood = newHead.x === state.food.x && newHead.y === state.food.y
  const newSnake = [newHead, ...state.snake]
  if (!ateFood) newSnake.pop()

  return {
    ...state,
    snake: newSnake,
    score: ateFood ? state.score + 1 : state.score,
    food: ateFood ? randomEmptyCell(width, height, newSnake) : state.food,
  }
}
