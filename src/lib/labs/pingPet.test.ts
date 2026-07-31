import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildPingUrl, classifyLatency, measureLatency, PING_TARGETS } from './pingPet'

describe('classifyLatency', () => {
  it('classifies null as error', () => {
    expect(classifyLatency(null)).toBe('error')
  })

  it('classifies sub-100ms as fast', () => {
    expect(classifyLatency(0)).toBe('fast')
    expect(classifyLatency(99)).toBe('fast')
  })

  it('classifies 100-299ms as medium', () => {
    expect(classifyLatency(100)).toBe('medium')
    expect(classifyLatency(299)).toBe('medium')
  })

  it('classifies 300ms and above as slow', () => {
    expect(classifyLatency(300)).toBe('slow')
    expect(classifyLatency(5000)).toBe('slow')
  })
})

describe('buildPingUrl', () => {
  it('targets the host over https with a cache-busting param', () => {
    const url = buildPingUrl('example.com')
    expect(url).toMatch(/^https:\/\/example\.com\/favicon\.ico\?_=\d+$/)
  })
})

describe('PING_TARGETS', () => {
  it('has at least one preset target with a label and host', () => {
    expect(PING_TARGETS.length).toBeGreaterThan(0)
    for (const target of PING_TARGETS) {
      expect(target.label).toBeTruthy()
      expect(target.host).toBeTruthy()
    }
  })
})

describe('measureLatency', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('resolves a non-negative duration when the fetch succeeds', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(undefined))

    const result = await measureLatency('example.com')

    expect(result).not.toBeNull()
    expect(result).toBeGreaterThanOrEqual(0)
  })

  it('resolves null when the fetch rejects (DNS/connection failure)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    const result = await measureLatency('this-host-does-not-exist.invalid')

    expect(result).toBeNull()
  })
})
