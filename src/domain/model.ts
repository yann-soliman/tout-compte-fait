import type { MoneyCents, RatePpm, RoundingMode } from './money'

export type DisplayPeriod = 'annual' | 'monthly'
export type AppView = 'simulator' | 'projection'
export type StatusKind = 'micro' | 'employee'
export type Confidence = 'established' | 'estimated' | 'blocked'
export type RuleStatus = 'known' | 'provisional' | 'estimated'

export interface SourceReference {
  authority: string
  documentTitle: string
  canonicalUrl: string
  effectiveDate: string
  verificationDate: string
  status: RuleStatus
}

export interface RegulatoryRule<T> {
  id: string
  value: T
  base: string
  bounds?: string
  rounding: RoundingMode | 'exact' | 'not-applicable'
  source: SourceReference
}

export interface ContributionBand {
  id: string
  label: string
  lowerExclusive: MoneyCents
  upperInclusive?: MoneyCents
  rate: RatePpm
  category: 'all' | 'cadre'
  source: SourceReference
  rounding: RoundingMode
}

export interface RetirementRuleSet {
  affiliation: string
  qualifyingBaseFormula: string
  quarterThreshold?: RegulatoryRule<MoneyCents>
  annualQuarterCap?: RegulatoryRule<number>
  pointPurchaseValue?: RegulatoryRule<MoneyCents>
  pointServiceValue?: RegulatoryRule<MoneyCents>
}

export interface RegulatoryCatalog {
  year: 2026
  microSocial: RegulatoryRule<RatePpm>
  professionalTraining: RegulatoryRule<RatePpm>
  microTurnoverCeiling: RegulatoryRule<MoneyCents>
  socialSecurityCeilingMonthly: RegulatoryRule<MoneyCents>
  socialSecurityCeilingAnnual: RegulatoryRule<MoneyCents>
  employeeContributions: ContributionBand[]
  baseRetirement: RetirementRuleSet
  complementaryRetirement?: RetirementRuleSet
  cfe: RegulatoryRule<'user-entered-or-exempt'>
}

export interface MicroScenario {
  activity: 'non-regulated-liberal-bnc'
  dailyRate: MoneyCents
  billedDays: number
  professionalExpenses: MoneyCents
  healthInsuranceMonthly: MoneyCents
  cfeAnnual?: MoneyCents
  cfeExemptionConfirmed: boolean
}

export interface EmployeeScenario {
  grossAnnualSalary: MoneyCents
  category: 'cadre' | 'non-cadre'
  workRatioPercent: number
  paidLeaveWeeks: number
  rttDays: number
  annualBenefits: MoneyCents
}

export interface RetirementOptions {
  includeRights: boolean
  valuationMode: 'rights-2026-indicative'
}

export interface ProjectionOptions {
  years: number
  annualGrowthRate: number
}

export interface ComparisonScenario {
  referenceYear: 2026
  displayPeriod: DisplayPeriod
  activityStartDate?: string
  micro: MicroScenario
  employee: EmployeeScenario
  retirement: RetirementOptions
  projection: ProjectionOptions
}

export interface ResultWarning {
  code: string
  message: string
  affectedStatus?: StatusKind
}

// Temporary adapter contract for the existing UI. T013/T024 migrate it to ComparisonScenario.
export interface LegacyMicroScenario {
  dailyRate: number
  workedDays: number
  annualExpenses: number
  healthInsuranceMonthly: number
  cfeAnnual: number
}

export interface LegacyEmployeeScenario {
  grossAnnualSalary: number
  workRatio: number
  paidLeaveWeeks: number
  rttDays: number
  annualBenefits: number
}

export interface LegacyRetirementScenario {
  includeContributions: boolean
  comparisonYears: number
  annualGrowth: number
}

export interface LegacyComparisonScenario {
  referenceYear: number
  period: DisplayPeriod
  householdParts: number
  otherTaxableIncome: number
  micro: LegacyMicroScenario
  employee: LegacyEmployeeScenario
  retirement: LegacyRetirementScenario
}

export interface CompositionPart {
  name: string
  value: number
  color: string
}
export interface StatusResult {
  kind: StatusKind
  netIncome: number
  totalValue: number
  workedDays: number
  valuePerDay: number
  retirementContribution: number
  charges: number
  composition: CompositionPart[]
  confidence?: Confidence
  warnings?: ResultWarning[]
  ruleReferences?: SourceReference[]
}
export interface ComparisonResult {
  micro: StatusResult
  employee: StatusResult
  difference: number
  confidence?: Confidence
  warnings?: ResultWarning[]
}
export interface ProjectionPoint {
  year: number
  microCumulative: number
  employeeCumulative: number
}
