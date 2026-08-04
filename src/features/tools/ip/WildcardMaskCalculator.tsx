import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { Aside } from '../Aside'
import { BinaryBreakdown } from './BinaryBreakdown'
import { Input } from '../../../components/ui/Input'
import { Pill } from '../../../components/ui/Pill'
import { calculateWildcardMask } from '../../../lib/calculations/wildcardMask'
import { ipv4ToString, networkAddress, parseIPv4 } from '../../../lib/validation/ip'
import { useUrlState } from '../../../hooks/useUrlState'

// A fixed illustrative host, masked down to whatever prefix the visitor's
// wildcard mask corresponds to -- gives the CLI lines a concrete, valid
// network address to show instead of a placeholder like "x.x.x.x".
const EXAMPLE_HOST = parseIPv4('192.168.1.1')!

function buildWildcardCliSnippet(prefixLength: number, wildcardMask: string): string {
  const network = ipv4ToString(networkAddress(EXAMPLE_HOST, prefixLength).value)
  return [
    `access-list 10 permit ${network} ${wildcardMask}`,
    '!',
    'router ospf 1',
    ` network ${network} ${wildcardMask} area 0`,
  ].join('\n')
}

export function WildcardMaskCalculator() {
  const [input, setInput] = useUrlState('mask', '255.255.255.0')
  const [showCli, setShowCli] = useState(false)
  const calc = calculateWildcardMask(input)

  return (
    <ToolPageLayout
      category="IP"
      title="Wildcard mask calculator"
      description="Convert a subnet mask to its wildcard mask for ACLs and OSPF."
      related={[
        { to: '/tools/cidr-calculator', label: 'CIDR calculator' },
        { to: '/tools/subnet-calculator', label: 'Subnet calculator' },
        { to: '/tools/network-address-calculator', label: 'Network address calculator' },
        { to: '/tools/broadcast-calculator', label: 'Broadcast calculator' },
      ]}
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
            <div className="flex flex-col gap-2 rounded-md border border-border bg-bg p-3">
              <BinaryBreakdown label="Subnet mask" value={calc.result.subnetMaskValue} />
              <div className="h-px bg-border" />
              <BinaryBreakdown
                label="Wildcard mask (every bit flipped)"
                value={calc.result.wildcardMaskValue}
              />
            </div>
            <Aside>
              Wildcard masks flip subnet mask logic: a <strong>0</strong> bit means "must match" and
              a <strong>1</strong> bit means "don't care" -- the opposite of a subnet mask, where 1
              means "part of the network." Cisco ACLs and OSPF{' '}
              <code className="font-mono">network</code> statements both expect wildcard masks, so
              pasting in a subnet mask by mistake will match the wrong hosts without any error.
            </Aside>
            <div>
              <Pill active={showCli} onClick={() => setShowCli((v) => !v)}>
                {showCli ? 'Hide' : 'Show'} ACL / OSPF CLI lines (expert)
              </Pill>
              {showCli && (
                <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-bg p-3 font-mono text-xs">
                  {buildWildcardCliSnippet(calc.result.prefixLength, calc.result.wildcardMask)}
                </pre>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}
