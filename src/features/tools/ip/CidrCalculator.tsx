import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { BinaryBreakdown } from './BinaryBreakdown'
import { AddressSpaceBar } from './AddressSpaceBar'
import { ParentAggregateBar } from './ParentAggregateBar'
import { BitToggleSandbox } from '../BitToggleSandbox'
import { GuidedMode, type GuidedStep } from '../GuidedMode'
import { Input } from '../../../components/ui/Input'
import { calculateCidr, type CidrResult } from '../../../lib/calculations/cidr'
import { ipv4ToString, parseIPv4 } from '../../../lib/validation/ip'
import { useUrlState } from '../../../hooks/useUrlState'

// The same AND/OR bit math BinaryBreakdown already visualizes, walked
// through one operation at a time instead of shown as three already-final
// numbers -- this is the actual arithmetic behind "network address" and
// "broadcast address," not just their results.
function buildCidrSteps(result: CidrResult): GuidedStep[] {
  const networkValue = parseIPv4(result.networkAddress)?.value ?? result.ipValue
  const broadcastValue = parseIPv4(result.broadcastAddress)?.value ?? result.ipValue

  return [
    {
      title: '1. Split the address at the prefix boundary',
      description: `The first ${result.prefixLength} bits are the network portion -- identical for every host on this network. The remaining ${32 - result.prefixLength} bits are the host portion -- what actually varies from one address to the next.`,
      content: (
        <BinaryBreakdown
          label="Address"
          value={result.ipValue}
          prefixLength={result.prefixLength}
        />
      ),
    },
    {
      title: '2. Zero every host bit -- the network address',
      description:
        'ANDing the address with the subnet mask keeps every network bit exactly as it was and forces every host bit to 0. This is the network itself, not any specific host on it.',
      content: (
        <BinaryBreakdown
          label="Network address"
          value={networkValue}
          prefixLength={result.prefixLength}
        />
      ),
    },
    {
      title: '3. Set every host bit to 1 -- the broadcast address',
      description:
        'ORing the network address with the wildcard mask (the bitwise inverse of the subnet mask) keeps the network bits and forces every host bit to 1. A packet sent here reaches every host on the network at once.',
      content: (
        <BinaryBreakdown
          label="Broadcast address"
          value={broadcastValue}
          prefixLength={result.prefixLength}
        />
      ),
    },
    {
      title: '4. Everything in between is usable',
      description: `The network and broadcast addresses themselves aren't assignable to a host -- everything strictly between them is: ${result.usableHosts.toLocaleString()} usable addresses out of ${result.totalAddresses.toLocaleString()} total in this block.`,
      content: (
        <ResultRow
          label="Usable host range"
          value={
            result.firstUsable && result.lastUsable
              ? `${result.firstUsable} - ${result.lastUsable}`
              : 'None'
          }
        />
      ),
    },
  ]
}

export function CidrCalculator() {
  const [input, setInput] = useUrlState('cidr', '192.168.1.0/24')
  const calc = calculateCidr(input)

  return (
    <ToolPageLayout
      category="IP"
      title="CIDR calculator"
      description="Break down any CIDR block into its network address, broadcast address, subnet mask, and usable host range."
      status={calc.ok ? 'ok' : 'error'}
      related={[
        { to: '/tools/subnet-calculator', label: 'Subnet calculator' },
        { to: '/tools/network-address-calculator', label: 'Network address calculator' },
        { to: '/tools/broadcast-calculator', label: 'Broadcast calculator' },
        { to: '/tools/wildcard-mask-calculator', label: 'Wildcard mask calculator' },
        { to: '/labs/ip-zodiac', label: 'Labs: what your IP says about you' },
      ]}
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
          <GuidedMode steps={buildCidrSteps(calc.result)}>
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
              <ParentAggregateBar
                cidr={`${calc.result.networkAddress}/${calc.result.prefixLength}`}
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
          </GuidedMode>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}
