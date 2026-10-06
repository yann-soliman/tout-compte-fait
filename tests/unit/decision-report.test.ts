import { expect, it } from 'vitest'
import { defaultScenario } from '../../src/domain/defaults'
import { rules2026 } from '../../src/domain/rules/2026'
import { createReportOffers } from '../../src/domain/decision-report'

it('derives only selected offers with stable identities without mutating snapshots', () => {
  const saved = ['a', 'b'].map((id) => ({
    id,
    name: 'Même nom',
    savedAt: '2026-10-04T00:00:00Z',
    scenario: structuredClone(defaultScenario),
  }))
  const before = JSON.stringify(saved)
  const offers = createReportOffers(defaultScenario, saved, ['b'], rules2026)
  expect(offers.map((o) => o.id)).toEqual(['current', 'saved:b'])
  expect(offers[1]!.name).toBe('Même nom')
  expect(offers[0]!.result.micro.grossIncome).toBe(9_180_000)
  expect(offers[0]!.result.microCycle!.firstTurnover).toBe(10_000_000)
  expect(offers[0]!.result.microCycle!.secondTurnover).toBe(8_360_000)
  expect(offers[0]!.sources.length).toBeGreaterThan(0)
  expect(offers[0]!.result.micro.retirement).toBeUndefined()
  expect(JSON.stringify(saved)).toBe(before)
})
