import {
  broadcastAddress,
  ipv4ToString,
  networkAddress,
  parseCIDR,
  prefixLengthToSubnetMask,
} from '../validation/ip'
import type { CalculationResult } from './result'

export interface BroadcastResult {
  ip: string
  prefixLength: number
  subnetMask: string
  wildcardMask: string
  networkAddress: string
  broadcastAddress: string
  broadcastAddressValue: number
}

export function calculateBroadcast(input: string): CalculationResult<BroadcastResult> {
  const parsed = parseCIDR(input)
  if (!parsed) {
    return { ok: false, error: 'Enter a valid IP and subnet, e.g. 192.168.1.10/24.' }
  }

  const { ip, prefixLength } = parsed
  const mask = prefixLengthToSubnetMask(prefixLength)
  const wildcard = ~mask.value >>> 0
  const broadcast = broadcastAddress(ip, prefixLength)

  return {
    ok: true,
    result: {
      ip: ipv4ToString(ip.value),
      prefixLength,
      subnetMask: ipv4ToString(mask.value),
      wildcardMask: ipv4ToString(wildcard),
      networkAddress: ipv4ToString(networkAddress(ip, prefixLength).value),
      broadcastAddress: ipv4ToString(broadcast.value),
      broadcastAddressValue: broadcast.value,
    },
  }
}
