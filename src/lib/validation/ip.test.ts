import { describe, expect, it } from 'vitest'
import {
  broadcastAddress,
  ipv4ToString,
  networkAddress,
  parseCIDR,
  parseIPv4,
  prefixLengthToSubnetMask,
  subnetMaskToPrefixLength,
  totalAddresses,
  usableHostCount,
  usableHostRange,
} from './ip'

describe('parseIPv4', () => {
  it('parses a valid address', () => {
    expect(parseIPv4('192.168.1.1')).toEqual({ octets: [192, 168, 1, 1], value: 3232235777 })
  })

  it('parses the all-zeros and all-ones addresses', () => {
    expect(parseIPv4('0.0.0.0')).toEqual({ octets: [0, 0, 0, 0], value: 0 })
    expect(parseIPv4('255.255.255.255')).toEqual({
      octets: [255, 255, 255, 255],
      value: 4294967295,
    })
  })

  it('rejects octets over 255', () => {
    expect(parseIPv4('256.1.1.1')).toBeNull()
    expect(parseIPv4('1.1.1.999')).toBeNull()
  })

  it('rejects the wrong number of octets', () => {
    expect(parseIPv4('192.168.1')).toBeNull()
    expect(parseIPv4('192.168.1.1.1')).toBeNull()
  })

  it('rejects leading zeros (avoids octal-interpretation ambiguity)', () => {
    expect(parseIPv4('192.168.01.1')).toBeNull()
    expect(parseIPv4('010.0.0.1')).toBeNull()
  })

  it('rejects non-numeric and malformed input', () => {
    expect(parseIPv4('abc.1.1.1')).toBeNull()
    expect(parseIPv4('')).toBeNull()
    expect(parseIPv4('1.1.1.-1')).toBeNull()
  })
})

describe('ipv4ToString', () => {
  it('round-trips through parseIPv4', () => {
    const parsed = parseIPv4('203.0.113.42')
    expect(parsed).not.toBeNull()
    expect(ipv4ToString(parsed!.value)).toBe('203.0.113.42')
  })

  it('formats the top-bit-set case correctly', () => {
    expect(ipv4ToString(4294967295)).toBe('255.255.255.255')
  })
})

describe('parseCIDR', () => {
  it('parses a valid CIDR block', () => {
    const result = parseCIDR('10.0.0.0/8')
    expect(result).not.toBeNull()
    expect(result!.prefixLength).toBe(8)
    expect(result!.ip.octets).toEqual([10, 0, 0, 0])
  })

  it('rejects a prefix length outside 0-32', () => {
    expect(parseCIDR('192.168.1.1/33')).toBeNull()
    expect(parseCIDR('192.168.1.1/-1')).toBeNull()
  })

  it('rejects an invalid IP portion', () => {
    expect(parseCIDR('256.1.1.1/24')).toBeNull()
  })

  it('rejects input with no prefix', () => {
    expect(parseCIDR('192.168.1.1')).toBeNull()
  })
})

describe('prefixLengthToSubnetMask / subnetMaskToPrefixLength', () => {
  it.each([
    [0, '0.0.0.0'],
    [8, '255.0.0.0'],
    [12, '255.240.0.0'],
    [24, '255.255.255.0'],
    [30, '255.255.255.252'],
    [31, '255.255.255.254'],
    [32, '255.255.255.255'],
  ])('prefix /%i -> %s', (prefixLength, expected) => {
    const mask = prefixLengthToSubnetMask(prefixLength)
    expect(ipv4ToString(mask.value)).toBe(expected)
    expect(subnetMaskToPrefixLength(mask)).toBe(prefixLength)
  })

  it('rejects a non-contiguous mask', () => {
    const nonContiguous = parseIPv4('255.0.255.0')!
    expect(subnetMaskToPrefixLength(nonContiguous)).toBeNull()
  })
})

describe('networkAddress / broadcastAddress (RFC 1918 examples)', () => {
  it('192.168.1.0/24', () => {
    const ip = parseIPv4('192.168.1.130')!
    expect(ipv4ToString(networkAddress(ip, 24).value)).toBe('192.168.1.0')
    expect(ipv4ToString(broadcastAddress(ip, 24).value)).toBe('192.168.1.255')
  })

  it('10.0.0.0/8', () => {
    const ip = parseIPv4('10.42.7.9')!
    expect(ipv4ToString(networkAddress(ip, 8).value)).toBe('10.0.0.0')
    expect(ipv4ToString(broadcastAddress(ip, 8).value)).toBe('10.255.255.255')
  })

  it('172.16.0.0/12', () => {
    const ip = parseIPv4('172.31.255.1')!
    expect(ipv4ToString(networkAddress(ip, 12).value)).toBe('172.16.0.0')
    expect(ipv4ToString(broadcastAddress(ip, 12).value)).toBe('172.31.255.255')
  })

  it('a /30 point subnet', () => {
    const ip = parseIPv4('192.168.1.10')!
    expect(ipv4ToString(networkAddress(ip, 30).value)).toBe('192.168.1.8')
    expect(ipv4ToString(broadcastAddress(ip, 30).value)).toBe('192.168.1.11')
  })
})

describe('usableHostRange / usableHostCount / totalAddresses', () => {
  it('/24 has 254 usable hosts in a contiguous range', () => {
    const ip = parseIPv4('192.168.1.1')!
    const range = usableHostRange(ip, 24)
    expect(range).not.toBeNull()
    expect(ipv4ToString(range!.first.value)).toBe('192.168.1.1')
    expect(ipv4ToString(range!.last.value)).toBe('192.168.1.254')
    expect(usableHostCount(24)).toBe(254)
    expect(totalAddresses(24)).toBe(256)
  })

  it('/30 has exactly 2 usable hosts', () => {
    const ip = parseIPv4('192.168.1.9')!
    const range = usableHostRange(ip, 30)
    expect(ipv4ToString(range!.first.value)).toBe('192.168.1.9')
    expect(ipv4ToString(range!.last.value)).toBe('192.168.1.10')
    expect(usableHostCount(30)).toBe(2)
  })

  it('/31 treats both addresses as usable per RFC 3021', () => {
    const ip = parseIPv4('192.168.1.1')!
    const range = usableHostRange(ip, 31)
    expect(ipv4ToString(range!.first.value)).toBe('192.168.1.0')
    expect(ipv4ToString(range!.last.value)).toBe('192.168.1.1')
    expect(usableHostCount(31)).toBe(2)
  })

  it('/32 is a single host with no range', () => {
    const ip = parseIPv4('192.168.1.5')!
    expect(usableHostRange(ip, 32)).toBeNull()
    expect(usableHostCount(32)).toBe(1)
    expect(totalAddresses(32)).toBe(1)
  })

  it('/0 spans the entire IPv4 space', () => {
    expect(totalAddresses(0)).toBe(4294967296)
  })
})
