import { describe, expect, it } from 'vitest'
import { lookupMac } from './macLookup'

describe('lookupMac', () => {
  it("recognizes Cisco's verified OUI", () => {
    const result = lookupMac('00:00:0c:12:34:56')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.oui).toBe('00:00:0c')
    expect(result.result.nicSpecific).toBe('12:34:56')
    expect(result.result.vendor).toBe('Cisco Systems, Inc.')
  })

  it('returns null vendor for an OUI outside the small verified set', () => {
    const result = lookupMac('11:22:33:44:55:66')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.vendor).toBeNull()
  })

  it('the IPv4 multicast MAC prefix is correctly flagged as multicast', () => {
    const result = lookupMac('01:00:5e:00:00:01')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.isMulticast).toBe(true)
  })

  it('a locally-administered address (02:...) is correctly flagged', () => {
    const result = lookupMac('02:00:00:00:00:01')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.isMulticast).toBe(false)
    expect(result.result.isLocallyAdministered).toBe(true)
  })

  it('rejects invalid input', () => {
    expect(lookupMac('not-a-mac').ok).toBe(false)
  })
})
