import { ScenarioPageLayout, ScenarioStage } from './ScenarioPageLayout'
import { NatFlowVisualizer } from '../visualizers/NatFlowVisualizer'
import { TopologyCanvas, type TopologyEdge, type TopologyNode } from '../diagram/TopologyCanvas'
import { NatTableDiagram } from '../diagram/NatTableDiagram'

// The roadmap calls for "a walkthrough of why an inbound connection fails
// without port forwarding" specifically -- no existing tool shows this, since
// NatFlowVisualizer's steps all start from an outbound packet. Built directly
// on E6's TopologyCanvas/NatTableDiagram primitives rather than a fourth
// hand-rolled diagram, which is exactly the kind of reuse E6 was for.
function UnsolicitedInboundExample() {
  const nodes: TopologyNode[] = [
    { id: 'peer', x: 55, y: 55, label: 'Internet peer' },
    {
      id: 'nat',
      x: 225,
      y: 55,
      label: 'NAT router',
      icon: 'router',
      fill: 'var(--color-accent-alt)',
      stroke: 'var(--color-accent)',
    },
    { id: 'host', x: 395, y: 55, label: 'Private host' },
  ]
  const edges: TopologyEdge[] = [
    {
      from: 'peer',
      to: 'nat',
      label: 'SYN :7777',
      stroke: 'var(--color-danger)',
      dashed: true,
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <TopologyCanvas nodes={nodes} edges={edges} viewWidth={450} viewHeight={130} />
      <NatTableDiagram
        rows={[]}
        emptyLabel="No entry for port 7777 -- nothing tells the router which private host this belongs to."
      />
      <p className="text-sm text-danger">
        Dropped. An unsolicited inbound connection has no prior outbound packet that would have
        created a matching NAT table entry, so the router has nothing to translate against and
        nowhere to forward it.
      </p>
    </div>
  )
}

export function NatPortForwardingScenario() {
  return (
    <ScenarioPageLayout
      category="NAT"
      title="NAT problem: why an inbound connection fails without port forwarding"
      setup={
        <>
          <p>
            Outbound traffic from behind the NAT router works perfectly -- browsing, downloads,
            everything. But a service running on a private host (a game server, a self-hosted app)
            can't be reached from the internet at all, even though it's definitely running and
            listening.
          </p>
          <p>The router isn't broken. It's doing exactly what NAT is defined to do.</p>
        </>
      }
      resolution={
        <p>
          A static port-forward rule on the router -- mapping the public port straight to the
          private host's address and port -- pre-populates exactly the mapping that outbound traffic
          would otherwise have created on its own. That gives an unsolicited inbound SYN somewhere
          to go before the private host has ever initiated anything itself.
        </p>
      }
    >
      <ScenarioStage
        number={1}
        title="Watch a connection that actually works"
        narration="This is the shape of every connection that succeeds: the private host sends a packet out first, and the act of sending it is what creates the NAT table entry that makes a reply possible on the way back. Try both modes -- Static NAT's one-to-one mapping and PAT's many-to-one overload table almost every home and office router actually runs. Every row in either table exists because a private host spoke first."
      >
        <NatFlowVisualizer />
      </ScenarioStage>

      <ScenarioStage
        number={2}
        title="Now try to reach in from outside, unsolicited"
        narration="A peer on the internet sends a connection attempt to the router's public address on a specific port, with no private host having contacted it first. Nothing in the table matches -- so nothing tells the router where to send it."
      >
        <UnsolicitedInboundExample />
      </ScenarioStage>
    </ScenarioPageLayout>
  )
}
