import { SequenceDiagramVisualizer, type SequenceStep } from './SequenceDiagramVisualizer'

const STEPS: SequenceStep[] = [
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

export function TcpHandshakeVisualizer() {
  return (
    <SequenceDiagramVisualizer
      category="Visualizer"
      title="TCP three-way handshake"
      description="Watch SYN, SYN-ACK, and ACK establish a connection step by step."
      leftLabel="Client"
      rightLabel="Server"
      steps={STEPS}
    />
  )
}
