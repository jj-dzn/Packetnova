import { describe, expect, it } from 'vitest'
import { calculateIpRange } from './ipRange'

describe('calculateIpRange', () => {
  it('a range that is exactly one aligned /24 collapses to a single block', () => {
    const result = calculateIpRange('192.168.1.0', '192.168.1.255')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.totalAddresses).toBe(256)
    expect(result.result.cidrBlocks.map((b) => b.cidr)).toEqual(['192.168.1.0/24'])
  })

  it('a single address becomes a /32', () => {
    const result = calculateIpRange('10.0.0.5', '10.0.0.5')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.totalAddresses).toBe(1)
    expect(result.result.cidrBlocks.map((b) => b.cidr)).toEqual(['10.0.0.5/32'])
  })

  it('an unaligned range decomposes into the correct minimal block set', () => {
    // Hand-verified: 10 (/31, covers .10-.11), 12 (/30, covers .12-.15),
    // 16 (/30, covers .16-.19), 20 (/32, covers .20). 2+4+4+1 = 11 addresses,
    // matching the range size (20-10+1 = 11).
    const result = calculateIpRange('192.168.1.10', '192.168.1.20')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.totalAddresses).toBe(11)
    expect(result.result.cidrBlocks.map((b) => b.cidr)).toEqual([
      '192.168.1.10/31',
      '192.168.1.12/30',
      '192.168.1.16/30',
      '192.168.1.20/32',
    ])
  })

  it('the blocks always sum back to the exact total address count', () => {
    const result = calculateIpRange('172.16.5.37', '172.16.9.200')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const sum = result.result.cidrBlocks.reduce((total, b) => total + 2 ** (32 - b.prefixLength), 0)
    expect(sum).toBe(result.result.totalAddresses)
  })

  it('rejects an end address before the start address', () => {
    const result = calculateIpRange('192.168.1.20', '192.168.1.10')
    expect(result.ok).toBe(false)
  })

  it('rejects invalid IPs', () => {
    expect(calculateIpRange('not-an-ip', '192.168.1.10').ok).toBe(false)
    expect(calculateIpRange('192.168.1.10', 'not-an-ip').ok).toBe(false)
  })
})
