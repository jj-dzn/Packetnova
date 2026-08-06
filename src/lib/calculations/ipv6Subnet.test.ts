import { describe, expect, it } from 'vitest'
import { calculateIpv6Subnets } from './ipv6Subnet'

describe('calculateIpv6Subnets', () => {
  it('enumerates every subnet exactly when the count is small', () => {
    const result = calculateIpv6Subnets('2001:db8::/125', 128)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.subnetCount).toBe('8')
    expect(result.result.truncated).toBe(false)
    expect(result.result.firstSubnets).toEqual([
      '2001:db8::/128',
      '2001:db8::1/128',
      '2001:db8::2/128',
      '2001:db8::3/128',
      '2001:db8::4/128',
    ])
    expect(result.result.lastSubnets).toEqual([
      '2001:db8::5/128',
      '2001:db8::6/128',
      '2001:db8::7/128',
    ])
  })

  it('previews first/last with a gap for a large split', () => {
    const result = calculateIpv6Subnets('2001:db8::/32', 36)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.subnetCount).toBe('16')
    expect(result.result.truncated).toBe(true)
    expect(result.result.firstSubnets).toHaveLength(5)
    expect(result.result.lastSubnets).toHaveLength(5)
    expect(result.result.firstSubnets[0]).toBe('2001:db8::/36')
  })

  it('formats a very large subnet count with thousands separators', () => {
    const result = calculateIpv6Subnets('2001:db8::/32', 64)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    // 2^32
    expect(result.result.subnetCount).toBe('4,294,967,296')
  })

  it('masks the input address down to its network boundary', () => {
    const result = calculateIpv6Subnets('2001:db8::1234/32', 36)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.baseCidr).toBe('2001:db8::/32')
  })

  it('masks only the host bits within a group when the base prefix falls mid-group', () => {
    // /32 above only ever needs to zero whole 16-bit groups. A /36 splits
    // partway through the third group instead: 0xf123's top nibble (0xf,
    // bits 95-92) is still network, the low 12 bits (0x123) are host and
    // must be zeroed -- the rest of the group, not the whole group.
    const result = calculateIpv6Subnets('2001:0db8:f123::/36', 40)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.baseCidr).toBe('2001:db8:f000::/36')
  })

  it('rejects a new prefix that is not longer than the base', () => {
    const result = calculateIpv6Subnets('2001:db8::/32', 32)
    expect(result.ok).toBe(false)
  })

  it('rejects input with no prefix length', () => {
    expect(calculateIpv6Subnets('2001:db8::', 36).ok).toBe(false)
  })

  it('rejects an invalid address', () => {
    expect(calculateIpv6Subnets('not-an-address/32', 36).ok).toBe(false)
  })

  it('rejects an excessively wide split', () => {
    const result = calculateIpv6Subnets('::/0', 128)
    expect(result.ok).toBe(false)
  })
})
