import { describe, expect, it } from 'vitest'
import { calculateIpFlags } from './ipFlags'

describe('calculateIpFlags', () => {
  it('no flags set is 000', () => {
    expect(calculateIpFlags({ dontFragment: false, moreFragments: false }).binary).toBe('000')
  })

  it("Don't Fragment alone is 010 (value 2)", () => {
    const result = calculateIpFlags({ dontFragment: true, moreFragments: false })
    expect(result.binary).toBe('010')
    expect(result.value).toBe(2)
  })

  it('More Fragments alone is 001 (value 1)', () => {
    const result = calculateIpFlags({ dontFragment: false, moreFragments: true })
    expect(result.binary).toBe('001')
    expect(result.value).toBe(1)
  })

  it('both DF and MF set is 011 (value 3)', () => {
    const result = calculateIpFlags({ dontFragment: true, moreFragments: true })
    expect(result.binary).toBe('011')
    expect(result.value).toBe(3)
  })
})
