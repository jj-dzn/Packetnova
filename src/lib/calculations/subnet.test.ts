import { describe, expect, it } from 'vitest'
import { calculateSubnets } from './subnet'

describe('calculateSubnets', () => {
  it('splits a /24 into four /26 subnets', () => {
    const result = calculateSubnets('192.168.1.0/24', 26)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.subnetCount).toBe(4)
    expect(result.result.hostsPerSubnet).toBe(62)
    expect(result.result.subnetMask).toBe('255.255.255.192')
    expect(result.result.subnets.map((s) => s.cidr)).toEqual([
      '192.168.1.0/26',
      '192.168.1.64/26',
      '192.168.1.128/26',
      '192.168.1.192/26',
    ])
    expect(result.result.subnets[0]).toEqual({
      cidr: '192.168.1.0/26',
      networkAddress: '192.168.1.0',
      broadcastAddress: '192.168.1.63',
      firstUsable: '192.168.1.1',
      lastUsable: '192.168.1.62',
    })
  })

  it('splits a /8 into two /9 subnets', () => {
    const result = calculateSubnets('10.0.0.0/8', 9)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.subnetCount).toBe(2)
    expect(result.result.subnets.map((s) => s.networkAddress)).toEqual(['10.0.0.0', '10.128.0.0'])
  })

  it('splitting into the same prefix returns exactly the base network', () => {
    const result = calculateSubnets('192.168.0.0/24', 24)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.subnetCount).toBe(1)
    expect(result.result.subnets[0]?.cidr).toBe('192.168.0.0/24')
  })

  it('normalizes a host address down to its network before splitting', () => {
    const result = calculateSubnets('192.168.1.130/24', 26)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.baseCidr).toBe('192.168.1.0/24')
  })

  it('rejects a new prefix shorter than the base network', () => {
    const result = calculateSubnets('192.168.1.0/24', 23)
    expect(result.ok).toBe(false)
  })

  it('rejects a split that would produce too many subnets', () => {
    const result = calculateSubnets('10.0.0.0/8', 32)
    expect(result.ok).toBe(false)
  })

  it('rejects an invalid base CIDR', () => {
    expect(calculateSubnets('not-a-cidr', 26).ok).toBe(false)
  })
})
