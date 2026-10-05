import type { Page } from '@playwright/test'

export async function navigate(
  page: Page,
  name: 'Hypothèses' | 'Résultats' | 'Exploration' | 'Scénarios',
) {
  await page.getByRole('tab', { name, exact: true }).click()
}
export async function openDetail(page: Page, name: string) {
  const summary = page.locator('summary').filter({ hasText: name })
  if (!(await summary.evaluate((node) => (node.parentElement as HTMLDetailsElement).open)))
    await summary.click()
}
export async function showResults(page: Page) {
  await navigate(page, 'Résultats')
  await openDetail(page, 'Détails avant IR')
}
export async function showRetirement(page: Page) {
  await showResults(page)
  await openDetail(page, 'Retraite — droits 2026 (hors cash)')
}
export async function showProjection(page: Page) {
  await navigate(page, 'Exploration')
  await openDetail(page, 'Projection pluriannuelle')
}
export async function showTax(page: Page) {
  await showResults(page)
  await openDetail(page, 'Détails fiscaux')
}
/** Exercise actual visible inputs, then return to the existing comparison/tool view.
 * Native disclosure state is preserved; no hidden-input action or synthetic navigation.
 */
export async function editHypothesis(page: Page, action: () => Promise<unknown>) {
  const before = (await page.getByRole('tab', { selected: true }).innerText()).trim() as
    'Hypothèses' | 'Résultats' | 'Exploration' | 'Scénarios'
  await navigate(page, 'Hypothèses')
  await action()
  await navigate(page, before)
}
