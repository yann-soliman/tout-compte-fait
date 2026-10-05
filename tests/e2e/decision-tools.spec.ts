import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { navigate, showResults } from './navigation-009-helpers'

test('saves locally, downloads a real JSON collection and imports it atomically', async ({
  page,
}, testInfo) => {
  await page.goto('/')
  await navigate(page, 'Scénarios')
  await page.getByText('Scénarios enregistrés', { exact: true }).click()
  await page.getByRole('textbox', { name: 'Nom du scénario' }).fill('Offre E2E')
  await page.getByRole('button', { name: 'Enregistrer le scénario' }).click()
  await expect(page.getByText('Offre E2E', { exact: true })).toBeVisible()

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: /Exporter JSON/i }).click()
  const download = await downloadPromise
  const exportedPath = testInfo.outputPath(download.suggestedFilename())
  await download.saveAs(exportedPath)
  const exported = JSON.parse(await readFile(exportedPath, 'utf8')) as {
    schemaVersion: number
    scenarios: Array<{ name: string }>
  }
  expect(exported.schemaVersion).toBe(1)
  expect(exported.scenarios.map((scenario) => scenario.name)).toContain('Offre E2E')

  await page.getByLabel('Importer une collection JSON').setInputFiles(exportedPath)
  await expect(page.getByText('Offre E2E', { exact: true })).toBeVisible()
  await page.reload()
  await navigate(page, 'Scénarios')
  await page.getByText('Scénarios enregistrés', { exact: true }).click()
  await expect(page.getByText('Offre E2E', { exact: true })).toBeVisible()
  await navigate(page, 'Hypothèses')
  const rate = page.getByRole('spinbutton', { name: 'Taux journalier' })
  await expect(rate).toHaveValue('500')
  await rate.fill('700')
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Réinitialiser les entrées' }).click()
  await expect(rate).toHaveValue('500')
  await navigate(page, 'Scénarios')
  await expect(page.getByText('Offre E2E', { exact: true })).toBeVisible()
})

test('shows out-of-ceiling scenarios and handles stress and annual/monthly thresholds', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('spinbutton', { name: 'Salaire brut' }).fill('120000')
  await page.getByLabel('Début d’activité micro').fill('2026-01-01')
  await page.getByRole('spinbutton', { name: 'Taux journalier' }).fill('650')
  await navigate(page, 'Exploration')
  await page.locator('.decision-disclosure').nth(0).locator('summary').click()
  await page.getByLabel('Cible de comparaison').selectOption('totalValue')
  await expect(page.locator('.balance-card small').first()).toContainText('Hors plafond')
  await page.locator('.decision-disclosure').nth(1).locator('summary').click()
  await page.getByRole('spinbutton', { name: /Jours perdus/i }).fill('366')
  await expect(page.getByText(/0 jour restant/i)).toBeVisible()
  await page.getByRole('button', { name: 'Mensuel' }).click()
  await expect(page.getByText(/résultats annuels/i)).toBeVisible()
  await page.getByRole('button', { name: 'Annuel' }).click()
  await expect(page.getByText(/résultats annuels/i)).toBeVisible()
})

test('keeps disclosures accessible and the result after inputs without horizontal overflow', async ({
  page,
}) => {
  await page.goto('/')
  await navigate(page, 'Exploration')
  const balanceSummary = page.locator('.decision-disclosure').nth(0).locator('summary')
  await balanceSummary.focus()
  await expect(balanceSummary).toBeFocused()
  const result = page.getByRole('heading', { name: 'Résultat' })
  await navigate(page, 'Hypothèses')
  const inputs = await page.getByRole('heading', { name: 'Revenus à comparer' }).elementHandle()
  await showResults(page)
  expect(
    await inputs!.evaluate(
      (node, target) => node.compareDocumentPosition(target),
      await result.elementHandle(),
    ),
  ).toBe(4)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  )
  const accessibility = await new AxeBuilder({ page }).analyze()
  expect(accessibility.violations).toEqual([])
})
