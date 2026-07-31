import type { CalculationResult } from './result'

export interface TransferTimeResult {
  sizeMB: number
  bandwidthMbps: number
  seconds: number
}

// Decimal units throughout (1 MB = 1,000,000 bytes, matching how bandwidth
// is always marketed in decimal Mbps) so the byte/bit math stays exact --
// no binary-vs-decimal prefix ambiguity.
export function calculateTransferTime(
  sizeMB: number,
  bandwidthMbps: number,
): CalculationResult<TransferTimeResult> {
  if (!Number.isFinite(sizeMB) || sizeMB < 0) {
    return { ok: false, error: 'File size must be 0 or greater.' }
  }
  if (!Number.isFinite(bandwidthMbps) || bandwidthMbps <= 0) {
    return { ok: false, error: 'Bandwidth must be greater than 0.' }
  }

  const seconds = (sizeMB * 8) / bandwidthMbps

  return { ok: true, result: { sizeMB, bandwidthMbps, seconds } }
}
