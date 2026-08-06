export type PathStepType = 'tool' | 'visualizer' | 'scenario' | 'journey'

export interface PathStep {
  type: PathStepType
  /** For a journey step, the path segment after /journey/ -- '' for the
   * flagship journey itself. For every other type, the content item's own
   * slug in its own content array. */
  slug: string
  /** Why this step earns its place in this specific path, distinct from
   * the linked item's own standalone description. */
  note: string
}

export interface CompetencyPath {
  slug: string
  title: string
  category: string
  description: string
  steps: PathStep[]
}

// Curated, ordered sequences through content that already exists elsewhere
// on the site -- a path adds no new tools/visualizers/scenarios of its own,
// only the sequence and the "why this, why now" between them. Update
// docs/CONTENT_PLAN.md alongside this file, matching every other content
// array's convention.
export const competencyPaths: CompetencyPath[] = [
  {
    slug: 'subnetting-fluency',
    title: 'Subnetting fluency',
    category: 'IP addressing',
    description:
      'From reading a single CIDR block to summarizing a whole routing table -- the sequence that turns subnetting from a formula you look up into something you can do in your head.',
    steps: [
      {
        type: 'tool',
        slug: 'cidr-calculator',
        note: 'Start with the basics: what a single CIDR block actually contains.',
      },
      {
        type: 'tool',
        slug: 'subnet-calculator',
        note: 'Split a network into equal subnets, then try VLSM -- unequal, purpose-sized ones.',
      },
      {
        type: 'tool',
        slug: 'wildcard-mask-calculator',
        note: "Same mask, inverted -- the form ACLs and OSPF's network statements actually expect.",
      },
      {
        type: 'tool',
        slug: 'broadcast-calculator',
        note: 'The address at the far end of every subnet -- get comfortable finding it without the calculator.',
      },
      {
        type: 'tool',
        slug: 'network-address-calculator',
        note: 'And the address at the near end -- the pair that bounds every usable range.',
      },
      {
        type: 'scenario',
        slug: 'subnetting-mistake',
        note: 'Apply all four: a real misconfiguration that only a wrong subnet boundary explains.',
      },
      {
        type: 'tool',
        slug: 'route-summarizer',
        note: 'Go one level up: find the smallest set of routes that still covers a whole list of them.',
      },
    ],
  },
  {
    slug: 'bgp-path-selection',
    title: 'BGP path selection',
    category: 'Routing',
    description:
      "Why BGP picks the path it picks -- watch the tie-break order happen, build your own comparison, then diagnose a real case where the 'obviously better' path lost.",
    steps: [
      {
        type: 'visualizer',
        slug: 'bgp-best-path-selection',
        note: 'Watch the elimination order happen, one attribute at a time, on a fixed example.',
      },
      {
        type: 'tool',
        slug: 'bgp-path-comparison',
        note: "Now build your own -- enter two real paths' attributes and see exactly which one decides it.",
      },
      {
        type: 'journey',
        slug: 'bgp-path',
        note: 'Go deeper: the full 11-attribute order, carried past weight and local preference into where most real decisions actually land.',
      },
      {
        type: 'scenario',
        slug: 'bgp-path-selection',
        note: "Apply it: traffic is taking the 'wrong' path, and BGP is working exactly as designed.",
      },
    ],
  },
  {
    slug: 'vpn-troubleshooting',
    title: 'VPN troubleshooting',
    category: 'VPN',
    description:
      'The classic "works for SSH, hangs on a big transfer" VPN failure has one of the most consistent root causes in networking -- this path builds the MTU/overhead intuition needed to spot it on sight.',
    steps: [
      {
        type: 'tool',
        slug: 'mtu-calculator',
        note: 'Start here: most VPN issues that look mysterious trace straight back to MTU.',
      },
      {
        type: 'tool',
        slug: 'vpn-tunnel-overhead-calculator',
        note: "See exactly how many bytes a tunnel's own encapsulation costs, before any real data fits.",
      },
      {
        type: 'visualizer',
        slug: 'vpn-packet-flow',
        note: 'Watch a packet actually get wrapped and encrypted -- where those extra bytes come from.',
      },
      {
        type: 'journey',
        slug: 'vpn-tunnel',
        note: 'Go deeper: the full anatomy of a tunnel-mode packet, header by header.',
      },
      {
        type: 'tool',
        slug: 'packet-fragmentation-calculator',
        note: "See what happens next when a packet doesn't fit -- fragmented, or silently dropped.",
      },
      {
        type: 'scenario',
        slug: 'site-to-site-vpn-failure',
        note: 'Apply all of it: small requests work, large transfers hang, no error either side.',
      },
    ],
  },
  {
    slug: 'vlan-switching-fluency',
    title: 'VLAN & switching fluency',
    category: 'Switching',
    description:
      'The two mechanisms every switched network actually runs on -- VLANs to keep traffic separate, Spanning Tree to keep a redundant physical topology from looping -- from the basics through a real misconfiguration and a real loop.',
    steps: [
      {
        type: 'tool',
        slug: 'vlan-calculator',
        note: 'Start with the basics: what a VLAN ID actually is, and how a switch keeps it separate from every other VLAN.',
      },
      {
        type: 'tool',
        slug: '802-1q-tag-explorer',
        note: 'See exactly how that VLAN gets tagged onto a frame crossing a trunk between switches.',
      },
      {
        type: 'tool',
        slug: 'mac-address-lookup',
        note: 'The other half of switching: how a switch actually learns which port a MAC address lives behind.',
      },
      {
        type: 'tool',
        slug: 'stp-overview',
        note: 'More than one switch means a loop is possible the moment two links exist between them -- see what stops it.',
      },
      {
        type: 'visualizer',
        slug: 'stp-vs-rstp-convergence',
        note: 'Compare how much faster RSTP recovers from a topology change than classic STP.',
      },
      {
        type: 'scenario',
        slug: 'vlan-misconfiguration',
        note: 'Apply it: two hosts on the same switch, meant to share a VLAN, that just cannot reach each other.',
      },
      {
        type: 'scenario',
        slug: 'switching-loop',
        note: 'And a real loop, this one branching -- your own choices decide whether you actually find it.',
      },
    ],
  },
  {
    slug: 'security-fundamentals',
    title: 'Security fundamentals',
    category: 'Security',
    description:
      'The building blocks underneath almost everything else on this site claims is secure -- hashing, the TLS handshake that makes HTTPS possible, the certificate chain it depends on, and the token format that gets mistaken for encryption more than any other.',
    steps: [
      {
        type: 'tool',
        slug: 'hash-generator',
        note: 'Start with the basics: how a hash actually works, computed live from whatever you type.',
      },
      {
        type: 'tool',
        slug: 'hash-verifier',
        note: 'Now use one for real: check a string against an expected hash the way an integrity check actually works.',
      },
      {
        type: 'visualizer',
        slug: 'tls-handshake',
        note: 'See the handshake that makes HTTPS possible, negotiated before a single byte of your request goes anywhere.',
      },
      {
        type: 'visualizer',
        slug: 'tls-1-2-vs-1-3',
        note: "Compare it against TLS 1.3's leaner handshake -- fewer round trips, the same guarantees.",
      },
      {
        type: 'tool',
        slug: 'certificate-viewer',
        note: 'Inspect a real certificate chain -- the trust anchor the whole handshake actually relies on.',
      },
      {
        type: 'tool',
        slug: 'jwt-decoder',
        note: "A different kind of trust: decode a JWT and see exactly what it does -- and doesn't -- guarantee.",
      },
    ],
  },
]

export function otherPaths(currentSlug: string): CompetencyPath[] {
  return competencyPaths.filter((path) => path.slug !== currentSlug)
}
