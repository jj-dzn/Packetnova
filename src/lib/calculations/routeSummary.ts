import {
  broadcastAddress,
  ipv4ToString,
  networkAddress,
  parseCIDR,
  parseIPv4,
} from '../validation/ip'
import { rangeToBlocks } from './ipRange'
import type { CalculationResult } from './result'

export interface RouteMergeGroup {
  /** Original input lines that collapsed into this one contiguous span. */
  inputs: string[]
  /** The output CIDR block(s) covering that span -- more than one when the
   * span doesn't land on a single power-of-2-aligned boundary. */
  outputs: string[]
}

export interface RouteSummaryResult {
  inputCount: number
  summarizedRoutes: string[]
  reductionCount: number
  /** Which inputs collapsed into which outputs -- the merge-map visual
   * needs this grouping, not just the flat before/after counts. */
  mergeGroups: RouteMergeGroup[]
}

interface AddressRange {
  start: number
  end: number
  inputs: string[]
}

/** Exported for the number-line visual, which needs the same start/end
 * range math to position each input/output block proportionally. */
export function parseLineToRange(line: string): Omit<AddressRange, 'inputs'> | null {
  const cidr = parseCIDR(line)
  if (cidr) {
    const { ip, prefixLength } = cidr
    return {
      start: networkAddress(ip, prefixLength).value,
      end: broadcastAddress(ip, prefixLength).value,
    }
  }

  const ip = parseIPv4(line)
  if (ip) {
    return { start: ip.value, end: ip.value }
  }

  return null
}

// Standard interval-merge: sort by start, then fold in any range that
// starts at or before (end + 1) of the range being built -- "+1" so two
// exactly-adjacent blocks (e.g. .0/25 and .128/25) merge into one span
// instead of staying as separate neighbors. Each merged span keeps the
// list of original input lines that fed into it, for the merge-map visual.
function mergeRanges(ranges: AddressRange[]): AddressRange[] {
  const sorted = [...ranges].sort((a, b) => a.start - b.start)
  const merged: AddressRange[] = []

  for (const range of sorted) {
    const last = merged[merged.length - 1]
    if (last && range.start <= last.end + 1) {
      last.end = Math.max(last.end, range.end)
      last.inputs.push(...range.inputs)
    } else {
      merged.push({ ...range, inputs: [...range.inputs] })
    }
  }

  return merged
}

export function summarizeRoutes(input: string): CalculationResult<RouteSummaryResult> {
  const lines = input
    .split(/[\n,]+/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length === 0) {
    return { ok: false, error: 'Enter at least one IP address or CIDR block, one per line.' }
  }

  const ranges: AddressRange[] = []
  for (const line of lines) {
    const range = parseLineToRange(line)
    if (!range) {
      return { ok: false, error: `"${line}" is not a valid IP address or CIDR block.` }
    }
    ranges.push({ ...range, inputs: [line] })
  }

  const merged = mergeRanges(ranges)
  const mergeGroups: RouteMergeGroup[] = merged.map(({ start, end, inputs }) => ({
    inputs,
    outputs: rangeToBlocks(start, end).map(
      ({ network, prefixLength }) => `${ipv4ToString(network)}/${prefixLength}`,
    ),
  }))
  const summarizedRoutes = mergeGroups.flatMap((group) => group.outputs)

  return {
    ok: true,
    result: {
      inputCount: lines.length,
      summarizedRoutes,
      reductionCount: lines.length - summarizedRoutes.length,
      mergeGroups,
    },
  }
}
