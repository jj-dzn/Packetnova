export interface ParsedFrontmatter {
  data: Record<string, unknown>
  content: string
}

const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/

// Prettier reformats this project's markdown frontmatter to single-quoted
// strings (matching .prettierrc's singleQuote setting) every time it runs,
// which isn't valid JSON on its own -- normalize each 'single-quoted'
// segment to a properly escaped "double-quoted" one before parsing.
function parseValue(text: string): unknown {
  const normalized = text.replace(/'([^']*)'/g, (_match, inner: string) => JSON.stringify(inner))
  try {
    return JSON.parse(normalized)
  } catch {
    return text
  }
}

// A hand-written parser instead of a real YAML library (like gray-matter,
// which we tried first): our frontmatter is always title/description/date/
// tags, values we write ourselves, so there's no need for a full YAML
// engine. gray-matter pulled in a nested js-yaml copy that touched Node's
// `buffer` module and used eval() internally (flagged directly by the
// build as a minification/security risk), nearly doubling the bundle for
// three blog posts' worth of frontmatter -- clearly built for Node-side
// build tooling, not a browser bundle. Every value here is written as
// valid JSON once quotes are normalized (quoted strings, bracketed
// arrays), so JSON.parse per line handles it with no dependency at all.
export function parseFrontmatter(raw: string): ParsedFrontmatter {
  const match = FRONTMATTER_PATTERN.exec(raw)
  if (!match) return { data: {}, content: raw.trim() }

  const [, frontmatterBlock, body] = match
  const data: Record<string, unknown> = {}

  for (const line of (frontmatterBlock ?? '').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
    const colonIndex = trimmed.indexOf(':')
    if (colonIndex === -1) continue
    const key = trimmed.slice(0, colonIndex).trim()
    const valueText = trimmed.slice(colonIndex + 1).trim()
    data[key] = parseValue(valueText)
  }

  return { data, content: (body ?? '').trim() }
}
