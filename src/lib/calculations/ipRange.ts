import { ipv4ToString, parseIPv4 } from '../validation/ip'
import type { CalculationResult } from './result'

export interface CidrBlock {
  cidr: string
  networkAddress: string
  prefixLength: number
}

export interface IpRangeResult {
  startIp: string
  endIp: string
  totalAddresses: number
  cidrBlocks: CidrBlock[]
}

function trailingZeroBits(value: number): number {
  if (value === 0) return 32
  let count = 0
  let remaining = value >>> 0
  while ((remaining & 1) === 0 && count < 32) {
    remaining = remaining >>> 1
    count++
  }
  return count
}

/**
 * Decomposes [start, end] into the minimal set of CIDR blocks that cover it
 * exactly, using the standard greedy alignment algorithm: at each step, take
 * the largest block that both starts at the current address and fits within
 * what's left of the range. Exported so the route summarizer can reuse the
 * same decomposition after merging overlapping/adjacent input ranges.
 */
export function rangeToBlocks(
  start: number,
  end: number,
): { network: number; prefixLength: number }[] {
  const blocks: { network: number; prefixLength: number }[] = []
  let current = start

  while (current <= end) {
    const alignmentBits = trailingZeroBits(current)
    const remaining = end - current + 1

    let sizeBits = alignmentBits
    while (2 ** sizeBits > remaining) {
      sizeBits--
    }

    blocks.push({ network: current, prefixLength: 32 - sizeBits })
    current += 2 ** sizeBits
  }

  return blocks
}

export function calculateIpRange(
  startInput: string,
  endInput: string,
): CalculationResult<IpRangeResult> {
  const start = parseIPv4(startInput)
  if (!start) {
    return { ok: false, error: 'Enter a valid start IP address.' }
  }

  const end = parseIPv4(endInput)
  if (!end) {
    return { ok: false, error: 'Enter a valid end IP address.' }
  }

  if (start.value > end.value) {
    return { ok: false, error: 'Start address must come before (or equal) the end address.' }
  }

  const blocks = rangeToBlocks(start.value, end.value).map(({ network, prefixLength }) => {
    const networkAddress = ipv4ToString(network)
    return { cidr: `${networkAddress}/${prefixLength}`, networkAddress, prefixLength }
  })

  return {
    ok: true,
    result: {
      startIp: ipv4ToString(start.value),
      endIp: ipv4ToString(end.value),
      totalAddresses: end.value - start.value + 1,
      cidrBlocks: blocks,
    },
  }
}
