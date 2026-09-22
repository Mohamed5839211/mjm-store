import { test, expectNoAppErrors } from '../fixtures/base';
import { expect } from '@playwright/test';
import { hasFatalRender } from '../helpers/js-errors';

/**
 * Smoke: homepage loads with title, main structure, no HTTP/JS disasters.
 * Stable selectors only (role/main/headings) — no fragile CSS chains,
 * no body.innerText length assertions as proof of "working".
 */
test('smoke: homepage opens with title and main structure', async ({
  page,
  errors,
}) => {
  const response = await page.goto('/', { waitUntil: 'domcontentloaded' });

  expect(response, 'no response for /').not.toBeNull();
  expect(response!.status()).toBeLessThan(400);
  await expect(page).toHaveTitle(/.+/);

  // Main structure: header + main + footer, plus at least one heading.
  await expect(page.locator('header').first()).toBeVisible();
  await expect(page.locator('main').first()).toBeVisible();
  await expect(page.locator('footer').first()).toBeVisible();
  await expect(page.locator('main h1, main h2').first()).toBeVisible();

  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  expect(await hasFatalRender(page)).toBeNull();
  expectNoAppErrors(errors);
});
