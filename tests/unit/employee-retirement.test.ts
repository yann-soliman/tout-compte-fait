import { describe, expect, it } from 'vitest'
import { defaultScenario } from '../../src/domain/defaults'
import { assertMoneyCents } from '../../src/domain/money'
import { calculateEmployeeRetirement } from '../../src/domain/retirement'
import { rules2026 } from '../../src/domain/rules/2026'

describe('calculateEmployeeRetirement', () => {
  const threshold = rules2026.baseRetirement.quarterThreshold!.value

  it.each([
    [threshold - 1, 0],
    [threshold, 1],
    [threshold + 1, 1],
    [threshold * 4 - 1, 3],
    [threshold * 4, 4],
    [threshold * 4 + 1, 4],
  ])('awards capped base quarters at %i cents', (salary, quarters) => {
    const result = calculateEmployeeRetirement(
      { ...defaultScenario.employee, grossAnnualSalary: assertMoneyCents(salary) },
      rules2026,
    )
    expect(result.base.quarters).toBe(quarters)
  })

  it('caps base qualifying income at the annual PASS', () => {
    const pass = rules2026.socialSecurityCeilingAnnual.value
    const result = calculateEmployeeRetirement(
      { ...defaultScenario.employee, grossAnnualSalary: assertMoneyCents(pass + 1) },
      rules2026,
    )
    expect(result.base.qualifyingIncome).toBe(pass)
  })

  it('blocks Agirc-Arrco points while the 2026 purchase and service values are unverified', () => {
    const result = calculateEmployeeRetirement(defaultScenario.employee, rules2026)
    expect(result.complementary.points).toBe('unavailable')
    expect(result.complementary.indicativeAnnualPension).toBe('unavailable')
    expect(result.complementary.confidence).toBe('blocked')
  })
})
