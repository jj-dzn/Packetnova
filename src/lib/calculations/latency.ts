import type { CalculationResult } from './result'

export interface LatencyResult {
  distanceKm: number
  propagationSpeedKmPerMs: number
  oneWayMs: number
  roundTripMs: number
}

// This is propagation delay only -- the time for a signal to physically
// traverse the distance. Real-world latency also includes processing,
// queuing, and serialization delay at every hop, so this is a theoretical
// minimum, not a measured round-trip time.
export function calculateLatency(
  distanceKm: number,
  propagationSpeedKmPerMs: number,
): CalculationResult<LatencyResult> {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) {
    return { ok: false, error: 'Distance must be 0 or greater.' }
  }
  if (!Number.isFinite(propagationSpeedKmPerMs) || propagationSpeedKmPerMs <= 0) {
    return { ok: false, error: 'Propagation speed must be greater than 0.' }
  }

  const oneWayMs = distanceKm / propagationSpeedKmPerMs

  return {
    ok: true,
    result: { distanceKm, propagationSpeedKmPerMs, oneWayMs, roundTripMs: oneWayMs * 2 },
  }
}
