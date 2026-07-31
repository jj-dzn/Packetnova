import type { CalculationResult } from './result'

// Goes through UTF-8 bytes explicitly rather than calling btoa(text)
// directly -- btoa only handles Latin1 correctly, so raw text containing
// non-ASCII characters (accents, emoji, etc.) would throw or corrupt.
export function base64Encode(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

export function base64Decode(input: string): CalculationResult<string> {
  try {
    const binary = atob(input)
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    return { ok: true, result: new TextDecoder('utf-8', { fatal: true }).decode(bytes) }
  } catch {
    return { ok: false, error: 'Not valid Base64.' }
  }
}
