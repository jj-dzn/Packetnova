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

  // value % charset.length is biased low whenever 2^32 isn't an exact
  // multiple of charset.length (true for nearly every real charset size),
  // so the low end of the charset would get drawn marginally more often
  // than the high end. Rejecting any draw at or past the largest multiple
  // of charset.length that fits in a uint32 makes every character equally
  // likely, at the cost of occasionally throwing a draw away and trying
  // again.
  const charsetSize = charset.length
  const rejectionThreshold = Math.floor(0x100000000 / charsetSize) * charsetSize

  const chars: string[] = []
  const buffer = new Uint32Array(64)
  let bufferIndex = buffer.length
  while (chars.length < options.length) {
    if (bufferIndex >= buffer.length) {
      crypto.getRandomValues(buffer)
      bufferIndex = 0
    }
    const value = buffer[bufferIndex++]!
    if (value >= rejectionThreshold) continue
    chars.push(charset[value % charsetSize]!)
  }

  return { ok: true, result: chars.join('') }
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

// Largest-to-smallest so the first threshold cleared wins -- 1e33 down to
// 1e3, using the standard short-scale names (short-scale trillion =
// 10^12, matching how "trillion" is normally used in English, not the
// long-scale one some other languages use for the same word).
const YEAR_MAGNITUDES: [number, string][] = [
  [1e33, 'decillion'],
  [1e30, 'nonillion'],
  [1e27, 'octillion'],
  [1e24, 'septillion'],
  [1e21, 'sextillion'],
  [1e18, 'quintillion'],
  [1e15, 'quadrillion'],
  [1e12, 'trillion'],
  [1e9, 'billion'],
  [1e6, 'million'],
  [1e3, 'thousand'],
]

function formatDuration(seconds: number): string {
  if (seconds < 1) return 'under a second'
  if (seconds < 60) return `~${Math.round(seconds)} second${Math.round(seconds) === 1 ? '' : 's'}`
  const minutes = seconds / 60
  if (minutes < 60) return `~${Math.round(minutes)} minute${Math.round(minutes) === 1 ? '' : 's'}`
  const hours = minutes / 60
  if (hours < 24) return `~${Math.round(hours)} hour${Math.round(hours) === 1 ? '' : 's'}`
  const days = hours / 24
  if (days < 365.25) return `~${Math.round(days)} day${Math.round(days) === 1 ? '' : 's'}`

  const years = days / 365.25
  for (const [threshold, name] of YEAR_MAGNITUDES) {
    if (years >= threshold) return `~${(years / threshold).toFixed(1)} ${name} years`
  }
  return `~${Math.round(years).toLocaleString()} years`
}

export interface CrackTimeEstimate {
  guessesPerSecond: number
  seconds: number
  humanReadable: string
}

// A realistic offline-attack rate against a fast, unsalted hash -- not a
// worst-case ceiling (specialized hardware can go much faster) or a
// best-case floor (a properly slow password hash like bcrypt/Argon2 would
// be orders of magnitude slower), just a representative middle point for
// giving the entropy number a concrete, felt meaning.
export const DEFAULT_GUESSES_PER_SECOND = 1_000_000_000

/**
 * Average-case brute-force crack time: half the keyspace, since on average
 * an attacker finds the right password halfway through an exhaustive
 * search, not at the very end of it.
 */
export function estimateCrackTime(
  entropyBits: number,
  guessesPerSecond: number = DEFAULT_GUESSES_PER_SECOND,
): CrackTimeEstimate {
  const keyspace = Math.pow(2, Math.max(entropyBits, 0))
  const seconds = keyspace / 2 / guessesPerSecond
  return { guessesPerSecond, seconds, humanReadable: formatDuration(seconds) }
}
