import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('complete the compact simulator without horizontal overflow', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Situation commune' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Résultat' })).toBeVisible()
  await page.getByLabel('Taux journalier').fill('650')
  await expect(page.getByLabel('Taux journalier')).toHaveValue('650')

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
  expect(overflow).toBe(false)

  const accessibility = await new AxeBuilder({ page }).analyze()
  expect(accessibility.violations).toEqual([])
})
