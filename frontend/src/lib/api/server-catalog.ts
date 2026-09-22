/**
 * Server-side data fetching for catalog data.
 * These functions run on the server and fetch directly from the backend API.
 * They are used by Server Components to pre-render content in the initial HTML.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function serverFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    // Cache the response for 5 minutes
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return res.json();
}

export interface ServerCategory {
  id: number;
  slug: string;
  name: string;
  nameEn: string;
  description: string;
  icon: string;
  image: string;
  color: string;
  accent: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { products: number };
}

export interface ServerProductImage {
  id: number;
  productId: number;
  url: string;
  altText?: string | null;
  sortOrder: number;
}

export interface ServerProduct {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  price: string;
  discountPrice?: string | null;
  weight?: number | null;
  gallonCapacity?: number | null;
  stockQuantity: number;
  sku: string;
  isActive: boolean;
  isForB2bOnly: boolean;
  totalSold: number;
  searchIndex: string;
  createdAt: string;
  updatedAt: string;
  images: ServerProductImage[];
  category?: ServerCategory;
  offers: unknown[];
}

export interface ServerPaginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export async function fetchProductsServer(
  query: { page?: number; limit?: number; categoryId?: number; search?: string; sortBy?: string } = {}
): Promise<ServerPaginated<ServerProduct>> {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.categoryId) params.set('categoryId', String(query.categoryId));
  if (query.search) params.set('search', query.search);
  if (query.sortBy) params.set('sortBy', query.sortBy);
  const qs = params.toString();
  return serverFetch<ServerPaginated<ServerProduct>>(`/products${qs ? `?${qs}` : ''}`);
}

export async function fetchCategoriesServer(): Promise<ServerCategory[]> {
  return serverFetch<ServerCategory[]>('/categories');
}
