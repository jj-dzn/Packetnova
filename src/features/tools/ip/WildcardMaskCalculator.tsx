import { useState } from 'react'
import { Link } from 'react-router'
import { ToolPageLayout } from '../ToolPageLayout'
import { ToolEducation } from '../ToolEducation'
import { ResultRow } from '../ResultRow'
import { Aside } from '../Aside'
import { BinaryBreakdown } from './BinaryBreakdown'
import { GuidedMode, type GuidedStep } from '../GuidedMode'
import { Input } from '../../../components/ui/Input'
import { Pill } from '../../../components/ui/Pill'
import {
  calculateWildcardMask,
  type WildcardMaskResult,
} from '../../../lib/calculations/wildcardMask'
import { ipv4ToString, networkAddress, parseIPv4 } from '../../../lib/validation/ip'
import { useUrlState } from '../../../hooks/useUrlState'

// A fixed illustrative host, masked down to whatever prefix the visitor's
// wildcard mask corresponds to -- gives the CLI lines a concrete, valid
// network address to show instead of a placeholder like "x.x.x.x".
const EXAMPLE_HOST = parseIPv4('192.168.1.1')!

function buildWildcardSteps(result: WildcardMaskResult): GuidedStep[] {
  return [
    {
      title: '1. Start with the subnet mask',
      description: `A /${result.prefixLength} subnet mask -- every bit set to 1 is "part of the network," every bit set to 0 is "part of the host."`,
      content: <BinaryBreakdown label="Subnet mask" value={result.subnetMaskValue} />,
    },
    {
      title: '2. Flip every single bit',
      description:
        "The wildcard mask is the bitwise complement (NOT) of the subnet mask -- every 1 becomes a 0 and every 0 becomes a 1. Nothing else changes; it's the exact same 32 bits, inverted.",
      content: (
        <BinaryBreakdown
          label="Wildcard mask (every bit flipped)"
          value={result.wildcardMaskValue}
        />
      ),
    },
  ]
}

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
      status={calc.ok ? 'ok' : 'error'}
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
          <GuidedMode steps={buildWildcardSteps(calc.result)}>
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
                Wildcard masks flip subnet mask logic: a <strong>0</strong> bit means "must match"
                and a <strong>1</strong> bit means "don't care" -- the opposite of a subnet mask,
                where 1 means "part of the network." Cisco ACLs and OSPF{' '}
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
          </GuidedMode>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    >
      <ToolEducation
        howItWorks={
          <p>
            A wildcard mask is the bitwise complement of a subnet mask -- flip every 1 to a 0 and
            every 0 to a 1 and that's the whole calculation. It exists because Cisco's ACL and OSPF{' '}
            <code className="font-mono">network</code> statement syntax both predate CIDR notation
            and were built around wildcard masks as their match syntax; the underlying
            255.255.255.0-style mask is a modern convenience layered on afterward.
          </p>
        }
        whenToUseThis={
          <p>
            Whenever you're writing a classic (numbered) Cisco ACL or an OSPF{' '}
            <code className="font-mono">network</code> statement by hand and have a subnet mask or
            prefix length in front of you instead of the wildcard mask those commands actually
            expect.
          </p>
        }
        commonMistakes={
          <p>
            Unlike a subnet mask, a wildcard mask doesn't have to be contiguous -- Cisco IOS accepts
            something like <code className="font-mono">0.0.15.240</code>, which matches a scattered,
            non-CIDR-aligned set of addresses no ordinary subnet could represent. This tool only
            converts real subnet masks (contiguous 1s followed by contiguous 0s), which covers the
            vast majority of real ACL/OSPF lines -- a hand-crafted discontiguous wildcard mask isn't
            a subnet mask inverted, so it's a different thing entirely and outside what this
            calculator does.
          </p>
        }
        relatedReading={
          <p>
            Need the network address a wildcard mask actually matches? The{' '}
            <Link to="/tools/cidr-calculator" className="text-accent hover:underline">
              CIDR calculator
            </Link>{' '}
            and{' '}
            <Link to="/tools/subnet-calculator" className="text-accent hover:underline">
              subnet calculator
            </Link>{' '}
            both work in ordinary subnet-mask terms and can feed straight into this one.
          </p>
        }
      />
    </ToolPageLayout>
  )
}
