import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { App } from '../../src/App'
import { SCENARIO_STORAGE_KEY } from '../../src/domain/scenario-storage'

describe('Disponible après IR', () => {
  it('bloque les entrées fiscales négatives et retrouve le calcul après correction', () => {
    render(<App />)
    fireEvent.click(screen.getByLabelText('Estimer le disponible après impôt'))
    const other = screen.getByLabelText(/Autres revenus nets imposables au barème/)
    const salary = screen.getByLabelText(/Net imposable salarial réel/)
    for (const field of [other, salary]) {
      fireEvent.change(field, { target: { value: '-1' } })
      expect(screen.queryByTestId('tax-employee-cash')).not.toBeInTheDocument()
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
      fireEvent.change(field, { target: { value: field === other ? '0' : '' } })
      expect(screen.getByTestId('tax-employee-cash')).toBeInTheDocument()
    }
  })
  it('réinitialise les hypothèses fiscales au chargement d’offre et au reset, sans les exporter', () => {
    localStorage.clear()
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    try {
      render(<App />)
      fireEvent.click(screen.getByText('Scénarios enregistrés'))
      fireEvent.change(screen.getByLabelText('Nom du scénario'), { target: { value: 'Avant IR' } })
      fireEvent.click(screen.getByRole('button', { name: 'Enregistrer le scénario' }))
      fireEvent.click(screen.getByLabelText('Estimer le disponible après impôt'))
      fireEvent.change(screen.getByLabelText('Situation du foyer fiscal'), {
        target: { value: 'couple' },
      })
      fireEvent.change(screen.getByLabelText(/Autres revenus nets imposables au barème/), {
        target: { value: '50000' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Charger Avant IR' }))
      expect(screen.getByLabelText('Estimer le disponible après impôt')).not.toBeChecked()
      fireEvent.click(screen.getByLabelText('Estimer le disponible après impôt'))
      expect(screen.getByLabelText('Situation du foyer fiscal')).toHaveValue('single')
      expect(screen.getByLabelText(/Autres revenus nets imposables au barème/)).toHaveValue(0)
      fireEvent.click(screen.getByRole('button', { name: 'Réinitialiser les entrées' }))
      expect(screen.getByLabelText('Estimer le disponible après impôt')).not.toBeChecked()
      expect(localStorage.getItem(SCENARIO_STORAGE_KEY) ?? '').not.toContain('otherIncomeEuros')
    } finally {
      confirm.mockRestore()
      localStorage.clear()
    }
  })
  it('active explicitement une comparaison distincte des résultats avant IR', () => {
    render(<App />)
    expect(
      screen.queryByRole('region', { name: 'Disponible après impôt — projection' }),
    ).not.toBeInTheDocument()
    const activation = screen.getByLabelText('Estimer le disponible après impôt')
    expect(activation).not.toBeChecked()
    expect(
      activation.compareDocumentPosition(screen.getByRole('heading', { name: 'Résultat' })) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    fireEvent.click(activation)
    const region = screen.getByRole('region', { name: 'Disponible après impôt — projection' })
    expect(within(region).getByTestId('tax-micro-cash')).toBeVisible()
    expect(within(region).getByText(/barème 2026 sur revenus 2025/)).toBeVisible()
    expect(within(region).getByText(/IR supplémentaire = impôt du foyer/)).toBeVisible()
    expect(screen.getByTestId('ei-available')).toHaveTextContent('66 559')
    fireEvent.click(screen.getByRole('button', { name: 'Mensuel' }))
    expect(within(region).getByText(/Moyenne annuelle/)).toBeVisible()
  })
})
