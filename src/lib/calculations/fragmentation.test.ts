import { describe, expect, it } from 'vitest'
import { calculateFragmentation } from './fragmentation'

describe('calculateFragmentation', () => {
  it('a packet that fits the path MTU needs no fragmentation', () => {
    const result = calculateFragmentation(1500, 1500)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.needsFragmentation).toBe(false)
    expect(result.result.fragments).toHaveLength(1)
    expect(result.result.fragments[0]).toEqual({
      index: 1,
      payloadBytes: 1480,
      totalBytes: 1500,
      offsetBytes: 0,
      offsetUnits: 0,
      moreFragments: false,
    })
  })

  it('a 4000-byte packet over a 1500 path MTU splits into three fragments', () => {
    // Hand-verified: payload = 3980 bytes. Max fragment payload at MTU 1500
    // is floor((1500-20)/8)*8 = 1480 (evenly divisible). Two fragments of
    // 1480 (2960 total) leave 3980-2960 = 1020 for the last fragment.
    const result = calculateFragmentation(4000, 1500)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.needsFragmentation).toBe(true)
    expect(result.result.fragments).toEqual([
      {
        index: 1,
        payloadBytes: 1480,
        totalBytes: 1500,
        offsetBytes: 0,
        offsetUnits: 0,
        moreFragments: true,
      },
      {
        index: 2,
        payloadBytes: 1480,
        totalBytes: 1500,
        offsetBytes: 1480,
        offsetUnits: 185,
        moreFragments: true,
      },
      {
        index: 3,
        payloadBytes: 1020,
        totalBytes: 1040,
        offsetBytes: 2960,
        offsetUnits: 370,
        moreFragments: false,
      },
    ])
  })

  it('every fragment payload except the last is a multiple of 8 bytes', () => {
    const result = calculateFragmentation(5000, 1400)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const { fragments } = result.result
    for (const fragment of fragments.slice(0, -1)) {
      expect(fragment.payloadBytes % 8).toBe(0)
    }
  })

  it('fragment payloads always sum back to the total payload', () => {
    const result = calculateFragmentation(9000, 1500)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const sum = result.result.fragments.reduce((total, f) => total + f.payloadBytes, 0)
    expect(sum).toBe(9000 - 20)
  })

  it('only the last fragment has moreFragments: false', () => {
    const result = calculateFragmentation(9000, 1500)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const { fragments } = result.result
    fragments.forEach((f, i) => {
      expect(f.moreFragments).toBe(i < fragments.length - 1)
    })
  })

  it('rejects a packet or path MTU not larger than the IP header', () => {
    expect(calculateFragmentation(20, 1500).ok).toBe(false)
    expect(calculateFragmentation(1500, 20).ok).toBe(false)
  })

  it('accepts the largest possible IPv4 packet (65535 bytes)', () => {
    const result = calculateFragmentation(65_535, 1500)
    expect(result.ok).toBe(true)
  })

  it('rejects a packet size over the IPv4 16-bit Total Length limit', () => {
    expect(calculateFragmentation(65_536, 1500).ok).toBe(false)
  })

  it('rejects a path MTU over the IPv4 16-bit Total Length limit', () => {
    expect(calculateFragmentation(9000, 70_000).ok).toBe(false)
  })

  it('rejects a pathological packet size instead of hanging on billions of fragments', () => {
    // Regression test: previously unbounded, a huge packet size with a tiny
    // MTU produced billions of fragments and hung the browser tab.
    const result = calculateFragmentation(999_999_999_999, 21)
    expect(result.ok).toBe(false)
  })
})
