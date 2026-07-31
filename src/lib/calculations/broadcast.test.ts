import { describe, expect, it } from 'vitest'
import { calculateBroadcast } from './broadcast'

describe('calculateBroadcast', () => {
  it('192.168.1.10/24', () => {
    const result = calculateBroadcast('192.168.1.10/24')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.ip).toBe('192.168.1.10')
    expect(result.result.prefixLength).toBe(24)
    expect(result.result.subnetMask).toBe('255.255.255.0')
    expect(result.result.wildcardMask).toBe('0.0.0.255')
    expect(result.result.networkAddress).toBe('192.168.1.0')
    expect(result.result.broadcastAddress).toBe('192.168.1.255')
  })

  it('172.16.0.0/12 (RFC 1918)', () => {
    const result = calculateBroadcast('172.31.255.1/12')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.broadcastAddress).toBe('172.31.255.255')
  })

  it('a /31 has no traditional broadcast but still resolves per RFC 3021 math', () => {
    const result = calculateBroadcast('192.168.1.0/31')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.broadcastAddress).toBe('192.168.1.1')
  })

  it('rejects invalid input', () => {
    expect(calculateBroadcast('256.1.1.1/24').ok).toBe(false)
    expect(calculateBroadcast('192.168.1.1').ok).toBe(false)
  })
})
