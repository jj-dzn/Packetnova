import { VisualizerPageLayout } from './VisualizerPageLayout'
import { StepControls } from './StepControls'
import { useStepPlayer } from '../../hooks/useStepPlayer'

interface NodePos {
  id: string
  x: number
  y: number
}

interface Edge {
  from: string
  to: string
  cost: number
}

// Small fixed topology, hand-verified with an independent Dijkstra
// implementation: R2's shortest path from R1 is via R3 (cost 8), not the
// direct R1-R2 link (cost 10) -- deliberately chosen so the walkthrough
// demonstrates why the algorithm has to explore alternatives rather than
// just following direct links.
const NODES: NodePos[] = [
  { id: 'R1', x: 50, y: 150 },
  { id: 'R3', x: 170, y: 70 },
  { id: 'R2', x: 170, y: 230 },
  { id: 'R4', x: 290, y: 150 },
  { id: 'R5', x: 390, y: 150 },
]

const EDGES: Edge[] = [
  { from: 'R1', to: 'R2', cost: 10 },
  { from: 'R1', to: 'R3', cost: 5 },
  { from: 'R2', to: 'R3', cost: 3 },
  { from: 'R2', to: 'R4', cost: 10 },
  { from: 'R3', to: 'R4', cost: 15 },
  { from: 'R4', to: 'R5', cost: 5 },
]

interface SpfStep {
  title: string
  description: string
  visited: string[]
  distances: Partial<Record<string, number>>
  bestEdge: Partial<Record<string, string>>
  activeNode: string | null
}

const STEPS: SpfStep[] = [
  {
    title: 'Ready to compute',
    description:
      'R1 wants to find the shortest path to every other router. Only R1 (distance 0) is known so far.',
    visited: [],
    distances: { R1: 0 },
    bestEdge: {},
    activeNode: null,
  },
  {
    title: '1. Visit R1 (distance 0)',
    description: "R1's neighbors are R2 (cost 10) and R3 (cost 5) -- both get tentative distances.",
    visited: ['R1'],
    distances: { R1: 0, R2: 10, R3: 5 },
    bestEdge: { R2: 'R1', R3: 'R1' },
    activeNode: 'R1',
  },
  {
    title: '2. Visit R3 (distance 5) -- the closest unvisited router',
    description:
      "R3's neighbor R2 improves from 10 to 8 (5+3 via R3, cheaper than the direct link). R4 gets a tentative distance of 20 (5+15).",
    visited: ['R1', 'R3'],
    distances: { R1: 0, R2: 8, R3: 5, R4: 20 },
    bestEdge: { R2: 'R3', R3: 'R1', R4: 'R3' },
    activeNode: 'R3',
  },
  {
    title: '3. Visit R2 (distance 8)',
    description:
      "R2's neighbor R4 improves from 20 to 18 (8+10 via R2, cheaper than via R3) -- R4's best path is updated.",
    visited: ['R1', 'R3', 'R2'],
    distances: { R1: 0, R2: 8, R3: 5, R4: 18 },
    bestEdge: { R2: 'R3', R3: 'R1', R4: 'R2' },
    activeNode: 'R2',
  },
  {
    title: '4. Visit R4 (distance 18)',
    description: "R4's neighbor R5 gets a tentative distance of 23 (18+5).",
    visited: ['R1', 'R3', 'R2', 'R4'],
    distances: { R1: 0, R2: 8, R3: 5, R4: 18, R5: 23 },
    bestEdge: { R2: 'R3', R3: 'R1', R4: 'R2', R5: 'R4' },
    activeNode: 'R4',
  },
  {
    title: '5. Visit R5 (distance 23) -- done',
    description:
      'Every router is now visited. The shortest-path tree is complete: R1 -> R3 -> R2 -> R4 -> R5.',
    visited: ['R1', 'R3', 'R2', 'R4', 'R5'],
    distances: { R1: 0, R2: 8, R3: 5, R4: 18, R5: 23 },
    bestEdge: { R2: 'R3', R3: 'R1', R4: 'R2', R5: 'R4' },
    activeNode: 'R5',
  },
]

function nodePos(id: string): NodePos {
  return NODES.find((n) => n.id === id)!
}

export function OspfSpfVisualizer() {
  const player = useStepPlayer(STEPS.length)
  const current = STEPS[player.step]!

  return (
    <VisualizerPageLayout
      category="Visualizer"
      title="OSPF SPF animation"
      description="Watch Dijkstra's shortest-path-first algorithm build an OSPF routing tree."
    >
      <div
        tabIndex={0}
        onKeyDown={player.onKeyDown}
        aria-label="OSPF SPF visualizer. Use the Previous and Next buttons, or the left and right arrow keys, to step through."
        className="flex flex-col gap-8 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <svg viewBox="0 0 440 300" className="mx-auto w-full max-w-xl">
          {EDGES.map((edge) => {
            const a = nodePos(edge.from)
            const b = nodePos(edge.to)
            const isTreeEdge =
              current.bestEdge[edge.to] === edge.from || current.bestEdge[edge.from] === edge.to
            const midX = (a.x + b.x) / 2
            const midY = (a.y + b.y) / 2
            return (
              <g key={`${edge.from}-${edge.to}`}>
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

          {NODES.map((node) => {
            const visited = current.visited.includes(node.id)
            const active = current.activeNode === node.id
            const distance = current.distances[node.id]
            return (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={active ? 26 : 22}
                  fill={visited ? 'var(--color-accent-alt)' : 'var(--color-surface)'}
                  stroke={active ? 'var(--color-accent)' : 'var(--color-border)'}
                  strokeWidth={active ? 3 : 1.5}
                />
                <text
                  x={node.x}
                  y={node.y - 3}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="600"
                  fontFamily="var(--font-mono)"
                  fill={visited ? 'var(--color-bg)' : 'var(--color-fg)'}
                >
                  {node.id}
                </text>
                <text
                  x={node.x}
                  y={node.y + 11}
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

        <StepControls player={player} totalSteps={STEPS.length} />
      </div>
    </VisualizerPageLayout>
  )
}
