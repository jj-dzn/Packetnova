import { describe, expect, it } from 'vitest'
import { shellQuote } from './shellQuote'

describe('shellQuote', () => {
  it('wraps plain text in single quotes', () => {
    expect(shellQuote('hello world')).toBe("'hello world'")
  })

  it('escapes an embedded single quote', () => {
    expect(shellQuote("it's")).toBe("'it'\\''s'")
  })

  it('handles an empty string', () => {
    expect(shellQuote('')).toBe("''")
  })
})
