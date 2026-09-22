'use client';

import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/client';
import {
  checkout,
  createAddress,
  deleteAddress,
  fetchAddresses,
  fetchAdminInvoices,
  fetchAdminOrders,
  fetchMyOrder,
  fetchMyOrders,
  fetchShippingZones,
  updateAddress,
} from '@/lib/api/commerce';
import type {
  Address,
  AddressPayload,
  CheckoutPayload,
  Invoice,
  Order,
  ShippingZone,
} from '@/types/commerce';
import type { Paginated } from '@/types/common';

/** Invalidate several caches after a mutation (lists + details). */
export function useInvalidate() {
  const client = useQueryClient();
  return (...keys: readonly unknown[]) => {
    for (const key of keys) void client.invalidateQueries({ queryKey: key as string[] });
  };
}

/* ---------------- Customer ---------------- */

export function useAddresses(): UseQueryResult<Address[]> {
  return useQuery({ queryKey: ['addresses'], queryFn: fetchAddresses });
}

export function useCreateAddress() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddressPayload) => createAddress(payload),
    onSuccess: () => { void client.invalidateQueries({ queryKey: ['addresses'] }); },
  });
}

export function useUpdateAddress() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<AddressPayload> }) =>
      updateAddress(id, payload),
    onSuccess: () => { void client.invalidateQueries({ queryKey: ['addresses'] }); },
  });
}

export function useDeleteAddress() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteAddress(id),
    onSuccess: () => { void client.invalidateQueries({ queryKey: ['addresses'] }); },
  });
}

export function useCheckout() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: CheckoutPayload) => checkout(payload),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.orders });
      void client.invalidateQueries({ queryKey: queryKeys.adminOrders });
    },
  });
}

export function useMyOrders(): UseQueryResult<Order[]> {
  return useQuery({ queryKey: queryKeys.orders, queryFn: fetchMyOrders });
}

export function useMyOrder(id: number | string | undefined): UseQueryResult<Order> {
  return useQuery({
    queryKey: queryKeys.order(id ?? 'unknown'),
    queryFn: () => fetchMyOrder(id as number | string),
    enabled: id !== undefined && id !== '',
  });
}

/* ---------------- Admin ---------------- */

export function useAdminOrders(): UseQueryResult<Paginated<Order>> {
  return useQuery({ queryKey: queryKeys.adminOrders, queryFn: fetchAdminOrders });
}

export function useAdminInvoices(): UseQueryResult<Paginated<Invoice>> {
  return useQuery({ queryKey: queryKeys.adminInvoices, queryFn: fetchAdminInvoices });
}

export function useShippingZones(): UseQueryResult<ShippingZone[]> {
  return useQuery({ queryKey: queryKeys.adminShipping, queryFn: fetchShippingZones });
}
