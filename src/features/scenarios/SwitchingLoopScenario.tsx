import { BranchingScenario, type BranchingScenarioNode } from './BranchingScenario'
import { StpOverview } from '../tools/switching/StpOverview'

const NODES: Record<string, BranchingScenarioNode> = {
  start: {
    id: 'start',
    title: 'Random drops on one floor, nowhere else',
    narration: (
      <>
        <p>
          Users on the 3rd floor report random disconnects. The floor's access switch shows CPU
          pegged near 100%, and its MAC address table is thrashing -- addresses moving between ports
          every few seconds. Every other floor is unaffected.
        </p>
        <p>What's the first thing to check?</p>
      </>
    ),
    choices: [
      { label: 'Investigate whether a loop has formed on this switch', to: 'check-stp' },
      { label: 'Call the ISP -- this looks like an upstream provider problem', to: 'wrong-isp' },
    ],
  },
  'wrong-isp': {
    id: 'wrong-isp',
    title: "It's not upstream",
    outcome: 'wrong-turn',
    narration: (
      <p>
        A pegged CPU and a thrashing MAC table on one specific access switch, with every other floor
        working fine, is a local Layer 2 symptom -- not something an upstream ISP link could cause.
        If the WAN link itself were the problem, it wouldn't explain why this one switch's own
        internal table can't settle on which port each address lives behind.
      </p>
    ),
  },
  'check-stp': {
    id: 'check-stp',
    title: "It's a loop -- here's what should be preventing it",
    narration: (
      <>
        <p>
          A thrashing MAC table is the textbook signature of a Layer 2 loop: the same frame keeps
          circling back in on a different port, so the switch keeps "relearning" the source address
          against whichever port it just arrived on. Here's the mechanism that's supposed to stop
          this from ever happening.
        </p>
        <p>
          Digging into this switch specifically, you find someone connected both ends of a spare
          patch cable into two ports on it -- and Spanning Tree has been administratively disabled
          on this switch, supposedly "to reduce overhead."
        </p>
      </>
    ),
    content: <StpOverview />,
    choices: [
      {
        label: 'Leave STP disabled, but rate-limit broadcast traffic to lessen the impact',
        to: 'wrong-ratelimit',
      },
      {
        label: 'Re-enable STP, and add PortFast + BPDU Guard on true access ports',
        to: 'resolution',
      },
    ],
  },
  'wrong-ratelimit': {
    id: 'wrong-ratelimit',
    title: "That doesn't stop the loop",
    outcome: 'wrong-turn',
    narration: (
      <p>
        Rate-limiting broadcasts only slows how fast the symptom gets worse -- it doesn't remove the
        loop itself. Unicast frames can circulate and multiply through a physical loop just as badly
        once the MAC table is unstable, and nothing about a broadcast rate limit touches that. The
        patch cable is still connecting the switch back to itself; something still has to actually
        block one of those two ports.
      </p>
    ),
  },
  resolution: {
    id: 'resolution',
    title: 'STP was never the overhead worth cutting',
    outcome: 'resolution',
    narration: (
      <p>
        Re-enabling Spanning Tree lets the switch elect a root, calculate port roles, and put one
        side of that accidental loop into a blocking state -- the loop stops existing, not just
        slows down. The "reduce overhead" instinct wasn't wrong, just aimed at the wrong target:
        STP's own overhead is negligible on modern hardware. What actually costs time is a
        legitimate access port waiting through STP's full listening/learning cycle every time
        someone plugs in a laptop -- and that's exactly what PortFast is for, with BPDU Guard
        alongside it to instantly shut down a PortFast port if it ever unexpectedly receives a BPDU
        (i.e., if someone plugs a switch, or another loop, into what's supposed to be an end-host
        port). Fast convergence on real access ports, full loop protection everywhere -- not a
        trade-off between the two.
      </p>
    ),
  },
}

export function SwitchingLoopScenario() {
  return (
    <BranchingScenario
      category="Switching"
      title="Switching loop: one floor, random drops"
      setup={
        <p>
          A branching walk through the classic "someone disabled STP to save overhead" incident --
          diagnose the symptom, resist the tempting half-fix, and land on why PortFast and BPDU
          Guard exist in the first place.
        </p>
      }
      nodes={NODES}
      rootId="start"
    />
  )
}
