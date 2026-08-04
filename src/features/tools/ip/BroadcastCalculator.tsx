import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { BroadcastBitFlip } from './BroadcastBitFlip'
import { Aside } from '../Aside'
import { Input } from '../../../components/ui/Input'
import { calculateBroadcast } from '../../../lib/calculations/broadcast'
import { parseIPv4 } from '../../../lib/validation/ip'
import { useUrlState } from '../../../hooks/useUrlState'

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
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}
