import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('capture simulator and projection evidence', async ({ page }, testInfo) => {
  await page.goto('/')
  await page.screenshot({
    path: testInfo.outputPath(`simulator-${testInfo.project.name}.png`),
    fullPage: true,
  })

  await page.getByRole('tab', { name: 'Projection' }).click()
  await page.getByRole('heading', { name: 'Projeter la valeur dans le temps' }).waitFor()
  await page.screenshot({
    path: testInfo.outputPath(`projection-${testInfo.project.name}.png`),
    fullPage: true,
  })
})

test('preserve accessible results, traceability and responsive layout', async ({ page }) => {
  await page.goto('/')

  const results = page.locator('.results-section')
  await expect(results).toBeVisible()
  await expect(results.getByText('Règles générales 2026')).toBeVisible()

  const disclosure = results.getByText(/Sources réglementaires/).first()
  await disclosure.focus()
  await expect(disclosure).toBeFocused()
  await disclosure.press('Enter')
  await expect(results.getByRole('link', { name: 'Régime micro-social' })).toBeVisible()

  await page.getByRole('spinbutton', { name: 'Taux journalier' }).fill('1000')
  await expect(results.getByRole('status').first()).toBeVisible()

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])

  await page.getByRole('tab', { name: 'Projection' }).click()
  await page.getByText('Afficher les valeurs annuelles du graphique').click()
  await expect(
    page.getByRole('table', { name: 'Valeur cumulée par statut et par année' }),
  ).toBeVisible()
  await expect(page.getByText(/Valeur annuelle totale/)).toHaveCount(2)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
})
