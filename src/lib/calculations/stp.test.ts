import { describe, expect, it } from 'vitest'
import { computeStpPortRoles, electRootBridge, type BridgeCandidate, type StpLink } from './stp'

function role(
  ports: { bridgeId: string; neighborId: string; role: string }[],
  bridgeId: string,
  neighborId: string,
) {
  return ports.find((p) => p.bridgeId === bridgeId && p.neighborId === neighborId)?.role
}

describe('electRootBridge', () => {
  it('the lowest priority wins outright', () => {
    const result = electRootBridge([
      { id: 'Switch A', priority: 32768, macAddress: '00:11:22:33:44:55' },
      { id: 'Switch B', priority: 4096, macAddress: 'aa:bb:cc:dd:ee:ff' },
    ])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.rootBridgeId).toBe('Switch B')
    expect(result.result.decidedBy).toBe('priority')
  })

  it('MAC address breaks a tie in priority, compared numerically', () => {
    const result = electRootBridge([
      { id: 'Switch A', priority: 32768, macAddress: '00:11:22:33:44:55' },
      { id: 'Switch B', priority: 32768, macAddress: '00:00:00:00:00:01' },
    ])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.rootBridgeId).toBe('Switch B')
    expect(result.result.decidedBy).toBe('mac-address')
  })

  it('a single bridge wins trivially', () => {
    const result = electRootBridge([
      { id: 'Only', priority: 32768, macAddress: '00:11:22:33:44:55' },
    ])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.rootBridgeId).toBe('Only')
  })

  it('rejects an out-of-range priority', () => {
    const result = electRootBridge([{ id: 'A', priority: 70000, macAddress: '00:11:22:33:44:55' }])
    expect(result.ok).toBe(false)
  })

  it('rejects an invalid MAC address', () => {
    const result = electRootBridge([{ id: 'A', priority: 32768, macAddress: 'not-a-mac' }])
    expect(result.ok).toBe(false)
  })

  it('rejects an empty candidate list', () => {
    expect(electRootBridge([]).ok).toBe(false)
  })

  it('rejects two bridges sharing the same name instead of silently merging them', () => {
    const result = electRootBridge([
      { id: 'Switch A', priority: 32768, macAddress: '00:11:22:33:44:55' },
      { id: 'Switch A', priority: 4096, macAddress: 'aa:bb:cc:dd:ee:ff' },
    ])
    expect(result.ok).toBe(false)
  })
})

describe('computeStpPortRoles', () => {
  // A 4-bridge ring (A-B-C-D-A) with asymmetric costs, chosen so every
  // bridge has a unique shortest path except C, whose two paths to the
  // root (via B, or via D) differ -- this is the one loop, so exactly one
  // port should end up blocked.
  const CANDIDATES: BridgeCandidate[] = [
    { id: 'A', priority: 4096, macAddress: '00:00:00:00:00:0a' },
    { id: 'B', priority: 32768, macAddress: '00:00:00:00:00:0b' },
    { id: 'C', priority: 32768, macAddress: '00:00:00:00:00:0c' },
    { id: 'D', priority: 32768, macAddress: '00:00:00:00:00:0d' },
  ]
  const LINKS: StpLink[] = [
    { from: 'A', to: 'B', cost: 10 },
    { from: 'B', to: 'C', cost: 10 },
    { from: 'C', to: 'D', cost: 15 },
    { from: 'D', to: 'A', cost: 8 },
  ]

  it('elects A as root and computes cost-to-root for every bridge', () => {
    const result = computeStpPortRoles(CANDIDATES, LINKS)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.rootBridgeId).toBe('A')
    expect(result.result.costToRoot).toEqual({ A: 0, B: 10, C: 20, D: 8 })
  })

  it('the root bridge is designated on every one of its links', () => {
    const result = computeStpPortRoles(CANDIDATES, LINKS)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(role(result.result.ports, 'A', 'B')).toBe('designated')
    expect(role(result.result.ports, 'A', 'D')).toBe('designated')
  })

  it('B and D use their direct link to the root as their root port', () => {
    const result = computeStpPortRoles(CANDIDATES, LINKS)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(role(result.result.ports, 'B', 'A')).toBe('root')
    expect(role(result.result.ports, 'D', 'A')).toBe('root')
  })

  it("C's cheaper path is via B (cost 20) rather than via D (cost 23), so that's its root port", () => {
    const result = computeStpPortRoles(CANDIDATES, LINKS)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(role(result.result.ports, 'C', 'B')).toBe('root')
  })

  it('blocks exactly the one redundant link in the loop (C-D)', () => {
    const result = computeStpPortRoles(CANDIDATES, LINKS)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const blocked = result.result.ports.filter((p) => p.role === 'blocked')
    expect(blocked).toHaveLength(1)
    expect(blocked[0]).toMatchObject({ bridgeId: 'C', neighborId: 'D' })
    // D's side of that same link is still forwarding (designated) -- only
    // one side of a blocked link is actually blocked.
    expect(role(result.result.ports, 'D', 'C')).toBe('designated')
  })

  it('a topology with no loop blocks nothing', () => {
    const result = computeStpPortRoles(
      [
        { id: 'A', priority: 4096, macAddress: '00:00:00:00:00:0a' },
        { id: 'B', priority: 32768, macAddress: '00:00:00:00:00:0b' },
      ],
      [{ from: 'A', to: 'B', cost: 10 }],
    )
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.ports.some((p) => p.role === 'blocked')).toBe(false)
  })

  it('when a bridge has two links tied for cost-to-root, the lower neighbor ID wins the root port -- not input order', () => {
    // D reaches root A via B (10+5=15) or via C (10+5=15) -- a genuine tie.
    // 802.1D breaks this by the lower ID on the other end of the link, so
    // D's root port must be D-B ('B' < 'C'), regardless of which order the
    // two tied links appear in the input.
    const candidates: BridgeCandidate[] = [
      { id: 'A', priority: 4096, macAddress: '00:00:00:00:00:0a' },
      { id: 'B', priority: 32768, macAddress: '00:00:00:00:00:0b' },
      { id: 'C', priority: 32768, macAddress: '00:00:00:00:00:0c' },
      { id: 'D', priority: 32768, macAddress: '00:00:00:00:00:0d' },
    ]

    const linksBFirst: StpLink[] = [
      { from: 'A', to: 'B', cost: 10 },
      { from: 'A', to: 'C', cost: 10 },
      { from: 'B', to: 'D', cost: 5 },
      { from: 'C', to: 'D', cost: 5 },
    ]
    const resultBFirst = computeStpPortRoles(candidates, linksBFirst)
    expect(resultBFirst.ok).toBe(true)
    if (!resultBFirst.ok) return
    expect(role(resultBFirst.result.ports, 'D', 'B')).toBe('root')
    expect(role(resultBFirst.result.ports, 'D', 'C')).toBe('blocked')

    // Same topology, but the C-D link is listed before B-D this time.
    const linksCFirst: StpLink[] = [
      { from: 'A', to: 'B', cost: 10 },
      { from: 'A', to: 'C', cost: 10 },
      { from: 'C', to: 'D', cost: 5 },
      { from: 'B', to: 'D', cost: 5 },
    ]
    const resultCFirst = computeStpPortRoles(candidates, linksCFirst)
    expect(resultCFirst.ok).toBe(true)
    if (!resultCFirst.ok) return
    expect(role(resultCFirst.result.ports, 'D', 'B')).toBe('root')
    expect(role(resultCFirst.result.ports, 'D', 'C')).toBe('blocked')
  })

  it('propagates a root-election error', () => {
    const result = computeStpPortRoles(
      [{ id: 'A', priority: 70000, macAddress: '00:00:00:00:00:0a' }],
      [],
    )
    expect(result.ok).toBe(false)
  })
})
