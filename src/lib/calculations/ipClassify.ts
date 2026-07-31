import { prefixLengthToSubnetMask } from '../validation/ip'

export interface IPv4Classification {
  label: string
  cidr: string
}

interface RawRange {
  cidr: string
  label: string
}

interface SpecialRange extends RawRange {
  network: number
  prefixLength: number
}

// IANA special-purpose IPv4 address registry (RFC 5735 / RFC 6890 and the
// RFCs referenced below) -- the ranges most engineers actually run into.
// Not exhaustive (the full registry has ~30 entries), but covers what a
// tool like this needs to flag.
const RAW_RANGES: RawRange[] = [
  { cidr: '0.0.0.0/8', label: 'Current network (RFC 791)' },
  { cidr: '10.0.0.0/8', label: 'Private use (RFC 1918)' },
  { cidr: '100.64.0.0/10', label: 'Shared address space / CGNAT (RFC 6598)' },
  { cidr: '127.0.0.0/8', label: 'Loopback (RFC 1122)' },
  { cidr: '169.254.0.0/16', label: 'Link-local (RFC 3927)' },
  { cidr: '172.16.0.0/12', label: 'Private use (RFC 1918)' },
  { cidr: '192.0.0.0/24', label: 'IETF protocol assignments (RFC 6890)' },
  { cidr: '192.0.2.0/24', label: 'Documentation -- TEST-NET-1 (RFC 5737)' },
  { cidr: '192.88.99.0/24', label: '6to4 relay anycast (RFC 3068)' },
  { cidr: '192.168.0.0/16', label: 'Private use (RFC 1918)' },
  { cidr: '198.18.0.0/15', label: 'Benchmarking (RFC 2544)' },
  { cidr: '198.51.100.0/24', label: 'Documentation -- TEST-NET-2 (RFC 5737)' },
  { cidr: '203.0.113.0/24', label: 'Documentation -- TEST-NET-3 (RFC 5737)' },
  { cidr: '224.0.0.0/4', label: 'Multicast (RFC 5771)' },
  { cidr: '240.0.0.0/4', label: 'Reserved for future use (RFC 1112)' },
  { cidr: '255.255.255.255/32', label: 'Limited broadcast (RFC 8190)' },
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
      return { label: range.label, cidr: range.cidr }
    }
  }
  return { label: 'Public (global unicast)', cidr: '' }
}
