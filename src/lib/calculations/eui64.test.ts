import { describe, expect, it } from 'vitest'
import { calculateEui64 } from './eui64'

describe('calculateEui64', () => {
  it('derives the interface ID and full SLAAC address from a MAC and /64 prefix', () => {
    const result = calculateEui64('00:1A:2B:3C:4D:5E', '2001:db8::/64')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.interfaceId).toBe('21a:2bff:fe3c:4d5e')
    expect(result.result.fullAddress).toBe('2001:db8::21a:2bff:fe3c:4d5e/64')
  })

  it('flips the universal/local bit the other way when it starts set', () => {
    const result = calculateEui64('02:00:00:00:00:01', 'fe80::/64')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.interfaceId).toBe('0:ff:fe00:1')
    expect(result.result.fullAddress).toBe('fe80::ff:fe00:1/64')
  })

  it('rejects an invalid MAC address', () => {
    expect(calculateEui64('not-a-mac', '2001:db8::/64').ok).toBe(false)
  })

  it('rejects a prefix length other than /64', () => {
    const result = calculateEui64('00:1A:2B:3C:4D:5E', '2001:db8::/48')
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error).toContain('/64')
  })

  it('rejects an invalid prefix', () => {
    expect(calculateEui64('00:1A:2B:3C:4D:5E', 'not-an-address/64').ok).toBe(false)
  })
})
