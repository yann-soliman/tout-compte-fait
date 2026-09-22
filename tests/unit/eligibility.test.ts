import { describe, expect, it } from 'vitest'
import { assessMicroEligibility } from '../../src/domain/eligibility'
import { defaultScenario } from '../../src/domain/defaults'
import { assertMoneyCents } from '../../src/domain/money'
import { rules2026 } from '../../src/domain/rules/2026'

describe('assessMicroEligibility', () => {
  it.each([
    [8_359_999, 'not-confirmed'],
    [8_360_000, 'not-confirmed'],
    [8_360_001, 'ceiling-exceeded'],
  ] as const)('assesses the full-year boundary at %s cents', (dailyRate, state) => {
    const assessment = assessMicroEligibility(
      { ...defaultScenario.micro, dailyRate: assertMoneyCents(dailyRate), billedDays: 1 },
      undefined,
      rules2026,
    )
    expect(assessment.state).toBe(state)
  })

  it('compares the prorated ceiling without inventing a rounding rule', () => {
    const start = '2026-07-02'
    const days = 183
    const exactFloor = Math.floor((rules2026.microTurnoverCeiling.value * days) / 365)
    for (const [turnover, state] of [
      [exactFloor - 1, 'not-confirmed'],
      [exactFloor, 'not-confirmed'],
      [exactFloor + 1, 'ceiling-exceeded'],
    ] as const) {
      expect(
        assessMicroEligibility(
          { ...defaultScenario.micro, dailyRate: assertMoneyCents(turnover), billedDays: 1 },
          start,
          rules2026,
        ).state,
      ).toBe(state)
    }
  })

  it('never claims confirmed eligibility without prior-year history', () => {
    const result = assessMicroEligibility(defaultScenario.micro, undefined, rules2026)
    expect(result.state).toBe('ceiling-exceeded')
    expect(result.state).not.toBe('confirmed-eligible')
  })

  it('rejects an unsupported activity as out of scope', () => {
    const result = assessMicroEligibility(
      { ...defaultScenario.micro, activity: 'regulated-cipav' } as never,
      undefined,
      rules2026,
    )
    expect(result.state).toBe('out-of-scope')
  })
})
