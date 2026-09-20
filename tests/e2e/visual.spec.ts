import { test } from '@playwright/test'

test('capture simulator and projection evidence', async ({ page }, testInfo) => {
  await page.goto('/')
  await page.screenshot({
    path: testInfo.outputPath(`simulator-${testInfo.project.name}.png`),
    fullPage: true,
  })

  await page.getByRole('tab', { name: 'Projection' }).click()
  await page.getByRole('heading', { name: 'Projeter la valeur dans le temps' }).waitFor()
  await page.screenshot({
    path: testInfo.outputPath(`projection-${testInfo.project.name}.png`),
    fullPage: true,
  })
})
