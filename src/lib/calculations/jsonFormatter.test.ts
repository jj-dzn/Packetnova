import { describe, expect, it } from 'vitest'
import { formatJson } from './jsonFormatter'

describe('formatJson', () => {
  it('pretty-prints with 2-space indentation', () => {
    const result = formatJson('{"a":1,"b":[1,2]}', 'pretty')
    expect(result).toEqual({ ok: true, result: '{\n  "a": 1,\n  "b": [\n    1,\n    2\n  ]\n}' })
  })

  it('minifies whitespace-heavy JSON', () => {
    const result = formatJson('{\n  "a": 1,\n  "b": 2\n}', 'minify')
    expect(result).toEqual({ ok: true, result: '{"a":1,"b":2}' })
  })

  it('rejects invalid JSON with a parse error message', () => {
    const result = formatJson('{not valid json', 'pretty')
    expect(result.ok).toBe(false)
  })
})
