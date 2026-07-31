import {
  broadcastAddress,
  ipv4ToString,
  networkAddress,
  parseCIDR,
  prefixLengthToSubnetMask,
  totalAddresses,
  usableHostCount,
  usableHostRange,
} from '../validation/ip'
import { classifyIPv4, type IPv4Classification } from './ipClassify'
import type { CalculationResult } from './result'

export interface CidrResult {
  ip: string
  ipValue: number
  prefixLength: number
  subnetMask: string
  wildcardMask: string
  networkAddress: string
  broadcastAddress: string
  firstUsable: string | null
  lastUsable: string | null
  totalAddresses: number
  usableHosts: number
  classification: IPv4Classification
}

export function calculateCidr(input: string): CalculationResult<CidrResult> {
  const parsed = parseCIDR(input)
  if (!parsed) {
    return { ok: false, error: 'Enter a valid CIDR block, e.g. 192.168.1.0/24.' }
  }

  const { ip, prefixLength } = parsed
  const mask = prefixLengthToSubnetMask(prefixLength)
  const wildcard = ~mask.value >>> 0
  const network = networkAddress(ip, prefixLength)
  const broadcast = broadcastAddress(ip, prefixLength)
  const range = usableHostRange(ip, prefixLength)

  return {
    ok: true,
    result: {
      ip: ipv4ToString(ip.value),
      ipValue: ip.value,
      prefixLength,
      subnetMask: ipv4ToString(mask.value),
      wildcardMask: ipv4ToString(wildcard),
      networkAddress: ipv4ToString(network.value),
      broadcastAddress: ipv4ToString(broadcast.value),
      firstUsable: range ? ipv4ToString(range.first.value) : null,
      lastUsable: range ? ipv4ToString(range.last.value) : null,
      totalAddresses: totalAddresses(prefixLength),
      usableHosts: usableHostCount(prefixLength),
      classification: classifyIPv4(ip.value),
    },
  }
}
