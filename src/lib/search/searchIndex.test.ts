import { describe, expect, it } from 'vitest'
import { searchIndex, searchItems } from './searchIndex'

describe('searchItems', () => {
  it('includes every tool from the content data, built and unbuilt alike', () => {
    expect(searchItems.length).toBeGreaterThanOrEqual(48)
  })

  it('gives built tools a real href and unbuilt tools null', () => {
    const cidr = searchItems.find((item) => item.title === 'CIDR calculator')
    const ipv6 = searchItems.find((item) => item.title === 'IPv6 calculator')
    expect(cidr?.href).toBe('/tools/cidr-calculator')
    expect(ipv6?.href).toBeNull()
  })
})

describe('searchIndex', () => {
  it('finds an exact-title match', () => {
    const results = searchIndex.search('CIDR calculator')
    expect(results[0]?.item.title).toBe('CIDR calculator')
  })

  it('finds results via a partial, case-insensitive query', () => {
    const results = searchIndex.search('subnet')
    expect(results.some((r) => r.item.title === 'Subnet calculator')).toBe(true)
  })

  it('matches on description content, not just the title', () => {
    const results = searchIndex.search('broadcast address')
    expect(results.some((r) => r.item.title === 'Broadcast calculator')).toBe(true)
  })

  it('returns nothing for a query unrelated to any tool', () => {
    const results = searchIndex.search('xyzzy nonsense query')
    expect(results).toHaveLength(0)
  })
})
