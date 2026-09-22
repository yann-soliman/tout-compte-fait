import type { ComparisonScenario } from './model'
import { assertMoneyCents } from './money'

export const defaultScenario: ComparisonScenario = {
  referenceYear: 2026,
  displayPeriod: 'annual',
  micro: {
    activity: 'non-regulated-liberal-bnc',
    dailyRate: assertMoneyCents(60_000),
    billedDays: 160,
    professionalExpenses: assertMoneyCents(240_000),
    healthInsuranceMonthly: assertMoneyCents(2_500),
    cfeAnnual: assertMoneyCents(60_000),
    cfeExemptionConfirmed: false,
  },
  employee: {
    grossAnnualSalary: assertMoneyCents(5_800_000),
    category: 'cadre',
    workRatioPercent: 100,
    paidLeaveWeeks: 5,
    rttDays: 6,
    annualBenefits: assertMoneyCents(300_000),
  },
  retirement: {
    includeRights: true,
    valuationMode: 'rights-2026-indicative',
  },
  projection: {
    years: 10,
    annualGrowthRate: 2,
  },
}
