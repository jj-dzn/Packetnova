import { describe, expect, it } from 'vitest'
import { resolvePathStep } from './resolvePathStep'
import { competencyPaths } from '../../content/reference/paths'

describe('resolvePathStep', () => {
  it('resolves a known tool step', () => {
    const resolved = resolvePathStep({ type: 'tool', slug: 'cidr-calculator', note: '' })
    expect(resolved).not.toBeNull()
    expect(resolved?.href).toBe('/tools/cidr-calculator')
    expect(resolved?.typeLabel).toBe('Tool')
  })

  it('resolves a known visualizer step', () => {
    const resolved = resolvePathStep({
      type: 'visualizer',
      slug: 'bgp-best-path-selection',
      note: '',
    })
    expect(resolved).not.toBeNull()
    expect(resolved?.href).toBe('/visualizers/bgp-best-path-selection')
    expect(resolved?.typeLabel).toBe('Visualizer')
  })

  it('resolves a known scenario step, mapping title/symptom to title/description', () => {
    const resolved = resolvePathStep({ type: 'scenario', slug: 'subnetting-mistake', note: '' })
    expect(resolved).not.toBeNull()
    expect(resolved?.href).toBe('/scenarios/subnetting-mistake')
    expect(resolved?.typeLabel).toBe('Scenario')
  })

  it('resolves a named journey step', () => {
    const resolved = resolvePathStep({ type: 'journey', slug: 'bgp-path', note: '' })
    expect(resolved).not.toBeNull()
    expect(resolved?.href).toBe('/journey/bgp-path')
    expect(resolved?.typeLabel).toBe('Journey')
  })

  it('resolves the flagship journey from an empty slug', () => {
    const resolved = resolvePathStep({ type: 'journey', slug: '', note: '' })
    expect(resolved).not.toBeNull()
    expect(resolved?.href).toBe('/journey')
  })

  it('returns null for an unknown slug', () => {
    expect(resolvePathStep({ type: 'tool', slug: 'not-a-real-tool', note: '' })).toBeNull()
  })

  it('resolves every step of every real competency path', () => {
    for (const path of competencyPaths) {
      for (const step of path.steps) {
        const resolved = resolvePathStep(step)
        expect(
          resolved,
          `${path.slug}: step ${step.type}:${step.slug} should resolve`,
        ).not.toBeNull()
      }
    }
  })
})
