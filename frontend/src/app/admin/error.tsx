'use client';

import { AlertTriangle } from 'lucide-react';

/** Error fallback scoped to the admin area. */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center">
      <AlertTriangle className="text-secondary" size={40} />
      <h1 className="text-xl font-black text-primary dark:text-ink">تعذر تحميل هذه الصفحة</h1>
      <p className="text-gray-500 dark:text-muted text-sm">
        {process.env.NODE_ENV === 'development' ? error.message : 'حاول مرة أخرى.'}
      </p>
      <button
        onClick={reset}
        className="bg-primary text-white py-2.5 px-6 rounded-2xl font-bold hover:opacity-90"
      >
        حاول مرة أخرى
      </button>
    </div>
  );
}
