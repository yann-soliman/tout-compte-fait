import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'

test('saves locally, downloads a real JSON collection and imports it atomically', async ({
  page,
}, testInfo) => {
  await page.goto('/')
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
  await page.getByText('Scénarios enregistrés', { exact: true }).click()
  await expect(page.getByText('Offre E2E', { exact: true })).toBeVisible()
  const rate = page.getByRole('spinbutton', { name: 'Taux journalier' })
  await expect(rate).toHaveValue('600')
  await rate.fill('700')
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Réinitialiser les entrées' }).click()
  await expect(rate).toHaveValue('600')
  await expect(page.getByText('Offre E2E', { exact: true })).toBeVisible()
})

test('shows out-of-ceiling scenarios and handles stress and annual/monthly thresholds', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('spinbutton', { name: 'Salaire brut' }).fill('120000')
  await page.getByLabel('Début d’activité micro').fill('2026-01-01')
  await page.getByRole('spinbutton', { name: 'Taux journalier' }).fill('650')
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
  const balanceSummary = page.locator('.decision-disclosure').nth(0).locator('summary')
  await balanceSummary.focus()
  await expect(balanceSummary).toBeFocused()
  const result = page.getByRole('heading', { name: 'Résultat' })
  const inputs = page.getByRole('heading', { name: 'Revenus à comparer' })
  expect(
    await inputs.evaluate(
      (node, target) => node.compareDocumentPosition(target),
      await result.elementHandle(),
    ),
  ).toBe(4)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
  expect(overflow).toBe(false)
  const accessibility = await new AxeBuilder({ page }).analyze()
  expect(accessibility.violations).toEqual([])
})
