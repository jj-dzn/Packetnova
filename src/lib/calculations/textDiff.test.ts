import { describe, expect, it } from 'vitest'
import { computeCharDiff, computeTextDiff, summarizeDiff } from './textDiff'

describe('computeTextDiff', () => {
  it('identical text produces a single unchanged part', () => {
    const result = computeTextDiff('same\ntext\n', 'same\ntext\n')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result).toEqual([{ value: 'same\ntext\n', added: false, removed: false }])
  })

  it('a changed line shows as a removed part followed by an added part', () => {
    const result = computeTextDiff('line1\nline2\nline3\n', 'line1\nlineTWO\nline3\n')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result).toEqual([
      { value: 'line1\n', added: false, removed: false },
      { value: 'line2\n', added: false, removed: true },
      { value: 'lineTWO\n', added: true, removed: false },
      { value: 'line3\n', added: false, removed: false },
    ])
  })

  it('a purely added line shows only an added part', () => {
    const result = computeTextDiff('a\nb\n', 'a\nb\nc\n')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const added = result.result.filter((part) => part.added)
    expect(added).toEqual([{ value: 'c\n', added: true, removed: false }])
  })

  it('rejects two empty inputs', () => {
    expect(computeTextDiff('', '').ok).toBe(false)
  })

  it('word granularity highlights only the changed word, not the whole line', () => {
    const result = computeTextDiff('the quick fox\n', 'the slow fox\n', 'word')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const removed = result.result.filter((part) => part.removed).map((part) => part.value)
    const added = result.result.filter((part) => part.added).map((part) => part.value)
    expect(removed).toEqual(['quick'])
    expect(added).toEqual(['slow'])
  })
})

describe('summarizeDiff', () => {
  it('counts added and removed lines', () => {
    const result = computeTextDiff('a\nb\n', 'a\nc\nd\n')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(summarizeDiff(result.result, 'line')).toEqual({ added: 2, removed: 1 })
  })

  it('counts added and removed words', () => {
    const result = computeTextDiff('the quick fox', 'the slow fox', 'word')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(summarizeDiff(result.result, 'word')).toEqual({ added: 1, removed: 1 })
  })
})

describe('computeCharDiff', () => {
  it('highlights only the changed characters', () => {
    const result = computeCharDiff('hello world', 'hello%20world')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const added = result.result.filter((part) => part.added).map((part) => part.value)
    expect(added).toEqual(['%20'])
  })

  it('rejects two empty inputs', () => {
    expect(computeCharDiff('', '').ok).toBe(false)
  })
})
