import { useState } from 'react'
import { ReferencePageLayout } from '../ReferencePageLayout'
import { RfcFootnote } from '../RfcFootnote'
import { Pill } from '../../../components/ui/Pill'
import { DataTable } from '../../../components/ui/DataTable'
import { dhcpOptions, type DhcpOptionEntry } from '../../../content/reference/dhcpOptions'

// The three options a working engineer actually configures by hand most
// often -- 66/150 for booting VoIP phones from a TFTP server, 43 for
// vendor-specific provisioning data -- shown as a real ip dhcp pool block
// rather than left as abstract option numbers in the table above.
const DHCP_POOL_CLI = `ip dhcp pool VOIP-PHONES
 network 10.10.20.0 255.255.255.0
 default-router 10.10.20.1
 dns-server 10.10.20.2
 option 66 ascii "tftp.example.com"
 option 150 ip 10.10.20.5
 option 43 hex 01.04.0a.0a.14.05`

function DhcpCliExample() {
  const [showCli, setShowCli] = useState(false)

  return (
    <div className="mb-8">
      <Pill active={showCli} onClick={() => setShowCli((v) => !v)}>
        {showCli ? 'Hide' : 'Show'} ip dhcp pool config for options 43/66/150 (expert)
      </Pill>
      {showCli && (
        <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-bg p-3 font-mono text-xs">
          {DHCP_POOL_CLI}
        </pre>
      )}
    </div>
  )
}

export function DhcpOptionsReference() {
  return (
    <ReferencePageLayout
      category="Protocols"
      title="DHCP options reference"
      description="Look up DHCP option numbers and their meaning."
    >
      <DhcpCliExample />
      <DataTable<DhcpOptionEntry>
        searchPlaceholder="Search by option number or name..."
        columns={[
          { key: 'option', label: 'Option', mono: true },
          { key: 'name', label: 'Name' },
          { key: 'description', label: 'Description' },
        ]}
        rows={dhcpOptions}
      />
      <RfcFootnote>Defined in RFC 2132, except option 150 (Cisco-proprietary).</RfcFootnote>
    </ReferencePageLayout>
  )
}
