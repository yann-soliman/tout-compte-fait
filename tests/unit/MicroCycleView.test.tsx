import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { App } from '../../src/App'
import { navigate, openDetail } from './navigation-009-helpers'

describe('Cycle micro lisible', () => {
  it('montre la moyenne soutenable et les deux disponibles indépendants', () => {
    render(<App />)
    navigate('Résultats')
    expect(screen.getByTestId('overview-micro-before')).toHaveTextContent('64 816')
    const summary = screen.getByText('Détail du cycle micro sur deux ans', { selector: 'summary' })
    fireEvent.click(summary)
    const table = screen.getByRole('table', {
      name: 'Recettes et disponible micro avant IR par année du cycle',
    })
    expect(table).toHaveTextContent('100 000,00')
    expect(table).toHaveTextContent('83 600,00')
    expect(table).toHaveTextContent('70 900,00')
    expect(table).toHaveTextContent('58 731,20')
    expect(screen.getByText(/64 815,60.*moyenne annuelle/)).toBeVisible()
    navigate('Hypothèses')
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Taux journalier' }), {
      target: { value: '400' },
    })
    navigate('Résultats')
    expect(screen.queryByText('Détail du cycle micro sur deux ans')).not.toBeInTheDocument()
    expect(screen.getByTestId('overview-micro-before')).toHaveTextContent('56 060')
  })
  it('remplace démonstration et expose les recettes réellement alternées', () => {
    render(<App />)
    navigate('Exploration')
    openDetail('Projection pluriannuelle')
    expect(screen.queryByText('Démonstration')).not.toBeInTheDocument()
    expect(screen.getByText('Estimation à règles constantes')).toBeVisible()
    openDetail('Afficher les valeurs annuelles du graphique')
    expect(
      screen.getByRole('table', {
        name: 'Recettes, disponible annuel et valeur cumulée par statut',
      }),
    ).toHaveTextContent('83 600')
  })
})
