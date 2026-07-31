import { describe, expect, it } from 'vitest'
import { calculateMss } from './mss'

describe('calculateMss', () => {
  it('the canonical standard-Ethernet IPv4 MSS is 1460', () => {
    const result = calculateMss(1500, 4)
    expect(result).toEqual({
      ok: true,
      result: { mtu: 1500, ipVersion: 4, ipHeaderBytes: 20, tcpHeaderBytes: 20, mss: 1460 },
    })
  })

  it('IPv6 has a larger fixed header, so a lower MSS at the same MTU', () => {
    const result = calculateMss(1500, 6)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.ipHeaderBytes).toBe(40)
    expect(result.result.mss).toBe(1440)
  })

  it('accounts for IP and TCP options', () => {
    const result = calculateMss(1500, 4, 20, 12)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.mss).toBe(1500 - 40 - 32)
  })

  it('rejects headers larger than the MTU', () => {
    expect(calculateMss(30, 4).ok).toBe(false)
  })

  it('rejects a non-positive MTU', () => {
    expect(calculateMss(0, 4).ok).toBe(false)
  })
})
