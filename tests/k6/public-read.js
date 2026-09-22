/*
 * Public read load test — GET only, no auth, no writes.
 * Endpoints: products / categories / bundles / offers / public CMS.
 * Thresholds (§9, preliminary): http_req_failed<1%, p95<1000ms,
 * p99<2000ms, checks>95%.
 *
 * Run (from D:\mjm\MJM-main\tests\k6):
 *   k6 run -e STAGE=smoke public-read.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Counter } from 'k6/metrics';
import { BASE_URL, PUBLIC_ENDPOINTS, stagesFor } from './config.js';

const apiRead = new Trend('api_read_duration');
const failed = new Counter('failed_requests');
const serverErr = new Counter('server_errors');
const limited = new Counter('rate_limited_requests');
const timeouts = new Counter('timeouts');
const c2xx = new Counter('status_2xx');
const c4xx = new Counter('status_4xx');
const c5xx = new Counter('status_5xx');

export const options = {
  stages: stagesFor('public-read'),
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
    checks: ['rate>0.95'],
    server_errors: ['count==0'],
  },
};

export default function () {
  const path = PUBLIC_ENDPOINTS[Math.floor(Math.random() * PUBLIC_ENDPOINTS.length)];
  const res = http.get(`${BASE_URL}${path}`, { timeout: '10s', tags: { endpoint: path } });
  apiRead.add(res.timings.duration);
  const s = res.status;
  if (s >= 200 && s < 300) c2xx.add(1);
  else if (s === 429) { limited.add(1); c4xx.add(1); }
  else if (s >= 400 && s < 500) c4xx.add(1);
  else if (s >= 500) { c5xx.add(1); serverErr.add(1); }
  if (res.error && res.error.includes('timeout')) timeouts.add(1);

  const ok = check(res, {
    'status is 2xx': (r) => r.status >= 200 && r.status < 300,
    'no 5xx': (r) => r.status < 500,
    'fast enough (p99 budget)': (r) => r.timings.duration < 2000,
  });
  if (!ok) failed.add(1);
  sleep(Math.random() * 0.5 + 0.2);
}
