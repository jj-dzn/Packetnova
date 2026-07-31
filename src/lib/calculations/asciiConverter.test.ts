import { describe, expect, it } from 'vitest'
import { asciiCodesToText, textToAscii } from './asciiConverter'

describe('textToAscii', () => {
  it("'A' is the canonical code 65", () => {
    const result = textToAscii('A')
    expect(result).toEqual({
      ok: true,
      result: [{ char: 'A', code: 65, hex: '41', binary: '01000001' }],
    })
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
