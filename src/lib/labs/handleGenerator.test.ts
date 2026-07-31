import { describe, expect, it } from 'vitest'
import { CLEARANCE_LEVELS, generateHandle } from './handleGenerator'

describe('generateHandle', () => {
  it('returns a non-empty handle and a clearance level from the fixed pool', () => {
    for (let i = 0; i < 20; i++) {
      const result = generateHandle()
      expect(result.handle.length).toBeGreaterThan(0)
      expect(CLEARANCE_LEVELS).toContain(result.clearance)
    }
  })

  it('varies across calls (not hardcoded to a single output)', () => {
    const handles = new Set(Array.from({ length: 30 }, () => generateHandle().handle))
    expect(handles.size).toBeGreaterThan(1)
  })
})
