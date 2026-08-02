import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { Aside } from '../Aside'
import { ToolEducation } from '../ToolEducation'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { Pill } from '../../../components/ui/Pill'
import { TopologyCanvas, type TopologyEdge, type TopologyNode } from '../../diagram/TopologyCanvas'
import {
  computeStpPortRoles,
  electRootBridge,
  type BridgeCandidate,
  type StpLink,
} from '../../../lib/calculations/stp'

const DEFAULT_BRIDGES: BridgeCandidate[] = [
  { id: 'Switch A', priority: 32768, macAddress: '00:11:22:33:44:55' },
  { id: 'Switch B', priority: 4096, macAddress: 'aa:bb:cc:dd:ee:ff' },
]

// A small fixed topology (not the editable bridge list above) specifically
// to demonstrate port roles: a 4-switch ring is the smallest topology that
// actually has a loop, so it's the smallest one where "designated" and
// "blocked" mean anything. Costs are asymmetric on purpose, so every
// switch's shortest path back to the root is unique -- no tie-breaking
// needed to follow the example.
const EXAMPLE_BRIDGES: BridgeCandidate[] = [
  { id: 'A', priority: 4096, macAddress: '00:00:00:00:00:0a' },
  { id: 'B', priority: 32768, macAddress: '00:00:00:00:00:0b' },
  { id: 'C', priority: 32768, macAddress: '00:00:00:00:00:0c' },
  { id: 'D', priority: 32768, macAddress: '00:00:00:00:00:0d' },
]
const EXAMPLE_LINKS: StpLink[] = [
  { from: 'A', to: 'B', cost: 10 },
  { from: 'B', to: 'C', cost: 10 },
  { from: 'C', to: 'D', cost: 15 },
  { from: 'D', to: 'A', cost: 8 },
]
const EXAMPLE_POSITIONS: Record<string, { x: number; y: number }> = {
  A: { x: 75, y: 40 },
  B: { x: 245, y: 40 },
  C: { x: 245, y: 180 },
  D: { x: 75, y: 180 },
}

function buildStpCliSnippet(bridges: BridgeCandidate[], rootBridgeId: string): string {
  return bridges
    .map((bridge) => {
      const header = `! ${bridge.id}${bridge.id === rootBridgeId ? ' (elected root)' : ''}`
      return `${header}\nspanning-tree vlan 1 priority ${bridge.priority}`
    })
    .join('\n\n')
}

export function StpOverview() {
  const [bridges, setBridges] = useState<BridgeCandidate[]>(DEFAULT_BRIDGES)
  const [showCli, setShowCli] = useState(false)

  const calc = electRootBridge(bridges)

  function updateBridge(index: number, patch: Partial<BridgeCandidate>) {
    setBridges((current) => current.map((b, i) => (i === index ? { ...b, ...patch } : b)))
  }

  function removeBridge(index: number) {
    setBridges((current) => current.filter((_, i) => i !== index))
  }

  function addBridge() {
    setBridges((current) => [
      ...current,
      {
        id: `Switch ${String.fromCharCode(65 + current.length)}`,
        priority: 32768,
        macAddress: '00:00:00:00:00:00',
      },
    ])
  }

  return (
    <>
      <ToolPageLayout
        category="Switching"
        title="STP overview"
        description="Spanning Tree Protocol elects a root bridge by lowest Bridge ID -- priority first, MAC address as the tiebreaker -- then blocks any port that would form a loop to it."
        input={
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Bridges</span>
            {bridges.map((bridge, index) => (
              <div key={index} className="flex flex-wrap gap-2">
                <Input
                  value={bridge.id}
                  onChange={(e) => updateBridge(index, { id: e.target.value })}
                  placeholder="Name"
                  className="min-w-[7rem] flex-1"
                />
                <Input
                  value={bridge.priority}
                  onChange={(e) => updateBridge(index, { priority: Number(e.target.value) })}
                  placeholder="Priority"
                  className="min-w-[7rem] flex-1"
                />
                <Input
                  value={bridge.macAddress}
                  onChange={(e) => updateBridge(index, { macAddress: e.target.value })}
                  placeholder="MAC address"
                  className="min-w-[9rem] flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => removeBridge(index)}
                  disabled={bridges.length <= 1}
                  aria-label="Remove bridge"
                >
                  &times;
                </Button>
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={addBridge} className="self-start">
              + Add bridge
            </Button>
          </div>
        }
        result={
          calc.ok ? (
            <div className="flex flex-col gap-4">
              <dl>
                <ResultRow label="Root bridge" value={calc.result.rootBridgeId} />
                <ResultRow label="Decided by" value={calc.result.decidedBy} />
              </dl>
              <div>
                <Pill active={showCli} onClick={() => setShowCli((v) => !v)}>
                  {showCli ? 'Hide' : 'Show'} Cisco IOS config (expert)
                </Pill>
                {showCli && (
                  <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-bg p-3 font-mono text-xs">
                    {buildStpCliSnippet(bridges, calc.result.rootBridgeId)}
                  </pre>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-danger">{calc.error}</p>
          )
        }
      />
      <div className="pb-12">
        <h2 className="mb-4 text-lg font-semibold">How STP blocks loops</h2>
        <p className="max-w-2xl text-sm text-fg-muted">
          Once the root bridge is elected, every other switch picks a single root port (the
          lowest-cost path back to the root) and every network segment gets one designated port. Any
          other port that would create a second path to the root is put into a blocking state --
          traffic-forwarding-wise inactive, but still listening for topology changes. That's how STP
          keeps a physically redundant, loop-having topology loop-free logically.
        </p>
        <PortRoleExample />
        <div className="mt-4 max-w-2xl">
          <Aside>
            Classic STP (802.1D) can take 30-50 seconds to converge after a topology change -- each
            port has to sit through listening and learning states before it forwards again. RSTP
            (802.1w) replaced it in practice by having switches actively negotiate port roles with
            their neighbors instead of just waiting out timers, bringing convergence down to a few
            seconds in most topologies. Almost every switch shipped today runs RSTP (or MSTP) even
            when it's still labeled "spanning tree."
          </Aside>
        </div>
        <div className="mt-6 max-w-2xl">
          <ToolEducation
            whenToUseThis={
              <p>
                Use this to work out which switch will become root before you deploy a topology, or
                to understand why a specific switch already holds that role in a network you've
                inherited. Tuning priority deliberately -- rather than leaving every switch at the
                default 32768 -- is how real deployments make sure a fast, well-connected core
                switch ends up as root instead of whichever access switch happens to win the MAC
                address tiebreak.
              </p>
            }
            commonMistakes={
              <p>
                Not setting priority on the switch you actually want as root is the most common
                real-world STP mistake -- left at defaults, the tiebreak falls to the lowest MAC
                address, which has no relationship to which switch is best positioned to be the
                network's core. An access switch in a closet can end up as root purely by MAC
                address luck, forwarding traffic through a far worse physical path than intended.
              </p>
            }
            troubleshootingTips={
              <p>
                If STP elected a root you didn't expect, check that switch's priority first -- it's
                almost always still at the 32768 default when a network administrator meant to lower
                it on the intended core switch instead. In production, PortFast (for access ports
                that will never form a loop) and BPDU Guard (to shut down a port that unexpectedly
                receives BPDUs) are the near-universal companions to the pure election logic this
                page covers.
              </p>
            }
          />
        </div>
      </div>
    </>
  )
}

function PortRoleExample() {
  const calc = computeStpPortRoles(EXAMPLE_BRIDGES, EXAMPLE_LINKS)
  if (!calc.ok) return null
  const { rootBridgeId, ports } = calc.result

  function roleOf(bridgeId: string, neighborId: string) {
    return ports.find((p) => p.bridgeId === bridgeId && p.neighborId === neighborId)?.role
  }

  function linkIsBlocked(link: StpLink) {
    return roleOf(link.from, link.to) === 'blocked' || roleOf(link.to, link.from) === 'blocked'
  }

  return (
    <div className="mt-6 max-w-2xl rounded-lg border border-border bg-surface p-4">
      <p className="mb-3 text-sm font-medium">
        A worked example: the same election and blocking on a small 4-switch ring
      </p>
      <TopologyCanvas
        viewWidth={320}
        viewHeight={244}
        className="mx-auto w-full max-w-sm"
        nodes={EXAMPLE_BRIDGES.map((bridge): TopologyNode => {
          const pos = EXAMPLE_POSITIONS[bridge.id]!
          const isRoot = bridge.id === rootBridgeId
          return {
            id: bridge.id,
            x: pos.x,
            y: pos.y,
            label: bridge.id,
            icon: 'switch',
            radius: isRoot ? 24 : 20,
            fill: isRoot ? 'var(--color-accent-alt)' : 'var(--color-bg)',
            stroke: isRoot ? 'var(--color-accent)' : 'var(--color-border)',
            strokeWidth: isRoot ? 3 : 1.5,
          }
        })}
        edges={EXAMPLE_LINKS.map((link): TopologyEdge => ({
          from: link.from,
          to: link.to,
          label: link.cost,
          stroke: linkIsBlocked(link) ? 'var(--color-fg-subtle)' : 'var(--color-accent-alt)',
          strokeWidth: linkIsBlocked(link) ? 1.5 : 3,
          dashed: linkIsBlocked(link),
        }))}
      />
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-2 py-1.5 font-medium text-fg-muted">Switch</th>
              <th className="px-2 py-1.5 font-medium text-fg-muted">Link to</th>
              <th className="px-2 py-1.5 font-medium text-fg-muted">Cost to root</th>
              <th className="px-2 py-1.5 font-medium text-fg-muted">Port role</th>
            </tr>
          </thead>
          <tbody>
            {ports.map((port) => (
              <tr
                key={`${port.bridgeId}-${port.neighborId}`}
                className="border-b border-border font-mono last:border-b-0"
              >
                <td className="px-2 py-1.5">{port.bridgeId}</td>
                <td className="px-2 py-1.5">{port.neighborId}</td>
                <td className="px-2 py-1.5">{port.cost}</td>
                <td className="px-2 py-1.5">
                  <span
                    className={
                      port.role === 'blocked'
                        ? 'text-fg-subtle'
                        : port.role === 'root'
                          ? 'text-accent'
                          : 'text-accent-alt'
                    }
                  >
                    {port.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-fg-subtle">
        A-B and D-A both lead directly to the root ({rootBridgeId}), so B and D use those as their
        root ports. C is two hops from the root either way, but B's path (cost 20) beats D's (cost
        23), so C's B-facing port becomes its root port -- leaving the C-D link with nothing to do
        but block, since it's the one connection that would otherwise form a loop.
      </p>
    </div>
  )
}
