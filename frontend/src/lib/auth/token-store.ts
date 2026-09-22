'use client';

import { AUTH_KEYS } from '@/constants/auth';

/**
 * Dual-session token storage.
 *
 * - CUSTOMER session (`mjm_token` / `mjm_user`): storefront only.
 * - ADMIN session (`mjm_admin_token` / `mjm_admin_user`): dashboard only.
 *
 * The two sessions never mix: an admin managing the store sees the public
 * "login" button like any visitor, and a customer session can never open
 * /admin. The HTTP client picks the store by request path.
 *
 * TOMORROW (backend phase): the backend will set HttpOnly + Secure +
 * SameSite cookies itself. When that happens only THIS module changes.
 */

interface SessionKeys {
  token: string;
  user: string;
  refreshToken: string;
  cookie: string;
  cookieMaxAgeDaysDefault: number;
}

const CUSTOMER_KEYS: SessionKeys = {
  token: AUTH_KEYS.TOKEN,
  user: AUTH_KEYS.USER,
  refreshToken: AUTH_KEYS.REFRESH_TOKEN,
  cookie: AUTH_KEYS.TOKEN,
  cookieMaxAgeDaysDefault: 7,
};

const ADMIN_KEYS: SessionKeys = {
  token: 'mjm_admin_token',
  user: 'mjm_admin_user',
  refreshToken: 'mjm_admin_refresh_token',
  cookie: 'mjm_admin_token',
  cookieMaxAgeDaysDefault: 30,
};

const isBrowser = typeof window !== 'undefined';

function readCookie(name: string): string | null {
  if (!isBrowser) return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export interface SessionStore {
  getAccessToken(): string | null;
  getStoredUser<T>(): T | null;
  save(token: string, userJson: string, cookieMaxAgeDays?: number): void;
  clear(): void;
}

function createSessionStore(keys: SessionKeys): SessionStore {
  return {
    getAccessToken(): string | null {
      if (!isBrowser) return null;
      return localStorage.getItem(keys.token);
    },

    getStoredUser<T>(): T | null {
      if (!isBrowser) return null;
      const raw = localStorage.getItem(keys.user);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        localStorage.removeItem(keys.token);
        localStorage.removeItem(keys.user);
        return null;
      }
    },

    save(token: string, userJson: string, cookieMaxAgeDays: number = keys.cookieMaxAgeDaysDefault): void {
      if (!isBrowser) return;
      localStorage.setItem(keys.token, token);
      localStorage.setItem(keys.user, userJson);
      // Mirror for the Edge proxy (non-HttpOnly until backend owns the cookie).
      document.cookie =
        `${keys.cookie}=${encodeURIComponent(token)}; path=/; ` +
        `max-age=${cookieMaxAgeDays * 24 * 3600}; samesite=lax`;
    },

    clear(): void {
      if (!isBrowser) return;
      localStorage.removeItem(keys.token);
      localStorage.removeItem(keys.user);
      localStorage.removeItem(keys.refreshToken);
      document.cookie = `${keys.cookie}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    },
  };
}

/** Storefront (customer) session. */
export const tokenStore = createSessionStore(CUSTOMER_KEYS);

/** Dashboard (admin) session. */
export const adminTokenStore = createSessionStore(ADMIN_KEYS);

/**
 * One-time upgrade: sessions created before the split stored admins under
 * the customer keys. Move such a session to the admin store so nobody gets
 * logged out by this refactor.
 */
export function migrateLegacyAdminSession<T extends { type?: string }>(): T | null {
  if (!isBrowser) return null;
  const raw = localStorage.getItem(CUSTOMER_KEYS.user);
  if (!raw) return null;
  try {
    const user = JSON.parse(raw) as T;
    if (user && user.type === 'admin') {
      const token = localStorage.getItem(CUSTOMER_KEYS.token);
      tokenStore.clear();
      if (token) adminTokenStore.save(token, raw);
      return user;
    }
  } catch {
    tokenStore.clear();
  }
  return null;
}
