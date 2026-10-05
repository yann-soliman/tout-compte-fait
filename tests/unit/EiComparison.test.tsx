import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { App } from '../../src/App'
import { navigate, showResults, showScenarios } from './navigation-009-helpers'
import { EiComparison } from '../../src/components/EiComparison'
import { defaultScenario } from '../../src/domain/defaults'
import { calculateComparison } from '../../src/domain/calculate'
import { assertMoneyCents } from '../../src/domain/money'
import { rules2026 } from '../../src/domain/rules/2026'

describe('Comparaison EI dans le simulateur', () => {
  it('garde année pleine et assiette inchangées avec date micro et mutuelle, et expose les sources', () => {
    render(<App />)
    showResults()
    const region = screen.getByRole('region', { name: 'EI au réel — BNC 2026' })
    const before = within(region).getByText('Cotisations et contributions EI').parentElement
      ?.textContent
    navigate('Hypothèses')
    fireEvent.change(screen.getByLabelText('Début d’activité micro'), {
      target: { value: '2026-12-01' },
    })
    showResults()
    expect(within(region).getByTestId('ei-available')).toHaveTextContent('66 559')
    navigate('Hypothèses')
    fireEvent.change(screen.getByLabelText('Mutuelle'), { target: { value: '0' } })
    showResults()
    expect(within(region).getByTestId('ei-available')).toHaveTextContent('66 859')
    expect(
      within(region).getByText('Cotisations et contributions EI').parentElement?.textContent,
    ).toBe(before)
    fireEvent.click(within(region).getByText(/Sources réglementaires/))
    expect(
      within(region).getByRole('link', { name: 'Simulateur officiel EI 2026 — calcul indicatif' }),
    ).toHaveAttribute(
      'href',
      'https://mon-entreprise.urssaf.fr/simulateurs/entreprise-individuelle',
    )
    expect(
      within(region).getAllByText(/effet 2026-01-01 · vérifié le 2026-10-04/).length,
    ).toBeGreaterThan(0)
  })

  it('réinitialise la confirmation EI au chargement d’une ancienne offre et au reset', () => {
    window.localStorage.clear()
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    try {
      render(<App />)
      fireEvent.change(screen.getByLabelText('CFE'), { target: { value: '0' } })
      fireEvent.click(screen.getByLabelText('Exonération de CFE confirmée'))
      showScenarios()
      fireEvent.change(screen.getByLabelText('Nom du scénario'), {
        target: { value: 'Offre sans EI' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Enregistrer le scénario' }))
      navigate('Hypothèses')
      const exemption = screen.getByLabelText('Confirmer une exonération CFE pour l’EI')
      fireEvent.click(exemption)
      expect(exemption).toBeChecked()
      showScenarios()
      fireEvent.click(screen.getByRole('button', { name: 'Charger Offre sans EI' }))
      expect(exemption).not.toBeChecked()
      showResults()
      expect(
        within(screen.getByRole('region', { name: 'EI au réel — BNC 2026' })).getByText('Bloqué'),
      ).toBeVisible()
      navigate('Hypothèses')
      fireEvent.click(exemption)
      fireEvent.click(screen.getByRole('button', { name: 'Réinitialiser les entrées' }))
      expect(exemption).not.toBeChecked()
      expect(screen.getByLabelText('Taux journalier')).toHaveValue(500)
      showResults()
      expect(screen.getByTestId('ei-available')).toHaveTextContent('66 559')
    } finally {
      confirm.mockRestore()
      window.localStorage.clear()
    }
  })

  it('ne publie pas un écart EI salarié hors plage sûre', () => {
    const scenario = {
      ...defaultScenario,
      micro: {
        ...defaultScenario.micro,
        dailyRate: assertMoneyCents(0),
        billedDays: 0,
        professionalExpenses: assertMoneyCents(Number.MAX_SAFE_INTEGER - 300_000),
        healthInsuranceMonthly: assertMoneyCents(0),
        cfeAnnual: assertMoneyCents(0),
        cfeExemptionConfirmed: true,
      },
    }
    render(
      <EiComparison
        scenario={scenario}
        comparison={calculateComparison(scenario, rules2026)}
        cfeExemptionConfirmed
      />,
    )
    const region = screen.getByRole('region', { name: 'EI au réel — BNC 2026' })
    expect(within(region).getByTestId('ei-available')).toBeVisible()
    expect(within(region).getByText('Indisponible — écart hors plage sûre')).toBeVisible()
  })

  it('place la confirmation CFE EI avant tous les résultats', () => {
    render(<App />)
    const control = screen.getByLabelText('Confirmer une exonération CFE pour l’EI')
    expect(control).toBeVisible()
    showResults()
    const results = screen.getByRole('heading', { name: 'Résultat' })
    expect(control.compareDocumentPosition(results) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('bloque localement un déficit EI hors plage sûre sans masquer les autres statuts', () => {
    const scenario = {
      ...defaultScenario,
      micro: {
        ...defaultScenario.micro,
        dailyRate: assertMoneyCents(0),
        billedDays: 0,
        professionalExpenses: assertMoneyCents(Number.MAX_SAFE_INTEGER - 100_000),
        healthInsuranceMonthly: assertMoneyCents(0),
        cfeAnnual: assertMoneyCents(0),
        cfeExemptionConfirmed: true,
      },
    }
    const comparison = calculateComparison(scenario, rules2026)
    render(<EiComparison scenario={scenario} comparison={comparison} cfeExemptionConfirmed />)
    const region = screen.getByRole('region', { name: 'EI au réel — BNC 2026' })
    expect(within(region).getByText('Bloqué')).toBeVisible()
    expect(within(region).getByText(/résultat EI dépasse la plage sûre/)).toBeVisible()
    expect(within(region).queryByTestId('ei-available')).not.toBeInTheDocument()
    expect(Number.isSafeInteger(comparison.micro.totalValue)).toBe(true)
  })

  it('ne confond pas exonération CFE micro et EI et permet une confirmation EI distincte', () => {
    render(<App />)
    fireEvent.change(screen.getByLabelText('CFE'), { target: { value: '0' } })
    fireEvent.click(screen.getByLabelText('Exonération de CFE confirmée'))
    showResults()
    const region = screen.getByRole('region', { name: 'EI au réel — BNC 2026' })
    expect(within(region).getByText('Bloqué')).toBeVisible()
    expect(within(region).queryByTestId('ei-available')).not.toBeInTheDocument()
    navigate('Hypothèses')
    fireEvent.click(screen.getByLabelText('Confirmer une exonération CFE pour l’EI'))
    showResults()
    expect(within(region).getByText('Estimatif')).toBeVisible()
    expect(within(region).getByTestId('ei-available')).toBeVisible()
  })

  it('affiche le disponible EI après frais et distingue cash et avantages', () => {
    render(<App />)
    showResults()
    const region = screen.getByRole('region', { name: 'EI au réel — BNC 2026' })
    expect(within(region).getByTestId('ei-available')).toHaveTextContent('66 559')
    expect(within(region).getByText(/Disponible micro après frais/)).toBeVisible()
    expect(within(region).getByText(/Salaire net hors avantages/)).toBeVisible()
    expect(within(region).getByText(/Avantages salariés hors cash/)).toBeVisible()
    expect(within(region).getByText(/Année pleine 2026/)).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Mensuel' }))
    expect(within(region).getByTestId('ei-available')).toHaveTextContent('5 547')
  })
})
