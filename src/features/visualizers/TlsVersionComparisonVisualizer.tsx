import { Link } from 'react-router'
import { VisualizerPageLayout } from './VisualizerPageLayout'
import { ProtocolComparisonSequence } from './ProtocolComparison'
import { TLS_12_STEPS, TLS_13_STEPS } from '../../content/reference/tlsHandshakeSteps'

// Reuses the exact step data TlsHandshakeVisualizer already authored --
// same messages, same descriptions -- rendered two at once instead of
// behind a toggle, so the round-trip difference is something you watch
// happen side by side instead of something you're told about.
export function TlsVersionComparisonVisualizer() {
  return (
    <VisualizerPageLayout
      category="Comparison"
      title="TLS 1.2 vs TLS 1.3"
      description="Watch both handshakes run side by side and see exactly where TLS 1.3 cuts out a full round trip."
      related={[
        { to: '/visualizers/tls-handshake', label: 'TLS handshake (single version)' },
        { to: '/tools/tls-version-explorer', label: 'TLS version explorer' },
      ]}
    >
      <p className="mb-6 text-sm text-fg-muted">
        Press <strong className="text-fg">Play both</strong> and watch: TLS 1.3 finishes negotiating
        and starts sending real data after <strong className="text-fg">1</strong> round trip. TLS
        1.2 needs <strong className="text-fg">2</strong> -- the same handshake, the same certificate
        exchange, just one extra there-and-back before either side trusts the connection is secure.
        On a 100ms-latency link, that's 100ms tacked onto every single new connection, before a
        single byte of the actual page loads.
      </p>
      <ProtocolComparisonSequence
        left={{ label: 'TLS 1.2', sublabel: '2-RTT full handshake', steps: TLS_12_STEPS }}
        right={{ label: 'TLS 1.3', sublabel: '1-RTT handshake', steps: TLS_13_STEPS }}
      />
      <p className="mt-6 text-xs text-fg-subtle">
        Want the full detail on either version on its own -- every message, stepped through one at a
        time?{' '}
        <Link to="/visualizers/tls-handshake" className="text-accent hover:underline">
          See the single-version TLS handshake visualizer
        </Link>
        .
      </p>
    </VisualizerPageLayout>
  )
}
