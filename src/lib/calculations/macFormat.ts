import { formatMac, parseMac } from '../validation/mac'
import type { CalculationResult } from './result'

export interface MacFormatResult {
  colon: string
  hyphen: string
  dot: string
  bytes: number[]
  /** What separator the input actually used, detected from the raw string
   * before parseMac strips it -- shown back to the user as a small trust
   * signal that the parser understood their input the way they meant it,
   * since parseMac itself accepts any of these interchangeably. */
  detectedFormat: string
}

function detectMacFormat(input: string): string {
  const trimmed = input.trim()
  if (trimmed.includes(':')) return 'colon-separated'
  if (trimmed.includes('-')) return 'hyphen-separated'
  if (trimmed.includes('.')) return 'dot-separated (Cisco)'
  return 'bare hex, no separators'
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
      detectedFormat: detectMacFormat(input),
    },
  }
}
