/*
 * Authenticated read load test — customer session, GET only, no writes.
 * Login happens ONCE in setup(); VUs reuse the session (safe reuse).
 * Secrets via env: TEST_USER_EMAIL / TEST_USER_PASSWORD (never logged).
 * Also asserts session isolation: /auth/me must always return the same id.
 *
 * Run:
 *   k6 run -e STAGE=smoke -e TEST_USER_EMAIL=... -e TEST_USER_PASSWORD=... authenticated-read.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Counter } from 'k6/metrics';
import { BASE_URL, CUSTOMER_ENDPOINTS, JSON_HEADERS, stagesFor } from './config.js';

const apiAuth = new Trend('api_auth_duration');
const failed = new Counter('failed_requests');
const serverErr = new Counter('server_errors');
const limited = new Counter('rate_limited_requests');
const timeouts = new Counter('timeouts');
const c2xx = new Counter('status_2xx');
const c4xx = new Counter('status_4xx');
const c5xx = new Counter('status_5xx');
const isolationFails = new Counter('session_isolation_failures');

export const options = {
  stages: stagesFor('authenticated-read'),
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
    checks: ['rate>0.95'],
    server_errors: ['count==0'],
    session_isolation_failures: ['count==0'],
  },
};

export function setup() {
  const email = __ENV.TEST_USER_EMAIL;
  const password = __ENV.TEST_USER_PASSWORD;
  if (!email || !password) throw new Error('TEST_USER_EMAIL/TEST_USER_PASSWORD env required');
  const res = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ emailOrPhone: email, password: password }),
    { headers: JSON_HEADERS, timeout: '15s' },
  );
  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`setup login failed with status ${res.status} (credentials rejected or API down)`);
  }
  let body;
  try {
    body = res.json();
  } catch (e) {
    throw new Error('setup login returned non-JSON');
  }
  if (!body.accessToken || !body.user || body.user.id === undefined) {
    throw new Error('setup login response missing accessToken/user id');
  }
  return { token: body.accessToken, userId: body.user.id };
}

export default function (data) {
  const headers = { ...JSON_HEADERS, Authorization: `Bearer ${data.token}` };
  const path = CUSTOMER_ENDPOINTS[Math.floor(Math.random() * CUSTOMER_ENDPOINTS.length)];
  const res = http.get(`${BASE_URL}${path}`, { headers, timeout: '10s', tags: { endpoint: path } });
  apiAuth.add(res.timings.duration);
  const s = res.status;
  if (s >= 200 && s < 300) c2xx.add(1);
  else if (s === 429) { limited.add(1); c4xx.add(1); }
  else if (s === 401) c4xx.add(1); // session expired mid-run: counted, not fatal
  else if (s >= 400 && s < 500) c4xx.add(1);
  else if (s >= 500) { c5xx.add(1); serverErr.add(1); }
  if (res.error && res.error.includes('timeout')) timeouts.add(1);

  if (path === '/auth/me' && s === 200) {
    try {
      if (res.json().id !== data.userId) isolationFails.add(1);
    } catch (e) {
      isolationFails.add(1);
    }
  }
  const ok = check(res, {
    'status is 2xx': (r) => r.status >= 200 && r.status < 300,
    'no 5xx': (r) => r.status < 500,
  });
  if (!ok) failed.add(1);
  sleep(Math.random() * 0.5 + 0.2);
}
