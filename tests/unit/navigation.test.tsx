import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { App } from '../../src/App'

describe('Navigation guidée puis libre', () => {
  it('explicite les taux de remplacement indépendants du dernier TJM valide et ne récupère qu’après application', () => {
    let previousCandidates: string[] | undefined
    for (const lastValidRate of ['450', '650']) {
      const { unmount } = render(<App />)
      const dailyRate = screen.getByRole('spinbutton', { name: 'Taux journalier' })
      fireEvent.change(dailyRate, { target: { value: lastValidRate } })
      fireEvent.change(dailyRate, { target: { value: '0.001' } })
      fireEvent.click(screen.getByRole('button', { name: 'Voir la comparaison' }))
      expect(
        screen.queryByRole('region', { name: 'Synthèse des trois statuts' }),
      ).not.toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveTextContent(/centime/)

      fireEvent.click(screen.getByRole('tab', { name: 'Exploration' }))
      fireEvent.click(screen.getByText('Taux d’équilibre'))
      const balance = screen.getByRole('group', { name: 'Taux d’équilibre' })
      const status = within(balance).getByRole('status')
      expect(status).toBeVisible()
      expect(status).toHaveTextContent('La saisie courante est invalide.')
      expect(status).toHaveTextContent(
        'Les taux d’équilibre sont des hypothèses de remplacement indépendantes du TJM courant.',
      )
      expect(status).toHaveTextContent(
        'Seule une application explicite remplace et corrige la saisie rejetée.',
      )
      expect(within(balance).queryByRole('alert')).not.toBeInTheDocument()
      const candidates = Array.from(
        balance.querySelectorAll('.balance-card strong'),
        (element) => element.textContent ?? '',
      )
      expect(candidates).toHaveLength(3)
      if (previousCandidates) expect(candidates).toEqual(previousCandidates)
      previousCandidates = candidates

      fireEvent.click(screen.getByRole('tab', { name: 'Hypothèses' }))
      expect(screen.getByRole('spinbutton', { name: 'Taux journalier' })).toHaveAttribute(
        'aria-invalid',
        'true',
      )
      fireEvent.click(screen.getByRole('button', { name: 'Voir la comparaison' }))
      expect(
        screen.queryByRole('region', { name: 'Synthèse des trois statuts' }),
      ).not.toBeInTheDocument()
      fireEvent.click(screen.getByRole('tab', { name: 'Exploration' }))
      fireEvent.click(within(balance).getByRole('button', { name: 'Appliquer ce taux' }))
      expect(within(balance).queryByRole('status')).not.toBeInTheDocument()
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      fireEvent.click(screen.getByRole('tab', { name: 'Hypothèses' }))
      expect(screen.getByRole('spinbutton', { name: 'Taux journalier' })).toHaveValue(266.32)
      expect(screen.getByRole('spinbutton', { name: 'Taux journalier' })).not.toHaveAttribute(
        'aria-invalid',
        'true',
      )
      fireEvent.click(screen.getByRole('button', { name: 'Voir la comparaison' }))
      expect(screen.getByRole('region', { name: 'Synthèse des trois statuts' })).toBeVisible()
      unmount()
    }
  })

  it('conserve fiscalité et confirmation EI lors d’une application explicite du taux d’équilibre', () => {
    render(<App />)
    fireEvent.click(screen.getByLabelText('Confirmer une exonération CFE pour l’EI'))
    fireEvent.click(screen.getByLabelText('Estimer le disponible après impôt'))
    fireEvent.change(screen.getByLabelText('Situation du foyer fiscal'), {
      target: { value: 'couple' },
    })
    fireEvent.click(screen.getByRole('tab', { name: 'Exploration' }))
    fireEvent.click(screen.getByText('Taux d’équilibre'))
    fireEvent.click(screen.getByRole('button', { name: 'Appliquer ce taux' }))
    fireEvent.click(screen.getByRole('tab', { name: 'Hypothèses' }))
    expect(screen.getByLabelText('Confirmer une exonération CFE pour l’EI')).toBeChecked()
    expect(screen.getByLabelText('Estimer le disponible après impôt')).toBeChecked()
    expect(screen.getByLabelText('Situation du foyer fiscal')).toHaveValue('couple')
  })

  it('bloque sauvegarde, comparaison et rapport du dernier TJM valide si la saisie courante est invalide', () => {
    render(<App />)
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Taux journalier' }), {
      target: { value: '0.001' },
    })
    fireEvent.click(screen.getByRole('tab', { name: 'Scénarios' }))
    expect(screen.getByRole('button', { name: 'Prévisualiser le rapport' })).toBeDisabled()
    fireEvent.click(screen.getByText('Scénarios enregistrés'))
    fireEvent.change(screen.getByLabelText('Nom du scénario'), {
      target: { value: 'TJM invalide' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer le scénario' }))
    expect(screen.queryByRole('button', { name: 'Charger TJM invalide' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('alert').some((e) => /centime/.test(e.textContent ?? ''))).toBe(true)
    fireEvent.click(screen.getByRole('tab', { name: 'Hypothèses' }))
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Taux journalier' }), {
      target: { value: '450' },
    })
    fireEvent.click(screen.getByRole('tab', { name: 'Scénarios' }))
    expect(screen.getByRole('button', { name: 'Prévisualiser le rapport' })).toBeEnabled()
  })

  it('ne substitue pas le dernier scénario valide à une saisie TJM sous-centime', () => {
    render(<App />)
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Taux journalier' }), {
      target: { value: '0.001' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Voir la comparaison' }))
    expect(
      screen.queryByRole('region', { name: 'Synthèse des trois statuts' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent(/centime/)
    fireEvent.click(screen.getByRole('button', { name: 'Modifier les hypothèses' }))
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Taux journalier' }), {
      target: { value: '450' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Voir la comparaison' }))
    expect(screen.getByRole('region', { name: 'Synthèse des trois statuts' })).toBeVisible()
  })

  it('gère flèches/Home/End et place le focus au titre après le parcours guidé', () => {
    render(<App />)
    const first = screen.getByRole('tab', { name: 'Hypothèses' })
    first.focus()
    fireEvent.keyDown(first, { key: 'ArrowRight' })
    expect(screen.getByRole('tab', { name: 'Résultats' })).toHaveFocus()
    expect(screen.getByRole('tab', { name: 'Résultats' })).toHaveAttribute('aria-selected', 'true')
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Résultats' }), { key: 'End' })
    expect(screen.getByRole('tab', { name: 'Scénarios' })).toHaveFocus()
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Scénarios' }), { key: 'Home' })
    expect(first).toHaveFocus()
    fireEvent.click(screen.getByRole('button', { name: 'Voir la comparaison' }))
    expect(screen.getByRole('heading', { name: 'Comparer les trois statuts' })).toHaveFocus()
    fireEvent.click(screen.getByRole('button', { name: 'Modifier les hypothèses' }))
    expect(screen.getByRole('heading', { name: 'Renseigner. Comparer. Projeter.' })).toHaveFocus()
  })

  it('sépare la retraite du cash et garde ses détails facultatifs', () => {
    render(<App />)
    fireEvent.click(screen.getByText('Paramètres avancés'))
    expect(screen.getByLabelText(/Afficher les droits retraite 2026/)).toBeChecked()
    fireEvent.click(screen.getByRole('button', { name: 'Voir la comparaison' }))
    const summary = screen.getByText('Retraite — droits 2026 (hors cash)')
    expect(summary).toBeVisible()
    expect(
      screen.getByRole('region', { name: 'Droits retraite 2026 — salariat' }),
    ).not.toBeVisible()
    fireEvent.click(summary)
    expect(screen.getByRole('region', { name: 'Droits retraite 2026 — salariat' })).toBeVisible()
  })

  it('rapproche les trois cash après frais, distingue avantages et IR et replie les détails', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Voir la comparaison' }))
    expect(screen.getByRole('region', { name: 'Synthèse des trois statuts' })).toBeVisible()
    expect(screen.getByTestId('overview-micro-before')).toHaveTextContent('70 900')
    expect(screen.getByTestId('overview-employee-before')).toHaveTextContent('39 521')
    expect(screen.getByTestId('overview-ei-before')).toHaveTextContent('66 559')
    expect(screen.getByTestId('overview-employee-benefits')).toHaveTextContent('3 000')
    expect(screen.getByText('Détails avant IR')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Résultat' })).not.toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Modifier les hypothèses' }))
    fireEvent.click(screen.getByLabelText('Estimer le disponible après impôt'))
    fireEvent.click(screen.getByRole('button', { name: 'Voir la comparaison' }))
    expect(screen.getByTestId('overview-micro-after')).toHaveTextContent('57 996')
    expect(screen.getByTestId('overview-ei-after')).toHaveTextContent('52 773')
    expect(screen.getByRole('region', { name: 'Hypothèses utilisées' })).toHaveTextContent('500')
  })

  it('range les outils dans Exploration et la bibliothèque dans Scénarios', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('tab', { name: 'Exploration' }))
    expect(screen.getByText('Taux d’équilibre')).toBeVisible()
    expect(screen.queryByRole('group', { name: 'Scénarios enregistrés' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('Sensibilité et aléas'))
    fireEvent.change(screen.getByLabelText('Jours perdus'), { target: { value: '12' } })
    fireEvent.click(screen.getByRole('tab', { name: 'Scénarios' }))
    expect(screen.getByText('Scénarios enregistrés')).toBeVisible()
    expect(screen.queryByText('Taux d’équilibre')).not.toBeVisible()
    fireEvent.click(screen.getByRole('tab', { name: 'Exploration' }))
    expect(screen.getByLabelText('Jours perdus')).toHaveValue(12)
  })
  it('sépare les entrées des résultats et conserve les saisies au retour', () => {
    render(<App />)
    expect(screen.getAllByRole('tab').map((e) => e.textContent?.trim())).toEqual([
      'Hypothèses',
      'Résultats',
      'Exploration',
      'Scénarios',
    ])
    expect(screen.getByRole('tab', { name: 'Hypothèses' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.queryByRole('heading', { name: 'Résultat' })).not.toBeInTheDocument()
    const rate = screen.getByRole('spinbutton', { name: 'Taux journalier' })
    fireEvent.change(rate, { target: { value: '450' } })
    fireEvent.click(screen.getByRole('button', { name: 'Voir la comparaison' }))
    expect(screen.getByRole('tab', { name: 'Résultats' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.queryByRole('spinbutton', { name: 'Taux journalier' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Modifier les hypothèses' }))
    expect(screen.getByRole('spinbutton', { name: 'Taux journalier' })).toHaveValue(450)
  })
})
