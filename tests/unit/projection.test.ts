import { describe, expect, it } from 'vitest'
import { calculateComparison } from '../../src/domain/calculate'
import { defaultScenario } from '../../src/domain/defaults'
import { buildProjection } from '../../src/domain/projection'
import { rules2026 } from '../../src/domain/rules/2026'

describe('buildProjection', () => {
  const result = calculateComparison(defaultScenario, rules2026)

  it('creates one cumulative point per selected year', () => {
    const points = buildProjection(result, 10, 0)

    expect(points).toHaveLength(10)
    expect(points[0]?.microCumulative).toBe(result.micro.totalValue)
    expect(points[9]?.microCumulative).toBe(result.micro.totalValue * 10)
  })

  it('limits projection duration to the supported range', () => {
    expect(buildProjection(result, 0, 2)).toHaveLength(1)
    expect(buildProjection(result, 40, 2)).toHaveLength(30)
  })
})
