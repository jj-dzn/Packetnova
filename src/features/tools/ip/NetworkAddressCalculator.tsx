import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { Input } from '../../../components/ui/Input'
import { calculateNetworkAddress } from '../../../lib/calculations/networkAddress'

export function NetworkAddressCalculator() {
  const [input, setInput] = useState('192.168.1.10/24')
  const calc = calculateNetworkAddress(input)

  return (
    <ToolPageLayout
      category="IP"
      title="Network address calculator"
      description="Find the network address for any IP address and subnet mask."
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
          <dl>
            <ResultRow label="Network address" value={calc.result.networkAddress} />
            <ResultRow label="Broadcast address" value={calc.result.broadcastAddress} />
            <ResultRow label="Subnet mask" value={calc.result.subnetMask} />
          </dl>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}
