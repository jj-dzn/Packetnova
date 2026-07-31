import { describe, expect, it } from 'vitest'
import { calculateLatency } from './latency'

describe('calculateLatency', () => {
  it('1000km at 200 km/ms (~2/3 c, typical fiber) is 5ms one-way, 10ms round trip', () => {
    const result = calculateLatency(1000, 200)
    expect(result).toEqual({
      ok: true,
      result: { distanceKm: 1000, propagationSpeedKmPerMs: 200, oneWayMs: 5, roundTripMs: 10 },
    })
  })

  it('zero distance is zero latency', () => {
    const result = calculateLatency(0, 200)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.oneWayMs).toBe(0)
  })

  it('round trip is always exactly double one-way', () => {
    const result = calculateLatency(4321, 187.5)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.roundTripMs).toBeCloseTo(result.result.oneWayMs * 2, 10)
  })

  it('rejects a negative distance or non-positive propagation speed', () => {
    expect(calculateLatency(-1, 200).ok).toBe(false)
    expect(calculateLatency(100, 0).ok).toBe(false)
    expect(calculateLatency(100, -50).ok).toBe(false)
  })
})
