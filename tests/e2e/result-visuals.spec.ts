import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { navigate, editHypothesis } from './navigation-009-helpers'

test('visual cards stay accessible, responsive and usable without network', async ({
  page,
  context,
}, testInfo) => {
  await page.goto('/')
  await navigate(page, 'Exploration')
  await expect(page.getByRole('heading', { name: 'Trouver une zone d’équilibre' })).toBeVisible()
  await context.setOffline(true)
  const days = page.getByRole('slider', { name: 'Jours à explorer' })
  await days.focus()
  await days.press('Home')
  await expect(days).toHaveValue('0')
  await expect(page.getByRole('button', { name: 'Appliquer cette hypothèse' })).toBeDisabled()
  await days.press('ArrowRight')
  await page.getByRole('spinbutton', { name: 'TJM à explorer' }).fill('350.58')
  const annual = await page.getByTestId('map-annual-difference').textContent()
  await page.getByRole('button', { name: 'Mensuel', exact: true }).click()
  await expect(page.getByTestId('map-annual-difference')).toHaveText(annual!)
  await expect(page.getByText('Montants mensuels')).toBeVisible()
  await page.getByRole('button', { name: 'Appliquer cette hypothèse' }).click()
  await navigate(page, 'Hypothèses')
  await expect(page.getByRole('spinbutton', { name: 'Taux journalier', exact: true })).toHaveValue(
    '350.58',
  )
  await expect(page.getByRole('spinbutton', { name: 'Jours facturés', exact: true })).toHaveValue(
    '1',
  )
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  )
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  await page.getByRole('button', { name: 'Annuel', exact: true }).click()
  await page.getByRole('spinbutton', { name: 'Taux journalier', exact: true }).fill('600')
  await page.getByRole('spinbutton', { name: 'Jours facturés', exact: true }).fill('160')
  await navigate(page, 'Exploration')
  await page
    .locator('.result-visuals')
    .screenshot({ path: testInfo.outputPath(`results-${testInfo.project.name}.png`) })
})

test('pointer selection recalculates exactly and never silently applies', async ({ page }) => {
  await page.goto('/')
  await navigate(page, 'Exploration')
  const map = page.getByRole('img', { name: /Carte des écarts annuels/ })
  await map.scrollIntoViewIfNeeded()
  const box = (await map.boundingBox())!
  // Near 100 days / €350, snapped to the sampled cell 100 days / €333.33.
  await page.mouse.click(
    box.x + (box.width * (62 + (100 / 240) * 666)) / 760,
    box.y + (box.height * (24 + 0.65 * 280)) / 360,
  )
  await expect(page.getByRole('slider', { name: 'Jours à explorer' })).toHaveValue('100')
  await expect(page.getByRole('spinbutton', { name: 'TJM à explorer' })).toHaveValue('333.33')
  await navigate(page, 'Hypothèses')
  await expect(page.getByRole('spinbutton', { name: 'Taux journalier', exact: true })).toHaveValue(
    '500',
  )
  await navigate(page, 'Exploration')
  await expect(page.getByRole('button', { name: 'Appliquer cette hypothèse' })).toBeEnabled()
  await page.getByRole('button', { name: 'Appliquer cette hypothèse' }).click()
  await navigate(page, 'Hypothèses')
  await expect(page.getByRole('spinbutton', { name: 'Taux journalier', exact: true })).toHaveValue(
    '333.33',
  )
  await expect(page.getByRole('spinbutton', { name: 'Jours facturés', exact: true })).toHaveValue(
    '100',
  )
})

test('touch selection works on a narrow screen while offline', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 360, height: 800 },
    hasTouch: true,
  })
  try {
    const page = await context.newPage()
    await page.goto('/')
    await navigate(page, 'Exploration')
    const map = page.getByRole('img', { name: /Carte des écarts annuels/ })
    await map.scrollIntoViewIfNeeded()
    await context.setOffline(true)
    const box = (await map.boundingBox())!
    await map.tap({
      position: {
        x: (box.width * (62 + (100 / 240) * 666)) / 760,
        y: (box.height * (24 + 0.65 * 280)) / 360,
      },
    })
    await expect(page.getByRole('slider', { name: 'Jours à explorer' })).toHaveValue('100')
    await expect(page.getByRole('spinbutton', { name: 'TJM à explorer' })).toHaveValue('333.33')
    await navigate(page, 'Hypothèses')
    await expect(page.getByRole('spinbutton', { name: 'Jours facturés', exact: true })).toHaveValue(
      '200',
    )
    await navigate(page, 'Exploration')
    await expect(page.getByRole('button', { name: 'Appliquer cette hypothèse' })).toBeEnabled()
  } finally {
    await context.close()
  }
})

test('negative flows and unknown CFE are visible, not optimistic zeroes', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('spinbutton', { name: 'Jours facturés', exact: true }).fill('0')
  await navigate(page, 'Exploration')
  await expect(page.getByText(/Déficit économique/)).toBeVisible()
  await editHypothesis(page, () =>
    page.getByRole('spinbutton', { name: 'CFE', exact: true }).fill('0'),
  )
  await expect(page.getByText(/CFE inconnue : écart estimatif/)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Appliquer cette hypothèse' })).toBeDisabled()
  await expect(page.locator('.map-balance-line')).toHaveCount(0)
  await expect(page.locator('.map-outside')).toHaveCount(1)
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
})
