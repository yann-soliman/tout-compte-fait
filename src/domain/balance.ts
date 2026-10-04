import { calculateComparison } from './calculate'
import { assertMoneyCents, type MoneyCents } from './money'
import type { ComparisonScenario, RegulatoryCatalog } from './model'
import { validateScenario } from './validate'

export type BalanceTarget = 'netIncome' | 'totalValue'
export type BalanceState =
  | 'reachable'
  | 'target-above-eligible-ceiling'
  | 'indeterminate'
  | 'blocked'
  | 'outside-safe-calculation-range'

export interface BalanceResult {
  state: BalanceState
  targetKind: BalanceTarget
  targetAnnualCents: number
  billedDays: number
  dailyRateCents?: number
  precedingRateCents?: number
  hypotheticalDailyRateCents?: number
  precedingHypotheticalRateCents?: number
  maximumEligibleRateCents?: number
  projectedTurnoverCents?: number
  message: string
}

const SAFE_INTEGER = Number.MAX_SAFE_INTEGER

function searchMinimum(
  scenario: ComparisonScenario,
  target: BalanceTarget,
  targetCents: number,
  days: number,
  maximumRate: number,
  catalog: RegulatoryCatalog,
): number | undefined {
  let low = 0
  let high = maximumRate
  while (low < high) {
    const middle = low + Math.floor((high - low) / 2)
    const result = calculateComparison(
      {
        ...scenario,
        retirement: { ...scenario.retirement, includeRights: false },
        micro: { ...scenario.micro, dailyRate: assertMoneyCents(middle), billedDays: days },
      },
      catalog,
    )
    const value = target === 'netIncome' ? result.micro.netIncome : result.micro.totalValue
    if (value >= targetCents) high = middle
    else low = middle + 1
  }
  const atCandidate = calculateComparison(
    {
      ...scenario,
      retirement: { ...scenario.retirement, includeRights: false },
      micro: { ...scenario.micro, dailyRate: assertMoneyCents(low), billedDays: days },
    },
    catalog,
  )
  const candidateValue =
    target === 'netIncome' ? atCandidate.micro.netIncome : atCandidate.micro.totalValue
  if (candidateValue < targetCents) return undefined

  if (low > 0) {
    const previous = calculateComparison(
      {
        ...scenario,
        retirement: { ...scenario.retirement, includeRights: false },
        micro: { ...scenario.micro, dailyRate: assertMoneyCents(low - 1), billedDays: days },
      },
      catalog,
    )
    const previousValue =
      target === 'netIncome' ? previous.micro.netIncome : previous.micro.totalValue
    if (previousValue >= targetCents) {
      throw new Error('La vérification du taux minimal au centime précédent a échoué.')
    }
  }
  return low
}

function blocked(
  target: BalanceTarget,
  targetCents: number,
  days: number,
  message: string,
): BalanceResult {
  return {
    state: 'blocked',
    targetKind: target,
    targetAnnualCents: targetCents,
    billedDays: days,
    message,
  }
}

export function findMinimumRate(
  scenario: ComparisonScenario,
  target: BalanceTarget,
  targetAnnualCents: number,
  billedDays: number,
  catalog: RegulatoryCatalog,
): BalanceResult {
  if (!Number.isSafeInteger(targetAnnualCents) || targetAnnualCents < 0) {
    return blocked(
      target,
      targetAnnualCents,
      billedDays,
      'La cible annuelle doit être un montant positif ou nul en centimes entiers.',
    )
  }
  if (!Number.isSafeInteger(billedDays) || billedDays < 0 || billedDays > 366) {
    return blocked(
      target,
      targetAnnualCents,
      billedDays,
      'Le nombre de jours doit être un entier compris entre 0 et 366.',
    )
  }
  if (billedDays === 0) {
    return {
      state: 'indeterminate',
      targetKind: target,
      targetAnnualCents,
      billedDays,
      message: 'Taux indéterminé sans jour facturé.',
    }
  }

  let validated: ComparisonScenario
  try {
    validated = validateScenario({
      ...scenario,
      micro: { ...scenario.micro, billedDays },
      retirement: { ...scenario.retirement, includeRights: false },
    })
    if (catalog.year !== validated.referenceYear) {
      throw new RangeError(
        `Catalogue ${catalog.year} non pris en charge pour ${validated.referenceYear}.`,
      )
    }
    if (
      (scenario.micro.cfeAnnual === undefined || scenario.micro.cfeAnnual === 0) &&
      !scenario.micro.cfeExemptionConfirmed
    ) {
      throw new RangeError(
        'Renseigner la CFE ou confirmer son exonération avant de calculer un taux d’équilibre.',
      )
    }
    calculateComparison(validated, catalog)

    const fullCeiling = catalog.microTurnoverCeiling.value
    let activityDays = 365
    if (validated.activityStartDate !== undefined) {
      const start = new Date(`${validated.activityStartDate}T00:00:00Z`)
      activityDays = Math.floor((Date.UTC(2026, 11, 31) - start.getTime()) / 86_400_000) + 1
    }
    const proratedTurnoverCeiling = Math.floor((fullCeiling * activityDays) / 365)
    const maximumEligibleRate = Math.floor(proratedTurnoverCeiling / billedDays)
    const eligibleRate = searchMinimum(
      validated,
      target,
      targetAnnualCents,
      billedDays,
      maximumEligibleRate,
      catalog,
    )
    if (eligibleRate !== undefined) {
      return {
        state: 'reachable',
        targetKind: target,
        targetAnnualCents,
        billedDays,
        dailyRateCents: eligibleRate,
        precedingRateCents: Math.max(0, eligibleRate - 1),
        maximumEligibleRateCents: maximumEligibleRate,
        projectedTurnoverCents: eligibleRate * billedDays,
        message:
          'Taux minimal sous le plafond 2026; l’éligibilité reste à confirmer avec les chiffres d’affaires antérieurs.',
      }
    }

    const annualCosts =
      scenario.micro.professionalExpenses +
      scenario.micro.healthInsuranceMonthly * 12 +
      (scenario.micro.cfeAnnual ?? 0)
    const safeTurnover = SAFE_INTEGER - annualCosts
    const safeRate = Math.max(0, Math.floor(safeTurnover / billedDays))
    const hypothetical = searchMinimum(
      validated,
      target,
      targetAnnualCents,
      billedDays,
      safeRate,
      catalog,
    )
    if (hypothetical === undefined) {
      return {
        state: 'outside-safe-calculation-range',
        targetKind: target,
        targetAnnualCents,
        billedDays,
        maximumEligibleRateCents: maximumEligibleRate,
        message:
          'Cible impossible dans la plage de calcul sûre; aucun taux indicatif ne peut être affiché.',
      }
    }
    return {
      state: 'target-above-eligible-ceiling',
      targetKind: target,
      targetAnnualCents,
      billedDays,
      hypotheticalDailyRateCents: hypothetical,
      precedingHypotheticalRateCents: Math.max(0, hypothetical - 1),
      maximumEligibleRateCents: maximumEligibleRate,
      projectedTurnoverCents: hypothetical * billedDays,
      message:
        'Cible hors plafond micro : taux indicatif non éligible, non recommandé et non applicable.',
    }
  } catch (error) {
    return blocked(
      target,
      targetAnnualCents,
      billedDays,
      error instanceof Error ? error.message : 'Calcul d’équilibre bloqué.',
    )
  }
}

export function calculateBalance(
  scenario: ComparisonScenario,
  target: BalanceTarget,
  billedDays: number,
  catalog: RegulatoryCatalog,
): BalanceResult {
  try {
    const validated = validateScenario(scenario)
    const comparison = calculateComparison(validated, catalog)
    const targetAnnualCents =
      target === 'netIncome' ? comparison.employee.netIncome : comparison.employee.totalValue
    return findMinimumRate(scenario, target, targetAnnualCents, billedDays, catalog)
  } catch (error) {
    return blocked(
      target,
      0,
      billedDays,
      error instanceof Error ? error.message : 'Calcul d’équilibre bloqué.',
    )
  }
}

export function applyBalanceRate(
  scenario: ComparisonScenario,
  result: BalanceResult,
): ComparisonScenario {
  if (result.state !== 'reachable' || result.dailyRateCents === undefined) {
    throw new RangeError('Seul un taux atteignable dans le plafond peut être appliqué.')
  }
  return {
    ...scenario,
    micro: { ...scenario.micro, dailyRate: assertMoneyCents(result.dailyRateCents) as MoneyCents },
  }
}
