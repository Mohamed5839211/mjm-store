import { APIRequestContext } from '@playwright/test';

export const API_URL =
  process.env.PLAYWRIGHT_API_URL || 'http://localhost:3001/api/v1';

/** Fetch the first active product directly from the API (never hard-code IDs). */
export async function getFirstProduct(request: APIRequestContext) {
  const res = await request.get(`${API_URL}/products?limit=5`);
  if (!res.ok()) throw new Error(`GET /products failed: ${res.status()}`);
  const data = await res.json();
  const items = Array.isArray(data) ? data : data.items;
  if (!items?.length) throw new Error('No products returned by API');
  return items[0] as { id: number; name: string };
}

/** Fetch the first active category (provides real slugs for dynamic routes). */
export async function getFirstCategory(request: APIRequestContext) {
  const res = await request.get(`${API_URL}/categories`);
  if (!res.ok()) throw new Error(`GET /categories failed: ${res.status()}`);
  const data = await res.json();
  const items = Array.isArray(data) ? data : data.items;
  if (!items?.length) throw new Error('No categories returned by API');
  return items[0] as { id: number; slug: string; name: string };
}

/** Unique test user credentials — safe to re-run without collisions. */
export function uniqueTestUser() {
  const stamp = Date.now();
  return {
    name: 'Test User',
    email: `pwtest+${stamp}@example.com`,
    phone: `05${String(stamp).slice(-8)}`,
    password: 'TestPass1234',
  };
}
