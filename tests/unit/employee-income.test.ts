import { describe, expect, it } from 'vitest'
import { calculateEmployeeIncome } from '../../src/domain/employee'
import { defaultScenario } from '../../src/domain/defaults'
import { assertMoneyCents } from '../../src/domain/money'
import { rules2026 } from '../../src/domain/rules/2026'

describe('calculateEmployeeIncome', () => {
  it.each([4_805_999, 4_806_000, 4_806_001, 19_224_000, 38_448_000])(
    'calculates every applicable band at %s cents',
    (gross) => {
      const result = calculateEmployeeIncome(
        { ...defaultScenario.employee, grossAnnualSalary: assertMoneyCents(gross) },
        rules2026,
      )
      expect(result.netIncome).toBe(gross - result.statutoryDeductions)
      expect(result.deductions.every((line) => Number.isSafeInteger(line.amount))).toBe(true)
    },
  )

  it('applies Apec only to cadres and CET only strictly above one PASS', () => {
    const atPass = calculateEmployeeIncome(
      { ...defaultScenario.employee, grossAnnualSalary: assertMoneyCents(4_806_000) },
      rules2026,
    )
    const abovePass = calculateEmployeeIncome(
      { ...defaultScenario.employee, grossAnnualSalary: assertMoneyCents(4_806_001) },
      rules2026,
    )
    const nonCadre = calculateEmployeeIncome(
      { ...defaultScenario.employee, category: 'non-cadre' },
      rules2026,
    )
    expect(atPass.deductions.some((line) => line.id === 'cet')).toBe(false)
    expect(abovePass.deductions.some((line) => line.id === 'cet')).toBe(true)
    expect(nonCadre.deductions.some((line) => line.id === 'apec')).toBe(false)
  })

  it('does not apply work ratio to the entered gross salary a second time', () => {
    const full = calculateEmployeeIncome(defaultScenario.employee, rules2026)
    const partTime = calculateEmployeeIncome(
      { ...defaultScenario.employee, workRatioPercent: 50 },
      rules2026,
    )
    expect(partTime).toEqual(full)
  })

  it('uses only the published general-scheme deduction set', () => {
    const result = calculateEmployeeIncome(
      { ...defaultScenario.employee, grossAnnualSalary: assertMoneyCents(38_448_000) },
      rules2026,
    )
    expect(result.deductions.map((line) => line.id)).toEqual([
      'old-age-uncapped',
      'old-age-capped',
      'csg-through-four-pass',
      'csg-above-four-pass',
      'crds-through-four-pass',
      'crds-above-four-pass',
      'agirc-arrco-t1',
      'agirc-arrco-t2',
      'ceg-t1',
      'ceg-t2',
      'cet',
      'apec',
    ])
  })
})
