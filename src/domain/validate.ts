import type { ComparisonScenario } from './model'
import { assertMoneyCents } from './money'

function assertIntegerRange(value: number, minimum: number, maximum: number, label: string): void {
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new RangeError(`${label} doit être un entier compris entre ${minimum} et ${maximum}.`)
  }
}

function assertNumberRange(value: number, minimum: number, maximum: number, label: string): void {
  if (!Number.isFinite(value) || value < minimum || value > maximum) {
    throw new RangeError(`${label} doit être compris entre ${minimum} et ${maximum}.`)
  }
}

function assertActivityStartDate(value: string): void {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) throw new RangeError('La date de début d’activité doit être une date ISO valide.')

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  if (
    year !== 2026 ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new RangeError('La date de début d’activité doit être valide et située en 2026.')
  }
}

export function validateScenario(scenario: ComparisonScenario): ComparisonScenario {
  if (scenario.referenceYear !== 2026) {
    throw new RangeError('L’année de référence doit être strictement égale à 2026.')
  }

  assertMoneyCents(scenario.micro.dailyRate)
  assertMoneyCents(scenario.micro.professionalExpenses)
  assertMoneyCents(scenario.micro.healthInsuranceMonthly)
  if (scenario.micro.cfeAnnual !== undefined) assertMoneyCents(scenario.micro.cfeAnnual)
  assertMoneyCents(scenario.employee.grossAnnualSalary)
  assertMoneyCents(scenario.employee.annualBenefits)

  assertIntegerRange(scenario.micro.billedDays, 0, 366, 'Le nombre de jours facturés')
  assertIntegerRange(scenario.employee.workRatioPercent, 1, 100, 'La quotité de travail')
  assertNumberRange(scenario.employee.paidLeaveWeeks, 0, 52, 'Les congés payés')
  if (!Number.isInteger(scenario.employee.paidLeaveWeeks * 2)) {
    throw new RangeError('Les congés payés doivent être saisis par incréments de 0,5 semaine.')
  }
  assertIntegerRange(scenario.employee.rttDays, 0, 366, 'Le nombre de jours de RTT')
  assertIntegerRange(scenario.projection.years, 1, 30, 'L’horizon de projection')
  assertNumberRange(scenario.projection.annualGrowthRate, -100, 100, 'La croissance annuelle')

  if (scenario.activityStartDate !== undefined) assertActivityStartDate(scenario.activityStartDate)
  return scenario
}
