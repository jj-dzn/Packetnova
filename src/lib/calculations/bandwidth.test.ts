import { describe, expect, it } from 'vitest'
import { calculateEffectiveBandwidth } from './bandwidth'

describe('calculateEffectiveBandwidth', () => {
  it('a standard 40-byte TCP/IP header at 1500-byte packets is ~2.67% overhead', () => {
    const result = calculateEffectiveBandwidth(100, 40, 1500)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.overheadFraction).toBeCloseTo(40 / 1500, 10)
    expect(result.result.effectiveBandwidthMbps).toBeCloseTo(100 * (1460 / 1500), 10)
  })

  it('zero overhead means effective bandwidth equals raw bandwidth', () => {
    const result = calculateEffectiveBandwidth(100, 0, 1500)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.effectiveBandwidthMbps).toBe(100)
  })

  it('rejects overhead greater than or equal to the packet size', () => {
    expect(calculateEffectiveBandwidth(100, 1500, 1500).ok).toBe(false)
    expect(calculateEffectiveBandwidth(100, 2000, 1500).ok).toBe(false)
  })

  it('rejects non-positive bandwidth or packet size', () => {
    expect(calculateEffectiveBandwidth(0, 40, 1500).ok).toBe(false)
    expect(calculateEffectiveBandwidth(100, 40, 0).ok).toBe(false)
  })
})
