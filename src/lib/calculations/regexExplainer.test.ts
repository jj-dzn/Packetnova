import { describe, expect, it } from 'vitest'
import { explainPattern } from './regexExplainer'

describe('explainPattern', () => {
  it('explains a digit run followed by a literal space', () => {
    const tokens = explainPattern('\\d+ ')
    expect(tokens.map((t) => t.description)).toEqual([
      'a digit (0-9), one or more times',
      "the literal character ' '",
    ])
  })

  it('explains an optional quantifier', () => {
    const tokens = explainPattern('colou?r')
    const u = tokens.find((t) => t.raw === 'u?')
    expect(u?.description).toBe("the literal character 'u', zero or one time (optional)")
  })

  it('explains a lazy quantifier', () => {
    const tokens = explainPattern('.*?')
    expect(tokens[0]?.description).toBe(
      'any character except a newline, zero or more times, matching as few as possible',
    )
  })

  it('explains a bounded repetition range', () => {
    const tokens = explainPattern('a{2,4}')
    expect(tokens[0]?.description).toBe("the literal character 'a', between 2 and 4 times")
  })

  it('explains anchors', () => {
    const tokens = explainPattern('^end$')
    expect(tokens[0]?.description).toContain('start of the string')
    expect(tokens[tokens.length - 1]?.description).toContain('end of the string')
  })

  it('explains a named capturing group and increments depth inside it', () => {
    const tokens = explainPattern('(?<id>\\d+)')
    const open = tokens.find((t) => t.raw.startsWith('(?<id'))
    const digit = tokens.find((t) => t.raw === '\\d+')
    const close = tokens.find((t) => t.raw === ')')
    expect(open?.description).toContain("named 'id'")
    expect(open?.depth).toBe(0)
    expect(digit?.depth).toBe(1)
    expect(close?.depth).toBe(0)
  })

  it('explains a non-capturing group and alternation', () => {
    const tokens = explainPattern('(?:cat|dog)')
    expect(tokens[0]?.description).toBe('start a non-capturing group:')
    expect(tokens.some((t) => t.raw === '|')).toBe(true)
  })

  it('explains a positive lookahead', () => {
    const tokens = explainPattern('foo(?=bar)')
    const lookahead = tokens.find((t) => t.raw === '(?=')
    expect(lookahead?.description).toContain('lookahead')
    expect(lookahead?.description).not.toContain('negative')
  })

  it('explains a negative lookahead', () => {
    const tokens = explainPattern('foo(?!bar)')
    const lookahead = tokens.find((t) => t.raw === '(?!')
    expect(lookahead?.description).toContain('negative lookahead')
  })

  it('explains lookbehind variants', () => {
    const pos = explainPattern('(?<=\\$)\\d+')
    expect(pos[0]?.description).toContain('lookbehind')
    expect(pos[0]?.description).not.toContain('negative')

    const neg = explainPattern('(?<!\\$)\\d+')
    expect(neg[0]?.description).toContain('negative lookbehind')
  })

  it('explains a character class with a range and negation', () => {
    const tokens = explainPattern('[a-z0-9]')
    expect(tokens[0]?.description).toBe('any of: a-z, 0-9')

    const negated = explainPattern('[^0-9]')
    expect(negated[0]?.description).toContain('any character except')
  })

  it('explains a word boundary and a backreference', () => {
    const tokens = explainPattern('\\b(\\w+)\\s\\1\\b')
    expect(tokens[0]?.description).toBe('a word boundary')
    const backref = tokens.find((t) => t.raw === '\\1')
    expect(backref?.description).toContain('same text matched by capture group 1')
  })

  it('caps output for pathologically long patterns instead of hanging', () => {
    const tokens = explainPattern('a'.repeat(10_000))
    expect(tokens.length).toBeLessThanOrEqual(500)
  })
})
