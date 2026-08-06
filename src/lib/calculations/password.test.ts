import { describe, expect, it, vi } from 'vitest'
import { calculatePasswordEntropyBits, estimateCrackTime, generatePassword } from './password'

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

  it('discards a biased draw instead of using it (rejection sampling)', () => {
    // For a 10-character digit charset, the top 6 values of the uint32
    // range (0xfffffffa-0xffffffff) are biased -- 0xffffffff among them --
    // and must be thrown away rather than mapped via %. If the generator
    // used naive modulo instead, this would still "work" but silently
    // favor low digits; asserting the exact output instead of just "no
    // crash" is what actually catches that regression.
    const spy = vi.spyOn(crypto, 'getRandomValues').mockImplementation((<T extends ArrayBufferView>(
      array: T,
    ) => {
      const view = array as unknown as Uint32Array
      view[0] = 0xffffffff
      for (let i = 1; i < view.length; i++) view[i] = 5
      return array
    }) as typeof crypto.getRandomValues)

    const result = generatePassword({
      length: 1,
      uppercase: false,
      lowercase: false,
      digits: true,
      symbols: false,
    })
    spy.mockRestore()

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result).toBe('5')
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

describe('estimateCrackTime', () => {
  it('reports a sub-second time for a trivially small keyspace', () => {
    const estimate = estimateCrackTime(1, 1_000_000_000)
    expect(estimate.humanReadable).toBe('under a second')
  })

  it('reports a huge number of years for high entropy at a realistic guess rate', () => {
    const estimate = estimateCrackTime(128, 1_000_000_000)
    expect(estimate.seconds).toBeGreaterThan(0)
    expect(estimate.humanReadable).toMatch(/years$/)
  })

  it('a slower guess rate takes proportionally longer', () => {
    const fast = estimateCrackTime(40, 1_000_000_000)
    const slow = estimateCrackTime(40, 1_000)
    expect(slow.seconds).toBeGreaterThan(fast.seconds)
  })

  it('more entropy always takes at least as long to crack', () => {
    const weak = estimateCrackTime(20)
    const strong = estimateCrackTime(80)
    expect(strong.seconds).toBeGreaterThan(weak.seconds)
  })

  it('treats negative entropy (e.g. no character set selected) as zero, not throwing', () => {
    expect(() => estimateCrackTime(-5)).not.toThrow()
    expect(estimateCrackTime(-5).seconds).toBe(0.5 / 1_000_000_000)
  })
})
