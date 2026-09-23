import type {
  ComparisonResult,
  ComparisonScenario,
  RegulatoryCatalog,
  SourceReference,
  StatusResult,
} from './model'
import { calculateEmployeeIncome } from './employee'
import { assessMicroEligibility } from './eligibility'
import { calculateMicroIncome } from './micro'
import type { MoneyCents } from './money'
import { assertUsableCatalog } from './rules/2026'
import { validateScenario } from './validate'
import { employeeWorkedDays } from './worked-time'
import { calculateEmployeeRetirement, calculateMicroRetirement } from './retirement'

function uniqueSources(sources: SourceReference[]): SourceReference[] {
  return [...new Map(sources.map((source) => [source.canonicalUrl, source])).values()]
}

export function calculateComparison(
  scenario: ComparisonScenario,
  catalog: RegulatoryCatalog,
): ComparisonResult {
  const validated = validateScenario(scenario)
  assertUsableCatalog(catalog, validated.referenceYear)

  const eligibility = assessMicroEligibility(validated.micro, validated.activityStartDate, catalog)
  const microIncome = calculateMicroIncome(validated.micro, catalog, eligibility)
  const employeeIncome = calculateEmployeeIncome(validated.employee, catalog)
  const microRetirement = validated.retirement.includeRights
    ? calculateMicroRetirement(validated.micro, catalog)
    : undefined
  const employeeRetirement = validated.retirement.includeRights
    ? calculateEmployeeRetirement(validated.employee, catalog)
    : undefined

  const micro: StatusResult = {
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
    eligibility,
    retirement: microRetirement,
    confidence: microIncome.confidence,
    warnings: microIncome.warnings,
    ruleReferences: uniqueSources([...microIncome.sources, eligibility.source]),
    composition: [
      { name: 'Revenu net', value: microIncome.netIncome, color: '#8b7cf6' },
      { name: 'Frais économiques', value: microIncome.economicCosts, color: '#e8e5ff' },
      { name: 'Prélèvements', value: microIncome.statutoryDeductions, color: '#c4baff' },
    ],
  }
  const employeeDays = employeeWorkedDays(
    validated.referenceYear,
    validated.employee.workRatioPercent,
    validated.employee.paidLeaveWeeks,
    validated.employee.rttDays,
  )
  const employee: StatusResult = {
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
  const warnings = [...microIncome.warnings]
  return {
    micro,
    employee,
    difference: micro.totalValue - employee.totalValue,
    netIncomeDifference: micro.netIncome - employee.netIncome,
    economicValueDifference: micro.totalValue - employee.totalValue,
    confidence:
      micro.confidence === 'blocked' || employee.confidence === 'blocked'
        ? 'blocked'
        : micro.confidence === 'estimated' || employee.confidence === 'estimated'
          ? 'estimated'
          : 'established',
    warnings,
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
