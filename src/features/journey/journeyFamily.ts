import type { JourneyFamilyLink } from './JourneyShell'

// The full family of named journeys, in one place -- each journey page
// filters itself out via otherJourneys() rather than every page keeping
// its own hand-trimmed list, so adding a journey here is enough to cross
// -link it from every other one automatically.
export const JOURNEYS: JourneyFamilyLink[] = [
  {
    to: '/journey',
    title: "Follow a packet's journey",
    description:
      'The flagship walkthrough -- one request, start to finish, across every layer this site teaches separately.',
  },
  {
    to: '/journey/nat',
    title: 'Inside a NAT translation',
    description:
      'One private address hiding behind one public one, connection table and all -- and how the reply finds its way back.',
  },
  {
    to: '/journey/vpn-tunnel',
    title: 'Inside a VPN tunnel',
    description:
      'A whole packet wrapped inside another one, encrypted, and unwrapped again at the other end of a site-to-site link.',
  },
  {
    to: '/journey/bgp-path',
    title: 'Inside a BGP path decision',
    description:
      'The same prefix arrives from three neighbors. Walk the attribute-by-attribute tiebreak that picks the winner.',
  },
]

export function otherJourneys(currentPath: string): JourneyFamilyLink[] {
  return JOURNEYS.filter((journey) => journey.to !== currentPath)
}
