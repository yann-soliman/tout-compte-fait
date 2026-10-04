import { describe, expect, it } from 'vitest'
import { calculateComparison } from '../../src/domain/calculate'
import { defaultScenario } from '../../src/domain/defaults'
import { rules2026 } from '../../src/domain/rules/2026'
import { assertMoneyCents } from '../../src/domain/money'
import { moneyFlows, evaluateOpportunity, opportunityGrid } from '../../src/domain/result-visuals'

describe('opportunity grid', () => {
  it('is bounded, covers the current point and every cell reuses exact math', () => {
    const grid = opportunityGrid(defaultScenario, rules2026)
    expect(grid.days.length).toBeLessThanOrEqual(13)
    expect(grid.rates.length).toBeLessThanOrEqual(13)
    expect(grid.days[0]).toBe(0)
    expect(grid.rates[0]).toBe(0)
    expect(grid.days.at(-1)).toBeGreaterThanOrEqual(defaultScenario.micro.billedDays)
    expect(grid.rates.at(-1)).toBeGreaterThanOrEqual(defaultScenario.micro.dailyRate)
    expect(grid.cells.length).toBe(grid.days.length * grid.rates.length)
    for (const cell of grid.cells) {
      expect(cell).toEqual(
        evaluateOpportunity(defaultScenario, rules2026, cell.dailyRate, cell.billedDays),
      )
    }
    for (const point of grid.balance) {
      const value = evaluateOpportunity(
        defaultScenario,
        rules2026,
        point.dailyRate,
        point.billedDays,
      )
      expect(value.difference).toBeGreaterThanOrEqual(0)
      if (point.dailyRate > 0)
        expect(
          evaluateOpportunity(defaultScenario, rules2026, point.dailyRate - 1, point.billedDays)
            .difference,
        ).toBeLessThan(0)
    }
    expect(grid.balance.length).toBeGreaterThan(0)
  })
  it('adapts to unusual valid input and is period and retirement independent', () => {
    const scenario = structuredClone(defaultScenario)
    scenario.micro.billedDays = 366
    scenario.micro.dailyRate = assertMoneyCents(250_000)
    const grid = opportunityGrid(scenario, rules2026)
    expect(grid.days.at(-1)).toBe(366)
    expect(grid.rates.at(-1)).toBeGreaterThanOrEqual(250_000)
    scenario.displayPeriod = 'monthly'
    scenario.retirement.includeRights = false
    expect(opportunityGrid(scenario, rules2026)).toEqual(grid)
  })
  it('omits a falsely precise equilibrium when CFE is unknown', () => {
    const scenario = structuredClone(defaultScenario)
    scenario.micro.cfeAnnual = undefined
    expect(opportunityGrid(scenario, rules2026).balance).toEqual([])
  })
})

describe('opportunity hypothesis', () => {
  it('computes an exact economic difference without retirement and does not mutate inputs', () => {
    const before = JSON.stringify(defaultScenario)
    const selected = evaluateOpportunity(defaultScenario, rules2026, 38_693, 160)
    const exact = calculateComparison(
      {
        ...defaultScenario,
        retirement: { ...defaultScenario.retirement, includeRights: false },
        micro: { ...defaultScenario.micro, dailyRate: assertMoneyCents(38_693) },
      },
      rules2026,
    )
    expect(selected.difference).toBe(exact.micro.totalValue - exact.employee.totalValue)
    expect(selected.turnover).toBe(exact.micro.grossIncome)
    expect(selected.canApply).toBe(true)
    expect(selected.warnings.some((warning) => warning.code === 'eligibility-not-confirmed')).toBe(
      true,
    )
    expect(JSON.stringify(defaultScenario)).toBe(before)
  })
  it.each([
    [100_000, 200],
    [0, 0],
  ])('does not apply outside-ceiling or zero-day points (%i, %i)', (rate, days) => {
    expect(evaluateOpportunity(defaultScenario, rules2026, rate, days).canApply).toBe(false)
  })
  it('uses the prorated ceiling and blocks unknown CFE without implying zero cost is confirmed', () => {
    const scenario = structuredClone(defaultScenario)
    scenario.activityStartDate = '2026-12-31'
    expect(evaluateOpportunity(scenario, rules2026, 60_000, 1).underCeiling).toBe(false)
    scenario.activityStartDate = undefined
    scenario.micro.cfeAnnual = undefined
    expect(evaluateOpportunity(scenario, rules2026, 38_693, 160).canApply).toBe(false)
    scenario.micro.cfeExemptionConfirmed = true
    expect(evaluateOpportunity(scenario, rules2026, 38_693, 160).canApply).toBe(true)
  })
  it('rejects invalid precision and bounds instead of returning fake zero', () => {
    for (const [rate, days] of [
      [1.2, 10],
      [-1, 10],
      [50_000, 1.5],
      [50_000, 367],
    ]) {
      expect(() => evaluateOpportunity(defaultScenario, rules2026, rate!, days!)).toThrow()
    }
  })
})

describe('money waterfalls', () => {
  it('includes a deficit deeper than the gross and large employee benefits', () => {
    const scenario = structuredClone(defaultScenario)
    scenario.micro.billedDays = 0
    scenario.micro.professionalExpenses = assertMoneyCents(20_000_000)
    scenario.employee.annualBenefits = assertMoneyCents(50_000_000)
    const result = calculateComparison(scenario, rules2026)
    const flows = moneyFlows(result)
    expect(flows.min).toBe(result.micro.totalValue)
    expect(flows.max).toBe(result.employee.totalValue)
    expect(flows.items[0]!.steps[4].end).toBeLessThan(0)
  })
  it('keeps an all-zero chart usable without inventing income', () => {
    const result = calculateComparison(defaultScenario, rules2026)
    for (const status of [result.micro, result.employee]) {
      status.grossIncome = assertMoneyCents(0)
      status.netIncome = 0
      status.totalValue = 0
    }
    const flows = moneyFlows(result)
    expect(flows.min).toBe(0)
    expect(flows.max).toBe(100)
    expect(flows.items.flatMap((flow) => flow.steps).every((step) => step.amount === 0)).toBe(true)
  })
  it('fails closed for missing, unsafe or negative gross values', () => {
    const result = calculateComparison(defaultScenario, rules2026)
    for (const gross of [undefined, Number.MAX_SAFE_INTEGER + 1, -1]) {
      result.micro.grossIncome = gross as typeof result.micro.grossIncome
      expect(() => moneyFlows(result)).toThrow(RangeError)
    }
  })
  it('reconciles the engine and uses the same non-normalized domain', () => {
    const result = calculateComparison(defaultScenario, rules2026)
    const flows = moneyFlows(result)
    for (const flow of flows.items) {
      const status = result[flow.kind]
      expect(flow.steps[0].end).toBe(status.grossIncome)
      expect(flow.steps[2].end).toBe(status.netIncome)
      expect(flow.steps[4].end).toBe(status.totalValue)
      expect(flow.steps[1].amount).toBe(-(status.grossIncome! - status.netIncome))
      expect(flow.steps[3].amount).toBe(status.totalValue - status.netIncome)
      for (const step of flow.steps) {
        expect(step.amount).toBe(step.end - step.start)
        expect(step.start).toBeGreaterThanOrEqual(flows.min)
        expect(step.end).toBeLessThanOrEqual(flows.max)
      }
    }
    expect(flows.min).toBe(0)
    expect(flows.max).toBe(result.micro.grossIncome)
  })
})
