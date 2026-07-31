export interface AdEntry {
  source: string
  distance: number
}

// Standard default administrative distances (Cisco convention, near-universal
// across vendors for these values). Lower always wins when a router learns
// the same destination network from more than one source.
export const administrativeDistances: AdEntry[] = [
  { source: 'Connected interface', distance: 0 },
  { source: 'Static route', distance: 1 },
  { source: 'EIGRP summary route', distance: 5 },
  { source: 'External BGP (eBGP)', distance: 20 },
  { source: 'Internal EIGRP', distance: 90 },
  { source: 'IGRP', distance: 100 },
  { source: 'OSPF', distance: 110 },
  { source: 'IS-IS', distance: 115 },
  { source: 'RIP', distance: 120 },
  { source: 'EGP', distance: 140 },
  { source: 'External EIGRP', distance: 170 },
  { source: 'Internal BGP (iBGP)', distance: 200 },
  { source: 'Unknown / unreachable', distance: 255 },
]
