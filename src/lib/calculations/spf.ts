export interface GraphEdge {
  from: string
  to: string
  cost: number
}

export interface SpfStep {
  title: string
  description: string
  visited: string[]
  distances: Partial<Record<string, number>>
  bestEdge: Partial<Record<string, string>>
  activeNode: string | null
}

function buildAdjacency(
  nodeIds: string[],
  edges: GraphEdge[],
): Map<string, { to: string; cost: number }[]> {
  const adjacency = new Map<string, { to: string; cost: number }[]>()
  for (const id of nodeIds) adjacency.set(id, [])
  for (const edge of edges) {
    if (!adjacency.has(edge.from) || !adjacency.has(edge.to)) continue
    adjacency.get(edge.from)!.push({ to: edge.to, cost: edge.cost })
    adjacency.get(edge.to)!.push({ to: edge.from, cost: edge.cost })
  }
  return adjacency
}

/**
 * Runs Dijkstra's algorithm from sourceId over an arbitrary (undirected)
 * graph and returns one SpfStep per visited router, narrating each visit --
 * this replaces what used to be a hand-authored fixed sequence, so the
 * visualizer can support live topology editing instead of one fixed example.
 * Unreachable routers are left out of `distances`/`visited` entirely rather
 * than erroring, same as real OSPF simply never installing a route for them.
 */
export function computeSpfSteps(
  sourceId: string,
  nodeIds: string[],
  edges: GraphEdge[],
): SpfStep[] {
  const adjacency = buildAdjacency(nodeIds, edges)
  const distances: Partial<Record<string, number>> = { [sourceId]: 0 }
  const bestEdge: Partial<Record<string, string>> = {}
  const visited: string[] = []

  const steps: SpfStep[] = [
    {
      title: 'Ready to compute',
      description: `${sourceId} wants to find the shortest path to every other router. Only ${sourceId} (distance 0) is known so far.`,
      visited: [],
      distances: { ...distances },
      bestEdge: { ...bestEdge },
      activeNode: null,
    },
  ]

  let stepNumber = 0
  while (visited.length < nodeIds.length) {
    let current: string | null = null
    let currentDist = Infinity
    for (const id of nodeIds) {
      if (visited.includes(id)) continue
      const d = distances[id]
      if (d !== undefined && d < currentDist) {
        current = id
        currentDist = d
      }
    }
    if (current === null) break // remaining routers are unreachable from sourceId

    visited.push(current)
    stepNumber++

    const updates: { node: string; distance: number; previousDistance: number | null }[] = []
    for (const { to, cost } of adjacency.get(current) ?? []) {
      if (visited.includes(to)) continue
      const candidate = currentDist + cost
      const existing = distances[to]
      if (existing === undefined || candidate < existing) {
        updates.push({ node: to, distance: candidate, previousDistance: existing ?? null })
        distances[to] = candidate
        bestEdge[to] = current
      }
    }

    const isComplete = visited.length === nodeIds.length
    const title = `${stepNumber}. Visit ${current} (distance ${currentDist})${isComplete ? ' -- done' : ''}`

    let description: string
    if (updates.length === 0) {
      description = `${current} has no unvisited neighbors to update.`
    } else {
      const parts = updates.map((u) =>
        u.previousDistance === null
          ? `${u.node} gets a tentative distance of ${u.distance}`
          : `${u.node} improves from ${u.previousDistance} to ${u.distance} (cheaper via ${current})`,
      )
      description = `${current}'s neighbor${updates.length > 1 ? 's' : ''} ${parts.join('; ')}.`
    }
    if (isComplete) {
      description += ' Every reachable router is now visited -- the shortest-path tree is complete.'
    }

    steps.push({
      title,
      description,
      visited: [...visited],
      distances: { ...distances },
      bestEdge: { ...bestEdge },
      activeNode: current,
    })
  }

  return steps
}

export interface NodePosition {
  x: number
  y: number
}

/**
 * Arranges an arbitrary number of routers evenly around a circle -- the
 * fixed hand-placed layout the visualizer used to have only worked for
 * exactly 5 nodes, so live topology editing needs a layout that scales.
 */
export function circularLayout(
  nodeIds: string[],
  width: number,
  height: number,
): Record<string, NodePosition> {
  const cx = width / 2
  const cy = height / 2
  const radius = Math.min(width, height) / 2 - 40
  const positions: Record<string, NodePosition> = {}
  nodeIds.forEach((id, index) => {
    const angle = (2 * Math.PI * index) / nodeIds.length - Math.PI / 2
    positions[id] = { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) }
  })
  return positions
}

function randomCost(): number {
  return Math.floor(Math.random() * 19) + 1
}

/**
 * Generates a random connected topology: a random spanning tree (guarantees
 * every router is reachable) plus a handful of extra edges for redundancy.
 */
export function randomTopology(): { nodeIds: string[]; edges: GraphEdge[] } {
  const count = Math.floor(Math.random() * 3) + 4 // 4-6 routers
  const nodeIds = Array.from({ length: count }, (_, i) => `R${i + 1}`)
  const shuffled = [...nodeIds].sort(() => Math.random() - 0.5)

  const edges: GraphEdge[] = []
  for (let i = 1; i < shuffled.length; i++) {
    const from = shuffled[i]!
    const to = shuffled[Math.floor(Math.random() * i)]!
    edges.push({ from, to, cost: randomCost() })
  }

  const extraLinks = Math.floor(Math.random() * 3) // 0-2 extra edges
  for (let i = 0; i < extraLinks; i++) {
    const a = nodeIds[Math.floor(Math.random() * nodeIds.length)]!
    const b = nodeIds[Math.floor(Math.random() * nodeIds.length)]!
    if (a === b) continue
    const exists = edges.some(
      (edge) => (edge.from === a && edge.to === b) || (edge.from === b && edge.to === a),
    )
    if (exists) continue
    edges.push({ from: a, to: b, cost: randomCost() })
  }

  return { nodeIds, edges }
}
