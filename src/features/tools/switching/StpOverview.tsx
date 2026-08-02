import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { Aside } from '../Aside'
import { ToolEducation } from '../ToolEducation'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { Select } from '../../../components/ui/Select'
import { Pill } from '../../../components/ui/Pill'
import { TopologyCanvas, type TopologyEdge, type TopologyNode } from '../../diagram/TopologyCanvas'
import {
  computeStpPortRoles,
  electRootBridge,
  type BridgeCandidate,
  type StpLink,
  type StpTopologyResult,
} from '../../../lib/calculations/stp'

// A triangle -- the smallest topology with an actual loop, so it's the
// smallest one where "designated" and "blocked" mean anything -- rather
// than the old fixed 4-switch example: this is now the same editable state
// the visitor can reshape, not a separate illustration bolted on beside it.
const DEFAULT_BRIDGES: BridgeCandidate[] = [
  { id: 'Switch A', priority: 32768, macAddress: '00:11:22:33:44:55' },
  { id: 'Switch B', priority: 4096, macAddress: 'aa:bb:cc:dd:ee:ff' },
  { id: 'Switch C', priority: 32768, macAddress: '00:22:33:44:55:66' },
]
const DEFAULT_LINKS: StpLink[] = [
  { from: 'Switch A', to: 'Switch B', cost: 10 },
  { from: 'Switch B', to: 'Switch C', cost: 10 },
  { from: 'Switch C', to: 'Switch A', cost: 15 },
]

const DIAGRAM_WIDTH = 340
const DIAGRAM_HEIGHT = 280

function computeCircularPositions(ids: string[]): Record<string, { x: number; y: number }> {
  const centerX = DIAGRAM_WIDTH / 2
  const centerY = DIAGRAM_HEIGHT / 2
  const radius = Math.min(DIAGRAM_WIDTH, DIAGRAM_HEIGHT) / 2 - 55
  const positions: Record<string, { x: number; y: number }> = {}
  ids.forEach((id, index) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * index) / ids.length
    positions[id] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    }
  })
  return positions
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
  const [links, setLinks] = useState<StpLink[]>(DEFAULT_LINKS)
  const [showCli, setShowCli] = useState(false)

  const calc = electRootBridge(bridges)
  const topologyCalc = computeStpPortRoles(bridges, links)

  function updateBridge(index: number, patch: Partial<BridgeCandidate>) {
    const oldId = bridges[index]?.id
    setBridges((current) => current.map((b, i) => (i === index ? { ...b, ...patch } : b)))
    if (patch.id !== undefined && oldId !== undefined && patch.id !== oldId) {
      const newId = patch.id
      setLinks((current) =>
        current.map((link) => ({
          ...link,
          from: link.from === oldId ? newId : link.from,
          to: link.to === oldId ? newId : link.to,
        })),
      )
    }
  }

  function removeBridge(index: number) {
    const removedId = bridges[index]?.id
    setBridges((current) => current.filter((_, i) => i !== index))
    if (removedId !== undefined) {
      setLinks((current) =>
        current.filter((link) => link.from !== removedId && link.to !== removedId),
      )
    }
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

  function updateLink(index: number, patch: Partial<StpLink>) {
    setLinks((current) => current.map((l, i) => (i === index ? { ...l, ...patch } : l)))
  }

  function removeLink(index: number) {
    setLinks((current) => current.filter((_, i) => i !== index))
  }

  function addLink() {
    if (bridges.length < 2) return
    setLinks((current) => [...current, { from: bridges[0]!.id, to: bridges[1]!.id, cost: 10 }])
  }

  return (
    <>
      <ToolPageLayout
        category="Switching"
        title="STP overview"
        description="Spanning Tree Protocol elects a root bridge by lowest Bridge ID -- priority first, MAC address as the tiebreaker -- then blocks any port that would form a loop to it."
        input={
          <div className="flex flex-col gap-4">
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
            <div className="flex flex-col gap-2 border-t border-border pt-4">
              <span className="text-sm font-medium">Links</span>
              {links.map((link, index) => (
                <div key={index} className="flex flex-wrap gap-2">
                  <Select
                    value={link.from}
                    onChange={(e) => updateLink(index, { from: e.target.value })}
                    className="min-w-[8rem] flex-1"
                  >
                    {bridges.map((bridge) => (
                      <option key={bridge.id} value={bridge.id}>
                        {bridge.id}
                      </option>
                    ))}
                  </Select>
                  <Select
                    value={link.to}
                    onChange={(e) => updateLink(index, { to: e.target.value })}
                    className="min-w-[8rem] flex-1"
                  >
                    {bridges.map((bridge) => (
                      <option key={bridge.id} value={bridge.id}>
                        {bridge.id}
                      </option>
                    ))}
                  </Select>
                  <Input
                    value={link.cost}
                    onChange={(e) => updateLink(index, { cost: Number(e.target.value) })}
                    placeholder="Cost"
                    className="w-20"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => removeLink(index)}
                    aria-label="Remove link"
                  >
                    &times;
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                onClick={addLink}
                disabled={bridges.length < 2}
                className="self-start"
              >
                + Add link
              </Button>
              <p className="text-xs text-fg-subtle">
                Add a redundant link (one that closes a loop back to a bridge already connected) to
                see a port actually block.
              </p>
            </div>
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
          keeps a physically redundant, loop-having topology loop-free logically. The diagram below
          runs the exact same election and blocking logic live, on the bridges and links you edit
          above.
        </p>
        {topologyCalc.ok && <LiveTopologyDiagram result={topologyCalc.result} />}
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

function LiveTopologyDiagram({ result }: { result: StpTopologyResult }) {
  const { rootBridgeId, ports } = result
  const bridgeIds = Array.from(new Set(ports.flatMap((port) => [port.bridgeId, port.neighborId])))
  const positions = computeCircularPositions(bridgeIds.length > 0 ? bridgeIds : [rootBridgeId])

  function roleOf(bridgeId: string, neighborId: string) {
    return ports.find((p) => p.bridgeId === bridgeId && p.neighborId === neighborId)?.role
  }

  function linkIsBlocked(from: string, to: string) {
    return roleOf(from, to) === 'blocked' || roleOf(to, from) === 'blocked'
  }

  // De-duplicate each undirected link (the algorithm records a port entry
  // for both ends) down to one edge for drawing.
  const seenEdges = new Set<string>()
  const edges: { from: string; to: string }[] = []
  for (const port of ports) {
    const key = [port.bridgeId, port.neighborId].sort().join('--')
    if (seenEdges.has(key)) continue
    seenEdges.add(key)
    edges.push({ from: port.bridgeId, to: port.neighborId })
  }

  if (bridgeIds.length === 0) {
    return (
      <p className="mt-6 max-w-2xl text-sm text-fg-subtle">
        Add at least one link between two bridges to see the live topology diagram.
      </p>
    )
  }

  return (
    <div className="mt-6 max-w-2xl rounded-lg border border-border bg-surface p-4">
      <p className="mb-3 text-sm font-medium">Live topology -- root and blocked ports</p>
      <TopologyCanvas
        viewWidth={DIAGRAM_WIDTH}
        viewHeight={DIAGRAM_HEIGHT}
        className="mx-auto w-full max-w-sm"
        nodes={bridgeIds.map((id): TopologyNode => {
          const pos = positions[id]!
          const isRoot = id === rootBridgeId
          return {
            id,
            x: pos.x,
            y: pos.y,
            label: id,
            icon: 'switch',
            radius: isRoot ? 24 : 20,
            fill: isRoot ? 'var(--color-accent-alt)' : 'var(--color-bg)',
            stroke: isRoot ? 'var(--color-accent)' : 'var(--color-border)',
            strokeWidth: isRoot ? 3 : 1.5,
          }
        })}
        edges={edges.map((edge): TopologyEdge => ({
          from: edge.from,
          to: edge.to,
          stroke: linkIsBlocked(edge.from, edge.to)
            ? 'var(--color-fg-subtle)'
            : 'var(--color-accent-alt)',
          strokeWidth: linkIsBlocked(edge.from, edge.to) ? 1.5 : 3,
          dashed: linkIsBlocked(edge.from, edge.to),
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
        {rootBridgeId} is root (accent-filled, larger). Every other bridge's lowest-cost path back
        to it becomes a root port; whichever side of each remaining segment sits closer to the root
        becomes designated; anything left over -- a link that would only create a second path to the
        root -- blocks.
      </p>
    </div>
  )
}
