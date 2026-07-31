export interface ParsedMac {
  bytes: [number, number, number, number, number, number]
  value: number
}

export type MacFormat = 'colon' | 'hyphen' | 'dot'

const HEX_ONLY = /^[0-9a-fA-F]{12}$/

/**
 * Accepts colon-, hyphen-, or dot-separated (Cisco-style) MAC addresses, or
 * a bare 12-hex-digit string. Lenient on input separators, since the whole
 * point of a formatter is not to force one format on the way in.
 */
export function parseMac(input: string): ParsedMac | null {
  const stripped = input.trim().replace(/[:\-.]/g, '')
  if (!HEX_ONLY.test(stripped)) return null

  const bytes: number[] = []
  for (let i = 0; i < 12; i += 2) {
    bytes.push(parseInt(stripped.slice(i, i + 2), 16))
  }

  const value = bytes.reduce((acc, byte) => acc * 256 + byte, 0)

  return { bytes: bytes as ParsedMac['bytes'], value }
}

export function formatMac(bytes: readonly number[], format: MacFormat): string {
  const hex = bytes.map((byte) => byte.toString(16).padStart(2, '0'))
  if (format === 'colon') return hex.join(':')
  if (format === 'hyphen') return hex.join('-')

  const joined = hex.join('')
  return [joined.slice(0, 4), joined.slice(4, 8), joined.slice(8, 12)].join('.')
}

// Per IEEE 802: bit 0 of the first octet is the I/G bit (1 = multicast),
// bit 1 is the U/L bit (1 = locally administered).
export function isMulticast(firstByte: number): boolean {
  return (firstByte & 1) === 1
}

export function isLocallyAdministered(firstByte: number): boolean {
  return (firstByte & 2) === 2
}
