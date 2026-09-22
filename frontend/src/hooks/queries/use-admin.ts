'use client';

import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/client';
import {
  fetchAdminCustomers,
  fetchSales,
  fetchSalesOverview,
  fetchStaff,
  fetchTopProducts,
  type SalesOverview,
  type SalesReport,
} from '@/lib/api/admin';
import type { SessionUser } from '@/types/auth';
import type { AdminStaffUser } from '@/types/auth';

export function useAdminCustomers(): UseQueryResult<SessionUser[]> {
  return useQuery({ queryKey: queryKeys.adminUsers, queryFn: fetchAdminCustomers });
}

export function useStaff(): UseQueryResult<AdminStaffUser[]> {
  return useQuery({ queryKey: queryKeys.adminStaff, queryFn: fetchStaff });
}

export function useSalesOverview(): UseQueryResult<SalesOverview> {
  return useQuery({ queryKey: ['admin', 'analytics', 'overview'], queryFn: fetchSalesOverview });
}

export function useSales(range = 'monthly'): UseQueryResult<SalesReport> {
  return useQuery({ queryKey: ['admin', 'analytics', 'sales', range], queryFn: () => fetchSales(range) });
}

export function useTopProducts(): UseQueryResult<Array<Record<string, unknown>>> {
  return useQuery({ queryKey: ['admin', 'analytics', 'top-products'], queryFn: fetchTopProducts });
}

export function useAdminMutation<TData, TVariables>(options: {
  mutationFn: (variables: TVariables) => Promise<TData>;
  invalidate?: readonly unknown[];
}) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: options.mutationFn,
    onSuccess: () => {
      for (const key of options.invalidate ?? []) {
        void client.invalidateQueries({ queryKey: key as string[] });
      }
    },
  });
}
