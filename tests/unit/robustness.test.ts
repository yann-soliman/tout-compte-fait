import { describe, expect, it } from 'vitest'
import { defaultScenario } from '../../src/domain/defaults'
import { rules2026 } from '../../src/domain/rules/2026'
import { calculateComparison } from '../../src/domain/calculate'
import { assertMoneyCents } from '../../src/domain/money'
import { calculateRobustness } from '../../src/domain/robustness'

const valueAt = (days: number) =>
  calculateComparison(
    { ...defaultScenario, micro: { ...defaultScenario.micro, billedDays: days } },
    rules2026,
  )

describe('robustness', () => {
  it('proves monotonicity of the 2026 independently rounded deductions over their whole period', () => {
    const scenario = structuredClone(defaultScenario)
    scenario.retirement.includeRights = false
    scenario.micro.billedDays = 1
    let previous = 0
    for (let turnover = 0; turnover <= 1000; turnover++) {
      scenario.micro.dailyRate = assertMoneyCents(turnover)
      const net = calculateComparison(scenario, rules2026).micro.netIncome
      expect(net).toBeGreaterThanOrEqual(previous)
      if (turnover >= 500) {
        const earlier = calculateComparison(
          {
            ...scenario,
            micro: { ...scenario.micro, dailyRate: assertMoneyCents(turnover - 500) },
          },
          rules2026,
        ).micro.netIncome
        expect(net - earlier).toBe(371)
      }
      previous = net
    }
  })
  it('keeps a zero-day rate unavailable and shows effort instead of a fictitious margin', () => {
    const scenario = structuredClone(defaultScenario)
    scenario.micro.billedDays = 0
    const r = calculateRobustness(scenario, rules2026)
    expect(r.days.state).toBe('effort')
    expect(r.rate.state).toBe('unavailable')
    expect(r.rate.threshold).toBeUndefined()
    expect(r.rate.amount).toBeUndefined()
    expect(r.expenses.state).toBe('unreachable')
  })
  it('keeps zero-cost zero-income equality exact without negative predecessors', () => {
    const scenario = structuredClone(defaultScenario)
    scenario.micro.dailyRate = assertMoneyCents(0)
    scenario.micro.professionalExpenses = assertMoneyCents(0)
    scenario.micro.healthInsuranceMonthly = assertMoneyCents(0)
    scenario.micro.cfeAnnual = assertMoneyCents(0)
    scenario.micro.cfeExemptionConfirmed = true
    scenario.employee.grossAnnualSalary = assertMoneyCents(0)
    scenario.employee.annualBenefits = assertMoneyCents(0)
    const r = calculateRobustness(scenario, rules2026)
    expect(r.days).toMatchObject({ state: 'margin', threshold: 0, amount: 200 })
    expect(r.rate).toMatchObject({ state: 'margin', threshold: 0, amount: 0 })
    expect(r.expenses).toMatchObject({ state: 'margin', threshold: 0, amount: 0 })
  })
  it('retains hypothetical threshold warnings under a prorated ceiling', () => {
    const scenario = structuredClone(defaultScenario)
    scenario.activityStartDate = '2026-12-31'
    const r = calculateRobustness(scenario, rules2026)
    expect(r.theoretical).toBe(true)
    expect(r.days.withinCeiling).toBe(false)
    expect(r.rate.withinCeiling).toBe(false)
    expect(r.warnings.some((w) => w.code === 'ceiling-exceeded')).toBe(true)
  })
  it('bounds day exploration to safe turnover without losing other valid indicators', () => {
    const scenario = structuredClone(defaultScenario)
    scenario.micro.dailyRate = assertMoneyCents(Math.floor(Number.MAX_SAFE_INTEGER / 2))
    scenario.micro.billedDays = 1
    const r = calculateRobustness(scenario, rules2026)
    expect(r.days.threshold).toBe(1)
    expect(r.days.amount).toBe(0)
    expect(r.rate.state).toBe('margin')
    expect(Number.isSafeInteger(r.expenses.threshold)).toBe(true)
  })
  it('never offers negative professional expenses to overcome a deficit', () => {
    const scenario = structuredClone(defaultScenario)
    scenario.micro.dailyRate = assertMoneyCents(100)
    const r = calculateRobustness(scenario, rules2026)
    expect(r.expenses.state).toBe('unreachable')
    expect(r.expenses.threshold).toBeUndefined()
    expect(r.days.state).toBe('unreachable')
    expect(r.rate.state).toBe('effort')
  })
  it('does not claim any threshold when CFE is unknown, but accepts a confirmed exemption', () => {
    const scenario = structuredClone(defaultScenario)
    scenario.micro.cfeAnnual = undefined
    const r = calculateRobustness(scenario, rules2026)
    for (const factor of [r.days, r.rate, r.expenses]) {
      expect(factor.state).toBe('unavailable')
      expect(factor.amount).toBeUndefined()
    }
    scenario.micro.cfeExemptionConfirmed = true
    expect(calculateRobustness(scenario, rules2026).days.state).toBe('margin')
  })
  it('absorbs exactly the annual economic difference as extra professional expenses', () => {
    const r = calculateRobustness(defaultScenario, rules2026)
    const result = calculateComparison(defaultScenario, rules2026)
    expect(r.expenses.state).toBe('margin')
    expect(r.expenses.amount).toBe(result.micro.totalValue - result.employee.totalValue)
    const at = (extra: number) =>
      calculateComparison(
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
    expect(at(r.expenses.amount!).economicValueDifference).toBe(0)
    expect(at(r.expenses.amount! + 1).economicValueDifference).toBe(-1)
  })
  it('finds the cent-minimum rate at constant days', () => {
    const r = calculateRobustness(defaultScenario, rules2026)
    const rate = r.rate.threshold!
    const at = (dailyRate: number) =>
      calculateComparison(
        {
          ...defaultScenario,
          micro: { ...defaultScenario.micro, dailyRate: assertMoneyCents(dailyRate) },
        },
        rules2026,
      )
    expect(r.rate.state).toBe('margin')
    expect(r.rate.amount).toBe(defaultScenario.micro.dailyRate - rate)
    expect(at(rate).micro.totalValue).toBeGreaterThanOrEqual(at(rate).employee.totalValue)
    expect(at(rate - 1).micro.totalValue).toBeLessThan(at(rate - 1).employee.totalValue)
  })
  it('finds the minimum whole day and shows the exact independent margin', () => {
    const r = calculateRobustness(defaultScenario, rules2026)
    const threshold = r.days.threshold!
    expect(r.days.state).toBe('margin')
    expect(r.days.amount).toBe(defaultScenario.micro.billedDays - threshold)
    expect(valueAt(threshold).micro.totalValue).toBeGreaterThanOrEqual(
      valueAt(threshold).employee.totalValue,
    )
    expect(valueAt(threshold - 1).micro.totalValue).toBeLessThan(
      valueAt(threshold - 1).employee.totalValue,
    )
    expect(r.theoretical).toBe(true)
    expect(r.days.withinCeiling).toBe(true)
  })
})
