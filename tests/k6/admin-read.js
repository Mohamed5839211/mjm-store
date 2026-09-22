/*
 * Admin read-only load test — GET ONLY, low VUs (§7: 1-5 users).
 * No create/update/delete/permission/setting changes of any kind.
 * Admin session via env: ADMIN_EMAIL / ADMIN_PASSWORD (never logged).
 *
 * Run:
 *   k6 run -e STAGE=smoke -e ADMIN_EMAIL=... -e ADMIN_PASSWORD=... admin-read.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Counter } from 'k6/metrics';
import { BASE_URL, ADMIN_ENDPOINTS, JSON_HEADERS, stagesFor } from './config.js';

const adminRead = new Trend('admin_read_duration');
const failed = new Counter('failed_requests');
const serverErr = new Counter('server_errors');
const limited = new Counter('rate_limited_requests');
const timeouts = new Counter('timeouts');
const c2xx = new Counter('status_2xx');
const c4xx = new Counter('status_4xx');
const c5xx = new Counter('status_5xx');

export const options = {
  stages: stagesFor('admin-read'),
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
    checks: ['rate>0.95'],
    server_errors: ['count==0'],
  },
};

export function setup() {
  const email = __ENV.ADMIN_EMAIL;
  const password = __ENV.ADMIN_PASSWORD;
  if (!email || !password) throw new Error('ADMIN_EMAIL/ADMIN_PASSWORD env required');
  const res = http.post(
    `${BASE_URL}/auth/admin/login`,
    JSON.stringify({ emailOrPhone: email, password: password }),
    { headers: JSON_HEADERS, timeout: '15s' },
  );
  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`admin setup login failed with status ${res.status}`);
  }
  let body;
  try {
    body = res.json();
  } catch (e) {
    throw new Error('admin setup login returned non-JSON');
  }
  if (!body.accessToken) throw new Error('admin setup login response missing accessToken');
  return { token: body.accessToken };
}

export default function (data) {
  const headers = { ...JSON_HEADERS, Authorization: `Bearer ${data.token}` };
  const path = ADMIN_ENDPOINTS[Math.floor(Math.random() * ADMIN_ENDPOINTS.length)];
  const res = http.get(`${BASE_URL}${path}`, { headers, timeout: '15s', tags: { endpoint: path } });
  adminRead.add(res.timings.duration);
  const s = res.status;
  if (s >= 200 && s < 300) c2xx.add(1);
  else if (s === 429) { limited.add(1); c4xx.add(1); }
  else if (s >= 400 && s < 500) c4xx.add(1);
  else if (s >= 500) { c5xx.add(1); serverErr.add(1); }
  if (res.error && res.error.includes('timeout')) timeouts.add(1);

  const ok = check(res, {
    'status is 2xx': (r) => r.status >= 200 && r.status < 300,
    'no 5xx': (r) => r.status < 500,
  });
  if (!ok) failed.add(1);
  sleep(Math.random() * 0.8 + 0.4);
}
