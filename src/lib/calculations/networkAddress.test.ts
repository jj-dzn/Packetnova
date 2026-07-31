import { describe, expect, it } from 'vitest'
import { calculateNetworkAddress } from './networkAddress'

describe('calculateNetworkAddress', () => {
  it('192.168.1.130/24', () => {
    const result = calculateNetworkAddress('192.168.1.130/24')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.ip).toBe('192.168.1.130')
    expect(result.result.prefixLength).toBe(24)
    expect(result.result.subnetMask).toBe('255.255.255.0')
    expect(result.result.networkAddress).toBe('192.168.1.0')
    expect(result.result.classification.label).toContain('Private use')
  })

  it('10.42.7.9/8 (RFC 1918)', () => {
    const result = calculateNetworkAddress('10.42.7.9/8')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.networkAddress).toBe('10.0.0.0')
    expect(result.result.classification.label).toContain('Private use')
  })

  it('a /32 network address is the host itself', () => {
    const result = calculateNetworkAddress('192.168.1.5/32')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.networkAddress).toBe('192.168.1.5')
  })

  it('classifies a public address correctly', () => {
    const result = calculateNetworkAddress('8.8.8.8/24')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.classification.label).toBe('Public (global unicast)')
  })

  it('rejects invalid input', () => {
    expect(calculateNetworkAddress('192.168.1.1.1/24').ok).toBe(false)
    expect(calculateNetworkAddress('192.168.1.1/-1').ok).toBe(false)
  })
})
