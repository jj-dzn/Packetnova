import { parseIPv4 } from '../validation/ip'
import { matchRouteAgainstDestination } from './routeMatching'
import type { CalculationResult } from './result'

export interface RouteEntry {
  cidr: string
  label: string
}

export interface LpmMatch extends RouteEntry {
  prefixLength: number
  matches: boolean
}

export interface LpmResult {
  destinationIp: string
  matches: LpmMatch[]
  winner: LpmMatch | null
}

export function simulateLpm(
  destinationInput: string,
  routes: RouteEntry[],
): CalculationResult<LpmResult> {
  const destination = parseIPv4(destinationInput)
  if (!destination) {
    return { ok: false, error: 'Enter a valid destination IP address.' }
  }
  if (routes.length === 0) {
    return { ok: false, error: 'Add at least one route.' }
  }

  const matches: LpmMatch[] = []
  for (const route of routes) {
    const matched = matchRouteAgainstDestination(destination, route)
    if (!matched.ok) return matched
    matches.push(matched.match)
  }

  const winner = matches
    .filter((match) => match.matches)
    .reduce<LpmMatch | null>(
      (best, current) => (!best || current.prefixLength > best.prefixLength ? current : best),
      null,
    )

  return { ok: true, result: { destinationIp: destinationInput, matches, winner } }
}
