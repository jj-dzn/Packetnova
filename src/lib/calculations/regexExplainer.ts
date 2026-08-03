export interface ExplainedToken {
  /** The exact pattern substring this line explains -- shown alongside the
   * description so the two stay visibly connected. */
  raw: string
  description: string
  /** Nesting depth inside groups, for indentation -- 0 at the top level. */
  depth: number
}

const MAX_TOKENS = 500 // safety cap against pathologically long patterns

const ESCAPE_DESCRIPTIONS: Record<string, string> = {
  d: 'a digit (0-9)',
  D: 'a non-digit character',
  w: 'a word character (letter, digit, or underscore)',
  W: 'a non-word character',
  s: 'a whitespace character',
  S: 'a non-whitespace character',
  n: 'a newline',
  r: 'a carriage return',
  t: 'a tab',
  v: 'a vertical tab',
  f: 'a form feed',
  '0': 'a null character',
}

function describeQuantifier(quantifier: string, lazy: boolean): string {
  const suffix = lazy ? ', matching as few as possible' : ''
  if (quantifier === '*') return `zero or more times${suffix}`
  if (quantifier === '+') return `one or more times${suffix}`
  if (quantifier === '?') return 'zero or one time (optional)'
  const range = /^\{(\d+)(,)?(\d+)?\}$/.exec(quantifier)
  if (!range) return quantifier
  const [, min, comma, max] = range
  if (!comma) return `exactly ${min} time${min === '1' ? '' : 's'}`
  if (!max) return `${min} or more times${suffix}`
  return `between ${min} and ${max} times${suffix}`
}

// Reads a quantifier (*, +, ?, {n}, {n,}, {n,m}) starting at `i`, plus a
// trailing lazy `?` if present -- returns null if there isn't one, so the
// caller knows to fall back to "exactly once" for the preceding atom.
// `base` is the quantifier itself with any lazy marker already excluded,
// so describeQuantifier never has to guess whether a trailing `?` it sees
// is the optional-quantifier symbol or a laziness marker tacked onto a
// different quantifier.
function readQuantifier(
  source: string,
  i: number,
): { raw: string; base: string; lazy: boolean } | null {
  const ch = source[i]
  if (ch === '*' || ch === '+' || ch === '?') {
    const lazy = source[i + 1] === '?'
    return { raw: ch + (lazy ? '?' : ''), base: ch, lazy }
  }
  if (ch === '{') {
    const close = source.indexOf('}', i)
    if (close === -1) return null
    const base = source.slice(i, close + 1)
    if (!/^\{\d+(,\d*)?\}$/.test(base)) return null
    const lazy = source[close + 1] === '?'
    return { raw: base + (lazy ? '?' : ''), base, lazy }
  }
  return null
}

function describeCharClassBody(body: string): string {
  const negated = body.startsWith('^')
  const content = negated ? body.slice(1) : body
  const parts: string[] = []
  let i = 0
  while (i < content.length) {
    const ch = content[i]!
    if (ch === '\\' && i + 1 < content.length) {
      const next = content[i + 1]!
      parts.push(ESCAPE_DESCRIPTIONS[next] ?? `'${next}'`)
      i += 2
      continue
    }
    if (content[i + 1] === '-' && i + 2 < content.length && content[i + 2] !== undefined) {
      parts.push(`${ch}-${content[i + 2]}`)
      i += 3
      continue
    }
    parts.push(`'${ch}'`)
    i += 1
  }
  const list = parts.join(', ')
  return negated ? `any character except: ${list}` : `any of: ${list}`
}

// A minimal, deliberately linear (not a full parse tree) walk of the
// pattern -- groups are tracked only for indentation depth, alternation
// (`|`) is called out inline rather than restructured into branches. This
// mirrors how the "token-by-token" framing in the roadmap describes the
// feature: a sequential explanation a reader follows top to bottom, not a
// railroad diagram.
export function explainPattern(pattern: string): ExplainedToken[] {
  const tokens: ExplainedToken[] = []
  let depth = 0
  let groupCount = 0
  let i = 0

  function push(raw: string, description: string) {
    if (tokens.length >= MAX_TOKENS) return
    tokens.push({ raw, description, depth })
  }

  function withQuantifier(raw: string, atomDescription: string) {
    const q = readQuantifier(pattern, i + raw.length)
    if (!q) {
      push(raw, atomDescription)
      i += raw.length
      return
    }
    push(raw + q.raw, `${atomDescription}, ${describeQuantifier(q.base, q.lazy)}`)
    i += raw.length + q.raw.length
  }

  while (i < pattern.length && tokens.length < MAX_TOKENS) {
    const ch = pattern[i]!

    if (ch === '^') {
      push('^', 'the start of the string (or line, in multiline mode)')
      i += 1
      continue
    }
    if (ch === '$') {
      push('$', 'the end of the string (or line, in multiline mode)')
      i += 1
      continue
    }
    if (ch === '|') {
      push('|', 'OR -- try the next alternative if everything so far fails to match')
      i += 1
      continue
    }
    if (ch === '.') {
      withQuantifier('.', 'any character except a newline')
      continue
    }

    if (ch === '\\') {
      const next = pattern[i + 1]
      if (next === 'b') {
        push('\\b', 'a word boundary')
        i += 2
        continue
      }
      if (next === 'B') {
        push('\\B', 'a position that is NOT a word boundary')
        i += 2
        continue
      }
      if (next && /[1-9]/.test(next)) {
        const numMatch = /^\d+/.exec(pattern.slice(i + 1))!
        withQuantifier(`\\${numMatch[0]}`, `the same text matched by capture group ${numMatch[0]}`)
        continue
      }
      if (next === 'k' && pattern[i + 2] === '<') {
        const end = pattern.indexOf('>', i + 3)
        const name = end === -1 ? '' : pattern.slice(i + 3, end)
        const raw = end === -1 ? pattern.slice(i) : pattern.slice(i, end + 1)
        withQuantifier(raw, `the same text matched by the group named '${name}'`)
        continue
      }
      if (next !== undefined) {
        const desc = ESCAPE_DESCRIPTIONS[next] ?? `a literal '${next}' character`
        withQuantifier(`\\${next}`, desc)
        continue
      }
      push('\\', "a literal '\\'")
      i += 1
      continue
    }

    if (ch === '[') {
      let end = i + 1
      if (pattern[end] === '^') end += 1
      if (pattern[end] === ']') end += 1 // a leading ']' is a literal, not the closer
      while (end < pattern.length && pattern[end] !== ']') {
        if (pattern[end] === '\\') end += 1
        end += 1
      }
      const raw = pattern.slice(i, Math.min(end + 1, pattern.length))
      const body = raw.startsWith('[') && raw.endsWith(']') ? raw.slice(1, -1) : raw.slice(1)
      withQuantifier(raw, describeCharClassBody(body))
      continue
    }

    if (ch === '(') {
      groupCount += 1
      let raw: string
      let description: string
      let isGroup = true
      if (pattern[i + 1] === '?') {
        const marker = pattern.slice(i, i + 4)
        if (pattern[i + 2] === ':') {
          raw = '(?:'
          description = 'start a non-capturing group:'
        } else if (pattern[i + 2] === '=') {
          raw = '(?='
          description = 'lookahead -- must be followed by:'
        } else if (pattern[i + 2] === '!') {
          raw = '(?!'
          description = 'negative lookahead -- must NOT be followed by:'
        } else if (marker === '(?<=') {
          raw = '(?<='
          description = 'lookbehind -- must be preceded by:'
        } else if (marker === '(?<!') {
          raw = '(?<!'
          description = 'negative lookbehind -- must NOT be preceded by:'
        } else if (pattern[i + 2] === '<') {
          const end = pattern.indexOf('>', i + 3)
          const name = end === -1 ? '' : pattern.slice(i + 3, end)
          raw = end === -1 ? pattern.slice(i) : pattern.slice(i, end + 1)
          description = `start capturing group ${groupCount} (named '${name}'):`
        } else {
          raw = '(?'
          description = 'start a group:'
          isGroup = false
        }
      } else {
        raw = '('
        description = `start capturing group ${groupCount}:`
      }
      push(raw, description)
      if (isGroup) depth += 1
      i += raw.length
      continue
    }

    if (ch === ')') {
      depth = Math.max(0, depth - 1)
      withQuantifier(')', 'end group')
      continue
    }

    // Plain literal character (and its quantifier, if any).
    withQuantifier(ch, `the literal character '${ch}'`)
  }

  return tokens
}
