import { describe, expect, it } from 'vitest'
import { DIAL_UP_PHASES, totalDialUpDurationMs } from './dialUp'

describe('DIAL_UP_PHASES', () => {
  it('ends on the connected phase with no further delay', () => {
    const last = DIAL_UP_PHASES[DIAL_UP_PHASES.length - 1]!
    expect(last.label).toMatch(/connected/i)
    expect(last.durationMs).toBe(0)
  })

  it('has more than one phase', () => {
    expect(DIAL_UP_PHASES.length).toBeGreaterThan(1)
  })
})

describe('totalDialUpDurationMs', () => {
  it('sums every phase duration', () => {
    const expected = DIAL_UP_PHASES.reduce((sum, phase) => sum + phase.durationMs, 0)
    expect(totalDialUpDurationMs()).toBe(expected)
  })
})
