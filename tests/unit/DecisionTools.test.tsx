import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../../src/App'
import * as scenarioLibrary from '../../src/domain/scenario-library'
import { calculateBalance } from '../../src/domain/balance'
import { defaultScenario } from '../../src/domain/defaults'
import { assertMoneyCents } from '../../src/domain/money'
import { rules2026 } from '../../src/domain/rules/2026'

const confirmMock = vi.fn(() => true)

beforeEach(() => {
  window.localStorage.clear()
  confirmMock.mockReset()
  confirmMock.mockReturnValue(true)
  vi.stubGlobal('confirm', confirmMock)
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('decision tools', () => {
  it('keeps inputs before results and exposes collapsed native tool panels', () => {
    render(<App />)
    const result = screen.getByRole('heading', { name: 'Résultat' })
    const balance = screen.getByText('Taux d’équilibre')
    const stress = screen.getByText('Sensibilité et aléas')
    const saved = screen.getByText('Scénarios enregistrés')
    expect(balance.compareDocumentPosition(result)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(stress.compareDocumentPosition(result)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(saved.compareDocumentPosition(result)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(balance.closest('details')).not.toHaveAttribute('open')
    expect(stress.closest('details')).not.toHaveAttribute('open')
    expect(saved.closest('details')).not.toHaveAttribute('open')
  })

  it('recalculates both targets automatically and applies only a reachable cent-precise rate', async () => {
    const user = userEvent.setup()
    render(<App />)
    const salary = screen.getByRole('spinbutton', { name: 'Salaire brut' })
    await user.clear(salary)
    await user.type(salary, '58000.01')
    await user.click(screen.getByText('Taux d’équilibre'))
    const balance = screen.getByRole('group', { name: 'Taux d’équilibre' })
    expect(within(balance).getByText(/calculés automatiquement/i)).toBeVisible()
    expect(
      within(balance).queryByRole('button', { name: 'Calculer les taux d’équilibre' }),
    ).not.toBeInTheDocument()
    expect(balance.querySelector('.balance-grid')).toHaveAttribute('aria-live', 'polite')
    expect(within(balance).getByText(/pratique basse/i)).toBeVisible()
    expect(within(balance).getByText(/pratique centrale/i)).toBeVisible()
    expect(within(balance).getByText(/pratique haute/i)).toBeVisible()
    expect(within(balance).getByText(/N-1 et N-2/i)).toBeVisible()
    expect(within(balance).getAllByText(/€/).length).toBeGreaterThan(0)
    const rate = screen.getByRole('spinbutton', { name: 'Taux journalier' })
    const days = screen.getByRole('spinbutton', { name: 'Jours facturés' })
    const expected = calculateBalance(
      {
        ...defaultScenario,
        employee: {
          ...defaultScenario.employee,
          grossAnnualSalary: assertMoneyCents(5_800_001),
        },
      },
      'netIncome',
      160,
      rules2026,
    )
    expect(expected.dailyRateCents).toBeDefined()
    expect(expected.dailyRateCents! % 100).not.toBe(0)
    const dailyRateDisplay = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(expected.dailyRateCents! / 100)
    const balanceCard = within(balance).getAllByRole('article')[0]
    expect(balanceCard?.querySelector('strong')?.textContent?.replaceAll('\u00a0', ' ')).toBe(
      `${dailyRateDisplay.replaceAll('\u00a0', ' ')}/j`,
    )
    await user.click(within(balance).getByRole('button', { name: 'Appliquer ce taux' }))
    expect(rate).toHaveValue(expected.dailyRateCents! / 100)
    expect(days).toHaveValue(160)
  })

  it('rejects sub-cent additional expenses visibly and accepts cent-precise amounts', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('Sensibilité et aléas'))
    const extraExpenses = screen.getByRole('spinbutton', {
      name: 'Frais annuels supplémentaires',
    })
    await user.clear(extraExpenses)
    await user.type(extraExpenses, '0.001')
    expect(screen.getByRole('alert')).toHaveTextContent(/centime/i)
    await user.clear(extraExpenses)
    await user.type(extraExpenses, '1.15')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('exposes stress confidence, engine warnings, and eligibility-history limits', async () => {
    const user = userEvent.setup()
    render(<App />)
    const cfe = screen.getByRole('spinbutton', { name: 'CFE' })
    await user.clear(cfe)
    await user.type(cfe, '0')
    await user.click(screen.getByText('Sensibilité et aléas'))
    const panel = screen.getByRole('group', { name: 'Sensibilité et aléas' })
    expect(within(panel).getByText(/estimative/i)).toBeVisible()
    expect(within(panel).getAllByText(/CFE/i).length).toBeGreaterThan(0)
    expect(within(panel).getAllByText(/plafond/i).length).toBeGreaterThan(0)
  })

  it('displays the cent-precise stressed daily rate produced by the integer calculation', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('Sensibilité et aléas'))
    const decrease = screen.getByRole('spinbutton', { name: '% de baisse du taux' })
    await user.clear(decrease)
    await user.type(decrease, '0.29')
    const panel = screen.getByRole('group', { name: 'Sensibilité et aléas' })
    const liveResult = panel.querySelector('[aria-live="polite"]')
    expect(liveResult?.textContent?.replaceAll('\u00a0', ' ')).toContain('598,26 €/j')
  })

  it('computes stress presets and updates custom fields without monthly scaling', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('Sensibilité et aléas'))
    const panel = screen.getByRole('group', { name: 'Sensibilité et aléas' })
    await user.click(within(panel).getByRole('button', { name: /Prudent|stress/i }))
    expect(within(panel).getByText(/jours perdus/i)).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Mensuel' }))
    expect(within(panel).getByText(/valeurs annuelles/i)).toBeVisible()
    expect(within(panel).getByText(/aucune garantie/i)).toBeVisible()
  })

  it('saves, loads explicitly, compares, deletes and exports named scenarios', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('Scénarios enregistrés'))
    const panel = screen.getByRole('group', { name: 'Scénarios enregistrés' })
    await user.type(within(panel).getByRole('textbox', { name: 'Nom du scénario' }), ' Offre A ')
    await user.click(within(panel).getByRole('button', { name: 'Enregistrer le scénario' }))
    expect(within(panel).getByText('Offre A')).toBeVisible()

    const input = screen.getByRole('spinbutton', { name: 'Taux journalier' })
    await user.clear(input)
    await user.type(input, '700')
    const current = input.getAttribute('value')
    await user.click(within(panel).getByRole('button', { name: /Charger Offre A/ }))
    expect(input.getAttribute('value')).not.toBe(current)
    await user.click(within(panel).getByRole('checkbox', { name: /Comparer Offre A/ }))
    expect(within(panel).getByRole('table')).toBeVisible()
    expect(
      within(panel)
        .getAllByRole('columnheader')
        .some((header) => /retraite/i.test(header.textContent ?? '')),
    ).toBe(false)
    expect(within(panel).getByRole('button', { name: /Exporter JSON/i })).toBeEnabled()
    expect(within(panel).getByRole('button', { name: /Exporter CSV/i })).toBeEnabled()
    await user.click(within(panel).getByRole('button', { name: /Supprimer Offre A/ }))
    expect(within(panel).queryByText('Offre A')).not.toBeInTheDocument()
  })

  it('renders untrusted scenario names as text, not HTML', async () => {
    const user = userEvent.setup()
    const unsafeName = '<img src=x onerror=alert(1)>'
    render(<App />)
    await user.click(screen.getByText('Scénarios enregistrés'))
    const panel = screen.getByRole('group', { name: 'Scénarios enregistrés' })
    await user.type(within(panel).getByRole('textbox', { name: 'Nom du scénario' }), unsafeName)
    await user.click(within(panel).getByRole('button', { name: 'Enregistrer le scénario' }))
    expect(within(panel).getByText(unsafeName, { exact: true })).toBeVisible()
    expect(within(panel).queryByRole('img')).not.toBeInTheDocument()
  })

  it('rejects invalid imports without changing the collection and confirms destructive actions', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('Scénarios enregistrés'))
    const panel = screen.getByRole('group', { name: 'Scénarios enregistrés' })
    await user.type(
      within(panel).getByRole('textbox', { name: 'Nom du scénario' }),
      'Collection existante',
    )
    await user.click(within(panel).getByRole('button', { name: 'Enregistrer le scénario' }))
    const file = new File(['{"schemaVersion":99,"scenarios":[]}'], 'invalid.json', {
      type: 'application/json',
    })
    await user.upload(within(panel).getByLabelText('Importer une collection JSON'), file)
    expect(within(panel).getByRole('alert')).toHaveTextContent(/version|invalide/i)
    expect(within(panel).getByText('Collection existante')).toBeVisible()
    await user.click(within(panel).getByRole('button', { name: /Effacer la collection/i }))
    expect(confirmMock).toHaveBeenCalledOnce()
    expect(within(panel).queryByText('Collection existante')).not.toBeInTheDocument()
  })

  it('reports a quota error and does not add a failed save to the in-memory list', async () => {
    const user = userEvent.setup()
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage full', 'QuotaExceededError')
    })
    render(<App />)
    await user.click(screen.getByText('Scénarios enregistrés'))
    const panel = screen.getByRole('group', { name: 'Scénarios enregistrés' })
    await user.type(within(panel).getByRole('textbox', { name: 'Nom du scénario' }), 'Quota')
    await user.click(within(panel).getByRole('button', { name: 'Enregistrer le scénario' }))
    expect(within(panel).getByRole('alert')).toHaveTextContent(/quota|full/i)
    expect(within(panel).queryByText('Quota', { exact: true })).not.toBeInTheDocument()
  })

  it('surfaces comparison failures and does not export an empty comparison', async () => {
    const user = userEvent.setup()
    vi.spyOn(scenarioLibrary, 'comparisonRow').mockImplementation(() => {
      throw new RangeError('Catalogue non pris en charge.')
    })
    const createObjectURL = vi.fn(() => 'blob:test')
    vi.stubGlobal('URL', { createObjectURL })
    render(<App />)
    await user.click(screen.getByText('Scénarios enregistrés'))
    const panel = screen.getByRole('group', { name: 'Scénarios enregistrés' })
    expect(within(panel).getByRole('alert')).toHaveTextContent(/catalogue non pris en charge/i)
    await user.click(within(panel).getByRole('button', { name: 'Exporter CSV' }))
    expect(createObjectURL).not.toHaveBeenCalled()
  })

  it('confirms form reset and preserves saved snapshots; cancellation changes nothing', async () => {
    const user = userEvent.setup()
    render(<App />)
    const rate = screen.getByRole('spinbutton', { name: 'Taux journalier' })
    await user.clear(rate)
    await user.type(rate, '700')
    await user.click(screen.getByText('Scénarios enregistrés'))
    const panel = screen.getByRole('group', { name: 'Scénarios enregistrés' })
    await user.type(within(panel).getByRole('textbox', { name: 'Nom du scénario' }), 'Conservé')
    await user.click(within(panel).getByRole('button', { name: 'Enregistrer le scénario' }))
    expect(window.localStorage.length).toBe(1)
    confirmMock.mockReturnValueOnce(false)
    await user.click(screen.getByRole('button', { name: 'Réinitialiser les entrées' }))
    expect(rate).toHaveValue(700)
    confirmMock.mockReturnValueOnce(true)
    await user.click(screen.getByRole('button', { name: 'Réinitialiser les entrées' }))
    expect(rate).toHaveValue(600)
    expect(window.localStorage.length).toBe(1)
  })
})
