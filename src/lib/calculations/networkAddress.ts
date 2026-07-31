import { ipv4ToString, networkAddress, parseCIDR, prefixLengthToSubnetMask } from '../validation/ip'
import { classifyIPv4, type IPv4Classification } from './ipClassify'
import type { CalculationResult } from './result'

export interface NetworkAddressResult {
  ip: string
  prefixLength: number
  subnetMask: string
  networkAddress: string
  networkAddressValue: number
  classification: IPv4Classification
}

export function calculateNetworkAddress(input: string): CalculationResult<NetworkAddressResult> {
  const parsed = parseCIDR(input)
  if (!parsed) {
    return { ok: false, error: 'Enter a valid IP and subnet, e.g. 192.168.1.10/24.' }
  }

  const { ip, prefixLength } = parsed
  const mask = prefixLengthToSubnetMask(prefixLength)
  const network = networkAddress(ip, prefixLength)

  return {
    ok: true,
    result: {
      ip: ipv4ToString(ip.value),
      prefixLength,
      subnetMask: ipv4ToString(mask.value),
      networkAddress: ipv4ToString(network.value),
      networkAddressValue: network.value,
      classification: classifyIPv4(ip.value),
    },
  }
}
