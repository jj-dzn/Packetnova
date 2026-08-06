import { networkAddress, parseCIDR, type ParsedIPv4 } from '../validation/ip'

export interface RouteCidrEntry {
  cidr: string
}

export interface RouteMatchFields {
  prefixLength: number
  matches: boolean
}

// Shared by the LPM simulator and the route lookup simulator -- both
// independently need "does this route's network contain the destination,
// and at what prefix length" for a single route before either one applies
// its own winner logic on top (the LPM simulator just wants the longest
// match; the route lookup simulator additionally tie-breaks by
// administrative distance). Operating per-route rather than over the whole
// list keeps each caller free to interleave its own per-route validation
// (route lookup validates administrative distance) in whatever order it
// already did, instead of forcing one fixed validation order on both.
export function matchRouteAgainstDestination<T extends RouteCidrEntry>(
  destination: ParsedIPv4,
  route: T,
): { ok: true; match: T & RouteMatchFields } | { ok: false; error: string } {
  const parsed = parseCIDR(route.cidr)
  if (!parsed) {
    return { ok: false, error: `"${route.cidr}" is not a valid CIDR block.` }
  }
  const routeNetwork = networkAddress(parsed.ip, parsed.prefixLength).value
  const destinationInRoute = networkAddress(destination, parsed.prefixLength).value
  return {
    ok: true,
    match: {
      ...route,
      prefixLength: parsed.prefixLength,
      matches: destinationInRoute === routeNetwork,
    },
  }
}
