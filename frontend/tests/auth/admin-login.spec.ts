import { test, expectNoAppErrors } from '../fixtures/base';
import { expect } from '@playwright/test';

/**
 * /mjm — secret admin login (verified in src/app/(site)/mjm/page.tsx):
 *   #admin-email, #admin-password, form button[type=submit],
 *   error div[role=alert], success redirects to /admin.
 * Credentials ALWAYS from env (fallbacks = local seed only).
 */
const ADMIN_EMAIL = process.env.PLAYWRIGHT_ADMIN_EMAIL || 'admin@mjm.com';
const ADMIN_PASSWORD =
  process.env.PLAYWRIGHT_ADMIN_PASSWORD || 'adminPassword123';

test('admin login page shows admin fields', async ({ page, errors }) => {
  await page.goto('/mjm', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('#admin-email')).toBeVisible();
  await expect(page.locator('#admin-password')).toBeVisible();
  await expect(page.locator('form button[type="submit"]')).toBeVisible();

  expectNoAppErrors(errors);
});

test('admin login rejects wrong credentials', async ({ page, errors }) => {
  await page.goto('/mjm', { waitUntil: 'domcontentloaded' });

  await page.locator('#admin-email').fill('admin@mjm.com');
  await page.locator('#admin-password').fill('WrongPassword000!');
  await page.locator('form button[type="submit"]').click();

  // Stays on /mjm with role=alert error.
  await expect(page).toHaveURL(/\/mjm/);
  await expect(page.locator('[role="alert"]')).toBeVisible({
    timeout: 15_000,
  });
  expectNoAppErrors(errors, [400, 401]);
});

test('admin login succeeds and redirects to /admin with saved session', async ({
  page,
  errors,
}) => {
  await page.goto('/mjm', { waitUntil: 'domcontentloaded' });

  await page.locator('#admin-email').fill(ADMIN_EMAIL);
  await page.locator('#admin-password').fill(ADMIN_PASSWORD);
  await page.locator('form button[type="submit"]').click();

  await expect(page).toHaveURL(/\/admin/, { timeout: 20_000 });
  const adminToken = await page.evaluate(() =>
    localStorage.getItem('mjm_admin_token'),
  );
  expect(adminToken, 'admin token persisted').toBeTruthy();

  expectNoAppErrors(errors);
});

test('ordinary customer session cannot open /admin (redirect to /mjm)', async ({
  page,
  request,
  errors,
}) => {
  // Arrange: fresh customer via API (unique per run).
  const stamp = Date.now();
  const api = process.env.PLAYWRIGHT_API_URL || 'http://localhost:3001/api/v1';
  const reg = await request.post(`${api}/auth/register`, {
    data: {
      name: 'Guard Test',
      email: `pwguard+${stamp}@example.com`,
      phone: `05${String(stamp).slice(-8).padStart(8, '0')}`,
      password: 'TestPass1234',
    },
  });
  expect(reg.ok()).toBeTruthy();
  const { accessToken, user } = await reg.json();

  // Seed ONLY the customer session (no admin token).
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(
    ({ token, u }) => {
      localStorage.clear();
      localStorage.setItem('mjm_token', token);
      localStorage.setItem('mjm_user', JSON.stringify(u));
    },
    { token: accessToken, u: user },
  );
  await page.goto('/admin', { waitUntil: 'domcontentloaded' });

  // Proxy rewrites /admin → /__no_such_page__ (URL may stay /admin), so
  // assert by page content (404 text) or URL — both indicate blocked access.
  await expect(page.locator('body')).toBeVisible();
  const url = page.url();
  const body = await page.locator('body').innerText().catch(() => '');
  const blocked = /\/mjm|__no_such_page__/.test(url) || /غير موجودة|404|Not Found/i.test(body);
  expect(blocked, `customer was not blocked from /admin (url=${url})`).toBeTruthy();

  const { critical } = await import('../helpers/js-errors').then((m) =>
    m.classifyErrors(errors, { allowedStatuses: [401, 403, 404] }),
  );
  expect(critical).toEqual([]);
});
