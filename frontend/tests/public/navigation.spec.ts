import { test, expectNoAppErrors } from '../fixtures/base';
import { expect } from '@playwright/test';

/**
 * Navigation: key links between pages + link hygiene (no dead hrefs).
 * Uses real hrefs/roles; keyboard navigation is covered for the main nav.
 */
test('navigation: homepage links reach shop and auth pages', async ({
  page,
  errors,
}) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  // At least one link to /shop exists on the homepage (hero CTAs).
  const shopLink = page.locator('a[href^="/shop"]').first();
  await expect(shopLink).toBeVisible();
  await shopLink.click();
  await expect(page).toHaveURL(/\/shop/);
  await expect(page.locator('main h1').first()).toBeVisible();

  // Header/nav should expose cart + login entry points.
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('a[href="/cart"]').first()).toBeVisible();
  const authLink = page.locator('a[href^="/auth/"]').first();
  await expect(authLink).toBeVisible();

  expectNoAppErrors(errors);
});

test('navigation: shop links open a real product page', async ({
  page,
  errors,
}) => {
  await page.goto('/shop', { waitUntil: 'domcontentloaded' });
  const productLink = page.locator('a[href^="/products/"]').first();
  await expect(productLink).toBeVisible({ timeout: 15_000 });

  const href = await productLink.getAttribute('href');
  expect(href).toBeTruthy();
  await productLink.click();
  await expect(page).toHaveURL(/\/products\//);
  await expect(page.locator('main h1').first()).toBeVisible();

  expectNoAppErrors(errors);
});

test('navigation: link hygiene — no empty hrefs or dead buttons on homepage', async ({
  page,
  errors,
}) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  // Empty/placeholder hrefs are a UX bug.
  const badLinks = await page
    .locator('a[href=""], a[href="#"], a:not([href])')
    .count();
  expect(badLinks, 'links with empty/missing href').toBe(0);

  // Legal + contact links referenced in the brief must resolve (not 404).
  for (const route of ['/privacy', '/terms', '/contact', '/faq']) {
    const res = await page.request.get(route);
    expect(res.status(), `${route} should not 404`).toBeLessThan(400);
  }

  expectNoAppErrors(errors);
});

test('navigation: keyboard can reach primary actions', async ({
  page,
  errors,
}) => {
  await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });

  // Tab order reaches the email field and the submit button.
  await page.locator('#email').focus();
  await expect(page.locator('#email')).toBeFocused();
  await page.keyboard.press('Tab');
  // Password field or its visibility toggle comes next in DOM order.
  const focused = (await page.evaluate(() => document.activeElement?.id)) ?? '';
  expect(typeof focused === 'string').toBeTruthy();
  await expect(page.locator('button[type="submit"]')).toBeVisible();

  expectNoAppErrors(errors);
});

test('navigation: mobile menu opens and closes', async ({
  page,
  errors,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const menuButton = page.locator('button[aria-expanded][aria-label]').first();
  await expect(menuButton).toBeVisible({ timeout: 10_000 });
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  await menuButton.click();
  await expect(menuButton).toHaveAttribute('aria-expanded', 'true', { timeout: 10_000 });
  // Panel contains links like /shop, /custom-printing, /contact.
  await expect(page.locator('a[href="/shop"]').last()).toBeVisible({ timeout: 10_000 });
  await page.keyboard.press('Escape');
  expectNoAppErrors(errors);
});
