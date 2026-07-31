import { ReferencePageLayout } from '../ReferencePageLayout'
import { DataTable } from '../../../components/ui/DataTable'
import { httpStatusCodes, type HttpStatusEntry } from '../../../content/reference/httpStatusCodes'

export function HttpStatusReference() {
  return (
    <ReferencePageLayout
      category="Protocols"
      title="HTTP status reference"
      description="Look up any common HTTP status code and what it means."
    >
      <DataTable<HttpStatusEntry>
        columns={[
          { key: 'code', label: 'Code', mono: true },
          { key: 'name', label: 'Name' },
          { key: 'description', label: 'Description' },
        ]}
        rows={httpStatusCodes}
      />
    </ReferencePageLayout>
  )
}
