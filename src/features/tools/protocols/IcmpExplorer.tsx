import { ReferencePageLayout } from '../ReferencePageLayout'
import { ToolEducation } from '../ToolEducation'
import { RfcFootnote } from '../RfcFootnote'
import { DataTable } from '../../../components/ui/DataTable'
import { icmpTypes, type IcmpEntry } from '../../../content/reference/icmpTypes'

export function IcmpExplorer() {
  return (
    <ReferencePageLayout
      category="Protocols"
      title="ICMP explorer"
      description="Look up ICMP types and what they actually mean."
      related={[{ to: '/tools/ip-header-explorer', label: 'IP header explorer' }]}
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
      <ToolEducation
        howItWorks={
          <p>
            ICMP isn't a transport for user data -- it's IP's own diagnostic and control-message
            layer, carried directly inside IP packets (protocol number 1) rather than over TCP or
            UDP. Every message pairs a type with a code that narrows it -- type 3 alone covers
            everything from "network unreachable" to "fragmentation needed," each its own distinct
            code.
          </p>
        }
        commonMistakes={
          <p>
            Blocking ICMP wholesale at a firewall is one of the most common self-inflicted outages
            in networking -- it doesn't just stop ping. Type 3 code 4 ("fragmentation needed but DF
            set") is exactly the message Path MTU Discovery depends on to tell a sender its packets
            are too big; silently dropping it doesn't make the problem go away, it turns into a
            connection that hangs with no error on either end -- a PMTUD black hole.
          </p>
        }
      />
    </ReferencePageLayout>
  )
}
