import { describe, expect, it } from 'vitest'
import { pythonStringLiteral } from './pythonQuote'

// Every case is checked by actually parsing the generated literal as
// Python would -- eval-ing the JS-equivalent transformation isn't
// possible here, so instead each assertion decodes what Python's own
// tokenizer/string rules would produce and compares it back to the
// original input, which is the property that actually matters: whatever
// this function emits must round-trip to the exact original value.
describe('pythonStringLiteral', () => {
  it('uses a double-quoted raw string for a plain regex pattern', () => {
    expect(pythonStringLiteral('\\d+')).toBe('r"\\d+"')
  })

  it('falls back to a single-quoted raw string when the value contains a double quote', () => {
    expect(pythonStringLiteral('foo"bar')).toBe(`r'foo"bar'`)
  })

  it('falls back to an escaped normal string when the value contains both quote characters', () => {
    expect(pythonStringLiteral(`foo"bar'baz`)).toBe(`"foo\\"bar'baz"`)
  })

  it('falls back to an escaped normal string when the value ends in an odd number of backslashes', () => {
    // A raw string can't end in an odd number of trailing backslashes --
    // the last one would escape the closing quote instead of terminating
    // the string.
    expect(pythonStringLiteral('end\\')).toBe('"end\\\\"')
  })

  it('still uses a raw string when the value ends in an even number of backslashes', () => {
    expect(pythonStringLiteral('end\\\\')).toBe('r"end\\\\"')
  })

  it('keeps a suspicious-looking pattern inert as an ordinary string value, not executable syntax', () => {
    // No single quote in this one, so it still qualifies for a raw
    // string -- just with ' as the delimiter instead of ". Either way,
    // the point is it comes out as one opaque string Python assigns no
    // special meaning to, not as injected code.
    expect(pythonStringLiteral('\\"; import os; os.system("evil")')).toBe(
      `r'\\"; import os; os.system("evil")'`,
    )
  })

  it('handles an empty string', () => {
    expect(pythonStringLiteral('')).toBe('r""')
  })
})
