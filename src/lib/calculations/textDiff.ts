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

export interface AlignedDiffRow {
  leftNumber: number | null
  leftText: string | null
  rightNumber: number | null
  rightText: string | null
  type: 'same' | 'added' | 'removed' | 'modified'
}

// diffLines' chunks are newline-terminated (except possibly the very last
// line of the whole input), so a plain split('\n') leaves one bogus empty
// trailing entry whenever the chunk actually ended in '\n' -- drop just
// that one, not any genuine blank lines in the middle.
function splitLines(value: string): string[] {
  const lines = value.split('\n')
  if (value.endsWith('\n')) lines.pop()
  return lines
}

/**
 * A Notepad++-style side-by-side alignment: every row is a position on a
 * shared line-number axis for both sides, so the two panes stay in lockstep
 * even after an insertion or deletion -- the side missing a line at that
 * position gets a blank cell instead of the whole column drifting out of
 * sync. A removed chunk immediately followed by an added chunk (jsdiff's
 * shape for "this line became that line") is paired up position-by-position
 * as 'modified' rows; whichever side has extra lines left over past the
 * shorter chunk's length falls back to plain 'removed'/'added' rows.
 */
export function buildAlignedDiffRows(
  before: string,
  after: string,
): CalculationResult<AlignedDiffRow[]> {
  if (!before && !after) return { ok: false, error: 'Enter text in at least one side.' }

  const parts = diffLines(before, after)
  const rows: AlignedDiffRow[] = []
  let leftNumber = 1
  let rightNumber = 1
  let i = 0

  while (i < parts.length) {
    const part = parts[i]!

    if (!part.added && !part.removed) {
      for (const line of splitLines(part.value)) {
        rows.push({
          leftNumber: leftNumber++,
          leftText: line,
          rightNumber: rightNumber++,
          rightText: line,
          type: 'same',
        })
      }
      i++
      continue
    }

    if (part.removed) {
      const removedLines = splitLines(part.value)
      const next = parts[i + 1]
      const addedLines = next?.added ? splitLines(next.value) : []
      const pairCount = Math.min(removedLines.length, addedLines.length)

      for (let k = 0; k < pairCount; k++) {
        rows.push({
          leftNumber: leftNumber++,
          leftText: removedLines[k]!,
          rightNumber: rightNumber++,
          rightText: addedLines[k]!,
          type: 'modified',
        })
      }
      for (let k = pairCount; k < removedLines.length; k++) {
        rows.push({
          leftNumber: leftNumber++,
          leftText: removedLines[k]!,
          rightNumber: null,
          rightText: null,
          type: 'removed',
        })
      }
      for (let k = pairCount; k < addedLines.length; k++) {
        rows.push({
          leftNumber: null,
          leftText: null,
          rightNumber: rightNumber++,
          rightText: addedLines[k]!,
          type: 'added',
        })
      }
      i += next?.added ? 2 : 1
      continue
    }

    // A standalone added chunk -- not preceded by a removed chunk, so
    // there's nothing on the left to pair it with at all.
    for (const line of splitLines(part.value)) {
      rows.push({
        leftNumber: null,
        leftText: null,
        rightNumber: rightNumber++,
        rightText: line,
        type: 'added',
      })
    }
    i++
  }

  return { ok: true, result: rows }
}

export function summarizeAlignedRows(rows: AlignedDiffRow[]) {
  let added = 0
  let removed = 0
  let modified = 0
  for (const row of rows) {
    if (row.type === 'added') added++
    else if (row.type === 'removed') removed++
    else if (row.type === 'modified') modified++
  }
  return { added, removed, modified }
}

/** Word-level diff between two individual lines -- used to highlight just
 * the words that changed within a 'modified' aligned row, the same way
 * Notepad++'s compare plugin highlights sub-line changes instead of
 * tinting the whole line as one opaque block. */
export function diffLineWords(left: string, right: string): DiffPart[] {
  return diffWords(left, right).map((part) => ({
    value: part.value,
    added: Boolean(part.added),
    removed: Boolean(part.removed),
  }))
}
