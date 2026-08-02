import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { Input } from '../../../components/ui/Input'
import { Pill } from '../../../components/ui/Pill'
import { DeviceIcon } from '../../diagram/DeviceIcons'
import { calculateVlan } from '../../../lib/calculations/vlan'

function buildVlanCliSnippet(vlanId: number): string {
  return [
    `vlan ${vlanId}`,
    ` name VLAN${vlanId}`,
    '!',
    'interface GigabitEthernet0/1',
    ' switchport mode access',
    ` switchport access vlan ${vlanId}`,
  ].join('\n')
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
  const [vlanId, setVlanId] = useState('100')
  const [showCli, setShowCli] = useState(false)

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
              <Pill active={showCli} onClick={() => setShowCli((v) => !v)}>
                {showCli ? 'Hide' : 'Show'} Cisco IOS config (expert)
              </Pill>
              {showCli && (
                <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-bg p-3 font-mono text-xs">
                  {buildVlanCliSnippet(calc.result.vlanId)}
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
