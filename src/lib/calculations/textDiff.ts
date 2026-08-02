import { diffChars, diffLines, diffWords } from 'diff'
import type { CalculationResult } from './result'

export interface DiffPart {
  value: string
  added: boolean
  removed: boolean
}

export type DiffGranularity = 'line' | 'word'

export function computeTextDiff(
  before: string,
  after: string,
  granularity: DiffGranularity = 'line',
): CalculationResult<DiffPart[]> {
  if (!before && !after) return { ok: false, error: 'Enter text in at least one side.' }

  const parts = granularity === 'word' ? diffWords(before, after) : diffLines(before, after)
  return {
    ok: true,
    result: parts.map((part) => ({
      value: part.value,
      added: Boolean(part.added),
      removed: Boolean(part.removed),
    })),
  }
}

/** Count of added/removed units in a diff -- lines for 'line' granularity,
 * words for 'word' -- for a one-line "+N -M" summary above the full diff. */
export function summarizeDiff(parts: DiffPart[], granularity: DiffGranularity) {
  const countUnits = (value: string) =>
    granularity === 'word'
      ? (value.trim().match(/\S+/g) ?? []).length
      : value.split('\n').filter((line) => line !== '').length

  let added = 0
  let removed = 0
  for (const part of parts) {
    if (part.added) added += countUnits(part.value)
    else if (part.removed) removed += countUnits(part.value)
  }
  return { added, removed }
}

// Character-level diff between two arbitrary strings -- used by tools whose
// "before" and "after" are a transformation of each other (URL/Base64
// encode-decode) rather than two independently-edited texts, so showing
// exactly which characters changed is more useful than a line-based diff.
export function computeCharDiff(before: string, after: string): CalculationResult<DiffPart[]> {
  if (!before && !after) return { ok: false, error: 'Enter text in at least one side.' }

  const parts = diffChars(before, after)
  return {
    ok: true,
    result: parts.map((part) => ({
      value: part.value,
      added: Boolean(part.added),
      removed: Boolean(part.removed),
    })),
  }
}
