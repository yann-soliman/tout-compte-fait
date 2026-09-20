import type { ComparisonScenario } from './model'

export const defaultScenario: ComparisonScenario = {
  referenceYear: 2026,
  period: 'annual',
  householdParts: 1,
  otherTaxableIncome: 0,
  micro: {
    dailyRate: 600,
    workedDays: 160,
    annualExpenses: 2400,
    healthInsuranceMonthly: 25,
    cfeAnnual: 600,
  },
  employee: {
    grossAnnualSalary: 58000,
    workRatio: 100,
    paidLeaveWeeks: 5,
    rttDays: 6,
    annualBenefits: 3000,
  },
  retirement: {
    includeContributions: true,
    comparisonYears: 10,
    annualGrowth: 2,
  },
}
