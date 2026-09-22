import { z } from 'zod';

/**
 * Validated application configuration. Fails fast at boot with a clear
 * message instead of crashing later with `undefined` secrets.
 */
const configSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(16, 'JWT_REFRESH_SECRET must be at least 16 characters'),
  JWT_EXPIRATION: z.string().default('1h'),
  JWT_REFRESH_EXPIRATION: z.string().default('30d'),
  FRONTEND_URL: z.string().url().optional(),
  /**
   * Extra CORS origins (comma-separated, no trailing slash).
   * Example: "https://shop.example.com,https://admin.example.com"
   */
  ALLOWED_ORIGINS: z.string().optional(),
  /**
   * Set to "true" to force-enable Swagger even in production
   * (default: enabled in development/test, disabled in production).
   */
  DOCS_ENABLED: z.string().optional(),
  /** Public base URL used to build absolute media links (no localhost leak). */
  PUBLIC_URL: z.string().url().default('http://localhost:3001'),
});

export type AppConfig = z.infer<typeof configSchema>;

let cached: AppConfig | null = null;

export function getAppConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  if (cached) return cached;
  const parsed = configSchema.safeParse(env);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    throw new Error(`Invalid environment configuration: ${details}`);
  }
  cached = parsed.data;
  return cached;
}

/** Test-only hook to reset the cache between cases. */
export function resetAppConfigCache(): void {
  cached = null;
}
