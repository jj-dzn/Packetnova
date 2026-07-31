import type { CalculationResult } from './result'

export function urlEncode(text: string): string {
  return encodeURIComponent(text)
}

export function urlDecode(input: string): CalculationResult<string> {
  try {
    return { ok: true, result: decodeURIComponent(input) }
  } catch {
    return { ok: false, error: 'Not validly percent-encoded.' }
  }
}
