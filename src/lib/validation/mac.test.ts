import { describe, expect, it } from 'vitest'
import { formatMac, isLocallyAdministered, isMulticast, parseMac } from './mac'

describe('parseMac', () => {
  it('parses colon-separated addresses', () => {
    expect(parseMac('00:1a:2b:3c:4d:5e')).toEqual({
      bytes: [0x00, 0x1a, 0x2b, 0x3c, 0x4d, 0x5e],
      value: 0x001a2b3c4d5e,
    })
  })

  it('parses hyphen-separated, dot-separated, and bare hex the same way', () => {
    const expected = parseMac('00:1a:2b:3c:4d:5e')
    expect(parseMac('00-1a-2b-3c-4d-5e')).toEqual(expected)
    expect(parseMac('001a.2b3c.4d5e')).toEqual(expected)
    expect(parseMac('001a2b3c4d5e')).toEqual(expected)
  })

  it('is case-insensitive', () => {
    expect(parseMac('AA:BB:CC:DD:EE:FF')).toEqual(parseMac('aa:bb:cc:dd:ee:ff'))
  })

  it('rejects the wrong number of hex digits', () => {
    expect(parseMac('00:1a:2b:3c:4d')).toBeNull()
    expect(parseMac('00:1a:2b:3c:4d:5e:6f')).toBeNull()
  })

  it('rejects non-hex characters', () => {
    expect(parseMac('zz:1a:2b:3c:4d:5e')).toBeNull()
  })
})

describe('formatMac', () => {
  const bytes = [0x00, 0x1a, 0x2b, 0x3c, 0x4d, 0x5e]

  it('formats as colon-separated', () => {
    expect(formatMac(bytes, 'colon')).toBe('00:1a:2b:3c:4d:5e')
  })

  it('formats as hyphen-separated', () => {
    expect(formatMac(bytes, 'hyphen')).toBe('00-1a-2b-3c-4d-5e')
  })

  it('formats as Cisco-style dotted quads', () => {
    expect(formatMac(bytes, 'dot')).toBe('001a.2b3c.4d5e')
  })
})

describe('isMulticast / isLocallyAdministered', () => {
  it('the IPv4 multicast MAC prefix (01:00:5E) is multicast, universally administered', () => {
    expect(isMulticast(0x01)).toBe(true)
    expect(isLocallyAdministered(0x01)).toBe(false)
  })

  it('the broadcast address is multicast (the all-ones special case)', () => {
    expect(isMulticast(0xff)).toBe(true)
  })

  it('the classic locally-administered example (02:...) is unicast, locally administered', () => {
    expect(isMulticast(0x02)).toBe(false)
    expect(isLocallyAdministered(0x02)).toBe(true)
  })

  it("Cisco's burned-in OUI (00:00:0C) is unicast, universally administered", () => {
    expect(isMulticast(0x00)).toBe(false)
    expect(isLocallyAdministered(0x00)).toBe(false)
  })
})
