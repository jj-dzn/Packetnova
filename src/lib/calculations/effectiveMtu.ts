export type EffectiveMtuOutcome =
  { ok: true; effectiveMtu: number } | { ok: false; reason: 'link-mtu' | 'overhead' | 'exceeds' }

// Shared by the MTU calculator and the VPN tunnel overhead calculator --
// both derive effective MTU the same way (link MTU minus overhead) and
// both need to reject overhead that consumes the whole link. Each caller
// keeps its own error copy for the failure (worded for its own context),
// but the actual validation and arithmetic live here once, so a future
// correction to any of these checks doesn't have to be made twice.
export function computeEffectiveMtu(linkMtu: number, overheadBytes: number): EffectiveMtuOutcome {
  if (!Number.isFinite(linkMtu) || linkMtu <= 0) {
    return { ok: false, reason: 'link-mtu' }
  }
  if (!Number.isFinite(overheadBytes) || overheadBytes < 0) {
    return { ok: false, reason: 'overhead' }
  }
  const effectiveMtu = linkMtu - overheadBytes
  if (effectiveMtu <= 0) {
    return { ok: false, reason: 'exceeds' }
  }
  return { ok: true, effectiveMtu }
}
