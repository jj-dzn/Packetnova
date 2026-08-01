import { ReferencePageLayout } from '../ReferencePageLayout'
import { RfcFootnote } from '../RfcFootnote'
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
        searchPlaceholder="Search by type, name, or description..."
        columns={[
          { key: 'type', label: 'Type', mono: true },
          { key: 'name', label: 'Name' },
          { key: 'description', label: 'Description' },
        ]}
        rows={icmpTypes}
      />
      <RfcFootnote>
        Defined in RFC 792 -- this covers ICMPv4. ICMPv6 is a separate, larger specification (RFC
        4443), since IPv6 also folds in what IPv4 handled separately with ARP and IGMP.
      </RfcFootnote>
    </ReferencePageLayout>
  )
}
