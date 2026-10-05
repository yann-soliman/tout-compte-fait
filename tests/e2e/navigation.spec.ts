import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('guided comparison, free tabs, actual viewport and offline keep the same hypotheses', async ({
  page,
  context,
}, info) => {
  await page.goto('/')
  await expect(page.getByRole('tab', { name: 'Hypothèses' })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await expect(page.getByRole('tabpanel')).toHaveCount(1)
  await expect(page.getByRole('region', { name: 'Synthèse des trois statuts' })).toHaveCount(0)
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  await page.getByLabel('Estimer le disponible après impôt').check()
  await page.getByRole('button', { name: 'Voir la comparaison' }).click()
  await expect(page.getByRole('heading', { name: 'Comparer les trois statuts' })).toBeFocused()
  await expect(page.getByTestId('overview-micro-before')).toContainText(/70\s900/)
  await expect(page.getByTestId('overview-micro-after')).toContainText(/57\s996/)
  await expect(page.getByTestId('overview-ei-before')).toContainText(/66\s559/)
  await expect(page.getByRole('spinbutton', { name: 'Taux journalier', exact: true })).toHaveCount(
    0,
  )
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  )
  await page.screenshot({ path: info.outputPath('results.png'), fullPage: true, scale: 'css' })
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  await page.getByRole('tab', { name: 'Résultats' }).focus()
  await page.keyboard.press('End')
  await expect(page.getByRole('tab', { name: 'Scénarios' })).toBeFocused()
  await page.keyboard.press('Home')
  await expect(page.getByRole('tab', { name: 'Hypothèses' })).toBeFocused()
  await page.getByLabel('Situation du foyer fiscal').selectOption('couple')
  await page.getByLabel(/Autres revenus nets imposables au barème/).fill('50000')
  await page.getByRole('spinbutton', { name: 'Taux journalier', exact: true }).fill('450')
  await context.setOffline(true)
  if (info.project.name === 'mobile') await page.getByRole('tab', { name: 'Résultats' }).tap()
  else await page.getByRole('tab', { name: 'Résultats' }).click()
  await expect(page.getByRole('region', { name: 'Hypothèses utilisées' })).toContainText(/450/)
  await expect(page.getByRole('region', { name: 'Hypothèses utilisées' })).toContainText('Couple')
  await page.getByRole('button', { name: 'Modifier les hypothèses' }).click()
  await expect(page.getByRole('spinbutton', { name: 'Taux journalier', exact: true })).toHaveValue(
    '450',
  )
  await expect(page.getByLabel('Situation du foyer fiscal')).toHaveValue('couple')
  await expect(page.getByLabel(/Autres revenus nets imposables au barème/)).toHaveValue('50000')
  await expect(page.getByLabel('Estimer le disponible après impôt')).toBeChecked()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  )
  await page.screenshot({ path: info.outputPath('hypotheses.png'), fullPage: true, scale: 'css' })
})

test('exploration settings and offer selection persist, explicit load retains tax reset semantics', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('tab', { name: 'Exploration' }).click()
  await page.getByText('Sensibilité et aléas', { exact: true }).click()
  await page.getByLabel('Jours perdus', { exact: true }).fill('12')
  await page.getByRole('tab', { name: 'Scénarios' }).click()
  await page.getByText('Scénarios enregistrés', { exact: true }).click()
  await page.getByLabel('Nom du scénario').fill('Navigation')
  await page.getByRole('button', { name: 'Enregistrer le scénario', exact: true }).click()
  await page.getByLabel('Comparer Navigation', { exact: true }).check()
  await page.getByRole('tab', { name: 'Résultats' }).click()
  await page.getByRole('tab', { name: 'Scénarios' }).click()
  await expect(page.getByLabel('Comparer Navigation', { exact: true })).toBeChecked()
  await page.getByRole('tab', { name: 'Exploration' }).click()
  await expect(page.getByLabel('Jours perdus', { exact: true })).toHaveValue('12')
  await page.getByRole('tab', { name: 'Hypothèses' }).click()
  await page.getByLabel('Estimer le disponible après impôt').check()
  await page.getByRole('tab', { name: 'Scénarios' }).click()
  await page.getByRole('button', { name: 'Charger Navigation', exact: true }).click()
  await expect(page.getByRole('tab', { name: 'Hypothèses' })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await expect(page.getByLabel('Estimer le disponible après impôt')).not.toBeChecked()
})

test('first exploration remains fully available after losing network, and retains projection settings', async ({
  page,
  context,
}, info) => {
  await page.goto('/')
  await context.setOffline(true)
  if (info.project.name === 'mobile') await page.getByRole('tab', { name: 'Exploration' }).tap()
  else await page.getByRole('tab', { name: 'Exploration' }).click()
  await page.getByText('Projection pluriannuelle', { exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Projeter la valeur dans le temps' }),
  ).toBeVisible()
  await page.getByLabel('Évolution annuelle', { exact: true }).fill('5')
  await page.getByRole('button', { name: '20 ans', exact: true }).click()
  await page.getByRole('tab', { name: 'Scénarios' }).click()
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  )
  await page.getByRole('tab', { name: 'Exploration' }).click()
  await expect(page.getByLabel('Évolution annuelle', { exact: true })).toHaveValue('5')
  await expect(page.getByRole('button', { name: '20 ans', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  )
  await page.screenshot({ path: info.outputPath('exploration.png'), fullPage: true, scale: 'css' })
})

test('invalid current input never becomes a default comparison or projection', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('spinbutton', { name: 'Jours facturés', exact: true }).fill('999')
  await page.getByRole('tab', { name: 'Résultats' }).click()
  await expect(page.getByRole('alert')).toBeVisible()
  await expect(page.getByRole('region', { name: 'Synthèse des trois statuts' })).toHaveCount(0)
  await page.getByRole('tab', { name: 'Exploration' }).click()
  await expect(page.getByRole('alert')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Projeter la valeur dans le temps' })).toHaveCount(
    0,
  )
})
