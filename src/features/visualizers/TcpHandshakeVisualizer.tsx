import { useState } from 'react'
import { VisualizerPageLayout } from './VisualizerPageLayout'
import { SequenceDiagramContent, type SequenceStep } from './SequenceDiagramVisualizer'
import { Pill } from '../../components/ui/Pill'

const NORMAL_STEPS: SequenceStep[] = [
  {
    title: 'Ready to connect',
    description:
      'The client wants to open a TCP connection to the server. The server is listening for incoming connections.',
    leftState: 'CLOSED',
    rightState: 'LISTEN',
    segment: null,
  },
  {
    title: '1. SYN',
    description:
      'The client picks an initial sequence number (100) and sends a SYN segment to start the handshake.',
    leftState: 'SYN_SENT',
    rightState: 'LISTEN',
    segment: { direction: 'right', label: 'SYN seq=100' },
  },
  {
    title: '2. SYN-ACK',
    description:
      "The server acknowledges the client's SYN (ack=101) and sends its own SYN with its initial sequence number (300).",
    leftState: 'SYN_SENT',
    rightState: 'SYN_RECEIVED',
    segment: { direction: 'left', label: 'SYN-ACK seq=300 ack=101' },
  },
  {
    title: '3. ACK',
    description:
      "The client acknowledges the server's SYN (ack=301). Both sides now consider the connection established.",
    leftState: 'ESTABLISHED',
    rightState: 'ESTABLISHED',
    segment: { direction: 'right', label: 'ACK ack=301' },
  },
]

const SYN_LOST_STEPS: SequenceStep[] = [
  {
    title: 'Ready to connect',
    description:
      'The client wants to open a TCP connection to the server. The server is listening for incoming connections.',
    leftState: 'CLOSED',
    rightState: 'LISTEN',
    segment: null,
  },
  {
    title: '1. SYN -- lost in transit',
    description:
      'The client sends a SYN, but it never reaches the server -- dropped by a congested link, for example. The server has no idea a connection attempt happened.',
    leftState: 'SYN_SENT',
    rightState: 'LISTEN',
    segment: { direction: 'right', label: 'SYN seq=100', lost: true },
  },
  {
    title: '2. Retransmission timeout',
    description:
      "The client's retransmission timer (RTO) expires with no SYN-ACK received -- from the client's perspective, this looks identical to the SYN itself being lost.",
    leftState: 'SYN_SENT (RTO expired)',
    rightState: 'LISTEN',
    segment: null,
  },
  {
    title: '3. SYN retransmitted',
    description: 'The client resends the same SYN. This time it arrives.',
    leftState: 'SYN_SENT',
    rightState: 'LISTEN',
    segment: { direction: 'right', label: 'SYN seq=100 (retry)' },
  },
  {
    title: '4. SYN-ACK',
    description: "The server acknowledges the client's SYN and sends its own SYN.",
    leftState: 'SYN_SENT',
    rightState: 'SYN_RECEIVED',
    segment: { direction: 'left', label: 'SYN-ACK seq=300 ack=101' },
  },
  {
    title: '5. ACK',
    description:
      'The client acknowledges the SYN-ACK. Both sides consider the connection established -- one RTO cycle later than the loss-free case.',
    leftState: 'ESTABLISHED',
    rightState: 'ESTABLISHED',
    segment: { direction: 'right', label: 'ACK ack=301' },
  },
]

const SYN_ACK_LOST_STEPS: SequenceStep[] = [
  {
    title: 'Ready to connect',
    description:
      'The client wants to open a TCP connection to the server. The server is listening for incoming connections.',
    leftState: 'CLOSED',
    rightState: 'LISTEN',
    segment: null,
  },
  {
    title: '1. SYN',
    description: 'The client sends a SYN, which arrives fine.',
    leftState: 'SYN_SENT',
    rightState: 'LISTEN',
    segment: { direction: 'right', label: 'SYN seq=100' },
  },
  {
    title: '2. SYN-ACK -- lost in transit',
    description:
      'The server processes the SYN and moves to SYN_RECEIVED, but its SYN-ACK reply never reaches the client. As far as the client can tell, nothing happened yet.',
    leftState: 'SYN_SENT',
    rightState: 'SYN_RECEIVED',
    segment: { direction: 'left', label: 'SYN-ACK seq=300 ack=101', lost: true },
  },
  {
    title: '3. Retransmission timeout',
    description:
      "The client's RTO expires with no SYN-ACK received. It has no way to know the server already responded -- from its side, this looks exactly like the SYN being lost.",
    leftState: 'SYN_SENT (RTO expired)',
    rightState: 'SYN_RECEIVED',
    segment: null,
  },
  {
    title: '4. SYN retransmitted',
    description:
      'The client resends its original SYN. The server, already in SYN_RECEIVED, treats this as a duplicate and simply resends its SYN-ACK.',
    leftState: 'SYN_SENT',
    rightState: 'SYN_RECEIVED',
    segment: { direction: 'right', label: 'SYN seq=100 (retry)' },
  },
  {
    title: '5. SYN-ACK retransmitted',
    description: "This time the server's SYN-ACK arrives.",
    leftState: 'SYN_SENT',
    rightState: 'SYN_RECEIVED',
    segment: { direction: 'left', label: 'SYN-ACK seq=300 ack=101 (retry)' },
  },
  {
    title: '6. ACK',
    description:
      'The client acknowledges the SYN-ACK. Both sides consider the connection established -- one RTO cycle later than the loss-free case.',
    leftState: 'ESTABLISHED',
    rightState: 'ESTABLISHED',
    segment: { direction: 'right', label: 'ACK ack=301' },
  },
]

type Scenario = 'normal' | 'syn-lost' | 'syn-ack-lost'

const SCENARIOS: { key: Scenario; label: string; steps: SequenceStep[] }[] = [
  { key: 'normal', label: 'Normal handshake', steps: NORMAL_STEPS },
  { key: 'syn-lost', label: 'SYN lost', steps: SYN_LOST_STEPS },
  { key: 'syn-ack-lost', label: 'SYN-ACK lost', steps: SYN_ACK_LOST_STEPS },
]

export function TcpHandshakeVisualizer() {
  const [scenario, setScenario] = useState<Scenario>('normal')
  const active = SCENARIOS.find((s) => s.key === scenario)!

  return (
    <VisualizerPageLayout
      category="Visualizer"
      title="TCP three-way handshake"
      description={
        scenario === 'normal'
          ? 'Watch SYN, SYN-ACK, and ACK establish a connection step by step.'
          : 'This is the reason engineers actually care about the handshake in production: what happens when a segment gets dropped, and how retransmission recovers it.'
      }
    >
      <div className="mb-6 flex flex-wrap gap-2">
        {SCENARIOS.map((s) => (
          <Pill key={s.key} active={scenario === s.key} onClick={() => setScenario(s.key)}>
            {s.label}
          </Pill>
        ))}
      </div>
      <SequenceDiagramContent
        key={scenario}
        leftLabel="Client"
        rightLabel="Server"
        steps={active.steps}
      />
    </VisualizerPageLayout>
  )
}
