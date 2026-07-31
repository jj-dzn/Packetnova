import { ReferencePageLayout } from '../ReferencePageLayout'
import { DataTable } from '../../../components/ui/DataTable'
import { dhcpOptions, type DhcpOptionEntry } from '../../../content/reference/dhcpOptions'

export function DhcpOptionsReference() {
  return (
    <ReferencePageLayout
      category="Protocols"
      title="DHCP options reference"
      description="Look up DHCP option numbers and their meaning."
    >
      <DataTable<DhcpOptionEntry>
        columns={[
          { key: 'option', label: 'Option', mono: true },
          { key: 'name', label: 'Name' },
          { key: 'description', label: 'Description' },
        ]}
        rows={dhcpOptions}
      />
    </ReferencePageLayout>
  )
}
