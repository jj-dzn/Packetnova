import { Link } from 'react-router'
import { Button } from '../components/ui/Button'
import { JourneyShell, type JourneyStage } from '../features/journey/JourneyShell'
import { otherJourneys } from '../features/journey/journeyFamily'
import { PacketStackInspector } from '../features/journey/PacketStackInspector'
import {
  TopologyCanvas,
  type TopologyEdge,
  type TopologyNode,
} from '../features/diagram/TopologyCanvas'
import { NatTableDiagram } from '../features/diagram/NatTableDiagram'
import { NatFlowVisualizer } from '../features/visualizers/NatFlowVisualizer'

const SETUP_NODES: TopologyNode[] = [
  { id: 'hostA', x: 55, y: 35, label: 'Host A', sublabel: '192.168.1.10', icon: 'host' },
  { id: 'hostB', x: 55, y: 115, label: 'Host B', sublabel: '192.168.1.11', icon: 'host' },
  { id: 'router', x: 260, y: 75, label: 'NAT router', sublabel: '203.0.113.5', icon: 'router' },
  { id: 'server', x: 440, y: 75, label: 'Public server' },
]
const SETUP_EDGES: TopologyEdge[] = [
  { from: 'hostA', to: 'router' },
  { from: 'hostB', to: 'router' },
  { from: 'router', to: 'server', stroke: 'var(--color-accent-alt)' },
]

function SetupStage() {
  return (
    <div className="flex flex-col gap-4">
      <TopologyCanvas
        nodes={SETUP_NODES}
        edges={SETUP_EDGES}
        viewWidth={480}
        viewHeight={150}
        className="mx-auto w-full max-w-lg"
      />
      <p className="text-sm text-fg-subtle">
        Two private hosts, one public IP. Neither host has an address the internet can route to --
        everything that leaves this network has to borrow the router's one public identity first.
      </p>
    </div>
  )
}

function PortCollisionStage() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-fg-muted">
        Host A and Host B don't coordinate with each other -- their operating systems both happened
        to pick source port <span className="font-mono text-fg">51000</span> for a brand-new
        connection, seconds apart. That's completely normal, and it's exactly the situation PAT (NAT
        overload) exists to handle:
      </p>
      <NatTableDiagram
        leftHeader="Private (addr:port)"
        rightHeader="Public 203.0.113.5:port"
        rows={[
          { id: 'a', privateAddr: '192.168.1.10:51000', publicAddr: '203.0.113.5:40010' },
          { id: 'b', privateAddr: '192.168.1.11:51000', publicAddr: '203.0.113.5:40011' },
        ]}
      />
      <p className="text-sm text-fg-muted">
        Same private port, two different public ports -- the router hands out the next free public
        port per <em>connection</em>, not per private port, so a collision on the inside never
        becomes a collision on the outside.
      </p>
      <p className="text-xs text-fg-subtle">
        The table's real key is the full connection -- protocol, both addresses, and both ports --
        not just the private port shown here. That's why a busy router can, in principle, reuse the
        same public port number for two different private hosts at once, as long as they're talking
        to different destinations. Simplified NAT explanations (including the previous stage) skip
        that detail because it's rarely what changes the outcome you're trying to predict.
      </p>
    </div>
  )
}

const BEFORE_LOOKUP = [
  { label: 'Ethernet frame', detail: 'dst = Host A NIC' },
  { label: 'IP header', detail: 'dst = 203.0.113.5' },
  { label: 'TCP header', detail: 'dport = 40010' },
  { label: 'HTTP response', detail: '200 OK' },
]
const AFTER_LOOKUP = [
  { label: 'Ethernet frame', detail: 'dst = Host A NIC' },
  { label: 'IP header', detail: 'dst = 192.168.1.10' },
  { label: 'TCP header', detail: 'dport = 51000' },
  { label: 'HTTP response', detail: '200 OK' },
]

function StatefulStage() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-fg-muted">
        The reply comes back addressed to the router's public IP and port -- the server has no idea
        Host A exists. Only the table entry from the last stage tells the router where it actually
        goes:
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <PacketStackInspector caption="What arrives at the router" layers={BEFORE_LOOKUP} />
        <PacketStackInspector caption="What the router delivers to Host A" layers={AFTER_LOOKUP} />
      </div>
      <p className="text-sm text-fg-muted">
        This is why NAT is <em>stateful</em>, not a stateless rewrite rule: without that table
        entry, an inbound packet addressed to 203.0.113.5:40010 has nowhere to go. And the entry
        doesn't live forever -- routers expire idle mappings after a timeout (often just a couple of
        minutes for UDP, longer for an established TCP session), which is the real reason a
        connection left idle too long sometimes just stops working with no error on either end.
      </p>
    </div>
  )
}

function BlockedStage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-border bg-surface p-6 text-sm text-fg-muted">
        <p>
          Now flip the direction: someone on the internet, unprompted, sends a packet to
          203.0.113.5:40010 without Host A ever having started a connection. There's no table entry
          for it -- the router has no idea which private host it could possibly belong to, so it
          drops the packet.
        </p>
      </div>
      <p className="text-sm text-fg-muted">
        That's a side effect of NAT, not a firewall rule someone configured -- but it acts like one,
        which is exactly why every home router seems to "just block" unsolicited inbound traffic by
        default. Running a server behind NAT means deliberately punching a hole for it: a static
        mapping that exists before any inbound packet arrives, not one built by an outbound
        connection.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link to="/scenarios/nat-port-forwarding">
          <Button variant="secondary">Try the port-forwarding scenario</Button>
        </Link>
      </div>
    </div>
  )
}

const RECAP_ITEMS = [
  'Outbound packets get their source address (and often source port) rewritten by the router',
  'The router keeps a table mapping private connections to public ones',
  "Port collisions on the inside don't become collisions on the outside -- PAT hands out a free public port per connection",
  'Reply traffic only finds its way back because the table entry still exists',
  'Idle table entries expire, which is why long-idle connections can quietly stop working',
  'Unsolicited inbound traffic has no table entry to match, so it gets dropped by default',
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
        <Link to="/visualizers/nat-flow-simulator">
          <Button variant="secondary">Open the NAT flow simulator</Button>
        </Link>
        <Link to="/scenarios/nat-port-forwarding">
          <Button variant="secondary">Try the port-forwarding scenario</Button>
        </Link>
      </div>
    </div>
  )
}

const STAGES: JourneyStage[] = [
  {
    id: 'setup',
    title: 'Two hosts, one public IP',
    mood: 'idle',
    narration:
      'Most networks share a single public address across every device behind them. Before either host can talk to the internet, the router has to solve that -- one identity, many conversations.',
    content: <SetupStage />,
  },
  {
    id: 'translate',
    title: 'The router rewrites the source',
    mood: 'checking',
    narration:
      'Watch a single connection get translated, then switch to PAT mode to see what actually happens on a typical home or office router -- many private hosts, one shared public address.',
    content: <NatFlowVisualizer />,
  },
  {
    id: 'collision',
    title: 'Two hosts, the same source port',
    mood: 'checking',
    narration:
      "Here's the part the simple version skips: what happens when two different private hosts independently pick the exact same source port for a new connection?",
    content: <PortCollisionStage />,
  },
  {
    id: 'stateful',
    title: 'Reply traffic needs the table entry',
    mood: 'checking',
    narration:
      'The server replies to the public address it saw -- it never learns the private one exists. Getting that reply home again depends entirely on state the router is holding.',
    content: <StatefulStage />,
  },
  {
    id: 'blocked',
    title: 'What NAT blocks by default',
    mood: 'medium',
    narration:
      "The same table that makes replies work also explains NAT's best-known side effect: traffic nobody inside asked for has nowhere to go.",
    content: <BlockedStage />,
  },
  {
    id: 'recap',
    title: 'Arrival',
    mood: 'fast',
    narration:
      'Every outbound connection from a NATed network goes through this exact sequence -- translate, track, and eventually expire.',
    content: <RecapStage />,
  },
]

export function NatJourneyPage() {
  return (
    <JourneyShell
      eyebrow="Packet journey"
      title="Inside a NAT translation"
      description="One private address, hiding behind one public one -- the connection table that makes it work, and the exact reason it quietly breaks unsolicited inbound traffic."
      stages={STAGES}
      otherJourneys={otherJourneys('/journey/nat')}
    />
  )
}
