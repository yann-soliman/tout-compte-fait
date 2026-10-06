import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { App } from '../../src/App'
import { navigate, showScenarios } from './navigation-009-helpers'
import { defaultScenario } from '../../src/domain/defaults'
import { rules2026 } from '../../src/domain/rules/2026'
import { calculateRobustness } from '../../src/domain/robustness'
import { Robustness } from '../../src/components/Robustness'
import { OfferComparison } from '../../src/components/OfferComparison'
import { DecisionReport } from '../../src/components/DecisionReport'
import { createReportOffers } from '../../src/domain/decision-report'

it('uses the current selection for chart and report, returning focus on close', () => {
  render(<App />)
  showScenarios()
  fireEvent.change(screen.getByLabelText('Nom du scénario'), {
    target: { value: 'Offre conservée' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Enregistrer le scénario' }))
  fireEvent.click(screen.getByLabelText('Comparer Offre conservée'))
  expect(screen.getByRole('heading', { name: 'Comparer les offres' })).toBeVisible()
  const button = screen.getByRole('button', { name: 'Prévisualiser le rapport' })
  button.focus()
  fireEvent.click(button)
  expect(screen.getByRole('dialog', { name: 'Rapport de comparaison' })).toBeVisible()
  expect(document.querySelectorAll('[data-report-offer]')).toHaveLength(2)
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(button).toHaveFocus()
})

it('previews annual assumptions and dated sources, printing only explicitly', () => {
  const print = vi.spyOn(window, 'print').mockImplementation(() => {})
  const close = vi.fn()
  const offers = createReportOffers(
    { ...defaultScenario, displayPeriod: 'monthly' },
    [],
    [],
    rules2026,
  )
  render(<DecisionReport offers={offers} onClose={close} />)
  expect(screen.getByRole('dialog', { name: 'Rapport de comparaison' })).toBeVisible()
  expect(screen.getByText(/TJM : 500,00/)).toBeVisible()
  expect(screen.getByText(/Salaire brut : 50.*000,00/)).toBeVisible()
  expect(screen.getByText(/Jours facturés : 200/)).toBeVisible()
  expect(screen.getByText(/Date d’effet/)).toBeVisible()
  expect(print).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Imprimer / Enregistrer en PDF' }))
  expect(print).toHaveBeenCalledOnce()
  fireEvent.click(screen.getByRole('button', { name: 'Fermer le rapport' }))
  expect(close).toHaveBeenCalledOnce()
  print.mockRestore()
})

it('compares both statuses on a signed common scale with annual text and metric selection', () => {
  const deficit = structuredClone(defaultScenario)
  deficit.micro.billedDays = 0
  const offers = createReportOffers(
    defaultScenario,
    [{ id: 'a', name: 'Déficit', savedAt: '2026-10-04T00:00:00Z', scenario: deficit }],
    ['a'],
    rules2026,
  )
  const { container } = render(<OfferComparison offers={offers} />)
  expect(screen.getByRole('heading', { name: 'Comparer les offres' })).toBeVisible()
  expect(container.querySelectorAll('.offer-chart-row')).toHaveLength(4)
  expect(screen.getByText('Déficit')).toBeVisible()
  expect(screen.queryAllByText(/100.*000/)).toHaveLength(0)
  expect(container.querySelector('[data-offer-id="saved:a"] .offer-zero')).toBeInTheDocument()
  fireEvent.change(screen.getByLabelText('Indicateur des offres'), {
    target: { value: 'netIncome' },
  })
  expect(screen.getAllByText(/68.*115,60/, { selector: 'dd' })).toHaveLength(1)
})

it('integrates robustness in Exploration and updates unavailable CFE immediately', () => {
  render(<App />)
  navigate('Exploration')
  expect(screen.getByRole('heading', { name: 'Marge avant bascule' })).toBeVisible()
  navigate('Hypothèses')
  fireEvent.change(screen.getByLabelText('CFE'), { target: { value: '0' } })
  navigate('Exploration')
  expect(
    screen.getAllByText('Indisponible').filter((element) => element.closest('#panel-exploration')),
  ).toHaveLength(3)
})

it('shows labelled independent margins and theoretical ceiling caveat as text', () => {
  render(
    <Robustness
      scenario={defaultScenario}
      data={calculateRobustness(defaultScenario, rules2026)}
    />,
  )
  expect(screen.getByRole('heading', { name: 'Marge avant bascule' })).toBeVisible()
  expect(screen.getByText('Jours perdables')).toBeVisible()
  expect(screen.getByText('Baisse de TJM possible')).toBeVisible()
  expect(screen.getByText('Frais supplémentaires absorbables')).toBeVisible()
  expect(screen.getByText(/Scénario courant hors plafond/)).toBeVisible()
  expect(screen.getByText(/Un seul facteur à la fois/)).toBeVisible()
})
