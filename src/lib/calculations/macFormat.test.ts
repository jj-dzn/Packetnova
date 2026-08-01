import { describe, expect, it } from 'vitest'
import { formatMacAddress } from './macFormat'

describe('formatMacAddress', () => {
  it('converts a colon-separated address into all three formats', () => {
    const result = formatMacAddress('00:1a:2b:3c:4d:5e')
    expect(result).toEqual({
      ok: true,
      result: {
        colon: '00:1a:2b:3c:4d:5e',
        hyphen: '00-1a-2b-3c-4d-5e',
        dot: '001a.2b3c.4d5e',
        bytes: [0x00, 0x1a, 0x2b, 0x3c, 0x4d, 0x5e],
      },
    })
  })

  it('accepts Cisco dotted-quad input and produces the same normalized output', () => {
    const result = formatMacAddress('001a.2b3c.4d5e')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.colon).toBe('00:1a:2b:3c:4d:5e')
  })

  it('accepts bare hex with no separators', () => {
    const result = formatMacAddress('001a2b3c4d5e')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.hyphen).toBe('00-1a-2b-3c-4d-5e')
  })

  it('rejects invalid input', () => {
    expect(formatMacAddress('not-a-mac').ok).toBe(false)
    expect(formatMacAddress('00:1a:2b:3c:4d').ok).toBe(false)
  })
})
