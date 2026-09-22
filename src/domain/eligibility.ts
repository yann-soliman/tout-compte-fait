import type { EligibilityAssessment, MicroScenario, RegulatoryCatalog } from './model'
import { assertMoneyCents } from './money'

function daysInActivity(startDate: string): number {
  const start = new Date(`${startDate}T00:00:00Z`)
  const end = new Date('2026-12-31T00:00:00Z')
  return Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1
}

export function assessMicroEligibility(
  micro: MicroScenario,
  activityStartDate: string | undefined,
  catalog: RegulatoryCatalog,
): EligibilityAssessment {
  const turnover = assertMoneyCents(micro.dailyRate * micro.billedDays)
  const fullCeiling = catalog.microTurnoverCeiling.value

  if (micro.activity !== 'non-regulated-liberal-bnc') {
    return {
      state: 'out-of-scope',
      turnover,
      applicableCeiling: fullCeiling,
      source: catalog.microTurnoverCeiling.source,
    }
  }

  const activityDays = activityStartDate === undefined ? 365 : daysInActivity(activityStartDate)
  const applicableCeiling = assertMoneyCents(Math.floor((fullCeiling * activityDays) / 365))
  const exceeds = turnover * 365 > fullCeiling * activityDays
  return {
    state: exceeds ? 'ceiling-exceeded' : 'not-confirmed',
    turnover,
    applicableCeiling,
    source: catalog.microTurnoverCeiling.source,
  }
}
