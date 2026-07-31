import { prefixLengthToSubnetMask } from '../validation/ip'

export interface IPv4Classification {
  label: string
  cidr: string
  /** What this range actually means in practice -- not just its name. */
  explanation: string
}

interface RawRange {
  cidr: string
  label: string
  explanation: string
}

interface SpecialRange extends RawRange {
  network: number
  prefixLength: number
}

const PUBLIC_EXPLANATION =
  'A normal, globally routable address -- reachable directly from anywhere on the public internet without NAT.'

// IANA special-purpose IPv4 address registry (RFC 5735 / RFC 6890 and the
// RFCs referenced below) -- the ranges most engineers actually run into.
// Not exhaustive (the full registry has ~30 entries), but covers what a
// tool like this needs to flag.
const RAW_RANGES: RawRange[] = [
  {
    cidr: '0.0.0.0/8',
    label: 'Current network (RFC 791)',
    explanation:
      'Reserved for referring to "this network" in specific bootstrapping contexts -- not something you would assign to a host.',
  },
  {
    cidr: '10.0.0.0/8',
    label: 'Private use (RFC 1918)',
    explanation:
      'Not routable on the public internet -- traffic to or from this address needs NAT to reach anything outside your own network.',
  },
  {
    cidr: '100.64.0.0/10',
    label: 'Shared address space / CGNAT (RFC 6598)',
    explanation:
      "Used by ISPs for carrier-grade NAT between customer networks and the public internet -- kept separate from RFC 1918 space specifically so the two never collide when an ISP's own network also uses private addressing.",
  },
  {
    cidr: '127.0.0.0/8',
    label: 'Loopback (RFC 1122)',
    explanation:
      'Always refers back to the local machine itself -- traffic never actually leaves the device, let alone the network.',
  },
  {
    cidr: '169.254.0.0/16',
    label: 'Link-local (RFC 3927)',
    explanation:
      "Self-assigned when a device can't reach a DHCP server (APIPA) -- valid only on the local segment and never routed anywhere.",
  },
  {
    cidr: '172.16.0.0/12',
    label: 'Private use (RFC 1918)',
    explanation:
      'Not routable on the public internet -- traffic to or from this address needs NAT to reach anything outside your own network.',
  },
  {
    cidr: '192.0.0.0/24',
    label: 'IETF protocol assignments (RFC 6890)',
    explanation: 'Reserved for IETF protocol use, not for general assignment on a real network.',
  },
  {
    cidr: '192.0.2.0/24',
    label: 'Documentation -- TEST-NET-1 (RFC 5737)',
    explanation:
      'Reserved specifically for documentation and examples -- guaranteed to never be a real, routable address, which is why it shows up in so many RFCs and tutorials instead of a made-up one.',
  },
  {
    cidr: '192.88.99.0/24',
    label: '6to4 relay anycast (RFC 3068)',
    explanation:
      'Used by 6to4 relay routers to bridge IPv4 and IPv6 networks -- largely a legacy transition mechanism at this point.',
  },
  {
    cidr: '192.168.0.0/16',
    label: 'Private use (RFC 1918)',
    explanation:
      'Not routable on the public internet -- traffic to or from this address needs NAT to reach anything outside your own network.',
  },
  {
    cidr: '198.18.0.0/15',
    label: 'Benchmarking (RFC 2544)',
    explanation:
      'Reserved for network device benchmarking, so test traffic never collides with real production or documentation addresses.',
  },
  {
    cidr: '198.51.100.0/24',
    label: 'Documentation -- TEST-NET-2 (RFC 5737)',
    explanation:
      'Reserved specifically for documentation and examples -- guaranteed to never be a real, routable address.',
  },
  {
    cidr: '203.0.113.0/24',
    label: 'Documentation -- TEST-NET-3 (RFC 5737)',
    explanation:
      'Reserved specifically for documentation and examples -- guaranteed to never be a real, routable address.',
  },
  {
    cidr: '224.0.0.0/4',
    label: 'Multicast (RFC 5771)',
    explanation:
      'Delivered to every member of a multicast group at once, not a single host -- a destination for a group subscription, not something you would assign to an interface.',
  },
  {
    cidr: '240.0.0.0/4',
    label: 'Reserved for future use (RFC 1112)',
    explanation:
      'Reserved by the IETF and not assignable -- you should never see this in normal production traffic.',
  },
  {
    cidr: '255.255.255.255/32',
    label: 'Limited broadcast (RFC 8190)',
    explanation:
      "Reaches every host on the local network segment, but never crosses a router -- distinct from a subnet's own directed broadcast address (see the Broadcast calculator).",
  },
]

function parseRangeLiteral(cidr: string): { network: number; prefixLength: number } {
  const [ipPart, prefixPart] = cidr.split('/') as [string, string]
  const octets = ipPart.split('.').map(Number)
  const [a, b, c, d] = octets as [number, number, number, number]
  const network = ((a * 2 ** 24 + b * 2 ** 16 + c * 2 ** 8 + d) >>> 0) as number
  return { network, prefixLength: Number(prefixPart) }
}

// Sorted most-specific first (longest prefix length) so overlapping ranges
// -- e.g. 255.255.255.255/32 sitting inside 240.0.0.0/4 -- resolve to the
// more specific label.
const SPECIAL_RANGES: SpecialRange[] = RAW_RANGES.map((raw) => ({
  ...raw,
  ...parseRangeLiteral(raw.cidr),
})).sort((a, b) => b.prefixLength - a.prefixLength)

export function classifyIPv4(value: number): IPv4Classification {
  const normalized = value >>> 0
  for (const range of SPECIAL_RANGES) {
    const mask = prefixLengthToSubnetMask(range.prefixLength).value
    if ((normalized & mask) >>> 0 === range.network) {
      return { label: range.label, cidr: range.cidr, explanation: range.explanation }
    }
  }
  return { label: 'Public (global unicast)', cidr: '', explanation: PUBLIC_EXPLANATION }
}
