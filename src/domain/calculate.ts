import type {
  ComparisonResult,
  Confidence,
  ComparisonScenario,
  RegulatoryCatalog,
  SourceReference,
  StatusResult,
} from './model'
import { calculateEmployeeIncome } from './employee'
import { assessMicroEligibility } from './eligibility'
import { calculateMicroIncome } from './micro'
import { assertMoneyCents, type MoneyCents } from './money'
import { assertUsableCatalog } from './rules/2026'
import { validateScenario } from './validate'
import { employeeWorkedDays } from './worked-time'
import { calculateEmployeeRetirement, calculateMicroRetirement } from './retirement'

function uniqueSources(sources: SourceReference[]): SourceReference[] {
  return [...new Map(sources.map((source) => [source.canonicalUrl, source])).values()]
}

export function combineConfidence(...values: (Confidence | undefined)[]): Confidence {
  if (values.includes('blocked')) return 'blocked'
  if (values.includes('estimated')) return 'estimated'
  return 'established'
}

// Intentional independent cent-rounded means, not statutory annual totals.
// Never derive a mean net from rounded mean components: a cent may differ.
function halfUpMean(a: number, b: number): number {
  const n = BigInt(a) + BigInt(b)
  const q = n / 2n
  const r = n % 2n
  const rounded = r * 2n >= 2n ? q + 1n : q
  const value = Number(rounded)
  if (!Number.isSafeInteger(value)) throw new RangeError('Moyenne monétaire hors plage.')
  return value
}

function buildMicroStatus(
  validated: ComparisonScenario,
  microIncome: ReturnType<typeof calculateMicroIncome>,
  microRetirement: ReturnType<typeof calculateMicroRetirement> | undefined,
): StatusResult {
  return {
    kind: 'micro',
    grossIncome: microIncome.turnover,
    netIncome: microIncome.netIncome,
    totalValue: microIncome.economicValue,
    workedDays: validated.micro.billedDays,
    valuePerDay:
      validated.micro.billedDays === 0
        ? 'indeterminate'
        : (Math.round(microIncome.economicValue / validated.micro.billedDays) as MoneyCents),
    retirementContribution: 0,
    charges: microIncome.statutoryDeductions + microIncome.economicCosts,
    statutoryDeductions: microIncome.deductions,
    economicCosts: microIncome.economicCosts,
    eligibility: microIncome.eligibility,
    retirement: microRetirement,
    confidence: microIncome.confidence,
    warnings: microIncome.warnings,
    ruleReferences: uniqueSources([...microIncome.sources, microIncome.eligibility.source]),
    composition: [
      { name: 'Revenu net', value: microIncome.netIncome, color: '#8b7cf6' },
      { name: 'Frais économiques', value: microIncome.economicCosts, color: '#e8e5ff' },
      { name: 'Prélèvements', value: microIncome.statutoryDeductions, color: '#c4baff' },
    ],
  }
}

function buildEmployeeStatus(
  validated: ComparisonScenario,
  employeeIncome: ReturnType<typeof calculateEmployeeIncome>,
  employeeRetirement: ReturnType<typeof calculateEmployeeRetirement> | undefined,
): StatusResult {
  const employeeDays = employeeWorkedDays(
    validated.referenceYear,
    validated.employee.workRatioPercent,
    validated.employee.paidLeaveWeeks,
    validated.employee.rttDays,
  )
  return {
    kind: 'employee',
    grossIncome: employeeIncome.grossIncome,
    netIncome: employeeIncome.netIncome,
    totalValue: employeeIncome.economicValue,
    workedDays: employeeDays,
    valuePerDay:
      employeeDays === 0
        ? 'indeterminate'
        : (Math.round(employeeIncome.economicValue / employeeDays) as MoneyCents),
    retirementContribution: 0,
    charges: employeeIncome.statutoryDeductions,
    statutoryDeductions: employeeIncome.deductions,
    annualBenefits: validated.employee.annualBenefits,
    retirement: employeeRetirement,
    confidence: employeeIncome.confidence,
    ruleReferences: employeeIncome.sources,
    composition: [
      { name: 'Salaire net', value: employeeIncome.netIncome, color: '#32c59d' },
      { name: 'Avantages', value: validated.employee.annualBenefits, color: '#80dfc4' },
      { name: 'Cotisations', value: employeeIncome.statutoryDeductions, color: '#e0f8f1' },
    ],
  }
}

export function calculateAnnualComparison(
  scenario: ComparisonScenario,
  catalog: RegulatoryCatalog,
  microTurnoverOverride?: number,
): ComparisonResult {
  const validated = validateScenario(scenario)
  assertUsableCatalog(catalog, validated.referenceYear)

  const turnover = assertMoneyCents(
    microTurnoverOverride ?? validated.micro.dailyRate * validated.micro.billedDays,
  )

  const eligibility = assessMicroEligibility(
    validated.micro,
    validated.activityStartDate,
    catalog,
    turnover,
  )
  const microIncome = calculateMicroIncome(validated.micro, catalog, eligibility, turnover)
  const employeeIncome = calculateEmployeeIncome(validated.employee, catalog)
  const microRetirement = validated.retirement.includeRights
    ? calculateMicroRetirement(validated.micro, catalog, turnover)
    : undefined
  const employeeRetirement = validated.retirement.includeRights
    ? calculateEmployeeRetirement(validated.employee, catalog)
    : undefined

  const micro = buildMicroStatus(validated, microIncome, microRetirement)
  const employee = buildEmployeeStatus(validated, employeeIncome, employeeRetirement)
  const warnings = [...microIncome.warnings]
  return {
    micro,
    employee,
    difference: micro.totalValue - employee.totalValue,
    confidence: combineConfidence(micro.confidence, employee.confidence),
    warnings,
    netIncomeDifference: micro.netIncome - employee.netIncome,
    economicValueDifference: micro.totalValue - employee.totalValue,
  }
}

export function calculateComparison(
  scenario: ComparisonScenario,
  catalog: RegulatoryCatalog,
): ComparisonResult {
  const validated = validateScenario(scenario)
  assertUsableCatalog(catalog, validated.referenceYear)

  const rawTurnover = validated.micro.dailyRate * validated.micro.billedDays
  const firstEligibility = assessMicroEligibility(
    validated.micro,
    validated.activityStartDate,
    catalog,
    rawTurnover,
  )
  const applicableCeiling = firstEligibility.applicableCeiling

  if (rawTurnover <= applicableCeiling) {
    return calculateAnnualComparison(scenario, catalog)
  }

  const fullCeiling = catalog.microTurnoverCeiling.value
  const firstTurnover = rawTurnover
  const secondTurnover = Math.min(rawTurnover, fullCeiling)

  const first = calculateAnnualComparison(scenario, catalog, firstTurnover)
  const second = calculateAnnualComparison(
    { ...scenario, activityStartDate: '2026-01-01' },
    catalog,
    secondTurnover,
  )

  const firstMicro = first.micro
  const secondMicro = second.micro

  const avgGrossIncome = halfUpMean(firstMicro.grossIncome ?? 0, secondMicro.grossIncome ?? 0)
  const avgNetIncome = halfUpMean(firstMicro.netIncome, secondMicro.netIncome)
  const avgTotalValue = halfUpMean(firstMicro.totalValue, secondMicro.totalValue)
  const avgCharges = halfUpMean(firstMicro.charges, secondMicro.charges)
  const avgEconomicCosts = halfUpMean(firstMicro.economicCosts ?? 0, secondMicro.economicCosts ?? 0)

  const averagedMicro: StatusResult = {
    kind: 'micro',
    grossIncome: assertMoneyCents(avgGrossIncome),
    netIncome: avgNetIncome,
    totalValue: avgTotalValue,
    workedDays: validated.micro.billedDays,
    valuePerDay:
      validated.micro.billedDays === 0
        ? 'indeterminate'
        : (Math.round(avgTotalValue / validated.micro.billedDays) as MoneyCents),
    retirementContribution: 0,
    charges: avgCharges,
    statutoryDeductions: (firstMicro.statutoryDeductions ?? []).map((line, index) => ({
      ...line,
      base: assertMoneyCents(halfUpMean(line.base, secondMicro.statutoryDeductions![index]!.base)),
      amount: assertMoneyCents(
        halfUpMean(line.amount, secondMicro.statutoryDeductions![index]!.amount),
      ),
    })),
    economicCosts: assertMoneyCents(avgEconomicCosts),
    eligibility: firstMicro.eligibility,
    retirement: firstMicro.retirement,
    confidence: combineConfidence(firstMicro.confidence, secondMicro.confidence),
    // Annual warnings refer to the entered first year; cycle assumptions are
    // disclosed separately, never replace the historic-eligibility warning.
    warnings: firstMicro.warnings,
    ruleReferences: uniqueSources([
      ...(firstMicro.ruleReferences ?? []),
      ...(secondMicro.ruleReferences ?? []),
    ]),
    composition: (firstMicro.composition ?? []).map((part, i) => ({
      ...part,
      value: halfUpMean(part.value, secondMicro.composition?.[i]?.value ?? 0),
    })),
  }

  const employee = first.employee
  const warnings = [...averagedMicro.warnings!]

  return {
    micro: averagedMicro,
    employee,
    difference: averagedMicro.totalValue - employee.totalValue,
    confidence: combineConfidence(averagedMicro.confidence, employee.confidence),
    warnings,
    netIncomeDifference: averagedMicro.netIncome - employee.netIncome,
    economicValueDifference: averagedMicro.totalValue - employee.totalValue,
    microCycle: {
      first: firstMicro,
      second: secondMicro,
      firstTurnover,
      secondTurnover,
      annualAverageTurnover: halfUpMean(firstTurnover, secondTurnover),
    },
  }
}

export function forPeriod(value: number, period: ComparisonScenario['displayPeriod']): number {
  return period === 'monthly' ? value / 12 : value
}

export const euro = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

export function formatCents(value: number): string {
  return euro.format(value / 100)
}

export const compactEuro = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  notation: 'compact',
  maximumFractionDigits: 1,
})
