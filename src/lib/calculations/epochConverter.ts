import type { CalculationResult } from './result'

export interface EpochResult {
  epochSeconds: number
  epochMillis: number
  iso: string
  utc: string
}

function fromMillis(ms: number): EpochResult {
  const date = new Date(ms)
  return {
    epochSeconds: Math.floor(ms / 1000),
    epochMillis: Math.floor(ms),
    iso: date.toISOString(),
    utc: date.toUTCString(),
  }
}

export function epochToDate(
  epochInput: number,
  unit: 'seconds' | 'milliseconds',
): CalculationResult<EpochResult> {
  if (!Number.isFinite(epochInput)) return { ok: false, error: 'Enter a valid number.' }
  const ms = unit === 'seconds' ? epochInput * 1000 : epochInput
  if (Number.isNaN(new Date(ms).getTime()))
    return { ok: false, error: 'That value is out of range for a date.' }
  return { ok: true, result: fromMillis(ms) }
}

export function dateToEpoch(dateInput: string): CalculationResult<EpochResult> {
  const date = new Date(dateInput)
  if (Number.isNaN(date.getTime())) return { ok: false, error: 'Enter a valid date/time.' }
  return { ok: true, result: fromMillis(date.getTime()) }
}
