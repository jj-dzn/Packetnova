import { describe, expect, it } from 'vitest'
import { generateCursedConfig } from './cursedConfig'

describe('generateCursedConfig', () => {
  it('produces a config-shaped block starting with an interface and ending with end', () => {
    const config = generateCursedConfig()
    const lines = config.split('\n')
    expect(lines[0]).toMatch(/^interface /)
    expect(lines[lines.length - 1]).toBe('end')
  })

  it('includes an IP address line', () => {
    const config = generateCursedConfig()
    expect(config).toMatch(/ip address \d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3} 255\.255\.255\.0/)
  })

  it('varies across calls', () => {
    const configs = new Set(Array.from({ length: 20 }, () => generateCursedConfig()))
    expect(configs.size).toBeGreaterThan(1)
  })
})
