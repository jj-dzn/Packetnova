import { useMemo, useState } from 'react'
import { VisualizerPageLayout } from './VisualizerPageLayout'
import { StepControls } from './StepControls'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { useStepPlayer } from '../../hooks/useStepPlayer'
import {
  circularLayout,
  computeSpfSteps,
  randomTopology,
  type GraphEdge,
  type SpfStep,
} from '../../lib/calculations/spf'

const DEFAULT_NODE_IDS = ['R1', 'R3', 'R2', 'R4', 'R5']

// Same reference topology as before (hand-verified: R2's shortest path from
// R1 is via R3 at cost 8, not the direct R1-R2 link at cost 10), now fed
// through the live Dijkstra implementation instead of being hand-authored.
const DEFAULT_EDGES: GraphEdge[] = [
  { from: 'R1', to: 'R2', cost: 10 },
  { from: 'R1', to: 'R3', cost: 5 },
  { from: 'R2', to: 'R3', cost: 3 },
  { from: 'R2', to: 'R4', cost: 10 },
  { from: 'R3', to: 'R4', cost: 15 },
  { from: 'R4', to: 'R5', cost: 5 },
]

const MAX_ROUTERS = 10
const VIEW_WIDTH = 440
const VIEW_HEIGHT = 300

function nextRouterId(nodeIds: string[]): string {
  const maxNumber = nodeIds.reduce((max, id) => {
    const n = Number(id.replace(/^R/, ''))
    return Number.isFinite(n) ? Math.max(max, n) : max
  }, 0)
  return `R${maxNumber + 1}`
}

export function OspfSpfVisualizer() {
  const [nodeIds, setNodeIds] = useState<string[]>(DEFAULT_NODE_IDS)
  const [edges, setEdges] = useState<GraphEdge[]>(DEFAULT_EDGES)
  const [sourceId, setSourceId] = useState(DEFAULT_NODE_IDS[0]!)

  const steps = useMemo(() => computeSpfSteps(sourceId, nodeIds, edges), [sourceId, nodeIds, edges])
  const topologyKey = `${sourceId}|${nodeIds.join(',')}|${edges
    .map((e) => `${e.from}-${e.to}-${e.cost}`)
    .join(',')}`

  function addRouter() {
    if (nodeIds.length >= MAX_ROUTERS) return
    const newId = nextRouterId(nodeIds)
    const anchor = nodeIds[Math.floor(Math.random() * nodeIds.length)]
    setNodeIds((current) => [...current, newId])
    if (anchor) {
      setEdges((current) => [...current, { from: anchor, to: newId, cost: 10 }])
    }
  }

  function removeRouter(id: string) {
    if (nodeIds.length <= 2) return
    setNodeIds((current) => current.filter((n) => n !== id))
    setEdges((current) => current.filter((e) => e.from !== id && e.to !== id))
    if (sourceId === id) setSourceId(nodeIds.find((n) => n !== id) ?? nodeIds[0]!)
  }

  function addEdge(from: string, to: string) {
    if (from === to) return
    const exists = edges.some(
      (e) => (e.from === from && e.to === to) || (e.from === to && e.to === from),
    )
    if (exists) return
    setEdges((current) => [...current, { from, to, cost: 10 }])
  }

  function updateEdgeCost(index: number, cost: number) {
    setEdges((current) => current.map((e, i) => (i === index ? { ...e, cost } : e)))
  }

  function removeEdge(index: number) {
    setEdges((current) => current.filter((_, i) => i !== index))
  }

  function randomize() {
    const topology = randomTopology()
    setNodeIds(topology.nodeIds)
    setEdges(topology.edges)
    setSourceId(topology.nodeIds[0]!)
  }

  return (
    <VisualizerPageLayout
      category="Visualizer"
      title="OSPF SPF animation"
      description="Watch Dijkstra's shortest-path-first algorithm build an OSPF routing tree -- edit the topology below to try your own."
    >
      <div className="flex flex-col gap-6">
        <SpfWalkthrough key={topologyKey} steps={steps} nodeIds={nodeIds} edges={edges} />

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <label className="flex items-center gap-2 text-sm">
            <span className="font-medium">Source router</span>
            <Select
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="w-auto"
            >
              {nodeIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </Select>
          </label>
          <Button variant="secondary" type="button" onClick={randomize}>
            🎲 Randomize topology
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <RoutersPanel
            nodeIds={nodeIds}
            onAdd={addRouter}
            onRemove={removeRouter}
            canAdd={nodeIds.length < MAX_ROUTERS}
            canRemove={nodeIds.length > 2}
          />
          <LinksPanel
            nodeIds={nodeIds}
            edges={edges}
            onAdd={addEdge}
            onRemove={removeEdge}
            onCostChange={updateEdgeCost}
          />
        </div>
      </div>
    </VisualizerPageLayout>
  )
}

function SpfWalkthrough({
  steps,
  nodeIds,
  edges,
}: {
  steps: SpfStep[]
  nodeIds: string[]
  edges: GraphEdge[]
}) {
  const player = useStepPlayer(steps.length)
  const current = steps[player.step]!
  const positions = useMemo(() => circularLayout(nodeIds, VIEW_WIDTH, VIEW_HEIGHT), [nodeIds])

  return (
    <div
      tabIndex={0}
      onKeyDown={player.onKeyDown}
      aria-label="OSPF SPF visualizer. Use the Previous and Next buttons, or the left and right arrow keys, to step through."
      className="flex flex-col gap-8 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <svg viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} className="mx-auto w-full max-w-xl">
        {edges.map((edge, index) => {
          const a = positions[edge.from]
          const b = positions[edge.to]
          if (!a || !b) return null
          const isTreeEdge =
            current.bestEdge[edge.to] === edge.from || current.bestEdge[edge.from] === edge.to
          const midX = (a.x + b.x) / 2
          const midY = (a.y + b.y) / 2
          return (
            <g key={`${edge.from}-${edge.to}-${index}`}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={isTreeEdge ? 'var(--color-accent-alt)' : 'var(--color-border)'}
                strokeWidth={isTreeEdge ? 3 : 1.5}
              />
              <rect
                x={midX - 10}
                y={midY - 9}
                width={20}
                height={14}
                fill="var(--color-bg)"
                opacity={0.85}
              />
              <text
                x={midX}
                y={midY + 1}
                textAnchor="middle"
                fontSize="10"
                fontFamily="var(--font-mono)"
                fill={isTreeEdge ? 'var(--color-accent-alt)' : 'var(--color-fg-subtle)'}
              >
                {edge.cost}
              </text>
            </g>
          )
        })}

        {nodeIds.map((id) => {
          const pos = positions[id]
          if (!pos) return null
          const visited = current.visited.includes(id)
          const active = current.activeNode === id
          const distance = current.distances[id]
          return (
            <g key={id}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={active ? 26 : 22}
                fill={visited ? 'var(--color-accent-alt)' : 'var(--color-surface)'}
                stroke={active ? 'var(--color-accent)' : 'var(--color-border)'}
                strokeWidth={active ? 3 : 1.5}
              />
              <text
                x={pos.x}
                y={pos.y - 3}
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fontFamily="var(--font-mono)"
                fill={visited ? 'var(--color-bg)' : 'var(--color-fg)'}
              >
                {id}
              </text>
              <text
                x={pos.x}
                y={pos.y + 11}
                textAnchor="middle"
                fontSize="10"
                fontFamily="var(--font-mono)"
                fill={visited ? 'var(--color-bg)' : 'var(--color-fg-muted)'}
              >
                {distance === undefined ? '∞' : distance}
              </text>
            </g>
          )
        })}
      </svg>

      <div aria-live="polite">
        <h2 className="font-medium">{current.title}</h2>
        <p className="mt-1 text-sm text-fg-muted">{current.description}</p>
      </div>

      <StepControls player={player} totalSteps={steps.length} />
    </div>
  )
}

function RoutersPanel({
  nodeIds,
  onAdd,
  onRemove,
  canAdd,
  canRemove,
}: {
  nodeIds: string[]
  onAdd: () => void
  onRemove: (id: string) => void
  canAdd: boolean
  canRemove: boolean
}) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-border p-3">
      <p className="text-sm font-medium">Routers</p>
      <div className="flex flex-wrap gap-2">
        {nodeIds.map((id) => (
          <span
            key={id}
            className="flex items-center gap-1.5 rounded-full border border-border bg-bg px-2.5 py-1 font-mono text-xs"
          >
            {id}
            <button
              type="button"
              onClick={() => onRemove(id)}
              disabled={!canRemove}
              aria-label={`Remove ${id}`}
              className="text-fg-subtle hover:text-danger disabled:pointer-events-none disabled:opacity-30"
            >
              &times;
            </button>
          </span>
        ))}
      </div>
      <Button
        variant="secondary"
        type="button"
        onClick={onAdd}
        disabled={!canAdd}
        className="self-start"
      >
        + Add router
      </Button>
    </div>
  )
}

function LinksPanel({
  nodeIds,
  edges,
  onAdd,
  onRemove,
  onCostChange,
}: {
  nodeIds: string[]
  edges: GraphEdge[]
  onAdd: (from: string, to: string) => void
  onRemove: (index: number) => void
  onCostChange: (index: number, cost: number) => void
}) {
  const [fromId, setFromId] = useState(nodeIds[0] ?? '')
  const [toId, setToId] = useState(nodeIds[1] ?? nodeIds[0] ?? '')
  const safeFromId = nodeIds.includes(fromId) ? fromId : (nodeIds[0] ?? '')
  const safeToId = nodeIds.includes(toId) ? toId : (nodeIds[1] ?? nodeIds[0] ?? '')

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border p-3">
      <p className="text-sm font-medium">Links</p>
      <div className="flex flex-col gap-1">
        {edges.map((edge, index) => (
          <div key={`${edge.from}-${edge.to}-${index}`} className="flex items-center gap-2">
            <span className="w-24 shrink-0 font-mono text-xs text-fg-muted">
              {edge.from} &ndash; {edge.to}
            </span>
            <Input
              type="number"
              min={1}
              value={edge.cost}
              onChange={(e) => onCostChange(index, Math.max(1, Number(e.target.value)))}
              className="w-20"
            />
            <button
              type="button"
              onClick={() => onRemove(index)}
              aria-label={`Remove link ${edge.from}-${edge.to}`}
              className="text-fg-subtle hover:text-danger"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <Select value={safeFromId} onChange={(e) => setFromId(e.target.value)} className="w-auto">
          {nodeIds.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </Select>
        <span className="text-xs text-fg-subtle">to</span>
        <Select value={safeToId} onChange={(e) => setToId(e.target.value)} className="w-auto">
          {nodeIds.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </Select>
        <Button
          variant="secondary"
          type="button"
          onClick={() => onAdd(safeFromId, safeToId)}
          disabled={safeFromId === safeToId}
        >
          + Add link
        </Button>
      </div>
    </div>
  )
}
