import { chromium, FullConfig } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Global setup: logs in as admin ONCE and stores the session in
 * playwright/.auth/admin.json. All admin specs reuse this file via
 * `test.use({ storageState })` — never log in before each test.
 *
 * Credentials come from env vars:
 *   PLAYWRIGHT_ADMIN_EMAIL (default: admin@mjm.com — local seed only)
 *   PLAYWRIGHT_ADMIN_PASSWORD (default: adminPassword123 — local seed only)
 *
 * NOTE: defaults exist only for local dev against the seed DB.
 * In CI set real secrets via environment variables.
 */
async function globalSetup(config: FullConfig) {
  const baseURL =
    (config.projects[0]?.use?.baseURL as string | undefined) ||
    process.env.PLAYWRIGHT_BASE_URL ||
    'http://localhost:3002';

  const adminEmail = process.env.PLAYWRIGHT_ADMIN_EMAIL || 'admin@mjm.com';
  const adminPassword =
    process.env.PLAYWRIGHT_ADMIN_PASSWORD || 'adminPassword123';

  const authPath = path.join(__dirname, '..', 'playwright', '.auth', 'admin.json');
  fs.mkdirSync(path.dirname(authPath), { recursive: true });

  // Reuse a fresh session if the file is recent (<10m) — avoids hammering
  // the login throttle while respecting JWT expiry (15m / 2h for admin).
  // Check both file age and token exp to avoid reusing an expired JWT.
  try {
    const stat = fs.statSync(authPath);
    const ageOk = Date.now() - stat.mtimeMs < 10 * 60 * 1000;
    if (ageOk) {
      const raw = fs.readFileSync(authPath, 'utf8');
      const data = JSON.parse(raw);
      const token = data?.origins?.[0]?.localStorage?.find((x: { name: string }) => x.name === 'mjm_admin_token')?.value as string | undefined;
      let expOk = true;
      if (token) {
        try {
          const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
          if (payload?.exp) expOk = payload.exp * 1000 > Date.now() + 60_000;
        } catch {}
      }
      if (expOk) {
        console.log('[global-setup] Reusing existing admin session');
        return;
      }
      console.log('[global-setup] Admin token expired — re-logging in');
    }
  } catch {
    // No existing session — continue to login.
  }

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(`${baseURL}/mjm`, { waitUntil: 'domcontentloaded' });

    // Actual selectors verified in src/app/(site)/mjm/page.tsx
    await page.locator('#admin-email').fill(adminEmail);
    await page.locator('#admin-password').fill(adminPassword);

    await page.locator('form button[type="submit"]').click();

    // Admin login redirects client-side to /admin.
    await page.waitForURL(/\/admin/, { timeout: 30_000 });

    await context.storageState({ path: authPath });
    console.log(`[global-setup] Admin session saved to ${authPath}`);
  } catch (err) {
    console.error(
      '[global-setup] Admin login failed. ' +
        'Check that backend (:3001) + frontend (:3002) are running and ' +
        'PLAYWRIGHT_ADMIN_EMAIL/PASSWORD are correct.',
    );
    throw err;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
