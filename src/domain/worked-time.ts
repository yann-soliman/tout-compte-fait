export function countWeekdays(year: number): number {
  let weekdays = 0
  const date = new Date(Date.UTC(year, 0, 1))
  while (date.getUTCFullYear() === year) {
    const day = date.getUTCDay()
    if (day !== 0 && day !== 6) weekdays += 1
    date.setUTCDate(date.getUTCDate() + 1)
  }
  return weekdays
}

export function employeeWorkedDays(
  year: number,
  workRatioPercent: number,
  paidLeaveWeeks: number,
  rttDays: number,
): number {
  const fullTimeWorkedDays = Math.max(0, countWeekdays(year) - paidLeaveWeeks * 5 - rttDays)
  return Math.max(0, Math.round((fullTimeWorkedDays * workRatioPercent) / 100))
}
