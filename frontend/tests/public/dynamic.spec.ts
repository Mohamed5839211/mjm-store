import { test, expectNoAppErrors } from '../fixtures/base';
import { expect } from '@playwright/test';
import { classifyErrors } from '../helpers/js-errors';
import { getFirstProduct, getFirstCategory } from '../helpers/api';

/**
 * Dynamic routes: IDs/slugs are discovered from the live API —
 * never hard-coded — so tests survive catalog changes.
 */
test('dynamic: existing product page renders', async ({
  page,
  request,
  errors,
}) => {
  const product = await getFirstProduct(request);
  test.info().annotations.push({ type: 'product', description: `id=${product.id}` });

  const response = await page.goto(`/products/${product.id}`, {
    waitUntil: 'domcontentloaded',
  });
  expect(response!.status()).toBeLessThan(400);

  // Product page has h1 (name), price block, and add-to-cart button.
  await expect(page.locator('main h1').first()).toBeVisible();
  // At least one actionable button exists (add-to-cart/wishlist).
  await expect(page.locator('main button').first()).toBeVisible();

  expectNoAppErrors(errors);
});

test('dynamic: existing category slug resolves (redirect to shop allowed)', async ({
  page,
  request,
  errors,
}) => {
  // NOTE: src/app/(site)/categories/[slug]/page.tsx server-redirects to
  // /shop#slug, so success = landing on /shop without an error page.
  const category = await getFirstCategory(request);

  const response = await page.goto(`/categories/${category.slug}`, {
    waitUntil: 'domcontentloaded',
  });
  expect(response!.status()).toBeLessThan(400);
  await expect(page).toHaveURL(/\/shop|\/categories\//);
  await expect(page.locator('main, body').first()).toBeVisible();

  expectNoAppErrors(errors);
});

test('dynamic: missing product shows handled state, not a crash', async ({
  page,
  errors,
}) => {
  const response = await page.goto('/products/999999999', {
    waitUntil: 'domcontentloaded',
  });

  // Either a handled not-found UI or a 404 status — but never an
  // unhandled exception / blank white screen.
  await expect(page.locator('body')).toBeVisible();
  const bodyText = await page.locator('body').innerText().catch(() => '');
  expect(
    response!.status() === 404 ||
      /غير موجود|not found|404|الرئيسية/i.test(bodyText),
    'missing product should show a handled not-found state',
  ).toBeTruthy();

  // 404s from the products API are expected here — don't fail on them.
  const { critical, notes } = classifyErrors(errors, {
    allowedStatuses: [404],
    allowedUrlPatterns: [/products\/999999999/],
  });
  for (const n of notes) console.log(`[note] ${n}`);
  expect(critical).toEqual([]);
});

test('dynamic: missing category slug does not crash', async ({
  page,
  errors,
}) => {
  await page.goto('/categories/no-such-category-xyz', {
    waitUntil: 'domcontentloaded',
  });
  await expect(page.locator('body')).toBeVisible();
  await expect(page).toHaveURL(/shop|categories/);

  const { critical, notes } = classifyErrors(errors, {
    allowedStatuses: [404],
    allowedMessagePatterns: [/Failed to execute 'measure'/, /negative time stamp/],
  });
  for (const n of notes) console.log(`[note] ${n}`);
  expect(critical).toEqual([]);
});
