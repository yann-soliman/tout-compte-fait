import { describe, expect, it } from 'vitest'
import { calculateComparison } from '../../src/domain/calculate'
import { defaultScenario } from '../../src/domain/defaults'
import { rules2026 } from '../../src/domain/rules/2026'

describe('retirement integration', () => {
  it('keeps base pension non-calculable and complementary valuation unavailable', () => {
    const result = calculateComparison(defaultScenario, rules2026)
    expect(result.micro.retirement?.base.basePension).toBe('not-calculable-from-2026-alone')
    expect(result.employee.retirement?.base.basePension).toBe('not-calculable-from-2026-alone')
    expect(result.micro.retirement?.complementary.indicativeAnnualPension).toBe('unavailable')
  })

  it('never adds retirement rights to current net or economic totals', () => {
    const included = calculateComparison(defaultScenario, rules2026)
    const hidden = calculateComparison(
      { ...defaultScenario, retirement: { ...defaultScenario.retirement, includeRights: false } },
      rules2026,
    )
    expect(included.micro.totalValue).toBe(hidden.micro.totalValue)
    expect(included.employee.totalValue).toBe(hidden.employee.totalValue)
    expect(included.difference).toBe(hidden.difference)
    expect(hidden.micro.retirement).toBeUndefined()
  })
})
