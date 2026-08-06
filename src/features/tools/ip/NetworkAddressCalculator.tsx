import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { BinaryBreakdown } from './BinaryBreakdown'
import { AddressSpaceBar } from './AddressSpaceBar'
import { GuidedMode, type GuidedStep } from '../GuidedMode'
import { Input } from '../../../components/ui/Input'
import {
  calculateNetworkAddress,
  type NetworkAddressResult,
} from '../../../lib/calculations/networkAddress'
import { parseIPv4 } from '../../../lib/validation/ip'
import { useUrlState } from '../../../hooks/useUrlState'

// Same AND-the-mask arithmetic BinaryBreakdown already visualizes, walked
// through one operation at a time -- the same show-your-work pattern
// already proven on the CIDR/subnet/wildcard-mask calculators, extended
// to the one IP tool in this set that didn't have it yet.
function buildNetworkAddressSteps(result: NetworkAddressResult): GuidedStep[] {
  const addressValue = parseIPv4(result.ip)?.value ?? result.networkAddressValue

  return [
    {
      title: '1. Split the address at the prefix boundary',
      description: `The first ${result.prefixLength} bits are the network portion -- identical for every host here. The remaining ${32 - result.prefixLength} bits are the host portion, the part that varies.`,
      content: (
        <BinaryBreakdown label="Address" value={addressValue} prefixLength={result.prefixLength} />
      ),
    },
    {
      title: '2. Zero every host bit',
      description:
        'ANDing the address with the subnet mask keeps every network bit exactly as it was and forces every host bit to 0 -- this is the network address itself, not any specific host on it.',
      content: (
        <BinaryBreakdown
          label="Network address"
          value={result.networkAddressValue}
          prefixLength={result.prefixLength}
        />
      ),
    },
    {
      title: '3. Classify it',
      description: result.classification.explanation,
      content: <ResultRow label="Address type" value={result.classification.label} />,
    },
  ]
}

export function NetworkAddressCalculator() {
  const [input, setInput] = useUrlState('cidr', '192.168.1.10/24')
  const calc = calculateNetworkAddress(input)

  return (
    <ToolPageLayout
      category="IP"
      title="Network address calculator"
      description="Find the network address for any IP and subnet -- and what kind of address it is."
      related={[
        { to: '/tools/cidr-calculator', label: 'CIDR calculator' },
        { to: '/tools/subnet-calculator', label: 'Subnet calculator' },
        { to: '/tools/broadcast-calculator', label: 'Broadcast calculator' },
        { to: '/tools/wildcard-mask-calculator', label: 'Wildcard mask calculator' },
      ]}
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
          <GuidedMode steps={buildNetworkAddressSteps(calc.result)}>
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
                currentValue={parseIPv4(calc.result.ip)?.value}
                networkValue={calc.result.networkAddressValue}
                broadcastValue={parseIPv4(calc.result.broadcastAddress)?.value}
              />
              <BinaryBreakdown
                label="Network address in binary"
                value={calc.result.networkAddressValue}
                prefixLength={calc.result.prefixLength}
              />
              <p className="text-xs text-fg-subtle">{calc.result.classification.explanation}</p>
            </div>
          </GuidedMode>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}
