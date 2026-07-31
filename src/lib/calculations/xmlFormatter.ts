import type { CalculationResult } from './result'

const ELEMENT_NODE = 1
const TEXT_NODE = 3

function indentElement(node: Element, depth: number): string {
  const indent = '  '.repeat(depth)
  const attrs = Array.from(node.attributes)
    .map((attr) => ` ${attr.name}="${attr.value}"`)
    .join('')

  const children = Array.from(node.childNodes).filter(
    (child) => !(child.nodeType === TEXT_NODE && !child.textContent?.trim()),
  )
  const elementChildren = children.filter((child) => child.nodeType === ELEMENT_NODE) as Element[]

  if (children.length === 0) {
    return `${indent}<${node.tagName}${attrs} />`
  }

  if (elementChildren.length === 0) {
    const text = node.textContent?.trim() ?? ''
    return `${indent}<${node.tagName}${attrs}>${text}</${node.tagName}>`
  }

  const childLines = elementChildren.map((child) => indentElement(child, depth + 1)).join('\n')
  return `${indent}<${node.tagName}${attrs}>\n${childLines}\n${indent}</${node.tagName}>`
}

// Uses the browser's own DOMParser for parsing (correctness-critical, and
// XML has enough edge cases -- entities, CDATA, namespaces -- that
// hand-rolling a parser would be a real risk). XMLSerializer doesn't
// indent, so pretty-printing is a small custom walk over the parsed tree.
export function formatXml(input: string): CalculationResult<string> {
  const doc = new DOMParser().parseFromString(input, 'application/xml')
  if (doc.querySelector('parsererror')) {
    return { ok: false, error: 'Invalid XML.' }
  }
  if (!doc.documentElement) {
    return { ok: false, error: 'Invalid XML.' }
  }
  return { ok: true, result: indentElement(doc.documentElement, 0) }
}
