import { describe, expect, it } from 'vitest'
import { calculateVlsm, type VlsmRequest } from './vlsm'

function req(id: string, label: string, hostsNeeded: number): VlsmRequest {
  return { id, label, hostsNeeded }
}

describe('calculateVlsm', () => {
  it('allocates a standard mixed-size split without overlap, largest first', () => {
    const result = calculateVlsm('192.168.1.0/24', [
      req('1', 'Sales', 100),
      req('2', 'Engineering', 50),
      req('3', 'Guest', 20),
      req('4', 'Lab', 5),
    ])
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const [sales, engineering, guest, lab] = result.result.allocations

    expect(sales!.cidr).toBe('192.168.1.0/25')
    expect(sales!.usableHosts).toBe(126)

    expect(engineering!.cidr).toBe('192.168.1.128/26')
    expect(engineering!.usableHosts).toBe(62)

    expect(guest!.cidr).toBe('192.168.1.192/27')
    expect(guest!.usableHosts).toBe(30)

    expect(lab!.cidr).toBe('192.168.1.224/29')
    expect(lab!.usableHosts).toBe(6)
  })

  it('returns allocations in the original request order, not size order', () => {
    const result = calculateVlsm('10.0.0.0/24', [
      req('small', 'Small first', 5),
      req('big', 'Big second', 100),
    ])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.allocations.map((a) => a.id)).toEqual(['small', 'big'])
    // The big request is still allocated first internally (largest-first),
    // so it lands at the base of the block despite being listed second.
    expect(result.result.allocations[1]!.networkAddress).toBe('10.0.0.0')
  })

  it('uses a /31 for a 2-host point-to-point link per RFC 3021', () => {
    const result = calculateVlsm('10.0.0.0/30', [req('p2p', 'Point-to-point', 2)])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.allocations[0]!.cidr).toBe('10.0.0.0/31')
    expect(result.result.allocations[0]!.usableHosts).toBe(2)
  })

  it('errors when requests do not fit in the base block', () => {
    const result = calculateVlsm('192.168.1.0/29', [req('1', 'First', 4), req('2', 'Second', 4)])
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error).toContain("doesn't have room")
  })

  it('rejects a non-positive or non-integer host count', () => {
    expect(calculateVlsm('192.168.1.0/24', [req('1', 'Bad', 0)]).ok).toBe(false)
    expect(calculateVlsm('192.168.1.0/24', [req('1', 'Bad', -5)]).ok).toBe(false)
    expect(calculateVlsm('192.168.1.0/24', [req('1', 'Bad', 3.5)]).ok).toBe(false)
  })

  it('rejects an empty request list', () => {
    expect(calculateVlsm('192.168.1.0/24', []).ok).toBe(false)
  })

  it('rejects an invalid base CIDR', () => {
    expect(calculateVlsm('not-a-cidr', [req('1', 'X', 5)]).ok).toBe(false)
  })
})
