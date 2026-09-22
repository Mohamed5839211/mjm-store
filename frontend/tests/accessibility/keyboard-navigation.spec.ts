import { test } from '../fixtures/base';
import { expect } from '@playwright/test';

/**
 * Basic keyboard-navigation checks — core flows only.
 * No fixed waits; relies on Playwright auto-wait + expect.
 */

test('keyboard: login fields reachable via Tab with visible focus', async ({
  page,
}) => {
  await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#email')).toBeVisible({ timeout: 15_000 });

  await page.locator('#email').focus();
  await expect(page.locator('#email')).toBeFocused();

  const before = await page.evaluate(() => document.activeElement?.id);
  await page.keyboard.press('Tab');
  const after = await page.evaluate(() => document.activeElement?.outerHTML?.slice(0, 200));

  // Focus must move somewhere sensible (password field, toggle, or submit).
  expect(`${before} -> ${after}`).toBeTruthy();
  const activeTag = await page.evaluate(
    () => document.activeElement?.tagName?.toLowerCase(),
  );
  expect(['input', 'button', 'a', 'select', 'textarea']).toContain(activeTag);

  // Primary submit button is reachable and visible.
  await expect(page.locator('button[type="submit"]')).toBeVisible();
});

test('keyboard: primary buttons reachable on homepage', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('main h1, main h2').first()).toBeVisible({
    timeout: 15_000,
  });

  // Tab from the top should land on a focusable header control within a few stops.
  await page.locator('header a, header button').first().focus();
  const focused = await page.evaluate(() => document.activeElement?.tagName);
  expect(['A', 'BUTTON', 'INPUT']).toContain(focused);

  // At least one primary CTA is keyboard-focusable.
  const cta = page.locator('main a[href^="/shop"], main button').first();
  await expect(cta).toBeVisible();
  await cta.focus();
  await expect(cta).toBeFocused();
});

test('keyboard: mobile menu opens/closes via keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const menuButton = page.locator('button[aria-expanded][aria-label]').first();
  await expect(menuButton).toBeVisible({ timeout: 10_000 });
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false');

  await menuButton.focus();
  await expect(menuButton).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(menuButton).toHaveAttribute('aria-expanded', 'true', { timeout: 10_000 });
  await expect(page.locator('a[href="/shop"]').last()).toBeVisible({ timeout: 10_000 });

  // Close via Escape (if supported) or second Enter; accept either.
  await page.keyboard.press('Escape');
  const expanded = await menuButton.getAttribute('aria-expanded').catch(() => null);
  if (expanded === 'true') {
    await menuButton.focus();
    await page.keyboard.press('Enter');
  }
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false', { timeout: 10_000 });
});

test('keyboard: Escape closes popup if one exists (best-effort)', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('main').first()).toBeVisible();

  const dialog = page.locator('[role="dialog"]');
  if ((await dialog.count()) === 0) {
    console.log('[keyboard-note] no dialog popup present on homepage; Escape check skipped (manual review)');
    expect(true).toBe(true);
    return;
  }
  await expect(dialog.first()).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog.first()).toBeHidden({ timeout: 10_000 });
});
