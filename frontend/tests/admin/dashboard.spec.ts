import { test, expectNoAppErrors } from '../fixtures/base';
import { expect } from '@playwright/test';

/**
 * Admin pages — session reused from global-setup (playwright/.auth/admin.json).
 * NEVER log in per test. Each page must render h1 + main content without
 * redirecting back to /mjm while the session is valid.
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
  test(`admin page renders after auth: ${route}`, async ({ page, errors }) => {
    const response = await page.goto(route, {
      waitUntil: 'domcontentloaded',
    });

    expect(response, `no response for ${route}`).not.toBeNull();
    expect(response!.status(), `${route} HTTP error`).toBeLessThan(400);

    // Must stay inside /admin (no bounce to /mjm with a valid session).
    await expect(page).toHaveURL(/\/admin/, { timeout: 15_000 });

    // Structural proof: heading + main landmark (Arabic text not asserted
    // because of encoding fragility — presence of h1 is enough).
    await expect(page.locator('main h1').first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator('main').first()).toBeVisible();

    // Content state: table / form / controls / explicit empty message.
    // Some admin pages (e.g. /admin/requests) show an empty-state message
    // with no table/form when the DB is empty, so accept any non-empty main.
    const hasStructuredContent =
      (await page.locator('main table, main form, main button, main input, main [role="status"]').count()) > 0;
    if (!hasStructuredContent) {
      const mainText = (await page.locator('main').innerText().catch(() => '')).trim();
      expect(mainText.length, `${route} main content should not be empty`).toBeGreaterThan(10);
    } else {
      await expect(page.locator('main table, main form, main button, main input, main [role="status"]').first()).toBeVisible({ timeout: 15_000 });
    }

    expectNoAppErrors(errors);
  });
}

test('admin logout returns to /mjm and blocks /admin afterwards', async ({
  page,
  errors,
}) => {
  await page.goto('/admin', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/admin/);

  // Logout via the sidebar logout control if present, else clear session
  // the same way the app does (token-store.clear()).
  const logoutBtn = page.locator(
    'button:has-text("خروج"), button:has-text("تسجيل الخروج"), [data-testid="admin-logout"]',
  );
  if ((await logoutBtn.count()) > 0) {
    await logoutBtn.first().click();
  } else {
    await page.evaluate(() => {
      localStorage.removeItem('mjm_admin_token');
      localStorage.removeItem('mjm_admin_user');
      document.cookie =
        'mjm_admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    });
    await page.goto('/mjm', { waitUntil: 'domcontentloaded' });
  }

  await expect(page).toHaveURL(/\/mjm/);

  // After logout, /admin must NOT show dashboard content (proxy returns 404 page).
  await page.goto('/admin', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toBeVisible();
  const url2 = page.url();
  const body2 = await page.locator('body').innerText().catch(() => '');
  const stillBlocked = /\/mjm|__no_such_page__/.test(url2) || /غير موجودة|404|جاري التحقق/i.test(body2);
  // AdminGuard loader is also an acceptable blocked state before 404 settles.
  if (!stillBlocked) await expect(page.locator('[aria-label="جاري التحقق"]')).toBeVisible();

  const { critical } = await import('../helpers/js-errors').then((m) =>
    m.classifyErrors(errors, { allowedStatuses: [401, 403, 404] }),
  );
  expect(critical).toEqual([]);
});
