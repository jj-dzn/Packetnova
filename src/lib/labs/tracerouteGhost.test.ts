import { describe, expect, it } from 'vitest'
import { generateHops, overallTirednessBand } from './tracerouteGhost'

describe('generateHops', () => {
  it('ends on a hop labeled with the destination host', () => {
    const hops = generateHops(120, 'example.com')
    expect(hops[hops.length - 1]!.label).toBe('example.com')
  })

  it('produces at least five hops (four intermediate plus destination)', () => {
    const hops = generateHops(120, 'example.com')
    expect(hops.length).toBeGreaterThanOrEqual(5)
  })

  it('numbers hops sequentially starting at 1', () => {
    const hops = generateHops(200, 'example.com')
    hops.forEach((hop, i) => expect(hop.index).toBe(i + 1))
  })

  it('keeps per-hop latency roughly summing to the total', () => {
    const total = 300
    const hops = generateHops(total, 'example.com')
    const sum = hops.reduce((acc, hop) => acc + hop.latencyMs, 0)
    expect(sum).toBeGreaterThan(total * 0.8)
    expect(sum).toBeLessThan(total * 1.2)
  })

  it('never produces a zero or negative latency hop', () => {
    const hops = generateHops(5, 'example.com')
    hops.forEach((hop) => expect(hop.latencyMs).toBeGreaterThan(0))
  })
})

describe('overallTirednessBand', () => {
  it('delegates to the same latency bands as the ping pet', () => {
    expect(overallTirednessBand(null)).toBe('error')
    expect(overallTirednessBand(50)).toBe('fast')
    expect(overallTirednessBand(500)).toBe('slow')
  })
})
