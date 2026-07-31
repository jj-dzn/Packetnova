import { describe, expect, it } from 'vitest'
import { calculateWildcardMask } from './wildcardMask'

describe('calculateWildcardMask', () => {
  it('converts a /24 subnet mask to its wildcard mask', () => {
    const calc = calculateWildcardMask('255.255.255.0')
    expect(calc.ok).toBe(true)
    if (calc.ok) {
      expect(calc.result.prefixLength).toBe(24)
      expect(calc.result.subnetMask).toBe('255.255.255.0')
      expect(calc.result.wildcardMask).toBe('0.0.0.255')
    }
  })

  it('converts a /16 subnet mask to its wildcard mask', () => {
    const calc = calculateWildcardMask('255.255.0.0')
    expect(calc.ok).toBe(true)
    if (calc.ok) expect(calc.result.wildcardMask).toBe('0.0.255.255')
  })

  it('converts a /30 subnet mask to its wildcard mask', () => {
    const calc = calculateWildcardMask('255.255.255.252')
    expect(calc.ok).toBe(true)
    if (calc.ok) expect(calc.result.wildcardMask).toBe('0.0.0.3')
  })

  it('accepts a bare prefix length', () => {
    const calc = calculateWildcardMask('27')
    expect(calc.ok).toBe(true)
    if (calc.ok) {
      expect(calc.result.subnetMask).toBe('255.255.255.224')
      expect(calc.result.wildcardMask).toBe('0.0.0.31')
    }
  })

  it('accepts a prefix length with a leading slash', () => {
    const calc = calculateWildcardMask('/20')
    expect(calc.ok).toBe(true)
    if (calc.ok) {
      expect(calc.result.subnetMask).toBe('255.255.240.0')
      expect(calc.result.wildcardMask).toBe('0.0.15.255')
    }
  })

  it('handles /0 (all-wildcard)', () => {
    const calc = calculateWildcardMask('/0')
    expect(calc.ok).toBe(true)
    if (calc.ok) {
      expect(calc.result.subnetMask).toBe('0.0.0.0')
      expect(calc.result.wildcardMask).toBe('255.255.255.255')
    }
  })

  it('handles /32 (no wildcard)', () => {
    const calc = calculateWildcardMask('/32')
    expect(calc.ok).toBe(true)
    if (calc.ok) {
      expect(calc.result.subnetMask).toBe('255.255.255.255')
      expect(calc.result.wildcardMask).toBe('0.0.0.0')
    }
  })

  it('rejects a non-contiguous mask', () => {
    const calc = calculateWildcardMask('255.255.0.255')
    expect(calc.ok).toBe(false)
  })

  it('rejects an out-of-range prefix length', () => {
    const calc = calculateWildcardMask('/33')
    expect(calc.ok).toBe(false)
  })

  it('rejects garbage input', () => {
    const calc = calculateWildcardMask('not a mask')
    expect(calc.ok).toBe(false)
  })

  it('rejects empty input', () => {
    const calc = calculateWildcardMask('')
    expect(calc.ok).toBe(false)
  })
})
