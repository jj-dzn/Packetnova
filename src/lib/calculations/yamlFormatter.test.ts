import { describe, expect, it } from 'vitest'
import { formatYaml } from './yamlFormatter'

describe('formatYaml', () => {
  it('normalizes valid YAML to js-yaml canonical formatting', () => {
    const result = formatYaml('a: 1\nb:\n  - 1\n  - 2\n')
    expect(result).toEqual({ ok: true, result: 'a: 1\nb:\n  - 1\n  - 2\n' })
  })

  it('parses flow-style YAML and re-dumps it in block style', () => {
    const result = formatYaml('a: {b: 1, c: 2}')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result).toBe('a:\n  b: 1\n  c: 2\n')
  })

  it('rejects invalid YAML', () => {
    const result = formatYaml('a: [1, 2\nb: broken')
    expect(result.ok).toBe(false)
  })
})
