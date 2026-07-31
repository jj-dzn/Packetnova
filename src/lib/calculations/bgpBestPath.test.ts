import { describe, expect, it } from 'vitest'
import { selectBgpBestPath, type BgpCandidate } from './bgpBestPath'

function makeCandidate(id: string, overrides: Partial<BgpCandidate> = {}): BgpCandidate {
  return {
    id,
    weight: 0,
    localPreference: 100,
    locallyOriginated: false,
    asPathLength: 3,
    origin: 'igp',
    med: 0,
    isEbgp: true,
    igpMetricToNextHop: 0,
    routeAgeSeconds: 100,
    routerId: '1.1.1.1',
    neighborIp: '10.0.0.1',
    ...overrides,
  }
}

describe('selectBgpBestPath', () => {
  it('a single candidate wins trivially', () => {
    const result = selectBgpBestPath([makeCandidate('A')])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.winnerId).toBe('A')
  })

  it('highest weight wins first, ahead of every later criterion', () => {
    const result = selectBgpBestPath([
      makeCandidate('A', { weight: 100, asPathLength: 10 }),
      makeCandidate('B', { weight: 50, asPathLength: 1 }),
    ])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.winnerId).toBe('A')
    expect(result.result.decidedByStep).toBe('Highest weight')
  })

  it('shortest AS path wins once weight and local preference are tied', () => {
    const result = selectBgpBestPath([
      makeCandidate('A', { asPathLength: 3 }),
      makeCandidate('B', { asPathLength: 2 }),
    ])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.winnerId).toBe('B')
    expect(result.result.decidedByStep).toBe('Shortest AS path')
  })

  it('lowest MED wins once earlier criteria are tied', () => {
    const result = selectBgpBestPath([
      makeCandidate('A', { med: 50 }),
      makeCandidate('B', { med: 20 }),
    ])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.winnerId).toBe('B')
    expect(result.result.decidedByStep).toBe('Lowest MED')
  })

  it('eBGP is preferred over iBGP once earlier criteria are tied', () => {
    const result = selectBgpBestPath([
      makeCandidate('A', { isEbgp: false }),
      makeCandidate('B', { isEbgp: true }),
    ])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.winnerId).toBe('B')
    expect(result.result.decidedByStep).toBe('eBGP over iBGP')
  })

  it('falls all the way through to the lowest router ID when everything else ties', () => {
    const result = selectBgpBestPath([
      makeCandidate('A', { routerId: '5.5.5.5' }),
      makeCandidate('B', { routerId: '2.2.2.2' }),
    ])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.winnerId).toBe('B')
    expect(result.result.decidedByStep).toBe('Lowest router ID')
  })

  it('router ID is compared numerically, not lexicographically', () => {
    // Lexicographically "10.0.0.1" < "9.0.0.1" (the character '1' < '9'),
    // but numerically 9.0.0.1 is the lower address -- the correct winner.
    const result = selectBgpBestPath([
      makeCandidate('A', { routerId: '10.0.0.1' }),
      makeCandidate('B', { routerId: '9.0.0.1' }),
    ])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.winnerId).toBe('B')
  })

  it('rejects duplicate candidate names', () => {
    const result = selectBgpBestPath([makeCandidate('A'), makeCandidate('A')])
    expect(result.ok).toBe(false)
  })

  it('rejects an invalid router ID', () => {
    const result = selectBgpBestPath([
      makeCandidate('A', { routerId: 'not-an-ip' }),
      makeCandidate('B'),
    ])
    expect(result.ok).toBe(false)
  })

  it('rejects an empty candidate list', () => {
    expect(selectBgpBestPath([]).ok).toBe(false)
  })
})
