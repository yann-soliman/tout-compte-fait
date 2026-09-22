import type {
  Confidence,
  DeductionLine,
  EmployeeScenario,
  RegulatoryCatalog,
  SourceReference,
} from './model'
import { applyRate, assertMoneyCents, type MoneyCents } from './money'

export interface EmployeeIncomeResult {
  grossIncome: MoneyCents
  deductions: DeductionLine[]
  statutoryDeductions: MoneyCents
  netIncome: MoneyCents
  economicValue: number
  confidence: Confidence
  sources: SourceReference[]
}

export function calculateEmployeeIncome(
  scenario: EmployeeScenario,
  catalog: RegulatoryCatalog,
): EmployeeIncomeResult {
  const gross = scenario.grossAnnualSalary
  const deductions = catalog.employeeContributions.flatMap((rule): DeductionLine[] => {
    if (rule.category === 'cadre' && scenario.category !== 'cadre') return []
    if (rule.triggerAbove !== undefined && gross <= rule.triggerAbove) return []
    const upper = rule.upperInclusive === undefined ? gross : Math.min(gross, rule.upperInclusive)
    const bandBase = Math.max(0, upper - rule.lowerExclusive)
    if (bandBase === 0) return []
    const base = applyRate(assertMoneyCents(bandBase), rule.baseFactor ?? 1_000_000, rule.rounding)
    return [
      {
        id: rule.id,
        label: rule.label,
        base,
        amount: applyRate(base, rule.rate, rule.rounding),
        source: rule.source,
      },
    ]
  })
  const statutoryDeductions = assertMoneyCents(
    deductions.reduce((total, deduction) => total + deduction.amount, 0),
  )
  const netIncome = assertMoneyCents(gross - statutoryDeductions)
  return {
    grossIncome: gross,
    deductions,
    statutoryDeductions,
    netIncome,
    economicValue: netIncome + scenario.annualBenefits,
    confidence: 'established',
    sources: [
      ...new Map(deductions.map((line) => [line.source.canonicalUrl, line.source])).values(),
    ],
  }
}
