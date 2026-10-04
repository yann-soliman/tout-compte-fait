import { calculateComparison } from './calculate'
import type { ComparisonScenario, Confidence, RegulatoryCatalog, ResultWarning } from './model'
import { assertMoneyCents } from './money'
import { validateScenario } from './validate'

export interface StressInput {
  daysLost: number
  rateDecreasePercent: number
  extraAnnualExpenses: number
}

export interface StressResult {
  input: StressInput
  remainingDays: number
  stressedDailyRateCents: number
  currentMicroNetIncomeCents: number
  currentMicroEconomicValueCents: number
  currentMicroConfidence: Confidence | undefined
  currentMicroWarnings: ResultWarning[]
  stressedMicroNetIncomeCents: number
  stressedMicroEconomicValueCents: number
  stressedMicroConfidence: Confidence | undefined
  stressedMicroWarnings: ResultWarning[]
  netDifferenceVsEmployeeCents: number
  economicDifferenceVsEmployeeCents: number
  netChangeCents: number
  economicChangeCents: number
}

function validateInput(input: StressInput): void {
  if (!Number.isSafeInteger(input.daysLost) || input.daysLost < 0 || input.daysLost > 366) {
    throw new RangeError('Les jours perdus doivent être un entier compris entre 0 et 366.')
  }
  if (
    !Number.isFinite(input.rateDecreasePercent) ||
    input.rateDecreasePercent < 0 ||
    input.rateDecreasePercent > 100 ||
    !isHundredthPrecision(input.rateDecreasePercent)
  ) {
    throw new RangeError(
      'La baisse de taux doit être comprise entre 0 et 100 %, au centième de pourcent.',
    )
  }
  if (
    !Number.isSafeInteger(input.extraAnnualExpenses) ||
    input.extraAnnualExpenses < 0 ||
    input.extraAnnualExpenses > 10_000_000
  ) {
    throw new RangeError(
      'Les frais supplémentaires doivent être des centimes entiers de 0 à 100 000 €.',
    )
  }
}

function isHundredthPrecision(value: number): boolean {
  const hundredths = value * 100
  const nearestHundredth = Math.round(hundredths)
  const tolerance = Number.EPSILON * Math.max(1, Math.abs(hundredths)) * 8
  return Math.abs(hundredths - nearestHundredth) <= tolerance
}

function subtractCosts(a: number, b: number): number {
  const result = a - b
  if (!Number.isSafeInteger(result))
    throw new RangeError('L’écart dépasse la plage sûre des centimes.')
  return result
}

export function calculateStress(
  scenario: ComparisonScenario,
  input: StressInput,
  catalog: RegulatoryCatalog,
): StressResult {
  validateInput(input)
  const validated = validateScenario(scenario)
  if (catalog.year !== validated.referenceYear) {
    throw new RangeError(
      `Catalogue ${catalog.year} non pris en charge pour ${validated.referenceYear}.`,
    )
  }
  const current = calculateComparison(
    { ...validated, retirement: { ...validated.retirement, includeRights: false } },
    catalog,
  )
  const remainingDays = Math.max(0, validated.micro.billedDays - input.daysLost)
  const percentageBasisPoints = BigInt(Math.round(input.rateDecreasePercent * 100))
  const numerator = BigInt(validated.micro.dailyRate) * (10_000n - percentageBasisPoints)
  const stressedDailyRateCents = Number((numerator + 5_000n) / 10_000n)
  const stressedScenario = {
    ...validated,
    retirement: { ...validated.retirement, includeRights: false },
    micro: {
      ...validated.micro,
      dailyRate: assertMoneyCents(stressedDailyRateCents),
      billedDays: remainingDays,
      professionalExpenses: assertMoneyCents(
        validated.micro.professionalExpenses + input.extraAnnualExpenses,
      ),
    },
  }
  const stressed = calculateComparison(stressedScenario, catalog)
  return {
    input: { ...input },
    remainingDays,
    stressedDailyRateCents,
    currentMicroNetIncomeCents: current.micro.netIncome,
    currentMicroEconomicValueCents: current.micro.totalValue,
    currentMicroConfidence: current.micro.confidence,
    currentMicroWarnings: current.micro.warnings ?? [],
    stressedMicroNetIncomeCents: stressed.micro.netIncome,
    stressedMicroEconomicValueCents: stressed.micro.totalValue,
    stressedMicroConfidence: stressed.micro.confidence,
    stressedMicroWarnings: stressed.micro.warnings ?? [],
    netDifferenceVsEmployeeCents: subtractCosts(
      stressed.micro.netIncome,
      stressed.employee.netIncome,
    ),
    economicDifferenceVsEmployeeCents: subtractCosts(
      stressed.micro.totalValue,
      stressed.employee.totalValue,
    ),
    netChangeCents: subtractCosts(stressed.micro.netIncome, current.micro.netIncome),
    economicChangeCents: subtractCosts(stressed.micro.totalValue, current.micro.totalValue),
  }
}
