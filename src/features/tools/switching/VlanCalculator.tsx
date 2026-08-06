import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ToolEducation } from '../ToolEducation'
import { ResultRow } from '../ResultRow'
import { Input } from '../../../components/ui/Input'
import { Pill } from '../../../components/ui/Pill'
import { DeviceIcon } from '../../diagram/DeviceIcons'
import { calculateVlan } from '../../../lib/calculations/vlan'
import { useUrlState } from '../../../hooks/useUrlState'

type CliVendor = 'cisco' | 'juniper' | 'fortinet'

function buildCiscoVlanCli(vlanId: number): string {
  return [
    `vlan ${vlanId}`,
    ` name VLAN${vlanId}`,
    '!',
    'interface GigabitEthernet0/1',
    ' switchport mode access',
    ` switchport access vlan ${vlanId}`,
  ].join('\n')
}

function buildJuniperVlanCli(vlanId: number): string {
  return [
    `set vlans VLAN${vlanId} vlan-id ${vlanId}`,
    `set interfaces ge-0/0/1 unit 0 family ethernet-switching vlan members VLAN${vlanId}`,
  ].join('\n')
}

function buildFortinetVlanCli(vlanId: number): string {
  return [
    'config switch vlan',
    `    edit "VLAN${vlanId}"`,
    `        set vlanid ${vlanId}`,
    '    next',
    'end',
    'config switch interface',
    '    edit "port1"',
    `        set vlan "VLAN${vlanId}"`,
    '    next',
    'end',
  ].join('\n')
}

const VLAN_CLI_BUILDERS: Record<CliVendor, (vlanId: number) => string> = {
  cisco: buildCiscoVlanCli,
  juniper: buildJuniperVlanCli,
  fortinet: buildFortinetVlanCli,
}

const VLAN_CLI_LABELS: Record<CliVendor, string> = {
  cisco: 'Cisco IOS',
  juniper: 'Juniper Junos',
  fortinet: 'Fortinet FortiOS',
}

function SwitchGlyph() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7 shrink-0">
      <DeviceIcon
        kind="switch"
        x={16}
        y={16}
        size={22}
        fill="var(--color-bg)"
        stroke="var(--color-accent-alt)"
      />
    </svg>
  )
}

// Switch glyphs reuse the shared DeviceIcon primitive (E6's diagram
// system) instead of a plain text box, and the trunk now carries two
// VLANs' tagged frames simultaneously -- not just one -- since a real
// trunk's whole point is multiplexing more than one VLAN over a single
// physical link. The access links stay untagged on purpose: a frame only
// ever carries a VLAN tag while it's on the trunk between switches, never
// on the link to an end host.
function TrunkDiagram({
  vlanId,
  hex,
  secondVlanId,
  secondHex,
}: {
  vlanId: number
  hex: string
  secondVlanId: number
  secondHex: string
}) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto rounded-md border border-border bg-bg p-3 font-mono text-[11px]">
      <div className="flex shrink-0 flex-col items-center gap-1 rounded-md border border-border bg-surface px-2 py-2 text-center text-fg-muted">
        <span>PC</span>
      </div>
      <div className="flex flex-1 flex-col items-center gap-0.5">
        <span className="whitespace-nowrap text-fg-subtle">untagged</span>
        <div className="h-px w-full bg-border" />
      </div>
      <div className="flex shrink-0 flex-col items-center gap-1 rounded-md border border-accent-alt/40 bg-accent-alt/10 px-2 py-2 text-center text-accent-alt">
        <SwitchGlyph />
        <span>Switch A</span>
      </div>
      <div className="flex flex-[2] flex-col items-center gap-0.5">
        <span className="whitespace-nowrap text-accent">
          VLAN {vlanId} ({hex}) tagged
        </span>
        <div className="h-0.5 w-full bg-accent" />
        <span className="whitespace-nowrap text-accent-alt">
          + VLAN {secondVlanId} ({secondHex}) tagged
        </span>
        <div className="h-0.5 w-full bg-accent-alt" />
        <span className="whitespace-nowrap text-fg-subtle">
          802.1Q trunk -- both share one wire
        </span>
      </div>
      <div className="flex shrink-0 flex-col items-center gap-1 rounded-md border border-accent-alt/40 bg-accent-alt/10 px-2 py-2 text-center text-accent-alt">
        <SwitchGlyph />
        <span>Switch B</span>
      </div>
      <div className="flex flex-1 flex-col items-center gap-0.5">
        <span className="whitespace-nowrap text-fg-subtle">untagged</span>
        <div className="h-px w-full bg-border" />
      </div>
      <div className="flex shrink-0 flex-col items-center gap-1 rounded-md border border-border bg-surface px-2 py-2 text-center text-fg-muted">
        <span>PC</span>
      </div>
    </div>
  )
}

export function VlanCalculator() {
  const [vlanId, setVlanId] = useUrlState('vlan', '100')
  const [showCli, setShowCli] = useState(false)
  const [cliVendor, setCliVendor] = useState<CliVendor>('cisco')

  const calc = calculateVlan(Number(vlanId))
  // A second, illustrative VLAN sharing the same trunk -- distinct from
  // whatever the visitor entered, so the diagram always shows two genuinely
  // different tagged frames multiplexed onto one wire, not the same VLAN
  // twice. VLAN 1 is the default/native VLAN on most switches; falls back
  // to 20 for the one input where that would be a no-op.
  const secondCalc = calculateVlan(calc.ok && calc.result.vlanId === 1 ? 20 : 1)

  return (
    <ToolPageLayout
      category="Switching"
      title="VLAN calculator"
      description="Check a VLAN ID's validity, range classification, and hex representation."
      status={calc.ok ? 'ok' : 'error'}
      related={[
        { to: '/tools/802-1q-tag-explorer', label: '802.1Q tag explorer' },
        { to: '/scenarios/vlan-misconfiguration', label: 'Scenario: VLAN misconfiguration' },
        { to: '/tools/device-config-generator', label: 'Device config generator' },
      ]}
      input={
        <div>
          <label htmlFor="vlan-id" className="text-sm font-medium">
            VLAN ID
          </label>
          <Input
            id="vlan-id"
            className="mt-2"
            value={vlanId}
            onChange={(e) => setVlanId(e.target.value)}
          />
        </div>
      }
      result={
        calc.ok ? (
          <div className="flex flex-col gap-3">
            <dl>
              <ResultRow label="Hex" value={calc.result.hex} />
              <ResultRow label="Category" value={calc.result.category} />
            </dl>
            {calc.result.note && <p className="text-xs text-fg-subtle">{calc.result.note}</p>}
            {secondCalc.ok && (
              <TrunkDiagram
                vlanId={calc.result.vlanId}
                hex={calc.result.hex}
                secondVlanId={secondCalc.result.vlanId}
                secondHex={secondCalc.result.hex}
              />
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Pill active={showCli} onClick={() => setShowCli((v) => !v)}>
                  {showCli ? 'Hide' : 'Show'} vendor config (expert)
                </Pill>
                {showCli && (
                  <div className="flex gap-2">
                    {(Object.keys(VLAN_CLI_LABELS) as CliVendor[]).map((vendor) => (
                      <Pill
                        key={vendor}
                        active={cliVendor === vendor}
                        onClick={() => setCliVendor(vendor)}
                      >
                        {VLAN_CLI_LABELS[vendor]}
                      </Pill>
                    ))}
                  </div>
                )}
              </div>
              {showCli && (
                <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-bg p-3 font-mono text-xs">
                  {VLAN_CLI_BUILDERS[cliVendor](calc.result.vlanId)}
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
        howItWorks={{
          concise:
            "A VLAN ID (1-4094) splits one physical network into separate logical ones -- devices in different VLANs can't talk to each other unless something routes between them.",
          detailed: (
            <p>
              A VLAN (Virtual LAN) lets a switch treat ports as if they belonged to entirely
              separate physical networks, even though they share the same switch and cabling. Each
              VLAN gets a numeric ID and its own broadcast domain -- a device in VLAN 10 never sees
              broadcast traffic from VLAN 20, and the two can't communicate at all unless a router
              (or a Layer 3 switch) is explicitly configured to pass traffic between them.
            </p>
          ),
          rfcPrecise: (
            <p>
              IEEE 802.1Q defines the tagging mechanism behind the VLAN ID here: a 12-bit VID within
              the 802.1Q tag, valid range 1-4094 (0 and 4095 are reserved). The standard's Filtering
              Database and Bridge Protocol Data Unit handling give each VID its own independent
              forwarding and broadcast domain within a single bridged LAN.
            </p>
          ),
        }}
        whenToUseThis={
          <p>
            Segmenting a network by function or security zone (voice vs. data, guest vs. corporate)
            without running separate physical cabling for each.
          </p>
        }
        commonMistakes={
          <p>
            Assuming two devices can reach each other just because they're on the same physical
            switch -- if they're in different VLANs, nothing crosses without an explicit Layer 3
            hop.
          </p>
        }
      />
    </ToolPageLayout>
  )
}
