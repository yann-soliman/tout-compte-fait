import type { ComparisonResult, ProjectionPoint } from './model'

export function buildProjection(
  result: ComparisonResult,
  years: number,
  annualGrowthPercent: number,
): ProjectionPoint[] {
  const duration = Math.min(30, Math.max(1, Math.round(years)))
  const growth = Math.max(-100, annualGrowthPercent) / 100
  let microCumulative = 0
  let employeeCumulative = 0

  return Array.from({ length: duration }, (_, index) => {
    const factor = Math.pow(1 + growth, index)
    microCumulative += result.micro.totalValue * factor
    employeeCumulative += result.employee.totalValue * factor
    return {
      year: index + 1,
      microCumulative: Math.round(microCumulative),
      employeeCumulative: Math.round(employeeCumulative),
    }
  })
}
