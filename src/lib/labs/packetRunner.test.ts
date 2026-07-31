import { describe, expect, it } from 'vitest'
import { changeLane, createInitialRunnerState, stepRunner, type RunnerState } from './packetRunner'

describe('createInitialRunnerState', () => {
  it('starts in the middle lane with no obstacles and zero score', () => {
    const state = createInitialRunnerState()
    expect(state.lane).toBe(1)
    expect(state.obstacles).toEqual([])
    expect(state.score).toBe(0)
    expect(state.gameOver).toBe(false)
  })
})

describe('changeLane', () => {
  it('moves within bounds and clamps at the edges', () => {
    let state = createInitialRunnerState()
    state = changeLane(state, -1)
    expect(state.lane).toBe(0)
    state = changeLane(state, -1)
    expect(state.lane).toBe(0)
    state = changeLane(state, 1)
    state = changeLane(state, 1)
    expect(state.lane).toBe(2)
    state = changeLane(state, 1)
    expect(state.lane).toBe(2)
  })

  it('does nothing once the game is over', () => {
    const state: RunnerState = { ...createInitialRunnerState(), gameOver: true }
    expect(changeLane(state, 1).lane).toBe(state.lane)
  })
})

describe('stepRunner', () => {
  it('moves obstacles closer to the player each tick', () => {
    const state: RunnerState = {
      ...createInitialRunnerState(),
      obstacles: [{ id: 1, lane: 1, x: 50, type: 'router' }],
    }
    const next = stepRunner(state)
    const obstacle = next.obstacles.find((o) => o.id === 1)
    expect(obstacle!.x).toBeLessThan(50)
  })

  it('ends the game on a firewall collision in the player lane', () => {
    const state: RunnerState = {
      ...createInitialRunnerState(),
      lane: 1,
      obstacles: [{ id: 1, lane: 1, x: 10, type: 'firewall' }],
    }
    expect(stepRunner(state).gameOver).toBe(true)
  })

  it('does not collide with an obstacle in a different lane', () => {
    const state: RunnerState = {
      ...createInitialRunnerState(),
      lane: 0,
      obstacles: [{ id: 1, lane: 2, x: 10, type: 'firewall' }],
    }
    expect(stepRunner(state).gameOver).toBe(false)
  })

  it('awards bonus points for a router collision in the player lane', () => {
    const state: RunnerState = {
      ...createInitialRunnerState(),
      lane: 1,
      score: 0,
      obstacles: [{ id: 1, lane: 1, x: 10, type: 'router' }],
    }
    expect(stepRunner(state).score).toBeGreaterThan(0)
  })

  it('deducts points (never below zero) for a congestion collision', () => {
    const state: RunnerState = {
      ...createInitialRunnerState(),
      lane: 1,
      score: 1,
      obstacles: [{ id: 1, lane: 1, x: 10, type: 'congestion' }],
    }
    const next = stepRunner(state)
    expect(next.score).toBeGreaterThanOrEqual(0)
    expect(next.score).toBeLessThan(state.score + 2)
  })

  it('does nothing once the game is over', () => {
    const state: RunnerState = { ...createInitialRunnerState(), gameOver: true, score: 42 }
    expect(stepRunner(state)).toEqual(state)
  })
})
