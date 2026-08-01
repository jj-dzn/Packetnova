import { describe, expect, it } from 'vitest'
import { buildTcpHeader, calculateTcpFlags } from './tcpFlags'

const none = { urg: false, ack: false, psh: false, rst: false, syn: false, fin: false }

describe('calculateTcpFlags', () => {
  it('SYN alone is the canonical 0x02', () => {
    expect(calculateTcpFlags({ ...none, syn: true }).hex).toBe('0x02')
  })

  it('SYN+ACK is the canonical 0x12 (a TCP handshake classic)', () => {
    expect(calculateTcpFlags({ ...none, syn: true, ack: true }).hex).toBe('0x12')
  })

  it('ACK alone is 0x10', () => {
    expect(calculateTcpFlags({ ...none, ack: true }).hex).toBe('0x10')
  })

  it('FIN+ACK is 0x11', () => {
    expect(calculateTcpFlags({ ...none, fin: true, ack: true }).hex).toBe('0x11')
  })

  it('RST alone is 0x04', () => {
    expect(calculateTcpFlags({ ...none, rst: true }).hex).toBe('0x04')
  })

  it('all six flags set is 0x3f', () => {
    const all = { urg: true, ack: true, psh: true, rst: true, syn: true, fin: true }
    expect(calculateTcpFlags(all).value).toBe(63)
    expect(calculateTcpFlags(all).hex).toBe('0x3f')
  })

  it('no flags set is 0x00', () => {
    expect(calculateTcpFlags(none).hex).toBe('0x00')
  })
})

describe('buildTcpHeader', () => {
  const baseFields = {
    sourcePort: 80,
    destPort: 443,
    seqNumber: 100,
    ackNumber: 0,
    flags: { ...none, syn: true },
    windowSize: 65535,
    checksum: 0,
    urgentPointer: 0,
  }

  it('produces exactly 20 bytes (fixed 5-word header, no options)', () => {
    const result = buildTcpHeader(baseFields)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.bytes).toHaveLength(20)
    expect(result.result.hex).toHaveLength(40)
  })

  it('places source and destination port big-endian in the first 4 bytes', () => {
    const result = buildTcpHeader(baseFields)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.bytes.slice(0, 2)).toEqual([0x00, 0x50]) // 80
    expect(result.result.bytes.slice(2, 4)).toEqual([0x01, 0xbb]) // 443
  })

  it('places the sequence and ack numbers big-endian across 4 bytes each', () => {
    const result = buildTcpHeader({ ...baseFields, seqNumber: 0x01020304, ackNumber: 0xaabbccdd })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.bytes.slice(4, 8)).toEqual([0x01, 0x02, 0x03, 0x04])
    expect(result.result.bytes.slice(8, 12)).toEqual([0xaa, 0xbb, 0xcc, 0xdd])
  })

  it('encodes a fixed data offset of 5 (no options) with the flags byte right after', () => {
    const result = buildTcpHeader(baseFields)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.bytes[12]).toBe(0x50) // data offset 5 in the top nibble
    expect(result.result.bytes[13]).toBe(0x02) // SYN
  })

  it('places window, checksum, and urgent pointer in the final 6 bytes', () => {
    const result = buildTcpHeader({
      ...baseFields,
      windowSize: 0x1234,
      checksum: 0x5678,
      urgentPointer: 0x9abc,
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.bytes.slice(14, 16)).toEqual([0x12, 0x34])
    expect(result.result.bytes.slice(16, 18)).toEqual([0x56, 0x78])
    expect(result.result.bytes.slice(18, 20)).toEqual([0x9a, 0xbc])
  })

  it('rejects an out-of-range port', () => {
    expect(buildTcpHeader({ ...baseFields, sourcePort: 70000 }).ok).toBe(false)
  })

  it('rejects an out-of-range sequence number', () => {
    expect(buildTcpHeader({ ...baseFields, seqNumber: -1 }).ok).toBe(false)
    expect(buildTcpHeader({ ...baseFields, seqNumber: 2 ** 32 }).ok).toBe(false)
  })
})
