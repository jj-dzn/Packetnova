import type { CalculationResult } from './result'

export interface AsciiEntry {
  char: string
  code: number
  hex: string
  binary: string
  /** This character's UTF-8 encoding, as space-separated hex bytes -- one
   * byte for code points under 128, up to four for the higher end of
   * Unicode (most emoji). Distinct from `hex`/`binary` above, which are the
   * raw code point value, not its multi-byte wire representation. */
  utf8Bytes: string
}

const utf8Encoder = new TextEncoder()

export function textToAscii(text: string): CalculationResult<AsciiEntry[]> {
  if (!text) return { ok: false, error: 'Enter some text.' }
  const entries = Array.from(text).map((char) => {
    const code = char.codePointAt(0)!
    const utf8Bytes = Array.from(utf8Encoder.encode(char))
      .map((byte) => byte.toString(16).padStart(2, '0').toUpperCase())
      .join(' ')
    return {
      char,
      code,
      hex: code.toString(16).padStart(2, '0'),
      binary: code.toString(2).padStart(8, '0'),
      utf8Bytes,
    }
  })
  return { ok: true, result: entries }
}

export function asciiCodesToText(input: string): CalculationResult<string> {
  const parts = input.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0)
    return { ok: false, error: 'Enter one or more codes, separated by spaces.' }

  const codes: number[] = []
  for (const part of parts) {
    const code = Number(part)
    if (!Number.isInteger(code) || code < 0 || code > 0x10ffff) {
      return { ok: false, error: `"${part}" is not a valid character code.` }
    }
    codes.push(code)
  }

  return { ok: true, result: String.fromCodePoint(...codes) }
}
