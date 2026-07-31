import {
  broadcastAddress,
  ipv4ToString,
  networkAddress,
  parseCIDR,
  parsedIPv4FromValue,
  usableHostCount,
  usableHostRange,
} from '../validation/ip'
import type { CalculationResult } from './result'

export interface VlsmRequest {
  id: string
  label: string
  hostsNeeded: number
}

export interface VlsmAllocation {
  id: string
  label: string
  hostsNeeded: number
  cidr: string
  prefixLength: number
  networkAddress: string
  broadcastAddress: string
  firstUsable: string | null
  lastUsable: string | null
  usableHosts: number
}

export interface VlsmResult {
  baseCidr: string
  allocations: VlsmAllocation[]
  addressesUsed: number
  addressesAvailable: number
}

// Smallest block (largest prefix length) whose usable host count still
// covers what was asked for.
function prefixLengthForHosts(hostsNeeded: number): number {
  for (let prefixLength = 32; prefixLength >= 0; prefixLength--) {
    if (usableHostCount(prefixLength) >= hostsNeeded) return prefixLength
  }
  return 0
}

export function calculateVlsm(
  cidrInput: string,
  requests: VlsmRequest[],
): CalculationResult<VlsmResult> {
  const parsed = parseCIDR(cidrInput)
  if (!parsed) {
    return { ok: false, error: 'Enter a valid base CIDR block, e.g. 192.168.1.0/24.' }
  }

  if (requests.length === 0) {
    return { ok: false, error: 'Add at least one subnet request.' }
  }

  for (const request of requests) {
    if (!Number.isInteger(request.hostsNeeded) || request.hostsNeeded < 1) {
      return {
        ok: false,
        error: `"${request.label || 'Unnamed subnet'}" needs a whole number of hosts greater than 0.`,
      }
    }
  }

  const { ip, prefixLength: basePrefixLength } = parsed
  const baseNetwork = networkAddress(ip, basePrefixLength)
  const baseSize = 2 ** (32 - basePrefixLength)
  const baseEnd = baseNetwork.value + baseSize

  // VLSM best practice: allocate the largest blocks first to minimize
  // fragmentation, then reorder the results back to input order for display.
  const bySize = [...requests].sort((a, b) => b.hostsNeeded - a.hostsNeeded)

  let cursor = baseNetwork.value
  const allocationById = new Map<string, VlsmAllocation>()

  for (const request of bySize) {
    const subnetPrefixLength = prefixLengthForHosts(request.hostsNeeded)
    const subnetSize = 2 ** (32 - subnetPrefixLength)
    const alignedStart = Math.ceil(cursor / subnetSize) * subnetSize

    if (alignedStart + subnetSize > baseEnd) {
      return {
        ok: false,
        error: `${cidrInput} doesn't have room for all requested subnets -- ran out of space allocating "${request.label || `${request.hostsNeeded} hosts`}".`,
      }
    }

    const subnetIp = parsedIPv4FromValue(alignedStart)
    const broadcast = broadcastAddress(subnetIp, subnetPrefixLength)
    const range = usableHostRange(subnetIp, subnetPrefixLength)

    allocationById.set(request.id, {
      id: request.id,
      label: request.label,
      hostsNeeded: request.hostsNeeded,
      cidr: `${ipv4ToString(subnetIp.value)}/${subnetPrefixLength}`,
      prefixLength: subnetPrefixLength,
      networkAddress: ipv4ToString(subnetIp.value),
      broadcastAddress: ipv4ToString(broadcast.value),
      firstUsable: range ? ipv4ToString(range.first.value) : null,
      lastUsable: range ? ipv4ToString(range.last.value) : null,
      usableHosts: usableHostCount(subnetPrefixLength),
    })

    cursor = alignedStart + subnetSize
  }

  return {
    ok: true,
    result: {
      baseCidr: `${ipv4ToString(baseNetwork.value)}/${basePrefixLength}`,
      allocations: requests.map((request) => allocationById.get(request.id)!),
      addressesUsed: cursor - baseNetwork.value,
      addressesAvailable: baseSize,
    },
  }
}
