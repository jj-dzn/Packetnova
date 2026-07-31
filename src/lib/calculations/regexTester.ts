import type { CalculationResult } from './result'

export interface RegexMatch {
  match: string
  index: number
  groups: string[]
}

export interface RegexResult {
  matches: RegexMatch[]
}

const MAX_MATCHES = 10_000 // safety cap against pathological zero-width-match patterns

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

  return { ok: true, result: { matches } }
}
