import { describe, expect, it } from 'vitest'
import { summarizeRoutes } from './routeSummary'

describe('summarizeRoutes', () => {
  it('merges two adjacent halves back into the whole block', () => {
    const result = summarizeRoutes('192.168.1.0/25\n192.168.1.128/25')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.summarizedRoutes).toEqual(['192.168.1.0/24'])
    expect(result.result.inputCount).toBe(2)
    expect(result.result.reductionCount).toBe(1)
  })

  it('leaves non-contiguous networks alone', () => {
    const result = summarizeRoutes('10.0.0.0/24\n192.168.0.0/24')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.summarizedRoutes).toEqual(['10.0.0.0/24', '192.168.0.0/24'])
    expect(result.result.reductionCount).toBe(0)
  })

  it('collapses a subnet that is fully contained in another', () => {
    const result = summarizeRoutes('10.0.0.0/24\n10.0.0.0/25')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.summarizedRoutes).toEqual(['10.0.0.0/24'])
  })

  it('accepts bare IP addresses as /32s and merges adjacent ones', () => {
    const result = summarizeRoutes('192.168.1.0\n192.168.1.1\n192.168.1.2\n192.168.1.3')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.summarizedRoutes).toEqual(['192.168.1.0/30'])
  })

  it('accepts comma-separated input as well as newline-separated', () => {
    const result = summarizeRoutes('192.168.1.0/25, 192.168.1.128/25')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.summarizedRoutes).toEqual(['192.168.1.0/24'])
  })

  it('rejects an invalid line', () => {
    const result = summarizeRoutes('10.0.0.0/24\nnot-a-cidr')
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error).toContain('not-a-cidr')
  })

  it('rejects empty input', () => {
    expect(summarizeRoutes('').ok).toBe(false)
    expect(summarizeRoutes('   \n  ').ok).toBe(false)
  })
})
