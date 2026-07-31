import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { Input } from '../../../components/ui/Input'
import { lookupMac } from '../../../lib/calculations/macLookup'

export function MacAddressLookup() {
  const [input, setInput] = useState('00:00:0c:12:34:56')

  const calc = lookupMac(input)

  return (
    <ToolPageLayout
      category="Switching"
      title="MAC address lookup"
      description="Break a MAC address down into its OUI and NIC-specific portion, and check a small set of well-known vendor OUIs."
      input={
        <div>
          <label htmlFor="mac-lookup-input" className="text-sm font-medium">
            MAC address
          </label>
          <Input
            id="mac-lookup-input"
            className="mt-2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />
        </div>
      }
      result={
        calc.ok ? (
          <div className="flex flex-col gap-3">
            <dl>
              <ResultRow label="OUI" value={calc.result.oui} />
              <ResultRow label="NIC-specific" value={calc.result.nicSpecific} />
              <ResultRow
                label="Vendor"
                value={calc.result.vendor ?? 'Not in our small reference set'}
              />
              <ResultRow label="Multicast?" value={calc.result.isMulticast ? 'Yes' : 'No'} />
              <ResultRow
                label="Locally administered?"
                value={calc.result.isLocallyAdministered ? 'Yes' : 'No (burned-in)'}
              />
            </dl>
            <p className="text-xs text-fg-subtle">
              Vendor lookup covers a small, individually-verified set of well-known OUIs, not the
              full ~50,000-entry IEEE registry.
            </p>
          </div>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}
