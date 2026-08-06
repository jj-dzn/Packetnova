import { computeEffectiveMtu } from './effectiveMtu'
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
  const effective = computeEffectiveMtu(linkMtu, overheadBytes)
  if (!effective.ok) {
    if (effective.reason === 'link-mtu') {
      return { ok: false, error: 'Enter a link MTU greater than 0.' }
    }
    if (effective.reason === 'overhead') {
      return { ok: false, error: 'Overhead must be 0 or greater.' }
    }
    return { ok: false, error: 'Overhead is greater than or equal to the link MTU.' }
  }
  const effectiveMtu = effective.effectiveMtu

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
