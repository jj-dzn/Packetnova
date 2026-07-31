import type { CalculationResult } from './result'

export interface AsciiEntry {
  char: string
  code: number
  hex: string
  binary: string
}

export function textToAscii(text: string): CalculationResult<AsciiEntry[]> {
  if (!text) return { ok: false, error: 'Enter some text.' }
  const entries = Array.from(text).map((char) => {
    const code = char.codePointAt(0)!
    return {
      char,
      code,
      hex: code.toString(16).padStart(2, '0'),
      binary: code.toString(2).padStart(8, '0'),
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
