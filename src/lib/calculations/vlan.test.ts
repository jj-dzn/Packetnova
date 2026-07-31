import { describe, expect, it } from 'vitest'
import { calculateVlan } from './vlan'

describe('calculateVlan', () => {
  it('VLAN 0 is reserved', () => {
    const result = calculateVlan(0)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.category).toBe('Reserved')
    expect(result.result.hex).toBe('0x000')
  })

  it('VLAN 4095 is reserved', () => {
    const result = calculateVlan(4095)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.category).toBe('Reserved')
    expect(result.result.hex).toBe('0xfff')
  })

  it('VLAN 1 is normal range with a default-VLAN note', () => {
    const result = calculateVlan(1)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.category).toBe('Normal range')
    expect(result.result.note).toContain('Default VLAN')
  })

  it('VLAN 1003 is normal range with a legacy-reserved note', () => {
    const result = calculateVlan(1003)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.category).toBe('Normal range')
    expect(result.result.note).toContain('Token Ring')
  })

  it('VLAN 100 is a plain normal-range VLAN with no note', () => {
    const result = calculateVlan(100)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.category).toBe('Normal range')
    expect(result.result.note).toBeNull()
    expect(result.result.hex).toBe('0x064')
  })

  it('VLAN 2000 is extended range', () => {
    const result = calculateVlan(2000)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.category).toBe('Extended range')
  })

  it('rejects VLAN IDs outside 0-4095', () => {
    expect(calculateVlan(4096).ok).toBe(false)
    expect(calculateVlan(-1).ok).toBe(false)
  })

  it('rejects non-integer VLAN IDs', () => {
    expect(calculateVlan(1.5).ok).toBe(false)
  })
})
