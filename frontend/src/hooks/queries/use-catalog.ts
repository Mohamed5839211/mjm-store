'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/client';
import {
  fetchBundle,
  fetchBundles,
  fetchCategories,
  fetchCmsSettings,
  fetchOffers,
  fetchProduct,
  fetchProducts,
} from '@/lib/api/catalog';
import type {
  Bundle,
  Category,
  CmsSettings,
  Offer,
  Product,
  ProductsQuery,
} from '@/types/catalog';
import type { Paginated } from '@/types/common';

export function useProducts(query: ProductsQuery = {}): UseQueryResult<Paginated<Product>> {
  const { page = 1, limit = 20, categoryId, search, sortBy } = query;
  return useQuery({
    queryKey: [...queryKeys.products, { page, limit, categoryId, search, sortBy }],
    queryFn: () => fetchProducts({ page, limit, categoryId, search, sortBy }),
  });
}

export function useProduct(id: number | string | undefined): UseQueryResult<Product> {
  return useQuery({
    queryKey: queryKeys.product(id ?? 'unknown'),
    queryFn: () => fetchProduct(id as number | string),
    enabled: id !== undefined && id !== '',
  });
}

export function useCategories(): UseQueryResult<Category[]> {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: fetchCategories,
    staleTime: 5 * 60_000,
  });
}

export function useBundles(): UseQueryResult<Bundle[]> {
  return useQuery({
    queryKey: queryKeys.bundles,
    queryFn: fetchBundles,
  });
}

export function useBundle(id: number | string | undefined): UseQueryResult<Bundle> {
  return useQuery({
    queryKey: ['bundles', id ?? 'unknown'],
    queryFn: () => fetchBundle(id as number | string),
    enabled: id !== undefined && id !== '',
  });
}

export function useOffers(): UseQueryResult<Offer[]> {
  return useQuery({
    queryKey: queryKeys.offers,
    queryFn: fetchOffers,
  });
}

export function useCmsSettings(): UseQueryResult<CmsSettings> {
  return useQuery({
    queryKey: queryKeys.cmsSettings,
    queryFn: fetchCmsSettings,
    staleTime: 5 * 60_000,
  });
}
