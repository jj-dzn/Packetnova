import { describe, expect, it } from 'vitest'
import { searchIndex, searchItems } from './searchIndex'

describe('searchItems', () => {
  it('includes every tool from the content data', () => {
    expect(searchItems.length).toBeGreaterThanOrEqual(48)
  })

  it('gives a built tool a real href', () => {
    const cidr = searchItems.find((item) => item.title === 'CIDR calculator')
    expect(cidr?.href).toBe('/tools/cidr-calculator')
  })

  it('includes every visualizer from the content data', () => {
    const visualizerItems = searchItems.filter((item) => item.type === 'visualizer')
    expect(visualizerItems.length).toBeGreaterThanOrEqual(10)
  })

  it('gives the built visualizer a real href and an unbuilt one null', () => {
    const tcp = searchItems.find((item) => item.title === 'TCP three-way handshake')
    const tls = searchItems.find((item) => item.title === 'TLS handshake')
    expect(tcp?.href).toBe('/visualizers/tcp-three-way-handshake')
    expect(tls?.href).toBeNull()
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
