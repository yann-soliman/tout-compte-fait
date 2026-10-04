import { describe, expect, it } from 'vitest'
import { defaultScenario } from '../../src/domain/defaults'
import {
  MAX_SCENARIO_IMPORT_BYTES,
  decodeScenarioCollectionJson,
  encodeScenarioCollectionJson,
  toOffersCsv,
  type NamedScenario,
} from '../../src/domain/scenario-library'
import { calculateComparison } from '../../src/domain/calculate'
import { rules2026 } from '../../src/domain/rules/2026'

const offer: NamedScenario = {
  id: 'offer-1',
  name: 'Offre normale',
  savedAt: '2026-10-04T10:00:00.000Z',
  scenario: defaultScenario,
}

function jsonWith(change: (data: Record<string, unknown>) => void): string {
  const data = {
    schemaVersion: 1,
    scenarios: [{ ...offer, scenario: structuredClone(defaultScenario) }],
  } as unknown as Record<string, unknown>
  change(data)
  return JSON.stringify(data)
}

function snapshotScenario(data: Record<string, unknown>): Record<string, unknown> {
  const first = (data.scenarios as Array<Record<string, unknown>>)[0]
  if (!first) throw new Error('Expected first snapshot')
  return first.scenario as Record<string, unknown>
}

describe('versioned scenario library', () => {
  it('round-trips a whitelisted version-1 collection and trims safe names', () => {
    const decoded = decodeScenarioCollectionJson(encodeScenarioCollectionJson([offer]))
    expect(decoded).toEqual([offer])
  })

  it.each(['2026-02-30T00:00:00Z', '2026-02-30T00:00:00.000Z'])(
    'rejects a normalized impossible savedAt calendar date: %s',
    (savedAt) => {
      const json = jsonWith((data) => {
        ;(data.scenarios as Array<Record<string, unknown>>)[0]!.savedAt = savedAt
      })
      expect(() => decodeScenarioCollectionJson(json)).toThrow(/date de sauvegarde/i)
    },
  )

  it.each(['2026-10-04T10:00:00Z', '2026-10-04T10:00:00.000Z'])(
    'accepts a valid ISO savedAt variant with exact round-trip: %s',
    (savedAt) => {
      const json = jsonWith((data) => {
        ;(data.scenarios as Array<Record<string, unknown>>)[0]!.savedAt = savedAt
      })
      expect(decodeScenarioCollectionJson(json)[0]?.savedAt).toBe(savedAt)
    },
  )

  it('calculates an imported scenario with omitted CFE and a confirmed exemption as established', () => {
    const json = jsonWith((data) => {
      const scenario = snapshotScenario(data) as {
        micro: Record<string, unknown>
      }
      delete scenario.micro.cfeAnnual
      scenario.micro.cfeExemptionConfirmed = true
    })
    const [imported] = decodeScenarioCollectionJson(json)
    expect(imported).toBeDefined()
    const result = calculateComparison(imported!.scenario, rules2026)
    expect(result.micro.confidence).toBe('established')
    expect(result.micro.warnings).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ code: 'cfe-unknown' })]),
    )
  })

  it.each([
    ['malformed JSON', '{'],
    ['unsupported version', JSON.stringify({ schemaVersion: 2, scenarios: [] })],
    ['duplicate IDs', JSON.stringify({ schemaVersion: 1, scenarios: [offer, offer] })],
    [
      'invalid nested enum',
      jsonWith((data) => {
        snapshotScenario(data).displayPeriod = 'weekly'
      }),
    ],
    [
      'unsupported year',
      jsonWith((data) => {
        snapshotScenario(data).referenceYear = 2027
      }),
    ],
    [
      'impossible date',
      jsonWith((data) => {
        snapshotScenario(data).activityStartDate = '2026-02-30'
      }),
    ],
    [
      'non-finite amount',
      jsonWith((data) => {
        const snapshot = snapshotScenario(data) as { micro: Record<string, unknown> }
        snapshot.micro.dailyRate = Number.NaN
      }),
    ],
    [
      'unsafe integer amount',
      jsonWith((data) => {
        const snapshot = snapshotScenario(data) as { employee: Record<string, unknown> }
        snapshot.employee.grossAnnualSalary = Number.MAX_SAFE_INTEGER + 1
      }),
    ],
    [
      'unknown nested property',
      jsonWith((data) => {
        const snapshot = snapshotScenario(data) as { micro: Record<string, unknown> }
        snapshot.micro.injected = { harmless: true }
      }),
    ],
    [
      'invalid activity enum',
      jsonWith((data) => {
        ;(snapshotScenario(data) as { micro: Record<string, unknown> }).micro.activity = 'cipav'
      }),
    ],
    [
      'invalid employee category',
      jsonWith((data) => {
        ;(snapshotScenario(data) as { employee: Record<string, unknown> }).employee.category =
          'other'
      }),
    ],
    [
      'invalid retirement mode',
      jsonWith((data) => {
        ;(
          snapshotScenario(data) as { retirement: Record<string, unknown> }
        ).retirement.valuationMode = 'future'
      }),
    ],
    [
      'invalid boolean',
      jsonWith((data) => {
        ;(
          snapshotScenario(data) as { retirement: Record<string, unknown> }
        ).retirement.includeRights = 'true'
      }),
    ],
    [
      'negative money',
      jsonWith((data) => {
        ;(snapshotScenario(data) as { micro: Record<string, unknown> }).micro.professionalExpenses =
          -1
      }),
    ],
    [
      'invalid days boundary',
      jsonWith((data) => {
        ;(snapshotScenario(data) as { micro: Record<string, unknown> }).micro.billedDays = 367
      }),
    ],
    [
      'fractional worked ratio',
      jsonWith((data) => {
        ;(
          snapshotScenario(data) as { employee: Record<string, unknown> }
        ).employee.workRatioPercent = 50.5
      }),
    ],
    [
      'invalid leave increments',
      jsonWith((data) => {
        ;(snapshotScenario(data) as { employee: Record<string, unknown> }).employee.paidLeaveWeeks =
          5.25
      }),
    ],
    [
      'invalid projection year range',
      jsonWith((data) => {
        ;(snapshotScenario(data) as { projection: Record<string, unknown> }).projection.years = 31
      }),
    ],
    [
      'non-finite annual growth',
      jsonWith((data) => {
        ;(
          snapshotScenario(data) as { projection: Record<string, unknown> }
        ).projection.annualGrowthRate = Number.POSITIVE_INFINITY
      }),
    ],
    [
      'missing required nested key',
      jsonWith((data) => {
        delete (snapshotScenario(data) as { projection: Record<string, unknown> }).projection.years
      }),
    ],
    [
      'invalid name',
      JSON.stringify({
        schemaVersion: 1,
        scenarios: [{ ...offer, name: '   ' }],
      }),
    ],
  ])('rejects %s without accepting any partial data', (_, json) => {
    expect(() => decodeScenarioCollectionJson(json)).toThrow()
  })

  it('enforces snapshot count and the import byte limit', () => {
    const tooMany = Array.from({ length: 21 }, (_, index) => ({
      ...offer,
      id: `offer-${index}`,
    }))
    expect(() =>
      decodeScenarioCollectionJson(JSON.stringify({ schemaVersion: 1, scenarios: tooMany })),
    ).toThrow()
    expect(() => decodeScenarioCollectionJson(' '.repeat(MAX_SCENARIO_IMPORT_BYTES + 1))).toThrow()
    expect(
      decodeScenarioCollectionJson(
        JSON.stringify({
          schemaVersion: 1,
          scenarios: Array.from({ length: 20 }, (_, index) => ({
            ...offer,
            id: `max-${index}`,
          })),
        }),
      ),
    ).toHaveLength(20)
  })

  it('rebuilds safe plain objects and rejects prototype-pollution keys', () => {
    const malicious = '{"schemaVersion":1,"scenarios":[],"__proto__":{"polluted":true}}'
    expect(() => decodeScenarioCollectionJson(malicious)).toThrow()
    expect(({} as { polluted?: boolean }).polluted).toBeUndefined()
  })

  it('neutralizes formula-leading names and quotes CSV delimiters', () => {
    const csv = toOffersCsv([
      { ...offer, name: '=HYPERLINK("https://example.invalid","x"),offre' },
      { ...offer, id: 'offer-2', name: '+SUM(1,2)' },
      { ...offer, id: 'offer-3', name: '-1+2' },
      { ...offer, id: 'offer-4', name: '@SUM(1,2)' },
    ])
    expect(csv).toContain(`"'=`)
    expect(csv).toContain('""')
    expect(csv).toContain('Micro net annuel (€)')
    expect(csv).toContain('Salariat valeur économique annuelle (€)')
    expect(csv).not.toContain('retraite')
  })
})
