import { describe, expect, it } from 'vitest'
import { generateMaze, isDeadEnd, reachableCells } from './maze404'

describe('generateMaze', () => {
  it('produces a grid of the requested dimensions', () => {
    const maze = generateMaze(5, 7)
    expect(maze.cells.length).toBe(7)
    expect(maze.cells[0]!.length).toBe(5)
  })

  it('makes every cell reachable from the start (a perfect, fully-connected maze)', () => {
    const maze = generateMaze(9, 9)
    const reachable = reachableCells(maze)
    expect(reachable.size).toBe(9 * 9)
  })

  it('places the exit at the bottom-right corner', () => {
    const maze = generateMaze(6, 4)
    expect(maze.exit).toEqual({ x: 5, y: 3 })
  })

  it('never marks the start or exit as a dead end, even if structurally a leaf', () => {
    const maze = generateMaze(9, 9)
    expect(isDeadEnd(maze, maze.start.x, maze.start.y)).toBe(false)
    expect(isDeadEnd(maze, maze.exit.x, maze.exit.y)).toBe(false)
  })

  it('picks a shortcut cell that is itself a dead end', () => {
    const maze = generateMaze(9, 9)
    if (maze.shortcut) {
      expect(isDeadEnd(maze, maze.shortcut.x, maze.shortcut.y)).toBe(true)
    }
  })

  it('gives every non-endpoint cell at least one open wall (no isolated cells)', () => {
    const maze = generateMaze(7, 7)
    for (const row of maze.cells) {
      for (const cell of row) {
        const openCount = (['north', 'south', 'east', 'west'] as const).filter(
          (d) => cell.open[d],
        ).length
        expect(openCount).toBeGreaterThan(0)
      }
    }
  })
})
