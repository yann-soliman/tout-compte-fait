import { expect, test } from '@playwright/test'

test('retain the scenario and update the projection duration', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('spinbutton', { name: 'Taux journalier' }).fill('650')
  await page.getByRole('tab', { name: 'Projection' }).click()

  await expect(
    page.getByRole('heading', { name: 'Projeter la valeur dans le temps' }),
  ).toBeVisible()
  await page.getByRole('button', { name: '20 ans' }).click()
  await expect(page.getByText('20 ans', { exact: true }).last()).toBeVisible()

  await page.getByRole('tab', { name: 'Simulateur' }).click()
  await expect(page.getByRole('spinbutton', { name: 'Taux journalier' })).toHaveValue('650')
})

test('exposes limited 2026 retirement rights without claiming a full pension', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Droits retraite 2026' })).toHaveCount(2)
  await expect(page.getByText('Non calculable sur la seule année 2026')).toHaveCount(2)
  await expect(
    page.getByText(/ne constitue pas une estimation de la pension totale future/),
  ).toHaveCount(2)
  await expect(page.getByText('Indisponibles — paramètres 2026 non vérifiés')).toHaveCount(2)

  await page.getByRole('tab', { name: 'Projection' }).click()
  await expect(page.getByText(/Hypothèse économique choisie/)).toBeVisible()
  await expect(page.getByText(/droits retraite ne sont pas ajoutés/)).toBeVisible()
})
