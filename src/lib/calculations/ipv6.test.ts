import { describe, expect, it } from 'vitest'
import { analyzeIPv6 } from './ipv6'

describe('analyzeIPv6', () => {
  it('expands and compresses the RFC 5952 example address', () => {
    const calc = analyzeIPv6('2001:0db8:0000:0000:0000:ff00:0042:8329')
    expect(calc.ok).toBe(true)
    if (calc.ok) {
      expect(calc.result.expanded).toBe('2001:0db8:0000:0000:0000:ff00:0042:8329')
      expect(calc.result.compressed).toBe('2001:db8::ff00:42:8329')
      expect(calc.result.addressType).toBe('Documentation address (RFC 3849)')
    }
  })

  it('picks the leftmost run when two zero-group runs tie in length', () => {
    // Cross-checked against Node's WHATWG URL host parser as an independent oracle.
    const calc = analyzeIPv6('2001:db8:0:0:1:0:0:1')
    expect(calc.ok).toBe(true)
    if (calc.ok) expect(calc.result.compressed).toBe('2001:db8::1:0:0:1')
  })

  it('handles the loopback address', () => {
    const calc = analyzeIPv6('::1')
    expect(calc.ok).toBe(true)
    if (calc.ok) {
      expect(calc.result.expanded).toBe('0000:0000:0000:0000:0000:0000:0000:0001')
      expect(calc.result.compressed).toBe('::1')
      expect(calc.result.addressType).toBe('Loopback address (::1)')
    }
  })

  it('handles the unspecified address', () => {
    const calc = analyzeIPv6('::')
    expect(calc.ok).toBe(true)
    if (calc.ok) {
      expect(calc.result.expanded).toBe('0000:0000:0000:0000:0000:0000:0000:0000')
      expect(calc.result.compressed).toBe('::')
      expect(calc.result.addressType).toBe('Unspecified address (::)')
    }
  })

  it('classifies a link-local address', () => {
    const calc = analyzeIPv6('fe80::1')
    expect(calc.ok).toBe(true)
    if (calc.ok) {
      expect(calc.result.compressed).toBe('fe80::1')
      expect(calc.result.addressType).toBe('Link-local unicast')
    }
  })

  it('classifies a unique local address', () => {
    const calc = analyzeIPv6('fc00::1')
    expect(calc.ok).toBe(true)
    if (calc.ok) expect(calc.result.addressType).toBe('Unique local address (ULA)')
  })

  it('classifies a multicast address', () => {
    const calc = analyzeIPv6('ff02::1')
    expect(calc.ok).toBe(true)
    if (calc.ok) {
      expect(calc.result.compressed).toBe('ff02::1')
      expect(calc.result.addressType).toBe('Multicast')
    }
  })

  it('classifies an IPv4-mapped address', () => {
    const calc = analyzeIPv6('::ffff:0:0')
    expect(calc.ok).toBe(true)
    if (calc.ok) {
      expect(calc.result.compressed).toBe('::ffff:0:0')
      expect(calc.result.addressType).toBe('IPv4-mapped address')
    }
  })

  it('classifies a global unicast address', () => {
    const calc = analyzeIPv6('2606:4700:4700::1111')
    expect(calc.ok).toBe(true)
    if (calc.ok) expect(calc.result.addressType).toBe('Global unicast')
  })

  it('classifies a NAT64 well-known-prefix address', () => {
    // 192.0.2.33 embedded in the RFC 6052 well-known prefix.
    const calc = analyzeIPv6('64:ff9b::c000:221')
    expect(calc.ok).toBe(true)
    if (calc.ok) expect(calc.result.addressType).toBe('NAT64 well-known prefix (RFC 6052)')
  })

  it('does not misclassify an address with a nonzero group 4 as NAT64', () => {
    // Shares the first four groups with the /96 well-known prefix but has a
    // nonzero 5th group, so it falls outside 64:ff9b::/96 entirely.
    const calc = analyzeIPv6('64:ff9b:0:0:1234:0:c000:221')
    expect(calc.ok).toBe(true)
    if (calc.ok) expect(calc.result.addressType).not.toBe('NAT64 well-known prefix (RFC 6052)')
  })

  it('classifies a 6to4 address', () => {
    // 2002:c000:0204:: -- 192.0.2.4 encoded in the next 32 bits after 2002::/16.
    const calc = analyzeIPv6('2002:c000:204::1')
    expect(calc.ok).toBe(true)
    if (calc.ok) expect(calc.result.addressType).toBe('6to4 tunneling address (RFC 3056)')
  })

  it('classifies a Teredo address', () => {
    const calc = analyzeIPv6('2001:0000:4136:e378:8000:63bf:3fff:fdd2')
    expect(calc.ok).toBe(true)
    if (calc.ok) expect(calc.result.addressType).toBe('Teredo tunneling address (RFC 4380)')
  })

  it('parses a prefix length', () => {
    const calc = analyzeIPv6('2001:db8::/32')
    expect(calc.ok).toBe(true)
    if (calc.ok) {
      expect(calc.result.prefixLength).toBe(32)
      expect(calc.result.compressed).toBe('2001:db8::')
    }
  })

  it('rejects a prefix length over 128', () => {
    const calc = analyzeIPv6('2001:db8::/129')
    expect(calc.ok).toBe(false)
  })

  it('rejects more than one "::"', () => {
    const calc = analyzeIPv6('2001::db8::1')
    expect(calc.ok).toBe(false)
  })

  it('rejects "::" with no elided groups (all 8 explicit)', () => {
    const calc = analyzeIPv6('1:2:3:4:5:6:7::8')
    expect(calc.ok).toBe(false)
  })

  it('rejects too many groups without "::"', () => {
    const calc = analyzeIPv6('1:2:3:4:5:6:7:8:9')
    expect(calc.ok).toBe(false)
  })

  it('rejects too few groups without "::"', () => {
    const calc = analyzeIPv6('1:2:3:4:5:6:7')
    expect(calc.ok).toBe(false)
  })

  it('rejects a group with more than 4 hex digits', () => {
    const calc = analyzeIPv6('12345::')
    expect(calc.ok).toBe(false)
  })

  it('rejects a group with non-hex characters', () => {
    const calc = analyzeIPv6('gggg::1')
    expect(calc.ok).toBe(false)
  })

  it('rejects empty input', () => {
    const calc = analyzeIPv6('')
    expect(calc.ok).toBe(false)
  })
})
