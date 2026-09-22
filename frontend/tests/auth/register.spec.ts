import { test, expectNoAppErrors } from '../fixtures/base';
import { expect } from '@playwright/test';

/**
 * /auth/register — verified selectors in src/app/(site)/auth/register/page.tsx:
 *   #full-name, #business-name (conditional), #phone, #email, #password,
 *   toggle buttons "فردي" / "أعمال", submit button[type=submit].
 */
test('register form shows all required fields', async ({ page, errors }) => {
  await page.goto('/auth/register', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('#full-name')).toBeVisible();
  await expect(page.locator('#phone')).toBeVisible();
  await expect(page.locator('#email')).toBeVisible();
  await expect(page.locator('#password')).toBeVisible();
  await expect(page.locator('button[type="submit"]')).toBeVisible();

  expectNoAppErrors(errors);
});

test('register validates email and password client-side', async ({
  page,
  errors,
}) => {
  await page.goto('/auth/register', { waitUntil: 'domcontentloaded' });

  await page.locator('#full-name').fill('Test User');
  await page.locator('#phone').fill('0501234567');
  // Invalid email + short password must not submit.
  await page.locator('#email').fill('not-an-email');
  await page.locator('#password').fill('123');
  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL(/\/auth\/register/);
  expectNoAppErrors(errors);
});

test('register rejects duplicate email', async ({ page, request, errors }) => {
  const api =
    process.env.PLAYWRIGHT_API_URL || 'http://localhost:3001/api/v1';
  const uniq = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  const email = `pwdup+${uniq}@example.com`;
  const phoneDup = `05${String(Math.floor(10000000 + Math.random() * 90000000))}`;
  const first = await request.post(`${api}/auth/register`, {
    data: {
      name: 'Dup Test',
      email,
      phone: phoneDup,
      password: 'TestPass1234',
    },
  });
  expect(first.ok()).toBeTruthy();

  // Attempt the same email through the UI.
  await page.goto('/auth/register', { waitUntil: 'domcontentloaded' });
  await page.locator('#full-name').fill('Dup Test');
  await page.locator('#phone').fill('0501234567');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill('TestPass1234');
  await page.locator('button[type="submit"]').click();

  // Must stay on register with an error (409 conflict expected).
  await expect(page).toHaveURL(/\/auth\/register/, { timeout: 15_000 });
  expectNoAppErrors(errors, [400, 409]);
});

test('register succeeds with unique data and lands on profile', async ({
  page,
  errors,
}) => {
  const uniq = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  const email = `pwreg+${uniq}@example.com`;
  const phone = `05${String(Math.floor(10000000 + Math.random() * 90000000))}`;

  await page.goto('/auth/register', { waitUntil: 'domcontentloaded' });
  await page.locator('#full-name').fill('Register Test');
  await page.locator('#phone').fill(phone);
  await page.locator('#email').fill(email);
  await page.locator('#password').fill('TestPass1234');
  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL(/\/profile/, { timeout: 20_000 });
  const token = await page.evaluate(() => localStorage.getItem('mjm_token'));
  expect(token, 'session saved after register').toBeTruthy();

  expectNoAppErrors(errors);
});
