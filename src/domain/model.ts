export type DisplayPeriod = 'annual' | 'monthly'
export type AppView = 'simulator' | 'projection'
export type StatusKind = 'micro' | 'employee'

export interface MicroScenario {
  dailyRate: number
  workedDays: number
  annualExpenses: number
  healthInsuranceMonthly: number
  cfeAnnual: number
}

export interface EmployeeScenario {
  grossAnnualSalary: number
  workRatio: number
  paidLeaveWeeks: number
  rttDays: number
  annualBenefits: number
}

export interface RetirementScenario {
  includeContributions: boolean
  comparisonYears: number
  annualGrowth: number
}

export interface ComparisonScenario {
  referenceYear: number
  period: DisplayPeriod
  householdParts: number
  otherTaxableIncome: number
  micro: MicroScenario
  employee: EmployeeScenario
  retirement: RetirementScenario
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
}

export interface ComparisonResult {
  micro: StatusResult
  employee: StatusResult
  difference: number
}

export interface ProjectionPoint {
  year: number
  microCumulative: number
  employeeCumulative: number
}
