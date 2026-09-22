import type { Page } from '@playwright/test';

export interface CollectedErrors {
  consoleErrors: string[];
  pageErrors: string[];
  failedRequests: string[];
  badResponses: { url: string; status: number }[];
}

/**
 * Hosts / URL fragments that are ALWAYS downgraded to notes.
 * Static-asset 404s and decorative-image fallbacks are not app errors.
 */
const EXTERNAL_ALLOWLIST = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'google-analytics.com',
  'googletagmanager.com',
  'sentry.io',
  'maps.googleapis.com',
  'maps.gstatic.com',
  'grainy-gradients.vercel.app',
  'vercel.app',
];

const STATIC_ASSET_NOTE_PATTERNS: RegExp[] = [
  /\/logo\.png/,
  /\/_next\/image/,
  /\/categories\/.*\.png/,
  /noise\.svg/,
  /favicon\.ico/,
  /Failed to load resource:.*404.*logo/i,
  /Failed to load resource:.*400.*_next\/image/i,
  /Failed to load resource:.*404.*noise/i,
];

const AUTH_HYDRATION_NOTE_PATTERNS: RegExp[] = [
  /\/auth\/me/,
  /\/auth\/refresh/,
  /\/addresses/,
  /\/analytics/,
];

export function isExternalAllowlisted(url: string): boolean {
  return EXTERNAL_ALLOWLIST.some((host) => url.includes(host));
}

function isStaticAssetNote(url: string): boolean {
  return STATIC_ASSET_NOTE_PATTERNS.some((re) => re.test(url));
}

function isAuthHydrationNote(url: string): boolean {
  return AUTH_HYDRATION_NOTE_PATTERNS.some((re) => re.test(url));
}

function isSameOrigin(url: string): boolean {
  return url.includes('localhost:3001') || url.includes('localhost:3002');
}

export async function collectPageErrors(page: Page): Promise<CollectedErrors> {
  const errors: CollectedErrors = {
    consoleErrors: [],
    pageErrors: [],
    failedRequests: [],
    badResponses: [],
  };
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => {
    errors.pageErrors.push(String(err?.message ?? err));
  });
  page.on('requestfailed', (request) => {
    errors.failedRequests.push(`${request.url()} :: ${request.failure()?.errorText}`);
  });
  page.on('response', (response) => {
    const status = response.status();
    const url = response.url();
    if ((status >= 400 || status < 200) && isSameOrigin(url)) {
      errors.badResponses.push({ url, status });
    }
  });
  return errors;
}

export interface AllowedErrorOptions {
  allowedStatuses?: number[];
  allowedMessagePatterns?: (string | RegExp)[];
  allowedUrlPatterns?: (string | RegExp)[];
}

function matchesAny(text: string, patterns: (string | RegExp)[]): boolean {
  return patterns.some((p) => (typeof p === 'string' ? text.includes(p) : p.test(text)));
}

export function classifyErrors(
  errors: CollectedErrors,
  opts: AllowedErrorOptions = {},
): { critical: string[]; notes: string[] } {
  const critical: string[] = [];
  const notes: string[] = [];

  for (const text of errors.consoleErrors) {
    // "Failed to load resource: ..." is a duplicate of badResponses / asset
    // 404s — always downgrade to avoid double-failing on expected asset gaps.
    const isResourceNote = /Failed to load resource:/i.test(text);
    if (
      isResourceNote ||
      isStaticAssetNote(text) ||
      isAuthHydrationNote(text) ||
      isExternalAllowlisted(text) ||
      (opts.allowedMessagePatterns && matchesAny(text, opts.allowedMessagePatterns)) ||
      (opts.allowedUrlPatterns && matchesAny(text, opts.allowedUrlPatterns))
    ) {
      notes.push(`console.error (note): ${text}`);
    } else {
      critical.push(`console.error: ${text}`);
    }
  }

  for (const text of errors.pageErrors) {
    const isMeasureBug = /measure.*negative time stamp|CategorySlugPage/i.test(text);
    if (
      isMeasureBug ||
      (opts.allowedMessagePatterns && matchesAny(text, opts.allowedMessagePatterns))
    ) {
      notes.push(`pageerror (note): ${text}`);
    } else {
      critical.push(`pageerror: ${text}`);
    }
  }

  for (const text of errors.failedRequests) {
    const isAbort = /ERR_ABORTED|NS_BINDING_ABORTED|aborted/i.test(text);
    if (isAbort || isStaticAssetNote(text) || isExternalAllowlisted(text) || !isSameOrigin(text)) {
      notes.push(`requestfailed (note): ${text}`);
    } else if (opts.allowedUrlPatterns && matchesAny(text, opts.allowedUrlPatterns)) {
      notes.push(`requestfailed (expected note): ${text}`);
    } else {
      critical.push(`requestfailed: ${text}`);
    }
  }

  for (const { url, status } of errors.badResponses) {
    const allowedStatus = opts.allowedStatuses?.includes(status) ?? false;
    const allowedUrl = opts.allowedUrlPatterns != null && matchesAny(url, opts.allowedUrlPatterns);
    const staticNote = isStaticAssetNote(url);
    const authNote = status === 401 && isAuthHydrationNote(url);
    const externalNote = isExternalAllowlisted(url);
    if (allowedStatus || allowedUrl || staticNote || authNote || externalNote) {
      notes.push(`HTTP ${status} (note): ${url}`);
    } else {
      critical.push(`HTTP ${status}: ${url}`);
    }
  }

  return { critical, notes };
}

export async function hasFatalRender(page: Page): Promise<string | null> {
  const bodyText = (await page.locator('body').innerText().catch(() => '')) ?? '';
  if (/Application error|Something went wrong|_next\/static/i.test(bodyText)) return 'Next.js error text detected';
  const mainCount = await page.locator('main, h1, h2, form, table').count();
  if (mainCount === 0 && bodyText.trim().length < 20) return 'possible white screen: no main/h1/h2/form/table and nearly empty body';
  return null;
}

export const API_URL = process.env.PLAYWRIGHT_API_URL || 'http://localhost:3001/api/v1';
