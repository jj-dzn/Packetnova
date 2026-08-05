export interface VisualizerListing {
  name: string
  description: string
  slug?: string
}

// Mirrors docs/CONTENT_PLAN.md's "Interactive visualizers" list and
// ARCHITECTURE.md's features/visualizers/ folder. Update all three together.
export const visualizers: VisualizerListing[] = [
  {
    name: 'TCP three-way handshake',
    description: 'Watch SYN, SYN-ACK, and ACK establish a connection step by step.',
    slug: 'tcp-three-way-handshake',
  },
  {
    name: 'TLS handshake',
    description: 'See exactly how a TLS session gets negotiated and encrypted.',
    slug: 'tls-handshake',
  },
  {
    name: 'Packet encapsulation',
    description: "Follow a packet as it's wrapped from application data down to frames.",
    slug: 'packet-encapsulation',
  },
  {
    name: 'OSI model explorer',
    description: 'Click through each OSI layer and see what happens to data at each one.',
    slug: 'osi-model-explorer',
  },
  {
    name: 'TCP/IP stack explorer',
    description:
      'Compare the TCP/IP model against OSI and see how real protocols map to each layer.',
    slug: 'tcp-ip-stack-explorer',
  },
  {
    name: 'NAT flow simulator',
    description:
      'Watch how NAT translates a private address and port as a packet leaves the network.',
    slug: 'nat-flow-simulator',
  },
  {
    name: 'Next-hop selection',
    description: 'Step through how a router picks the next hop for a packet, table entry by entry.',
    slug: 'next-hop-selection',
  },
  {
    name: 'BGP best path selection',
    description:
      "Walk through BGP's path-selection algorithm step by step, attribute by attribute.",
    slug: 'bgp-best-path-selection',
  },
  {
    name: 'OSPF SPF animation',
    description: "Watch Dijkstra's shortest-path-first algorithm build an OSPF routing tree.",
    slug: 'ospf-spf-animation',
  },
  {
    name: 'VPN packet flow',
    description:
      'Follow a packet through VPN encapsulation, encryption, and tunneling to the far end.',
    slug: 'vpn-packet-flow',
  },
  {
    name: 'DHCP DORA sequence',
    description: 'Watch Discover, Offer, Request, and Ack hand a client its first IP address.',
    slug: 'dhcp-dora-sequence',
  },
  {
    name: 'TLS 1.2 vs TLS 1.3',
    description:
      'Watch both handshakes run side by side and see exactly where TLS 1.3 cuts out a round trip.',
    slug: 'tls-1-2-vs-1-3',
  },
  {
    name: 'IPv4 vs IPv6 header',
    description: 'The same packet header, redesigned -- what got removed, renamed, and added.',
    slug: 'ipv4-vs-ipv6-header',
  },
  {
    name: 'STP vs RSTP convergence',
    description:
      "Watch a port's state machine run under both protocols after the same topology change.",
    slug: 'stp-vs-rstp-convergence',
  },
]
