import type { CalculationResult } from './result'

export interface BaseConverterResult {
  binary: string
  octal: string
  decimal: string
  hex: string
}

const VALID_DIGITS: Record<number, RegExp> = {
  2: /^[01]+$/,
  8: /^[0-7]+$/,
  10: /^[0-9]+$/,
  16: /^[0-9a-fA-F]+$/,
}

export function convertBase(
  value: string,
  fromBase: 2 | 8 | 10 | 16,
): CalculationResult<BaseConverterResult> {
  const trimmed = value.trim()
  if (!trimmed) return { ok: false, error: 'Enter a value.' }
  const pattern = VALID_DIGITS[fromBase]
  if (!pattern || !pattern.test(trimmed)) {
    return { ok: false, error: `"${trimmed}" is not a valid base-${fromBase} number.` }
  }

  const decimalValue = parseInt(trimmed, fromBase)
  if (!Number.isSafeInteger(decimalValue)) {
    return { ok: false, error: 'That number is too large to convert precisely.' }
  }

  return {
    ok: true,
    result: {
      binary: decimalValue.toString(2),
      octal: decimalValue.toString(8),
      decimal: decimalValue.toString(10),
      hex: decimalValue.toString(16),
    },
  }
}
