export type ObstacleType = 'firewall' | 'congestion' | 'router'
export type Lane = 0 | 1 | 2

export interface Obstacle {
  id: number
  lane: Lane
  x: number
  type: ObstacleType
}

export interface RunnerState {
  lane: Lane
  obstacles: Obstacle[]
  score: number
  distance: number
  gameOver: boolean
  nextObstacleId: number
  ticksSinceSpawn: number
}

export const LANES: Lane[] = [0, 1, 2]

const OBSTACLE_SPEED = 3
const SPAWN_INTERVAL_TICKS = 18
const PLAYER_X = 10
const COLLISION_RADIUS = 4
const TRACK_LENGTH = 100

const OBSTACLE_WEIGHTS: { type: ObstacleType; weight: number }[] = [
  { type: 'firewall', weight: 3 },
  { type: 'congestion', weight: 3 },
  { type: 'router', weight: 2 },
]

function pickObstacleType(): ObstacleType {
  const total = OBSTACLE_WEIGHTS.reduce((sum, entry) => sum + entry.weight, 0)
  let roll = Math.random() * total
  for (const entry of OBSTACLE_WEIGHTS) {
    if (roll < entry.weight) return entry.type
    roll -= entry.weight
  }
  return 'firewall'
}

function randomLane(): Lane {
  return LANES[Math.floor(Math.random() * LANES.length)]!
}

export function createInitialRunnerState(): RunnerState {
  return {
    lane: 1,
    obstacles: [],
    score: 0,
    distance: 0,
    gameOver: false,
    nextObstacleId: 1,
    ticksSinceSpawn: 0,
  }
}

export function changeLane(state: RunnerState, delta: -1 | 1): RunnerState {
  if (state.gameOver) return state
  const nextLane = Math.min(2, Math.max(0, state.lane + delta)) as Lane
  return { ...state, lane: nextLane }
}

export function stepRunner(state: RunnerState): RunnerState {
  if (state.gameOver) return state

  const moved = state.obstacles
    .map((o) => ({ ...o, x: o.x - OBSTACLE_SPEED }))
    .filter((o) => o.x > -10)

  let score = state.score
  let gameOver = false
  const survivors: Obstacle[] = []

  for (const obstacle of moved) {
    const inCollisionZone = Math.abs(obstacle.x - PLAYER_X) <= COLLISION_RADIUS
    if (inCollisionZone && obstacle.lane === state.lane) {
      if (obstacle.type === 'firewall') {
        gameOver = true
      } else if (obstacle.type === 'congestion') {
        score = Math.max(0, score - 2)
      } else {
        score += 5
      }
      continue
    }
    survivors.push(obstacle)
  }

  let obstacles = survivors
  let ticksSinceSpawn = state.ticksSinceSpawn + 1
  let nextObstacleId = state.nextObstacleId

  if (!gameOver && ticksSinceSpawn >= SPAWN_INTERVAL_TICKS) {
    obstacles = [
      ...obstacles,
      { id: nextObstacleId, lane: randomLane(), x: TRACK_LENGTH, type: pickObstacleType() },
    ]
    nextObstacleId += 1
    ticksSinceSpawn = 0
  }

  return {
    ...state,
    obstacles,
    score: gameOver ? score : score + 1,
    distance: gameOver ? state.distance : state.distance + 1,
    gameOver,
    nextObstacleId,
    ticksSinceSpawn,
  }
}
