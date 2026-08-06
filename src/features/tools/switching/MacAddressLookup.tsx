import { useState } from 'react'
import { Link } from 'react-router'
import { ToolPageLayout } from '../ToolPageLayout'
import { ToolEducation } from '../ToolEducation'
import { ResultRow } from '../ResultRow'
import { MacBinaryBreakdown } from './MacBinaryBreakdown'
import { Input } from '../../../components/ui/Input'
import { Pill } from '../../../components/ui/Pill'
import { lookupMac } from '../../../lib/calculations/macLookup'
import { useUrlState } from '../../../hooks/useUrlState'

// Cisco IOS renders MAC addresses as three dot-separated 16-bit groups
// (aabb.ccdd.eeff), not the colon-separated bytes this tool otherwise
// displays -- `show mac address-table` output needs the format an engineer
// would actually see on a switch, not this tool's own internal convention.
function toCiscoMacFormat(bytes: number[]): string {
  const hex = bytes.map((b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 4)}.${hex.slice(4, 8)}.${hex.slice(8, 12)}`
}

function buildMacCliSnippet(bytes: number[]): string {
  const cisco = toCiscoMacFormat(bytes)
  return [
    `Switch# show mac address-table address ${cisco}`,
    '          Mac Address Table',
    '-------------------------------------------',
    '',
    'Vlan    Mac Address       Type        Ports',
    '----    -----------       --------    -----',
    `   1    ${cisco}    DYNAMIC     Gi1/0/1`,
  ].join('\n')
}

export function MacAddressLookup() {
  const [input, setInput] = useUrlState('mac', '00:00:0c:12:34:56')
  const [showBinary, setShowBinary] = useState(false)
  const [showCli, setShowCli] = useState(false)

  const calc = lookupMac(input)

  return (
    <ToolPageLayout
      category="Switching"
      title="MAC address lookup"
      description="Break a MAC address down into its OUI and NIC-specific portion, and check it against a curated set of well-known vendor OUIs."
      status={calc.ok ? 'ok' : 'error'}
      related={[{ to: '/tools/mac-formatter', label: 'MAC formatter' }]}
      input={
        <div>
          <label htmlFor="mac-lookup-input" className="text-sm font-medium">
            MAC address
          </label>
          <Input
            id="mac-lookup-input"
            className="mt-2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />
        </div>
      }
      result={
        calc.ok ? (
          <div className="flex flex-col gap-3">
            <dl>
              <ResultRow label="OUI" value={calc.result.oui} />
              <ResultRow label="NIC-specific" value={calc.result.nicSpecific} />
              <ResultRow label="Vendor" value={calc.result.vendor ?? 'Not in our reference set'} />
              <ResultRow label="Multicast?" value={calc.result.isMulticast ? 'Yes' : 'No'} />
              <ResultRow
                label="Locally administered?"
                value={calc.result.isLocallyAdministered ? 'Yes' : 'No (burned-in)'}
              />
            </dl>
            <p className="text-xs text-fg-subtle">
              Vendor lookup covers a curated, individually-verified set of ~230 well-known OUIs --
              major networking, computing, mobile, and IoT vendors -- not the full ~50,000-entry
              IEEE registry.
            </p>
            <div>
              <Pill active={showBinary} onClick={() => setShowBinary((v) => !v)}>
                {showBinary ? 'Hide' : 'Show'} binary (expert)
              </Pill>
              {showBinary && (
                <div className="mt-3">
                  <MacBinaryBreakdown bytes={calc.result.bytes} />
                </div>
              )}
            </div>
            <div>
              <Pill active={showCli} onClick={() => setShowCli((v) => !v)}>
                {showCli ? 'Hide' : 'Show'} mac address-table output (expert)
              </Pill>
              {showCli && (
                <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-bg p-3 font-mono text-xs">
                  {buildMacCliSnippet(calc.result.bytes)}
                </pre>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    >
      <ToolEducation
        howItWorks={
          <p>
            The first 3 bytes (the OUI) identify the manufacturer; the last 3 (the NIC-specific
            portion) are that manufacturer's own serial numbering. Two of the OUI's bits carry
            independent meaning: the lowest bit of the first byte is the I/G bit -- 0 for an
            ordinary unicast address, 1 for multicast -- and the next bit up is the U/L bit -- 0 for
            a universally-administered address burned in by the manufacturer, 1 for a
            locally-administered one set by software instead (common on VMs, containers, and
            randomized-MAC Wi-Fi clients).
          </p>
        }
        whenToUseThis={
          <p>
            Identifying what kind of device is behind a MAC address seen in a switch's address table
            or a packet capture, or checking whether an address is a real burned-in NIC address
            versus one assigned by a hypervisor or generated for privacy.
          </p>
        }
        commonMistakes={
          <p>
            Assuming every MAC address has a real, factory-assigned vendor -- a locally-administered
            address (U/L bit set to 1) was never burned in by any manufacturer at all, so an OUI
            lookup on one is meaningless by design, not a gap in this tool's vendor database. Modern
            OS Wi-Fi privacy features generate exactly this kind of address on purpose, specifically
            so it can't be tracked back to a real hardware vendor.
          </p>
        }
        relatedReading={
          <p>
            Need the same address in a different notation instead of broken down? The{' '}
            <Link to="/tools/mac-formatter" className="text-accent hover:underline">
              MAC formatter
            </Link>{' '}
            converts between colon, hyphen, and dot notation.
          </p>
        }
      />
    </ToolPageLayout>
  )
}
