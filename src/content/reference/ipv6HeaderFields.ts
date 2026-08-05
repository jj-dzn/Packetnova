import type { HeaderField } from './tcpHeaderFields'

// Per RFC 8200 -- IPv6 fixed header. Every field here packs cleanly into
// 32-bit rows exactly like IPv4's does (Version + Traffic Class + Flow
// Label = 32 bits; Payload Length + Next Header + Hop Limit = 32 bits;
// each address is a clean 4x32-bit block), so HeaderByteDiagram's
// row-packing logic needs no changes to render it correctly.
export const ipv6HeaderFields: HeaderField[] = [
  { field: 'Version', offset: '0', size: '4 bits', description: 'IP version -- 6 for IPv6' },
  {
    field: 'Traffic Class',
    offset: '0.5',
    size: '8 bits',
    description: 'Quality-of-service marking -- IPv4’s DSCP + ECN, renamed',
  },
  {
    field: 'Flow Label',
    offset: '1.5',
    size: '20 bits',
    description: 'Optionally tags packets belonging to the same flow for consistent routing/QoS',
  },
  {
    field: 'Payload Length',
    offset: '4',
    size: '16 bits',
    description: 'Size of the payload only, in bytes -- unlike IPv4, excludes the header itself',
  },
  {
    field: 'Next Header',
    offset: '6',
    size: '8 bits',
    description:
      'Identifies the next header (extension header or upper-layer protocol) -- IPv4’s Protocol field, renamed and repurposed to chain extension headers',
  },
  {
    field: 'Hop Limit',
    offset: '7',
    size: '8 bits',
    description: 'IPv4’s Time to Live, renamed -- decremented by each router',
  },
  {
    field: 'Source Address',
    offset: '8',
    size: '128 bits',
    description: 'Sender IPv6 address',
  },
  {
    field: 'Destination Address',
    offset: '24',
    size: '128 bits',
    description: 'Receiver IPv6 address',
  },
]
