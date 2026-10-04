import { describe, expect, it } from 'vitest'
import { defaultScenario } from '../../src/domain/defaults'
import { assertMoneyCents } from '../../src/domain/money'
import { calculateEmployeeRetirement, calculateMicroRetirement } from '../../src/domain/retirement'
import { rules2026 } from '../../src/domain/rules/2026'

describe('complementary retirement 2026', () => {
  it('reproduces the official salary example and values unrounded points separately from base rights', () => {
    const result = calculateEmployeeRetirement(
      { ...defaultScenario.employee, grossAnnualSalary: assertMoneyCents(7_550_000) },
      rules2026,
    )
    expect(result.complementary.points).toBe(378.67)
    expect(result.complementary.indicativeAnnualPension).toBe(54_476)
    expect(result.complementary.confidence).toBe('estimated')
    expect(result.complementary.sources.length).toBeGreaterThan(0)
    expect(result.complementary.limitation).toMatch(/annuel|annuelle/)
    expect(result.complementary.limitation).toContain('2025-11-01')
    expect(result.base.points).toBe('unavailable')
    expect(result.base.indicativeAnnualPension).toBe('unavailable')
  })
  it.each([
    'purchase',
    'service',
    'provisional',
    'metadata',
    'zero',
    'fractional',
    'bands',
    'band-source',
  ])('blocks only employee complementary rights for unusable %s rules', (failure) => {
    const catalog = structuredClone(rules2026)
    const comp = catalog.complementaryRetirement!.employee!
    if (failure === 'purchase') delete (comp as Partial<typeof comp>).pointPurchaseValue
    if (failure === 'service') delete (comp as Partial<typeof comp>).pointServiceValue
    if (failure === 'provisional') comp.pointPurchaseValue.source.status = 'provisional'
    if (failure === 'metadata') comp.pointServiceValue.source.authority = ''
    if (failure === 'zero') comp.pointPurchaseValue.value = 0
    if (failure === 'fractional') comp.pointServiceValue.value = 143.86
    if (failure === 'bands') comp.pointBands = []
    if (failure === 'band-source') comp.pointBands![0]!.source.status = 'provisional'
    const result = calculateEmployeeRetirement(defaultScenario.employee, catalog)
    expect(result.complementary.points).toBe('unavailable')
    expect(result.complementary.indicativeAnnualPension).toBe('unavailable')
    expect(result.complementary.confidence).toBe('blocked')
    expect(result.base.quarters).toBe(4)
  })

  it.each(['micro allocation rate', 'micro social rate', 'employee point-band rate'])(
    'blocks complementary rights when the %s exceeds 100%',
    (rule) => {
      const catalog = structuredClone(rules2026)
      if (rule === 'micro allocation rate') {
        catalog.complementaryRetirement!.micro!.allocationRate!.value = 1_000_001 as never
      } else if (rule === 'micro social rate') {
        catalog.microSocial.value = 1_000_001 as never
      } else {
        catalog.complementaryRetirement!.employee!.pointBands![0]!.rate = 1_000_001 as never
      }
      const result =
        rule === 'employee point-band rate'
          ? calculateEmployeeRetirement(defaultScenario.employee, catalog)
          : calculateMicroRetirement(defaultScenario.micro, catalog)
      expect(result.complementary.confidence).toBe('blocked')
      expect(result.complementary.points).toBe('unavailable')
      expect(result.base.confidence).toBe('established')
    },
  )

  it.each([
    [0, 0, 0],
    [1, 0, 0],
    [4_805_999, 147.6, 21_234],
    [4_806_000, 147.6, 21_234],
    [4_806_001, 147.6, 21_234],
    [38_447_999, 2980.58, 428_787],
    [38_448_000, 2980.58, 428_787],
    [38_448_001, 2980.58, 428_787],
    [3_000_207, 92.14, 13_256],
  ])(
    'keeps exact employee arithmetic and final rounding at salary %i cents',
    (salary, points, pension) => {
      const result = calculateEmployeeRetirement(
        { ...defaultScenario.employee, grossAnnualSalary: assertMoneyCents(salary) },
        rules2026,
      )
      expect(result.complementary.points).toBe(points)
      expect(result.complementary.indicativeAnnualPension).toBe(pension)
    },
  )

  it('does not prorate actual salary twice or use cadre deductions to generate points', () => {
    const regular = calculateEmployeeRetirement(defaultScenario.employee, rules2026)
    const partTime = calculateEmployeeRetirement(
      { ...defaultScenario.employee, category: 'non-cadre', workRatioPercent: 50 },
      rules2026,
    )
    expect(partTime.complementary).toEqual(regular.complementary)
  })

  it('estimates RCI using the BNC allocation rather than BIC and retains the fraction for valuation', () => {
    const result = calculateMicroRetirement(
      { ...defaultScenario.micro, dailyRate: assertMoneyCents(4_000_000), billedDays: 1 },
      rules2026,
    )
    expect(result.complementary.points).toBe(98.98)
    expect(result.complementary.indicativeAnnualPension).toBe(13_332)
    expect(result.complementary.confidence).toBe('estimated')
    expect(result.complementary.regime).toMatch(/RCI/)
    expect(result.complementary.sources.map((s) => s.authority)).toContain(
      'CNAV — Assurance retraite',
    )
    expect(result.base.points).toBe('unavailable')
  })

  it.each([
    [0, 0, 0],
    [1, 0, 0],
    [3_999_999, 98.98, 13_332],
    [4_000_000, 98.98, 13_332],
    [4_000_001, 98.98, 13_332],
    [8_359_999, 206.86, 27_865],
    [8_360_000, 206.86, 27_865],
    [8_360_001, 206.86, 27_865],
  ])('keeps exact annual micro arithmetic at turnover %i cents', (turnover, points, pension) => {
    const result = calculateMicroRetirement(
      { ...defaultScenario.micro, dailyRate: assertMoneyCents(turnover), billedDays: 1 },
      rules2026,
    )
    expect(result.complementary.points).toBe(points)
    expect(result.complementary.indicativeAnnualPension).toBe(pension)
  })

  it.each(['purchase', 'service', 'allocation', 'provisional', 'metadata', 'zero', 'fractional'])(
    'blocks only micro complementary rights for unusable %s rules',
    (failure) => {
      const catalog = structuredClone(rules2026)
      const comp = catalog.complementaryRetirement!.micro!
      if (failure === 'purchase') delete (comp as Partial<typeof comp>).pointPurchaseValue
      if (failure === 'service') delete (comp as Partial<typeof comp>).pointServiceValue
      if (failure === 'allocation') delete comp.allocationRate
      if (failure === 'provisional') comp.allocationRate!.source.status = 'provisional'
      if (failure === 'metadata') comp.pointServiceValue.source.documentTitle = ''
      if (failure === 'zero') comp.pointPurchaseValue.value = 0
      if (failure === 'fractional') comp.pointServiceValue.value = 134.7
      const result = calculateMicroRetirement(defaultScenario.micro, catalog)
      expect(result.complementary.points).toBe('unavailable')
      expect(result.complementary.confidence).toBe('blocked')
      expect(result.base.quarters).toBe(4)
    },
  )

  it('retains the out-of-scope guard and rejects unsafe micro money instead of rounding it', () => {
    expect(() =>
      calculateMicroRetirement({ ...defaultScenario.micro, activity: 'cipav' } as never, rules2026),
    ).toThrow(/hors périmètre/)
    expect(() =>
      calculateMicroRetirement(
        {
          ...defaultScenario.micro,
          dailyRate: assertMoneyCents(Number.MAX_SAFE_INTEGER),
          billedDays: 366,
        },
        rules2026,
      ),
    ).toThrow(/plage sûre/)
  })

  it('can block both unavailable complementary regimes without losing base rights', () => {
    const catalog = { ...rules2026, complementaryRetirement: undefined }
    expect(
      calculateEmployeeRetirement(defaultScenario.employee, catalog).complementary.confidence,
    ).toBe('blocked')
    expect(calculateMicroRetirement(defaultScenario.micro, catalog).base.quarters).toBe(4)
  })

  it.each(['wrong-pass-boundary', 'wrong-eight-pass-endpoint'])(
    'blocks employee complementary rights for a contiguous but incorrect %s',
    (failure) => {
      const catalog = structuredClone(rules2026)
      const bands = catalog.complementaryRetirement!.employee!.pointBands!
      if (failure === 'wrong-pass-boundary') {
        bands[0]!.upperInclusive = assertMoneyCents(5_000_000)
        bands[1]!.lowerExclusive = assertMoneyCents(5_000_000)
      } else {
        bands[1]!.upperInclusive = assertMoneyCents(40_000_000)
      }
      expect(
        calculateEmployeeRetirement(defaultScenario.employee, catalog).complementary.confidence,
      ).toBe('blocked')
    },
  )

  it('blocks an incomplete or malformed employee point-band set', () => {
    for (const failure of ['missing-t2', 'missing-ceiling', 'gap', 'negative-rate']) {
      const catalog = structuredClone(rules2026)
      const bands = catalog.complementaryRetirement!.employee!.pointBands!
      if (failure === 'missing-t2') bands.pop()
      if (failure === 'missing-ceiling') delete bands[1]!.upperInclusive
      if (failure === 'gap') bands[1]!.lowerExclusive = assertMoneyCents(4_806_001)
      if (failure === 'negative-rate') bands[0]!.rate = -1 as never
      expect(
        calculateEmployeeRetirement(defaultScenario.employee, catalog).complementary.confidence,
      ).toBe('blocked')
    }
  })

  it('does not claim an intermediate monetary round for point-generating bands', () => {
    expect(rules2026.complementaryRetirement!.employee!.pointBands!.map((b) => b.rounding)).toEqual(
      ['exact', 'exact'],
    )
  })

  it.each([
    [20_001, 0, 0],
    [20_000, 0.01, 1],
    [19_999, 0.01, 1],
  ])(
    'rounds a synthetic point/pension half-boundary independently at purchase %i units',
    (purchase, points, pension) => {
      const catalog = structuredClone(rules2026)
      const comp = catalog.complementaryRetirement!.employee!
      comp.pointPurchaseValue.value = purchase
      comp.pointServiceValue.value = 10_000 // exactly 1 € per point
      comp.pointBands![0]!.rate = 1_000_000 as never // 100% for arithmetic isolation
      const result = calculateEmployeeRetirement(
        { ...defaultScenario.employee, grossAnnualSalary: assertMoneyCents(1) },
        catalog,
      )
      // 1 cent =100 units of0.0001 €; /20000 gives exactly0.005 point.
      // Independently rounded points ->0.01; unrounded valuation ->0.5 cent ->1 cent.
      expect(result.complementary.points).toBe(points)
      expect(result.complementary.indicativeAnnualPension).toBe(pension)
    },
  )

  it('preserves sub-cent point values with correctly attributed dated official sources', () => {
    const rules = rules2026.complementaryRetirement
    expect(rules?.employee?.pointPurchaseValue.value).toBe(201_877)
    expect(rules?.employee?.pointServiceValue.value).toBe(14_386)
    expect(rules?.micro?.pointPurchaseValue.value).toBe(217_260)
    expect(rules?.micro?.pointServiceValue.value).toBe(13_470)
    expect(rules?.micro?.allocationRate?.value).toBe(210_000)
    expect(rules?.employee?.pointPurchaseValue.source.authority).toBe('Agirc-Arrco')
    expect(rules?.micro?.allocationRate?.source.authority).toBe('CNAV — Assurance retraite')
    expect(rules?.employee?.pointServiceValue.source.effectiveDate).toBe('2025-11-01')
    expect(rules?.micro?.pointServiceValue.source.canonicalUrl).toMatch(/2025_31_22122025\.pdf$/)
    expect(rules?.employee?.pointPurchaseValue.source.verificationDate).toBe('2026-10-04')
  })
})
