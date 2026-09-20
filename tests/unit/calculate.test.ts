import { describe, expect, it } from 'vitest'
import { calculateComparison, forPeriod } from '../../src/domain/calculate'
import { defaultScenario } from '../../src/domain/defaults'

describe('calculateComparison', () => {
  it('returns finite comparable values for the default scenario', () => {
    const result = calculateComparison(defaultScenario)

    expect(result.micro.totalValue).toBeGreaterThan(0)
    expect(result.employee.totalValue).toBeGreaterThan(0)
    expect(result.micro.valuePerDay).toBeGreaterThan(0)
    expect(result.difference).toBe(result.micro.totalValue - result.employee.totalValue)
  })

  it('returns zero instead of invalid values for an empty scenario', () => {
    const result = calculateComparison({
      ...defaultScenario,
      micro: { ...defaultScenario.micro, dailyRate: 0, workedDays: 0 },
      employee: { ...defaultScenario.employee, grossAnnualSalary: 0, annualBenefits: 0 },
    })

    expect(result.micro.valuePerDay).toBe(0)
    expect(result.employee.netIncome).toBe(0)
    expect(Number.isFinite(result.micro.totalValue)).toBe(true)
  })

  it('changes display period without changing the annual value', () => {
    expect(forPeriod(12000, 'annual')).toBe(12000)
    expect(forPeriod(12000, 'monthly')).toBe(1000)
  })
})
