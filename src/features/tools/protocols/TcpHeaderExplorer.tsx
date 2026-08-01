import { useState } from 'react'
import { ReferencePageLayout } from '../ReferencePageLayout'
import { ResultRow } from '../ResultRow'
import { HeaderByteDiagram } from '../HeaderByteDiagram'
import { DataTable } from '../../../components/ui/DataTable'
import { calculateTcpFlags, type TcpFlags } from '../../../lib/calculations/tcpFlags'
import { tcpHeaderFields } from '../../../content/reference/tcpHeaderFields'
import type { HeaderField } from '../../../content/reference/tcpHeaderFields'

const FLAG_LABELS: { key: keyof TcpFlags; label: string }[] = [
  { key: 'urg', label: 'URG' },
  { key: 'ack', label: 'ACK' },
  { key: 'psh', label: 'PSH' },
  { key: 'rst', label: 'RST' },
  { key: 'syn', label: 'SYN' },
  { key: 'fin', label: 'FIN' },
]

export function TcpHeaderExplorer() {
  const [flags, setFlags] = useState<TcpFlags>({
    urg: false,
    ack: true,
    psh: false,
    rst: false,
    syn: true,
    fin: false,
  })

  const calc = calculateTcpFlags(flags)

  return (
    <ReferencePageLayout
      category="Protocols"
      title="TCP header explorer"
      description="Every field in a TCP header, byte by byte, plus a quick flags-byte calculator."
    >
      <div className="mb-8">
        <HeaderByteDiagram fields={tcpHeaderFields} />
      </div>
      <div className="mb-8 grid grid-cols-1 gap-6 rounded-lg border border-border bg-surface p-6 lg:grid-cols-2">
        <div>
          <span className="text-sm font-medium">Flags</span>
          <div className="mt-2 flex flex-wrap gap-4">
            {FLAG_LABELS.map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={flags[key]}
                  onChange={(e) => setFlags((current) => ({ ...current, [key]: e.target.checked }))}
                />
                {label}
              </label>
            ))}
          </div>
        </div>
        <dl>
          <ResultRow label="Flags byte" value={calc.hex} />
          <ResultRow label="Decimal" value={String(calc.value)} />
        </dl>
      </div>
      <DataTable<HeaderField>
        columns={[
          { key: 'field', label: 'Field' },
          { key: 'offset', label: 'Byte offset', mono: true },
          { key: 'size', label: 'Size', mono: true },
          { key: 'description', label: 'Description' },
        ]}
        rows={tcpHeaderFields}
      />
    </ReferencePageLayout>
  )
}
