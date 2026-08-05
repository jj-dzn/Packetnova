import { describe, expect, it } from 'vitest'
import { countWrongTurns, gradeForWrongTurns, formatElapsedTime } from './branchingScoring'

const NODES = {
  start: {},
  'wrong-a': { outcome: 'wrong-turn' as const },
  'wrong-b': { outcome: 'wrong-turn' as const },
  middle: {},
  resolved: { outcome: 'resolution' as const },
}

describe('countWrongTurns', () => {
  it('counts zero wrong turns on a clean path', () => {
    expect(countWrongTurns(['start', 'middle', 'resolved'], NODES)).toBe(0)
  })

  it('counts a single wrong turn', () => {
    expect(countWrongTurns(['start', 'wrong-a', 'start', 'middle', 'resolved'], NODES)).toBe(1)
  })

  it('counts repeated visits to the same wrong turn separately', () => {
    expect(
      countWrongTurns(['start', 'wrong-a', 'start', 'wrong-a', 'start', 'resolved'], NODES),
    ).toBe(2)
  })

  it('counts wrong turns to different dead ends', () => {
    expect(countWrongTurns(['start', 'wrong-a', 'start', 'wrong-b', 'start'], NODES)).toBe(2)
  })

  it('does not count the resolution node as a wrong turn', () => {
    expect(countWrongTurns(['resolved'], NODES)).toBe(0)
  })
})

describe('gradeForWrongTurns', () => {
  it('grades zero wrong turns as a clean diagnosis', () => {
    expect(gradeForWrongTurns(0)).toEqual({ label: 'Clean diagnosis', tone: 'success' })
  })

  it('grades one wrong turn as solid work', () => {
    expect(gradeForWrongTurns(1)).toEqual({ label: 'Solid work', tone: 'accent' })
  })

  it('grades two or more wrong turns as got there', () => {
    expect(gradeForWrongTurns(2)).toEqual({ label: 'Got there', tone: 'warning' })
    expect(gradeForWrongTurns(5)).toEqual({ label: 'Got there', tone: 'warning' })
  })
})

describe('formatElapsedTime', () => {
  it('formats under a minute', () => {
    expect(formatElapsedTime(45_000)).toBe('0:45')
  })

  it('formats over a minute, padding seconds', () => {
    expect(formatElapsedTime(125_000)).toBe('2:05')
  })

  it('formats zero', () => {
    expect(formatElapsedTime(0)).toBe('0:00')
  })

  it('never goes negative', () => {
    expect(formatElapsedTime(-500)).toBe('0:00')
  })
})
