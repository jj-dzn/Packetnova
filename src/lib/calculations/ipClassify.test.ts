import { describe, expect, it } from 'vitest'
import { classifyIPv4 } from './ipClassify'
import { parseIPv4 } from '../validation/ip'

function classify(ip: string) {
  return classifyIPv4(parseIPv4(ip)!.value)
}

describe('classifyIPv4', () => {
  it('flags RFC 1918 private ranges', () => {
    expect(classify('10.1.2.3').label).toContain('Private use')
    expect(classify('172.16.0.1').label).toContain('Private use')
    expect(classify('192.168.1.1').label).toContain('Private use')
  })

  it('flags loopback', () => {
    expect(classify('127.0.0.1').label).toContain('Loopback')
  })

  it('flags link-local', () => {
    expect(classify('169.254.1.1').label).toContain('Link-local')
  })

  it('flags multicast', () => {
    expect(classify('224.0.0.1').label).toContain('Multicast')
  })

  it('flags documentation ranges', () => {
    expect(classify('192.0.2.1').label).toContain('Documentation')
    expect(classify('198.51.100.1').label).toContain('Documentation')
    expect(classify('203.0.113.1').label).toContain('Documentation')
  })

  it('flags the limited broadcast address specifically, not just reserved', () => {
    expect(classify('255.255.255.255').label).toContain('Limited broadcast')
  })

  it('flags CGNAT shared address space', () => {
    expect(classify('100.64.0.1').label).toContain('CGNAT')
  })

  it('falls back to public for ordinary global addresses', () => {
    expect(classify('8.8.8.8').label).toBe('Public (global unicast)')
    expect(classify('1.1.1.1').label).toBe('Public (global unicast)')
  })
})
