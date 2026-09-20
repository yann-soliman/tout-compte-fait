import type { ComparisonResult, ComparisonScenario, StatusResult } from './model'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const round = (value: number) => Math.round(value)

export function calculateComparison(scenario: ComparisonScenario): ComparisonResult {
  const microRevenue =
    Math.max(0, scenario.micro.dailyRate) * clamp(scenario.micro.workedDays, 0, 366)
  const microSocialCharges = microRevenue * 0.229
  const microFixedCosts =
    Math.max(0, scenario.micro.annualExpenses) +
    Math.max(0, scenario.micro.healthInsuranceMonthly) * 12 +
    Math.max(0, scenario.micro.cfeAnnual)
  const microRetirement = scenario.retirement.includeContributions ? microRevenue * 0.105 : 0
  const microNet = Math.max(0, microRevenue - microSocialCharges - microFixedCosts)
  const microTotal = microNet + microRetirement

  const ratio = clamp(scenario.employee.workRatio, 0, 100) / 100
  const employeeGross = Math.max(0, scenario.employee.grossAnnualSalary) * ratio
  const employeeContributions = employeeGross * 0.22
  const employeeRetirement = scenario.retirement.includeContributions ? employeeGross * 0.155 : 0
  const employeeNet = Math.max(0, employeeGross - employeeContributions)
  const employeeWorkedDays = Math.max(
    0,
    round(
      (261 -
        clamp(scenario.employee.paidLeaveWeeks, 0, 52) * 5 -
        clamp(scenario.employee.rttDays, 0, 366)) *
        ratio,
    ),
  )
  const employeeTotal =
    employeeNet + Math.max(0, scenario.employee.annualBenefits) + employeeRetirement

  const micro = toResult({
    kind: 'micro',
    netIncome: microNet,
    totalValue: microTotal,
    workedDays: clamp(scenario.micro.workedDays, 0, 366),
    retirementContribution: microRetirement,
    charges: microSocialCharges + microFixedCosts,
    composition: [
      { name: 'Revenu net', value: round(microNet), color: '#8b7cf6' },
      { name: 'Retraite', value: round(microRetirement), color: '#c4baff' },
      { name: 'Charges', value: round(microSocialCharges + microFixedCosts), color: '#e8e5ff' },
    ],
  })

  const employee = toResult({
    kind: 'employee',
    netIncome: employeeNet,
    totalValue: employeeTotal,
    workedDays: employeeWorkedDays,
    retirementContribution: employeeRetirement,
    charges: employeeContributions,
    composition: [
      { name: 'Revenu net', value: round(employeeNet), color: '#32c59d' },
      {
        name: 'Avantages',
        value: round(Math.max(0, scenario.employee.annualBenefits)),
        color: '#80dfc4',
      },
      { name: 'Retraite', value: round(employeeRetirement), color: '#bdeee0' },
      { name: 'Cotisations', value: round(employeeContributions), color: '#e0f8f1' },
    ],
  })

  return { micro, employee, difference: micro.totalValue - employee.totalValue }
}

function toResult(result: Omit<StatusResult, 'valuePerDay'>): StatusResult {
  return {
    ...result,
    netIncome: round(result.netIncome),
    totalValue: round(result.totalValue),
    retirementContribution: round(result.retirementContribution),
    charges: round(result.charges),
    valuePerDay: result.workedDays > 0 ? round(result.totalValue / result.workedDays) : 0,
  }
}

export function forPeriod(value: number, period: ComparisonScenario['period']): number {
  return period === 'monthly' ? value / 12 : value
}

export const euro = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

export const compactEuro = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  notation: 'compact',
  maximumFractionDigits: 1,
})
