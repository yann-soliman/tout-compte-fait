import type { TaxHousehold } from './income-tax'

/** Ephemeral form state, deliberately excluded from stored ComparisonScenario schema 1. */
export interface TaxSettings {
  enabled: boolean
  status: TaxHousehold['status']
  children: number
  otherIncomeEuros: string
  salaryNetTaxableEuros: string
}
export const defaultTaxSettings: TaxSettings = {
  enabled: false,
  status: 'single',
  children: 0,
  otherIncomeEuros: '0',
  salaryNetTaxableEuros: '',
}
