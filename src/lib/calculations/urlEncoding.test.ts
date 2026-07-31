import { describe, expect, it } from 'vitest'
import { urlDecode, urlEncode } from './urlEncoding'

describe('urlEncode', () => {
  it('encodes reserved and space characters', () => {
    expect(urlEncode('hello world & friends?')).toBe('hello%20world%20%26%20friends%3F')
  })

  it('leaves unreserved characters untouched', () => {
    expect(urlEncode('abc123-_.~')).toBe('abc123-_.~')
  })
})

describe('urlDecode', () => {
  it('decodes percent-encoded text', () => {
    expect(urlDecode('hello%20world')).toEqual({ ok: true, result: 'hello world' })
  })

  it('rejects malformed percent-encoding', () => {
    expect(urlDecode('%zz').ok).toBe(false)
  })
})

describe('round trip', () => {
  it('round-trips text with reserved characters and unicode', () => {
    const text = 'a=1&b=2 café 🚀'
    expect(urlDecode(urlEncode(text))).toEqual({ ok: true, result: text })
  })
})
