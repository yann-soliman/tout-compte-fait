import { describe, expect, it } from 'vitest'
import { calculateComparison, forPeriod } from '../../src/domain/calculate'
import { defaultScenario } from '../../src/domain/defaults'
import { rules2026 } from '../../src/domain/rules/2026'

describe('calculateComparison', () => {
  it('aggregates annual statutory and economic results with traceable sources', () => {
    const result = calculateComparison(defaultScenario, rules2026)

    expect(result.confidence).toBe('established')
    expect(result.micro.netIncome).toBeGreaterThan(0)
    expect(result.employee.netIncome).toBeGreaterThan(0)
    expect(result.micro.ruleReferences).not.toHaveLength(0)
    expect(result.employee.ruleReferences).not.toHaveLength(0)
    expect(result.difference).toBe(result.micro.totalValue - result.employee.totalValue)
    expect(result.netIncomeDifference).toBe(result.micro.netIncome - result.employee.netIncome)
    expect(result.economicValueDifference).toBe(result.difference)
  })

  it('rejects a missing or non-known required rule', () => {
    expect(() =>
      calculateComparison(defaultScenario, { ...rules2026, microSocial: undefined } as never),
    ).toThrow(/microSocial/)
    expect(() =>
      calculateComparison(defaultScenario, {
        ...rules2026,
        cfe: { ...rules2026.cfe, source: { ...rules2026.cfe.source, status: 'provisional' } },
      }),
    ).toThrow(/provisoire/)
  })

  it('changes display period without changing the annual value', () => {
    expect(forPeriod(12000, 'annual')).toBe(12000)
    expect(forPeriod(12000, 'monthly')).toBe(1000)
  })

  it('propagates estimated confidence when CFE is unknown', () => {
    const result = calculateComparison(
      { ...defaultScenario, micro: { ...defaultScenario.micro, cfeAnnual: undefined } },
      rules2026,
    )
    expect(result.confidence).toBe('estimated')
    expect(result.warnings).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: 'cfe-unknown' })]),
    )
  })
})
