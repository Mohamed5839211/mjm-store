/** Catalog domain: products, categories, bundles, offers. */

export interface ProductImage {
  id: number;
  productId: number;
  url: string;
  altText: string | null;
  sortOrder: number;
}

export interface Category {
  id: number;
  slug: string;
  name: string;
  nameEn: string | null;
  description: string | null;
  icon: string | null;
  image: string | null;
  color: string | null;
  accent: string | null;
  order: number;
  isActive: boolean;
  _count?: { products: number };
}

export interface ProductOffer {
  id: number;
  type: string;
  discountValue: number | string;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  categoryId: number | null;
  price: number | string;
  discountPrice: number | string | null;
  weight: number | string | null;
  gallonCapacity: number | string | null;
  stockQuantity: number;
  sku: string;
  isActive: boolean;
  isForB2bOnly: boolean;
  totalSold: number;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
  category: Category | null;
  offers: ProductOffer[];
}

export interface ProductsQuery {
  page?: number;
  limit?: number;
  categoryId?: number;
  search?: string;
  /** Backend sorting hint (e.g. createdAt_desc, best_selling). Passed through as-is. */
  sortBy?: string;
}

export interface BundleItem {
  id: number;
  bundleId: number;
  productId: number;
  quantity: number;
  product?: Product;
}

export interface Bundle {
  id: number;
  name: string;
  description: string | null;
  bundlePrice: number | string;
  originalPrice: number | string;
  badgeText: string | null;
  imageUrl: string | null;
  isActive: boolean;
  items: BundleItem[];
}

export interface Offer {
  id: number;
  type: string;
  discountValue: number | string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  offerProducts?: {
    productId: number;
    product?: { name?: string; images?: { url: string }[] } | null;
  }[];
}

export interface CmsSettings {
  currency?: string;
  storeName?: string;
  announcement?: string | null;
  [key: string]: unknown;
}
