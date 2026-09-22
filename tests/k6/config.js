/*
 * MJM Store — k6 shared config (localhost only, test DB only).
 *
 * Safety:
 * - BASE_URL is hard-coded to localhost; any other host aborts the run.
 * - No destructive endpoints are referenced anywhere in tests/k6.
 * - Secrets arrive ONLY via `k6 -e ...` env vars and are never logged,
 *   never added to tags, and never appear in --summary-export JSON.
 */
export const BASE_URL = __ENV.K6_BASE_URL || 'http://localhost:3001/api/v1';

if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(BASE_URL + '/')) {
  throw new Error('k6 safety guard: BASE_URL must be localhost, got: ' + BASE_URL);
}

// Stage presets (§8). Selected per run with: k6 -e STAGE=smoke|baseline|medium|high|login-peak
export const STAGES = {
  smoke: [{ duration: '30s', target: 1 }],
  baseline: [
    { duration: '1m', target: 5 },
    { duration: '2m', target: 5 },
    { duration: '30s', target: 0 },
  ],
  medium: [
    { duration: '2m', target: 10 },
    { duration: '5m', target: 10 },
    { duration: '1m', target: 0 },
  ],
  high: [
    { duration: '3m', target: 25 },
    { duration: '5m', target: 25 },
    { duration: '30s', target: 0 },
  ],
  // Login-specific peak (§6: max 10 users, short — login is throttled 100/min).
  'login-peak': [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 10 },
    { duration: '30s', target: 0 },
  ],
};

export function stagesFor(name) {
  const key = __ENV.STAGE || 'smoke';
  const s = STAGES[key];
  if (!s) throw new Error('Unknown STAGE: ' + key + ' (scenario ' + name + ')');
  return s;
}

// Approved read-only public endpoints (verified 200 without auth).
export const PUBLIC_ENDPOINTS = [
  '/products',
  '/products?limit=5',
  '/products/4',
  '/categories',
  '/bundles',
  '/offers',
  '/cms/home',
  '/cms/settings',
  '/cms/pages/home',
];

// Protected read endpoints (customer session).
export const CUSTOMER_ENDPOINTS = [
  '/auth/me',
  '/addresses',
  '/orders',
  '/cart',
  '/water-subscriptions',
  '/support-tickets',
];

// Admin read-only endpoints (admin session, GET only).
export const ADMIN_ENDPOINTS = [
  '/admin/customers',
  '/admin/orders',
  '/admin/invoices',
  '/admin/shipping-zones',
  '/admin/contact',
  '/analytics/overview',
];

export const JSON_HEADERS = { 'Content-Type': 'application/json' };

// 401/429 are EXPECTED control-flow in negative cases: k6 counts any
// non-2xx/3xx into http_req_failed, so pass/fail is judged via `check()`
// plus the explicit counters below — never via http_req_failed alone.
export function statusCounters(prefix) {
  // Created per-file with file-local Metric objects (see scenario files).
  return prefix;
}
