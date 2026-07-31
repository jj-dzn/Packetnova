import type { CalculationResult } from './result'

export interface IPv6Result {
  expanded: string
  compressed: string
  prefixLength: number | null
  addressType: string
}

function splitGroups(part: string): string[] {
  return part === '' ? [] : part.split(':')
}

export function parseGroups(addressPart: string): number[] | null {
  const doubleColonCount = (addressPart.match(/::/g) ?? []).length
  if (doubleColonCount > 1) return null

  let groupStrings: string[]
  if (doubleColonCount === 1) {
    const sides = addressPart.split('::')
    if (sides.length !== 2) return null
    const [left, right] = sides as [string, string]
    const leftGroups = splitGroups(left)
    const rightGroups = splitGroups(right)
    const explicitCount = leftGroups.length + rightGroups.length
    // "::" must stand in for at least one elided group.
    if (explicitCount > 7) return null
    const missing = 8 - explicitCount
    groupStrings = [...leftGroups, ...Array<string>(missing).fill('0'), ...rightGroups]
  } else {
    groupStrings = splitGroups(addressPart)
  }

  if (groupStrings.length !== 8) return null

  const values: number[] = []
  for (const group of groupStrings) {
    if (!/^[0-9a-fA-F]{1,4}$/.test(group)) return null
    values.push(parseInt(group, 16))
  }
  return values
}

function expand(values: number[]): string {
  return values.map((v) => v.toString(16).padStart(4, '0')).join(':')
}

export function compress(values: number[]): string {
  const hexGroups = values.map((v) => v.toString(16))

  let bestStart = -1
  let bestLen = 0
  let curStart = -1
  let curLen = 0
  for (let i = 0; i < values.length; i++) {
    if (values[i] === 0) {
      if (curStart === -1) curStart = i
      curLen++
      if (curLen > bestLen) {
        bestLen = curLen
        bestStart = curStart
      }
    } else {
      curStart = -1
      curLen = 0
    }
  }

  if (bestLen < 2) return hexGroups.join(':')

  const before = hexGroups.slice(0, bestStart).join(':')
  const after = hexGroups.slice(bestStart + bestLen).join(':')
  return `${before}::${after}`
}

function classify(values: number[]): string {
  const first = values[0] ?? 0
  const second = values[1] ?? 0

  if (values.every((v) => v === 0)) return 'Unspecified address (::)'
  if (values.slice(0, 7).every((v) => v === 0) && values[7] === 1) return 'Loopback address (::1)'
  if ((first & 0xffc0) === 0xfe80) return 'Link-local unicast'
  if ((first & 0xfe00) === 0xfc00) return 'Unique local address (ULA)'
  if ((first & 0xff00) === 0xff00) return 'Multicast'
  if (first === 0x2001 && second === 0x0db8) return 'Documentation address (RFC 3849)'
  if (values.slice(0, 5).every((v) => v === 0) && values[5] === 0xffff) return 'IPv4-mapped address'
  if ((first & 0xe000) === 0x2000) return 'Global unicast'
  return 'Other / reserved'
}

export function analyzeIPv6(input: string): CalculationResult<IPv6Result> {
  const trimmed = input.trim()
  if (!trimmed) {
    return { ok: false, error: 'Enter an IPv6 address, e.g. 2001:db8::1 or 2001:db8::/32.' }
  }

  let addressPart = trimmed
  let prefixLength: number | null = null

  const slashIndex = trimmed.indexOf('/')
  if (slashIndex !== -1) {
    addressPart = trimmed.slice(0, slashIndex)
    const prefixPart = trimmed.slice(slashIndex + 1)
    if (!/^\d{1,3}$/.test(prefixPart)) {
      return { ok: false, error: 'Prefix length must be a number between 0 and 128.' }
    }
    prefixLength = Number(prefixPart)
    if (prefixLength > 128) {
      return { ok: false, error: 'Prefix length must be between 0 and 128.' }
    }
  }

  if (!addressPart) {
    return { ok: false, error: 'Enter an IPv6 address, e.g. 2001:db8::1 or 2001:db8::/32.' }
  }

  const values = parseGroups(addressPart)
  if (!values) {
    return { ok: false, error: `"${addressPart}" is not a valid IPv6 address.` }
  }

  return {
    ok: true,
    result: {
      expanded: expand(values),
      compressed: compress(values),
      prefixLength,
      addressType: classify(values),
    },
  }
}
