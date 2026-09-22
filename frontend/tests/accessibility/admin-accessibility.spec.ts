import { test } from '../fixtures/base';
import { expect } from '@playwright/test';
import { runAxeAudit, expectNoAxeViolations } from '../helpers/accessibility';

/**
 * Admin pages accessibility — reuses the saved admin session from
 * global-setup (playwright/.auth/admin.json). NEVER logs in per test.
 */
test.use({ storageState: 'playwright/.auth/admin.json' });

const adminRoutes = [
  '/admin',
  '/admin/bundles',
  '/admin/categories',
  '/admin/cms',
  '/admin/invoices',
  '/admin/offers',
  '/admin/orders',
  '/admin/products',
  '/admin/requests',
  '/admin/settings',
  '/admin/shipping',
  '/admin/staff',
  '/admin/users',
];

for (const route of adminRoutes) {
  test(`a11y admin page: ${route}`, async ({ page }) => {
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
    expect(response, `no response for ${route}`).not.toBeNull();
    expect(response!.status(), `${route} HTTP error`).toBeLessThan(400);

    // Must stay inside /admin with a valid session (no bounce to /mjm).
    await expect(page).toHaveURL(/\/admin/, { timeout: 15_000 });

    // Wait for the real primary element (main / heading).
    await expect(page.locator('main h1').first()).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('main').first()).toBeVisible();

    const result = await runAxeAudit(page, {
      testName: `admin:${route}`,
      path: route,
    });

    // Log full remediation context; fail only on app-owned violations
    // (external-only nodes are already downgraded to notes in the helper).
    if (result.violations.length > 0) {
      for (const v of result.violations) {
        console.log(
          `[axe-admin-detail] ${route} :: id=${v.id} impact=${v.impact} help=${v.help} helpUrl=${v.helpUrl} targets=${v.targets.join(' | ')}`,
        );
      }
    }
    expectNoAxeViolations(result);
  });
}
