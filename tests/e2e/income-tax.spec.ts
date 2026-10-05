import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('after-tax projection is explicit, annual/monthly, accessible and offline at each viewport', async ({
  page,
  context,
}, testInfo) => {
  await page.goto('/')
  const activation = page.getByLabel('Estimer le disponible après impôt')
  await expect(activation).not.toBeChecked()
  await expect(page.getByTestId('tax-micro-cash')).toHaveCount(0)
  await activation.focus()
  await page.keyboard.press('Space')
  if (testInfo.project.name === 'mobile') {
    await activation.tap()
    await expect(page.getByTestId('tax-micro-cash')).toHaveCount(0)
    await activation.tap()
  }
  const region = page.getByRole('region', { name: 'Disponible après impôt — projection' })
  await expect(region.getByTestId('tax-micro-cash')).toHaveText(/57\s996/)
  await expect(region.getByText(/barème 2026 sur revenus 2025/).first()).toBeVisible()
  await expect(page.getByTestId('ei-available')).toHaveText(/66\s559/)
  await page.getByRole('button', { name: 'Mensuel', exact: true }).click()
  await expect(region.getByText(/Moyenne annuelle/)).toBeVisible()
  await page.getByRole('button', { name: 'Annuel', exact: true }).click()
  await page.getByLabel('Situation du foyer fiscal').selectOption('couple')
  await page.getByLabel(/Autres revenus nets imposables au barème/).fill('50000')
  const employee = region.getByRole('article', { name: 'Salariat — après IR' })
  await expect(
    employee
      .locator('.result-metrics > div')
      .filter({ has: page.getByText('IR du foyer sans cette activité', { exact: true }) }),
  ).toHaveText(/2\s799/)
  await region.getByText('Sources réglementaires (8)').click()
  await expect(region.getByRole('link', { name: 'Barème 2026 — revenus 2025' })).toBeVisible()
  await region.getByText('Sources réglementaires (8)').click()
  await context.setOffline(true)
  await page.getByLabel('Enfants à charge exclusive').selectOption('1')
  await expect(region.getByTestId('tax-employee-cash')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  )
  await region.screenshot({ path: testInfo.outputPath('after-tax.png'), scale: 'css' })
  for (const kind of ['employee', 'micro', 'ei']) {
    await region
      .locator(`article[aria-labelledby="after-tax-${kind}"]`)
      .screenshot({ path: testInfo.outputPath(`after-tax-${kind}.png`), scale: 'css' })
  }
  await page
    .locator('.tax-inputs')
    .screenshot({ path: testInfo.outputPath('tax-inputs.png'), scale: 'css' })
  await page.screenshot({
    path: testInfo.outputPath('full-page.png'),
    fullPage: true,
    scale: 'css',
  })
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  )
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
})

test('after-tax guards missing CFE, deficit, high income and invalid cents without breaking pre-tax', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByLabel('Estimer le disponible après impôt').check()
  const region = page.getByRole('region', { name: 'Disponible après impôt — projection' })
  await page.getByRole('spinbutton', { name: 'CFE', exact: true }).fill('0')
  await expect(region.getByTestId('tax-micro-cash')).toHaveCount(0)
  await expect(region.getByTestId('tax-ei-cash')).toHaveCount(0)
  await expect(region.getByTestId('tax-employee-cash')).toBeVisible()
  await page.getByLabel('Confirmer une exonération CFE pour l’EI').check()
  await expect(region.getByTestId('tax-ei-cash')).toBeVisible()
  await page.getByRole('spinbutton', { name: 'Taux journalier', exact: true }).fill('0')
  await expect(region.getByText(/Déficit EI/)).toBeVisible()
  await expect(page.getByTestId('ei-available')).toHaveText(/-3\s955/)
  await page.getByLabel(/Autres revenus nets imposables au barème/).fill('300000')
  await expect(region.getByText(/Hauts revenus/).first()).toBeVisible()
  await page.getByLabel(/Autres revenus nets imposables au barème/).fill('0.001')
  await expect(region.getByRole('alert')).toContainText(/centime/)
  await expect(region.getByTestId('tax-employee-cash')).toHaveCount(0)
  await page.getByLabel(/Autres revenus nets imposables au barème/).fill('0.29')
  await expect(region.getByTestId('tax-employee-cash')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Résultat', exact: true })).toBeVisible()
})
