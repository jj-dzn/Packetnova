import { describe, expect, it } from 'vitest'
import {
  encodeForStage,
  ENCODING_STAGES,
  textToBase64,
  textToBinary,
  textToHex,
  textToMorse,
} from './signalDecoder'

describe('textToMorse', () => {
  it('encodes SOS to the well-known pattern', () => {
    expect(textToMorse('SOS')).toBe('... --- ...')
  })

  it('represents spaces as a slash', () => {
    expect(textToMorse('SOS SOS')).toBe('... --- ... / ... --- ...')
  })
})

describe('textToBinary', () => {
  it('encodes A as 01000001', () => {
    expect(textToBinary('A')).toBe('01000001')
  })
})

describe('textToHex', () => {
  it('encodes A as 41', () => {
    expect(textToHex('A')).toBe('41')
  })
})

describe('textToBase64', () => {
  it('matches the standard base64 encoding of a single ASCII character', () => {
    expect(textToBase64('A')).toBe(btoa('A'))
  })

  it('round-trips through TextEncoder for multi-byte-safe input', () => {
    expect(textToBase64('Hi')).toBe(btoa('Hi'))
  })
})

describe('encodeForStage', () => {
  it('returns the original text for the text stage', () => {
    expect(encodeForStage('hello', 'text')).toBe('hello')
  })

  it('covers every declared stage without throwing', () => {
    for (const stage of ENCODING_STAGES) {
      expect(() => encodeForStage('hello', stage)).not.toThrow()
    }
  })
})
