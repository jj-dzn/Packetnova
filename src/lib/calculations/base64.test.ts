import { describe, expect, it } from 'vitest'
import { base64Decode, base64Encode } from './base64'

describe('base64Encode', () => {
  it('encodes a well-known string correctly', () => {
    expect(base64Encode('hello')).toBe('aGVsbG8=')
  })

  it('encodes an empty string as an empty string', () => {
    expect(base64Encode('')).toBe('')
  })
})

describe('base64Decode', () => {
  it('decodes a well-known Base64 string correctly', () => {
    expect(base64Decode('aGVsbG8=')).toEqual({ ok: true, result: 'hello' })
  })

  it('rejects invalid Base64', () => {
    expect(base64Decode('not valid base64!!!').ok).toBe(false)
  })
})

describe('round trip', () => {
  it('round-trips plain ASCII text', () => {
    const text = 'The quick brown fox jumps over the lazy dog.'
    const decoded = base64Decode(base64Encode(text))
    expect(decoded).toEqual({ ok: true, result: text })
  })

  it('round-trips non-ASCII text (accents, emoji) without corruption', () => {
    const text = 'héllo wörld 🚀 日本語'
    const decoded = base64Decode(base64Encode(text))
    expect(decoded).toEqual({ ok: true, result: text })
  })
})
