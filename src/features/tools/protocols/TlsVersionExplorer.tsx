import { ReferencePageLayout } from '../ReferencePageLayout'
import { DataTable } from '../../../components/ui/DataTable'
import { tlsVersions, type TlsVersionEntry } from '../../../content/reference/tlsVersions'

export function TlsVersionExplorer() {
  return (
    <ReferencePageLayout
      category="Protocols"
      title="TLS version explorer"
      description="Compare TLS versions and see what changed between them."
    >
      <DataTable<TlsVersionEntry>
        searchPlaceholder="Search by version or status..."
        columns={[
          { key: 'version', label: 'Version' },
          { key: 'year', label: 'Year', mono: true },
          { key: 'status', label: 'Status' },
          { key: 'notes', label: 'Notes' },
        ]}
        rows={tlsVersions}
      />
    </ReferencePageLayout>
  )
}
