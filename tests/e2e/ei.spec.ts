import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { navigate, showResults, editHypothesis } from './navigation-009-helpers'

test('EI annual/monthly cash, sources, negative minima and offline at each viewport', async ({
  page,
  context,
}, testInfo) => {
  await page.goto('/')
  await showResults(page)
  const ei = page.getByRole('region', { name: 'EI au réel — BNC 2026' })
  await expect(ei.getByTestId('ei-available')).toHaveText(/66\s559/)
  await expect(ei.getByText('Disponible micro après frais')).toBeVisible()
  await ei.screenshot({ path: testInfo.outputPath('ei.png') })
  await expect(ei.getByText('Avantages salariés hors cash')).toBeVisible()
  await expect(ei.getByText(/plafond dépassé/)).toBeVisible()
  await page.getByRole('button', { name: 'Mensuel', exact: true }).click()
  await expect(ei.getByTestId('ei-available')).toHaveText(/5\s547/)
  await expect(ei.getByText(/aucun échéancier/)).toBeVisible()
  await page.getByRole('button', { name: 'Annuel', exact: true }).click()
  await editHypothesis(page, () => page.getByLabel('Début d’activité micro').fill('2026-12-01'))
  await expect(ei.getByTestId('ei-available')).toHaveText(/66\s559/)
  await ei.getByText(/Sources réglementaires/).click()
  await expect(
    ei.getByRole('link', { name: 'Simulateur officiel EI 2026 — calcul indicatif' }),
  ).toBeVisible()
  await expect(ei.getByText(/effet 2026-01-01 · vérifié le 2026-10-04/).first()).toBeVisible()
  await ei.getByText(/Détail des cotisations EI/).click()
  await expect(ei.getByText('Maladie-maternité', { exact: true })).toBeVisible()
  await expect(ei.getByText('Formation professionnelle', { exact: true })).toBeVisible()
  await context.setOffline(true)
  await editHypothesis(page, () =>
    page.getByRole('spinbutton', { name: 'Taux journalier', exact: true }).fill('0'),
  )
  await expect(ei.getByTestId('ei-available')).toHaveText(/-4\s555/)
  const social = ei
    .locator('.result-metrics > div')
    .filter({ has: page.getByText('Cotisations et contributions EI', { exact: true }) })
  await expect(social).toHaveText(/1\s255/)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  )
  const accessibility = await new AxeBuilder({ page }).analyze()
  expect(accessibility.violations).toEqual([])
})

test('EI CFE must be confirmed independently, with native keyboard control', async ({ page }) => {
  await page.goto('/')
  await showResults(page)
  const ei = page.getByRole('region', { name: 'EI au réel — BNC 2026' })
  await editHypothesis(page, async () => {
    await page.getByRole('spinbutton', { name: 'CFE', exact: true }).fill('0')
    await page.getByLabel('Exonération de CFE confirmée', { exact: true }).check()
  })
  await expect(ei.getByText('Bloqué', { exact: true })).toBeVisible()
  await expect(ei.getByTestId('ei-available')).toHaveCount(0)
  const exemption = page.getByLabel('Confirmer une exonération CFE pour l’EI')
  await navigate(page, 'Hypothèses')
  await exemption.focus()
  await page.keyboard.press('Space')
  await expect(exemption).toBeChecked()
  await showResults(page)
  await expect(ei.getByText('Estimatif', { exact: true })).toBeVisible()
  await expect(ei.getByTestId('ei-available')).toBeVisible()
  await navigate(page, 'Hypothèses')
  await exemption.focus()
  await page.keyboard.press('Space')
  await showResults(page)
  await expect(ei.getByText('Bloqué', { exact: true })).toBeVisible()
})
