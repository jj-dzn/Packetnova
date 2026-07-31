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
  networkAddress: string
  broadcastAddress: string
}

export function calculateBroadcast(input: string): CalculationResult<BroadcastResult> {
  const parsed = parseCIDR(input)
  if (!parsed) {
    return { ok: false, error: 'Enter a valid IP and subnet, e.g. 192.168.1.10/24.' }
  }

  const { ip, prefixLength } = parsed
  const mask = prefixLengthToSubnetMask(prefixLength)

  return {
    ok: true,
    result: {
      ip: ipv4ToString(ip.value),
      prefixLength,
      subnetMask: ipv4ToString(mask.value),
      networkAddress: ipv4ToString(networkAddress(ip, prefixLength).value),
      broadcastAddress: ipv4ToString(broadcastAddress(ip, prefixLength).value),
    },
  }
}
