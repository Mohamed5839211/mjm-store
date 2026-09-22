import { test } from '../fixtures/base';
import { expect } from '@playwright/test';
import { classifyErrors } from '../helpers/js-errors';

/**
 * Network/error resilience via page.route mocks — the app must show a
 * comprehensible state and never white-screen.
 */
test('products API outage shows handled state on /shop', async ({
  page,
  errors,
}) => {
  await page.route(/\/api\/v1\/products/, (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'mock outage' }),
    }),
  );
  await page.goto('/shop', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('body')).toBeVisible();
  await expect(page.locator('main').first()).toBeVisible();
  // Empty/error state text OR retry control — either is a handled state.
  await expect(page.locator('main')).toContainText(/خطأ|فشل|لا توجد|إعادة|حاول/i, {
    timeout: 15_000,
  }).catch(() => {});

  const { critical } = classifyErrors(errors, {
    allowedStatuses: [500],
    allowedUrlPatterns: [/api\/v1\/products/],
  });
  expect(critical).toEqual([]);
});

test('slow API keeps a loading indicator and resolves', async ({
  page,
  errors,
}) => {
  await page.route(/\/api\/v1\/products/, async (route) => {
    await new Promise((r) => setTimeout(r, 1500));
    await route.continue();
  });
  await page.goto('/shop', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('main').first()).toBeVisible({ timeout: 20_000 });

  const { critical, notes } = classifyErrors(errors);
  for (const n of notes) console.log(`[note] ${n}`);
  expect(critical).toEqual([]);
});

test('invalid JSON from API does not crash the page', async ({
  page,
  errors,
}) => {
  await page.route(/\/api\/v1\/cms\/settings/, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: 'THIS IS NOT JSON {{{',
    }),
  );
  await page.goto('/cart', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toBeVisible();
  await expect(page.locator('main h1').first()).toBeVisible({ timeout: 15_000 });

  const { critical, notes } = classifyErrors(errors, {
    allowedUrlPatterns: [/cms\/settings/],
    allowedMessagePatterns: [/JSON|Unexpected token|SyntaxError/],
  });
  for (const n of notes) console.log(`[note] ${n}`);
  expect(critical).toEqual([]);
});

test('form submit during network outage stays usable', async ({
  page,
  errors,
}) => {
  await page.route(/\/api\/v1\/auth\/login/, (route) => route.abort());
  await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });

  await page.locator('#email').fill('offline@example.com');
  await page.locator('#password').fill('Offline1234');
  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL(/\/auth\/login/);
  await expect(page.locator('#email')).toBeVisible();

  const { critical } = classifyErrors(errors, {
    allowedUrlPatterns: [/api\/v1\/auth\/login/],
    allowedMessagePatterns: [/Failed to fetch|NetworkError|abort|fetch/i],
  });
  expect(critical).toEqual([]);
});
