import type { CalculationResult } from './result'

export interface RegexMatch {
  match: string
  index: number
  groups: string[]
}

export interface RegexResult {
  matches: RegexMatch[]
  /** One entry per capturing group, in order -- the group's name if it was
   * written as `(?<name>...)`, otherwise null. Same for every match (it
   * comes from the pattern, not the input text), so it's returned once
   * here rather than repeated on each match. */
  groupNames: (string | null)[]
}

const MAX_MATCHES = 10_000 // safety cap against pathological zero-width-match patterns

// Walks the pattern source to find each capturing group's name (or null for
// an unnamed one), in the same left-to-right order JS assigns numbered
// groups -- neither RegExp nor a match result exposes this mapping
// directly, only the *values* of named groups (via match.groups, keyed by
// name, with no positional info). Skips non-capturing (?:...), lookahead
// (?=...)/(?!...), and lookbehind (?<=...)/(?<!...), none of which consume
// a numbered slot; also skips escaped parens and anything inside a
// character class, where '(' is a literal character rather than group syntax.
function parseCaptureGroupNames(source: string): (string | null)[] {
  const names: (string | null)[] = []
  let inClass = false
  let i = 0
  while (i < source.length) {
    const ch = source[i]!
    if (ch === '\\') {
      i += 2
      continue
    }
    if (inClass) {
      if (ch === ']') inClass = false
      i += 1
      continue
    }
    if (ch === '[') {
      inClass = true
      i += 1
      continue
    }
    if (ch === '(') {
      if (source[i + 1] === '?') {
        if (source[i + 2] === '<' && source[i + 3] !== '=' && source[i + 3] !== '!') {
          const end = source.indexOf('>', i + 3)
          names.push(end === -1 ? null : source.slice(i + 3, end))
          i = end === -1 ? i + 1 : end + 1
          continue
        }
        i += 1 // non-capturing, lookahead, or lookbehind -- not a capture group
        continue
      }
      names.push(null)
      i += 1
      continue
    }
    i += 1
  }
  return names
}

export function testRegex(
  pattern: string,
  flags: string,
  text: string,
): CalculationResult<RegexResult> {
  let regex: RegExp
  try {
    regex = new RegExp(pattern, flags.includes('g') ? flags : `${flags}g`)
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Invalid regular expression.',
    }
  }

  const matches: RegexMatch[] = []
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    matches.push({ match: match[0], index: match.index, groups: match.slice(1) })
    if (match[0] === '') regex.lastIndex += 1 // avoid an infinite loop on zero-width matches
    if (matches.length >= MAX_MATCHES) break
  }

  return { ok: true, result: { matches, groupNames: parseCaptureGroupNames(pattern) } }
}
