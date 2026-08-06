import { Link } from 'react-router'
import { ReferencePageLayout } from '../ReferencePageLayout'
import { ToolEducation } from '../ToolEducation'
import { DataTable } from '../../../components/ui/DataTable'
import { tlsVersions, type TlsVersionEntry } from '../../../content/reference/tlsVersions'

export function TlsVersionExplorer() {
  return (
    <ReferencePageLayout
      category="Protocols"
      title="TLS version explorer"
      description="Compare TLS versions and see what changed between them."
      related={[
        { to: '/visualizers/tls-handshake', label: 'TLS handshake visualizer' },
        { to: '/tools/certificate-viewer', label: 'Certificate viewer' },
        { to: '/tools/hash-generator', label: 'Hash generator' },
      ]}
    >
      <DataTable<TlsVersionEntry>
        searchPlaceholder="Search by version or status..."
        columns={[
          { key: 'version', label: 'Version' },
          { key: 'year', label: 'Year', mono: true },
          { key: 'status', label: 'Status' },
          { key: 'notes', label: 'Notes' },
          { key: 'rfc', label: 'RFC', mono: true },
        ]}
        rows={tlsVersions}
      />
      <ToolEducation
        howItWorks={
          <p>
            Each TLS version defines its own handshake and its own set of allowed cipher suites --
            newer versions don't just add options, they actively remove weak ones the version before
            allowed. TLS 1.3 is the sharpest break: it drops static RSA key exchange, arbitrary
            cipher/hash combinations, and renegotiation entirely, rather than just recommending
            against them.
          </p>
        }
        whenToUseThis={
          <p>
            Checking what actually changed between two versions when a compliance policy names a
            specific minimum, or diagnosing a handshake failure where a client and server don't
            share a mutually acceptable version at all.
          </p>
        }
        commonMistakes={
          <p>
            Assuming a deprecated version is automatically unreachable -- deprecation is a
            recommendation, not an enforcement mechanism, and plenty of legacy embedded devices and
            old client software still only speak TLS 1.0 or 1.1, which is why some environments
            still support them deliberately rather than by oversight. The other real risk is a
            downgrade attack: an attacker on the path interferes with negotiation to force a
            connection down to the weakest version both sides technically still support, then
            attacks that version's known weaknesses. TLS 1.3's handshake includes explicit downgrade
            protection specifically to detect this.
          </p>
        }
        relatedReading={
          <p>
            Watch a modern negotiation happen step by step in the{' '}
            <Link to="/visualizers/tls-handshake" className="text-accent hover:underline">
              TLS handshake visualizer
            </Link>
            .
          </p>
        }
      />
    </ReferencePageLayout>
  )
}
