import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ToolEducation } from '../ToolEducation'
import { ResultRow } from '../ResultRow'
import { Ipv6AnatomyDiagram } from './Ipv6AnatomyDiagram'
import { Input } from '../../../components/ui/Input'
import { analyzeIPv6 } from '../../../lib/calculations/ipv6'
import { calculateIpv6Subnets } from '../../../lib/calculations/ipv6Subnet'
import { calculateEui64 } from '../../../lib/calculations/eui64'
import { useUrlState } from '../../../hooks/useUrlState'

// Boundaries rounded to the nearest nibble (4 bits) -- see
// Ipv6AnatomyDiagram's own comment for why that's exact for the prefix
// lengths that actually occur in practice. When the prefix is already /64
// or longer there's no room left for a separate subnet ID segment, so this
// degrades to a simple two-way network-prefix/interface-ID split instead
// of forcing a three-way split that wouldn't mean anything.
function buildAnatomySegments(expanded: string, prefixLength: number) {
  const hex = expanded.replace(/:/g, '')
  const nibblesOf = (bits: number) => Math.round(bits / 4)

  if (prefixLength >= 64) {
    const prefixNibbles = nibblesOf(prefixLength)
    return [
      { label: 'Network prefix', hexChars: hex.slice(0, prefixNibbles), bits: prefixLength },
      { label: 'Interface ID', hexChars: hex.slice(prefixNibbles), bits: 128 - prefixLength },
    ]
  }

  const globalNibbles = nibblesOf(prefixLength)
  const subnetEndNibbles = 16 // 64 bits
  return [
    {
      label: 'Global routing prefix',
      hexChars: hex.slice(0, globalNibbles),
      bits: prefixLength,
    },
    {
      label: 'Subnet ID',
      hexChars: hex.slice(globalNibbles, subnetEndNibbles),
      bits: 64 - prefixLength,
    },
    { label: 'Interface ID', hexChars: hex.slice(subnetEndNibbles), bits: 64 },
  ]
}

// IPv4 tools already have bit-level breakdowns (BinaryBreakdown); IPv6
// never did, since laying out all 128 bits flat the same way would be
// unreadable. Per-hextet disclosure instead: click a group to see just its
// 16 bits, closing the same "this should be a picture, not just a string"
// gap T3 already closed for IPv4.
function HextetBreakdown({ expanded }: { expanded: string }) {
  const hextets = expanded.split(':')
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div>
      <p className="text-xs font-medium text-fg-muted">Expanded, hextet by hextet</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {hextets.map((hextet, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setOpenIndex((current) => (current === index ? null : index))}
            aria-expanded={openIndex === index}
            className={`rounded-md border px-2 py-1 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              openIndex === index
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-border bg-bg text-fg hover:border-accent/40'
            }`}
          >
            {hextet}
          </button>
        ))}
      </div>
      {openIndex !== null && (
        <div className="mt-2 flex flex-wrap items-center gap-4 rounded-md border border-border bg-bg p-3">
          <span className="text-xs text-fg-subtle">
            Group {openIndex + 1} of 8 -- {hextets[openIndex]}
          </span>
          <div className="flex gap-3 font-mono text-sm">
            {hextets[openIndex]!.split('').map((hexDigit, nibbleIndex) => (
              <span key={nibbleIndex} className="flex flex-col items-center gap-1">
                <span className="text-accent">
                  {parseInt(hexDigit, 16).toString(2).padStart(4, '0')}
                </span>
                <span className="text-[10px] text-fg-subtle">{hexDigit}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function Ipv6Calculator() {
  const [input, setInput] = useUrlState('addr', '2001:0db8:0000:0000:0000:ff00:0042:8329/64')
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

            <HextetBreakdown expanded={calc.result.expanded} />

            {hasBasePrefix && calc.result.prefixLength! > 0 && (
              <Ipv6AnatomyDiagram
                segments={buildAnatomySegments(calc.result.expanded, calc.result.prefixLength!)}
              />
            )}

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
    >
      <ToolEducation
        howItWorks={
          <p>
            IPv6 addresses are 128 bits, written as eight 16-bit hextets in hex. "Compressed" form
            drops leading zeros in each group and collapses one run of all-zero groups into "::";
            "expanded" form writes every hextet out in full -- both represent the exact same
            address, and this tool converts between them automatically. EUI-64/SLAAC generation
            (only meaningful on an exact /64) derives a 64-bit interface ID from a MAC address by
            splitting it, inserting "fffe" in the middle, and flipping the universal/local bit.
          </p>
        }
        whenToUseThis={
          <p>
            Use the expand/compress conversion whenever you need to read or type out an address in
            the form a particular context expects. Use subnetting to plan how a larger allocated
            block splits into smaller assigned prefixes. Use EUI-64 when you need to predict or
            verify a device's SLAAC-derived address from its MAC, though note that many modern OSes
            use IPv6 privacy extensions instead of EUI-64 by default, so a device's actual address
            may not match this calculation.
          </p>
        }
        commonMistakes={
          <p>
            "::" can only appear once in a compressed address -- it represents exactly one run of
            zero groups, and using it twice would make the expansion ambiguous (there'd be no way to
            know how many zero groups each "::" stood for). Also easy to miss: a link-local address
            (fe80::/10) is only valid on its own local segment and isn't globally routable, unlike
            most of the other address types this tool classifies.
          </p>
        }
        troubleshootingTips={
          <p>
            If EUI-64 generation is unavailable, check that the prefix is exactly /64 -- the
            interface-ID split only makes sense at that boundary. If a generated SLAAC address
            doesn't match what a real device shows, that device is very likely using privacy
            extensions (a randomized interface ID) rather than EUI-64.
          </p>
        }
      />
    </ToolPageLayout>
  )
}
