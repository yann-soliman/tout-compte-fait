import { expect, test } from '@playwright/test'
import { showRetirement, showProjection, editHypothesis } from './navigation-009-helpers'

test('shows exact annual reference figures and dated sources independently of the display period', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('spinbutton', { name: 'Salaire brut', exact: true }).fill('75500')
  await showRetirement(page)
  const employee = page.getByRole('region', { name: 'Droits retraite 2026 — salariat' })
  const micro = page.getByRole('region', { name: 'Droits retraite 2026 — micro-entreprise' })
  await expect(employee.getByText('378,67', { exact: true })).toBeVisible()
  await expect(employee.getByText(/544,76/)).toBeVisible()
  await expect(employee.getByText(/2025-11-01/)).toBeVisible()
  await page.getByRole('button', { name: 'Mensuel' }).click()
  await expect(employee.getByText('378,67', { exact: true })).toBeVisible()
  await expect(employee.getByText(/544,76/)).toBeVisible()
  await employee.locator('summary').click()
  await micro.locator('summary').click()
  await expect(employee.getByRole('link', { name: /Circulaire Agirc-Arrco/ })).toHaveAttribute(
    'href',
    /CirculaireAgircArrco2025-16sg-drj.pdf$/,
  )
  await expect(micro.getByRole('link', { name: /CNAV 2025-23/ })).toBeVisible()
  await expect(micro.getByRole('link', { name: /CNAV 2025-31/ })).toBeVisible()
  await expect(micro.getByText(/CNAV — Assurance retraite.*2026-10-04/)).toHaveCount(2)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  )
})

test('recalculates complementary rights without runtime network access', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('spinbutton', { name: 'Taux journalier' }).fill('40000')
  await page.getByRole('spinbutton', { name: /Jours facturés/ }).fill('1')
  await showRetirement(page)
  const micro = page.getByRole('region', { name: 'Droits retraite 2026 — micro-entreprise' })
  await expect(micro.getByText('98,98', { exact: true })).toBeVisible()
  await expect(micro.getByText(/133,32/)).toBeVisible()
  await page.route('**/*', (route) => route.abort())
  await editHypothesis(page, () =>
    page.getByRole('spinbutton', { name: 'Taux journalier' }).fill('0'),
  )
  await expect(micro.getByText('0,00', { exact: true })).toBeVisible()
  await expect(micro.getByText(/0,00.*€/)).toBeVisible()
})

test('retain the scenario and update the projection duration', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('spinbutton', { name: 'Taux journalier' }).fill('650')
  await showProjection(page)

  await expect(
    page.getByRole('heading', { name: 'Projeter la valeur dans le temps' }),
  ).toBeVisible()
  await page.getByRole('button', { name: '20 ans' }).click()
  await expect(page.getByText('20 ans', { exact: true }).last()).toBeVisible()

  await page.getByRole('tab', { name: 'Hypothèses' }).click()
  await expect(page.getByRole('spinbutton', { name: 'Taux journalier' })).toHaveValue('650')
})

test('exposes limited 2026 retirement rights without claiming a full pension', async ({ page }) => {
  await page.goto('/')
  await showRetirement(page)
  await expect(page.getByRole('heading', { name: 'Droits retraite 2026' })).toHaveCount(2)
  await expect(page.getByText('Non calculable sur la seule année 2026')).toHaveCount(2)
  await expect(
    page.getByText(/ne constitue pas une estimation de la pension totale future/),
  ).toHaveCount(2)
  await expect(page.getByText('Points complémentaires estimés')).toHaveCount(2)
  await expect(page.getByText(/Estimatif — modèle annuel/)).toHaveCount(2)
  await expect(page.getByText('Agirc-Arrco', { exact: true })).toBeVisible()
  await expect(page.getByText(/RCI — libéral BNC/)).toBeVisible()

  await showProjection(page)
  await expect(page.getByText(/Hypothèse économique choisie/)).toBeVisible()
  await expect(page.getByText(/droits retraite ne sont pas ajoutés/)).toBeVisible()
})
