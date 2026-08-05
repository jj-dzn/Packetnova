import { Link } from 'react-router'
import { VisualizerPageLayout } from './VisualizerPageLayout'
import { ProtocolComparisonTimeline, type StateTimelineStep } from './ProtocolComparison'

// Classic 802.1D timer-driven convergence: forward_delay (15s default) spent
// in Listening, another 15s in Learning, before a port that should be
// forwarding actually is -- the textbook "30 seconds" figure, using the
// vendor-default timers most real deployments never change.
const STP_STEPS: StateTimelineStep[] = [
  {
    time: '0s',
    state: 'Blocking',
    description:
      "A topology change just happened. The port isn't forwarding or learning MAC addresses yet -- only listening for BPDUs to work out where it belongs in the new topology.",
  },
  {
    time: '0-15s',
    state: 'Listening',
    description:
      'Confirmed this port should become root or designated, but still not forwarding or learning -- waiting out the forward delay timer to be sure no loop exists before doing anything.',
  },
  {
    time: '15-30s',
    state: 'Learning',
    description:
      "Populating the MAC address table from frames it sees, but user traffic still isn't forwarded. A second full forward delay timer.",
  },
  {
    time: '30s',
    state: 'Forwarding',
    description:
      'Finally passing traffic -- 30 seconds after the topology change, in the best case with default timers. Worse if the max age timer (up to 20s) is also in play.',
  },
]

// 802.1w replaces fixed timers with an explicit proposal/agreement
// handshake between neighboring switches on point-to-point links: each
// side confirms the other agrees on the new topology directly, instead of
// both just waiting out a worst-case timer. Real convergence is typically
// sub-second per hop; a couple of seconds end-to-end across several
// switches is a realistic worst case, not a best case.
const RSTP_STEPS: StateTimelineStep[] = [
  {
    time: '0s',
    state: 'Discarding',
    description:
      'RSTP collapses Disabled/Blocking/Listening into one Discarding state. A topology change just happened, same starting point as STP.',
  },
  {
    time: '0-1s',
    state: 'Learning',
    description:
      "A proposal/agreement handshake with the neighboring switch confirms both sides agree on the new topology directly -- no need to wait out a fixed timer meant for a worst case that didn't happen here.",
  },
  {
    time: '1-3s',
    state: 'Forwarding',
    description:
      'Passing traffic -- typically under a second per hop on point-to-point links, a few seconds worst case across multiple hops. An edge port (PortFast-equivalent) skips straight here in well under a second.',
  },
]

export function StpRstpComparisonVisualizer() {
  return (
    <VisualizerPageLayout
      category="Comparison"
      title="STP vs RSTP convergence"
      description="Watch a port's state machine run under both protocols after the same topology change -- and see exactly what RSTP's handshake replaces STP's fixed timers with."
      related={[
        { to: '/tools/stp-overview', label: 'STP overview' },
        { to: '/scenarios/vlan-misconfiguration', label: 'Scenario: VLAN misconfiguration' },
      ]}
    >
      <p className="mb-6 text-sm text-fg-muted">
        Press <strong className="text-fg">Play both</strong>: RSTP reaches Forwarding while STP is
        still sitting in Listening, waiting out a timer designed for a worst case that usually isn't
        happening. The difference isn't RSTP being "faster" at the same job -- it does the job
        differently, confirming agreement with its neighbor directly instead of assuming the worst
        and waiting it out.
      </p>
      <ProtocolComparisonTimeline
        left={{ label: 'STP (802.1D)', sublabel: 'Fixed timers', steps: STP_STEPS }}
        right={{
          label: 'RSTP (802.1w)',
          sublabel: 'Proposal/agreement handshake',
          steps: RSTP_STEPS,
        }}
      />
      <p className="mt-6 text-xs text-fg-subtle">
        See the actual root bridge election and port-blocking logic behind these states?{' '}
        <Link to="/tools/stp-overview" className="text-accent hover:underline">
          STP overview
        </Link>{' '}
        runs it live on a topology you build.
      </p>
    </VisualizerPageLayout>
  )
}
