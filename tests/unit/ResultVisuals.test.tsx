import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { App } from '../../src/App'
import { navigate, showResults } from './navigation-009-helpers'
import { OpportunityMap } from '../../src/components/OpportunityMap'
import { MoneyFlowChart } from '../../src/components/MoneyFlowChart'
import { calculateComparison } from '../../src/domain/calculate'
import { defaultScenario } from '../../src/domain/defaults'
import { rules2026 } from '../../src/domain/rules/2026'

describe('integrated visuals', () => {
  // 009 moves exploratory visuals out of results; applying a pair must not change the tab.
  it('separates exploratory visuals from numeric cards, applying the paired selection', () => {
    render(<App />)
    const income = screen.getByRole('heading', { name: 'Revenus à comparer' })
    expect(income).toBeVisible()
    navigate('Exploration')
    const visual = screen.getByRole('heading', { name: 'Du brut à la valeur économique' })
    expect(income.compareDocumentPosition(visual)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(visual).toBeVisible()
    expect(document.querySelector('.result-card')).not.toBeVisible()
    fireEvent.change(screen.getByLabelText('Jours à explorer'), { target: { value: '100' } })
    fireEvent.change(screen.getByLabelText('TJM à explorer'), { target: { value: '350.58' } })
    fireEvent.click(screen.getByRole('button', { name: 'Appliquer cette hypothèse' }))
    expect(screen.getByRole('tab', { name: 'Exploration' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    navigate('Hypothèses')
    expect(screen.getByLabelText('Taux journalier')).toHaveValue(350.58)
    expect(screen.getByLabelText('Jours facturés')).toHaveValue(100)
    showResults()
    expect(document.querySelector('.result-card')).toBeVisible()
  })
})

describe('interactive map', () => {
  it('labels a hypothesis beyond the plotted range instead of silently clipping its marker', () => {
    render(<OpportunityMap scenario={defaultScenario} catalog={rules2026} onApply={vi.fn()} />)
    fireEvent.change(screen.getByLabelText('Jours à explorer'), { target: { value: '1' } })
    fireEvent.change(screen.getByLabelText('TJM à explorer'), { target: { value: '1500' } })
    expect(screen.getByText(/Hypothèse hors cadre/)).toBeVisible()
    expect(document.querySelector('.map-selected-point')).toBeNull()
    expect(screen.getByRole('button', { name: 'Appliquer cette hypothèse' })).toBeEnabled()
  })
  it('shows an annual exact selection and applies both inputs only on explicit request', () => {
    const onApply = vi.fn()
    render(<OpportunityMap scenario={defaultScenario} catalog={rules2026} onApply={onApply} />)
    expect(screen.getByRole('img', { name: /Carte des écarts annuels/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Appliquer cette hypothèse' })).toBeDisabled()
    fireEvent.change(screen.getByLabelText('Jours à explorer'), { target: { value: '100' } })
    fireEvent.change(screen.getByLabelText('TJM à explorer'), { target: { value: '350.29' } })
    expect(onApply).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Appliquer cette hypothèse' }))
    expect(onApply).toHaveBeenCalledExactlyOnceWith({ dailyRate: 35_029, billedDays: 100 })
    expect(screen.getByText(/Éligibilité non confirmée/)).toBeVisible()
  })
  it('blocks invalid precision, missing CFE, zero days and above-ceiling selections', () => {
    const scenario = structuredClone(defaultScenario)
    scenario.micro.cfeAnnual = undefined
    const onApply = vi.fn()
    const { rerender } = render(
      <OpportunityMap scenario={scenario} catalog={rules2026} onApply={onApply} />,
    )
    expect(screen.getByText(/CFE inconnue/)).toBeVisible()
    expect(screen.getByRole('button', { name: 'Appliquer cette hypothèse' })).toBeDisabled()
    rerender(<OpportunityMap scenario={defaultScenario} catalog={rules2026} onApply={onApply} />)
    fireEvent.change(screen.getByLabelText('Jours à explorer'), { target: { value: '100' } })
    fireEvent.change(screen.getByLabelText('TJM à explorer'), { target: { value: '300.001' } })
    expect(screen.getByRole('alert')).toHaveTextContent('centime près')
    expect(screen.getByRole('button', { name: 'Appliquer cette hypothèse' })).toBeDisabled()
    fireEvent.change(screen.getByLabelText('TJM à explorer'), { target: { value: '300.58' } })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Appliquer cette hypothèse' })).toBeEnabled()
    fireEvent.change(screen.getByLabelText('Jours à explorer'), { target: { value: '0' } })
    expect(screen.getByRole('button', { name: 'Appliquer cette hypothèse' })).toBeDisabled()
    expect(onApply).not.toHaveBeenCalled()
  })
})

describe('visual results', () => {
  it('provides text amounts and a common scale without relying on SVG colors', () => {
    render(
      <MoneyFlowChart result={calculateComparison(defaultScenario, rules2026)} period="annual" />,
    )
    expect(screen.getByRole('heading', { name: 'Du brut à la valeur économique' })).toBeVisible()
    expect(screen.getAllByText('Valeur économique')).toHaveLength(2)
    expect(screen.getByText(/Même échelle/)).toBeVisible()
    expect(screen.getByText(/avant impôt/)).toBeVisible()
    expect(screen.getByText(/100.*000,00/, { selector: 'dd' })).toBeVisible()
    expect(screen.getByText('Frais économiques')).toBeVisible()
    expect(screen.getByText('Avantages')).toBeVisible()
  })
  it('labels monthly amounts without changing the annual geometry', () => {
    const result = calculateComparison(defaultScenario, rules2026)
    const { container, rerender } = render(<MoneyFlowChart result={result} period="annual" />)
    const widths = Array.from(container.querySelectorAll('.flow-bar'), (bar) =>
      bar.getAttribute('style'),
    )
    rerender(<MoneyFlowChart result={result} period="monthly" />)
    expect(screen.getByText(/8.*333,33/, { selector: 'dd' })).toBeVisible()
    expect(screen.getByText('Montants mensuels')).toBeVisible()
    expect(
      Array.from(container.querySelectorAll('.flow-bar'), (bar) => bar.getAttribute('style')),
    ).toEqual(widths)
  })
  it('announces negative value and missing calculation instead of clipping losses', () => {
    const result = calculateComparison(defaultScenario, rules2026)
    result.micro.totalValue = -10_000
    const { rerender } = render(<MoneyFlowChart result={result} period="annual" />)
    expect(screen.getByText(/Déficit économique/)).toBeVisible()
    result.micro.grossIncome = undefined
    rerender(<MoneyFlowChart result={result} period="annual" />)
    expect(screen.getByText(/Graphique indisponible/)).toBeVisible()
  })
})
