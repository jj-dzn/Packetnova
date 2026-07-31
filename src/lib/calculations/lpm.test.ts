import { describe, expect, it } from 'vitest'
import { simulateLpm } from './lpm'

describe('simulateLpm', () => {
  it('the longest matching prefix wins among several overlapping routes', () => {
    const result = simulateLpm('192.168.1.10', [
      { cidr: '0.0.0.0/0', label: 'Default' },
      { cidr: '192.168.0.0/16', label: 'Aggregate' },
      { cidr: '192.168.1.0/24', label: 'Specific' },
    ])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.matches.every((m) => m.matches)).toBe(true)
    expect(result.result.winner?.label).toBe('Specific')
    expect(result.result.winner?.prefixLength).toBe(24)
  })

  it('routes that do not contain the destination are marked as non-matching', () => {
    const result = simulateLpm('10.0.0.5', [
      { cidr: '192.168.0.0/16', label: 'Unrelated' },
      { cidr: '10.0.0.0/8', label: 'Correct' },
    ])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const unrelated = result.result.matches.find((m) => m.label === 'Unrelated')
    const correct = result.result.matches.find((m) => m.label === 'Correct')
    expect(unrelated?.matches).toBe(false)
    expect(correct?.matches).toBe(true)
    expect(result.result.winner?.label).toBe('Correct')
  })

  it('a destination with no matching route has a null winner', () => {
    const result = simulateLpm('172.16.0.1', [{ cidr: '10.0.0.0/8', label: 'Unrelated' }])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.winner).toBeNull()
  })

  it('rejects an invalid destination IP', () => {
    expect(simulateLpm('not-an-ip', [{ cidr: '10.0.0.0/8', label: 'A' }]).ok).toBe(false)
  })

  it('rejects an invalid route CIDR', () => {
    expect(simulateLpm('10.0.0.1', [{ cidr: 'garbage', label: 'A' }]).ok).toBe(false)
  })

  it('rejects an empty route list', () => {
    expect(simulateLpm('10.0.0.1', []).ok).toBe(false)
  })
})
