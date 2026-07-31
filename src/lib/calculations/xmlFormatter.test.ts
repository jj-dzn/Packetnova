// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { formatXml } from './xmlFormatter'

describe('formatXml', () => {
  it('indents nested elements', () => {
    const result = formatXml('<root><a>1</a><b>2</b></root>')
    expect(result).toEqual({ ok: true, result: '<root>\n  <a>1</a>\n  <b>2</b>\n</root>' })
  })

  it('preserves attributes', () => {
    const result = formatXml('<root id="1"><a x="y">text</a></root>')
    expect(result).toEqual({ ok: true, result: '<root id="1">\n  <a x="y">text</a>\n</root>' })
  })

  it('renders a self-closing tag for an empty element', () => {
    const result = formatXml('<root><empty></empty></root>')
    expect(result).toEqual({ ok: true, result: '<root>\n  <empty />\n</root>' })
  })

  it('handles deeper nesting', () => {
    const result = formatXml('<a><b><c>leaf</c></b></a>')
    expect(result).toEqual({ ok: true, result: '<a>\n  <b>\n    <c>leaf</c>\n  </b>\n</a>' })
  })

  it('rejects malformed XML', () => {
    const result = formatXml('<root><unclosed></root>')
    expect(result.ok).toBe(false)
  })
})
