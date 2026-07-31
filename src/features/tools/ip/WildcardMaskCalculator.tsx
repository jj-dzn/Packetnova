import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { Aside } from '../Aside'
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
          <div className="flex flex-col gap-4">
            <dl>
              <ResultRow label="Prefix length" value={`/${calc.result.prefixLength}`} />
              <ResultRow label="Subnet mask" value={calc.result.subnetMask} />
              <ResultRow label="Wildcard mask" value={calc.result.wildcardMask} />
            </dl>
            <p className="text-xs text-fg-subtle">
              The wildcard mask is the bitwise inverse of the subnet mask -- every bit that's 1 in{' '}
              {calc.result.subnetMask} is 0 in {calc.result.wildcardMask}, and vice versa.
            </p>
            <Aside>
              Wildcard masks flip subnet mask logic: a <strong>0</strong> bit means "must match" and
              a <strong>1</strong> bit means "don't care" -- the opposite of a subnet mask, where 1
              means "part of the network." Cisco ACLs and OSPF{' '}
              <code className="font-mono">network</code> statements both expect wildcard masks, so
              pasting in a subnet mask by mistake will match the wrong hosts without any error.
            </Aside>
          </div>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}
