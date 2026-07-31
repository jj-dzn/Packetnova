import {
  broadcastAddress,
  ipv4ToString,
  networkAddress,
  parseCIDR,
  parsedIPv4FromValue,
  prefixLengthToSubnetMask,
  usableHostCount,
  usableHostRange,
} from '../validation/ip'
import type { CalculationResult } from './result'

export interface SubnetInfo {
  cidr: string
  networkAddress: string
  broadcastAddress: string
  firstUsable: string | null
  lastUsable: string | null
}

export interface SubnetResult {
  baseCidr: string
  newPrefixLength: number
  subnetMask: string
  subnetCount: number
  hostsPerSubnet: number
  subnets: SubnetInfo[]
}

const MAX_SUBNETS = 256

export function calculateSubnets(
  cidrInput: string,
  newPrefixLength: number,
): CalculationResult<SubnetResult> {
  const parsed = parseCIDR(cidrInput)
  if (!parsed) {
    return { ok: false, error: 'Enter a valid CIDR block, e.g. 192.168.1.0/24.' }
  }

  const { ip, prefixLength } = parsed

  if (!Number.isInteger(newPrefixLength) || newPrefixLength < 0 || newPrefixLength > 32) {
    return { ok: false, error: 'New prefix length must be a whole number between 0 and 32.' }
  }

  if (newPrefixLength < prefixLength) {
    return {
      ok: false,
      error: `New prefix must be /${prefixLength} or longer (more specific) than the base network.`,
    }
  }

  const subnetCount = 2 ** (newPrefixLength - prefixLength)
  if (subnetCount > MAX_SUBNETS) {
    return {
      ok: false,
      error: `That split produces ${subnetCount.toLocaleString()} subnets -- choose a prefix closer to /${prefixLength} (max ${MAX_SUBNETS} shown at once).`,
    }
  }

  const baseNetwork = networkAddress(ip, prefixLength)
  const subnetSize = 2 ** (32 - newPrefixLength)

  const subnets: SubnetInfo[] = []
  for (let i = 0; i < subnetCount; i++) {
    const subnetIp = parsedIPv4FromValue(baseNetwork.value + i * subnetSize)
    const broadcast = broadcastAddress(subnetIp, newPrefixLength)
    const range = usableHostRange(subnetIp, newPrefixLength)
    subnets.push({
      cidr: `${ipv4ToString(subnetIp.value)}/${newPrefixLength}`,
      networkAddress: ipv4ToString(subnetIp.value),
      broadcastAddress: ipv4ToString(broadcast.value),
      firstUsable: range ? ipv4ToString(range.first.value) : null,
      lastUsable: range ? ipv4ToString(range.last.value) : null,
    })
  }

  return {
    ok: true,
    result: {
      baseCidr: `${ipv4ToString(baseNetwork.value)}/${prefixLength}`,
      newPrefixLength,
      subnetMask: ipv4ToString(prefixLengthToSubnetMask(newPrefixLength).value),
      subnetCount,
      hostsPerSubnet: usableHostCount(newPrefixLength),
      subnets,
    },
  }
}
