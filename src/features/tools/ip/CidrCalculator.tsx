import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { BinaryBreakdown } from './BinaryBreakdown'
import { AddressSpaceBar } from './AddressSpaceBar'
import { BitToggleSandbox } from '../BitToggleSandbox'
import { Input } from '../../../components/ui/Input'
import { calculateCidr } from '../../../lib/calculations/cidr'
import { ipv4ToString, parseIPv4 } from '../../../lib/validation/ip'

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
          <div className="flex flex-col gap-4">
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
              <ResultRow label="Address type" value={calc.result.classification.label} />
            </dl>
            <AddressSpaceBar
              networkAddress={calc.result.networkAddress}
              broadcastAddress={calc.result.broadcastAddress}
              firstUsable={calc.result.firstUsable}
              lastUsable={calc.result.lastUsable}
              usableHosts={calc.result.usableHosts}
              currentValue={calc.result.ipValue}
              networkValue={parseIPv4(calc.result.networkAddress)?.value}
              broadcastValue={parseIPv4(calc.result.broadcastAddress)?.value}
            />
            <BinaryBreakdown
              label="Address in binary"
              value={calc.result.ipValue}
              prefixLength={calc.result.prefixLength}
            />
            <p className="text-xs text-fg-subtle">{calc.result.classification.explanation}</p>
            <div className="border-t border-border pt-4">
              <p className="mb-2 text-sm font-medium text-fg-muted">Bit-toggle sandbox</p>
              <BitToggleSandbox
                value={calc.result.ipValue}
                prefixLength={calc.result.prefixLength}
                onToggle={(bitIndex) => {
                  const newValue = (calc.result.ipValue ^ (1 << (31 - bitIndex))) >>> 0
                  setInput(`${ipv4ToString(newValue)}/${calc.result.prefixLength}`)
                }}
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}
