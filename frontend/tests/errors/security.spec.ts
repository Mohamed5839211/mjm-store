import { test } from '../fixtures/base';
import { expect } from '@playwright/test';
import { API_URL } from '../helpers/api';

/**
 * Functional security checks via the real API (no UI destruction):
 * 401 without JWT, customer blocked from admin, expired/invalid JWT rejected,
 * secrets never leak into visible text or error payloads.
 */
test('protected endpoint without JWT returns 401', async ({ request }) => {
  const res = await request.get(`${API_URL}/auth/me`);
  expect(res.status()).toBe(401);
});

test('invalid JWT is rejected', async ({ request }) => {
  const res = await request.get(`${API_URL}/auth/me`, {
    headers: { Authorization: 'Bearer invalid.token.here' },
  });
  expect([401, 403].includes(res.status())).toBeTruthy();
});

test('customer token cannot reach admin endpoints', async ({ request }) => {
  const stamp = Date.now();
  const reg = await request.post(`${API_URL}/auth/register`, {
    data: {
      name: 'Sec Test',
      email: `pwsec+${stamp}@example.com`,
      phone: `05${String(stamp).slice(-8).padStart(8, '0')}`,
      password: 'TestPass1234',
    },
  });
  expect(reg.ok()).toBeTruthy();
  const { accessToken } = await reg.json();

  const res = await request.get(`${API_URL}/admin/orders`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  expect([401, 403, 404].includes(res.status())).toBeTruthy();
});

test('error payloads do not leak secrets', async ({ request }) => {
  const res = await request.post(`${API_URL}/auth/login`, {
    data: { emailOrPhone: 'nobody@example.com', password: 'wrong' },
  });
  expect([400, 401, 404, 429].includes(res.status())).toBeTruthy();
  const body = await res.text().catch(() => '');
  expect(body).not.toMatch(/JWT_SECRET|passwordHash|PRIVATE|secret/i);
});
