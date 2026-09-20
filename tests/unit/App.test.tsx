import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { App } from '../../src/App'

describe('App', () => {
  it('presents the numbered input sequence before results', () => {
    render(<App />)

    const common = screen.getByRole('heading', { name: 'Situation commune' })
    const income = screen.getByRole('heading', { name: 'Revenus à comparer' })
    const retirement = screen.getByRole('heading', { name: 'Retraite et projection' })
    const result = screen.getByRole('heading', { name: 'Résultat' })

    expect(common.compareDocumentPosition(income)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(income.compareDocumentPosition(retirement)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(retirement.compareDocumentPosition(result)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })

  it('updates a scenario value and switches to monthly figures', async () => {
    const user = userEvent.setup()
    render(<App />)

    const dailyRate = screen.getByLabelText('Taux journalier')
    await user.clear(dailyRate)
    await user.type(dailyRate, '650')
    expect(dailyRate).toHaveValue(650)

    await user.click(screen.getByRole('button', { name: 'Mensuel' }))
    expect(screen.getAllByText('/mois').length).toBeGreaterThan(0)
  })

  it('opens contextual information and the projection view', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Informations : Taux journalier' }))
    expect(screen.getByRole('tooltip')).toHaveTextContent('Montant facturé hors taxes')

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Projection' }))
    expect(
      await screen.findByRole('heading', { name: 'Projeter la valeur dans le temps' }),
    ).toBeVisible()
  })
})
