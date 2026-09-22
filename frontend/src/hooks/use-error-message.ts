'use client';

import { ApiError } from '@/lib/http/api-error';

/** Human-readable Arabic message from anything a query/mutation can throw. */
export function toErrorMessage(error: unknown, fallback = 'حدث خطأ غير متوقع'): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string') return error;
  return fallback;
}
