import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { calculateTunnelOverhead } from '../../../lib/calculations/tunnelOverhead'
import { tunnelOverheadPresets } from '../../../content/reference/vpnOverhead'

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
          <dl>
            <ResultRow label="Overhead (bytes)" value={`${calc.result.overheadBytes} bytes`} />
            <ResultRow label="Effective MTU" value={`${calc.result.effectiveMtu} bytes`} />
            <ResultRow label="Overhead (%)" value={`${calc.result.overheadPercent.toFixed(2)}%`} />
          </dl>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}
