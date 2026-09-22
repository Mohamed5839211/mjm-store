'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

/** Legacy route: /categories/[slug] forwards to the shop anchor (client redirect to avoid server measure bug). */
export default function CategorySlugPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  useEffect(() => {
    const slug = params?.slug;
    router.replace(slug ? `/shop#${slug}` : '/shop');
  }, [params, router]);
  // Render a stable placeholder to avoid layout shift (null → content = CLS).
  return <main className="min-h-screen bg-[#F8FAFC] dark:bg-background" />;
}
