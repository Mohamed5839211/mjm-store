'use client';

import { http } from '@/lib/http/client';
import type { Paginated } from '@/types/common';
import type {
  Bundle,
  Category,
  CmsSettings,
  Offer,
  Product,
  ProductsQuery,
} from '@/types/catalog';

function toQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

/* ---------------- Products (public + admin share the same resource) ---------------- */

export function fetchProducts(query: ProductsQuery = {}): Promise<Paginated<Product>> {
  return http.get<Paginated<Product>>(
    `/products${toQuery({ page: query.page, limit: query.limit, categoryId: query.categoryId, search: query.search, sortBy: query.sortBy })}`,
    { anonymous: true },
  );
}

export function fetchProduct(id: number | string): Promise<Product> {
  return http.get<Product>(`/products/${id}`, { anonymous: true });
}

export function createProduct(payload: Record<string, unknown>): Promise<Product> {
  return http.post<Product>('/products', payload);
}

export function updateProduct(id: number, payload: Record<string, unknown>): Promise<Product> {
  return http.patch<Product>(`/products/${id}`, payload);
}

export function deleteProduct(id: number): Promise<{ success: boolean }> {
  return http.delete<{ success: boolean }>(`/products/${id}`);
}

/* ---------------- Categories ---------------- */

export function fetchCategories(): Promise<Category[]> {
  return http.get<Category[]>('/categories', { anonymous: true });
}

export function createCategory(payload: Record<string, unknown>): Promise<Category> {
  return http.post<Category>('/categories', payload);
}

export function updateCategory(id: number, payload: Record<string, unknown>): Promise<Category> {
  return http.patch<Category>(`/categories/${id}`, payload);
}

export function deleteCategory(id: number): Promise<{ success: boolean }> {
  return http.delete<{ success: boolean }>(`/categories/${id}`);
}

/* ---------------- Bundles ---------------- */

export function fetchBundles(): Promise<Bundle[]> {
  return http.get<Bundle[]>('/bundles', { anonymous: true });
}

export function fetchBundle(id: number | string): Promise<Bundle> {
  return http.get<Bundle>(`/bundles/${id}`, { anonymous: true });
}

export function createBundle(payload: Record<string, unknown>): Promise<Bundle> {
  return http.post<Bundle>('/bundles', payload);
}

export function updateBundle(id: number, payload: Record<string, unknown>): Promise<Bundle> {
  return http.patch<Bundle>(`/bundles/${id}`, payload);
}

export function deleteBundle(id: number): Promise<{ success: boolean }> {
  return http.delete<{ success: boolean }>(`/bundles/${id}`);
}

/* ---------------- Offers ---------------- */

export function fetchOffers(): Promise<Offer[]> {
  return http.get<Offer[]>('/offers', { anonymous: true });
}

export function createOffer(payload: Record<string, unknown>): Promise<Offer> {
  return http.post<Offer>('/offers', payload);
}

export function updateOffer(id: number, payload: Record<string, unknown>): Promise<Offer> {
  return http.patch<Offer>(`/offers/${id}`, payload);
}

export function deleteOffer(id: number): Promise<{ success: boolean }> {
  return http.delete<{ success: boolean }>(`/offers/${id}`);
}

/* ---------------- CMS (public) ---------------- */

export function fetchCmsSettings(): Promise<CmsSettings> {
  return http.get<CmsSettings>('/cms/settings', { anonymous: true });
}

export function fetchCmsPage(slug: string): Promise<unknown> {
  return http.get<unknown>(`/cms/pages/${slug}`, { anonymous: true });
}

/* ---------------- Media upload ---------------- */

export interface UploadedFile {
  url: string;
  filename?: string;
}

export function uploadImage(file: File): Promise<UploadedFile> {
  const form = new FormData();
  form.append('file', file);
  return http.upload<UploadedFile>('/media/upload', form);
}

export function uploadImages(files: File[]): Promise<UploadedFile[]> {
  const form = new FormData();
  for (const file of files) form.append('files', file);
  return http.upload<UploadedFile[]>('/media/upload-multiple', form);
}
