import { fireEvent, screen } from '@testing-library/react'

export function navigate(view: 'Hypothèses' | 'Résultats' | 'Exploration' | 'Scénarios') {
  fireEvent.click(screen.getByRole('tab', { name: view }))
}

export function openDetail(name: string) {
  const summary = screen.getByText(name, { selector: 'summary', exact: true })
  if (!summary.closest('details')?.open) fireEvent.click(summary)
}

export function showResults() {
  navigate('Résultats')
  openDetail('Détails avant IR')
}

export function showScenarios() {
  navigate('Scénarios')
  openDetail('Scénarios enregistrés')
}
