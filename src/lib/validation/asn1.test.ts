import { describe, expect, it } from 'vitest'
import { readTlv, getChildren } from './asn1'

describe('readTlv', () => {
  it('parses a short-form length correctly', () => {
    // INTEGER (0x02), length 1, value 0x05.
    const node = readTlv(new Uint8Array([0x02, 0x01, 0x05]), 0)
    expect(node.tagNumber).toBe(2)
    expect(node.constructed).toBe(false)
    expect(node.contentStart).toBe(2)
    expect(node.contentEnd).toBe(3)
    expect(node.nextOffset).toBe(3)
  })

  it('parses a long-form length correctly', () => {
    // OCTET STRING (0x04), one length byte follows (0x81), length 5, then 5 bytes.
    const node = readTlv(new Uint8Array([0x04, 0x81, 0x05, 1, 2, 3, 4, 5]), 0)
    expect(node.tagNumber).toBe(4)
    expect(node.contentStart).toBe(3)
    expect(node.contentEnd).toBe(8)
    expect(node.nextOffset).toBe(8)
  })

  it('throws on a truncated tag byte (offset past the end of the buffer)', () => {
    expect(() => readTlv(new Uint8Array([]), 0)).toThrow(/tag/)
  })

  it('throws on a truncated length byte (tag present, nothing after it)', () => {
    expect(() => readTlv(new Uint8Array([0x02]), 0)).toThrow(/length/)
  })

  it('throws when a long-form length declares more bytes than the buffer has', () => {
    // 0x82 says "2 length bytes follow", but only 1 more byte exists.
    expect(() => readTlv(new Uint8Array([0x04, 0x82, 0x01]), 0)).toThrow(/long-form length/)
  })

  it('throws on a multi-byte tag number (low 5 bits all 1)', () => {
    expect(() => readTlv(new Uint8Array([0x1f, 0x00]), 0)).toThrow(/[Mm]ulti-byte tag/)
  })

  it('does not throw on an indefinite-length marker (0x80) -- treats it as zero-length', () => {
    // DER itself never uses indefinite length (that's a BER-only construct,
    // X.690 requires definite length for DER), so a conformant certificate
    // should never produce this. This just documents that malformed input
    // in this specific shape degrades to an empty node instead of crashing.
    const node = readTlv(new Uint8Array([0x30, 0x80]), 0)
    expect(node.contentStart).toBe(node.contentEnd)
  })
})

describe('getChildren', () => {
  it('returns an empty array for a zero-length content range', () => {
    // The real-world case this covers: a certificate whose extensions
    // SEQUENCE is present but empty.
    expect(getChildren(new Uint8Array([]), { contentStart: 0, contentEnd: 0 })).toEqual([])
  })

  it('walks sibling TLVs until contentEnd, not past it', () => {
    // Two INTEGERs back to back inside a 6-byte content range.
    const bytes = new Uint8Array([0x02, 0x01, 0x01, 0x02, 0x01, 0x02])
    const children = getChildren(bytes, { contentStart: 0, contentEnd: bytes.length })
    expect(children).toHaveLength(2)
    expect(children[0]!.contentStart).toBe(2)
    expect(children[1]!.contentStart).toBe(5)
  })
})
