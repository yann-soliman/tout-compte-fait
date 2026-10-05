import { describe, expect, it } from 'vitest'
import * as tax from '../../src/domain/income-tax'
import { defaultScenario } from '../../src/domain/defaults'
import { calculateComparison } from '../../src/domain/calculate'
import { calculateEiIncome } from '../../src/domain/ei'
import { rules2026 } from '../../src/domain/rules/2026'

const comparison = calculateComparison(defaultScenario, rules2026)
const ei = calculateEiIncome({
  turnover: 10000000,
  professionalExpenses: 240000,
  cfeAnnual: 60000,
  cfeExemptionConfirmed: false,
  healthInsuranceAnnual: 30000,
})

describe('IR au barème de référence 2026 sur revenus 2025', () => {
  it.each([-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])(
    'rejette base fiscale invalide %s',
    (value) => {
      expect(() => tax.calculateHouseholdTax(value, tax.defaultTaxHousehold)).toThrow(RangeError)
    },
  )
  it.each([-1, 0.5, 7])('rejette enfants hors périmètre %s', (children) => {
    expect(() =>
      tax.calculateHouseholdTax(3000000, { ...tax.defaultTaxHousehold, children }),
    ).toThrow(RangeError)
  })
  it.each([0, 1, 30400, 30500])('limite le minimum micro aux recettes %s', (amount) => {
    const scenario = {
      ...defaultScenario,
      micro: {
        ...defaultScenario.micro,
        dailyRate: amount as typeof defaultScenario.micro.dailyRate,
        billedDays: 1,
      },
    }
    const result = tax.calculateTaxBases(
      scenario,
      calculateComparison(scenario, rules2026),
      ei,
      amount,
    )
    expect(result.micro).toBe(0)
    expect(result.employee).toBe(0)
  })
  it('applique plafond forfait salarial et conserve le cash inchangé', () => {
    const bases = tax.calculateTaxBases(defaultScenario, comparison, ei, 20000000)
    expect(bases.employee).toBe(18544500)
    expect(comparison.employee.netIncome).toBe(
      calculateComparison(defaultScenario, rules2026).employee.netIncome,
    )
  })
  it.each([1160000, 2957900, 8457700, 18191700])(
    'garde l’arrondi fiscal euro explicite autour de %s',
    (threshold) => {
      const left = tax.calculateHouseholdTax(threshold - 1, tax.defaultTaxHousehold)
      const right = tax.calculateHouseholdTax(threshold + 1, tax.defaultTaxHousehold)
      expect(left).toEqual(right)
      expect(left.due % 100).toBe(0)
    },
  )
  it('réconcilie les trois disponibles sans ajouter les avantages', () => {
    const out = tax.calculateAfterTaxComparison(
      defaultScenario,
      comparison,
      ei,
      tax.defaultTaxHousehold,
    )
    for (const result of Object.values(out)) {
      expect(result.status).toBe('estimated')
      if (result.status !== 'estimated') throw new Error('Bloqué')
      expect(result.cashAfter + result.additionalTax).toBe(result.cashBefore)
      expect(result.baselineTax).toBe(0)
    }
    expect(out.micro.status === 'estimated' && out.micro.additionalTax).toBe(1290400)
  })

  it('ne double-arrondit pas la décote à la frontière DGFiP 28 500 euros / 1,5 part', () => {
    expect(
      tax.calculateHouseholdTax(2850000, { ...tax.defaultTaxHousehold, children: 1 }).due,
    ).toBe(87700)
  })
  it('bloque déficit EI, hauts revenus et plages sûres au lieu d’un faux disponible', () => {
    const deficit = calculateEiIncome({
      turnover: 0,
      professionalExpenses: 240000,
      cfeAnnual: 60000,
      cfeExemptionConfirmed: false,
      healthInsuranceAnnual: 30000,
    })
    const out = tax.calculateAfterTaxComparison(
      defaultScenario,
      comparison,
      deficit,
      tax.defaultTaxHousehold,
    )
    expect(out.ei.status).toBe('blocked')
    expect(out.employee.status).toBe('estimated')
    const high = tax.calculateAfterTaxComparison(defaultScenario, comparison, ei, {
      ...tax.defaultTaxHousehold,
      otherTaxableIncome: 25000000,
    })
    expect(high.employee.status).toBe('blocked')
    const unsafe = tax.calculateAfterTaxComparison(defaultScenario, comparison, ei, {
      ...tax.defaultTaxHousehold,
      otherTaxableIncome: Number.MAX_SAFE_INTEGER,
    })
    expect(unsafe.employee.status).toBe('blocked')
  })
  it('bloque micro si CFE inconnue sans bloquer le salaire', () => {
    const scenario = {
      ...defaultScenario,
      micro: { ...defaultScenario.micro, cfeAnnual: undefined, cfeExemptionConfirmed: false },
    }
    const out = tax.calculateAfterTaxComparison(
      scenario,
      calculateComparison(scenario, rules2026),
      ei,
      tax.defaultTaxHousehold,
    )
    expect(out.micro.status).toBe('blocked')
    expect(out.employee.status).toBe('estimated')
  })
  it('attribue seulement l’IR supplémentaire et préserve le cash du conjoint hors comparaison', () => {
    expect(tax).toHaveProperty('calculateAfterTaxComparison')
    const household = { status: 'couple' as const, children: 0, otherTaxableIncome: 5000000 }
    const result = tax.calculateAfterTaxComparison(defaultScenario, comparison, ei, household)
    const employee = result.employee
    expect(employee.status).toBe('estimated')
    if (employee.status !== 'estimated') throw new Error('Bloqué')
    expect(employee.baselineTax).toBe(279900)
    expect(employee.additionalTax).toBe(employee.householdTax - employee.baselineTax)
    expect(employee.cashAfter + employee.additionalTax).toBe(comparison.employee.netIncome)
  })
  it('reconstruit la base salariale sans override et réintègre chaque base CSG/CRDS', () => {
    expect(tax.calculateTaxBases(defaultScenario, comparison, ei).employee).toBe(3685100)
    const synthetic = {
      ...comparison,
      employee: {
        ...comparison.employee,
        netIncome: 100000 as typeof comparison.employee.netIncome,
        statutoryDeductions: [
          { id: 'csg-a', base: 101, amount: 7 },
          { id: 'csg-b', base: 499, amount: 34 },
          { id: 'crds-a', base: 600, amount: 3 },
          { id: 'pension', base: 600, amount: 40 },
        ] as typeof comparison.employee.statutoryDeductions,
      },
    }
    // 101×2.4%=2 cents; 499×2.4%=12 cents; CRDS=3. Pension is not reintegrated.
    expect(tax.calculateTaxBases(defaultScenario, synthetic, ei).employeeDeclared).toBe(100017)
  })
  it('sépare bases fiscales et cash avec salaire déclaré et CSG EI réintégrée', () => {
    expect(tax).toHaveProperty('calculateTaxBases')
    const bases = tax.calculateTaxBases(defaultScenario, comparison, ei, 3000000)
    expect(bases.employee).toBe(2700000)
    expect(bases.micro).toBe(6600000)
    expect(bases.ei).toBe(6894100)
  })
  it('applique décote, parts standard, plafond et seuil de recouvrement', () => {
    expect(
      tax.calculateHouseholdTax(5_000_000, { status: 'couple', children: 0, otherTaxableIncome: 0 })
        .due,
    ).toBe(279900)
    expect(
      tax.calculateHouseholdTax(5_000_000, { status: 'single', children: 1, otherTaxableIncome: 0 })
        .due,
    ).toBe(629700)
    expect(
      tax.calculateHouseholdTax(10_000_000, {
        status: 'couple',
        children: 0,
        otherTaxableIncome: 0,
      }).due,
    ).toBe(1620800)
    expect(
      tax.calculateHouseholdTax(1_721_400, { status: 'single', children: 0, otherTaxableIncome: 0 })
        .due,
    ).toBe(0)
  })
  it('reproduit le cas officiel célibataire 30 000 euros et expose les années distinctes', () => {
    expect(tax).toHaveProperty('calculateHouseholdTax')
    const result = tax.calculateHouseholdTax(3_000_000, {
      status: 'single',
      children: 0,
      otherTaxableIncome: 0,
    })
    expect(result.due).toBe(210400)
    expect(result.parts).toBe(1)
  })
})
