import type { CalculationResult } from './result'

export interface BandwidthResult {
  rawBandwidthMbps: number
  overheadBytes: number
  packetSizeBytes: number
  overheadFraction: number
  effectiveBandwidthMbps: number
}

export function calculateEffectiveBandwidth(
  rawBandwidthMbps: number,
  overheadBytes: number,
  packetSizeBytes: number,
): CalculationResult<BandwidthResult> {
  if (!Number.isFinite(rawBandwidthMbps) || rawBandwidthMbps <= 0) {
    return { ok: false, error: 'Bandwidth must be greater than 0.' }
  }
  if (!Number.isFinite(overheadBytes) || overheadBytes < 0) {
    return { ok: false, error: 'Overhead must be 0 or greater.' }
  }
  if (!Number.isFinite(packetSizeBytes) || packetSizeBytes <= 0) {
    return { ok: false, error: 'Packet size must be greater than 0.' }
  }
  if (overheadBytes >= packetSizeBytes) {
    return { ok: false, error: 'Overhead cannot be greater than or equal to the packet size.' }
  }

  const overheadFraction = overheadBytes / packetSizeBytes
  const effectiveBandwidthMbps = rawBandwidthMbps * (1 - overheadFraction)

  return {
    ok: true,
    result: {
      rawBandwidthMbps,
      overheadBytes,
      packetSizeBytes,
      overheadFraction,
      effectiveBandwidthMbps,
    },
  }
}
