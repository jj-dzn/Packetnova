import type { CalculationResult } from './result'

export type VlanCategory = 'Reserved' | 'Normal range' | 'Extended range'

export interface VlanResult {
  vlanId: number
  hex: string
  category: VlanCategory
  note: string | null
}

export function calculateVlan(vlanId: number): CalculationResult<VlanResult> {
  if (!Number.isInteger(vlanId) || vlanId < 0 || vlanId > 4095) {
    return { ok: false, error: 'VLAN ID must be a whole number between 0 and 4095.' }
  }

  const hex = `0x${vlanId.toString(16).padStart(3, '0')}`

  let category: VlanCategory
  let note: string | null = null

  if (vlanId === 0) {
    category = 'Reserved'
    note = 'Reserved -- means "no VLAN" / priority-tagged frame only.'
  } else if (vlanId === 4095) {
    category = 'Reserved'
    note = 'Reserved for implementation use.'
  } else if (vlanId === 1) {
    category = 'Normal range'
    note =
      'Default VLAN on most switches -- often best practice to avoid using it for user traffic.'
  } else if (vlanId >= 1002 && vlanId <= 1005) {
    category = 'Normal range'
    note = 'Reserved for legacy Token Ring/FDDI on Cisco switches.'
  } else if (vlanId <= 1005) {
    category = 'Normal range'
  } else {
    category = 'Extended range'
  }

  return { ok: true, result: { vlanId, hex, category, note } }
}
