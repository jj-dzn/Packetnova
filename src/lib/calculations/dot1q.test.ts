import { describe, expect, it } from 'vitest'
import { calculateDot1qTag } from './dot1q'

describe('calculateDot1qTag', () => {
  it('PCP 0, DEI 0, VLAN 100 (hand-verified: TCI = 0x0064)', () => {
    const result = calculateDot1qTag(0, 0, 100)
    expect(result).toEqual({
      ok: true,
      result: { pcp: 0, dei: 0, vlanId: 100, tci: 100, tciHex: '0064', fullTagHex: '81000064' },
    })
  })

  it('PCP 5, DEI 1, VLAN 200 (hand-verified: TCI = 0xB0C8)', () => {
    // 5 << 13 = 0xA000, 1 << 12 = 0x1000, 200 = 0xC8.
    // 0xA000 + 0x1000 + 0xC8 = 0xB0C8 = 45256.
    const result = calculateDot1qTag(5, 1, 200)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.tci).toBe(45256)
    expect(result.result.tciHex).toBe('b0c8')
    expect(result.result.fullTagHex).toBe('8100b0c8')
  })

  it('max PCP, DEI, and VLAN all set', () => {
    const result = calculateDot1qTag(7, 1, 4095)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    // 7<<13 | 1<<12 | 4095 = 0xE000 | 0x1000 | 0xFFF = 0xFFFF
    expect(result.result.tci).toBe(0xffff)
    expect(result.result.tciHex).toBe('ffff')
  })

  it('rejects PCP outside 0-7', () => {
    expect(calculateDot1qTag(8, 0, 1).ok).toBe(false)
    expect(calculateDot1qTag(-1, 0, 1).ok).toBe(false)
  })

  it('rejects a DEI that is not 0 or 1', () => {
    expect(calculateDot1qTag(0, 2, 1).ok).toBe(false)
  })

  it('rejects a VLAN ID outside 0-4095', () => {
    expect(calculateDot1qTag(0, 0, 4096).ok).toBe(false)
  })
})
