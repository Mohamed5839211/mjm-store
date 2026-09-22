"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getMediaUrl } from '@/lib/media';
import { useCmsSettings } from '@/hooks/queries/use-catalog';
import type { AddToCartInput, LocalCartItem } from '@/types/commerce';

interface CartContextType {
  items: LocalCartItem[];
  addToCart: (input: AddToCartInput, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
  currency: string;
  formatPrice: (price: number | string) => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'mjm_cart';

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}

function sanitize(raw: unknown): LocalCartItem[] {
  if (!Array.isArray(raw)) return [];
  const items: LocalCartItem[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const record = entry as Record<string, unknown>;
    if (typeof record.name !== 'string') continue;
    const price = typeof record.price === 'number' ? record.price : Number(record.price);
    const quantity = typeof record.quantity === 'number' ? record.quantity : Number(record.quantity);
    if (!Number.isFinite(price) || !Number.isFinite(quantity)) continue;
    items.push({
      id: typeof record.id === 'string' ? record.id : newId(),
      productId: typeof record.productId === 'number' ? record.productId : undefined,
      bundleId: typeof record.bundleId === 'number' ? record.bundleId : undefined,
      name: record.name,
      price,
      discountPrice:
        typeof record.discountPrice === 'number' && Number.isFinite(record.discountPrice)
          ? record.discountPrice
          : null,
      quantity: Math.max(1, Math.floor(quantity)),
      image: getMediaUrl(typeof record.image === 'string' ? record.image : null),
      category: typeof record.category === 'string' ? record.category : undefined,
    });
  }
  return items;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<LocalCartItem[]>([]);
  const { data: settings } = useCmsSettings();

  const currency = settings?.currency ?? 'ر.س';
  const hydrated = React.useRef(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(sanitize(JSON.parse(stored)));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      hydrated.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage full or unavailable — cart simply won't persist.
    }
  }, [items]);

  const formatPrice = (price: number | string): string => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    const safe = Number.isFinite(num) ? num : 0;
    return `${safe.toFixed(2)} ${currency}`;
  };

  const addToCart = (input: AddToCartInput, quantity = 1) => {
    const qty = Math.max(1, Math.floor(quantity));
    setItems((prev) => {
      const match = (item: LocalCartItem): boolean =>
        input.kind === 'bundle' ? item.bundleId === input.bundleId : item.productId === input.productId;
      const existing = prev.find(match);
      if (existing) {
        return prev.map((item) =>
          match(item) ? { ...item, quantity: item.quantity + qty } : item,
        );
      }
      const base =
        input.kind === 'bundle'
          ? {
              productId: undefined,
              bundleId: input.bundleId,
              name: input.name,
              price: input.price,
              discountPrice: null as number | null,
              image: input.image ?? null,
              category: 'بكج',
            }
          : {
              productId: input.productId,
              bundleId: undefined,
              name: input.name,
              price: input.price,
              discountPrice: input.discountPrice ?? null,
              image: input.image ?? null,
              category: input.category,
            };
      return [...prev, { ...base, id: newId(), quantity: qty }];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item,
      ),
    );
  };

  const clearCart = () => setItems([]);

  const value = useMemo<CartContextType>(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + (item.discountPrice ?? item.price) * item.quantity,
      0,
    );
    return {
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      subtotal,
      itemCount: items.length,
      currency,
      formatPrice,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, currency]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
