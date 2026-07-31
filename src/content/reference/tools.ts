export interface ToolListing {
  name: string
  description: string
  slug?: string
}

export interface ToolCategory {
  slug: string
  label: string
  tools: ToolListing[]
}

// Mirrors docs/CONTENT_PLAN.md's tool inventory. Update both together.
export const toolCategories: ToolCategory[] = [
  {
    slug: 'ip',
    label: 'IP tools',
    tools: [
      {
        name: 'CIDR calculator',
        description: 'Break down any CIDR block into network, broadcast, and usable host range.',
        slug: 'cidr-calculator',
      },
      {
        name: 'Subnet calculator',
        description: 'Split a network into subnets and see the resulting masks at a glance.',
        slug: 'subnet-calculator',
      },
      {
        name: 'IPv6 calculator',
        description: 'Expand, compress, and inspect IPv6 addresses and prefixes.',
        slug: 'ipv6-calculator',
      },
      {
        name: 'Wildcard mask calculator',
        description: 'Convert a subnet mask to its wildcard mask for ACLs and OSPF.',
        slug: 'wildcard-mask-calculator',
      },
      {
        name: 'IP range calculator',
        description: 'Convert between IP ranges and CIDR notation instantly.',
        slug: 'ip-range-calculator',
      },
      {
        name: 'Broadcast calculator',
        description: 'Find the broadcast address for any IP and subnet mask.',
        slug: 'broadcast-calculator',
      },
      {
        name: 'Network address calculator',
        description: 'Find the network address for any IP and subnet mask.',
        slug: 'network-address-calculator',
      },
    ],
  },
  {
    slug: 'vpn',
    label: 'VPN tools',
    tools: [
      {
        name: 'VPN tunnel overhead calculator',
        description:
          "See how much throughput a VPN tunnel's encapsulation overhead actually costs you.",
        slug: 'vpn-tunnel-overhead-calculator',
      },
      {
        name: 'MTU calculator',
        description: "Find the right MTU for a link and see what happens when packets don't fit.",
        slug: 'mtu-calculator',
      },
      {
        name: 'MSS calculator',
        description: 'Work out the maximum TCP segment size for a given MTU and overhead.',
        slug: 'mss-calculator',
      },
      {
        name: 'Bandwidth estimator',
        description: 'Estimate real-world throughput after protocol and tunnel overhead.',
        slug: 'bandwidth-estimator',
      },
      {
        name: 'Latency calculator',
        description: 'Estimate one-way and round-trip latency across a given distance and medium.',
        slug: 'latency-calculator',
      },
      {
        name: 'Transfer time calculator',
        description: 'Estimate how long a file transfer will take at a given bandwidth.',
        slug: 'transfer-time-calculator',
      },
      {
        name: 'Packet fragmentation calculator',
        description: 'See when and how a packet gets fragmented for a given MTU.',
        slug: 'packet-fragmentation-calculator',
      },
    ],
  },
  {
    slug: 'routing',
    label: 'Routing',
    tools: [
      {
        name: 'BGP route visualizer',
        description: 'Watch how BGP path attributes decide the route between two networks.',
        slug: 'bgp-route-visualizer',
      },
      {
        name: 'Longest prefix match simulator',
        description: 'See which route wins when multiple entries in a routing table overlap.',
        slug: 'longest-prefix-match-simulator',
      },
      {
        name: 'Route lookup simulator',
        description: 'Step through how a router picks the next hop for a destination address.',
        slug: 'route-lookup-simulator',
      },
      {
        name: 'Administrative distance reference',
        description: 'Look up the default administrative distance for every routing source.',
        slug: 'administrative-distance-reference',
      },
      {
        name: 'Metric comparison tool',
        description: 'Compare routing metrics across protocols on equal footing.',
        slug: 'metric-comparison-tool',
      },
    ],
  },
  {
    slug: 'switching',
    label: 'Switching',
    tools: [
      {
        name: 'VLAN calculator',
        description: 'Work out VLAN ranges, trunking math, and tagging details.',
        slug: 'vlan-calculator',
      },
      {
        name: '802.1Q tag explorer',
        description: 'Break down an 802.1Q tag into its TPID, PCP, DEI, and VLAN ID fields.',
        slug: '802-1q-tag-explorer',
      },
      {
        name: 'MAC address lookup',
        description: "Look up the vendor behind a MAC address's OUI.",
        slug: 'mac-address-lookup',
      },
      {
        name: 'MAC formatter',
        description: 'Convert a MAC address between colon, hyphen, and dot notation.',
        slug: 'mac-formatter',
      },
      {
        name: 'STP overview',
        description: 'See how Spanning Tree Protocol picks a root bridge and blocks loops.',
        slug: 'stp-overview',
      },
    ],
  },
  {
    slug: 'protocols',
    label: 'Protocols',
    tools: [
      {
        name: 'TCP header explorer',
        description: 'Break down every field in a TCP header, byte by byte.',
        slug: 'tcp-header-explorer',
      },
      {
        name: 'UDP header explorer',
        description: 'Break down every field in a UDP header, byte by byte.',
        slug: 'udp-header-explorer',
      },
      {
        name: 'IP header explorer',
        description: 'Break down every field in an IPv4 header, byte by byte.',
        slug: 'ip-header-explorer',
      },
      {
        name: 'ICMP explorer',
        description: 'Look up ICMP types and codes and what they actually mean.',
        slug: 'icmp-explorer',
      },
      {
        name: 'DNS record reference',
        description: "Look up every DNS record type and what it's used for.",
        slug: 'dns-record-reference',
      },
      {
        name: 'HTTP status reference',
        description: 'Look up any HTTP status code and what it means.',
        slug: 'http-status-reference',
      },
      {
        name: 'TLS version explorer',
        description: 'Compare TLS versions and see what changed between them.',
        slug: 'tls-version-explorer',
      },
      {
        name: 'DHCP options reference',
        description: 'Look up DHCP option numbers and their meaning.',
        slug: 'dhcp-options-reference',
      },
    ],
  },
  {
    slug: 'security',
    label: 'Security',
    tools: [
      {
        name: 'Hash generator',
        description: 'Generate MD5, SHA-1, SHA-256, and other hashes from text or files.',
        slug: 'hash-generator',
      },
      {
        name: 'Hash verifier',
        description: 'Check a file or string against an expected hash.',
        slug: 'hash-verifier',
      },
      {
        name: 'JWT decoder',
        description: "Decode a JWT's header and payload without verifying it server-side.",
        slug: 'jwt-decoder',
      },
      {
        name: 'JWT inspector',
        description: "Inspect a JWT's claims, algorithm, and expiration at a glance.",
        slug: 'jwt-inspector',
      },
      {
        name: 'Base64 encode/decode',
        description: 'Encode or decode Base64 text instantly.',
        slug: 'base64-encode-decode',
      },
      {
        name: 'URL encode/decode',
        description: 'Encode or decode URL-safe text instantly.',
        slug: 'url-encode-decode',
      },
      {
        name: 'Certificate viewer',
        description: "Inspect an X.509 certificate's fields, SANs, and validity dates.",
        slug: 'certificate-viewer',
      },
      {
        name: 'Password generator',
        description: 'Generate strong, random passwords with configurable rules.',
        slug: 'password-generator',
      },
    ],
  },
  {
    slug: 'utilities',
    label: 'Utilities',
    tools: [
      {
        name: 'Regex tester',
        description: 'Test a regular expression against sample text with live match highlighting.',
        slug: 'regex-tester',
      },
      {
        name: 'JSON formatter',
        description: 'Format, validate, and minify JSON.',
        slug: 'json-formatter',
      },
      {
        name: 'YAML formatter',
        description: 'Format and validate YAML.',
        slug: 'yaml-formatter',
      },
      {
        name: 'XML formatter',
        description: 'Format and validate XML.',
        slug: 'xml-formatter',
      },
      {
        name: 'Epoch converter',
        description: 'Convert between Unix epoch time and human-readable dates.',
        slug: 'epoch-converter',
      },
      {
        name: 'Binary/decimal/hex converter',
        description: 'Convert numbers between binary, decimal, and hexadecimal.',
        slug: 'binary-decimal-hex-converter',
      },
      {
        name: 'ASCII converter',
        description: 'Convert between text, ASCII codes, and binary.',
        slug: 'ascii-converter',
      },
      {
        name: 'Text diff viewer',
        description: 'Compare two blocks of text and highlight the differences.',
        slug: 'text-diff-viewer',
      },
    ],
  },
]
