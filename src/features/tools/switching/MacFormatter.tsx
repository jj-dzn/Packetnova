import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { MacBinaryBreakdown } from './MacBinaryBreakdown'
import { Input } from '../../../components/ui/Input'
import { Pill } from '../../../components/ui/Pill'
import { formatMacAddress } from '../../../lib/calculations/macFormat'
import { useUrlState } from '../../../hooks/useUrlState'

export function MacFormatter() {
  const [input, setInput] = useUrlState('mac', '00:1a:2b:3c:4d:5e')
  const [showBinary, setShowBinary] = useState(false)

  const calc = formatMacAddress(input)

  return (
    <ToolPageLayout
      category="Switching"
      title="MAC formatter"
      description="Convert a MAC address between colon, hyphen, and Cisco dotted-quad notation."
      related={[{ to: '/tools/mac-address-lookup', label: 'MAC address lookup' }]}
      input={
        <div>
          <label htmlFor="mac-format-input" className="text-sm font-medium">
            MAC address
          </label>
          <Input
            id="mac-format-input"
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
            <p className="text-xs text-fg-subtle">
              Detected: <span className="text-fg-muted">{calc.result.detectedFormat}</span> input
            </p>
            <dl>
              <ResultRow label="Colon" value={calc.result.colon} />
              <ResultRow label="Hyphen" value={calc.result.hyphen} />
              <ResultRow label="Dot (Cisco)" value={calc.result.dot} />
            </dl>
            <div>
              <Pill active={showBinary} onClick={() => setShowBinary((v) => !v)}>
                {showBinary ? 'Hide' : 'Show'} binary (expert)
              </Pill>
              {showBinary && (
                <div className="mt-3">
                  <MacBinaryBreakdown bytes={calc.result.bytes} />
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}
