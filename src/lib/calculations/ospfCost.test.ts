import { describe, expect, it } from 'vitest'
import { calculateOspfCost } from './ospfCost'

describe('calculateOspfCost', () => {
  it('a T1 (1.544 Mbps) at the default 100 Mbps reference is the textbook cost of 64', () => {
    const result = calculateOspfCost(100, 1.544)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.cost).toBe(64)
  })

  it('FastEthernet (100 Mbps) at the default reference is cost 1', () => {
    const result = calculateOspfCost(100, 100)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.cost).toBe(1)
  })

  it('Ethernet (10 Mbps) at the default reference is cost 10', () => {
    const result = calculateOspfCost(100, 10)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.cost).toBe(10)
  })

  it('cost floors at 1 even when the interface is faster than the reference bandwidth', () => {
    const result = calculateOspfCost(100, 1000)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.cost).toBe(1)
  })

  it('rejects non-positive bandwidths', () => {
    expect(calculateOspfCost(0, 100).ok).toBe(false)
    expect(calculateOspfCost(100, 0).ok).toBe(false)
    expect(calculateOspfCost(-10, 100).ok).toBe(false)
  })
})
