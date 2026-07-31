import type { CalculationResult } from './result'

export interface TunnelOverheadResult {
  linkMtu: number
  overheadBytes: number
  effectiveMtu: number
  overheadPercent: number
}

export function calculateTunnelOverhead(
  linkMtu: number,
  overheadBytes: number,
): CalculationResult<TunnelOverheadResult> {
  if (!Number.isFinite(linkMtu) || linkMtu <= 0) {
    return { ok: false, error: 'Enter a link MTU greater than 0.' }
  }
  if (!Number.isFinite(overheadBytes) || overheadBytes < 0) {
    return { ok: false, error: 'Overhead must be 0 or greater.' }
  }

  const effectiveMtu = linkMtu - overheadBytes
  if (effectiveMtu <= 0) {
    return { ok: false, error: 'Overhead is greater than or equal to the link MTU.' }
  }

  return {
    ok: true,
    result: {
      linkMtu,
      overheadBytes,
      effectiveMtu,
      overheadPercent: (overheadBytes / linkMtu) * 100,
    },
  }
}
