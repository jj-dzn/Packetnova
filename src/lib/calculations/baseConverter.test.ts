import { describe, expect, it } from 'vitest'
import { convertBase } from './baseConverter'

describe('convertBase', () => {
  it('255 decimal converts correctly to all bases', () => {
    const result = convertBase('255', 10)
    expect(result).toEqual({
      ok: true,
      result: { binary: '11111111', octal: '377', decimal: '255', hex: 'ff' },
    })
  })

  it('ff hex converts back to 255 decimal', () => {
    const result = convertBase('ff', 16)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.decimal).toBe('255')
  })

  it('11111111 binary converts back to 255 decimal', () => {
    const result = convertBase('11111111', 2)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.decimal).toBe('255')
  })

  it('377 octal converts back to 255 decimal', () => {
    const result = convertBase('377', 8)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.decimal).toBe('255')
  })

  it('rejects digits invalid for the given base', () => {
    expect(convertBase('2', 2).ok).toBe(false)
    expect(convertBase('8', 8).ok).toBe(false)
    expect(convertBase('g', 16).ok).toBe(false)
  })

  it('rejects empty input', () => {
    expect(convertBase('', 10).ok).toBe(false)
    expect(convertBase('   ', 10).ok).toBe(false)
  })
})
