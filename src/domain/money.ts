export type MoneyCents = number & { readonly __moneyCents: unique symbol }
export type RatePpm = number & { readonly __ratePpm: unique symbol }
export type RoundingMode = 'down' | 'half-up' | 'up'

const PPM_SCALE = 1_000_000n

export function assertMoneyCents(value: number): MoneyCents {
  if (!Number.isSafeInteger(value))
    throw new RangeError('Le montant doit utiliser des centimes entiers dans la plage sûre.')
  if (value < 0) throw new RangeError('Le montant en centimes entiers doit être positif ou nul.')
  return value as MoneyCents
}

export function assertRatePpm(value: number): RatePpm {
  if (!Number.isSafeInteger(value) || value < 0)
    throw new RangeError('Le taux ppm doit être un entier positif ou nul.')
  return value as RatePpm
}

function roundedQuotient(numerator: bigint, denominator: bigint, mode: RoundingMode): bigint {
  const quotient = numerator / denominator
  const remainder = numerator % denominator
  if (remainder === 0n || mode === 'down') return quotient
  if (mode === 'up') return quotient + 1n
  return remainder * 2n >= denominator ? quotient + 1n : quotient
}

function safeMoney(value: bigint): MoneyCents {
  const numeric = Number(value)
  if (!Number.isSafeInteger(numeric))
    throw new RangeError('Le résultat monétaire dépasse la plage sûre.')
  return numeric as MoneyCents
}

export function applyRate(
  money: MoneyCents,
  rate: RatePpm | number,
  mode: RoundingMode,
): MoneyCents {
  const checkedMoney = assertMoneyCents(money)
  const checkedRate = assertRatePpm(rate)
  return safeMoney(roundedQuotient(BigInt(checkedMoney) * BigInt(checkedRate), PPM_SCALE, mode))
}

export function divideMoney(money: MoneyCents, divisor: number, mode: RoundingMode): MoneyCents {
  const checkedMoney = assertMoneyCents(money)
  if (!Number.isSafeInteger(divisor) || divisor <= 0)
    throw new RangeError('Le diviseur doit être un entier strictement positif.')
  return safeMoney(roundedQuotient(BigInt(checkedMoney), BigInt(divisor), mode))
}
