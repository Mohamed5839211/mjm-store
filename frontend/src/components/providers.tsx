'use client';

import React, { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { getQueryClient } from '@/lib/query/client';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

/**
 * Client-side providers, ordered innermost-last:
 * QueryClient > Auth (registers the global 401 handler) > Cart (reads CMS
 * settings via React Query) > ErrorBoundary > UI.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <ErrorBoundary>
            {children}
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3500,
                style: { fontFamily: 'inherit' },
              }}
            />
          </ErrorBoundary>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
