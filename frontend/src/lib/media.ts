import { env } from '@/config/env';

const FRONTEND_ASSET_PREFIXES = ['/categories/', '/assets/', '/images/'] as const;

/**
 * Resolve a backend file path/URL to an absolute URL the browser can load.
 * Returns null for empty input. Leaves absolute http(s) URLs untouched and
 * keeps known frontend-local assets relative.
 */
export function getMediaUrl(url?: string | null): string | null {
  if (!url) return null;

  let cleanUrl = url;
  if (url.startsWith(env.apiRoot)) {
    cleanUrl = url.slice(env.apiRoot.length);
  }
  if (cleanUrl.startsWith('http')) return cleanUrl;

  const normalized = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
  if (FRONTEND_ASSET_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
    return normalized;
  }
  return `${env.apiRoot}${normalized}`;
}
