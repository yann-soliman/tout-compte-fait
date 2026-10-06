import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { navigate, openDetail, showProjection } from './navigation-009-helpers'

test('compare une moyenne micro explicite et projette des années réellement alternées hors ligne', async ({
  page,
}) => {
  await page.goto('/')
  await navigate(page, 'Résultats')
  await expect(page.getByTestId('overview-micro-before')).toHaveText('64 816 € /an')
  await openDetail(page, 'Détail du cycle micro sur deux ans')
  const cycle = page.getByRole('table', {
    name: 'Recettes et disponible micro avant IR par année du cycle',
  })
  await expect(cycle).toContainText('70 900,00')
  await expect(cycle).toContainText('58 731,20')
  await expect(page.getByText(/64\s815,60.*moyenne annuelle/)).toBeVisible()
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  await page.route('**/*', (route) => route.abort())
  await showProjection(page)
  await page.getByRole('spinbutton', { name: 'Évolution annuelle' }).fill('0')
  await page.getByRole('button', { name: '5 ans', exact: true }).click()
  await expect(page.getByText('Démonstration')).toHaveCount(0)
  await expect(page.getByText('Estimation à règles constantes')).toBeVisible()
  await openDetail(page, 'Afficher les valeurs annuelles du graphique')
  const rows = page
    .getByRole('table', { name: 'Recettes, disponible annuel et valeur cumulée par statut' })
    .locator('tbody tr')
  await expect(rows).toHaveCount(5)
  await expect(rows.nth(0)).toContainText('100 000')
  await expect(rows.nth(1)).toContainText('83 600')
  await expect(rows.nth(2)).toContainText('100 000')
  await expect(rows.nth(3)).toContainText('83 600')
  await expect(rows.nth(4)).toContainText('330 162')
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  )
  await page.screenshot({ path: test.info().outputPath('micro-cycle.png'), fullPage: true })
  await navigate(page, 'Scénarios')
  await page.getByRole('button', { name: 'Prévisualiser le rapport' }).click()
  const report = page.getByRole('dialog', { name: 'Rapport de comparaison' })
  await expect(report).toContainText(/64\s815,60/)
  await expect(report).toContainText('moyenne annuelle')
})
