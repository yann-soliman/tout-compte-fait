import { describe, expect, it } from 'vitest'
import { calculateComparison } from '../../src/domain/calculate'
import { defaultScenario } from '../../src/domain/defaults'
import { calculateBalance, findMinimumRate } from '../../src/domain/balance'
import { assertMoneyCents } from '../../src/domain/money'
import { rules2026 } from '../../src/domain/rules/2026'

describe('minimum eligible balance rate', () => {
  it('returns the first cent reaching the employee net target and proves the previous cent fails', () => {
    const result = calculateBalance(defaultScenario, 'netIncome', 160, rules2026)
    expect(result.state).toBe('reachable')
    expect(Number.isSafeInteger(result.dailyRateCents)).toBe(true)
    const dailyRateCents = result.dailyRateCents!
    const target = result.targetAnnualCents
    const atRate = calculateComparison(
      {
        ...defaultScenario,
        micro: {
          ...defaultScenario.micro,
          dailyRate: assertMoneyCents(dailyRateCents),
          billedDays: 160,
        },
      },
      rules2026,
    )
    const atPreviousCent = calculateComparison(
      {
        ...defaultScenario,
        micro: {
          ...defaultScenario.micro,
          dailyRate: assertMoneyCents(dailyRateCents - 1),
          billedDays: 160,
        },
      },
      rules2026,
    )
    expect(atRate.micro.netIncome).toBeGreaterThanOrEqual(target)
    expect(atPreviousCent.micro.netIncome).toBeLessThan(target)
    expect(result.precedingRateCents).toBe(dailyRateCents - 1)
  })

  it('includes employee benefits only for the economic target and never values retirement', () => {
    const economic = calculateBalance(defaultScenario, 'totalValue', 160, rules2026)
    const net = calculateBalance(defaultScenario, 'netIncome', 160, rules2026)
    expect(economic.targetAnnualCents - net.targetAnnualCents).toBe(
      defaultScenario.employee.annualBenefits,
    )
    expect(economic.dailyRateCents).toBeGreaterThan(net.dailyRateCents!)

    const withoutRetirement = {
      ...defaultScenario,
      retirement: { ...defaultScenario.retirement, includeRights: false },
    }
    expect(calculateBalance(withoutRetirement, 'totalValue', 160, rules2026)).toEqual(economic)
  })

  it('uses the prorated first-year ceiling and never treats the next cent as eligible', () => {
    const scenario = { ...defaultScenario, activityStartDate: '2026-07-01' }
    const result = calculateBalance(scenario, 'netIncome', 160, rules2026)
    expect(result.maximumEligibleRateCents).toBeGreaterThan(0)
    const eligible = calculateComparison(
      {
        ...scenario,
        micro: {
          ...scenario.micro,
          dailyRate: assertMoneyCents(result.maximumEligibleRateCents!),
          billedDays: 160,
        },
      },
      rules2026,
    )
    const over = calculateComparison(
      {
        ...scenario,
        micro: {
          ...scenario.micro,
          dailyRate: assertMoneyCents(result.maximumEligibleRateCents! + 1),
          billedDays: 160,
        },
      },
      rules2026,
    )
    expect(eligible.micro.eligibility?.state).toBe('not-confirmed')
    expect(over.micro.eligibility?.state).toBe('ceiling-exceeded')
  })

  it('returns a warned hypothetical above the ceiling instead of recommending it', () => {
    const highTarget = assertMoneyCents(500_000_000)
    const result = findMinimumRate(defaultScenario, 'netIncome', highTarget, 160, rules2026)
    expect(result.state).toBe('target-above-eligible-ceiling')
    expect(result.dailyRateCents).toBeUndefined()
    expect(result.hypotheticalDailyRateCents).toBeGreaterThan(result.maximumEligibleRateCents!)

    const projected = calculateComparison(
      {
        ...defaultScenario,
        micro: {
          ...defaultScenario.micro,
          dailyRate: assertMoneyCents(result.hypotheticalDailyRateCents!),
          billedDays: 160,
        },
      },
      rules2026,
    )
    expect(projected.micro.netIncome).toBeGreaterThanOrEqual(highTarget)
    expect(projected.micro.eligibility?.state).toBe('ceiling-exceeded')
    expect(result.precedingHypotheticalRateCents).toBe(result.hypotheticalDailyRateCents! - 1)
  })

  it('blocks invalid CFE, date, catalog year and negative targets; zero days is indeterminate', () => {
    const noCfe = {
      ...defaultScenario,
      micro: { ...defaultScenario.micro, cfeAnnual: undefined, cfeExemptionConfirmed: false },
    }
    expect(calculateBalance(noCfe, 'netIncome', 160, rules2026).state).toBe('blocked')
    expect(
      calculateBalance(
        {
          ...defaultScenario,
          micro: { ...defaultScenario.micro, cfeAnnual: assertMoneyCents(0) },
        },
        'netIncome',
        160,
        rules2026,
      ).state,
    ).toBe('blocked')
    expect(
      calculateBalance(
        { ...defaultScenario, activityStartDate: '2026-02-30' },
        'netIncome',
        160,
        rules2026,
      ).state,
    ).toBe('blocked')
    expect(
      calculateBalance(defaultScenario, 'netIncome', 160, { ...rules2026, year: 2025 }).state,
    ).toBe('blocked')
    expect(calculateBalance(defaultScenario, 'netIncome', 0, rules2026).state).toBe('indeterminate')
    expect(findMinimumRate(defaultScenario, 'netIncome', -1, 160, rules2026).state).toBe('blocked')
  })
})
