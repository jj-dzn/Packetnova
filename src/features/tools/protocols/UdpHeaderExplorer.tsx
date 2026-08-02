import { ReferencePageLayout } from '../ReferencePageLayout'
import { RfcFootnote } from '../RfcFootnote'
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
      <p className="mb-6 max-w-2xl text-sm text-fg-muted">
        UDP's header is 8 bytes; TCP's is at least 20. The difference is what's missing: no sequence
        numbers, no acknowledgments, no window size -- UDP doesn't guarantee delivery, ordering, or
        flow control at all. That's not a limitation to work around, it's the whole trade: less
        overhead per packet, in exchange for the application handling reliability itself if it needs
        it (or not needing it -- DNS, DHCP, and live video all lean on this).
      </p>
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
      <RfcFootnote>Defined in RFC 768.</RfcFootnote>
    </ReferencePageLayout>
  )
}
