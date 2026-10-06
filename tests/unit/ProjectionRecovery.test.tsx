import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ProjectionView } from '../../src/components/ProjectionView'
import { MicroCycleNotice } from '../../src/components/MicroCycleNotice'
import { MoneyFlowChart } from '../../src/components/MoneyFlowChart'
import { Results } from '../../src/components/Results'
import { OfferComparison } from '../../src/components/OfferComparison'
import { IncomeTaxComparison } from '../../src/components/IncomeTaxComparison'
import { calculateComparison, combineConfidence } from '../../src/domain/calculate'
import * as employee from '../../src/domain/employee'
import { defaultScenario } from '../../src/domain/defaults'
import { rules2026 } from '../../src/domain/rules/2026'
import { assertMoneyCents } from '../../src/domain/money'
import { calculateMicroRetirement } from '../../src/domain/retirement'
import { assessMicroEligibility } from '../../src/domain/eligibility'
import { createReportOffers } from '../../src/domain/decision-report'
import { defaultTaxSettings } from '../../src/domain/tax-settings'

// Charts are incidental here; exercise the real projection domain and recovery controls.
vi.mock('../../src/components/charts/CumulativeChart', () => ({
  CumulativeChart: ({ points }: { points: unknown[] }) => (
    <div data-testid="cumulative-chart">{points.length} années</div>
  ),
}))
vi.mock('../../src/components/charts/CompositionChart', () => ({
  CompositionChart: () => <div>Composition</div>,
}))

describe('Projection overflow recovery', () => {
  it('keeps the toolbar and duration controls usable, then recovers at five years', () => {
    const scenario = structuredClone(defaultScenario)
    scenario.micro.dailyRate = assertMoneyCents(1000000)
    scenario.micro.billedDays = 200
    const result = calculateComparison(scenario, rules2026)
    const projection = { years: 30, annualGrowthRate: 100 }
    const onChange = vi.fn()
    const props = { result, scenario, catalog: rules2026, projection, onChange }
    const { rerender } = render(<ProjectionView {...props} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Projection indisponible')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Projeter la valeur dans le temps',
    )
    expect(screen.getByRole('group', { name: 'Durée' })).toBeVisible()
    for (const years of [5, 10, 20, 30]) {
      expect(screen.getByRole('button', { name: `${years} ans` })).toBeVisible()
    }
    expect(screen.queryByTestId('cumulative-chart')).not.toBeInTheDocument()
    expect(screen.queryByText('Décomposer chaque valeur')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '5 ans' }))
    expect(onChange).toHaveBeenCalledExactlyOnceWith({ years: 5, annualGrowthRate: 100 })
    rerender(<ProjectionView {...props} projection={{ ...projection, years: 5 }} />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByTestId('cumulative-chart')).toHaveTextContent('5 années')
    expect(screen.getByRole('button', { name: '5 ans' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Décomposer chaque valeur')).toBeVisible()
  })
})

describe('Independent cycle averages and confidence', () => {
  it('keeps the true rounded mean net despite a documented one-cent component variance', () => {
    const scenario = structuredClone(defaultScenario)
    scenario.micro.dailyRate = assertMoneyCents(8360002)
    scenario.micro.billedDays = 1
    const result = calculateComparison(scenario, rules2026)
    const cycle = result.microCycle!
    const trueMeanNet = (cycle.first.netIncome + cycle.second.netIncome) / 2
    expect(trueMeanNet % 1).toBe(0.5)
    expect(result.micro.netIncome).toBe(Math.round(trueMeanNet))
    const independentlyRoundedNet =
      result.micro.grossIncome! -
      result.micro.statutoryDeductions!.reduce((sum, line) => sum + line.amount, 0)
    expect(result.micro.netIncome - independentlyRoundedNet).toBe(1)
    render(<MicroCycleNotice result={result} />)
    expect(screen.getByText(/Moyennes des deux années arrondies indépendamment/)).toHaveTextContent(
      'notamment d’un centime',
    )
    expect(screen.getByText(/Moyennes des deux années arrondies indépendamment/)).toHaveTextContent(
      'ni les cotisations d’une déclaration annuelle',
    )
  })

  it.each(['established', 'estimated', 'blocked'] as const)(
    'combines %s employee confidence in both annual and cycle paths',
    (confidence) => {
      const original = employee.calculateEmployeeIncome(defaultScenario.employee, rules2026)
      const spy = vi.spyOn(employee, 'calculateEmployeeIncome').mockReturnValue({
        ...original,
        confidence,
      })
      try {
        for (const dailyRate of [40000, 50000]) {
          const scenario = structuredClone(defaultScenario)
          scenario.micro.dailyRate = assertMoneyCents(dailyRate)
          const result = calculateComparison(scenario, rules2026)
          expect(result.confidence).toBe(combineConfidence(result.micro.confidence, confidence))
          if (confidence === 'blocked') expect(result.confidence).toBe('blocked')
        }
      } finally {
        spy.mockRestore()
      }
    },
  )

  it('orders confidence blocked > estimated > established in either argument order', () => {
    const values = ['established', 'estimated', 'blocked'] as const
    for (const [i, a] of values.entries()) {
      for (const [j, b] of values.entries()) {
        expect(combineConfidence(a, b)).toBe(values[Math.max(i, j)])
      }
    }
  })

  it('discloses averages in each standalone visible context without duplicating detailed IDs', () => {
    const result = calculateComparison(defaultScenario, rules2026)
    const views = [
      <ProjectionView
        result={result}
        scenario={defaultScenario}
        catalog={rules2026}
        projection={{ years: 5, annualGrowthRate: 0 }}
        onChange={vi.fn()}
      />,
      <MoneyFlowChart result={result} period="annual" />,
      <Results result={result} period="annual" includeRetirement={false} />,
      <OfferComparison offers={createReportOffers(defaultScenario, [], [], rules2026)} />,
      <IncomeTaxComparison
        settings={{ ...defaultTaxSettings, enabled: true }}
        scenario={defaultScenario}
        comparison={result}
        eiCfeExemptionConfirmed={false}
      />,
    ]
    for (const view of views) {
      const { container, unmount } = render(view)
      expect(screen.getByText(/(arrondis|arrondies) indépendamment au centime/)).toBeVisible()
      expect(container.querySelector('#micro-cycle-title')).toBeNull()
      unmount()
    }
  })
})

describe('Public override validation', () => {
  it.each([-1, 0.5, Number.MAX_SAFE_INTEGER + 1, NaN, Infinity])(
    'rejects invalid retirement turnover %s with RangeError',
    (value) => {
      expect(() => calculateMicroRetirement(defaultScenario.micro, rules2026, value)).toThrow(
        RangeError,
      )
    },
  )
  it.each([0, -1, 366, 1.5, NaN, Infinity])('rejects invalid activity duration %s', (days) => {
    expect(() =>
      assessMicroEligibility(defaultScenario.micro, undefined, rules2026, 0, days),
    ).toThrow(RangeError)
  })
  it.each([1, 365])('accepts activity duration boundary %s', (days) => {
    expect(() =>
      assessMicroEligibility(defaultScenario.micro, undefined, rules2026, 0, days),
    ).not.toThrow()
  })
})
