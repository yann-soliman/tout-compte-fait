import type { ComparisonScenario, RegulatoryCatalog } from './model'
import { calculateComparison } from './calculate'
import { calculateBalance } from './balance'

export interface Threshold {
  state: 'margin' | 'effort' | 'unreachable' | 'unavailable'
  amount?: number
  threshold?: number
  withinCeiling?: boolean
  message?: string
}

export function calculateRobustness(scenario: ComparisonScenario, catalog: RegulatoryCatalog) {
  const annual = { ...scenario, retirement: { ...scenario.retirement, includeRights: false } }
  const current = calculateComparison(annual, catalog)
  const warnings = current.micro.warnings ?? []
  if (warnings.some((warning) => warning.code === 'cfe-unknown')) {
    const unavailable: Threshold = {
      state: 'unavailable',
      message: 'Renseigner la CFE ou confirmer son exonération.',
    }
    return {
      days: unavailable,
      rate: unavailable,
      expenses: unavailable,
      difference: undefined,
      warnings,
      theoretical: true,
    }
  }
  const atDays = (billedDays: number) =>
    calculateComparison({ ...annual, micro: { ...annual.micro, billedDays } }, catalog)
  let low = 0
  const maximumDays =
    scenario.micro.dailyRate === 0
      ? 366
      : Math.min(366, Math.floor(Number.MAX_SAFE_INTEGER / scenario.micro.dailyRate))
  let high = maximumDays
  while (low < high) {
    const mid = low + Math.floor((high - low) / 2)
    if (atDays(mid).micro.totalValue >= current.employee.totalValue) high = mid
    else low = mid + 1
  }
  const candidate = atDays(low)
  const days: Threshold =
    candidate.micro.totalValue < current.employee.totalValue
      ? {
          state: 'unreachable',
          message: `Équilibre impossible en ${maximumDays} jours dans la plage de calcul sûre à ce TJM.`,
        }
      : {
          state: scenario.micro.billedDays >= low ? 'margin' : 'effort',
          amount: Math.abs(scenario.micro.billedDays - low),
          threshold: low,
          withinCeiling: candidate.micro.eligibility?.state === 'not-confirmed',
        }
  const balance = calculateBalance(annual, 'totalValue', scenario.micro.billedDays, catalog)
  const minimumRate = balance.dailyRateCents ?? balance.hypotheticalDailyRateCents
  const rate: Threshold =
    minimumRate === undefined
      ? { state: 'unavailable', message: balance.message }
      : {
          state: scenario.micro.dailyRate >= minimumRate ? 'margin' : 'effort',
          amount: Math.abs(scenario.micro.dailyRate - minimumRate),
          threshold: minimumRate,
          withinCeiling: balance.state === 'reachable',
        }
  const difference = current.micro.totalValue - current.employee.totalValue
  if (!Number.isSafeInteger(difference)) throw new RangeError('Écart hors plage sûre.')
  const expenses: Threshold =
    difference >= 0
      ? {
          state: 'margin',
          amount: difference,
          threshold: scenario.micro.professionalExpenses + difference,
        }
      : -difference > scenario.micro.professionalExpenses
        ? {
            state: 'unreachable',
            message: 'Réduire les frais professionnels à zéro ne suffit pas.',
          }
        : {
            state: 'effort',
            amount: -difference,
            threshold: scenario.micro.professionalExpenses + difference,
          }
  return {
    days,
    rate,
    expenses,
    difference,
    warnings: current.micro.warnings ?? [],
    theoretical: current.micro.eligibility?.state !== 'not-confirmed',
  }
}
