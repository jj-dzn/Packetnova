import type { CalculationResult } from './result'

export interface EigrpMetricResult {
  bandwidthMbps: number
  delayMicroseconds: number
  metric: number
}

// Classic EIGRP composite metric with the default K-values (K1=K3=1,
// K2=K4=K5=0): metric = 256 * (10^7 / bandwidth_kbps + delay_in_tens_of_us).
// Cisco stores and sums delay in tens of microseconds internally, but takes
// microseconds as the human-facing unit (as does `show interface`'s "DLY"
// line), so this converts on the way in rather than asking for the
// internal unit directly.
export function calculateEigrpMetric(
  bandwidthMbps: number,
  delayMicroseconds: number,
): CalculationResult<EigrpMetricResult> {
  if (!Number.isFinite(bandwidthMbps) || bandwidthMbps <= 0) {
    return { ok: false, error: 'Bandwidth must be greater than 0.' }
  }
  if (!Number.isFinite(delayMicroseconds) || delayMicroseconds < 0) {
    return { ok: false, error: 'Delay must be 0 or greater.' }
  }

  const bandwidthKbps = bandwidthMbps * 1000
  const delayTensOfMicroseconds = delayMicroseconds / 10
  const metric = Math.floor(256 * (1e7 / bandwidthKbps + delayTensOfMicroseconds))

  return { ok: true, result: { bandwidthMbps, delayMicroseconds, metric } }
}
