import { describe, expect, it } from 'vitest'
import { calculateCidr } from './cidr'

describe('calculateCidr', () => {
  it('192.168.1.0/24 (standard private /24)', () => {
    const result = calculateCidr('192.168.1.0/24')
    expect(result).toEqual({
      ok: true,
      result: {
        ip: '192.168.1.0',
        prefixLength: 24,
        subnetMask: '255.255.255.0',
        wildcardMask: '0.0.0.255',
        networkAddress: '192.168.1.0',
        broadcastAddress: '192.168.1.255',
        firstUsable: '192.168.1.1',
        lastUsable: '192.168.1.254',
        totalAddresses: 256,
        usableHosts: 254,
      },
    })
  })

  it('10.0.0.0/8 (RFC 1918)', () => {
    const result = calculateCidr('10.0.0.0/8')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.networkAddress).toBe('10.0.0.0')
    expect(result.result.broadcastAddress).toBe('10.255.255.255')
    expect(result.result.subnetMask).toBe('255.0.0.0')
    expect(result.result.wildcardMask).toBe('0.255.255.255')
  })

  it('203.0.113.5/29 (RFC 5737 documentation range)', () => {
    const result = calculateCidr('203.0.113.5/29')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.networkAddress).toBe('203.0.113.0')
    expect(result.result.broadcastAddress).toBe('203.0.113.7')
    expect(result.result.firstUsable).toBe('203.0.113.1')
    expect(result.result.lastUsable).toBe('203.0.113.6')
    expect(result.result.totalAddresses).toBe(8)
    expect(result.result.usableHosts).toBe(6)
  })

  it('a host address is normalized down to its network', () => {
    const result = calculateCidr('192.168.1.130/24')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.networkAddress).toBe('192.168.1.0')
  })

  it('returns an error for invalid input', () => {
    expect(calculateCidr('not-an-ip/24').ok).toBe(false)
    expect(calculateCidr('192.168.1.1/33').ok).toBe(false)
    expect(calculateCidr('192.168.1.1').ok).toBe(false)
  })
})
