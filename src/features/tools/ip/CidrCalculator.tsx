import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { Input } from '../../../components/ui/Input'
import { calculateCidr } from '../../../lib/calculations/cidr'

export function CidrCalculator() {
  const [input, setInput] = useState('192.168.1.0/24')
  const calc = calculateCidr(input)

  return (
    <ToolPageLayout
      category="IP"
      title="CIDR calculator"
      description="Break down any CIDR block into its network address, broadcast address, subnet mask, and usable host range."
      input={
        <div>
          <label htmlFor="cidr-input" className="text-sm font-medium">
            CIDR block
          </label>
          <Input
            id="cidr-input"
            className="mt-2"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="192.168.1.0/24"
            spellCheck={false}
          />
        </div>
      }
      result={
        calc.ok ? (
          <dl>
            <ResultRow label="Network address" value={calc.result.networkAddress} />
            <ResultRow label="Broadcast address" value={calc.result.broadcastAddress} />
            <ResultRow label="Subnet mask" value={calc.result.subnetMask} />
            <ResultRow label="Wildcard mask" value={calc.result.wildcardMask} />
            <ResultRow
              label="Usable host range"
              value={
                calc.result.firstUsable && calc.result.lastUsable
                  ? `${calc.result.firstUsable} - ${calc.result.lastUsable}`
                  : 'None'
              }
            />
            <ResultRow
              label="Total addresses"
              value={calc.result.totalAddresses.toLocaleString()}
            />
            <ResultRow label="Usable hosts" value={calc.result.usableHosts.toLocaleString()} />
          </dl>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}
