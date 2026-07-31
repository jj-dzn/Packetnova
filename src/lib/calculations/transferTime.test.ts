import { describe, expect, it } from 'vitest'
import { calculateTransferTime } from './transferTime'

describe('calculateTransferTime', () => {
  it('100MB at 100Mbps takes exactly 8 seconds', () => {
    const result = calculateTransferTime(100, 100)
    expect(result).toEqual({ ok: true, result: { sizeMB: 100, bandwidthMbps: 100, seconds: 8 } })
  })

  it('a zero-byte file takes zero seconds', () => {
    const result = calculateTransferTime(0, 100)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.seconds).toBe(0)
  })

  it('doubling bandwidth halves the time', () => {
    const slow = calculateTransferTime(500, 50)
    const fast = calculateTransferTime(500, 100)
    expect(slow.ok && fast.ok).toBe(true)
    if (!slow.ok || !fast.ok) return
    expect(fast.result.seconds).toBeCloseTo(slow.result.seconds / 2, 10)
  })

  it('rejects a negative size or non-positive bandwidth', () => {
    expect(calculateTransferTime(-1, 100).ok).toBe(false)
    expect(calculateTransferTime(100, 0).ok).toBe(false)
    expect(calculateTransferTime(100, -10).ok).toBe(false)
  })
})
