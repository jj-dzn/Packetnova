import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { BinaryBreakdown } from './BinaryBreakdown'
import { AddressSpaceBar } from './AddressSpaceBar'
import { Input } from '../../../components/ui/Input'
import { calculateNetworkAddress } from '../../../lib/calculations/networkAddress'

export function NetworkAddressCalculator() {
  const [input, setInput] = useState('192.168.1.10/24')
  const calc = calculateNetworkAddress(input)

  return (
    <ToolPageLayout
      category="IP"
      title="Network address calculator"
      description="Find the network address for any IP and subnet -- and what kind of address it is."
      input={
        <div>
          <label htmlFor="network-input" className="text-sm font-medium">
            IP address / CIDR
          </label>
          <Input
            id="network-input"
            className="mt-2"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="192.168.1.10/24"
            spellCheck={false}
          />
        </div>
      }
      result={
        calc.ok ? (
          <div className="flex flex-col gap-4">
            <dl>
              <ResultRow label="Network address" value={calc.result.networkAddress} />
              <ResultRow label="Subnet mask" value={calc.result.subnetMask} />
              <ResultRow label="Address type" value={calc.result.classification.label} />
            </dl>
            <AddressSpaceBar
              networkAddress={calc.result.networkAddress}
              broadcastAddress={calc.result.broadcastAddress}
              firstUsable={calc.result.firstUsable}
              lastUsable={calc.result.lastUsable}
              usableHosts={calc.result.usableHosts}
            />
            <BinaryBreakdown
              label="Network address in binary"
              value={calc.result.networkAddressValue}
              prefixLength={calc.result.prefixLength}
            />
            <p className="text-xs text-fg-subtle">{calc.result.classification.explanation}</p>
          </div>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}
