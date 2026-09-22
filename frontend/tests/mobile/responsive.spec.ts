import { test, expectNoAppErrors } from '../fixtures/base';
import { expect } from '@playwright/test';

/**
 * Responsive: runs in all projects; the mobile-chrome project (Pixel 5)
 * exercises the narrow layout. Assertions: no horizontal overflow on key
 * pages, header/nav and primary buttons remain visible and tappable.
 */
const pages = ['/', '/shop', '/cart', '/auth/login'];

for (const route of pages) {
  test(`responsive: ${route} fits viewport without horizontal overflow`, async ({
    page,
    errors,
  }) => {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('header').first()).toBeVisible();
    await expect(page.locator('main').first()).toBeVisible();

    const overflow = await page.evaluate(() => {
      const el = document.documentElement;
      return el.scrollWidth - el.clientWidth;
    });
    expect(overflow, `${route} overflows horizontally by ${overflow}px`).toBeLessThanOrEqual(
      2,
    );

    // Primary CTA still visible.
    await expect(
      page.locator('main a, main button').first(),
    ).toBeVisible({ timeout: 15_000 });

    expectNoAppErrors(errors);
  });
}

test('responsive: admin orders page does not overflow the page', async ({
  errors,
}) => {
  // Use a dedicated browser context with admin auth; collect its own errors.
  const { chromium } = await import('playwright');
  const b = await chromium.launch();
  const ctx = await b.newContext({ storageState: 'playwright/.auth/admin.json' });
  const adminPage = await ctx.newPage();
  const adminErrors = await (await import('../helpers/js-errors')).collectPageErrors(adminPage);
  await adminPage.goto('/admin/orders', { waitUntil: 'domcontentloaded' });
  await expect(adminPage.locator('main').first()).toBeVisible({ timeout: 15_000 });

  const pageOverflow = await adminPage.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(pageOverflow).toBeLessThanOrEqual(2);
  await ctx.close();
  await b.close();
  const { classifyErrors } = await import('../helpers/js-errors');
  const { critical } = classifyErrors(adminErrors);
  for (const n of classifyErrors(adminErrors).notes) console.log(`[note] ${n}`);
  expect(critical).toEqual([]);
  // Also drain the original page's errors as notes (not critical).
  const { notes } = (await import('../helpers/js-errors')).classifyErrors(errors);
  for (const n of notes) console.log(`[note] ${n}`);
});
