"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ROUTES } from '@/constants/auth';
import { setUnauthorizedHandler } from '@/lib/http/client';
import { adminTokenStore, migrateLegacyAdminSession, tokenStore } from '@/lib/auth/token-store';
import { fetchMe } from '@/lib/api/auth';
import type { SessionUser } from '@/types/auth';

interface AuthContextType {
  /** Storefront (customer) session — the ONLY session the public site sees. */
  user: SessionUser | null;
  /** Dashboard (admin) session — invisible to the storefront. */
  adminUser: SessionUser | null;
  /** Customer token (compat). */
  token: string | null;
  loginCustomer: (token: string, user: SessionUser, cookieMaxAgeDays?: number) => void;
  loginAdmin: (token: string, user: SessionUser, cookieMaxAgeDays?: number) => void;
  /** @deprecated use loginCustomer — kept so old call sites keep compiling. */
  login: (token: string, user: SessionUser, cookieMaxAgeDays?: number) => void;
  logout: (redirectTo?: string) => void;
  logoutAdmin: (redirectTo?: string) => void;
  /** Re-fetch the customer profile and sync it into state + storage. */
  refreshUser: () => Promise<void>;
  isLoading: boolean;
  isAdmin: boolean;
  isCustomer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [adminUser, setAdminUser] = useState<SessionUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mount hydration from browser storage (an external system unavailable
  // during SSR). Migrates pre-split admin sessions to the admin store.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const legacyAdmin = migrateLegacyAdminSession<SessionUser>();
    setToken(tokenStore.getAccessToken());
    setUser(tokenStore.getStoredUser<SessionUser>());
    setAdminUser(legacyAdmin ?? adminTokenStore.getStoredUser<SessionUser>());
    setIsLoading(false);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    // Global 401 policy per session kind: drop only that session, then send
    // the user to its own login page.
    setUnauthorizedHandler((target: string) => {
      if (target === ROUTES.ADMIN_LOGIN) {
        setAdminUser(null);
      } else {
        setToken(null);
        setUser(null);
      }
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (path !== target) window.location.href = target;
      }
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const loginCustomer = (newToken: string, newUser: SessionUser, cookieMaxAgeDays = 7) => {
    setToken(newToken);
    setUser(newUser);
    tokenStore.save(newToken, JSON.stringify(newUser), cookieMaxAgeDays);
  };

  const loginAdmin = (newToken: string, newUser: SessionUser, cookieMaxAgeDays = 30) => {
    setAdminUser(newUser);
    adminTokenStore.save(newToken, JSON.stringify(newUser), cookieMaxAgeDays);
  };

  const logout = (redirectTo?: string) => {
    setToken(null);
    setUser(null);
    tokenStore.clear();
    if (typeof window !== 'undefined') {
      window.location.href = redirectTo ?? ROUTES.CUSTOMER_LOGIN;
    }
  };

  const logoutAdmin = (redirectTo?: string) => {
    setAdminUser(null);
    adminTokenStore.clear();
    if (typeof window !== 'undefined') {
      window.location.href = redirectTo ?? ROUTES.ADMIN_LOGIN;
    }
  };

  const refreshUser = async () => {
    try {
      const fresh = await fetchMe();
      setUser(fresh);
      const currentToken = tokenStore.getAccessToken();
      if (currentToken) {
        tokenStore.save(currentToken, JSON.stringify(fresh), 7);
      }
    } catch {
      // 401s are handled globally; other errors keep the stale session.
    }
  };

  const isAdmin = !!adminUser;
  const isCustomer = !!user && !isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        adminUser,
        token,
        loginCustomer,
        loginAdmin,
        login: loginCustomer,
        logout,
        logoutAdmin,
        refreshUser,
        isLoading,
        isAdmin,
        isCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
