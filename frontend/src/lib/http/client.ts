'use client';

import { env } from '@/config/env';
import { adminTokenStore, tokenStore, type SessionStore } from '@/lib/auth/token-store';
import { ApiError } from '@/lib/http/api-error';
import { ROUTES } from '@/constants/auth';

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  /** JSON-serializable payload (automatically stringified). */
  json?: unknown;
  /** Raw body (FormData, Blob, …) — mutually exclusive with `json`. */
  rawBody?: BodyInit;
  /** Request timeout in ms. Default 15s. */
  timeoutMs?: number;
  /** Retry attempts on retryable failures. Default 2 (GET) / 0 (mutations). */
  retries?: number;
  /** Base delay for exponential backoff. Default 500ms. */
  retryDelayMs?: number;
  /** Skip the Authorization header even when a token exists. */
  anonymous?: boolean;
  /** Skip the global 401 → logout+redirect handling. */
  skipUnauthorizedRedirect?: boolean;
}

const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_RETRY_DELAY_MS = 500;

type UnauthorizedHandler = (target: string) => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

/**
 * Registered once by <AuthProvider/>. Receives the login route matching the
 * failed session (admin vs customer) so each session logs out independently.
 */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

/** Admin-only API namespaces — everything else uses the customer session. */
const ADMIN_PATH_PREFIXES = ['/admin/', '/analytics/', '/cms/admin/'];

function isAdminPath(path: string): boolean {
  return ADMIN_PATH_PREFIXES.some((prefix) => path === prefix.slice(0, -1) || path.startsWith(prefix));
}

/** Picks the session (and its login route) for a request path. */
export function sessionFor(path: string): { store: SessionStore; loginRoute: string } {
  return isAdminPath(path)
    ? { store: adminTokenStore, loginRoute: ROUTES.ADMIN_LOGIN }
    : { store: tokenStore, loginRoute: ROUTES.CUSTOMER_LOGIN };
}

function isMutation(method: string): boolean {
  return method !== 'GET' && method !== 'HEAD';
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const message = record.message;
    if (typeof message === 'string') return message;
    if (Array.isArray(message)) return message.map(String).join('، ');
  }
  return fallback;
}

function handleUnauthorized(store: SessionStore, skipRedirect: boolean, path: string): void {
  store.clear();
  if (skipRedirect || typeof window === 'undefined') return;
  if (unauthorizedHandler) {
    unauthorizedHandler(sessionFor(path).loginRoute);
    return;
  }
  const current = window.location.pathname;
  const target = sessionFor(path).loginRoute;
  if (current !== target) window.location.href = target;
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Single entry point for every API call.
 *
 * - Base URL from validated env
 * - `credentials: 'include'` (cookie-auth ready for the backend phase)
 * - Bearer injection from the token store
 * - Timeout via AbortController
 * - Exponential-backoff retries for GET/HEAD on network/429/5xx failures
 * - Throws typed {@link ApiError} on any non-2xx response
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    json,
    rawBody,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retryDelayMs = DEFAULT_RETRY_DELAY_MS,
    anonymous = false,
    skipUnauthorizedRedirect = false,
    headers: customHeaders,
    ...init
  } = options;

  const method = (init.method ?? 'GET').toUpperCase();
  const maxRetries = options.retries ?? (isMutation(method) ? 0 : 2);

  const headers = new Headers(customHeaders);
  let body: BodyInit | undefined;
  if (json !== undefined) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(json);
  } else if (rawBody !== undefined) {
    body = rawBody;
  }

  if (!anonymous) {
    const token = sessionFor(path).store.getAccessToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  let attempt = 0;
  // `lastError` is guaranteed to be assigned before the loop can exit via
  // `throw lastError`, because every iteration either returns, continues
  // (after assigning), or throws directly.
  let lastError: ApiError | null = null;

  while (attempt <= maxRetries) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(`${env.apiUrl}${path}`, {
        ...init,
        method,
        headers,
        body,
        credentials: 'include',
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.ok) {
        if (res.status === 204) return null as T;
        return (await parseBody(res)) as T;
      }

      const payload = await parseBody(res);
      const error = new ApiError(
        res.status,
        extractMessage(payload, `فشل الطلب (${res.status})`),
        payload,
      );

      if (error.isUnauthorized) {
        handleUnauthorized(sessionFor(path).store, skipUnauthorizedRedirect, path);
        throw error;
      }
      if (error.isRetryable && attempt < maxRetries) {
        lastError = error;
        await sleep(retryDelayMs * 2 ** attempt);
        attempt += 1;
        continue;
      }
      throw error;
    } catch (err) {
      clearTimeout(timer);
      if (err instanceof ApiError) throw err;
      const networkError = new ApiError(
        0,
        err instanceof DOMException && err.name === 'AbortError'
          ? 'انتهت مهلة الطلب، حاول مرة أخرى'
          : 'تعذر الاتصال بالخادم، تحقق من الإنترنت',
        err,
      );
      if (attempt < maxRetries) {
        lastError = networkError;
        await sleep(retryDelayMs * 2 ** attempt);
        attempt += 1;
        continue;
      }
      throw networkError;
    }
  }

  throw lastError ?? new ApiError(0, 'تعذر الاتصال بالخادم');
}

export const http = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, json?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', json }),
  patch: <T>(path: string, json?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', json }),
  put: <T>(path: string, json?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', json }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
  /** Multipart upload (lets the browser set the boundary). */
  upload: <T>(path: string, form: FormData, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', rawBody: form }),
};

/**
 * Download a binary file (PDF, …) with auth. Triggers a browser download
 * when `filename` is provided, otherwise returns the Blob.
 */
export async function downloadBlob(path: string, filename?: string): Promise<Blob> {
  const { store, loginRoute } = sessionFor(path);
  const headers = new Headers();
  const token = store.getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60_000);
  try {
    const res = await fetch(`${env.apiUrl}${path}`, {
      headers,
      credentials: 'include',
      signal: controller.signal,
    });
    if (res.status === 401) {
      store.clear();
      if (unauthorizedHandler) unauthorizedHandler(loginRoute);
      else if (typeof window !== 'undefined') window.location.href = loginRoute;
      throw new ApiError(401, 'انتهت الجلسة، سجل الدخول مرة أخرى');
    }
    if (!res.ok) throw new ApiError(res.status, 'فشل تحميل الملف');
    const blob = await res.blob();
    if (filename && typeof window !== 'undefined') {
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(anchor);
    }
    return blob;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(0, 'تعذر تحميل الملف، تحقق من الاتصال');
  } finally {
    clearTimeout(timer);
  }
}
