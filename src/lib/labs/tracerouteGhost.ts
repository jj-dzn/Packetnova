import { classifyLatency, type LatencyBand } from './pingPet'

export interface GhostHop {
  index: number
  label: string
  latencyMs: number
}

const HOP_LABEL_POOL = [
  'home-router.local',
  'isp-edge-1.net',
  'isp-core-3.net',
  'peering-exchange.net',
  'transit-provider.net',
  'regional-pop.net',
  'cloud-edge.net',
]

const MIN_INTERMEDIATE_HOPS = 4
const MAX_EXTRA_HOPS = 4

/**
 * Splits a real measured round-trip time across a handful of fake
 * intermediate hops so the ghost has somewhere to visibly pause -- the
 * total is real, the hops in between are simulated (no client-side
 * traceroute is possible from the browser).
 */
export function generateHops(totalMs: number, host: string): GhostHop[] {
  const intermediateCount = MIN_INTERMEDIATE_HOPS + Math.floor(Math.random() * MAX_EXTRA_HOPS)
  const segments = intermediateCount + 1
  const weights = Array.from({ length: segments }, () => 0.4 + Math.random())
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0)

  return weights.map((weight, i) => ({
    index: i + 1,
    label: i === segments - 1 ? host : HOP_LABEL_POOL[i % HOP_LABEL_POOL.length]!,
    latencyMs: Math.max(1, Math.round((weight / weightSum) * totalMs)),
  }))
}

export function overallTirednessBand(totalMs: number | null): LatencyBand {
  return classifyLatency(totalMs)
}
