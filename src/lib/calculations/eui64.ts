import { parseMac } from '../validation/mac'
import { compress, parseGroups } from './ipv6'
import type { CalculationResult } from './result'

export interface Eui64Result {
  interfaceId: string
  fullAddress: string
}

function toHexGroups(bytes: number[]): number[] {
  const groups: number[] = []
  for (let i = 0; i < bytes.length; i += 2) {
    groups.push((bytes[i]! << 8) | bytes[i + 1]!)
  }
  return groups
}

/**
 * Derives a SLAAC interface identifier (and full address) from a /64 prefix
 * and a MAC address, per the modified EUI-64 process: split the 48-bit MAC
 * in half, insert FFFE in the middle, and flip the universal/local bit of
 * the first byte. Requires exactly a /64 -- SLAAC's interface ID is always
 * the last 64 bits, so any other prefix length doesn't apply.
 */
export function calculateEui64(
  macInput: string,
  prefixInput: string,
): CalculationResult<Eui64Result> {
  const mac = parseMac(macInput)
  if (!mac) {
    return { ok: false, error: 'Enter a valid 48-bit MAC address, e.g. 00:1A:2B:3C:4D:5E.' }
  }

  const trimmed = prefixInput.trim()
  const slashIndex = trimmed.indexOf('/')
  if (slashIndex === -1) {
    return { ok: false, error: 'Enter a prefix with a length, e.g. 2001:db8::/64.' }
  }
  const addressPart = trimmed.slice(0, slashIndex)
  const prefixPart = trimmed.slice(slashIndex + 1)
  if (!/^\d{1,3}$/.test(prefixPart)) {
    return { ok: false, error: 'Prefix length must be a number between 0 and 128.' }
  }
  const prefixLength = Number(prefixPart)
  if (prefixLength !== 64) {
    return {
      ok: false,
      error:
        'EUI-64/SLAAC only applies to a /64 prefix -- the interface ID always occupies the last 64 bits.',
    }
  }

  const prefixValues = parseGroups(addressPart)
  if (!prefixValues) {
    return { ok: false, error: `"${addressPart}" is not a valid IPv6 prefix.` }
  }

  const [b0, b1, b2, b3, b4, b5] = mac.bytes
  const eui64Bytes = [b0 ^ 0x02, b1, b2, 0xff, 0xfe, b3, b4, b5]
  const interfaceGroups = toHexGroups(eui64Bytes)
  const interfaceId = interfaceGroups.map((g) => g.toString(16)).join(':')

  const fullGroups = [...prefixValues.slice(0, 4), ...interfaceGroups]

  return {
    ok: true,
    result: {
      interfaceId,
      fullAddress: `${compress(fullGroups)}/64`,
    },
  }
}
