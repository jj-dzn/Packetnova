import { SequenceDiagramVisualizer, type SequenceStep } from './SequenceDiagramVisualizer'

// TLS 1.3 (RFC 8446) -- current best practice per the TLS version reference
// tool, and its 1-RTT handshake maps cleanly onto the same three-message
// shape as the TCP visualizer. Messages within each flight are bundled into
// one arrow, same simplification the TCP visualizer already makes for
// seq/ack detail.
const STEPS: SequenceStep[] = [
  {
    title: 'Ready to negotiate',
    description:
      'The client wants a secure connection (this happens after the TCP handshake completes). No TLS session exists yet.',
    leftState: 'No session',
    rightState: 'No session',
    segment: null,
  },
  {
    title: '1. ClientHello',
    description:
      'The client sends its supported TLS versions, cipher suites, and an ephemeral key share to start the handshake.',
    leftState: 'Hello sent',
    rightState: 'No session',
    segment: { direction: 'right', label: 'ClientHello + key_share' },
  },
  {
    title: '2. ServerHello, Certificate, Finished',
    description:
      "The server picks a cipher suite and sends its own key share -- both sides can now derive handshake keys. Everything after this point is encrypted: the server's certificate, proof it holds the matching private key, and a Finished message.",
    leftState: 'Hello sent',
    rightState: 'Cert sent (encrypted)',
    segment: { direction: 'left', label: 'ServerHello + Cert + Finished' },
  },
  {
    title: '3. Client Finished',
    description:
      'The client verifies the certificate and sends its own Finished message. Both sides derive the application traffic keys -- the connection is now fully encrypted.',
    leftState: 'Secure',
    rightState: 'Secure',
    segment: { direction: 'right', label: 'Finished' },
  },
]

export function TlsHandshakeVisualizer() {
  return (
    <SequenceDiagramVisualizer
      category="Visualizer"
      title="TLS handshake"
      description="See exactly how a TLS 1.3 session gets negotiated and encrypted."
      leftLabel="Client"
      rightLabel="Server"
      steps={STEPS}
    />
  )
}
