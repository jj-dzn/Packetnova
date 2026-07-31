import { diffLines } from 'diff'
import type { CalculationResult } from './result'

export interface DiffPart {
  value: string
  added: boolean
  removed: boolean
}

export function computeTextDiff(before: string, after: string): CalculationResult<DiffPart[]> {
  if (!before && !after) return { ok: false, error: 'Enter text in at least one side.' }

  const parts = diffLines(before, after)
  return {
    ok: true,
    result: parts.map((part) => ({
      value: part.value,
      added: Boolean(part.added),
      removed: Boolean(part.removed),
    })),
  }
}
