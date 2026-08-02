import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { calculateTunnelOverhead } from '../../../lib/calculations/tunnelOverhead'
import { tunnelOverheadPresets } from '../../../content/reference/vpnOverhead'

// A per-row payload-vs-overhead bar -- the percentage column already states
// the ratio as a number, but a bar makes it possible to compare rows at a
// glance while scanning the table instead of reading each percentage in turn.
function PayloadOverheadBar({ payload, overhead }: { payload: number; overhead: number }) {
  const total = payload + overhead
  return (
    <div
      className="flex h-3 w-24 overflow-hidden rounded-sm"
      title={`${payload}B payload, ${overhead}B overhead`}
    >
      <div className="bg-accent" style={{ width: `${(payload / total) * 100}%` }} />
      <div className="bg-danger/60" style={{ width: `${(overhead / total) * 100}%` }} />
    </div>
  )
}

export function TunnelOverheadCalculator() {
  const [linkMtu, setLinkMtu] = useState('1500')
  const [presetId, setPresetId] = useState('wireguard')
  const [customBytes, setCustomBytes] = useState('60')

  const preset = tunnelOverheadPresets.find((p) => p.id === presetId) ?? tunnelOverheadPresets[0]!
  const overheadBytes = presetId === 'custom' ? Number(customBytes) : preset.overheadBytes

  const calc = calculateTunnelOverhead(Number(linkMtu), overheadBytes)

  return (
    <ToolPageLayout
      category="VPN"
      title="VPN tunnel overhead calculator"
      description="See how much throughput a VPN tunnel's encapsulation overhead actually costs you."
      input={
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="tunnel-mtu" className="text-sm font-medium">
              Link MTU (bytes)
            </label>
            <Input
              id="tunnel-mtu"
              className="mt-2"
              value={linkMtu}
              onChange={(e) => setLinkMtu(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="tunnel-type" className="text-sm font-medium">
              Tunnel type
            </label>
            <Select
              id="tunnel-type"
              className="mt-2"
              value={presetId}
              onChange={(e) => setPresetId(e.target.value)}
            >
              {tunnelOverheadPresets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                  {p.id !== 'custom' ? ` (${p.overheadBytes} bytes)` : ''}
                </option>
              ))}
            </Select>
            {preset.note && <p className="mt-1 text-xs text-fg-subtle">{preset.note}</p>}
          </div>
          {presetId === 'custom' && (
            <div>
              <label htmlFor="tunnel-custom-bytes" className="text-sm font-medium">
                Overhead (bytes)
              </label>
              <Input
                id="tunnel-custom-bytes"
                className="mt-2"
                value={customBytes}
                onChange={(e) => setCustomBytes(e.target.value)}
              />
            </div>
          )}
        </div>
      }
      result={
        calc.ok ? (
          <div className="flex flex-col gap-6">
            <dl>
              <ResultRow label="Overhead (bytes)" value={`${calc.result.overheadBytes} bytes`} />
              <ResultRow label="Effective MTU" value={`${calc.result.effectiveMtu} bytes`} />
              <ResultRow
                label="Overhead (%)"
                value={`${calc.result.overheadPercent.toFixed(2)}%`}
              />
            </dl>
            <div>
              <p className="mb-1 text-sm font-medium">
                Every tunnel type at this {calc.result.linkMtu}-byte link MTU
              </p>
              <p className="mb-2 text-xs text-fg-subtle">
                <span className="inline-block h-2 w-2 rounded-full bg-accent align-middle" />{' '}
                payload &nbsp;
                <span className="inline-block h-2 w-2 rounded-full bg-danger/60 align-middle" />{' '}
                overhead
              </p>
              <div className="overflow-x-auto rounded-md border border-border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface">
                    <tr className="border-b border-border">
                      <th className="px-3 py-2 font-medium text-fg-muted">Tunnel type</th>
                      <th className="px-3 py-2 font-medium text-fg-muted">Overhead</th>
                      <th className="px-3 py-2 font-medium text-fg-muted">Effective MTU</th>
                      <th className="px-3 py-2 font-medium text-fg-muted">Overhead %</th>
                      <th className="px-3 py-2 font-medium text-fg-muted">Payload vs. overhead</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tunnelOverheadPresets
                      .filter((p) => p.id !== 'custom')
                      .map((p) => {
                        const presetCalc = calculateTunnelOverhead(Number(linkMtu), p.overheadBytes)
                        return (
                          <tr
                            key={p.id}
                            className={`border-b border-border font-mono last:border-b-0 ${
                              p.id === presetId ? 'bg-accent/10' : ''
                            }`}
                          >
                            <td className="px-3 py-2 font-sans">{p.label}</td>
                            <td className="px-3 py-2">{p.overheadBytes} B</td>
                            <td className="px-3 py-2">
                              {presetCalc.ok ? `${presetCalc.result.effectiveMtu} B` : '--'}
                            </td>
                            <td className="px-3 py-2">
                              {presetCalc.ok
                                ? `${presetCalc.result.overheadPercent.toFixed(2)}%`
                                : '--'}
                            </td>
                            <td className="px-3 py-2">
                              {presetCalc.ok && (
                                <PayloadOverheadBar
                                  payload={presetCalc.result.effectiveMtu}
                                  overhead={presetCalc.result.overheadBytes}
                                />
                              )}
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}
