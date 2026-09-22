import { describe, expect, it } from 'vitest'
import { countWeekdays, employeeWorkedDays } from '../../src/domain/worked-time'

describe('worked time', () => {
  it('counts weekdays for the 2026 reference year and a leap year', () => {
    expect(countWeekdays(2026)).toBe(261)
    expect(countWeekdays(2028)).toBe(260)
  })

  it.each([
    [100, 0, 0, 261],
    [80, 0, 0, 209],
    [100, 0.5, 0, 259],
    [100, 5, 6, 230],
    [50, 5, 6, 115],
    [1, 52, 366, 0],
  ])(
    'derives worked days for ratio %s, leave %s and RTT %s',
    (workRatioPercent, paidLeaveWeeks, rttDays, expected) => {
      expect(employeeWorkedDays(2026, workRatioPercent, paidLeaveWeeks, rttDays)).toBe(expected)
    },
  )
})
