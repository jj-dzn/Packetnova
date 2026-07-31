import type { CalculationResult } from './result'

export function formatJson(input: string, mode: 'pretty' | 'minify'): CalculationResult<string> {
  try {
    const parsed: unknown = JSON.parse(input)
    return {
      ok: true,
      result: mode === 'pretty' ? JSON.stringify(parsed, null, 2) : JSON.stringify(parsed),
    }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Invalid JSON.' }
  }
}
