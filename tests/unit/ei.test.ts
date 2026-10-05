import { describe, expect, it } from 'vitest'
import * as ei from '../../src/domain/ei'

const normal = {
  turnover: 10_000_000,
  professionalExpenses: 240_000,
  cfeAnnual: 60_000,
  cfeExemptionConfirmed: false,
  healthInsuranceAnnual: 30_000,
}

function calculated(input: Partial<typeof normal> = {}) {
  const result = ei.calculateEiIncome({ ...normal, ...input })
  if (result.status !== 'estimated') throw new Error('Résultat bloqué')
  return result
}

describe('EI BNC non réglementé 2026', () => {
  it.each([
    [0, 125500, -425500],
    [1000000, 217700, 482300],
    [5000000, 1475900, 3224100],
    [10000000, 3014100, 6685900],
    [20000000, 5457000, 14243000],
  ])('reproduit CA %i et conserve déficit/minima', (turnover, contributions, net) => {
    const result = calculated({ turnover, healthInsuranceAnnual: 0 })
    expect(result.contributions).toBe(contributions)
    expect(result.netBeforePersonalInsurance).toBe(net)
    expect(result.availableBeforeIncomeTax + result.contributions + result.deductibleExpenses).toBe(
      turnover,
    )
  })

  // Fixtures collected with the official external engine, not an independent legal oracle.
  it.each([
    [730946, 540900, 221800],
    [746878, 552700, 226000],
    [1298919, 961200, 377100],
    [2597838, 1922400, 761000],
    [3896757, 2883600, 1207800],
    [6494595, 4806000, 2101200],
    [7144054, 5286600, 2252600],
    [9092432, 6728400, 2870500],
    [12989189, 9612000, 3813000],
    [19483784, 14418000, 5409600],
    [25978378, 19730600, 6937100],
    [32472973, 26225200, 8258900],
    [325329, 240700, 168400],
    [24030000, 17782200, 6406100],
  ])(
    'vérifie la frontière externe CA %i et ses voisins en centimes',
    (turnover, base, contributions) => {
      for (const offset of [-1, 0, 1]) {
        const result = calculated({
          turnover: turnover + offset,
          professionalExpenses: 0,
          cfeExemptionConfirmed: true,
          healthInsuranceAnnual: 0,
        })
        expect(result.socialBase).toBe(base)
        expect(result.contributions).toBe(contributions)
        expect(result.availableBeforeIncomeTax).toBe(turnover + offset - contributions)
      }
    },
  )

  it('applique les bornes d’abattement et les minima sans revenu', () => {
    const zero = calculated({
      turnover: 0,
      professionalExpenses: 0,
      cfeExemptionConfirmed: true,
      healthInsuranceAnnual: 0,
    })
    expect(zero.abatement).toBe(84600)
    expect(zero.deductions.map((line) => line.amount)).toEqual([
      0, 9600, 96700, 0, 7200, 0, 0, 0, 12000,
    ])
    expect(calculated({ turnover: 100000000 }).abatement).toBe(6247800)
  })

  it('la mutuelle change seulement le cash, pas l’assiette ni les postes', () => {
    const base = calculated()
    const insured = calculated({ healthInsuranceAnnual: 123456 })
    expect(insured.deductions).toEqual(base.deductions)
    expect(insured.socialBase).toBe(base.socialBase)
    expect(insured.availableBeforeIncomeTax).toBe(base.netBeforePersonalInsurance - 123456)
  })

  it('ne contamine pas les calculs après un déficit ou un blocage', () => {
    const before = calculated()
    calculated({ turnover: 0 })
    ei.calculateEiIncome({ ...normal, cfeAnnual: undefined })
    expect(calculated()).toEqual(before)
  })

  it('bloque zéro non confirmé et accepte une exonération EI propre', () => {
    expect(ei.calculateEiIncome({ ...normal, cfeAnnual: 0 }).status).toBe('blocked')
    const exempt = calculated({ cfeExemptionConfirmed: true })
    expect(exempt.deductibleExpenses).toBe(240000)
    expect(exempt).toEqual(calculated({ cfeAnnual: 0, cfeExemptionConfirmed: true }))
  })

  it.each([-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])(
    'rejette le montant invalide %s',
    (turnover) => {
      expect(() => calculated({ turnover })).toThrow(RangeError)
    },
  )

  it('rejette les sommes hors plage sûre', () => {
    expect(() => calculated({ professionalExpenses: Number.MAX_SAFE_INTEGER })).toThrow(RangeError)
  })

  it('conserve les centimes et expose les sources datées de tous les postes', () => {
    const result = calculated({
      turnover: 10000029,
      professionalExpenses: 240029,
      healthInsuranceAnnual: 30001,
    })
    expect(
      result.availableBeforeIncomeTax +
        result.contributions +
        result.deductibleExpenses +
        result.healthInsuranceAnnual,
    ).toBe(10000029)
    expect(Number.isSafeInteger(result.availableBeforeIncomeTax)).toBe(true)
    for (const line of result.deductions) {
      expect(line.amount % 100).toBe(0)
      expect(line.source.effectiveDate).toBe('2026-01-01')
      expect(line.source.verificationDate).toBe('2026-10-04')
      expect(line.source.canonicalUrl).toMatch(/^https:\/\//)
    }
  })

  it('arrondit le CA social à l’euro comme la source sans perdre les centimes du cash', () => {
    const result = ei.calculateEiIncome({
      ...normal,
      turnover: 95425186,
      professionalExpenses: 5977241,
      cfeExemptionConfirmed: true,
    })
    expect(result.status).toBe('estimated')
    if (result.status !== 'estimated') throw new Error('Résultat bloqué')
    expect(result.socialBase).toBe(83200200)
    expect(result.netBeforePersonalInsurance).toBe(95425186 - 5977241 - result.contributions)
  })

  it('bloque la CFE inconnue sans publier de faux disponible', () => {
    const result = ei.calculateEiIncome({ ...normal, cfeAnnual: undefined })
    expect(result.status).toBe('blocked')
    expect(result).not.toHaveProperty('availableBeforeIncomeTax')
  })

  it('reproduit la fixture officielle et sépare la mutuelle personnelle', () => {
    expect(ei).toHaveProperty('calculateEiIncome')
    const result = ei.calculateEiIncome(normal)
    expect(result.status).toBe('estimated')
    if (result.status !== 'estimated') throw new Error('Résultat bloqué')
    expect(result.socialBase).toBe(7_178_000)
    expect(result.contributions).toBe(3_014_100)
    expect(result.netBeforePersonalInsurance).toBe(6_685_900)
    expect(result.availableBeforeIncomeTax).toBe(6_655_900)
    expect(result.deductions.map((line) => line.amount)).toEqual([
      503900, 35900, 875900, 605100, 62500, 222500, 488100, 208200, 12000,
    ])
    expect(result.deductions.reduce((sum, line) => sum + line.amount, 0)).toBe(result.contributions)
  })
})
