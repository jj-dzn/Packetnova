import { parseCIDR, parseIPv4 } from '../validation/ip'

export interface DetectedIntent {
  label: string
  href: string
}

const MAC_PATTERN = /^([0-9a-f]{2}[:-]){5}[0-9a-f]{2}$/i
// Not a strict JWT spec check -- just precise enough to route confidently.
// Every real JWT header starts with `{"`, which base64-encodes to "eyJ",
// so this catches the overwhelming majority of real tokens without
// false-positiving on arbitrary dotted strings.
const JWT_PATTERN = /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*$/

// A lightweight shape classifier, not a full parser -- paste something
// that looks like a CIDR block, a bare IP, a MAC address, or a JWT into
// the command palette and jump straight to the right tool, pre-filled,
// instead of making someone search for "cidr calculator" by name first.
export function detectIntent(rawQuery: string): DetectedIntent | null {
  const query = rawQuery.trim()
  if (!query) return null

  if (parseCIDR(query)) {
    return {
      label: `Open ${query} in the CIDR calculator`,
      href: `/tools/cidr-calculator?cidr=${encodeURIComponent(query)}`,
    }
  }

  if (parseIPv4(query)) {
    return {
      label: `Open ${query} in the CIDR calculator`,
      href: `/tools/cidr-calculator?cidr=${encodeURIComponent(`${query}/32`)}`,
    }
  }

  if (MAC_PATTERN.test(query)) {
    return {
      label: `Look up ${query} in the MAC address lookup`,
      href: `/tools/mac-address-lookup?mac=${encodeURIComponent(query)}`,
    }
  }

  if (JWT_PATTERN.test(query)) {
    return {
      label: 'Decode this JWT',
      href: `/tools/jwt-decoder?token=${encodeURIComponent(query)}`,
    }
  }

  return null
}
