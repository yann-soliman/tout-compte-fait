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

export function eurosToMoneyCents(euros: number): MoneyCents {
  if (!Number.isFinite(euros) || euros < 0 || Object.is(euros, -0))
    throw new RangeError('Le montant doit être un nombre fini positif ou nul.')

  const [coefficient = '', exponentText] = euros.toString().toLowerCase().split('e')
  const [whole = '0', fraction = ''] = coefficient.split('.')
  const digits = `${whole}${fraction}`
  const decimalShift = Number(exponentText ?? 0) + 2 - fraction.length

  let cents: bigint
  if (decimalShift >= 0) {
    cents = BigInt(digits) * 10n ** BigInt(decimalShift)
  } else {
    const discardedDigits = -decimalShift
    if (discardedDigits > digits.length || !digits.endsWith('0'.repeat(discardedDigits)))
      throw new RangeError('Le montant doit être exprimé au centime près.')
    cents = BigInt(digits.slice(0, -discardedDigits) || '0')
  }

  return assertMoneyCents(Number(cents))
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
