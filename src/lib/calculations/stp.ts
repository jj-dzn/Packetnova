import { parseMac } from '../validation/mac'
import type { CalculationResult } from './result'

export interface BridgeCandidate {
  id: string
  priority: number
  macAddress: string
}

export interface StpResult {
  rootBridgeId: string
  decidedBy: 'priority' | 'mac-address'
}

// The Bridge ID is priority (lower wins) followed by MAC address as the
// tiebreaker (lower wins) -- MAC is compared numerically via the shared
// parser, not as a string.
export function electRootBridge(candidates: BridgeCandidate[]): CalculationResult<StpResult> {
  if (candidates.length === 0) {
    return { ok: false, error: 'Add at least one bridge.' }
  }

  for (const candidate of candidates) {
    if (
      !Number.isInteger(candidate.priority) ||
      candidate.priority < 0 ||
      candidate.priority > 65535
    ) {
      return { ok: false, error: `"${candidate.id}" needs a valid priority (0-65535).` }
    }
    if (!parseMac(candidate.macAddress)) {
      return { ok: false, error: `"${candidate.macAddress}" is not a valid MAC address.` }
    }
  }

  if (candidates.length === 1) {
    return { ok: true, result: { rootBridgeId: candidates[0]!.id, decidedBy: 'priority' } }
  }

  const lowestPriority = Math.min(...candidates.map((c) => c.priority))
  const tied = candidates.filter((c) => c.priority === lowestPriority)

  if (tied.length === 1) {
    return { ok: true, result: { rootBridgeId: tied[0]!.id, decidedBy: 'priority' } }
  }

  const lowestMacValue = Math.min(...tied.map((c) => parseMac(c.macAddress)!.value))
  const winner = tied.find((c) => parseMac(c.macAddress)!.value === lowestMacValue)!

  return { ok: true, result: { rootBridgeId: winner.id, decidedBy: 'mac-address' } }
}
