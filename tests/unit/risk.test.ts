import { describe, expect, it } from 'vitest'
import { calculateComparison } from '../../src/domain/calculate'
import { defaultScenario as applicationDefaults } from '../../src/domain/defaults'
import { calculateStress } from '../../src/domain/risk'
import { assertMoneyCents } from '../../src/domain/money'
import { rules2026 } from '../../src/domain/rules/2026'

// Fixed regression fixture: do not couple cent-rounding proofs to illustrative UI defaults.
const defaultScenario = {
  ...applicationDefaults,
  micro: { ...applicationDefaults.micro, dailyRate: assertMoneyCents(60_000), billedDays: 160 },
}

describe('annual stress sensitivity', () => {
  it.each([
    [0.29, 59_826],
    [2.51, 58_494],
    [1.15, 59_310],
  ])('applies valid hundredth-percent decrease %s with integer-cent rounding', (percent, cents) => {
    const result = calculateStress(
      defaultScenario,
      { daysLost: 0, rateDecreasePercent: percent, extraAnnualExpenses: 0 },
      rules2026,
    )
    expect(result.stressedDailyRateCents).toBe(cents)
  })

  it('calculates exact annual cents from lost days, a lower daily rate and extra expenses', () => {
    const result = calculateStress(
      defaultScenario,
      { daysLost: 10, rateDecreasePercent: 10, extraAnnualExpenses: 10_000 },
      rules2026,
    )
    const expected = calculateComparison(
      {
        ...defaultScenario,
        micro: {
          ...defaultScenario.micro,
          dailyRate: assertMoneyCents(54_000),
          billedDays: 150,
          professionalExpenses: assertMoneyCents(
            defaultScenario.micro.professionalExpenses + 10_000,
          ),
        },
      },
      rules2026,
    )
    expect(result.remainingDays).toBe(150)
    expect(result.stressedDailyRateCents).toBe(54_000)
    expect(result.currentMicroNetIncomeCents).toBe(
      calculateComparison(defaultScenario, rules2026).micro.netIncome,
    )
    expect(result.stressedMicroNetIncomeCents).toBe(expected.micro.netIncome)
    expect(result.stressedMicroEconomicValueCents).toBe(expected.micro.totalValue)
    expect(result.economicDifferenceVsEmployeeCents).toBe(
      expected.micro.totalValue - expected.employee.totalValue,
    )
  })

  it('clamps lost days at zero and accepts the inclusive maximum stress bounds', () => {
    const result = calculateStress(
      defaultScenario,
      { daysLost: 366, rateDecreasePercent: 100, extraAnnualExpenses: 10_000_000 },
      rules2026,
    )
    expect(result.remainingDays).toBe(0)
    expect(result.stressedDailyRateCents).toBe(0)
    expect(result.stressedMicroNetIncomeCents).toBe(0)
    expect(Number.isSafeInteger(result.stressedMicroEconomicValueCents)).toBe(true)
  })

  it.each([
    { daysLost: -1, rateDecreasePercent: 0, extraAnnualExpenses: 0 },
    { daysLost: 367, rateDecreasePercent: 0, extraAnnualExpenses: 0 },
    { daysLost: 1.5, rateDecreasePercent: 0, extraAnnualExpenses: 0 },
    { daysLost: 0, rateDecreasePercent: 100.01, extraAnnualExpenses: 0 },
    { daysLost: 0, rateDecreasePercent: 0.001, extraAnnualExpenses: 0 },
    { daysLost: 0, rateDecreasePercent: Number.NaN, extraAnnualExpenses: 0 },
    { daysLost: 0, rateDecreasePercent: 10, extraAnnualExpenses: -1 },
    { daysLost: 0, rateDecreasePercent: 10, extraAnnualExpenses: 10_000_001 },
  ])('rejects out-of-range stress input %#', (input) => {
    expect(() => calculateStress(defaultScenario, input, rules2026)).toThrow()
  })

  it('is invariant to display period and excludes retirement rights from economic values', () => {
    const annual = calculateStress(
      defaultScenario,
      { daysLost: 5, rateDecreasePercent: 2.5, extraAnnualExpenses: 500 },
      rules2026,
    )
    const monthly = calculateStress(
      { ...defaultScenario, displayPeriod: 'monthly' },
      { daysLost: 5, rateDecreasePercent: 2.5, extraAnnualExpenses: 500 },
      rules2026,
    )
    expect(monthly).toEqual(annual)

    const noRetirement = calculateStress(
      {
        ...defaultScenario,
        retirement: { ...defaultScenario.retirement, includeRights: false },
      },
      { daysLost: 5, rateDecreasePercent: 2.5, extraAnnualExpenses: 500 },
      rules2026,
    )
    expect(noRetirement.stressedMicroEconomicValueCents).toBe(
      annual.stressedMicroEconomicValueCents,
    )
  })

  it('preserves stressed engine confidence and warnings for unknown CFE and ceiling excess', () => {
    const scenario = {
      ...defaultScenario,
      activityStartDate: '2026-12-01',
      micro: {
        ...defaultScenario.micro,
        cfeAnnual: undefined,
        cfeExemptionConfirmed: false,
      },
    }
    const result = calculateStress(
      scenario,
      { daysLost: 0, rateDecreasePercent: 0, extraAnnualExpenses: 0 },
      rules2026,
    )
    expect(result.stressedMicroConfidence).toBe('estimated')
    expect(result.stressedMicroWarnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'cfe-unknown' }),
        expect.objectContaining({ code: 'ceiling-exceeded' }),
      ]),
    )
  })
})
