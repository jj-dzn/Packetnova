import { describe, expect, it } from 'vitest'
import { dateToEpoch, epochToDate } from './epochConverter'

describe('epochToDate', () => {
  it('epoch 0 is the canonical Unix epoch', () => {
    const result = epochToDate(0, 'seconds')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.iso).toBe('1970-01-01T00:00:00.000Z')
  })

  it('matches the independently-verified jwt.io example iat value', () => {
    const result = epochToDate(1516239022, 'seconds')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.iso).toBe('2018-01-18T01:30:22.000Z')
  })

  it('handles milliseconds directly', () => {
    const result = epochToDate(1516239022000, 'milliseconds')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.iso).toBe('2018-01-18T01:30:22.000Z')
    expect(result.result.epochSeconds).toBe(1516239022)
  })

  it('rejects non-finite input', () => {
    expect(epochToDate(NaN, 'seconds').ok).toBe(false)
  })
})

describe('dateToEpoch', () => {
  it('converts an ISO date string back to epoch 0', () => {
    const result = dateToEpoch('1970-01-01T00:00:00.000Z')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.epochSeconds).toBe(0)
  })

  it('round-trips with epochToDate', () => {
    const forward = epochToDate(1700000000, 'seconds')
    expect(forward.ok).toBe(true)
    if (!forward.ok) return
    const back = dateToEpoch(forward.result.iso)
    expect(back.ok).toBe(true)
    if (!back.ok) return
    expect(back.result.epochSeconds).toBe(1700000000)
  })

  it('rejects an unparseable date string', () => {
    expect(dateToEpoch('not a date').ok).toBe(false)
  })
})
