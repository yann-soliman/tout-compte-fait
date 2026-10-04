import { describe, expect, it } from 'vitest'
import {
  applyRate,
  assertMoneyCents,
  assertRatePpm,
  divideMoney,
  eurosToMoneyCents,
  type MoneyCents,
} from '../../src/domain/money'

describe('exact money arithmetic', () => {
  it.each([
    [600.58, 60_058],
    [600.29, 60_029],
    [0.01, 1],
  ])('converts €%s to exact integer cents', (euros, cents) => {
    expect(eurosToMoneyCents(euros)).toBe(cents)
  })

  it.each([0.001, 1.001, -0.01, Number.NaN, Number.POSITIVE_INFINITY, 90_071_992_547_409.92])(
    'rejects invalid euro amount %s',
    (euros) => {
      expect(() => eurosToMoneyCents(euros)).toThrow(RangeError)
    },
  )

  it('accepts only non-negative safe integer cents', () => {
    expect(assertMoneyCents(12_345)).toBe(12_345)
    expect(() => assertMoneyCents(1.5)).toThrow(/centimes entiers/)
    expect(() => assertMoneyCents(Number.MAX_SAFE_INTEGER + 1)).toThrow(/sûr/)
  })

  it('accepts rates as safe integer parts per million', () => {
    expect(assertRatePpm(256_000)).toBe(256_000)
    expect(() => assertRatePpm(-1)).toThrow(/taux/)
  })

  it.each([
    ['down', 0],
    ['half-up', 1],
    ['up', 1],
  ] as const)('applies an explicit %s rounding mode', (mode, expected) => {
    expect(applyRate(1 as MoneyCents, 500_000, mode)).toBe(expected)
  })

  it('keeps integer cents when dividing for display', () => {
    expect(divideMoney(101 as MoneyCents, 12, 'half-up')).toBe(8)
    expect(divideMoney(102 as MoneyCents, 12, 'half-up')).toBe(9)
  })
})
