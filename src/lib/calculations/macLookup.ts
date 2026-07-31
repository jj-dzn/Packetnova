import { formatMac, isLocallyAdministered, isMulticast, parseMac } from '../validation/mac'
import { knownOuis } from '../../content/reference/ouiVendors'
import type { CalculationResult } from './result'

export interface MacLookupResult {
  oui: string
  nicSpecific: string
  isMulticast: boolean
  isLocallyAdministered: boolean
  vendor: string | null
}

export function lookupMac(input: string): CalculationResult<MacLookupResult> {
  const parsed = parseMac(input)
  if (!parsed) {
    return { ok: false, error: 'Enter a valid MAC address, e.g. 00:1a:2b:3c:4d:5e.' }
  }

  const [b0, b1, b2, b3, b4, b5] = parsed.bytes
  const oui = formatMac([b0, b1, b2], 'colon')
  const nicSpecific = formatMac([b3, b4, b5], 'colon')

  return {
    ok: true,
    result: {
      oui,
      nicSpecific,
      isMulticast: isMulticast(b0),
      isLocallyAdministered: isLocallyAdministered(b0),
      vendor: knownOuis[oui] ?? null,
    },
  }
}
