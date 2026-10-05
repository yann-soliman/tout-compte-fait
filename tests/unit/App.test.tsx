import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { App } from '../../src/App'
import { navigate, openDetail, showResults } from './navigation-009-helpers'

describe('App', () => {
  it('labels annual complementary estimates and exposes CNAV/Agirc sources without a base pension', () => {
    render(<App />)
    showResults()
    openDetail('Retraite — droits 2026 (hors cash)')
    const employee = screen.getByRole('region', { name: 'Droits retraite 2026 — salariat' })
    const micro = screen.getByRole('region', { name: 'Droits retraite 2026 — micro-entreprise' })
    expect(within(employee).getByText('Agirc-Arrco')).toBeVisible()
    expect(within(micro).getByText(/RCI — libéral/)).toBeVisible()
    expect(within(employee).getByText('Points complémentaires estimés')).toBeVisible()
    expect(within(micro).getByText('Points complémentaires estimés')).toBeVisible()
    expect(within(employee).getByText(/Estimatif — modèle annuel/)).toBeVisible()
    expect(within(micro).getByText(/arrondis de caisse non reproduits/)).toBeVisible()
    expect(within(employee).getByRole('link', { name: /Circulaire Agirc-Arrco/ })).toHaveAttribute(
      'href',
      'https://www.agirc-arrco.fr/storage/CirculaireAgircArrco2025-16sg-drj.pdf',
    )
    expect(within(micro).getByRole('link', { name: /CNAV 2025-31/ })).toHaveAttribute(
      'href',
      'https://legislation.lassuranceretraite.fr/Pdf/circulaire_cnav_2025_31_22122025.pdf',
    )
    expect(within(employee).getByText('Non calculable sur la seule année 2026')).toBeVisible()
  })

  // 009 replaces the single long page with inputs, advanced rights and a guided results view.
  it('presents the numbered input sequence before the guided comparison', () => {
    render(<App />)
    const common = screen.getByRole('heading', { name: 'Situation commune' })
    const income = screen.getByRole('heading', { name: 'Revenus à comparer' })
    openDetail('Paramètres avancés')
    const retirement = screen.getByRole('heading', { name: 'Droits retraite' })
    expect(common.compareDocumentPosition(income)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(income.compareDocumentPosition(retirement)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(retirement).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Résultat' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Voir la comparaison' }))
    openDetail('Détails avant IR')
    const result = screen.getByRole('heading', { name: 'Résultat' })
    expect(retirement.compareDocumentPosition(result)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(result).toBeVisible()
  })

  it('updates a scenario value and switches to monthly figures', async () => {
    const user = userEvent.setup()
    render(<App />)
    const dailyRate = screen.getByLabelText('Taux journalier')
    await user.clear(dailyRate)
    await user.type(dailyRate, '650')
    expect(dailyRate).toHaveValue(650)
    await user.click(screen.getByRole('button', { name: 'Mensuel' }))
    showResults()
    expect(
      within(screen.getByRole('tabpanel', { name: 'Résultats' })).getAllByText('/mois').length,
    ).toBeGreaterThan(0)
  })

  it.each(['600.58', '600.29'])(
    'accepts the valid daily rate €%s without breaking the calculator',
    async (value) => {
      const user = userEvent.setup()
      render(<App />)
      const dailyRate = screen.getByLabelText('Taux journalier')
      await user.clear(dailyRate)
      await user.type(dailyRate, value)
      expect(dailyRate).toHaveValue(Number(value))
      showResults()
      expect(screen.getByRole('heading', { name: 'Résultat' })).toBeVisible()
    },
  )

  it('blocks outputs for sub-cent daily rates and recovers after valid input', () => {
    render(<App />)
    const dailyRate = screen.getByLabelText('Taux journalier')
    fireEvent.change(dailyRate, { target: { value: '600.581' } })
    expect(dailyRate).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toBeVisible()
    expect(screen.getByRole('alert')).toHaveTextContent('exprimé au centime près')
    navigate('Résultats')
    expect(screen.getByRole('alert')).toHaveTextContent('exprimé au centime près')
    expect(screen.queryByRole('heading', { name: 'Résultat' })).not.toBeInTheDocument()
    expect(
      screen.queryByRole('region', { name: 'Synthèse des trois statuts' }),
    ).not.toBeInTheDocument()
    navigate('Hypothèses')
    fireEvent.change(dailyRate, { target: { value: '600.58' } })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    showResults()
    expect(screen.getByRole('heading', { name: 'Résultat' })).toBeVisible()
  })

  it('clears a stale daily-rate error after confirming reset', async () => {
    const user = userEvent.setup()
    const confirmation = vi.spyOn(window, 'confirm').mockReturnValue(true)
    try {
      render(<App />)
      fireEvent.change(screen.getByLabelText('Taux journalier'), { target: { value: '600.581' } })
      expect(screen.getByRole('alert')).toBeVisible()
      await user.click(screen.getByRole('button', { name: 'Réinitialiser les entrées' }))
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      expect(screen.getByLabelText('Taux journalier')).toHaveValue(500)
    } finally {
      confirmation.mockRestore()
    }
  })

  it('clears a stale daily-rate error when applying a valid balance rate', async () => {
    const user = userEvent.setup()
    render(<App />)
    fireEvent.change(screen.getByLabelText('Taux journalier'), { target: { value: '600.581' } })
    expect(screen.getByRole('alert')).toBeVisible()
    navigate('Exploration')
    await user.click(screen.getByText('Taux d’équilibre'))
    await user.click(screen.getByRole('button', { name: 'Appliquer ce taux' }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Exploration' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    navigate('Hypothèses')
    expect(screen.getByLabelText('Taux journalier')).toHaveValue(266.32)
  })

  it('opens contextual information and the projection view', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Informations : Taux journalier' }))
    expect(screen.getByRole('tooltip')).toHaveTextContent('Montant facturé hors taxes')
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    navigate('Exploration')
    openDetail('Projection pluriannuelle')
    expect(
      await screen.findByRole('heading', { name: 'Projeter la valeur dans le temps' }),
    ).toBeVisible()
  })
})
