import type { ComparisonResult, ComparisonScenario, RegulatoryCatalog, StatusKind } from './model'
import { calculateComparison } from './calculate'
import { assertMoneyCents } from './money'
import { findMinimumRate } from './balance'

export function evaluateOpportunity(
  scenario: ComparisonScenario,
  catalog: RegulatoryCatalog,
  dailyRate: number,
  billedDays: number,
) {
  const result = calculateComparison(
    {
      ...scenario,
      retirement: { ...scenario.retirement, includeRights: false },
      micro: { ...scenario.micro, dailyRate: assertMoneyCents(dailyRate), billedDays },
    },
    catalog,
  )
  const difference = result.micro.totalValue - result.employee.totalValue
  if (!Number.isSafeInteger(difference)) throw new RangeError('Écart hors plage monétaire sûre.')
  const eligibility = result.micro.eligibility!
  const warnings = result.micro.warnings ?? []
  const underCeiling = eligibility.state === 'not-confirmed'
  return {
    dailyRate,
    billedDays,
    difference,
    turnover: eligibility.turnover,
    applicableCeiling: eligibility.applicableCeiling,
    microValue: result.micro.totalValue,
    employeeValue: result.employee.totalValue,
    underCeiling,
    warnings,
    canApply:
      billedDays > 0 && underCeiling && !warnings.some((warning) => warning.code === 'cfe-unknown'),
  }
}

export type Opportunity = ReturnType<typeof evaluateOpportunity>

export function opportunityGrid(scenario: ComparisonScenario, catalog: RegulatoryCatalog) {
  const current = evaluateOpportunity(
    scenario,
    catalog,
    scenario.micro.dailyRate,
    scenario.micro.billedDays,
  )
  const maxDays = Math.min(366, Math.max(240, Math.ceil(scenario.micro.billedDays * 1.2)))
  const maxRate = assertMoneyCents(
    Math.max(100_000, Math.ceil((scenario.micro.dailyRate * 1.25) / 10_000) * 10_000),
  )
  const sample = (maximum: number) =>
    Array.from(new Set(Array.from({ length: 13 }, (_, i) => Math.round((maximum * i) / 12))))
  const days = sample(maxDays)
  const rates = sample(maxRate)
  const cells = rates.flatMap((rate) =>
    days.map((day) => evaluateOpportunity(scenario, catalog, rate, day)),
  )
  const balance = days.flatMap((day) => {
    const result = findMinimumRate(scenario, 'totalValue', current.employeeValue, day, catalog)
    const rate = result.dailyRateCents ?? result.hypotheticalDailyRateCents
    return rate === undefined || rate > maxRate ? [] : [{ billedDays: day, dailyRate: rate }]
  })
  const ceiling = Array.from({ length: maxDays + 1 }, (_, day) => ({
    billedDays: day,
    dailyRate: day === 0 ? maxRate : Math.min(maxRate, current.applicableCeiling / day),
  }))
  const scale = Math.max(
    1,
    ...cells.filter((cell) => cell.underCeiling).map((cell) => Math.abs(cell.difference)),
  )
  return { days, rates, cells, balance, ceiling, maxDays, maxRate, scale, current }
}

export const preciseEuro = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export interface MoneyStep {
  label: string
  start: number
  end: number
  amount: number
  kind: 'total' | 'deduction' | 'addition' | 'net'
}
export interface MoneyFlow {
  kind: StatusKind
  steps: [MoneyStep, MoneyStep, MoneyStep, MoneyStep, MoneyStep]
}

export function moneyFlows(result: ComparisonResult) {
  const items: MoneyFlow[] = (['micro', 'employee'] as const).map((kind): MoneyFlow => {
    const status = result[kind]
    const gross = status.grossIncome
    if (gross === undefined || gross < 0)
      throw new RangeError('Montant brut indisponible pour le graphique.')
    const net = status.netIncome
    const total = status.totalValue
    const step = (
      label: string,
      start: number,
      end: number,
      kind: MoneyStep['kind'],
    ): MoneyStep => ({ label, start, end, amount: end - start, kind })
    return {
      kind,
      steps: [
        step(kind === 'micro' ? 'Chiffre d’affaires' : 'Salaire brut', 0, gross, 'total'),
        step('Prélèvements', gross, net, 'deduction'),
        step('Revenu net', 0, net, 'net'),
        step(
          kind === 'micro' ? 'Frais économiques' : 'Avantages',
          net,
          total,
          kind === 'micro' ? 'deduction' : 'addition',
        ),
        step('Valeur économique', 0, total, 'total'),
      ],
    }
  })
  const endpoints = items.flatMap((flow) =>
    flow.steps.flatMap((step) => [step.start, step.end, step.amount]),
  )
  if (!endpoints.every(Number.isSafeInteger))
    throw new RangeError('Montant graphique hors plage sûre.')
  const coordinates = items.flatMap((flow) => flow.steps.flatMap((step) => [step.start, step.end]))
  const min = Math.min(0, ...coordinates)
  const max = Math.max(0, ...coordinates)
  return { items, min, max: max === min ? min + 100 : max }
}
