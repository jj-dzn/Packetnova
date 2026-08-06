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
    neighborAsNumber: 65001,
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

  it('highest local preference wins once weight is tied', () => {
    const result = selectBgpBestPath([
      makeCandidate('A', { localPreference: 100 }),
      makeCandidate('B', { localPreference: 200 }),
    ])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.winnerId).toBe('B')
    expect(result.result.decidedByStep).toBe('Highest local preference')
  })

  it('a locally originated route wins once weight and local preference are tied', () => {
    const result = selectBgpBestPath([
      makeCandidate('A', { locallyOriginated: false }),
      makeCandidate('B', { locallyOriginated: true }),
    ])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.winnerId).toBe('B')
    expect(result.result.decidedByStep).toBe('Locally originated')
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

  it('lowest origin type wins once AS path length is tied', () => {
    const result = selectBgpBestPath([
      makeCandidate('A', { origin: 'incomplete' }),
      makeCandidate('B', { origin: 'igp' }),
    ])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.winnerId).toBe('B')
    expect(result.result.decidedByStep).toBe('Lowest origin type')
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

  it('MED does not decide between candidates from different neighboring AS numbers', () => {
    // Real BGP only compares MED between paths from the same neighboring AS
    // (RFC 4271 9.1.2.2) -- these two are tied on everything before MED but
    // come from different AS numbers, so MED must not decide between them;
    // the tie should fall through to the next real differentiator instead.
    const result = selectBgpBestPath([
      makeCandidate('A', { med: 50, neighborAsNumber: 65001, isEbgp: false }),
      makeCandidate('B', { med: 20, neighborAsNumber: 65002, isEbgp: true }),
    ])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.winnerId).toBe('B')
    expect(result.result.decidedByStep).toBe('eBGP over iBGP')
  })

  it('MED does decide between candidates that share the same neighboring AS', () => {
    const result = selectBgpBestPath([
      makeCandidate('A', { med: 50, neighborAsNumber: 65001 }),
      makeCandidate('B', { med: 20, neighborAsNumber: 65001 }),
    ])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.winnerId).toBe('B')
    expect(result.result.decidedByStep).toBe('Lowest MED')
  })

  it('rejects a candidate with an invalid neighboring AS number', () => {
    const result = selectBgpBestPath([
      makeCandidate('A', { neighborAsNumber: 0 }),
      makeCandidate('B'),
    ])
    expect(result.ok).toBe(false)
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

  it('lowest IGP metric to next hop wins once the eBGP/iBGP session type is tied', () => {
    const result = selectBgpBestPath([
      makeCandidate('A', { igpMetricToNextHop: 20 }),
      makeCandidate('B', { igpMetricToNextHop: 5 }),
    ])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.winnerId).toBe('B')
    expect(result.result.decidedByStep).toBe('Lowest IGP metric to next hop')
  })

  it('the oldest route wins once IGP metric is tied', () => {
    const result = selectBgpBestPath([
      makeCandidate('A', { routeAgeSeconds: 50 }),
      makeCandidate('B', { routeAgeSeconds: 500 }),
    ])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.winnerId).toBe('B')
    expect(result.result.decidedByStep).toBe('Oldest route')
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

  it('falls all the way through to the lowest neighbor IP when even router ID ties', () => {
    const result = selectBgpBestPath([
      makeCandidate('A', { neighborIp: '10.0.0.5' }),
      makeCandidate('B', { neighborIp: '10.0.0.2' }),
    ])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.winnerId).toBe('B')
    expect(result.result.decidedByStep).toBe('Lowest neighbor IP')
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
