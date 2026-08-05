import { useState } from 'react'
import { VisualizerPageLayout } from './VisualizerPageLayout'
import { SequenceDiagramContent } from './SequenceDiagramVisualizer'
import { Pill } from '../../components/ui/Pill'
import { TLS_12_STEPS, TLS_13_STEPS } from '../../content/reference/tlsHandshakeSteps'

type Version = 'tls13' | 'tls12'

export function TlsHandshakeVisualizer() {
  const [version, setVersion] = useState<Version>('tls13')
  const steps = version === 'tls13' ? TLS_13_STEPS : TLS_12_STEPS

  return (
    <VisualizerPageLayout
      category="Visualizer"
      title="TLS handshake"
      description="See exactly how a TLS session gets negotiated and encrypted -- and why TLS 1.3 cut it down to one round trip."
      related={[
        { to: '/visualizers/tls-1-2-vs-1-3', label: 'Compare: TLS 1.2 vs TLS 1.3' },
        { to: '/tools/tls-version-explorer', label: 'TLS version explorer' },
      ]}
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
