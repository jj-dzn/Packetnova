import { describe, expect, it } from 'vitest'
import { simulateRouteLookup } from './routeLookup'

describe('simulateRouteLookup', () => {
  it('longest prefix match wins even when the shorter prefix has a lower AD', () => {
    // A /16 static route (AD 1) "loses" to a /24 OSPF route (AD 110) for a
    // destination inside both, because LPM is evaluated before AD -- they
    // are routes to different (if overlapping) networks, not the same one.
    const result = simulateRouteLookup('192.168.1.10', [
      { cidr: '192.168.0.0/16', administrativeDistance: 1, label: 'Static' },
      { cidr: '192.168.1.0/24', administrativeDistance: 110, label: 'OSPF' },
    ])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.winner?.label).toBe('OSPF')
    expect(result.result.decidedBy).toBe('longest-prefix')
  })

  it('administrative distance breaks a tie between routes to the exact same network', () => {
    const result = simulateRouteLookup('10.0.0.5', [
      { cidr: '10.0.0.0/24', administrativeDistance: 110, label: 'OSPF' },
      { cidr: '10.0.0.0/24', administrativeDistance: 90, label: 'EIGRP' },
    ])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.winner?.label).toBe('EIGRP')
    expect(result.result.decidedBy).toBe('administrative-distance')
  })

  it('a destination with no matching route has a null winner and null decidedBy', () => {
    const result = simulateRouteLookup('172.16.0.1', [
      { cidr: '10.0.0.0/8', administrativeDistance: 1, label: 'Static' },
    ])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.winner).toBeNull()
    expect(result.result.decidedBy).toBeNull()
  })

  it('rejects a negative administrative distance', () => {
    const result = simulateRouteLookup('10.0.0.1', [
      { cidr: '10.0.0.0/8', administrativeDistance: -1, label: 'Bad' },
    ])
    expect(result.ok).toBe(false)
  })
})
