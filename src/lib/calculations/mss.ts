import type { CalculationResult } from './result'

export interface MssResult {
  mtu: number
  ipVersion: 4 | 6
  ipHeaderBytes: number
  tcpHeaderBytes: number
  mss: number
}

export function calculateMss(
  mtu: number,
  ipVersion: 4 | 6,
  ipOptionsBytes = 0,
  tcpOptionsBytes = 0,
): CalculationResult<MssResult> {
  if (!Number.isFinite(mtu) || mtu <= 0) {
    return { ok: false, error: 'Enter an MTU greater than 0.' }
  }
  if (!Number.isFinite(ipOptionsBytes) || ipOptionsBytes < 0) {
    return { ok: false, error: 'IP options size must be 0 or greater.' }
  }
  if (!Number.isFinite(tcpOptionsBytes) || tcpOptionsBytes < 0) {
    return { ok: false, error: 'TCP options size must be 0 or greater.' }
  }

  const ipHeaderBytes = (ipVersion === 4 ? 20 : 40) + ipOptionsBytes
  const tcpHeaderBytes = 20 + tcpOptionsBytes
  const mss = mtu - ipHeaderBytes - tcpHeaderBytes

  if (mss <= 0) {
    return {
      ok: false,
      error: 'IP and TCP headers are larger than the MTU -- no room for a segment.',
    }
  }

  return { ok: true, result: { mtu, ipVersion, ipHeaderBytes, tcpHeaderBytes, mss } }
}
