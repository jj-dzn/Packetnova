import { describe, expect, it } from 'vitest'
import { testRegex } from './regexTester'

describe('testRegex', () => {
  it('finds all matches with their index', () => {
    const result = testRegex('\\d+', '', 'abc123def456')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.matches).toEqual([
      { match: '123', index: 3, groups: [] },
      { match: '456', index: 9, groups: [] },
    ])
  })

  it('captures groups', () => {
    const result = testRegex('(\\w+)@(\\w+)', '', 'contact foo@bar please')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.matches).toHaveLength(1)
    expect(result.result.matches[0]!.groups).toEqual(['foo', 'bar'])
  })

  it('is case-insensitive with the i flag', () => {
    const result = testRegex('hello', 'i', 'HELLO world')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.matches).toHaveLength(1)
  })

  it('finds no matches when the pattern does not occur', () => {
    const result = testRegex('xyz', '', 'abc123')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.matches).toHaveLength(0)
  })

  it('does not hang on a zero-width match pattern', () => {
    const result = testRegex('a*', '', 'bbb')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.matches.length).toBeGreaterThan(0)
    expect(result.result.matches.length).toBeLessThan(100)
  })

  it('rejects an invalid pattern', () => {
    expect(testRegex('(unclosed', '', 'text').ok).toBe(false)
  })
})
