import { describe, expect, it } from 'vitest'
import { calculateTcpFlags } from './tcpFlags'

const none = { urg: false, ack: false, psh: false, rst: false, syn: false, fin: false }

describe('calculateTcpFlags', () => {
  it('SYN alone is the canonical 0x02', () => {
    expect(calculateTcpFlags({ ...none, syn: true }).hex).toBe('0x02')
  })

  it('SYN+ACK is the canonical 0x12 (a TCP handshake classic)', () => {
    expect(calculateTcpFlags({ ...none, syn: true, ack: true }).hex).toBe('0x12')
  })

  it('ACK alone is 0x10', () => {
    expect(calculateTcpFlags({ ...none, ack: true }).hex).toBe('0x10')
  })

  it('FIN+ACK is 0x11', () => {
    expect(calculateTcpFlags({ ...none, fin: true, ack: true }).hex).toBe('0x11')
  })

  it('RST alone is 0x04', () => {
    expect(calculateTcpFlags({ ...none, rst: true }).hex).toBe('0x04')
  })

  it('all six flags set is 0x3f', () => {
    const all = { urg: true, ack: true, psh: true, rst: true, syn: true, fin: true }
    expect(calculateTcpFlags(all).value).toBe(63)
    expect(calculateTcpFlags(all).hex).toBe('0x3f')
  })

  it('no flags set is 0x00', () => {
    expect(calculateTcpFlags(none).hex).toBe('0x00')
  })
})
