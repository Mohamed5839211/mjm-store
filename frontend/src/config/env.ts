import { z } from 'zod';

/**
 * Validated runtime environment.
 *
 * - Fails fast with a clear message when a required variable is malformed.
 * - `NEXT_PUBLIC_API_URL` falls back to the local backend ONLY in development,
 *   so a missing variable can never silently point production at localhost.
 */
const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
});

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NODE_ENV: process.env.NODE_ENV,
});

if (!parsed.success) {
  throw new Error(
    `Invalid environment variables: ${parsed.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join(', ')}`,
  );
}

// Narrowed after the guard above (kept outside resolveApiUrl so closures see it).
const envValues = parsed.data;

const FALLBACK_API_URL = 'http://localhost:3001/api/v1';

function resolveApiUrl(): string {
  const fromEnv = envValues.NEXT_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'NEXT_PUBLIC_API_URL is required in production (refusing to fall back to localhost).',
    );
  }
  return FALLBACK_API_URL;
}

export const env = {
  apiUrl: resolveApiUrl(),
  apiRoot: resolveApiUrl().replace(/\/api\/v1$/, ''),
  isDev: process.env.NODE_ENV !== 'production',
  isProd: process.env.NODE_ENV === 'production',
} as const;
