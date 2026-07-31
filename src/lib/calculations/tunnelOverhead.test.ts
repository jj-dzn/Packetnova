import { describe, expect, it } from 'vitest'
import { calculateTunnelOverhead } from './tunnelOverhead'

describe('calculateTunnelOverhead', () => {
  it('GRE (24 bytes, structurally fixed) over standard Ethernet MTU', () => {
    const result = calculateTunnelOverhead(1500, 24)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.effectiveMtu).toBe(1476)
    expect(result.result.overheadPercent).toBeCloseTo((24 / 1500) * 100, 10)
  })

  it('WireGuard typical overhead (60 bytes) over standard Ethernet MTU', () => {
    const result = calculateTunnelOverhead(1500, 60)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.effectiveMtu).toBe(1440)
  })

  it('zero overhead leaves the MTU unchanged', () => {
    const result = calculateTunnelOverhead(1500, 0)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.effectiveMtu).toBe(1500)
    expect(result.result.overheadPercent).toBe(0)
  })

  it('rejects overhead greater than or equal to the link MTU', () => {
    expect(calculateTunnelOverhead(1500, 1500).ok).toBe(false)
    expect(calculateTunnelOverhead(1500, 1600).ok).toBe(false)
  })
})
