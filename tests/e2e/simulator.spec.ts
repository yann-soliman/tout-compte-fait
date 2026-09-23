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

test('update affected results within 100 ms in the browser', async ({ page }) => {
  await page.goto('/')
  const input = page.getByRole('spinbutton', { name: 'Taux journalier' })
  const result = page.locator('.result-card--micro .result-main strong')
  const initial = await result.textContent()
  await input.fill('649')
  await expect(result).not.toHaveText(initial ?? '')
  await page.waitForTimeout(200)

  const duration = await input.evaluate((input) => {
    const result = document.querySelector('.result-card--micro .result-main strong')
    if (!(input instanceof HTMLInputElement) || !result) throw new Error('UI de calcul introuvable')
    const previous = result.textContent
    const started = performance.now()

    return new Promise<number>((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error('Résultat non actualisé')), 500)
      const observer = new MutationObserver(() => {
        if (result.textContent !== previous) {
          window.clearTimeout(timeout)
          observer.disconnect()
          resolve(performance.now() - started)
        }
      })
      observer.observe(result, { childList: true, characterData: true, subtree: true })
      const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
      if (!valueSetter) throw new Error('Setter natif introuvable')
      valueSetter.call(input, '651')
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })
  })

  expect(duration).toBeLessThan(100)
})
