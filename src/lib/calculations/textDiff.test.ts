import { describe, expect, it } from 'vitest'
import {
  buildAlignedDiffRows,
  computeCharDiff,
  diffLineWords,
  summarizeAlignedRows,
} from './textDiff'

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

describe('buildAlignedDiffRows', () => {
  it('aligns identical text 1:1 with no blanks', () => {
    const result = buildAlignedDiffRows('a\nb\n', 'a\nb\n')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result).toEqual([
      { leftNumber: 1, leftText: 'a', rightNumber: 1, rightText: 'a', type: 'same' },
      { leftNumber: 2, leftText: 'b', rightNumber: 2, rightText: 'b', type: 'same' },
    ])
  })

  it('pairs a same-length replacement as modified rows, not add+remove', () => {
    const result = buildAlignedDiffRows('a\nb\nc\n', 'a\nB\nc\n')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result).toEqual([
      { leftNumber: 1, leftText: 'a', rightNumber: 1, rightText: 'a', type: 'same' },
      { leftNumber: 2, leftText: 'b', rightNumber: 2, rightText: 'B', type: 'modified' },
      { leftNumber: 3, leftText: 'c', rightNumber: 3, rightText: 'c', type: 'same' },
    ])
  })

  it('an inserted line leaves a blank on the left at that position', () => {
    const result = buildAlignedDiffRows('a\nb\n', 'a\nx\nb\n')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result).toEqual([
      { leftNumber: 1, leftText: 'a', rightNumber: 1, rightText: 'a', type: 'same' },
      { leftNumber: null, leftText: null, rightNumber: 2, rightText: 'x', type: 'added' },
      { leftNumber: 2, leftText: 'b', rightNumber: 3, rightText: 'b', type: 'same' },
    ])
  })

  it('a deleted line leaves a blank on the right at that position', () => {
    const result = buildAlignedDiffRows('a\nb\nc\n', 'a\nc\n')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result).toEqual([
      { leftNumber: 1, leftText: 'a', rightNumber: 1, rightText: 'a', type: 'same' },
      { leftNumber: 2, leftText: 'b', rightNumber: null, rightText: null, type: 'removed' },
      { leftNumber: 3, leftText: 'c', rightNumber: 2, rightText: 'c', type: 'same' },
    ])
  })

  it('an unequal-length replacement pairs what it can and leaves the rest as add/remove', () => {
    const result = buildAlignedDiffRows('a\nb\nc\nd\n', 'a\nX\nd\n')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result).toEqual([
      { leftNumber: 1, leftText: 'a', rightNumber: 1, rightText: 'a', type: 'same' },
      { leftNumber: 2, leftText: 'b', rightNumber: 2, rightText: 'X', type: 'modified' },
      { leftNumber: 3, leftText: 'c', rightNumber: null, rightText: null, type: 'removed' },
      { leftNumber: 4, leftText: 'd', rightNumber: 3, rightText: 'd', type: 'same' },
    ])
  })

  it('rejects two empty inputs', () => {
    expect(buildAlignedDiffRows('', '').ok).toBe(false)
  })

  it('keeps the total row count and line numbers correct across 100+ lines', () => {
    const before = Array.from({ length: 120 }, (_, i) => `line ${i}`).join('\n') + '\n'
    const lines = before.split('\n').slice(0, -1)
    lines[50] = 'CHANGED'
    lines.splice(80, 0, 'INSERTED')
    const after = lines.join('\n') + '\n'

    const result = buildAlignedDiffRows(before, after)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.length).toBe(121) // 120 original rows + 1 inserted row
    expect(result.result[result.result.length - 1]!.leftNumber).toBe(120)
    expect(result.result[result.result.length - 1]!.rightNumber).toBe(121)
  })
})

describe('summarizeAlignedRows', () => {
  it('counts added, removed, and modified rows separately', () => {
    const result = buildAlignedDiffRows('a\nb\nc\nd\n', 'a\nX\nd\ne\n')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(summarizeAlignedRows(result.result)).toEqual({ added: 1, removed: 1, modified: 1 })
  })
})

describe('diffLineWords', () => {
  it('highlights only the word that changed within a line', () => {
    const parts = diffLineWords('the quick fox', 'the slow fox')
    const removed = parts.filter((p) => p.removed).map((p) => p.value)
    const added = parts.filter((p) => p.added).map((p) => p.value)
    expect(removed).toEqual(['quick'])
    expect(added).toEqual(['slow'])
  })
})
