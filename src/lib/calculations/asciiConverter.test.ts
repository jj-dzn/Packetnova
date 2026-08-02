import { describe, expect, it } from 'vitest'
import { asciiCodesToText, textToAscii } from './asciiConverter'

describe('textToAscii', () => {
  it("'A' is the canonical code 65", () => {
    const result = textToAscii('A')
    expect(result).toEqual({
      ok: true,
      result: [{ char: 'A', code: 65, hex: '41', binary: '01000001', utf8Bytes: '41' }],
    })
  })

  it('a single-byte ASCII character has one UTF-8 byte matching its code point', () => {
    const result = textToAscii('A')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result[0]!.utf8Bytes).toBe('41')
  })

  it('a two-byte UTF-8 character (e.g. "e") shows two hex bytes', () => {
    const result = textToAscii('é') // e-acute, U+00E9 -- encodes as 2 UTF-8 bytes
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result[0]!.utf8Bytes).toBe('C3 A9')
  })

  it('a four-byte UTF-8 character (emoji) shows four hex bytes', () => {
    const result = textToAscii('\u{1F600}') // U+1F600 grinning face
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result[0]!.utf8Bytes).toBe('F0 9F 98 80')
  })

  it('converts each character of a multi-character string', () => {
    const result = textToAscii('AB')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.map((entry) => entry.code)).toEqual([65, 66])
  })

  it('a space is code 32', () => {
    const result = textToAscii(' ')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result[0]!.code).toBe(32)
  })

  it('rejects empty input', () => {
    expect(textToAscii('').ok).toBe(false)
  })
})

describe('asciiCodesToText', () => {
  it('converts codes 65 66 back to "AB"', () => {
    expect(asciiCodesToText('65 66')).toEqual({ ok: true, result: 'AB' })
  })

  it('round-trips with textToAscii', () => {
    const forward = textToAscii('Hello!')
    expect(forward.ok).toBe(true)
    if (!forward.ok) return
    const codes = forward.result.map((entry) => entry.code).join(' ')
    expect(asciiCodesToText(codes)).toEqual({ ok: true, result: 'Hello!' })
  })

  it('rejects a non-numeric code', () => {
    expect(asciiCodesToText('65 abc').ok).toBe(false)
  })

  it('rejects empty input', () => {
    expect(asciiCodesToText('').ok).toBe(false)
  })
})
