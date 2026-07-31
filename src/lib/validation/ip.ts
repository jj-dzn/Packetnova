export interface ParsedIPv4 {
  octets: [number, number, number, number]
  value: number
}

export interface ParsedCIDR {
  ip: ParsedIPv4
  prefixLength: number
}

export interface HostRange {
  first: ParsedIPv4
  last: ParsedIPv4
}

const OCTET_PATTERN = /^(0|[1-9]\d{0,2})$/
const CIDR_PATTERN = /^(.+)\/(\d{1,2})$/

function octetsFromValue(value: number): [number, number, number, number] {
  return [24, 16, 8, 0].map((shift) => (value >>> shift) & 0xff) as [number, number, number, number]
}

export function parsedIPv4FromValue(value: number): ParsedIPv4 {
  const normalized = value >>> 0
  return { octets: octetsFromValue(normalized), value: normalized }
}

/**
 * Parses a dotted-decimal IPv4 address. Rejects octets with leading zeros
 * (e.g. "010") since some systems historically read those as octal --
 * ambiguous input is treated as invalid rather than guessed at.
 */
export function parseIPv4(input: string): ParsedIPv4 | null {
  const parts = input.trim().split('.')
  if (parts.length !== 4) return null

  const octets: number[] = []
  for (const part of parts) {
    if (!OCTET_PATTERN.test(part)) return null
    const octet = Number(part)
    if (octet > 255) return null
    octets.push(octet)
  }

  const [a, b, c, d] = octets as [number, number, number, number]
  const value = (a * 2 ** 24 + b * 2 ** 16 + c * 2 ** 8 + d) >>> 0
  return { octets: [a, b, c, d], value }
}

export function ipv4ToString(value: number): string {
  return octetsFromValue(value >>> 0).join('.')
}

export function parseCIDR(input: string): ParsedCIDR | null {
  const match = CIDR_PATTERN.exec(input.trim())
  if (!match) return null

  const [, ipPart, prefixPart] = match as unknown as [string, string, string]
  const prefixLength = Number(prefixPart)
  if (prefixLength < 0 || prefixLength > 32) return null

  const ip = parseIPv4(ipPart)
  if (!ip) return null

  return { ip, prefixLength }
}

export function prefixLengthToSubnetMask(prefixLength: number): ParsedIPv4 {
  const value = prefixLength === 0 ? 0 : (0xffffffff << (32 - prefixLength)) >>> 0
  return parsedIPv4FromValue(value)
}

export function subnetMaskToPrefixLength(mask: ParsedIPv4): number | null {
  let seenZero = false
  let prefixLength = 0
  for (let bit = 31; bit >= 0; bit--) {
    const isSet = ((mask.value >>> bit) & 1) === 1
    if (isSet) {
      if (seenZero) return null
      prefixLength++
    } else {
      seenZero = true
    }
  }
  return prefixLength
}

export function networkAddress(ip: ParsedIPv4, prefixLength: number): ParsedIPv4 {
  const mask = prefixLengthToSubnetMask(prefixLength)
  return parsedIPv4FromValue(ip.value & mask.value)
}

export function broadcastAddress(ip: ParsedIPv4, prefixLength: number): ParsedIPv4 {
  const mask = prefixLengthToSubnetMask(prefixLength)
  const wildcard = ~mask.value >>> 0
  return parsedIPv4FromValue(ip.value | wildcard)
}

export function totalAddresses(prefixLength: number): number {
  return 2 ** (32 - prefixLength)
}

export function usableHostCount(prefixLength: number): number {
  if (prefixLength === 32) return 1
  if (prefixLength === 31) return 2
  return 2 ** (32 - prefixLength) - 2
}

/**
 * Returns the usable host range for a network, or null for a /32 (single
 * host, no range). /31 is treated per RFC 3021 -- both addresses in the
 * pair are usable point-to-point endpoints, with no network/broadcast
 * distinction.
 */
export function usableHostRange(ip: ParsedIPv4, prefixLength: number): HostRange | null {
  if (prefixLength === 32) return null

  const network = networkAddress(ip, prefixLength)
  const broadcast = broadcastAddress(ip, prefixLength)

  if (prefixLength === 31) {
    return { first: network, last: broadcast }
  }

  return {
    first: parsedIPv4FromValue(network.value + 1),
    last: parsedIPv4FromValue(broadcast.value - 1),
  }
}
