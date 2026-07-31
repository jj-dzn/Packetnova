import { compress, parseGroups } from './ipv6'
import type { CalculationResult } from './result'

export interface Ipv6SubnetResult {
  baseCidr: string
  newPrefixLength: number
  subnetCount: string
  firstSubnets: string[]
  lastSubnets: string[]
  truncated: boolean
}

const PREVIEW_COUNT = 5

// IPv6 addresses are 128 bits -- well past what JS numbers can represent
// exactly, so subnet math here uses BigInt throughout instead of the
// bitwise tricks the IPv4 tools use (those fit safely in 32 bits).
function groupsToBigInt(values: number[]): bigint {
  let result = 0n
  for (const value of values) {
    result = (result << 16n) | BigInt(value)
  }
  return result
}

function bigIntToGroups(value: bigint): number[] {
  const groups: number[] = []
  let remaining = value
  for (let i = 0; i < 8; i++) {
    groups.unshift(Number(remaining & 0xffffn))
    remaining = remaining >> 16n
  }
  return groups
}

export function calculateIpv6Subnets(
  cidrInput: string,
  newPrefixLength: number,
): CalculationResult<Ipv6SubnetResult> {
  const trimmed = cidrInput.trim()
  const slashIndex = trimmed.indexOf('/')
  if (slashIndex === -1) {
    return { ok: false, error: 'Enter a base block with a prefix length, e.g. 2001:db8::/32.' }
  }

  const addressPart = trimmed.slice(0, slashIndex)
  const prefixPart = trimmed.slice(slashIndex + 1)
  if (!/^\d{1,3}$/.test(prefixPart)) {
    return { ok: false, error: 'Base prefix length must be a number between 0 and 128.' }
  }
  const basePrefixLength = Number(prefixPart)
  if (basePrefixLength > 128) {
    return { ok: false, error: 'Base prefix length must be between 0 and 128.' }
  }

  const values = parseGroups(addressPart)
  if (!values) {
    return { ok: false, error: `"${addressPart}" is not a valid IPv6 address.` }
  }

  if (!Number.isInteger(newPrefixLength) || newPrefixLength < 0 || newPrefixLength > 128) {
    return { ok: false, error: 'New prefix length must be a whole number between 0 and 128.' }
  }
  if (newPrefixLength <= basePrefixLength) {
    return {
      ok: false,
      error: `New prefix must be longer (more specific) than the base /${basePrefixLength}.`,
    }
  }

  const deltaBits = BigInt(newPrefixLength - basePrefixLength)
  if (deltaBits > 32n) {
    return {
      ok: false,
      error:
        'That split produces more subnets than can be usefully previewed -- choose a prefix closer to the base.',
    }
  }

  const subnetCount = 1n << deltaBits
  const subnetSizeBits = BigInt(128 - newPrefixLength)

  // Mask the input down to its network boundary, same as the IPv4 tools do.
  const baseValueRaw = groupsToBigInt(values)
  const hostMask = basePrefixLength === 128 ? 0n : (1n << BigInt(128 - basePrefixLength)) - 1n
  const baseValue = baseValueRaw & ~hostMask

  function subnetCidr(index: bigint): string {
    const subnetValue = baseValue + (index << subnetSizeBits)
    return `${compress(bigIntToGroups(subnetValue))}/${newPrefixLength}`
  }

  const previewCount = subnetCount < BigInt(PREVIEW_COUNT) ? Number(subnetCount) : PREVIEW_COUNT
  const firstSubnets: string[] = []
  for (let i = 0n; i < BigInt(previewCount); i++) {
    firstSubnets.push(subnetCidr(i))
  }

  const truncated = subnetCount > BigInt(PREVIEW_COUNT * 2)
  const lastSubnets: string[] = []
  if (truncated) {
    for (let i = subnetCount - BigInt(PREVIEW_COUNT); i < subnetCount; i++) {
      lastSubnets.push(subnetCidr(i))
    }
  } else if (subnetCount > BigInt(previewCount)) {
    for (let i = BigInt(previewCount); i < subnetCount; i++) {
      lastSubnets.push(subnetCidr(i))
    }
  }

  return {
    ok: true,
    result: {
      baseCidr: `${compress(bigIntToGroups(baseValue))}/${basePrefixLength}`,
      newPrefixLength,
      subnetCount: subnetCount.toLocaleString(),
      firstSubnets,
      lastSubnets,
      truncated,
    },
  }
}
