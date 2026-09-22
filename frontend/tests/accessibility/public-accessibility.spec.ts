import { test } from '../fixtures/base';
import { expect } from '@playwright/test';
import { runAxeAudit, expectNoAxeViolations } from '../helpers/accessibility';

/**
 * Public pages accessibility — axe-core with default rules.
 * Read-only pages only; no create/update/delete/purchase/submit.
 * Selectors use roles/landmarks (no Arabic-text assertions — encoding fragility).
 */
const publicRoutes = [
  '/',
  '/about',
  '/auth/login',
  '/auth/register',
  '/bundles',
  '/cart',
  '/categories',
  '/contact',
  '/custom-printing',
  '/faq',
  '/privacy',
  '/returns',
  '/shipping',
  '/shop',
  '/terms',
  '/water-subscriptions',
];

for (const route of publicRoutes) {
  test(`a11y public page: ${route}`, async ({ page, errors }) => {
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
    expect(response, `no response for ${route}`).not.toBeNull();
    // Skip error pages instead of scanning them (per brief §1.5).
    expect(response!.status(), `${route} returned HTTP error`).toBeLessThan(400);

    // Wait for primary content (late-loading sections included) — no fixed timeout.
    await expect(
      page.locator('main h1, main h2, main form, main a, main button').first(),
      `${route} has no primary content element`,
    ).toBeVisible({ timeout: 15_000 });

    // Ensure we are not on a Next.js error page.
    await expect(page.locator('main').first()).toBeVisible();

    const result = await runAxeAudit(page, {
      testName: `public:${route}`,
      path: route,
    });
    expectNoAxeViolations(result);
  });
}
