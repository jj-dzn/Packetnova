import { describe, expect, it } from 'vitest'
import { HOROSCOPES, zodiacForIpString, ZODIAC_SIGNS } from './ipZodiac'

describe('zodiacForIpString', () => {
  it('is deterministic for the same IP', () => {
    const first = zodiacForIpString('192.168.1.1')
    const second = zodiacForIpString('192.168.1.1')
    expect(first).toEqual(second)
  })

  it('returns a real sign and horoscope from the fixed pools', () => {
    const result = zodiacForIpString('10.0.0.1')!
    expect(ZODIAC_SIGNS.map((sign) => sign.name)).toContain(result.sign.name)
    expect(HOROSCOPES).toContain(result.horoscope)
  })

  it('returns null for an invalid IP', () => {
    expect(zodiacForIpString('not an ip')).toBeNull()
    expect(zodiacForIpString('999.1.1.1')).toBeNull()
  })

  it('can land on every sign across the IPv4 octet-sum range', () => {
    const seen = new Set<string>()
    for (let a = 0; a < 12; a++) {
      const result = zodiacForIpString(`${a}.0.0.0`)!
      seen.add(result.sign.name)
    }
    expect(seen.size).toBe(ZODIAC_SIGNS.length)
  })
})
