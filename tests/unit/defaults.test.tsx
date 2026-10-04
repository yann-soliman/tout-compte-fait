import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { App } from '../../src/App'

it('starts with the requested illustrative rate, days and gross salary', () => {
  render(<App />)
  expect(screen.getByLabelText('Taux journalier')).toHaveValue(500)
  expect(screen.getByLabelText('Jours facturés')).toHaveValue(200)
  expect(screen.getByLabelText('Salaire brut')).toHaveValue(50000)
})
