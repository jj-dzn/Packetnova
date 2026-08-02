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
  subnetMaskValue: number
  wildcardMask: string
  wildcardMaskValue: number
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
    const wildcardValue = ~mask.value >>> 0
    return {
      ok: true,
      result: {
        prefixLength,
        subnetMask: ipv4ToString(mask.value),
        subnetMaskValue: mask.value,
        wildcardMask: ipv4ToString(wildcardValue),
        wildcardMaskValue: wildcardValue,
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

  const wildcardValue = ~parsedMask.value >>> 0
  return {
    ok: true,
    result: {
      prefixLength,
      subnetMask: ipv4ToString(parsedMask.value),
      subnetMaskValue: parsedMask.value,
      wildcardMask: ipv4ToString(wildcardValue),
      wildcardMaskValue: wildcardValue,
    },
  }
}
