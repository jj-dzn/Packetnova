import {
  ipv4ToString,
  parseIPv4,
  prefixLengthToSubnetMask,
  subnetMaskToPrefixLength,
} from '../validation/ip'
import type { CalculationResult } from './result'

export interface WildcardMaskResult {
  prefixLength: number
  subnetMask: string
  wildcardMask: string
}

const PREFIX_SHORTHAND = /^\/?(\d{1,2})$/

export function calculateWildcardMask(input: string): CalculationResult<WildcardMaskResult> {
  const trimmed = input.trim()
  if (!trimmed) {
    return { ok: false, error: 'Enter a subnet mask or prefix length, e.g. 255.255.255.0 or /24.' }
  }

  const prefixMatch = PREFIX_SHORTHAND.exec(trimmed)
  if (prefixMatch) {
    const prefixLength = Number(prefixMatch[1])
    if (prefixLength > 32) {
      return { ok: false, error: 'Prefix length must be between 0 and 32.' }
    }
    const mask = prefixLengthToSubnetMask(prefixLength)
    return {
      ok: true,
      result: {
        prefixLength,
        subnetMask: ipv4ToString(mask.value),
        wildcardMask: ipv4ToString(~mask.value >>> 0),
      },
    }
  }

  const parsedMask = parseIPv4(trimmed)
  if (!parsedMask) {
    return { ok: false, error: `"${trimmed}" is not a valid subnet mask or prefix length.` }
  }

  const prefixLength = subnetMaskToPrefixLength(parsedMask)
  if (prefixLength === null) {
    return { ok: false, error: `"${trimmed}" is not a valid contiguous subnet mask.` }
  }

  return {
    ok: true,
    result: {
      prefixLength,
      subnetMask: ipv4ToString(parsedMask.value),
      wildcardMask: ipv4ToString(~parsedMask.value >>> 0),
    },
  }
}
