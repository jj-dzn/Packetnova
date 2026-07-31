import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { Input } from '../../../components/ui/Input'
import { calculateVlan } from '../../../lib/calculations/vlan'

export function VlanCalculator() {
  const [vlanId, setVlanId] = useState('100')

  const calc = calculateVlan(Number(vlanId))

  return (
    <ToolPageLayout
      category="Switching"
      title="VLAN calculator"
      description="Check a VLAN ID's validity, range classification, and hex representation."
      input={
        <div>
          <label htmlFor="vlan-id" className="text-sm font-medium">
            VLAN ID
          </label>
          <Input
            id="vlan-id"
            className="mt-2"
            value={vlanId}
            onChange={(e) => setVlanId(e.target.value)}
          />
        </div>
      }
      result={
        calc.ok ? (
          <div className="flex flex-col gap-3">
            <dl>
              <ResultRow label="Hex" value={calc.result.hex} />
              <ResultRow label="Category" value={calc.result.category} />
            </dl>
            {calc.result.note && <p className="text-xs text-fg-subtle">{calc.result.note}</p>}
          </div>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}
