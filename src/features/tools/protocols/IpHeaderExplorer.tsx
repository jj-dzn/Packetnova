import { useState } from 'react'
import { Link } from 'react-router'
import { ReferencePageLayout } from '../ReferencePageLayout'
import { ResultRow } from '../ResultRow'
import { HeaderByteDiagram } from '../HeaderByteDiagram'
import { DataTable } from '../../../components/ui/DataTable'
import { calculateIpFlags, type IpFlags } from '../../../lib/calculations/ipFlags'
import { ipHeaderFields } from '../../../content/reference/ipHeaderFields'
import type { HeaderField } from '../../../content/reference/tcpHeaderFields'

export function IpHeaderExplorer() {
  const [flags, setFlags] = useState<IpFlags>({ dontFragment: true, moreFragments: false })

  const calc = calculateIpFlags(flags)

  return (
    <ReferencePageLayout
      category="Protocols"
      title="IP header explorer"
      description="Every field in an IPv4 header, byte by byte, plus a quick flags-field calculator."
    >
      <div className="mb-8">
        <HeaderByteDiagram fields={ipHeaderFields} />
      </div>
      <div className="mb-8 grid grid-cols-1 gap-6 rounded-lg border border-border bg-surface p-6 lg:grid-cols-2">
        <div>
          <span className="text-sm font-medium">Flags</span>
          <div className="mt-2 flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={flags.dontFragment}
                onChange={(e) =>
                  setFlags((current) => ({ ...current, dontFragment: e.target.checked }))
                }
              />
              Don't Fragment (DF)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={flags.moreFragments}
                onChange={(e) =>
                  setFlags((current) => ({ ...current, moreFragments: e.target.checked }))
                }
              />
              More Fragments (MF)
            </label>
          </div>
        </div>
        <dl>
          <ResultRow label="Flags (binary)" value={calc.binary} />
          <ResultRow label="Decimal" value={String(calc.value)} />
        </dl>
      </div>
      <DataTable<HeaderField>
        columns={[
          { key: 'field', label: 'Field' },
          { key: 'offset', label: 'Byte offset', mono: true },
          { key: 'size', label: 'Size', mono: true },
          {
            key: 'description',
            label: 'Description',
            render: (row) =>
              row.field === 'Fragment Offset' ? (
                <>
                  {row.description} -- see it in action in the{' '}
                  <Link
                    to="/tools/packet-fragmentation-calculator"
                    className="text-accent hover:underline"
                  >
                    Packet fragmentation calculator
                  </Link>
                  .
                </>
              ) : (
                row.description
              ),
          },
        ]}
        rows={ipHeaderFields}
      />
    </ReferencePageLayout>
  )
}
