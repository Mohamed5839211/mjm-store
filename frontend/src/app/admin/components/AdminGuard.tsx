'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/constants/auth';

/**
 * Blocks admin content until the session is hydrated AND verified as admin.
 * Children are never flashed to non-admins: a loader renders while checking,
 * then either content or a redirect. Navigation stays in the effect (external
 * system); the visible state is derived during render — no extra renders.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { adminUser, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  const allowed = !isLoading && !!adminUser && isAdmin;

  useEffect(() => {
    if (!isLoading && (!adminUser || !isAdmin)) {
      router.replace(ROUTES.ADMIN_LOGIN);
    }
  }, [adminUser, isAdmin, isLoading, router]);

  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center" role="status" aria-label="جاري التحقق">
        <Loader2 className="animate-spin text-primary dark:text-ink" size={36} />
      </div>
    );
  }

  return <>{children}</>;
}
