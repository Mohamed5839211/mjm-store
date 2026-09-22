/*
 * Login load test — deliberately LIGHT (§6: login is throttled 100/min).
 * Mix per iteration: valid login (env creds) + wrong-password 401 (expected).
 * 401/429 are control-flow here: judged via checks + counters, and the
 * http_req_failed threshold is set with that expectation documented.
 * No token, password, or body is ever logged.
 *
 * Run:
 *   k6 run -e STAGE=smoke -e TEST_USER_EMAIL=... -e TEST_USER_PASSWORD=... login.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Counter } from 'k6/metrics';
import { BASE_URL, JSON_HEADERS, stagesFor } from './config.js';

const loginDur = new Trend('login_duration');
const serverErr = new Counter('server_errors');
const limited = new Counter('rate_limited_requests');
const timeouts = new Counter('timeouts');
const c2xx = new Counter('status_2xx');
const c401 = new Counter('expected_401');
const c429 = new Counter('expected_429');
const c5xx = new Counter('status_5xx');
const leak = new Counter('secret_leak_indicators');

export const options = {
  stages: stagesFor('login'),
  thresholds: {
    // Design: every iteration performs 1 valid login + 1 wrong-password
    // probe, so ~50% http_req_failed is EXPECTED control-flow (401s), plus
    // possible 429s under the 100/min login throttle. Real pass/fail comes
    // from checks + server_errors + secret_leak_indicators below.
    http_req_failed: ['rate<0.55'],
    http_req_duration: ['p(95)<1500'],
    checks: ['rate>0.95'],
    server_errors: ['count==0'],
    secret_leak_indicators: ['count==0'],
  },
};

export default function () {
  const email = __ENV.TEST_USER_EMAIL;
  const password = __ENV.TEST_USER_PASSWORD;
  if (!email || !password) throw new Error('TEST_USER_EMAIL/TEST_USER_PASSWORD env required');

  // 1) valid login
  let res = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ emailOrPhone: email, password: password }),
    { headers: JSON_HEADERS, timeout: '15s', tags: { case: 'valid' } },
  );
  loginDur.add(res.timings.duration);
  tally(res, 'valid');
  check(res, {
    'valid login: 2xx': (r) => r.status === 200 || r.status === 201,
    'valid login: no 5xx': (r) => r.status < 500,
    'valid login: no secret field names': (r) =>
      !/passwordHash|JWT_SECRET|REFRESH_SECRET|private/i.test(r.body || ''),
  });

  // 2) wrong password -> 401 expected (never a transport/5xx failure)
  res = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ emailOrPhone: email, password: 'WrongPass-0000' }),
    { headers: JSON_HEADERS, timeout: '15s', tags: { case: 'wrong-password' } },
  );
  tally(res, 'wrong');
  check(res, {
    'wrong password: 401': (r) => r.status === 401,
    'wrong password: no 5xx': (r) => r.status < 500,
    'wrong password: password not echoed': (r) => !(r.body || '').includes('WrongPass-0000'),
  });
  sleep(1);
}

function tally(res, label) {
  const s = res.status;
  if (s >= 200 && s < 300) c2xx.add(1);
  else if (s === 401) c401.add(1);
  else if (s === 429) { c429.add(1); limited.add(1); }
  else if (s >= 500) { c5xx.add(1); serverErr.add(1); }
  if (res.error && res.error.includes('timeout')) timeouts.add(1);
  const body = res.body || '';
  if (/passwordHash|JWT_SECRET|REFRESH_SECRET/i.test(body)) leak.add(1);
}
