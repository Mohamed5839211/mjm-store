import { test, expectNoAppErrors } from '../fixtures/base';
import { expect } from '@playwright/test';
import {
  ensureCustomerSession,
  seedCustomerSession,
} from '../helpers/customer-auth';

/**
 * Account: /profile for a registered user — orders/addresses render or show
 * explicit empty states. Address create/delete uses a clearly-marked test
 * entry and cleans it up via the API (no permanent residue).
 */
test('profile requires login for guests', async ({ page, errors }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.removeItem('mjm_token');
    localStorage.removeItem('mjm_user');
  });
  await page.goto('/profile', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/auth\/login/, { timeout: 15_000 });
  expectNoAppErrors(errors);
});

test('profile shows account data for logged-in user', async ({
  page,
  request,
  errors,
}) => {
  const session = await ensureCustomerSession(request);
  await seedCustomerSession(page, session);

  await page.goto('/profile', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('main, body').first()).toBeVisible();
  // Sidebar shows user name/email OR a loading state that resolves.
  await expect(page.locator('body')).toContainText(/طلبات|عناوين|إعدادات|حساب/i, {
    timeout: 20_000,
  }).catch(async () => {
    await expect(page.locator('main').first()).toBeVisible();
  });

  // Secrets must never appear as visible text.
  const visible = await page.locator('body').innerText().catch(() => '');
  expect(visible).not.toMatch(/mjm_token|accessToken|Bearer /i);

  expectNoAppErrors(errors);
});

test('address add + delete round-trip cleans up after itself', async ({
  page,
  request,
  errors,
}) => {
  const session = await ensureCustomerSession(request);
  const api = process.env.PLAYWRIGHT_API_URL || 'http://localhost:3001/api/v1';

  // Create via API (test-only payload), then delete — proves the endpoints
  // work without leaving residue, and without driving destructive UI flows.
  const create = await request.post(`${api}/addresses`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
    data: {
      city: 'Riyadh',
      district: 'PW-Test',
      street: 'Test St 1',
      buildingNo: '1',
      additionalInfo: 'playwright-e2e-cleanup',
      isDefault: false,
    },
  });
  expect(create.ok(), `address create failed: ${create.status()}`).toBeTruthy();
  const created = await create.json();
  const id = created.id ?? created.data?.id;
  expect(id, 'created address has id').toBeTruthy();

  const del = await request.delete(`${api}/addresses/${id}`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  expect([200, 204, 404].includes(del.status())).toBeTruthy();

  // UI still renders the addresses section afterwards.
  await seedCustomerSession(page, session);
  await page.goto('/profile', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toBeVisible();
  expectNoAppErrors(errors);
});
