import type { CalculationResult } from './result'

export interface PasswordOptions {
  length: number
  uppercase: boolean
  lowercase: boolean
  digits: boolean
  symbols: boolean
}

const CHARSETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{}',
}

// Uses crypto.getRandomValues (a CSPRNG), never Math.random -- a password
// generator with a non-cryptographic RNG would be a real security flaw, not
// just a style choice.
export function generatePassword(options: PasswordOptions): CalculationResult<string> {
  const charset = [
    options.uppercase ? CHARSETS.uppercase : '',
    options.lowercase ? CHARSETS.lowercase : '',
    options.digits ? CHARSETS.digits : '',
    options.symbols ? CHARSETS.symbols : '',
  ].join('')

  if (!charset) {
    return { ok: false, error: 'Select at least one character set.' }
  }
  if (!Number.isInteger(options.length) || options.length < 1 || options.length > 256) {
    return { ok: false, error: 'Length must be a whole number between 1 and 256.' }
  }

  const randomValues = new Uint32Array(options.length)
  crypto.getRandomValues(randomValues)
  const password = Array.from(randomValues, (value) => charset[value % charset.length]).join('')

  return { ok: true, result: password }
}
