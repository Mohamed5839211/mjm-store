import type { APIRequestContext, Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { API_URL } from './api';

export interface CustomerSession {
  email: string;
  password: string;
  accessToken: string;
  user: unknown;
}

const CUSTOMER_AUTH_PATH = path.join(
  __dirname,
  '..',
  '..',
  'playwright',
  '.auth',
  'customer.json',
);

let cached: CustomerSession | null = null;

/**
 * Register ONE unique customer per run via the API and cache it.
 * Subsequent calls reuse the same session — no repeated logins.
 * Safe to re-run: each run creates a fresh unique email (timestamped).
 */
export async function ensureCustomerSession(
  request: APIRequestContext,
): Promise<CustomerSession> {
  if (cached) return cached;

  const stamp = Date.now();
  const payload = {
    name: 'Playwright Test',
    email: `pwtest+${stamp}@example.com`,
    phone: `05${String(stamp).slice(-8).padStart(8, '0')}`,
    password: 'TestPass1234',
  };

  const res = await request.post(`${API_URL}/auth/register`, {
    data: payload,
  });
  if (!res.ok()) {
    const body = await res.text().catch(() => '');
    throw new Error(
      `customer register failed: ${res.status()} ${body.slice(0, 300)}`,
    );
  }
  const data = await res.json();

  cached = {
    email: payload.email,
    password: payload.password,
    accessToken: data.accessToken,
    user: data.user,
  };

  // Persist a Playwright storageState so specs can also use
  // test.use({ storageState }) if desired.
  try {
    fs.mkdirSync(path.dirname(CUSTOMER_AUTH_PATH), { recursive: true });
    const storageState = {
      cookies: [],
      origins: [
        {
          origin: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3002',
          localStorage: [
            { name: 'mjm_token', value: data.accessToken },
            { name: 'mjm_user', value: JSON.stringify(data.user) },
          ],
        },
      ],
    };
    fs.writeFileSync(CUSTOMER_AUTH_PATH, JSON.stringify(storageState));
  } catch {
    // Non-fatal: in-memory session still works via seedCustomerSession().
  }

  return cached;
}

/**
 * Seed an already-created customer session into the browser so the app
 * hydrates as logged-in without going through the UI login form.
 */
export async function seedCustomerSession(page: Page, session: CustomerSession) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(
    ({ token, user }) => {
      localStorage.setItem('mjm_token', token);
      localStorage.setItem('mjm_user', JSON.stringify(user));
      document.cookie = `mjm_token=${encodeURIComponent(token)}; path=/; samesite=lax`;
    },
    { token: session.accessToken, user: session.user },
  );
}

export function customerAuthPath(): string {
  return CUSTOMER_AUTH_PATH;
}
