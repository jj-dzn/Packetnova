import { describe, expect, it } from 'vitest'
import { electRootBridge } from './stp'

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
})
