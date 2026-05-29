import { test, expect, type Page } from '@playwright/test'

// The inspector field whose label is exactly the given text (so "Title" does
// not also match "Subtitle").
function field(page: Page, label: string) {
  return page.locator('.pc-field', { has: page.getByText(label, { exact: true }) })
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('loads the editor with the starter page', async ({ page }) => {
  await expect(page.locator('.pc-brand-word')).toHaveText('Page Composer')
  await expect(page.locator('.demo-hero h1')).toContainText('Compose pages')
})

test('selecting a block shows it in the inspector', async ({ page }) => {
  await page.locator('.demo-hero').click()
  await expect(page.locator('.pc-ih-name')).toHaveText('Hero')
  await expect(field(page, 'Title').locator('.pc-inp')).toBeVisible()
})

test('editing a prop updates the canvas live', async ({ page }) => {
  await page.locator('.demo-hero').click()
  await field(page, 'Title').locator('.pc-inp').fill('Edited in a real browser')
  await expect(page.locator('.demo-hero h1')).toHaveText('Edited in a real browser')
})

test('keyboard reorder moves the selection within its zone', async ({ page }) => {
  const firstBlock = page.locator('.pc-page > .pc-root-zone > .pc-cmp').first()
  await expect(firstBlock.locator('.demo-hero')).toBeVisible()
  await page.locator('.demo-hero').click()
  await page.keyboard.press('Meta+Shift+ArrowDown')
  // After moving the Hero down, the first top-level block is now the Grid.
  await expect(
    page.locator('.pc-page > .pc-root-zone > .pc-cmp').first().locator('.demo-grid'),
  ).toBeVisible()
})

test('keyboard pick-up moves a block across the page', async ({ page }) => {
  const firstBlock = page.locator('.pc-page > .pc-root-zone > .pc-cmp').first()
  await expect(firstBlock.locator('.demo-hero')).toBeVisible()
  await page.locator('.demo-hero').click()
  await page.keyboard.press('m') // pick up
  await page.keyboard.press('ArrowDown') // step to the next slot
  await page.keyboard.press('Enter') // drop
  await expect(
    page.locator('.pc-page > .pc-root-zone > .pc-cmp').first().locator('.demo-grid'),
  ).toBeVisible()
})

test('preview renders the repeater once per record', async ({ page }) => {
  // "Composable" is only a repeater item title, so it is absent while editing
  // (the template renders once with an unresolved scope) and present in preview.
  await expect(page.getByText('Composable', { exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: 'Preview' }).click()
  await expect(page.getByText('Composable', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('Realtime', { exact: true }).first()).toBeVisible()
})
