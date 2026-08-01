import { ReferencePageLayout } from '../ReferencePageLayout'
import { HeaderByteDiagram } from '../HeaderByteDiagram'
import { DataTable } from '../../../components/ui/DataTable'
import { udpHeaderFields } from '../../../content/reference/udpHeaderFields'
import type { HeaderField } from '../../../content/reference/tcpHeaderFields'

export function UdpHeaderExplorer() {
  return (
    <ReferencePageLayout
      category="Protocols"
      title="UDP header explorer"
      description="Every field in a UDP header, byte by byte -- just four fields, unlike TCP's much larger header."
    >
      <div className="mb-8">
        <HeaderByteDiagram fields={udpHeaderFields} />
      </div>
      <DataTable<HeaderField>
        columns={[
          { key: 'field', label: 'Field' },
          { key: 'offset', label: 'Byte offset', mono: true },
          { key: 'size', label: 'Size', mono: true },
          { key: 'description', label: 'Description' },
        ]}
        rows={udpHeaderFields}
      />
    </ReferencePageLayout>
  )
}
