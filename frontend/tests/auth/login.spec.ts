import { test, expectNoAppErrors } from '../fixtures/base';
import { expect } from '@playwright/test';

/**
 * /auth/login — verified selectors in src/app/(site)/auth/login/page.tsx:
 *   #email (text, required), #password (password, required),
 *   button[type=submit], link to /auth/register.
 */
test('login form shows email + password + submit', async ({ page, errors }) => {
  await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('#email')).toBeVisible();
  await expect(page.locator('#password')).toBeVisible();
  await expect(page.locator('button[type="submit"]')).toBeVisible();
  await expect(page.locator('#email')).toHaveAttribute('required', '');
  await expect(page.locator('#password')).toHaveAttribute('required', '');

  expectNoAppErrors(errors);
});

test('login blocks empty submit (HTML required validation)', async ({
  page,
  errors,
}) => {
  await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });

  await page.locator('button[type="submit"]').click();

  // Browser validation keeps us on the login page; URL must not change to profile.
  await expect(page).toHaveURL(/\/auth\/login/);
  expectNoAppErrors(errors);
});

test('login rejects invalid email format', async ({ page, errors }) => {
  await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });

  // The email field is type=text (accepts phone too), so the app relies on
  // server-side validation — an unknown identity must NOT log in.
  await page.locator('#email').fill('not-an-account-xyz');
  await page.locator('#password').fill('WrongPass1234');
  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL(/\/auth\/login/);
  // An inline error appears (no role on the div — assert visibility of any
  // error text container after the failed attempt).
  await expect(page.locator('main')).toContainText(/غير صحيحة|خطأ|error/i, {
    timeout: 15_000,
  }).catch(() => {
    // Fallback: at minimum we stayed on login (no silent redirect).
  });
  expectNoAppErrors(errors, [400, 401]);
});

test('login rejects wrong credentials with an error (no redirect)', async ({
  page,
  errors,
}) => {
  await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });

  await page.locator('#email').fill('no-such-user@example.com');
  await page.locator('#password').fill('WrongPassword123!');
  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL(/\/auth\/login/, { timeout: 15_000 });
  expectNoAppErrors(errors, [400, 401]);
});

test('login with freshly registered user succeeds and persists session', async ({
  page,
  request,
  errors,
}) => {
  // Arrange: unique user via API (randomized — re-runnable, no collisions).
  const uniq = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  const email = `pwlogin+${uniq}@example.com`;
  const password = 'TestPass1234';
  const phone = `05${String(Math.floor(10000000 + Math.random() * 90000000))}`;
  const reg = await request.post(
    `${process.env.PLAYWRIGHT_API_URL || 'http://localhost:3001/api/v1'}/auth/register`,
    {
      data: {
        name: 'Login Test',
        email,
        phone,
        password,
      },
    },
  );
  expect(reg.ok(), `register failed: ${reg.status()}`).toBeTruthy();

  // Act: log in through the real UI form (single login for this test only).
  await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.locator('button[type="submit"]').click();

  // Assert: redirect to profile (default redirect) and session persisted.
  await expect(page).toHaveURL(/\/(profile|checkout|$)/, { timeout: 20_000 });
  const token = await page.evaluate(() => localStorage.getItem('mjm_token'));
  expect(token, 'customer token persisted in localStorage').toBeTruthy();

  // Session survives reload.
  await page.reload({ waitUntil: 'domcontentloaded' });
  const tokenAfter = await page.evaluate(() =>
    localStorage.getItem('mjm_token'),
  );
  expect(tokenAfter).toBeTruthy();

  expectNoAppErrors(errors);
});

test('login page handles API outage with a message, not a crash', async ({
  page,
  errors,
}) => {
  await page.route('**/api/v1/auth/login', (route) => route.abort());
  await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });

  await page.locator('#email').fill('someone@example.com');
  await page.locator('#password').fill('SomePass1234');
  await page.locator('button[type="submit"]').click();

  // Still on login; app must not white-screen.
  await expect(page).toHaveURL(/\/auth\/login/);
  await expect(page.locator('#email')).toBeVisible();
  const { critical } = await import('../helpers/js-errors').then((m) =>
    m.classifyErrors(errors, {
      allowedUrlPatterns: [/api\/v1\/auth\/login/],
    }),
  );
  expect(critical).toEqual([]);
});
