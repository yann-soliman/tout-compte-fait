import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('complete the compact simulator without horizontal overflow', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Situation commune' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Résultat' })).toBeVisible()
  await page.getByRole('spinbutton', { name: 'Taux journalier' }).fill('650')
  await expect(page.getByRole('spinbutton', { name: 'Taux journalier' })).toHaveValue('650')

  const results = page.locator('.results-section')
  await expect(results.getByText('Revenu net avant impôt')).toHaveCount(2)
  await expect(results.getByText('Écart de revenu net')).toBeVisible()
  await expect(results.getByText(/Éligibilité non confirmée|dépasse le plafond/)).toBeVisible()
  await results
    .getByText(/Sources réglementaires/)
    .first()
    .click()
  await expect(results.getByRole('link', { name: 'Régime micro-social' })).toBeVisible()

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
  expect(overflow).toBe(false)

  const accessibility = await new AxeBuilder({ page }).analyze()
  expect(accessibility.violations).toEqual([])
})

test('compare expenses, benefits and status-specific worked time', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('spinbutton', { name: 'Jours facturés' }).fill('0')
  await page.getByRole('spinbutton', { name: 'Frais professionnels' }).fill('5000')
  await page.getByRole('spinbutton', { name: 'Avantages' }).fill('4200')
  await page.getByRole('spinbutton', { name: 'Quotité de travail' }).fill('50')

  const results = page.locator('.results-section')
  await expect(results.getByText('Indéterminée')).toBeVisible()
  await expect(results.getByText('115 j')).toBeVisible()
  await expect(results.getByText('Frais économiques')).toBeVisible()
  await expect(results.getByText('Avantages')).toBeVisible()

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
  expect(overflow).toBe(false)
})
