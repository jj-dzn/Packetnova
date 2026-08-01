import { describe, expect, it } from 'vitest'
import { circularLayout, computeSpfSteps, randomTopology, type GraphEdge } from './spf'

const NODE_IDS = ['R1', 'R2', 'R3', 'R4', 'R5']
const EDGES: GraphEdge[] = [
  { from: 'R1', to: 'R2', cost: 10 },
  { from: 'R1', to: 'R3', cost: 5 },
  { from: 'R2', to: 'R3', cost: 3 },
  { from: 'R2', to: 'R4', cost: 10 },
  { from: 'R3', to: 'R4', cost: 15 },
  { from: 'R4', to: 'R5', cost: 5 },
]

describe('computeSpfSteps', () => {
  it('matches the known-correct shortest-path tree for the reference topology', () => {
    const steps = computeSpfSteps('R1', NODE_IDS, EDGES)
    const final = steps[steps.length - 1]!
    expect(final.distances).toEqual({ R1: 0, R2: 8, R3: 5, R4: 18, R5: 23 })
    expect(final.bestEdge).toEqual({ R2: 'R3', R3: 'R1', R4: 'R2', R5: 'R4' })
    expect(final.visited).toEqual(['R1', 'R3', 'R2', 'R4', 'R5'])
  })

  it('visits R3 before R2 -- the whole point of the reference topology', () => {
    const steps = computeSpfSteps('R1', NODE_IDS, EDGES)
    expect(steps[2]!.activeNode).toBe('R3')
    expect(steps[3]!.activeNode).toBe('R2')
  })

  it('starts with a "ready" step at distance 0 for the source', () => {
    const steps = computeSpfSteps('R1', NODE_IDS, EDGES)
    expect(steps[0]!.visited).toEqual([])
    expect(steps[0]!.distances).toEqual({ R1: 0 })
  })

  it('leaves unreachable routers out of the visited set', () => {
    const steps = computeSpfSteps('R1', ['R1', 'R2', 'R3'], [{ from: 'R1', to: 'R2', cost: 1 }])
    const final = steps[steps.length - 1]!
    expect(final.visited).toEqual(['R1', 'R2'])
    expect(final.distances.R3).toBeUndefined()
  })

  it('handles a single-router graph', () => {
    const steps = computeSpfSteps('R1', ['R1'], [])
    expect(steps.length).toBeGreaterThan(0)
    expect(steps[steps.length - 1]!.visited).toEqual(['R1'])
  })
})

describe('circularLayout', () => {
  it('places every node within the given bounding box', () => {
    const positions = circularLayout(NODE_IDS, 440, 300)
    for (const id of NODE_IDS) {
      expect(positions[id]!.x).toBeGreaterThanOrEqual(0)
      expect(positions[id]!.x).toBeLessThanOrEqual(440)
      expect(positions[id]!.y).toBeGreaterThanOrEqual(0)
      expect(positions[id]!.y).toBeLessThanOrEqual(300)
    }
  })

  it('spaces nodes evenly around the center', () => {
    const positions = circularLayout(['A', 'B'], 440, 300)
    const cx = 220
    const cy = 150
    const distA = Math.hypot(positions.A!.x - cx, positions.A!.y - cy)
    const distB = Math.hypot(positions.B!.x - cx, positions.B!.y - cy)
    expect(distA).toBeCloseTo(distB, 5)
  })
})

describe('randomTopology', () => {
  it('always produces a connected graph with 4-6 routers', () => {
    for (let i = 0; i < 50; i++) {
      const { nodeIds, edges } = randomTopology()
      expect(nodeIds.length).toBeGreaterThanOrEqual(4)
      expect(nodeIds.length).toBeLessThanOrEqual(6)

      const steps = computeSpfSteps(nodeIds[0]!, nodeIds, edges)
      const final = steps[steps.length - 1]!
      expect([...final.visited].sort()).toEqual([...nodeIds].sort())

      for (const edge of edges) {
        expect(edge.cost).toBeGreaterThanOrEqual(1)
        expect(edge.from).not.toBe(edge.to)
      }
    }
  })
})
