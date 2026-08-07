import { describe, expect, it } from 'vitest'
import { convertJsonToYaml, convertYamlToJson, formatYaml } from './yamlFormatter'

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

  it('rejects a billion-laughs-style anchor/alias expansion instead of hanging', () => {
    // Each level aliases the previous one 10 times -- 6 levels is 10^6
    // logical leaf nodes (plus every intermediate array), all from a
    // few hundred bytes of source. js-yaml's own load() resolves this
    // cheaply (shared references, not copies); it's re-serializing the
    // fully expanded form that would be the actual hang.
    const bomb = [
      'a: &a [1,1,1,1,1,1,1,1,1,1]',
      'b: &b [*a,*a,*a,*a,*a,*a,*a,*a,*a,*a]',
      'c: &c [*b,*b,*b,*b,*b,*b,*b,*b,*b,*b]',
      'd: &d [*c,*c,*c,*c,*c,*c,*c,*c,*c,*c]',
      'e: &e [*d,*d,*d,*d,*d,*d,*d,*d,*d,*d]',
      'f: [*e,*e,*e,*e,*e,*e,*e,*e,*e,*e]',
    ].join('\n')
    const start = performance.now()
    const result = formatYaml(bomb)
    const elapsedMs = performance.now() - start
    expect(result.ok).toBe(false)
    expect(elapsedMs).toBeLessThan(1000)
  })
})

describe('convertYamlToJson', () => {
  it('converts YAML to pretty-printed JSON', () => {
    const result = convertYamlToJson('name: PacketNova\ntools:\n  - subnet\n  - cidr\n')
    expect(result).toEqual({
      ok: true,
      result: JSON.stringify({ name: 'PacketNova', tools: ['subnet', 'cidr'] }, null, 2),
    })
  })

  it('rejects invalid YAML', () => {
    expect(convertYamlToJson('a: [1, 2\nb: broken').ok).toBe(false)
  })

  it('rejects a billion-laughs-style anchor/alias expansion instead of hanging', () => {
    const bomb = [
      'a: &a [1,1,1,1,1,1,1,1,1,1]',
      'b: &b [*a,*a,*a,*a,*a,*a,*a,*a,*a,*a]',
      'c: &c [*b,*b,*b,*b,*b,*b,*b,*b,*b,*b]',
      'd: &d [*c,*c,*c,*c,*c,*c,*c,*c,*c,*c]',
      'e: &e [*d,*d,*d,*d,*d,*d,*d,*d,*d,*d]',
      'f: [*e,*e,*e,*e,*e,*e,*e,*e,*e,*e]',
    ].join('\n')
    const start = performance.now()
    const result = convertYamlToJson(bomb)
    const elapsedMs = performance.now() - start
    expect(result.ok).toBe(false)
    expect(elapsedMs).toBeLessThan(1000)
  })
})

describe('convertJsonToYaml', () => {
  it('converts JSON to YAML', () => {
    const result = convertJsonToYaml('{"name":"PacketNova","tools":["subnet","cidr"]}')
    expect(result).toEqual({ ok: true, result: 'name: PacketNova\ntools:\n  - subnet\n  - cidr\n' })
  })

  it('rejects invalid JSON', () => {
    expect(convertJsonToYaml('{not valid json').ok).toBe(false)
  })
})
