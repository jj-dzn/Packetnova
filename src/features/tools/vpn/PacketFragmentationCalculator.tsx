import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { Input } from '../../../components/ui/Input'
import { calculateFragmentation } from '../../../lib/calculations/fragmentation'

export function PacketFragmentationCalculator() {
  const [packetSize, setPacketSize] = useState('4000')
  const [pathMtu, setPathMtu] = useState('1500')

  const calc = calculateFragmentation(Number(packetSize), Number(pathMtu))

  return (
    <ToolPageLayout
      category="VPN"
      title="Packet fragmentation calculator"
      description="See when and how an IPv4 packet gets fragmented for a given path MTU."
      input={
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="frag-packet-size" className="text-sm font-medium">
              Packet size (bytes, including IP header)
            </label>
            <Input
              id="frag-packet-size"
              className="mt-2"
              value={packetSize}
              onChange={(e) => setPacketSize(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="frag-path-mtu" className="text-sm font-medium">
              Path MTU (bytes)
            </label>
            <Input
              id="frag-path-mtu"
              className="mt-2"
              value={pathMtu}
              onChange={(e) => setPathMtu(e.target.value)}
            />
          </div>
        </div>
      }
      result={
        calc.ok ? (
          <div className="flex flex-col gap-4">
            <dl>
              <ResultRow
                label="Needs fragmentation?"
                value={calc.result.needsFragmentation ? 'Yes' : 'No'}
              />
              <ResultRow label="Fragments" value={String(calc.result.fragments.length)} />
            </dl>
            <div className="max-h-80 overflow-y-auto rounded-md border border-border">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-surface">
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 font-medium text-fg-muted">#</th>
                    <th className="px-3 py-2 font-medium text-fg-muted">Payload</th>
                    <th className="px-3 py-2 font-medium text-fg-muted">Total size</th>
                    <th className="px-3 py-2 font-medium text-fg-muted">Offset</th>
                    <th className="px-3 py-2 font-medium text-fg-muted">MF flag</th>
                  </tr>
                </thead>
                <tbody>
                  {calc.result.fragments.map((fragment) => (
                    <tr
                      key={fragment.index}
                      className="border-b border-border font-mono last:border-b-0"
                    >
                      <td className="px-3 py-2">{fragment.index}</td>
                      <td className="px-3 py-2">{fragment.payloadBytes} B</td>
                      <td className="px-3 py-2">{fragment.totalBytes} B</td>
                      <td className="px-3 py-2">
                        {fragment.offsetUnits} ({fragment.offsetBytes} B)
                      </td>
                      <td className="px-3 py-2">{fragment.moreFragments ? '1' : '0'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}
