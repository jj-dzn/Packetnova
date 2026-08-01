import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { Input } from '../../../components/ui/Input'
import { Pill } from '../../../components/ui/Pill'
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

// A simple, schematic version for now -- proper router/switch icon
// primitives are a shared-diagram-system concern (a later roadmap
// milestone), not something to invent one-off here. This still makes the
// tagged-vs-untagged distinction concrete: the frame only carries a VLAN
// tag while it's on the trunk between switches, not on the access links to
// each end host.
function TrunkDiagram({ vlanId, hex }: { vlanId: number; hex: string }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto rounded-md border border-border bg-bg p-3 font-mono text-[11px]">
      <div className="shrink-0 rounded-md border border-border bg-surface px-2 py-3 text-center text-fg-muted">
        PC
      </div>
      <div className="flex flex-1 flex-col items-center gap-0.5">
        <span className="whitespace-nowrap text-fg-subtle">untagged</span>
        <div className="h-px w-full bg-border" />
      </div>
      <div className="shrink-0 rounded-md border border-accent-alt/40 bg-accent-alt/10 px-2 py-3 text-center text-accent-alt">
        Switch A
      </div>
      <div className="flex flex-[2] flex-col items-center gap-0.5">
        <span className="whitespace-nowrap text-accent">
          802.1Q trunk -- VLAN {vlanId} ({hex}) tagged
        </span>
        <div className="h-0.5 w-full bg-accent" />
      </div>
      <div className="shrink-0 rounded-md border border-accent-alt/40 bg-accent-alt/10 px-2 py-3 text-center text-accent-alt">
        Switch B
      </div>
      <div className="flex flex-1 flex-col items-center gap-0.5">
        <span className="whitespace-nowrap text-fg-subtle">untagged</span>
        <div className="h-px w-full bg-border" />
      </div>
      <div className="shrink-0 rounded-md border border-border bg-surface px-2 py-3 text-center text-fg-muted">
        PC
      </div>
    </div>
  )
}

export function VlanCalculator() {
  const [vlanId, setVlanId] = useState('100')
  const [showCli, setShowCli] = useState(false)

  const calc = calculateVlan(Number(vlanId))

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
            <TrunkDiagram vlanId={calc.result.vlanId} hex={calc.result.hex} />
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
