import { describe, expect, it } from 'vitest'
import { calculatePasswordEntropyBits, generatePassword } from './password'

const allSets = { uppercase: true, lowercase: true, digits: true, symbols: true }

describe('generatePassword', () => {
  it('produces a password of the requested length', () => {
    const result = generatePassword({ length: 20, ...allSets })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result).toHaveLength(20)
  })

  it('only uses characters from the requested set (digits only)', () => {
    const result = generatePassword({
      length: 50,
      uppercase: false,
      lowercase: false,
      digits: true,
      symbols: false,
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result).toMatch(/^[0-9]{50}$/)
  })

  it('only uses characters from the requested set (uppercase only)', () => {
    const result = generatePassword({
      length: 50,
      uppercase: true,
      lowercase: false,
      digits: false,
      symbols: false,
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result).toMatch(/^[A-Z]{50}$/)
  })

  it('generates different passwords on successive calls', () => {
    const first = generatePassword({ length: 32, ...allSets })
    const second = generatePassword({ length: 32, ...allSets })
    expect(first.ok && second.ok).toBe(true)
    if (!first.ok || !second.ok) return
    expect(first.result).not.toBe(second.result)
  })

  it('rejects a request with no character set selected', () => {
    const result = generatePassword({
      length: 10,
      uppercase: false,
      lowercase: false,
      digits: false,
      symbols: false,
    })
    expect(result.ok).toBe(false)
  })

  it('rejects an out-of-range length', () => {
    expect(generatePassword({ length: 0, ...allSets }).ok).toBe(false)
    expect(generatePassword({ length: 257, ...allSets }).ok).toBe(false)
  })
})

describe('calculatePasswordEntropyBits', () => {
  it('computes length * log2(charset size)', () => {
    // digits-only, length 10: charset size 10, log2(10) ~= 3.3219
    const bits = calculatePasswordEntropyBits({
      length: 10,
      uppercase: false,
      lowercase: false,
      digits: true,
      symbols: false,
    })
    expect(bits).toBeCloseTo(10 * Math.log2(10), 5)
  })

  it('increases with a larger character set at the same length', () => {
    const digitsOnly = calculatePasswordEntropyBits({
      length: 12,
      uppercase: false,
      lowercase: false,
      digits: true,
      symbols: false,
    })
    const allSetsBits = calculatePasswordEntropyBits({ length: 12, ...allSets })
    expect(allSetsBits).toBeGreaterThan(digitsOnly)
  })

  it('is 0 when no character set is selected', () => {
    expect(
      calculatePasswordEntropyBits({
        length: 20,
        uppercase: false,
        lowercase: false,
        digits: false,
        symbols: false,
      }),
    ).toBe(0)
  })

  it('is 0 for a non-positive length', () => {
    expect(calculatePasswordEntropyBits({ length: 0, ...allSets })).toBe(0)
  })
})
