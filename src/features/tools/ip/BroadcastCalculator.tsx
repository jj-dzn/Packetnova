import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { BroadcastBitFlip } from './BroadcastBitFlip'
import { Aside } from '../Aside'
import { GuidedMode, type GuidedStep } from '../GuidedMode'
import { Input } from '../../../components/ui/Input'
import { calculateBroadcast, type BroadcastResult } from '../../../lib/calculations/broadcast'
import { parseIPv4 } from '../../../lib/validation/ip'
import { useUrlState } from '../../../hooks/useUrlState'

// Same show-your-work pattern already proven on the CIDR/subnet/wildcard-
// mask calculators: mask, then its inverse, then the OR that actually
// produces the broadcast address -- three real arithmetic steps, not just
// the final number.
function buildBroadcastSteps(result: BroadcastResult): GuidedStep[] {
  return [
    {
      title: '1. Find the subnet mask',
      description: `A /${result.prefixLength} prefix means the first ${result.prefixLength} bits are network bits -- as a dotted mask, that's ${result.subnetMask}.`,
      content: <ResultRow label="Subnet mask" value={result.subnetMask} />,
    },
    {
      title: '2. Invert it -- the wildcard mask',
      description:
        'Flipping every bit of the subnet mask marks exactly the host bits instead of the network bits: 1 where a bit is free to vary, 0 where it must match the network.',
      content: <ResultRow label="Wildcard mask" value={result.wildcardMask} />,
    },
    {
      title: '3. OR the network address with the wildcard mask',
      description:
        'Every bit the wildcard mask marked gets forced to 1 -- the highest possible address in this network, reachable by every host on it at once.',
      content: <ResultRow label="Broadcast address" value={result.broadcastAddress} />,
    },
  ]
}

export function BroadcastCalculator() {
  const [input, setInput] = useUrlState('cidr', '192.168.1.10/24')
  const calc = calculateBroadcast(input)

  return (
    <ToolPageLayout
      category="IP"
      title="Broadcast calculator"
      description="Find the broadcast address for any IP and subnet mask, and see the broadcast domain in binary."
      related={[
        { to: '/tools/cidr-calculator', label: 'CIDR calculator' },
        { to: '/tools/subnet-calculator', label: 'Subnet calculator' },
        { to: '/tools/network-address-calculator', label: 'Network address calculator' },
        { to: '/tools/wildcard-mask-calculator', label: 'Wildcard mask calculator' },
      ]}
      input={
        <div>
          <label htmlFor="broadcast-input" className="text-sm font-medium">
            IP address / CIDR
          </label>
          <Input
            id="broadcast-input"
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
          <GuidedMode steps={buildBroadcastSteps(calc.result)}>
            <div className="flex flex-col gap-4">
              <dl>
                <ResultRow label="Broadcast address" value={calc.result.broadcastAddress} />
                <ResultRow label="Network address" value={calc.result.networkAddress} />
                <ResultRow label="Subnet mask" value={calc.result.subnetMask} />
                <ResultRow label="Wildcard mask" value={calc.result.wildcardMask} />
              </dl>
              <BroadcastBitFlip
                key={`${calc.result.ip}/${calc.result.prefixLength}`}
                label="Broadcast address in binary -- host bits are all 1s"
                inputValue={parseIPv4(calc.result.ip)?.value ?? calc.result.broadcastAddressValue}
                broadcastValue={calc.result.broadcastAddressValue}
                prefixLength={calc.result.prefixLength}
              />
              <p className="text-xs text-fg-subtle">
                A packet sent to this address is delivered to every host in the network.
              </p>
              <Aside>
                {calc.result.broadcastAddress} is a <strong>directed</strong> broadcast -- scoped to
                this one network, and routers can choose whether to forward it. There's also a{' '}
                <strong>limited</strong> broadcast address, 255.255.255.255, which every host treats
                as "this local link only" -- routers never forward it onward, regardless of what
                network they're on.
              </Aside>
            </div>
          </GuidedMode>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}
