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

export interface StpLink {
  from: string
  to: string
  cost: number
}

export type StpPortRoleName = 'root' | 'designated' | 'blocked'

export interface StpPort {
  bridgeId: string
  neighborId: string
  cost: number
  role: StpPortRoleName
}

export interface StpTopologyResult {
  rootBridgeId: string
  costToRoot: Record<string, number>
  ports: StpPort[]
}

function shortestCostToRoot(
  rootId: string,
  bridgeIds: string[],
  links: StpLink[],
): Record<string, number> {
  const adjacency = new Map<string, { to: string; cost: number }[]>()
  for (const id of bridgeIds) adjacency.set(id, [])
  for (const link of links) {
    adjacency.get(link.from)?.push({ to: link.to, cost: link.cost })
    adjacency.get(link.to)?.push({ to: link.from, cost: link.cost })
  }

  const cost: Record<string, number> = { [rootId]: 0 }
  const visited = new Set<string>()

  while (visited.size < bridgeIds.length) {
    let current: string | null = null
    let currentCost = Infinity
    for (const id of bridgeIds) {
      if (visited.has(id)) continue
      const c = cost[id]
      if (c !== undefined && c < currentCost) {
        current = id
        currentCost = c
      }
    }
    if (current === null) break // unreachable bridges left out of the result

    visited.add(current)
    for (const { to, cost: linkCost } of adjacency.get(current) ?? []) {
      if (visited.has(to)) continue
      const candidate = currentCost + linkCost
      if (cost[to] === undefined || candidate < cost[to]!) cost[to] = candidate
    }
  }

  return cost
}

/**
 * Computes what STP's port-blocking prose actually means for a concrete
 * topology: every non-root bridge gets exactly one root port (its cheapest
 * path back to the root), every segment gets exactly one designated port
 * (whichever side is closer to the root), and everything else blocks.
 * Ties are broken by lowest bridge ID, same convention as root election.
 */
export function computeStpPortRoles(
  candidates: BridgeCandidate[],
  links: StpLink[],
): CalculationResult<StpTopologyResult> {
  const rootResult = electRootBridge(candidates)
  if (!rootResult.ok) return rootResult

  const bridgeIds = candidates.map((c) => c.id)
  const rootId = rootResult.result.rootBridgeId
  const costToRoot = shortestCostToRoot(rootId, bridgeIds, links)

  const ports: StpPort[] = []

  for (const link of links) {
    const costA = costToRoot[link.from]
    const costB = costToRoot[link.to]
    if (costA === undefined || costB === undefined) continue // unreachable side, no port role

    // The side closer to the root is designated for this segment; the
    // farther side either uses this link as its root port, or -- if its
    // root port lies elsewhere -- blocks.
    const fromIsCloser = costA < costB || (costA === costB && link.from < link.to)
    const designatedSide = fromIsCloser ? link.from : link.to
    const otherSide = fromIsCloser ? link.to : link.from
    const otherCost = fromIsCloser ? costB : costA

    ports.push({
      bridgeId: designatedSide,
      neighborId: otherSide,
      cost: costToRoot[designatedSide]!,
      role: 'designated',
    })

    const isOthersRootPort =
      otherSide !== rootId && otherCost === costToRoot[designatedSide]! + link.cost
    ports.push({
      bridgeId: otherSide,
      neighborId: designatedSide,
      cost: otherCost,
      role: otherSide === rootId ? 'designated' : isOthersRootPort ? 'root' : 'blocked',
    })
  }

  // A bridge can have more than one link that ties for its cheapest path to
  // root -- 802.1D breaks that tie by the lowest bridge ID on the other end
  // of the link (same "lower id wins" convention already used for the
  // per-segment designated-port tie-break above), not by whichever port
  // happened to come first in the input.
  const rootPortsByBridge = new Map<string, StpPort[]>()
  for (const port of ports) {
    if (port.role !== 'root') continue
    const existing = rootPortsByBridge.get(port.bridgeId)
    if (existing) existing.push(port)
    else rootPortsByBridge.set(port.bridgeId, [port])
  }
  for (const candidates of rootPortsByBridge.values()) {
    if (candidates.length <= 1) continue
    const lowestNeighborId = candidates.reduce((a, b) =>
      a.neighborId < b.neighborId ? a : b,
    ).neighborId
    for (const port of candidates) {
      if (port.neighborId !== lowestNeighborId) port.role = 'blocked'
    }
  }

  return { ok: true, result: { rootBridgeId: rootId, costToRoot, ports } }
}
