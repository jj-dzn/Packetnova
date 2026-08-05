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
]

export function otherPaths(currentSlug: string): CompetencyPath[] {
  return competencyPaths.filter((path) => path.slug !== currentSlug)
}
