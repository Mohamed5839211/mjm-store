import { test } from '../fixtures/base';
import { expect } from '@playwright/test';
import { runAxeAudit, expectNoAxeViolations } from '../helpers/accessibility';
import {
  ensureCustomerSession,
  seedCustomerSession,
} from '../helpers/customer-auth';

/**
 * Focused accessibility scans — key flows, read-only.
 * NO submit, NO purchase, NO real POST (checkout/contact/printing never submitted).
 */

test('a11y focused: login form', async ({ page }) => {
  await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#email')).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('main form').first()).toBeVisible();
  const result = await runAxeAudit(page, {
    testName: 'focused:login',
    path: '/auth/login',
  });
  expectNoAxeViolations(result);
});

test('a11y focused: register form', async ({ page }) => {
  await page.goto('/auth/register', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('main form').first()).toBeVisible({ timeout: 15_000 });
  const result = await runAxeAudit(page, {
    testName: 'focused:register',
    path: '/auth/register',
  });
  expectNoAxeViolations(result);
});

test('a11y focused: cart page (empty, read-only)', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.setItem('mjm_cart', '[]'));
  await page.goto('/cart', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('main h1').first()).toBeVisible({ timeout: 15_000 });
  const result = await runAxeAudit(page, {
    testName: 'focused:cart',
    path: '/cart',
  });
  expectNoAxeViolations(result);
});

test('a11y focused: product details page (real product, read-only)', async ({
  page,
  request,
}) => {
  const { getFirstProduct } = await import('../helpers/api');
  const product = await getFirstProduct(request);
  await page.goto(`/products/${product.id}`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('main h1').first()).toBeVisible({ timeout: 15_000 });
  const result = await runAxeAudit(page, {
    testName: 'focused:product',
    path: `/products/${product.id}`,
  });
  expectNoAxeViolations(result);
});

test('a11y focused: checkout without submitting an order', async ({
  page,
  request,
}) => {
  const session = await ensureCustomerSession(request);
  await seedCustomerSession(page, session);
  await page.evaluate(() => {
    localStorage.setItem(
      'mjm_cart',
      JSON.stringify([
        { id: 'product-5', kind: 'product', productId: 5, name: 't', price: 100, quantity: 2 },
      ]),
    );
  });
  await page.route(/\/api\/v1\/addresses/, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, city: 'Riyadh', district: 'Suli', street: 'Main', buildingNo: '1', isDefault: true },
      ]),
    }),
  );
  await page.route(/\/api\/v1\/cms\/settings/, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ freeShippingEnabled: false, vatRate: 15 }),
    }),
  );
  await page.goto('/checkout', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('main, body').first()).toBeVisible();
  // NEVER click submit / NEVER POST an order.
  const result = await runAxeAudit(page, {
    testName: 'focused:checkout',
    path: '/checkout',
  });
  await page.evaluate(() => localStorage.setItem('mjm_cart', '[]'));
  expectNoAxeViolations(result);
});

test('a11y focused: contact form without submitting', async ({ page }) => {
  await page.goto('/contact', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('main form, main input, main textarea').first()).toBeVisible({
    timeout: 15_000,
  });
  // No fill-and-submit — scan the pristine form only.
  const result = await runAxeAudit(page, {
    testName: 'focused:contact',
    path: '/contact',
  });
  expectNoAxeViolations(result);
});

test('a11y focused: custom-printing form without submitting', async ({ page }) => {
  await page.goto('/custom-printing', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('main form, main input, main button').first()).toBeVisible({
    timeout: 15_000,
  });
  // No file upload, no submit — scan only.
  const result = await runAxeAudit(page, {
    testName: 'focused:custom-printing',
    path: '/custom-printing',
  });
  expectNoAxeViolations(result);
});

test('a11y focused: mobile menu open state + dropdowns (best-effort)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const menuButton = page.locator('button[aria-expanded][aria-label]').first();
  await expect(menuButton).toBeVisible({ timeout: 10_000 });
  await menuButton.click();
  await expect(menuButton).toHaveAttribute('aria-expanded', 'true', { timeout: 10_000 });
  await expect(page.locator('a[href="/shop"]').last()).toBeVisible({ timeout: 10_000 });

  const result = await runAxeAudit(page, {
    testName: 'focused:mobile-menu-open',
    path: '/ (mobile menu open)',
  });
  expectNoAxeViolations(result);

  // Dropdowns / dialogs: scan only if one actually exists; otherwise log + pass.
  const dialogCount = await page.locator('[role="dialog"], [role="menu"]').count();
  if (dialogCount === 0) {
    console.log('[axe-note] focused:popups — no dialog/menu popup present on homepage; manual review only');
  } else {
    const popupResult = await runAxeAudit(page, {
      testName: 'focused:popup',
      path: '/ (popup open)',
    });
    expectNoAxeViolations(popupResult);
  }
  await page.keyboard.press('Escape');
});
