import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { Input } from '../../../components/ui/Input'
import { analyzeIPv6 } from '../../../lib/calculations/ipv6'
import { calculateIpv6Subnets } from '../../../lib/calculations/ipv6Subnet'
import { calculateEui64 } from '../../../lib/calculations/eui64'

export function Ipv6Calculator() {
  const [input, setInput] = useState('2001:0db8:0000:0000:0000:ff00:0042:8329/64')
  const [newPrefixInput, setNewPrefixInput] = useState('80')
  const [macInput, setMacInput] = useState('00:1A:2B:3C:4D:5E')
  const calc = analyzeIPv6(input)
  const hasBasePrefix = calc.ok && calc.result.prefixLength !== null
  const subnetCalc = hasBasePrefix ? calculateIpv6Subnets(input, Number(newPrefixInput)) : null
  const isExactly64 = calc.ok && calc.result.prefixLength === 64
  const eui64Calc = isExactly64 ? calculateEui64(macInput, input) : null

  return (
    <ToolPageLayout
      category="IP"
      title="IPv6 calculator"
      description="Expand, compress, and inspect IPv6 addresses and prefixes -- and split a block into subnets."
      input={
        <div>
          <label htmlFor="ipv6-input" className="text-sm font-medium">
            IPv6 address
          </label>
          <Input
            id="ipv6-input"
            className="mt-2 font-mono"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="2001:db8::1 or 2001:db8::/32"
            spellCheck={false}
          />
        </div>
      }
      result={
        calc.ok ? (
          <div className="flex flex-col gap-6">
            <dl>
              <ResultRow label="Expanded" value={calc.result.expanded} />
              <ResultRow label="Compressed" value={calc.result.compressed} />
              <ResultRow
                label="Prefix length"
                value={
                  calc.result.prefixLength === null
                    ? 'Not specified'
                    : `/${calc.result.prefixLength}`
                }
              />
              <ResultRow label="Address type" value={calc.result.addressType} />
            </dl>

            {hasBasePrefix && (
              <div className="flex flex-col gap-3 border-t border-border pt-4">
                <div>
                  <label htmlFor="ipv6-new-prefix" className="text-sm font-medium">
                    Split into subnets -- new prefix length
                  </label>
                  <Input
                    id="ipv6-new-prefix"
                    className="mt-2"
                    type="number"
                    min={0}
                    max={128}
                    value={newPrefixInput}
                    onChange={(event) => setNewPrefixInput(event.target.value)}
                  />
                </div>

                {subnetCalc?.ok ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-fg-muted">
                      {subnetCalc.result.subnetCount} subnets of /
                      {subnetCalc.result.newPrefixLength}
                    </p>
                    <div className="flex flex-col gap-1 rounded-md border border-border p-3 font-mono text-xs">
                      {subnetCalc.result.firstSubnets.map((subnet) => (
                        <p key={subnet}>{subnet}</p>
                      ))}
                      {subnetCalc.result.truncated && <p className="text-fg-subtle">...</p>}
                      {subnetCalc.result.lastSubnets.map((subnet) => (
                        <p key={subnet}>{subnet}</p>
                      ))}
                    </div>
                  </div>
                ) : subnetCalc ? (
                  <p className="text-sm text-danger">{subnetCalc.error}</p>
                ) : null}
              </div>
            )}

            {isExactly64 && (
              <div className="flex flex-col gap-3 border-t border-border pt-4">
                <div>
                  <label htmlFor="ipv6-eui64-mac" className="text-sm font-medium">
                    EUI-64 / SLAAC -- MAC address
                  </label>
                  <Input
                    id="ipv6-eui64-mac"
                    className="mt-2 font-mono"
                    value={macInput}
                    onChange={(event) => setMacInput(event.target.value)}
                    placeholder="00:1A:2B:3C:4D:5E"
                    spellCheck={false}
                  />
                </div>
                {eui64Calc?.ok ? (
                  <dl>
                    <ResultRow label="Interface ID" value={eui64Calc.result.interfaceId} />
                    <ResultRow label="SLAAC address" value={eui64Calc.result.fullAddress} />
                  </dl>
                ) : eui64Calc ? (
                  <p className="text-sm text-danger">{eui64Calc.error}</p>
                ) : null}
              </div>
            )}
            {hasBasePrefix && calc.result.prefixLength !== 64 && (
              <p className="text-xs text-fg-subtle">
                EUI-64/SLAAC address generation needs an exact /64 prefix on the address above.
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}
