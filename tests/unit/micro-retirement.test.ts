import { describe, expect, it } from 'vitest'
import { defaultScenario } from '../../src/domain/defaults'
import { assertMoneyCents } from '../../src/domain/money'
import { calculateMicroRetirement } from '../../src/domain/retirement'
import { rules2026 } from '../../src/domain/rules/2026'

describe('calculateMicroRetirement', () => {
  it('uses the official micro-social allocation and caps base quarters at four', () => {
    const zero = calculateMicroRetirement(
      { ...defaultScenario.micro, dailyRate: assertMoneyCents(0), billedDays: 0 },
      rules2026,
    )
    const defaultResult = calculateMicroRetirement(defaultScenario.micro, rules2026)
    expect(zero.base.quarters).toBe(0)
    expect(defaultResult.base.qualifyingIncome).toBe(6_381_233)
    expect(defaultResult.base.quarters).toBe(4)
  })

  it('compares the exact qualifying base around the first-quarter boundary', () => {
    // With one billed day, these turnovers surround the exact inverse of the 1,803 € threshold.
    const below = calculateMicroRetirement(
      { ...defaultScenario.micro, dailyRate: assertMoneyCents(271_245), billedDays: 1 },
      rules2026,
    )
    const above = calculateMicroRetirement(
      { ...defaultScenario.micro, dailyRate: assertMoneyCents(271_246), billedDays: 1 },
      rules2026,
    )
    expect(below.base.quarters).toBe(0)
    expect(above.base.quarters).toBe(1)
  })

  it('blocks non-applicable complementary parameters and rejects unsupported affiliations', () => {
    const result = calculateMicroRetirement(defaultScenario.micro, rules2026)
    expect(result.complementary.points).toBe('unavailable')
    expect(result.complementary.confidence).toBe('blocked')
    expect(() =>
      calculateMicroRetirement({ ...defaultScenario.micro, activity: 'cipav' } as never, rules2026),
    ).toThrow(/hors périmètre/)
  })
})
