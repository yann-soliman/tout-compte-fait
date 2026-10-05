import { defaultTaxHousehold } from './income-tax'
import { eurosToMoneyCents } from './money'
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

export function parseTaxSettings(settings: TaxSettings) {
  if (settings.otherIncomeEuros.trim() === '')
    throw new RangeError('Renseigner les autres revenus nets imposables, ou zéro.')
  return {
    household: {
      ...defaultTaxHousehold,
      status: settings.status,
      children: settings.children,
      otherTaxableIncome: eurosToMoneyCents(Number(settings.otherIncomeEuros)),
    },
    salaryOverride:
      settings.salaryNetTaxableEuros.trim() === ''
        ? undefined
        : eurosToMoneyCents(Number(settings.salaryNetTaxableEuros)),
  }
}
