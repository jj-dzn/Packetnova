import { describe, expect, it } from 'vitest'
import { computeHash, verifyHash } from './hash'

function toBuffer(text: string): ArrayBuffer {
  return new TextEncoder().encode(text).buffer as ArrayBuffer
}

describe('computeHash', () => {
  it('MD5 of an empty string is the canonical d41d8cd98f00b204e9800998ecf8427e', async () => {
    expect(await computeHash(toBuffer(''), 'MD5')).toBe('d41d8cd98f00b204e9800998ecf8427e')
  })

  it('MD5 of "abc" is the canonical 900150983cd24fb0d6963f7d28e17f72', async () => {
    expect(await computeHash(toBuffer('abc'), 'MD5')).toBe('900150983cd24fb0d6963f7d28e17f72')
  })

  it('SHA-1 of an empty string is the canonical da39a3ee5e6b4b0d3255bfef95601890afd80709', async () => {
    expect(await computeHash(toBuffer(''), 'SHA-1')).toBe(
      'da39a3ee5e6b4b0d3255bfef95601890afd80709',
    )
  })

  it('SHA-256 of an empty string is the canonical e3b0c44298fc1c14...', async () => {
    expect(await computeHash(toBuffer(''), 'SHA-256')).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    )
  })

  it('SHA-256 of "abc" matches the standard NIST test vector', async () => {
    expect(await computeHash(toBuffer('abc'), 'SHA-256')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    )
  })
})

describe('verifyHash', () => {
  it('matches regardless of case in the expected hash', async () => {
    const result = await verifyHash(toBuffer('abc'), 'MD5', '900150983CD24FB0D6963F7D28E17F72')
    expect(result.matches).toBe(true)
  })

  it('matches with surrounding whitespace in the expected hash', async () => {
    const result = await verifyHash(toBuffer('abc'), 'MD5', '  900150983cd24fb0d6963f7d28e17f72  ')
    expect(result.matches).toBe(true)
  })

  it('reports a mismatch for the wrong hash', async () => {
    const result = await verifyHash(toBuffer('abc'), 'MD5', 'not-the-right-hash')
    expect(result.matches).toBe(false)
  })
})
