'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import AnnouncementBar from '@/components/site/AnnouncementBar';
import DynamicBranding from '@/components/site/DynamicBranding';

/**
 * Public-site chrome (header/footer/nav). Rendered by the `(site)` group
 * layout so the admin area and the root layout stay clean.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin') || pathname?.startsWith('/mjm');

  if (isAdmin) {
    return <main className="flex-grow">{children}</main>;
  }

  return (
    <>
      <div role="region" aria-label="شريط الإعلانات">
        <DynamicBranding />
        <AnnouncementBar />
      </div>
      <Header />
      <main className="flex-grow pt-36 lg:pt-40 pb-16 lg:pb-0">{children}</main>
      <Footer />
      <BottomNav />
    </>
  );
}
