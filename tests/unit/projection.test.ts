import { describe, expect, it } from 'vitest'
import { buildProjection } from '../../src/domain/projection'
import { calculateAnnualComparison } from '../../src/domain/calculate'
import { defaultScenario } from '../../src/domain/defaults'
import { rules2026 } from '../../src/domain/rules/2026'
import { assertMoneyCents } from '../../src/domain/money'
describe('projection annuelle recalculée', () => {
  it('crée un point par année et conserve la première valeur annuelle non lissée', () => {
    const p = buildProjection(defaultScenario, rules2026, 10, 0)
    expect(p).toHaveLength(10)
    expect(p[0]!.microCumulative).toBe(
      calculateAnnualComparison(defaultScenario, rules2026).micro.totalValue,
    )
    expect(p.map((x) => x.microTurnover)).toEqual([
      10000000, 8360000, 10000000, 8360000, 10000000, 8360000, 10000000, 8360000, 10000000, 8360000,
    ])
    expect(p[9]!.microCumulative).toBe(64815600)
    expect(buildProjection(defaultScenario, rules2026, 5, 0)[4]!.microCumulative).toBe(33016240)
    expect(p[9]!.employeeCumulative).toBe(
      calculateAnnualComparison(defaultScenario, rules2026).employee.totalValue * 10,
    )
  })
  it('limite la durée à l’intervalle supporté', () => {
    expect(buildProjection(defaultScenario, rules2026, 0, 2)).toHaveLength(1)
    expect(buildProjection(defaultScenario, rules2026, 40, 2)).toHaveLength(30)
  })
  it('croît les assiettes brutes et recalcule les charges plutôt que le net', () => {
    const p = buildProjection(defaultScenario, rules2026, 3, 10)
    expect(p.map((x) => x.microTurnover)).toEqual([10000000, 8360000, 12100000])
    expect(p[2]!.microAnnual).toBe(8648200)
    const grown = {
      ...defaultScenario,
      employee: {
        ...defaultScenario.employee,
        grossAnnualSalary: assertMoneyCents(5500000),
        annualBenefits: assertMoneyCents(330000),
      },
    }
    expect(p[1]!.employeeAnnual).toBe(
      calculateAnnualComparison(grown, rules2026).employee.totalValue,
    )
    expect(p[1]!.employeeAnnual).not.toBe(Math.round(p[0]!.employeeAnnual * 1.1))
  })
  it('franchit le seuil et réinitialise après une année sous le plafond', () => {
    const s = {
      ...defaultScenario,
      micro: { ...defaultScenario.micro, dailyRate: assertMoneyCents(40000) },
    }
    expect(buildProjection(s, rules2026, 4, 10).map((x) => x.microTurnover)).toEqual([
      8000000, 8800000, 8360000, 10648000,
    ])
    expect(buildProjection(defaultScenario, rules2026, 4, -10).map((x) => x.microTurnover)).toEqual(
      [10000000, 8360000, 8100000, 7290000],
    )
    expect(
      buildProjection(defaultScenario, rules2026, 3, -100).map((x) => x.microTurnover),
    ).toEqual([10000000, 0, 0])
  })
  it('applique prorata année 1 et plein plafond ensuite sans diminuer le premier CA', () => {
    const s = { ...defaultScenario, activityStartDate: '2026-12-31' }
    expect(buildProjection(s, rules2026, 3, 0).map((x) => x.microTurnover)).toEqual([
      10000000, 8360000, 10000000,
    ])
  })
  it('garde les centimes exacts et rejette entrées/catalogues/plages invalides', () => {
    const s = {
      ...defaultScenario,
      micro: { ...defaultScenario.micro, dailyRate: assertMoneyCents(1), billedDays: 1 },
    }
    expect(buildProjection(s, rules2026, 2, 50)[1]!.microTurnover).toBe(2)
    expect(() => buildProjection(s, rules2026, NaN, 0)).toThrow(RangeError)
    expect(() => buildProjection(s, rules2026, 2, NaN)).toThrow(RangeError)
    expect(() => buildProjection({ ...s, activityStartDate: 'bad' }, rules2026, 2, 0)).toThrow(
      RangeError,
    )
    expect(() => buildProjection(s, { ...rules2026, year: 2025 }, 2, 0)).toThrow(RangeError)
    expect(() =>
      buildProjection(
        {
          ...s,
          employee: { ...s.employee, grossAnnualSalary: assertMoneyCents(Number.MAX_SAFE_INTEGER) },
        },
        rules2026,
        30,
        100,
      ),
    ).toThrow(RangeError)
  })
})
