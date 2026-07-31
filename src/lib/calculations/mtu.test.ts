import { describe, expect, it } from 'vitest'
import { calculateMtu } from './mtu'

describe('calculateMtu', () => {
  it('a payload that exactly fits the effective MTU', () => {
    const result = calculateMtu(1500, 0, 1500)
    expect(result).toEqual({
      ok: true,
      result: {
        linkMtu: 1500,
        overheadBytes: 0,
        effectiveMtu: 1500,
        payloadSize: 1500,
        fits: true,
        excessBytes: 0,
      },
    })
  })

  it('a payload that exceeds the effective MTU after WireGuard overhead', () => {
    const result = calculateMtu(1500, 60, 1500)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.effectiveMtu).toBe(1440)
    expect(result.result.fits).toBe(false)
    expect(result.result.excessBytes).toBe(60)
  })

  it('rejects overhead greater than or equal to the link MTU', () => {
    expect(calculateMtu(1500, 1500, 100).ok).toBe(false)
    expect(calculateMtu(1500, 2000, 100).ok).toBe(false)
  })

  it('rejects non-positive MTU or negative inputs', () => {
    expect(calculateMtu(0, 0, 0).ok).toBe(false)
    expect(calculateMtu(1500, -1, 0).ok).toBe(false)
    expect(calculateMtu(1500, 0, -1).ok).toBe(false)
  })
})
