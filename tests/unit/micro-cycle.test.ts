import { describe, expect, it } from 'vitest'
import { calculateComparison, calculateAnnualComparison } from '../../src/domain/calculate'
import { calculateAfterTaxComparison, defaultTaxHousehold } from '../../src/domain/income-tax'
import { defaultScenario } from '../../src/domain/defaults'
import { rules2026 } from '../../src/domain/rules/2026'
import { assertMoneyCents } from '../../src/domain/money'
const ei = { status: 'blocked' as const, reason: 'CFE EI inconnue', sources: [] }
const scenarioAt = (ca: number) => ({
  ...structuredClone(defaultScenario),
  micro: { ...defaultScenario.micro, dailyRate: assertMoneyCents(ca), billedDays: 1 },
})
describe('cycle micro exact', () => {
  it('bloque l’IR du cycle si une seule année dépasse le périmètre hauts revenus', () => {
    const s = scenarioAt(40000000)
    const r = calculateAfterTaxComparison(
      s,
      calculateComparison(s, rules2026),
      ei,
      defaultTaxHousehold,
    )
    expect(r.micro).toMatchObject({
      status: 'blocked',
      reason: 'Hauts revenus : CEHR/CDHR et revenu fiscal de référence hors périmètre.',
    })
    expect(r.employee.status).toBe('estimated')
  })
  it('arrondit une moyenne de cash négatif à demi-centime sans perdre le signe', () => {
    const s = scenarioAt(8360002)
    s.micro.professionalExpenses = assertMoneyCents(20000000)
    const r = calculateComparison(s, rules2026),
      cycle = r.microCycle!
    const mean = (cycle.first.totalValue + cycle.second.totalValue) / 2
    expect(mean).toBeLessThan(0)
    expect(Math.abs(mean) % 1).toBe(0.5)
    expect(r.micro.totalValue).toBe(Math.round(mean))
  })
  it('garde le CA saisi puis plafonne la seconde année, sans mutation', () => {
    const scenario = structuredClone(defaultScenario),
      before = structuredClone(scenario)
    const result = calculateComparison(scenario, rules2026)
    expect(scenario).toEqual(before)
    expect(result.microCycle).toMatchObject({
      firstTurnover: 10000000,
      secondTurnover: 8360000,
      annualAverageTurnover: 9180000,
    })
    expect(result.microCycle!.first.totalValue).toBe(7090000)
    expect(result.microCycle!.second.totalValue).toBe(5873120)
    expect(result.micro.grossIncome).toBe(9180000)
    expect(result.micro.totalValue).toBe(6481560)
    expect(result.micro.netIncome).toBe(6811560)
    expect(result.micro.statutoryDeductions!.map((d) => d.amount)).toEqual([2350080, 18360])
    expect(result.micro.eligibility?.state).toBe('ceiling-exceeded')
    expect(result.employee).toEqual(calculateAnnualComparison(scenario, rules2026).employee)
    expect(result.micro.retirement).toEqual(result.microCycle!.first.retirement)
    expect(result.economicValueDifference).toBe(
      result.micro.totalValue - result.employee.totalValue,
    )
  })
  it('respecte le seuil strict, aucun CA inférieur gonflé', () => {
    for (const ca of [0, 8000000, 8360000]) {
      const s = scenarioAt(ca)
      expect(calculateComparison(s, rules2026)).toEqual(calculateAnnualComparison(s, rules2026))
    }
    expect(calculateComparison(scenarioAt(8360001), rules2026).microCycle).toMatchObject({
      firstTurnover: 8360001,
      secondTurnover: 8360000,
    })
  })
  it('création : première année non plafonnée, seconde au plafond plein', () => {
    const s = { ...scenarioAt(5000000), activityStartDate: '2026-12-31' }
    const r = calculateComparison(s, rules2026)
    expect(r.microCycle?.firstTurnover).toBe(5000000)
    expect(r.microCycle?.secondTurnover).toBe(5000000)
    expect(r.microCycle?.first.eligibility?.applicableCeiling).toBe(22904)
    expect(r.microCycle?.second.eligibility?.applicableCeiling).toBe(8360000)
  })
  it('calcule l’IR par année et bloque aussi une CFE inconnue dans un cycle', () => {
    const s = scenarioAt(20000000),
      result = calculateComparison(s, rules2026)
    const first = calculateAfterTaxComparison(
      s,
      calculateAnnualComparison(s, rules2026),
      ei,
      defaultTaxHousehold,
    )
    const second = calculateAfterTaxComparison(
      s,
      calculateAnnualComparison(s, rules2026, 8360000),
      ei,
      defaultTaxHousehold,
    )
    const after = calculateAfterTaxComparison(s, result, ei, defaultTaxHousehold)
    expect(first.micro.status).toBe('estimated')
    expect(second.micro.status).toBe('estimated')
    expect(after.micro.status).toBe('estimated')
    if (
      first.micro.status === 'estimated' &&
      second.micro.status === 'estimated' &&
      after.micro.status === 'estimated'
    ) {
      expect(after.micro.cashAfter).toBe(
        Math.round((first.micro.cashAfter + second.micro.cashAfter) / 2),
      )
      expect(after.micro.additionalTax).toBe(
        Math.round((first.micro.additionalTax + second.micro.additionalTax) / 2),
      )
      expect(after.micro.additionalTax).not.toBe(
        calculateAfterTaxComparison(
          s,
          { ...result, microCycle: undefined },
          ei,
          defaultTaxHousehold,
        ).micro.status === 'estimated'
          ? (
              calculateAfterTaxComparison(
                s,
                { ...result, microCycle: undefined },
                ei,
                defaultTaxHousehold,
              ).micro as { additionalTax: number }
            ).additionalTax
          : -1,
      )
    }
    expect(after.employee).toEqual(first.employee)
    expect(after.ei).toEqual(first.ei)
    s.micro.cfeAnnual = undefined
    s.micro.cfeExemptionConfirmed = false
    expect(
      calculateAfterTaxComparison(s, calculateComparison(s, rules2026), ei, defaultTaxHousehold)
        .micro,
    ).toMatchObject({
      status: 'blocked',
      reason: 'CFE micro inconnue : disponible après IR indisponible.',
    })
  })
  it('réconcilie les frais et les montants négatifs au centime', () => {
    const s = scenarioAt(8360001)
    s.micro.professionalExpenses = assertMoneyCents(20000000)
    const r = calculateComparison(s, rules2026)
    expect(r.micro.totalValue).toBe(
      Math.round((r.microCycle!.first.totalValue + r.microCycle!.second.totalValue) / 2),
    )
    expect(r.micro.totalValue).toBeLessThan(0)
    expect(r.micro.netIncome - (r.micro.economicCosts ?? 0)).toBe(r.micro.totalValue)
  })
})
