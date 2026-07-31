import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { Input } from '../../../components/ui/Input'
import { calculateWildcardMask } from '../../../lib/calculations/wildcardMask'

export function WildcardMaskCalculator() {
  const [input, setInput] = useState('255.255.255.0')
  const calc = calculateWildcardMask(input)

  return (
    <ToolPageLayout
      category="IP"
      title="Wildcard mask calculator"
      description="Convert a subnet mask to its wildcard mask for ACLs and OSPF."
      input={
        <div>
          <label htmlFor="wildcard-input" className="text-sm font-medium">
            Subnet mask or prefix length
          </label>
          <Input
            id="wildcard-input"
            className="mt-2"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="255.255.255.0 or /24"
            spellCheck={false}
          />
        </div>
      }
      result={
        calc.ok ? (
          <dl>
            <ResultRow label="Prefix length" value={`/${calc.result.prefixLength}`} />
            <ResultRow label="Subnet mask" value={calc.result.subnetMask} />
            <ResultRow label="Wildcard mask" value={calc.result.wildcardMask} />
          </dl>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}
