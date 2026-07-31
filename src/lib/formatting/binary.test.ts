import { describe, expect, it } from 'vitest'
import { ipv4ToBinaryOctets } from './binary'

describe('ipv4ToBinaryOctets', () => {
  it('renders 192.168.1.1 correctly', () => {
    // 192.168.1.1 -> 3232235777
    expect(ipv4ToBinaryOctets(3232235777)).toEqual(['11000000', '10101000', '00000001', '00000001'])
  })

  it('renders 0.0.0.0 as all zero bits', () => {
    expect(ipv4ToBinaryOctets(0)).toEqual(['00000000', '00000000', '00000000', '00000000'])
  })

  it('renders 255.255.255.255 as all one bits', () => {
    expect(ipv4ToBinaryOctets(0xffffffff)).toEqual(['11111111', '11111111', '11111111', '11111111'])
  })
})
