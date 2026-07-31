import { ReferencePageLayout } from '../ReferencePageLayout'
import { DataTable } from '../../../components/ui/DataTable'
import { dnsRecordTypes, type DnsRecordEntry } from '../../../content/reference/dnsRecordTypes'

export function DnsRecordReference() {
  return (
    <ReferencePageLayout
      category="Protocols"
      title="DNS record reference"
      description="Every common DNS record type and what it's used for."
    >
      <DataTable<DnsRecordEntry>
        searchPlaceholder="Search by record type or description..."
        columns={[
          { key: 'type', label: 'Type', mono: true },
          { key: 'description', label: 'Description' },
        ]}
        rows={dnsRecordTypes}
      />
    </ReferencePageLayout>
  )
}
