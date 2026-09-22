import { describe, expect, it } from 'vitest'
import { defaultScenario } from '../../src/domain/defaults'
import { validateScenario } from '../../src/domain/validate'

describe('validateScenario', () => {
  it('accepts a complete scenario and every inclusive boundary', () => {
    expect(validateScenario(defaultScenario)).toEqual(defaultScenario)
    expect(
      validateScenario({
        ...defaultScenario,
        activityStartDate: '2026-01-01',
        micro: { ...defaultScenario.micro, billedDays: 0 },
        employee: {
          ...defaultScenario.employee,
          workRatioPercent: 1,
          paidLeaveWeeks: 0,
          rttDays: 0,
        },
        projection: { years: 1, annualGrowthRate: -100 },
      }),
    ).toBeTruthy()
    expect(
      validateScenario({
        ...defaultScenario,
        activityStartDate: '2026-12-31',
        micro: { ...defaultScenario.micro, billedDays: 366 },
        employee: {
          ...defaultScenario.employee,
          workRatioPercent: 100,
          paidLeaveWeeks: 52,
          rttDays: 366,
        },
        projection: { years: 30, annualGrowthRate: 100 },
      }),
    ).toBeTruthy()
  })

  it.each([
    ['referenceYear', { referenceYear: 2025 }],
    ['billedDays below', { micro: { ...defaultScenario.micro, billedDays: -1 } }],
    ['billedDays above', { micro: { ...defaultScenario.micro, billedDays: 367 } }],
    ['work ratio below', { employee: { ...defaultScenario.employee, workRatioPercent: 0 } }],
    ['work ratio above', { employee: { ...defaultScenario.employee, workRatioPercent: 101 } }],
    ['leave below', { employee: { ...defaultScenario.employee, paidLeaveWeeks: -0.5 } }],
    ['leave above', { employee: { ...defaultScenario.employee, paidLeaveWeeks: 52.5 } }],
    ['leave increment', { employee: { ...defaultScenario.employee, paidLeaveWeeks: 1.25 } }],
    ['RTT below', { employee: { ...defaultScenario.employee, rttDays: -1 } }],
    ['RTT above', { employee: { ...defaultScenario.employee, rttDays: 367 } }],
    ['years below', { projection: { ...defaultScenario.projection, years: 0 } }],
    ['years above', { projection: { ...defaultScenario.projection, years: 31 } }],
    ['growth below', { projection: { ...defaultScenario.projection, annualGrowthRate: -100.01 } }],
    ['growth above', { projection: { ...defaultScenario.projection, annualGrowthRate: 100.01 } }],
  ])('rejects %s', (_label, patch) => {
    expect(() => validateScenario({ ...defaultScenario, ...patch } as never)).toThrow()
  })

  it.each([1.5, Number.MAX_SAFE_INTEGER + 1, -1])(
    'rejects invalid monetary cents: %s',
    (dailyRate) => {
      expect(() =>
        validateScenario({
          ...defaultScenario,
          micro: { ...defaultScenario.micro, dailyRate: dailyRate as never },
        }),
      ).toThrow(/centimes|montant/i)
    },
  )

  it.each(['2025-12-31', '2027-01-01', '2026-02-30', 'not-a-date'])('rejects date %s', (date) => {
    expect(() => validateScenario({ ...defaultScenario, activityStartDate: date })).toThrow(/date/i)
  })
})
