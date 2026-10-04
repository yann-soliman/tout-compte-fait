import { describe, expect, it } from 'vitest'
import { assessMicroEligibility } from '../../src/domain/eligibility'
import { calculateMicroIncome } from '../../src/domain/micro'
import { calculateComparison } from '../../src/domain/calculate'
import { defaultScenario } from '../../src/domain/defaults'
import { assertMoneyCents } from '../../src/domain/money'
import { rules2026 } from '../../src/domain/rules/2026'

describe('calculateMicroIncome', () => {
  it('uses turnover as the statutory base and deducts economic costs once', () => {
    const micro = {
      ...defaultScenario.micro,
      dailyRate: assertMoneyCents(10_000),
      billedDays: 10,
      professionalExpenses: assertMoneyCents(1_000),
      healthInsuranceMonthly: assertMoneyCents(100),
      cfeAnnual: assertMoneyCents(300),
    }
    const result = calculateMicroIncome(
      micro,
      rules2026,
      assessMicroEligibility(micro, undefined, rules2026),
    )
    expect(result.turnover).toBe(100_000)
    expect(result.deductions.map((line) => line.amount)).toEqual([25_600, 200])
    expect(result.netIncome).toBe(74_200)
    expect(result.economicCosts).toBe(2_500)
    expect(result.economicValue).toBe(71_700)
  })

  it('rounds each verified contribution to the nearest cent', () => {
    const micro = { ...defaultScenario.micro, dailyRate: assertMoneyCents(250), billedDays: 1 }
    const result = calculateMicroIncome(
      micro,
      rules2026,
      assessMicroEligibility(micro, undefined, rules2026),
    )
    expect(result.deductions.map((line) => line.amount)).toEqual([64, 1])
  })

  it('marks unknown CFE and an unconfirmed zero as estimated', () => {
    for (const micro of [
      { ...defaultScenario.micro, cfeAnnual: undefined },
      { ...defaultScenario.micro, cfeAnnual: assertMoneyCents(0), cfeExemptionConfirmed: false },
    ]) {
      const result = calculateMicroIncome(
        micro,
        rules2026,
        assessMicroEligibility(micro, undefined, rules2026),
      )
      expect(result.confidence).toBe('estimated')
      expect(result.warnings).toEqual(
        expect.arrayContaining([expect.objectContaining({ code: 'cfe-unknown' })]),
      )
    }
  })

  it('accepts zero CFE only with explicit exemption confirmation', () => {
    const micro = {
      ...defaultScenario.micro,
      cfeAnnual: assertMoneyCents(0),
      cfeExemptionConfirmed: true,
    }
    const result = calculateMicroIncome(
      micro,
      rules2026,
      assessMicroEligibility(micro, undefined, rules2026),
    )
    expect(result.confidence).toBe('established')
  })

  it('treats an omitted CFE with a confirmed exemption as known zero in the comparison engine', () => {
    const scenario = {
      ...defaultScenario,
      micro: {
        ...defaultScenario.micro,
        cfeAnnual: undefined,
        cfeExemptionConfirmed: true,
      },
    }
    const result = calculateComparison(scenario, rules2026)
    expect(result.micro.confidence).toBe('established')
    expect(result.micro.warnings).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ code: 'cfe-unknown' })]),
    )
    expect(result.micro.economicCosts).toBe(
      scenario.micro.professionalExpenses + scenario.micro.healthInsuranceMonthly * 12,
    )
  })
})
