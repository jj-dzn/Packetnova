export interface IcmpEntry {
  type: number
  name: string
  description: string
}

// Per RFC 792 plus common extensions.
export const icmpTypes: IcmpEntry[] = [
  {
    type: 0,
    name: 'Echo Reply',
    description: "Response to an Echo Request (what ping's replies are)",
  },
  {
    type: 3,
    name: 'Destination Unreachable',
    description:
      'Packet could not be delivered -- codes distinguish network/host/port/fragmentation reasons',
  },
  {
    type: 5,
    name: 'Redirect',
    description: 'Router tells the sender to use a better next-hop for this destination',
  },
  { type: 8, name: 'Echo Request', description: 'What ping sends -- expects an Echo Reply back' },
  {
    type: 9,
    name: 'Router Advertisement',
    description: 'Router announces its presence and address',
  },
  { type: 10, name: 'Router Solicitation', description: 'Host requests router advertisements' },
  {
    type: 11,
    name: 'Time Exceeded',
    description:
      'TTL reached 0 in transit, or fragment reassembly timed out -- what traceroute relies on',
  },
  {
    type: 12,
    name: 'Parameter Problem',
    description: 'A malformed or unrecognized field in the IP header',
  },
]
