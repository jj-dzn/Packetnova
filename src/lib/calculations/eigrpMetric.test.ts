import { describe, expect, it } from 'vitest'
import { calculateEigrpMetric } from './eigrpMetric'

describe('calculateEigrpMetric', () => {
  it('computes the classic default-K composite metric for a 100 Mbps, 100us link', () => {
    // 256 * (10^7 / 100_000 + 10) = 256 * (100 + 10) = 28160
    const calc = calculateEigrpMetric(100, 100)
    expect(calc.ok).toBe(true)
    if (calc.ok) expect(calc.result.metric).toBe(28160)
  })

  it('computes the metric for a gigabit link with negligible delay', () => {
    // 256 * (10^7 / 1_000_000 + 0) = 256 * 10 = 2560
    const calc = calculateEigrpMetric(1000, 0)
    expect(calc.ok).toBe(true)
    if (calc.ok) expect(calc.result.metric).toBe(2560)
  })

  it('rejects zero or negative bandwidth', () => {
    expect(calculateEigrpMetric(0, 10).ok).toBe(false)
    expect(calculateEigrpMetric(-5, 10).ok).toBe(false)
  })

  it('rejects negative delay', () => {
    expect(calculateEigrpMetric(100, -1).ok).toBe(false)
  })

  it('accepts zero delay', () => {
    expect(calculateEigrpMetric(100, 0).ok).toBe(true)
  })
})
