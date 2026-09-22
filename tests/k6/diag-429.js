/*
 * Diagnostic (temporary): per-endpoint 429 distribution at 5 VUs / 90s.
 * Uses tag-filtered thresholds so the summary JSON carries per-endpoint
 * http_req_failed + p95. No auth, GET only, localhost only.
 */
import http from 'k6/http';
import { sleep } from 'k6';
import { BASE_URL, PUBLIC_ENDPOINTS } from './config.js';

export const options = {
  stages: [
    { duration: '20s', target: 5 },
    { duration: '60s', target: 5 },
    { duration: '10s', target: 0 },
  ],
  thresholds: Object.fromEntries(
    PUBLIC_ENDPOINTS.map((ep) => [`http_req_failed{endpoint:${ep}}`, ['rate<1']]),
  ),
};

export default function () {
  const path = PUBLIC_ENDPOINTS[Math.floor(Math.random() * PUBLIC_ENDPOINTS.length)];
  http.get(`${BASE_URL}${path}`, { timeout: '10s', tags: { endpoint: path } });
  sleep(0.45);
}
