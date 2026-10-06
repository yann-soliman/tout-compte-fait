import type { ComparisonScenario, RegulatoryCatalog, ProjectionPoint } from './model'
import { assertMoneyCents, type MoneyCents } from './money'
import { calculateEmployeeIncome } from './employee'
import { assessMicroEligibility } from './eligibility'
import { calculateMicroIncome } from './micro'
import { validateScenario } from './validate'
import { assertUsableCatalog } from './rules/2026'

// Decimal growth is an economic assumption, not a statutory rate. Preserve the
// exact supplied decimal rational until annual cents are rounded independently.
function growthRatio(percent: number): [bigint, bigint] {
  if (!Number.isFinite(percent) || percent < -100 || percent > 100)
    throw new RangeError('Croissance hors plage −100 à 100 %.')
  const [coefficient = '', exponent = '0'] = Math.abs(percent).toString().toLowerCase().split('e')
  const [whole = '0', fraction = ''] = coefficient.split('.')
  const shift = Number(exponent) - fraction.length
  let numerator = BigInt(whole + fraction),
    denominator = 1n
  if (shift >= 0) numerator *= 10n ** BigInt(shift)
  else denominator = 10n ** BigInt(-shift)
  const scale = denominator * 100n
  return [scale + (percent < 0 ? -numerator : numerator), scale]
}
function grown(base: number, numerator: bigint, denominator: bigint): MoneyCents {
  const amount = BigInt(assertMoneyCents(base)) * numerator
  return assertMoneyCents(Number((amount * 2n + denominator) / (2n * denominator)))
}
function safeSum(a: number, b: number): number {
  const value = Number(BigInt(a) + BigInt(b))
  if (!Number.isSafeInteger(value)) throw new RangeError('Projection cumulée hors plage sûre.')
  return value
}
export function buildProjection(
  scenario: ComparisonScenario,
  catalog: RegulatoryCatalog,
  years: number,
  annualGrowthPercent: number,
): ProjectionPoint[] {
  validateScenario(scenario)
  assertUsableCatalog(catalog, scenario.referenceYear)
  if (!Number.isFinite(years)) throw new RangeError('Durée de projection hors plage.')
  const duration = Math.min(30, Math.max(1, Math.round(years)))
  const [growthNumerator, growthDenominator] = growthRatio(annualGrowthPercent)
  const baseTurnover = assertMoneyCents(scenario.micro.dailyRate * scenario.micro.billedDays)
  let numerator = 1n,
    denominator = 1n,
    previousExceeded = false
  let microCumulative = 0,
    employeeCumulative = 0
  return Array.from({ length: duration }, (_, index) => {
    const potential = grown(baseTurnover, numerator, denominator)
    const eligibility = assessMicroEligibility(
      scenario.micro,
      index === 0 ? scenario.activityStartDate : undefined,
      catalog,
      potential,
    )
    const turnover = previousExceeded
      ? assertMoneyCents(Math.min(potential, catalog.microTurnoverCeiling.value))
      : potential
    const actualEligibility = assessMicroEligibility(
      scenario.micro,
      index === 0 ? scenario.activityStartDate : undefined,
      catalog,
      turnover,
    )
    previousExceeded = turnover > eligibility.applicableCeiling
    const microAnnual = calculateMicroIncome(
      scenario.micro,
      catalog,
      actualEligibility,
      turnover,
    ).economicValue
    const employeeAnnual = calculateEmployeeIncome(
      {
        ...scenario.employee,
        grossAnnualSalary: grown(scenario.employee.grossAnnualSalary, numerator, denominator),
        annualBenefits: grown(scenario.employee.annualBenefits, numerator, denominator),
      },
      catalog,
    ).economicValue
    microCumulative = safeSum(microCumulative, microAnnual)
    employeeCumulative = safeSum(employeeCumulative, employeeAnnual)
    numerator *= growthNumerator
    denominator *= growthDenominator
    return {
      year: index + 1,
      microTurnover: turnover,
      microAnnual,
      employeeAnnual,
      microCumulative,
      employeeCumulative,
    }
  })
}
