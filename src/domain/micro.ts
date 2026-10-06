import type {
  Confidence,
  DeductionLine,
  EligibilityAssessment,
  MicroScenario,
  RegulatoryCatalog,
  ResultWarning,
  SourceReference,
} from './model'
import { applyRate, assertMoneyCents, type MoneyCents } from './money'

export interface MicroIncomeResult {
  turnover: MoneyCents
  deductions: DeductionLine[]
  statutoryDeductions: MoneyCents
  netIncome: MoneyCents
  economicCosts: MoneyCents
  economicValue: number
  confidence: Confidence
  warnings: ResultWarning[]
  sources: SourceReference[]
  eligibility: EligibilityAssessment
}

/** Core calculation shared by public API and override variants. */
function computeMicroIncomeGivenTurnover(
  scenario: MicroScenario,
  catalog: RegulatoryCatalog,
  turnover: MoneyCents,
  eligibility: EligibilityAssessment,
): MicroIncomeResult {
  const deductions: DeductionLine[] = [catalog.microSocial, catalog.professionalTraining].map(
    (rule) => ({
      id: rule.id,
      label:
        rule.id === catalog.microSocial.id ? 'Cotisations sociales' : 'Formation professionnelle',
      base: turnover,
      amount: applyRate(
        turnover,
        rule.value,
        rule.rounding === 'down' || rule.rounding === 'up' ? rule.rounding : 'half-up',
      ),
      source: rule.source,
    }),
  )
  const statutoryDeductions = assertMoneyCents(
    deductions.reduce((total, deduction) => total + deduction.amount, 0),
  )
  const netIncome = assertMoneyCents(turnover - statutoryDeductions)
  const insuranceAnnual = assertMoneyCents(scenario.healthInsuranceMonthly * 12)
  const cfeKnown =
    scenario.cfeExemptionConfirmed || (scenario.cfeAnnual !== undefined && scenario.cfeAnnual > 0)
  const cfe = scenario.cfeAnnual ?? assertMoneyCents(0)
  const economicCosts = assertMoneyCents(scenario.professionalExpenses + insuranceAnnual + cfe)
  const warnings: ResultWarning[] = []
  if (!cfeKnown) {
    warnings.push({
      code: 'cfe-unknown',
      message: 'Renseigner la CFE ou confirmer une exonération pour établir la valeur économique.',
      affectedStatus: 'micro',
    })
  }
  if (eligibility.state !== 'not-confirmed') {
    warnings.push({
      code: eligibility.state,
      message: 'Le chiffre d’affaires dépasse le plafond applicable au scénario saisi.',
      affectedStatus: 'micro',
    })
  } else {
    warnings.push({
      code: 'eligibility-not-confirmed',
      message: 'Éligibilité non confirmée sans historique des deux années précédentes.',
      affectedStatus: 'micro',
    })
  }
  return {
    turnover,
    deductions,
    statutoryDeductions,
    netIncome,
    economicCosts,
    economicValue: netIncome - economicCosts,
    confidence: cfeKnown ? 'established' : 'estimated',
    warnings,
    sources: [catalog.microSocial.source, catalog.professionalTraining.source, catalog.cfe.source],
    eligibility,
  }
}

export function calculateMicroIncome(
  scenario: MicroScenario,
  catalog: RegulatoryCatalog,
  eligibility: EligibilityAssessment,
  turnoverOverride?: MoneyCents,
): MicroIncomeResult {
  const turnover =
    turnoverOverride !== undefined
      ? assertMoneyCents(turnoverOverride)
      : assertMoneyCents(scenario.dailyRate * scenario.billedDays)
  return computeMicroIncomeGivenTurnover(scenario, catalog, turnover, eligibility)
}
