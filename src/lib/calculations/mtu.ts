import { computeEffectiveMtu } from './effectiveMtu'
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
  if (!Number.isFinite(payloadSize) || payloadSize < 0) {
    return { ok: false, error: 'Payload size must be 0 or greater.' }
  }

  const effective = computeEffectiveMtu(linkMtu, overheadBytes)
  if (!effective.ok) {
    if (effective.reason === 'link-mtu') {
      return { ok: false, error: 'Enter a link MTU greater than 0.' }
    }
    if (effective.reason === 'overhead') {
      return { ok: false, error: 'Overhead must be 0 or greater.' }
    }
    return {
      ok: false,
      error: 'Overhead is greater than or equal to the link MTU -- nothing fits.',
    }
  }
  const effectiveMtu = effective.effectiveMtu

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
