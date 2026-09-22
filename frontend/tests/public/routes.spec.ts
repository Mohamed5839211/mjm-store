import { test, expectNoAppErrors } from '../fixtures/base';
import { expect } from '@playwright/test';
import { hasFatalRender } from '../helpers/js-errors';

/**
 * Public static routes — discovered in src/app/(site) (flat list verified
 * against the filesystem; /categories/* redirects to /shop server-side, so
 * it is covered by the dynamic spec instead).
 */
const publicRoutes = [
  '/',
  '/about',
  '/auth/login',
  '/auth/register',
  '/bundles',
  '/cart',
  '/contact',
  '/custom-printing',
  '/faq',
  '/privacy',
  '/returns',
  '/shipping',
  '/shop',
  '/terms',
  '/water-subscriptions',
  '/mjm',
];

for (const route of publicRoutes) {
  test(`public route renders: ${route}`, async ({ page, errors }) => {
    const response = await page.goto(route, {
      waitUntil: 'domcontentloaded',
    });

    expect(response, `no response for ${route}`).not.toBeNull();
    expect(response!.status(), `${route} returned HTTP error`).toBeLessThan(
      400,
    );

    // Structural proof (not innerText): a heading, main landmark, or form.
    await expect(
      page.locator('main h1, main h2, main form, main a, main button').first(),
      `${route} has no primary content element`,
    ).toBeVisible({ timeout: 15_000 });

    // No Next.js error page and no white screen.
    expect(await hasFatalRender(page)).toBeNull();
    expectNoAppErrors(errors);
  });
}
