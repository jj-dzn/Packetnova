import { Link } from 'react-router'
import { Button } from '../components/ui/Button'
import { JourneyShell, type JourneyStage } from '../features/journey/JourneyShell'
import { otherJourneys } from '../features/journey/journeyFamily'
import {
  TopologyCanvas,
  type TopologyEdge,
  type TopologyNode,
} from '../features/diagram/TopologyCanvas'
import {
  EliminationVisualizer,
  type Candidate,
  type EliminationStep,
} from '../features/visualizers/EliminationVisualizer'

const SETUP_NODES: TopologyNode[] = [
  { id: 'router', x: 300, y: 90, label: 'This router', icon: 'router' },
  { id: 'n1', x: 60, y: 25, label: 'AS 65010' },
  { id: 'n2', x: 60, y: 155, label: 'AS 65020' },
  { id: 'n3', x: 540, y: 25, label: 'AS 65030' },
  { id: 'n4', x: 540, y: 155, label: 'AS 65040' },
]
const SETUP_EDGES: TopologyEdge[] = [
  { from: 'n1', to: 'router', dashed: true },
  { from: 'n2', to: 'router', dashed: true },
  { from: 'n3', to: 'router', dashed: true },
  { from: 'n4', to: 'router', dashed: true },
]

function SetupStage() {
  return (
    <div className="flex flex-col gap-4">
      <TopologyCanvas
        nodes={SETUP_NODES}
        edges={SETUP_EDGES}
        viewWidth={600}
        viewHeight={180}
        className="mx-auto w-full max-w-2xl"
      />
      <p className="text-sm text-fg-subtle">
        Four different neighbors, four different autonomous systems, all advertising a route to the
        exact same prefix. No single one of them knows about the other three -- this router has to
        pick, and install, exactly one.
      </p>
    </div>
  )
}

const CANDIDATES: Candidate[] = [
  {
    id: 'a',
    label: 'Path A via AS 65010',
    detail: 'Weight 100 · LocalPref 100 · AS-path length 3 · Origin IGP · MED 20',
  },
  {
    id: 'b',
    label: 'Path B via AS 65020',
    detail: 'Weight 100 · LocalPref 100 · AS-path length 1 · Origin IGP · MED 20',
  },
  {
    id: 'c',
    label: 'Path C via AS 65030',
    detail: 'Weight 100 · LocalPref 100 · AS-path length 1 · Origin EGP · MED 10',
  },
  {
    id: 'd',
    label: 'Path D via AS 65040',
    detail: 'Weight 100 · LocalPref 100 · AS-path length 1 · Origin IGP · MED 10',
  },
]
const ALL_IDS = CANDIDATES.map((c) => c.id)

const STEPS: EliminationStep[] = [
  {
    title: 'Ready to select',
    description:
      'BGP learned four eBGP paths to 198.51.100.0/24, none of them locally originated. Exactly one has to be installed.',
    remainingIds: ALL_IDS,
  },
  {
    title: '1. Weight, local preference, and origin-locality all tie',
    description:
      'Weight (100) and local preference (100) are identical across all four, and none of these routes were originated locally either -- three attributes checked, still a four-way tie. The algorithm keeps going.',
    remainingIds: ALL_IDS,
  },
  {
    title: '2. Shortest AS path wins',
    description:
      "Path A's route crossed two extra autonomous systems on the way here -- a 3-AS path loses to the three still-tied 1-AS paths. Path A is eliminated.",
    remainingIds: ['b', 'c', 'd'],
  },
  {
    title: '3. Lowest origin type wins',
    description:
      "Origin type ranks IGP below EGP below incomplete. Path C's route was learned as EGP; Paths B and D, both IGP, beat it. Path C is eliminated.",
    remainingIds: ['b', 'd'],
  },
  {
    title: '4. Lowest MED wins',
    description:
      "Everything else is tied, so MED -- the exit point a neighboring AS asks to be used -- decides: Path D's MED of 10 beats Path B's 20. Path D is installed.",
    remainingIds: ['d'],
  },
]

function DecideStage() {
  return (
    <EliminationVisualizer
      category="Deep dive"
      title="Narrowing four paths to one"
      description="The same elimination logic as the BGP best-path visualizer, carried further -- this example needs five attributes before it resolves, not two."
      candidates={CANDIDATES}
      steps={STEPS}
    />
  )
}

const FULL_ORDER = [
  { name: 'Highest weight', used: true },
  { name: 'Highest local preference', used: true },
  { name: 'Locally originated', used: true },
  { name: 'Shortest AS path', used: true },
  { name: 'Lowest origin type', used: true },
  { name: 'Lowest MED', used: true },
  { name: 'eBGP over iBGP', used: false },
  { name: 'Lowest IGP metric to next hop', used: false },
  { name: 'Oldest route', used: false },
  { name: 'Lowest router ID', used: false },
  { name: 'Lowest neighbor IP', used: false },
]

function FullOrderStage() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-fg-muted">
        The last stage used six of these before it found a winner. The full order keeps going for
        exactly this reason -- it has to guarantee a single answer, even between two paths that
        agree on everything a network engineer actually configured:
      </p>
      <ol className="flex flex-col gap-1.5 rounded-lg border border-border bg-surface p-4 text-sm">
        {FULL_ORDER.map((step, index) => (
          <li
            key={step.name}
            className={`flex items-baseline gap-3 ${step.used ? '' : 'text-fg-subtle'}`}
          >
            <span className="w-5 shrink-0 font-mono text-xs text-fg-subtle">{index + 1}.</span>
            <span className={step.used ? 'text-fg' : ''}>{step.name}</span>
            {step.used && (
              <span className="ml-auto shrink-0 font-mono text-[11px] text-accent">
                decided or checked above
              </span>
            )}
          </li>
        ))}
      </ol>
      <p className="text-xs text-fg-subtle">
        Router ID and neighbor IP are the reason BGP never actually gets stuck in a real tie -- two
        different routers can't share a router ID, so the chain always terminates in exactly one
        winner.
      </p>
    </div>
  )
}

function ConsequenceStage() {
  return (
    <div className="rounded-lg border border-border bg-surface p-6 text-sm text-fg-muted">
      <p className="mb-3">
        The two attributes near the top of that list exist because they're the ones engineers
        actually reach for on purpose. Local preference is an outbound lever: set it higher on one
        path, and every router inside your own AS prefers it -- but it's never advertised outside
        your network, so you can't use it to influence how <em>other</em> networks route to you.
      </p>
      <p>
        MED is the opposite: an inbound lever, advertised outward as a hint to a neighboring AS
        about which of your entry points it should prefer -- but it's only ever a suggestion, and
        that neighbor is completely free to ignore it in favor of its own local preference. That
        asymmetry, an AS controlling its own outbound path freely but only ever suggesting its
        inbound one, is exactly why traffic between two networks can genuinely take a different path
        in each direction.
      </p>
    </div>
  )
}

const RECAP_ITEMS = [
  'BGP walks a fixed, ordered list of attributes -- it stops at the first one that breaks the tie',
  'Weight and local preference are checked first, but are often identical across real paths',
  'AS-path length, origin type, and MED are where most real-world decisions actually land',
  'Router ID and neighbor IP guarantee the chain always ends in exactly one winner',
  'Local preference steers outbound traffic; MED only ever suggests inbound traffic',
  "That asymmetry is why two networks' traffic can take genuinely different paths each direction",
]

function RecapStage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-border bg-surface p-6">
        <p className="mb-3 text-sm font-medium">What just happened, in order</p>
        <ul className="flex flex-col gap-1.5 text-sm text-fg-muted">
          {RECAP_ITEMS.map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden="true" className="text-accent-alt">
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link to="/tools/bgp-path-comparison">
          <Button variant="secondary">Compare your own paths</Button>
        </Link>
        <Link to="/scenarios/bgp-path-selection">
          <Button variant="secondary">Try the BGP scenario</Button>
        </Link>
      </div>
    </div>
  )
}

const STAGES: JourneyStage[] = [
  {
    id: 'setup',
    title: 'One prefix, four advertisements',
    mood: 'idle',
    narration:
      'On the open internet, no single router ever sees the whole path -- it only sees what its own neighbors tell it, and has to pick the best of what arrives.',
    content: <SetupStage />,
  },
  {
    id: 'decide',
    title: 'Narrowing four paths to one',
    mood: 'checking',
    narration:
      "Step through BGP's real tie-break order against four genuinely competitive paths -- watch how many attributes agree before one finally decides it.",
    content: <DecideStage />,
  },
  {
    id: 'full-order',
    title: 'The complete tie-break order',
    mood: 'checking',
    narration:
      "That was six attributes deep. Here's the full list BGP is willing to walk before it gives up.",
    content: <FullOrderStage />,
  },
  {
    id: 'consequence',
    title: 'Why any of this is configurable',
    mood: 'checking',
    narration:
      "Two of those attributes aren't just tie-breakers -- they're the actual levers network engineers pull to steer traffic on purpose.",
    content: <ConsequenceStage />,
  },
  {
    id: 'recap',
    title: 'Arrival',
    mood: 'fast',
    narration:
      'Every router between here and the destination just ran this exact same process, independently, using only what its own neighbors told it.',
    content: <RecapStage />,
  },
]

export function BgpPathJourneyPage() {
  return (
    <JourneyShell
      eyebrow="Packet journey"
      title="Inside a BGP path decision"
      description="The same prefix, learned from four different neighbors. Walk the attribute-by-attribute tiebreak that picks exactly one winner."
      stages={STAGES}
      otherJourneys={otherJourneys('/journey/bgp-path')}
    />
  )
}
