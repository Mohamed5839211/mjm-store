'use client';

import { QueryClient } from '@tanstack/react-query';

/**
 * Shared QueryClient with store-grade defaults:
 * - No refetch on window focus (admin dashboards stay put)
 * - One retry for queries, none for mutations (mutations retry explicitly)
 * - 30s stale time for reference data, overridden per-query where needed
 */
function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

let browserClient: QueryClient | undefined;

/** Singleton on the client, fresh instance per SSR request. */
export function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') return createQueryClient();
  browserClient ??= createQueryClient();
  return browserClient;
}

/** Centralized invalidation after mutations (e.g. ['products'] busts lists+details). */
export const queryKeys = {
  all: ['mjm'] as const,
  products: ['products'] as const,
  product: (id: number | string) => ['products', id] as const,
  categories: ['categories'] as const,
  bundles: ['bundles'] as const,
  offers: ['offers'] as const,
  cmsSettings: ['cms', 'settings'] as const,
  cmsContent: (key: string) => ['cms', key] as const,
  profile: ['profile'] as const,
  orders: ['orders'] as const,
  order: (id: number | string) => ['orders', id] as const,
  adminOrders: ['admin', 'orders'] as const,
  adminUsers: ['admin', 'users'] as const,
  adminStaff: ['admin', 'staff'] as const,
  adminProducts: ['admin', 'products'] as const,
  adminRequests: ['admin', 'requests'] as const,
  adminShipping: ['admin', 'shipping'] as const,
  adminInvoices: ['admin', 'invoices'] as const,
  adminCms: ['admin', 'cms'] as const,
} as const;
