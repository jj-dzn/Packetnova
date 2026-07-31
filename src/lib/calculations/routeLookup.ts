import { networkAddress, parseCIDR, parseIPv4 } from '../validation/ip'
import type { CalculationResult } from './result'

export interface RouteLookupEntry {
  cidr: string
  administrativeDistance: number
  label: string
}

export interface RouteLookupMatch extends RouteLookupEntry {
  prefixLength: number
  matches: boolean
}

export interface RouteLookupResult {
  destinationIp: string
  matches: RouteLookupMatch[]
  winner: RouteLookupMatch | null
  decidedBy: 'longest-prefix' | 'administrative-distance' | null
}

/**
 * Longest prefix match always decides between routes to networks of
 * different specificity, regardless of administrative distance -- AD only
 * breaks ties between routes tied at the same, longest matching prefix
 * length (i.e. routes to the exact same network from different sources).
 */
export function simulateRouteLookup(
  destinationInput: string,
  routes: RouteLookupEntry[],
): CalculationResult<RouteLookupResult> {
  const destination = parseIPv4(destinationInput)
  if (!destination) {
    return { ok: false, error: 'Enter a valid destination IP address.' }
  }
  if (routes.length === 0) {
    return { ok: false, error: 'Add at least one route.' }
  }

  const matches: RouteLookupMatch[] = []
  for (const route of routes) {
    const parsed = parseCIDR(route.cidr)
    if (!parsed) {
      return { ok: false, error: `"${route.cidr}" is not a valid CIDR block.` }
    }
    if (!Number.isFinite(route.administrativeDistance) || route.administrativeDistance < 0) {
      return { ok: false, error: `"${route.label}" needs a valid administrative distance.` }
    }
    const routeNetwork = networkAddress(parsed.ip, parsed.prefixLength).value
    const destinationInRoute = networkAddress(destination, parsed.prefixLength).value
    matches.push({
      ...route,
      prefixLength: parsed.prefixLength,
      matches: destinationInRoute === routeNetwork,
    })
  }

  const matching = matches.filter((match) => match.matches)
  if (matching.length === 0) {
    return {
      ok: true,
      result: { destinationIp: destinationInput, matches, winner: null, decidedBy: null },
    }
  }

  const longestPrefix = Math.max(...matching.map((match) => match.prefixLength))
  const longestMatches = matching.filter((match) => match.prefixLength === longestPrefix)

  let winner: RouteLookupMatch
  let decidedBy: 'longest-prefix' | 'administrative-distance'

  if (longestMatches.length === 1) {
    winner = longestMatches[0]!
    decidedBy = 'longest-prefix'
  } else {
    const lowestDistance = Math.min(...longestMatches.map((match) => match.administrativeDistance))
    winner = longestMatches.find((match) => match.administrativeDistance === lowestDistance)!
    decidedBy = 'administrative-distance'
  }

  return { ok: true, result: { destinationIp: destinationInput, matches, winner, decidedBy } }
}
