import { BranchingScenario, type BranchingScenarioNode } from './BranchingScenario'
import { DhcpDoraVisualizer } from '../visualizers/DhcpDoraVisualizer'

const NODES: Record<string, BranchingScenarioNode> = {
  start: {
    id: 'start',
    title: 'A new laptop gets no IP address',
    narration: (
      <>
        <p>
          A new laptop joins the network on VLAN 20 and never gets a real address -- it sits on a
          self-assigned 169.254.x.x. Every other device on VLAN 20 already has a working lease. The
          one authoritative DHCP server for the whole company lives on VLAN 10, reachable from every
          other subnet -- just, it turns out, not automatically.
        </p>
        <p>What's the first thing to check?</p>
      </>
    ),
    choices: [
      {
        label:
          'Check whether the DHCP process is actually completing -- start from what the switch sees',
        to: 'check-dora',
      },
      {
        label: "Assume it's a bad cable or NIC driver and swap the hardware",
        to: 'wrong-hardware',
      },
    ],
  },
  'wrong-hardware': {
    id: 'wrong-hardware',
    title: "It's not the cable or the NIC",
    outcome: 'wrong-turn',
    narration: (
      <p>
        The access switch's MAC address table already shows the laptop's MAC hitting the port the
        moment it powers on -- that's the laptop's own DHCP DISCOVER broadcast arriving just fine.
        Link, cabling, and the NIC driver are all working; a device with none of those working
        couldn't get a frame to the switch at all, let alone one recognizable as a DHCP request.
      </p>
    ),
  },
  'check-dora': {
    id: 'check-dora',
    title: 'Walk the DHCP exchange as it should happen',
    narration: (
      <p>
        Discover, Offer, Request, Ack -- four messages, and the laptop's logs show it sending the
        first one and then just... waiting. Try both modes below and compare them against what the
        switches on VLAN 10 and VLAN 20 are actually showing.
      </p>
    ),
    content: <DhcpDoraVisualizer />,
    choices: [
      {
        label: "The DHCP server's address pool for this range must be exhausted",
        to: 'wrong-pool',
      },
      {
        label:
          "The DISCOVER is a broadcast, and broadcasts don't cross VLANs without something relaying them",
        to: 'relay',
      },
    ],
  },
  'wrong-pool': {
    id: 'wrong-pool',
    title: "It's not the pool",
    outcome: 'wrong-turn',
    narration: (
      <p>
        The DHCP server's scope for VLAN 20 has hundreds of free addresses -- plenty of headroom.
        More to the point, the server's own logs show it never received a DISCOVER from this laptop
        at all. An exhausted pool would still show up as a received request that got refused, not
        silence. Whatever's wrong, it's happening before the request ever reaches the server.
      </p>
    ),
  },
  relay: {
    id: 'relay',
    title: 'The broadcast never left VLAN 20',
    outcome: 'resolution',
    narration: (
      <>
        <p>
          Exactly it. DHCP DISCOVER is sent as a broadcast, and routers don't forward broadcasts
          between VLANs by default -- the request dies at the VLAN 20 boundary and the VLAN 10
          server never sees it. Switch the visualizer above to "Different subnet (via relay)" to
          watch what actually has to happen instead: a relay agent (usually the VLAN 20 SVI itself)
          rewrites the broadcast into a unicast aimed straight at the DHCP server, stamping it with
          <code className="mx-1 rounded bg-bg px-1 py-0.5 font-mono text-xs">giaddr</code>
          so the server knows which subnet's pool to hand out an address from.
        </p>
        <p>
          The fix is a one-line{' '}
          <code className="rounded bg-bg px-1 py-0.5 font-mono text-xs">ip helper-address</code> (or
          equivalent) configured on the VLAN 20 router interface, pointed at the VLAN 10 DHCP server
          -- turning that dead-end broadcast into a routable request.
        </p>
      </>
    ),
  },
}

export function DhcpFailureScenario() {
  return (
    <BranchingScenario
      category="DHCP"
      title="No IP address: DHCP across a VLAN boundary"
      setup={
        <p>
          A branching walk through the single most common reason a working DHCP server still leaves
          a client stuck on a self-assigned address -- with two real wrong turns along the way, not
          just one straight path to the answer.
        </p>
      }
      nodes={NODES}
      rootId="start"
    />
  )
}
