import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { Input } from '../../../components/ui/Input'
import { analyzeIPv6 } from '../../../lib/calculations/ipv6'

export function Ipv6Calculator() {
  const [input, setInput] = useState('2001:0db8:0000:0000:0000:ff00:0042:8329')
  const calc = analyzeIPv6(input)

  return (
    <ToolPageLayout
      category="IP"
      title="IPv6 calculator"
      description="Expand, compress, and inspect IPv6 addresses and prefixes."
      input={
        <div>
          <label htmlFor="ipv6-input" className="text-sm font-medium">
            IPv6 address
          </label>
          <Input
            id="ipv6-input"
            className="mt-2 font-mono"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="2001:db8::1 or 2001:db8::/32"
            spellCheck={false}
          />
        </div>
      }
      result={
        calc.ok ? (
          <dl>
            <ResultRow label="Expanded" value={calc.result.expanded} />
            <ResultRow label="Compressed" value={calc.result.compressed} />
            <ResultRow
              label="Prefix length"
              value={
                calc.result.prefixLength === null ? 'Not specified' : `/${calc.result.prefixLength}`
              }
            />
            <ResultRow label="Address type" value={calc.result.addressType} />
          </dl>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}
