import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { Input } from '../../../components/ui/Input'
import { formatMacAddress } from '../../../lib/calculations/macFormat'

export function MacFormatter() {
  const [input, setInput] = useState('00:1a:2b:3c:4d:5e')

  const calc = formatMacAddress(input)

  return (
    <ToolPageLayout
      category="Switching"
      title="MAC formatter"
      description="Convert a MAC address between colon, hyphen, and Cisco dotted-quad notation."
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
          <dl>
            <ResultRow label="Colon" value={calc.result.colon} />
            <ResultRow label="Hyphen" value={calc.result.hyphen} />
            <ResultRow label="Dot (Cisco)" value={calc.result.dot} />
          </dl>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}
