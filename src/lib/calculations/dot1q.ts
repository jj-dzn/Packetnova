import type { CalculationResult } from './result'

export interface Dot1qResult {
  pcp: number
  dei: number
  vlanId: number
  tci: number
  tciHex: string
  fullTagHex: string
}

const TPID_HEX = '8100'

// TCI (16 bits) = PCP (3 bits) | DEI (1 bit) | VLAN ID (12 bits).
export function calculateDot1qTag(
  pcp: number,
  dei: number,
  vlanId: number,
): CalculationResult<Dot1qResult> {
  if (!Number.isInteger(pcp) || pcp < 0 || pcp > 7) {
    return { ok: false, error: 'PCP must be a whole number between 0 and 7.' }
  }
  if (dei !== 0 && dei !== 1) {
    return { ok: false, error: 'DEI must be 0 or 1.' }
  }
  if (!Number.isInteger(vlanId) || vlanId < 0 || vlanId > 4095) {
    return { ok: false, error: 'VLAN ID must be a whole number between 0 and 4095.' }
  }

  const tci = (pcp << 13) | (dei << 12) | vlanId
  const tciHex = tci.toString(16).padStart(4, '0')

  return {
    ok: true,
    result: { pcp, dei, vlanId, tci, tciHex, fullTagHex: `${TPID_HEX}${tciHex}` },
  }
}
