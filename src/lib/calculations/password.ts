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

/**
 * Entropy of the option space in bits (length * log2(charset size)) --
 * deliberately independent of any specific generated password, so it can
 * update live as options change, before the user generates anything.
 */
export function calculatePasswordEntropyBits(options: PasswordOptions): number {
  const charsetSize =
    (options.uppercase ? CHARSETS.uppercase.length : 0) +
    (options.lowercase ? CHARSETS.lowercase.length : 0) +
    (options.digits ? CHARSETS.digits.length : 0) +
    (options.symbols ? CHARSETS.symbols.length : 0)

  if (charsetSize === 0 || options.length <= 0) return 0
  return options.length * Math.log2(charsetSize)
}
