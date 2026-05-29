import { test, expect } from '@playwright/test'

// The isolated canvas renders the page inside an iframe. These checks cover its
// reasons to exist: it renders, selection works across the frame boundary, and
// width-based media queries respond to the device width, not the editor window.
test.beforeEach(async ({ page }) => {
  await page.goto('/?isolate=1')
})

test('renders the page inside an iframe', async ({ page }) => {
  await expect(page.locator('iframe.pc-iframe')).toBeVisible()
  await expect(page.frameLocator('iframe.pc-iframe').locator('.demo-hero h1')).toContainText(
    'Compose pages',
  )
})

test('selection works across the frame boundary', async ({ page }) => {
  await page.frameLocator('iframe.pc-iframe').locator('.demo-hero').click()
  // Clicking inside the iframe updates the inspector in the parent document.
  await expect(page.locator('.pc-ih-name')).toHaveText('Hero')
})

test('media queries respond to the device width, not the window', async ({ page }) => {
  const heading = page.frameLocator('iframe.pc-iframe').locator('.demo-hero h1')
  const desktopSize = await heading.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
  expect(desktopSize).toBeGreaterThan(34) // 40px, above the 520px breakpoint

  // Switch the device to mobile; the iframe narrows below the breakpoint.
  await page.locator('.pc-vp-toggle button[title="mobile"]').click()
  await expect
    .poll(() => heading.evaluate((el) => parseFloat(getComputedStyle(el).fontSize)))
    .toBeLessThan(34) // 26px, the @media (max-width: 520px) rule applied
})
