import { ReferencePageLayout } from '../ReferencePageLayout'
import { RfcFootnote } from '../RfcFootnote'
import { DataTable } from '../../../components/ui/DataTable'
import { Badge } from '../../../components/ui/Badge'
import { httpStatusCodes, type HttpStatusEntry } from '../../../content/reference/httpStatusCodes'

type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger'

const CLASS_INFO: Record<number, { label: string; tone: BadgeTone }> = {
  1: { label: '1xx Informational', tone: 'neutral' },
  2: { label: '2xx Success', tone: 'success' },
  3: { label: '3xx Redirection', tone: 'accent' },
  4: { label: '4xx Client Error', tone: 'warning' },
  5: { label: '5xx Server Error', tone: 'danger' },
}

export function HttpStatusReference() {
  return (
    <ReferencePageLayout
      category="Protocols"
      title="HTTP status reference"
      description="Look up any common HTTP status code and what it means."
    >
      <DataTable<HttpStatusEntry>
        searchPlaceholder="Search by code, name, or description..."
        columns={[
          { key: 'code', label: 'Code', mono: true },
          {
            key: 'code',
            id: 'class',
            label: 'Class',
            render: (row) => {
              const info = CLASS_INFO[Math.floor(row.code / 100)]
              return info ? <Badge tone={info.tone}>{info.label}</Badge> : null
            },
          },
          { key: 'name', label: 'Name' },
          { key: 'description', label: 'Description' },
        ]}
        rows={httpStatusCodes}
      />
      <RfcFootnote>
        Defined in RFC 9110 (HTTP Semantics) -- the current consolidated specification, obsoleting
        RFC 7231 and the older RFC 2616.
      </RfcFootnote>
    </ReferencePageLayout>
  )
}
