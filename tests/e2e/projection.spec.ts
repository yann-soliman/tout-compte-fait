import { expect, test } from '@playwright/test'

test('retain the scenario and update the projection duration', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Taux journalier').fill('650')
  await page.getByRole('tab', { name: 'Projection' }).click()

  await expect(
    page.getByRole('heading', { name: 'Projeter la valeur dans le temps' }),
  ).toBeVisible()
  await page.getByRole('button', { name: '20 ans' }).click()
  await expect(page.getByText('20 ans', { exact: true }).last()).toBeVisible()

  await page.getByRole('tab', { name: 'Simulateur' }).click()
  await expect(page.getByLabel('Taux journalier')).toHaveValue('650')
})
