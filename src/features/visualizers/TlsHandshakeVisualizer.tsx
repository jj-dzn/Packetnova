import { useState } from 'react'
import { VisualizerPageLayout } from './VisualizerPageLayout'
import { SequenceDiagramContent, type SequenceStep } from './SequenceDiagramVisualizer'
import { Pill } from '../../components/ui/Pill'

// TLS 1.3 (RFC 8446): 1-RTT handshake. Messages within each flight are
// bundled into one arrow, matching the simplification the TCP visualizer
// already makes for seq/ack detail.
const TLS_13_STEPS: SequenceStep[] = [
  {
    title: 'Ready to negotiate',
    description:
      'The client wants a secure connection (this happens after the TCP handshake completes). No TLS session exists yet.',
    leftState: 'No session',
    rightState: 'No session',
    segment: null,
    roundTripsSoFar: 0,
  },
  {
    title: '1. ClientHello',
    description:
      'The client sends its supported TLS versions, cipher suites, and an ephemeral key share to start the handshake.',
    leftState: 'Hello sent',
    rightState: 'No session',
    segment: { direction: 'right', label: 'ClientHello + key_share' },
    roundTripsSoFar: 0,
  },
  {
    title: '2. ServerHello, Certificate, Finished',
    description:
      "The server picks a cipher suite and sends its own key share -- both sides can now derive handshake keys. Everything after this point is encrypted: the server's certificate, proof it holds the matching private key, and a Finished message.",
    leftState: 'Hello sent',
    rightState: 'Cert sent (encrypted)',
    segment: { direction: 'left', label: 'ServerHello + Cert + Finished' },
    roundTripsSoFar: 1,
  },
  {
    title: '3. Client Finished',
    description:
      "The client verifies the certificate and sends its own Finished message -- it doesn't need to wait for a reply first, since it already derived the keys from flight 2. Both sides now have the application traffic keys and the connection is secure after just 1 round trip.",
    leftState: 'Secure',
    rightState: 'Secure',
    segment: { direction: 'right', label: 'Finished' },
    roundTripsSoFar: 1,
  },
  {
    title: '4. HTTP GET request',
    description:
      "With the connection secure, the browser finally sends the request it actually wanted to make -- everything before this point was negotiation, not the request itself. It's encrypted with the keys just derived, opaque to anything watching the wire.",
    leftState: 'Secure',
    rightState: 'Secure',
    segment: { direction: 'right', label: 'GET /index.html (encrypted)' },
    roundTripsSoFar: 1,
  },
  {
    title: '5. HTTP 200 OK response',
    description:
      'The server responds with the requested page, also encrypted end-to-end. This is the whole point of everything above it: TLS 1.3 spent 1 round trip negotiating, then this exchange spends a 2nd actually fetching something -- 2 round trips total before the browser has anything to render.',
    leftState: 'Secure',
    rightState: 'Secure',
    segment: { direction: 'left', label: '200 OK (encrypted)' },
    roundTripsSoFar: 2,
  },
]

// TLS 1.2 (RFC 5246): 2-RTT full handshake -- kept for comparison, since
// this is the extra round trip TLS 1.3 was specifically designed to remove.
const TLS_12_STEPS: SequenceStep[] = [
  {
    title: 'Ready to negotiate',
    description:
      'The client wants a secure connection (this happens after the TCP handshake completes). No TLS session exists yet.',
    leftState: 'No session',
    rightState: 'No session',
    segment: null,
    roundTripsSoFar: 0,
  },
  {
    title: '1. ClientHello',
    description: 'The client sends its supported TLS versions and cipher suites.',
    leftState: 'Hello sent',
    rightState: 'No session',
    segment: { direction: 'right', label: 'ClientHello' },
    roundTripsSoFar: 0,
  },
  {
    title: '2. ServerHello, Certificate, ServerKeyExchange, ServerHelloDone',
    description:
      "The server picks a cipher suite, sends its certificate in the clear (not yet encrypted -- keys haven't been derived), and signals it's done with this flight. This completes the first round trip.",
    leftState: 'Hello sent',
    rightState: 'Cert sent (plaintext)',
    segment: { direction: 'left', label: 'ServerHello + Cert + ServerKeyExchange + Done' },
    roundTripsSoFar: 1,
  },
  {
    title: '3. ClientKeyExchange, ChangeCipherSpec, Finished',
    description:
      'The client sends its key material, switches to encrypted mode, and sends an encrypted Finished message -- but it still has to wait for the server to confirm before the connection is secure.',
    leftState: 'Waiting on server',
    rightState: 'Cert sent (plaintext)',
    segment: { direction: 'right', label: 'ClientKeyExchange + ChangeCipherSpec + Finished' },
    roundTripsSoFar: 1,
  },
  {
    title: '4. ChangeCipherSpec, Finished',
    description:
      'The server switches to encrypted mode and sends its own Finished message. Only now, after a second full round trip, do both sides consider the connection secure.',
    leftState: 'Secure',
    rightState: 'Secure',
    segment: { direction: 'left', label: 'ChangeCipherSpec + Finished' },
    roundTripsSoFar: 2,
  },
  {
    title: '5. HTTP GET request',
    description:
      'With the connection finally secure, the browser sends the request it actually wanted to make. Same request as the TLS 1.3 side -- it just took a full extra round trip of negotiation to get here.',
    leftState: 'Secure',
    rightState: 'Secure',
    segment: { direction: 'right', label: 'GET /index.html (encrypted)' },
    roundTripsSoFar: 2,
  },
  {
    title: '6. HTTP 200 OK response',
    description:
      "The server responds with the requested page. Total round trips before the browser has anything to render: 3 -- 2 to negotiate, 1 to actually fetch something, versus TLS 1.3's 2. That's the entire practical difference between these two versions, made concrete.",
    leftState: 'Secure',
    rightState: 'Secure',
    segment: { direction: 'left', label: '200 OK (encrypted)' },
    roundTripsSoFar: 3,
  },
]

type Version = 'tls13' | 'tls12'

export function TlsHandshakeVisualizer() {
  const [version, setVersion] = useState<Version>('tls13')
  const steps = version === 'tls13' ? TLS_13_STEPS : TLS_12_STEPS

  return (
    <VisualizerPageLayout
      category="Visualizer"
      title="TLS handshake"
      description="See exactly how a TLS session gets negotiated and encrypted -- and why TLS 1.3 cut it down to one round trip."
      related={[{ to: '/tools/tls-version-explorer', label: 'TLS version explorer' }]}
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <Pill active={version === 'tls13'} onClick={() => setVersion('tls13')}>
          TLS 1.3 (1-RTT)
        </Pill>
        <Pill active={version === 'tls12'} onClick={() => setVersion('tls12')}>
          TLS 1.2 (2-RTT)
        </Pill>
      </div>
      <p className="mb-6 text-sm text-fg-muted">
        TLS 1.3 needs <strong className="text-fg">1</strong> round trip before the connection is
        secure; TLS 1.2 needs <strong className="text-fg">2</strong> -- on a 100ms-latency link,
        that's an extra 100ms tacked onto every single new connection, before a single byte of
        actual data moves.
      </p>
      <SequenceDiagramContent key={version} leftLabel="Client" rightLabel="Server" steps={steps} />
    </VisualizerPageLayout>
  )
}
