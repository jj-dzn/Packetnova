import type { CalculationResult } from './result'

export interface MtuResult {
  linkMtu: number
  overheadBytes: number
  effectiveMtu: number
  payloadSize: number
  fits: boolean
  excessBytes: number
}

export function calculateMtu(
  linkMtu: number,
  overheadBytes: number,
  payloadSize: number,
): CalculationResult<MtuResult> {
  if (!Number.isFinite(linkMtu) || linkMtu <= 0) {
    return { ok: false, error: 'Enter a link MTU greater than 0.' }
  }
  if (!Number.isFinite(overheadBytes) || overheadBytes < 0) {
    return { ok: false, error: 'Overhead must be 0 or greater.' }
  }
  if (!Number.isFinite(payloadSize) || payloadSize < 0) {
    return { ok: false, error: 'Payload size must be 0 or greater.' }
  }

  const effectiveMtu = linkMtu - overheadBytes
  if (effectiveMtu <= 0) {
    return {
      ok: false,
      error: 'Overhead is greater than or equal to the link MTU -- nothing fits.',
    }
  }

  const fits = payloadSize <= effectiveMtu

  return {
    ok: true,
    result: {
      linkMtu,
      overheadBytes,
      effectiveMtu,
      payloadSize,
      fits,
      excessBytes: fits ? 0 : payloadSize - effectiveMtu,
    },
  }
}
