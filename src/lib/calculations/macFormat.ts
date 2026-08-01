import { formatMac, parseMac } from '../validation/mac'
import type { CalculationResult } from './result'

export interface MacFormatResult {
  colon: string
  hyphen: string
  dot: string
  bytes: number[]
}

export function formatMacAddress(input: string): CalculationResult<MacFormatResult> {
  const parsed = parseMac(input)
  if (!parsed) {
    return { ok: false, error: 'Enter a valid MAC address, e.g. 00:1a:2b:3c:4d:5e.' }
  }

  return {
    ok: true,
    result: {
      colon: formatMac(parsed.bytes, 'colon'),
      hyphen: formatMac(parsed.bytes, 'hyphen'),
      dot: formatMac(parsed.bytes, 'dot'),
      bytes: parsed.bytes,
    },
  }
}
