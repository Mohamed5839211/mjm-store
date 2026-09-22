'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

/** Global error boundary fallback for route segments. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
      <AlertTriangle className="text-secondary" size={48} />
      <h1 className="text-2xl font-black text-primary dark:text-ink">حدث خطأ غير متوقع</h1>
      <p className="text-gray-500 dark:text-muted max-w-md">
        {process.env.NODE_ENV === 'development' ? error.message : 'حاول تحديث الصفحة أو العودة لاحقاً.'}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="bg-primary text-white py-3 px-8 rounded-2xl font-bold hover:opacity-90"
        >
          حاول مرة أخرى
        </button>
        <Link
          href="/"
          className="border border-primary/20 text-primary dark:text-ink py-3 px-8 rounded-2xl font-bold hover:bg-primary/5"
        >
          الرئيسية
        </Link>
      </div>
    </div>
  );
}
