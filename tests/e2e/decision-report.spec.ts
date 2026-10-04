import { Buffer } from 'node:buffer'
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { defaultScenario } from '../../src/domain/defaults'

const snapshot = (id: string, name: string, rate: number) => ({
  id,
  name,
  savedAt: '2026-10-04T00:00:00Z',
  scenario: {
    ...defaultScenario,
    micro: { ...defaultScenario.micro, dailyRate: rate, billedDays: 160 },
    employee: { ...defaultScenario.employee, grossAnnualSalary: 5_800_000 },
  },
})

test('defaults and reset preserve imported older snapshots', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByLabel('Taux journalier', { exact: true })).toHaveValue('500')
  await expect(page.getByLabel('Jours facturés', { exact: true })).toHaveValue('200')
  await expect(page.getByLabel('Salaire brut', { exact: true })).toHaveValue('50000')
  await page.locator('summary').filter({ hasText: 'Scénarios enregistrés' }).click()
  await page.getByLabel('Importer une collection JSON').setInputFiles({
    name: 'old.json',
    mimeType: 'application/json',
    buffer: Buffer.from(
      JSON.stringify({ schemaVersion: 1, scenarios: [snapshot('old', 'Ancienne offre', 60000)] }),
    ),
  })
  await page.getByRole('button', { name: 'Charger Ancienne offre' }).click()
  await expect(page.getByLabel('Taux journalier', { exact: true })).toHaveValue('600')
  await expect(page.getByLabel('Jours facturés', { exact: true })).toHaveValue('160')
  await expect(page.getByLabel('Salaire brut', { exact: true })).toHaveValue('58000')
  const storage = await page.evaluate(() => localStorage.getItem('tout-compte-fait:scenarios:v1'))
  page.once('dialog', (d) => d.accept())
  await page.getByRole('button', { name: 'Réinitialiser les entrées' }).click()
  await expect(page.getByLabel('Taux journalier', { exact: true })).toHaveValue('500')
  await expect(page.getByLabel('Jours facturés', { exact: true })).toHaveValue('200')
  await expect(page.getByLabel('Salaire brut', { exact: true })).toHaveValue('50000')
  expect(await page.evaluate(() => localStorage.getItem('tout-compte-fait:scenarios:v1'))).toBe(
    storage,
  )
  await page.getByRole('button', { name: 'Charger Ancienne offre' }).click()
  await expect(page.getByLabel('Taux journalier', { exact: true })).toHaveValue('600')
})

test('twenty offers keep stable identities and render HTML-like names as plain text', async ({
  page,
}) => {
  await page.goto('/')
  await page.locator('summary').filter({ hasText: 'Scénarios enregistrés' }).click()
  const name = '<img src=x onerror="document.body.dataset.injected=1">'
  const offers = Array.from({ length: 20 }, (_, i) => snapshot(`max-${i}`, name, 40000 + i))
  await page.getByLabel('Importer une collection JSON').setInputFiles({
    name: 'twenty.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ schemaVersion: 1, scenarios: offers })),
  })
  const checks = page.getByRole('checkbox', { name: /^Comparer/ })
  await expect(checks).toHaveCount(20)
  for (const check of await checks.all()) await check.check()
  await expect(page.locator('.offer-chart-group')).toHaveCount(21)
  const identities = await page
    .locator('.offer-chart-group')
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('data-offer-id')))
  expect(new Set(identities).size).toBe(21)
  expect(await page.locator('.offers-visual').locator('img').count()).toBe(0)
  expect(await page.evaluate(() => document.body.dataset.injected)).toBeUndefined()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  const before = await page.evaluate(() => JSON.stringify({ ...localStorage }))
  await page.getByRole('button', { name: 'Prévisualiser le rapport' }).click()
  await expect(page.getByRole('dialog').locator('[data-report-offer]')).toHaveCount(21)
  await expect(page.getByRole('dialog')).toContainText(name)
  await page.getByRole('button', { name: 'Fermer le rapport' }).click()
  expect(await page.evaluate(() => JSON.stringify({ ...localStorage }))).toBe(before)
})

test('selected offers and print preview remain exact, accessible and local', async ({
  page,
  context,
}, testInfo) => {
  await page.goto('/')
  await page
    .locator('.robustness-visual')
    .screenshot({ path: testInfo.outputPath('robustness.png') })
  await page.locator('summary').filter({ hasText: 'Scénarios enregistrés' }).click()
  const offers = [
    snapshot('a', 'Offre PDF', 35000),
    snapshot('b', 'Non sélectionnée', 60000),
    snapshot('c', 'Offre PDF', 0),
  ]
  await page.getByLabel('Importer une collection JSON').setInputFiles({
    name: 'offers.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ schemaVersion: 1, scenarios: offers })),
  })
  const checks = page.getByLabel('Comparer Offre PDF', { exact: true })
  await checks.nth(0).check()
  await checks.nth(1).check()
  await expect(page.locator('.offer-chart-row')).toHaveCount(6)
  await page.getByLabel('Indicateur des offres').selectOption('netIncome')
  await expect(page.locator('.offers-visual')).toContainText('41')
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.locator('.offers-visual').screenshot({ path: testInfo.outputPath('offers.png') })
  await context.setOffline(true)
  await page.getByRole('button', { name: 'Mensuel', exact: true }).click()
  const opener = page.getByRole('button', { name: 'Prévisualiser le rapport' })
  await opener.focus()
  await opener.press('Enter')
  const dialog = page.getByRole('dialog', { name: 'Rapport de comparaison' })
  await expect(dialog).toBeVisible()
  await expect(dialog.locator('[data-report-offer]')).toHaveCount(3)
  await expect(dialog).not.toContainText('Non sélectionnée')
  await expect(dialog).toContainText('TJM : 500,00')
  await expect(dialog).toContainText('Jours facturés : 200')
  await expect(dialog).toContainText('Date d’effet')
  await expect(dialog).toContainText('2026-09-22')
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  expect(await dialog.evaluate((e) => e.scrollWidth <= e.clientWidth)).toBe(true)
  await page.keyboard.press('Shift+Tab')
  await expect(dialog.locator('a').last()).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Imprimer / Enregistrer en PDF' })).toBeFocused()
  await page.evaluate(() => {
    document.body.dataset.printCalls = '0'
    window.print = () => {
      document.body.dataset.printCalls = String(Number(document.body.dataset.printCalls) + 1)
    }
  })
  await page.getByRole('button', { name: 'Imprimer / Enregistrer en PDF' }).click()
  expect(await page.evaluate(() => document.body.dataset.printCalls)).toBe('1')
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('.report-actions')).toBeHidden()
  await expect(page.locator('#root')).toBeHidden()
  await expect(page.locator('.report-paper')).toBeVisible()
  const pdf = await page.pdf({
    path: testInfo.outputPath('decision-report.pdf'),
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
  })
  expect(pdf.subarray(0, 4).toString()).toBe('%PDF')
  expect(pdf.byteLength).toBeGreaterThan(10000)
  await page.emulateMedia({ media: 'screen' })
  await dialog.screenshot({ path: testInfo.outputPath('report-preview.png') })
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(opener).toBeFocused()
  expect(await page.locator('#root').evaluate((e) => (e as HTMLElement).inert)).toBe(false)
  await checks.nth(0).uncheck()
  await checks.nth(1).uncheck()
  await page.getByLabel('Taux journalier', { exact: true }).fill('450')
  await opener.click()
  await expect(page.getByRole('dialog')).toContainText('TJM : 450,00')
  await expect(page.getByRole('dialog').locator('[data-report-offer]')).toHaveCount(1)
})
