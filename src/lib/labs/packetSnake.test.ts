import { describe, expect, it } from 'vitest'
import { createInitialState, isOppositeDirection, stepSnake } from './packetSnake'

describe('createInitialState', () => {
  it('starts with a 3-segment snake moving right', () => {
    const state = createInitialState(16, 16)
    expect(state.snake.length).toBe(3)
    expect(state.direction).toBe('right')
    expect(state.gameOver).toBe(false)
  })

  it('never places food on top of the snake', () => {
    const state = createInitialState(16, 16)
    const onSnake = state.snake.some(
      (segment) => segment.x === state.food.x && segment.y === state.food.y,
    )
    expect(onSnake).toBe(false)
  })
})

describe('isOppositeDirection', () => {
  it('identifies opposite pairs correctly', () => {
    expect(isOppositeDirection('up', 'down')).toBe(true)
    expect(isOppositeDirection('left', 'right')).toBe(true)
    expect(isOppositeDirection('up', 'left')).toBe(false)
  })
})

describe('stepSnake', () => {
  it('moves the head one cell in the current direction', () => {
    const state = createInitialState(16, 16)
    const next = stepSnake(state, 16, 16)
    expect(next.snake[0]).toEqual({ x: state.snake[0]!.x + 1, y: state.snake[0]!.y })
  })

  it('keeps the snake the same length when no food is eaten', () => {
    const state = createInitialState(16, 16)
    const next = stepSnake(state, 16, 16)
    expect(next.snake.length).toBe(state.snake.length)
  })

  it('grows the snake and increments score when food is eaten', () => {
    const state = createInitialState(16, 16)
    const head = state.snake[0]!
    const stateWithAdjacentFood = { ...state, food: { x: head.x + 1, y: head.y } }
    const next = stepSnake(stateWithAdjacentFood, 16, 16)
    expect(next.snake.length).toBe(state.snake.length + 1)
    expect(next.score).toBe(state.score + 1)
  })

  it('ends the game on a wall collision', () => {
    const state = createInitialState(16, 16)
    const edgeState = { ...state, snake: [{ x: 15, y: 5 }], direction: 'right' as const }
    const next = stepSnake(edgeState, 16, 16)
    expect(next.gameOver).toBe(true)
  })

  it('ends the game on a self collision', () => {
    const state = createInitialState(16, 16)
    const coiledState = {
      ...state,
      snake: [
        { x: 5, y: 5 },
        { x: 6, y: 5 },
        { x: 6, y: 6 },
        { x: 5, y: 6 },
        { x: 4, y: 6 },
      ],
      direction: 'down' as const,
    }
    const next = stepSnake(coiledState, 16, 16)
    expect(next.gameOver).toBe(true)
  })

  it('does nothing once the game is over', () => {
    const state = { ...createInitialState(16, 16), gameOver: true }
    const next = stepSnake(state, 16, 16)
    expect(next).toEqual(state)
  })
})
