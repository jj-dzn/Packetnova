import {
  EliminationVisualizer,
  type Candidate,
  type EliminationStep,
} from './EliminationVisualizer'

const DESTINATION = '10.20.5.7'

const CANDIDATES: Candidate[] = [
  { id: 'default', label: '0.0.0.0/0 via ISP', detail: 'AD 1, static' },
  { id: 'eigrp', label: '10.0.0.0/8 via EIGRP', detail: 'AD 90' },
  { id: 'ospf', label: '10.20.5.0/24 via OSPF', detail: 'AD 110' },
  { id: 'static', label: '10.20.5.0/24 via static route', detail: 'AD 1' },
]

const ALL_IDS = CANDIDATES.map((c) => c.id)

const STEPS: EliminationStep[] = [
  {
    title: 'Ready to route',
    description: `A packet arrives destined for ${DESTINATION}. The router has four routes in its table.`,
    remainingIds: ALL_IDS,
  },
  {
    title: '1. Find every route that matches',
    description: `All four routes match ${DESTINATION} -- 0.0.0.0/0 matches everything, and the others are all valid, more specific matches too.`,
    remainingIds: ALL_IDS,
  },
  {
    title: '2. Longest prefix match wins',
    description:
      'Both /24 routes tie for the longest (most specific) prefix -- the /8 and the default route are eliminated.',
    remainingIds: ['ospf', 'static'],
  },
  {
    title: '3. Break the tie with administrative distance',
    description:
      'With a prefix-length tie, the router falls back to administrative distance -- lower wins. The static route (AD 1) beats OSPF (AD 110).',
    remainingIds: ['static'],
  },
]

export function RoutingDecisionVisualizer() {
  return (
    <EliminationVisualizer
      category="Visualizer"
      title="Next-hop selection"
      description="Step through how a router picks the next hop for a packet, table entry by entry."
      candidates={CANDIDATES}
      steps={STEPS}
    />
  )
}
