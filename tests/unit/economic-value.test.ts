import { describe, expect, it } from 'vitest'
import { calculateComparison } from '../../src/domain/calculate'
import { defaultScenario } from '../../src/domain/defaults'
import { assertMoneyCents } from '../../src/domain/money'
import { rules2026 } from '../../src/domain/rules/2026'

describe('economic value', () => {
  it('deducts micro expenses once without changing the statutory base or net income', () => {
    const baseline = calculateComparison(defaultScenario, rules2026)
    const extra = assertMoneyCents(10_000)
    const changed = calculateComparison(
      {
        ...defaultScenario,
        micro: {
          ...defaultScenario.micro,
          professionalExpenses: assertMoneyCents(
            defaultScenario.micro.professionalExpenses + extra,
          ),
        },
      },
      rules2026,
    )
    expect(changed.micro.grossIncome).toBe(baseline.micro.grossIncome)
    expect(changed.micro.netIncome).toBe(baseline.micro.netIncome)
    expect(changed.micro.totalValue).toBe(baseline.micro.totalValue - extra)
  })

  it('adds employee benefits once without changing gross salary or statutory net income', () => {
    const baseline = calculateComparison(defaultScenario, rules2026)
    const extra = assertMoneyCents(10_000)
    const changed = calculateComparison(
      {
        ...defaultScenario,
        employee: {
          ...defaultScenario.employee,
          annualBenefits: assertMoneyCents(defaultScenario.employee.annualBenefits + extra),
        },
      },
      rules2026,
    )
    expect(changed.employee.grossIncome).toBe(baseline.employee.grossIncome)
    expect(changed.employee.netIncome).toBe(baseline.employee.netIncome)
    expect(changed.employee.totalValue).toBe(baseline.employee.totalValue + extra)
  })

  it('uses status-specific days and returns indeterminate for zero days', () => {
    const result = calculateComparison(defaultScenario, rules2026)
    expect(result.micro.workedDays).toBe(defaultScenario.micro.billedDays)
    expect(result.employee.workedDays).toBe(230)
    expect(result.micro.valuePerDay).toBe(Math.round(result.micro.totalValue / 160))
    expect(result.employee.valuePerDay).toBe(Math.round(result.employee.totalValue / 230))

    const zero = calculateComparison(
      { ...defaultScenario, micro: { ...defaultScenario.micro, billedDays: 0 } },
      rules2026,
    )
    expect(zero.micro.valuePerDay).toBe('indeterminate')
  })
})
