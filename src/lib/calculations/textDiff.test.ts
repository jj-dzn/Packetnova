import { describe, expect, it } from 'vitest'
import { computeTextDiff } from './textDiff'

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
})
