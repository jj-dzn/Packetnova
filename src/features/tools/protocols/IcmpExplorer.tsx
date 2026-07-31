import { ReferencePageLayout } from '../ReferencePageLayout'
import { DataTable } from '../../../components/ui/DataTable'
import { icmpTypes, type IcmpEntry } from '../../../content/reference/icmpTypes'

export function IcmpExplorer() {
  return (
    <ReferencePageLayout
      category="Protocols"
      title="ICMP explorer"
      description="Look up ICMP types and what they actually mean."
    >
      <DataTable<IcmpEntry>
        columns={[
          { key: 'type', label: 'Type', mono: true },
          { key: 'name', label: 'Name' },
          { key: 'description', label: 'Description' },
        ]}
        rows={icmpTypes}
      />
    </ReferencePageLayout>
  )
}
