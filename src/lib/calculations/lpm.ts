import { networkAddress, parseCIDR, parseIPv4 } from '../validation/ip'
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
    const parsed = parseCIDR(route.cidr)
    if (!parsed) {
      return { ok: false, error: `"${route.cidr}" is not a valid CIDR block.` }
    }
    const routeNetwork = networkAddress(parsed.ip, parsed.prefixLength).value
    const destinationInRoute = networkAddress(destination, parsed.prefixLength).value
    matches.push({
      ...route,
      prefixLength: parsed.prefixLength,
      matches: destinationInRoute === routeNetwork,
    })
  }

  const winner = matches
    .filter((match) => match.matches)
    .reduce<LpmMatch | null>(
      (best, current) => (!best || current.prefixLength > best.prefixLength ? current : best),
      null,
    )

  return { ok: true, result: { destinationIp: destinationInput, matches, winner } }
}
