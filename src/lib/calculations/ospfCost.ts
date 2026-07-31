import type { CalculationResult } from './result'

export interface OspfCostResult {
  referenceBandwidthMbps: number
  interfaceBandwidthMbps: number
  cost: number
}

// Cost = reference bandwidth / interface bandwidth, floored, with a minimum
// of 1 (a router will never assign a cost of 0). The default reference
// bandwidth is 100 Mbps -- notably too low for modern high-speed links,
// where every interface floors out at cost 1, which is exactly why real
// deployments raise it via `auto-cost reference-bandwidth`.
export function calculateOspfCost(
  referenceBandwidthMbps: number,
  interfaceBandwidthMbps: number,
): CalculationResult<OspfCostResult> {
  if (!Number.isFinite(referenceBandwidthMbps) || referenceBandwidthMbps <= 0) {
    return { ok: false, error: 'Reference bandwidth must be greater than 0.' }
  }
  if (!Number.isFinite(interfaceBandwidthMbps) || interfaceBandwidthMbps <= 0) {
    return { ok: false, error: 'Interface bandwidth must be greater than 0.' }
  }

  const cost = Math.max(1, Math.floor(referenceBandwidthMbps / interfaceBandwidthMbps))

  return { ok: true, result: { referenceBandwidthMbps, interfaceBandwidthMbps, cost } }
}
