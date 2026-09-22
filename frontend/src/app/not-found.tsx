import Link from 'next/link';
import { PackageSearch } from 'lucide-react';

/** Global 404 page. */
export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
      <PackageSearch className="text-secondary" size={48} />
      <h1 className="text-4xl font-black text-primary dark:text-ink">404</h1>
      <p className="text-gray-500 dark:text-muted">الصفحة التي تبحث عنها غير موجودة.</p>
      <Link
        href="/"
        className="bg-primary text-white py-3 px-8 rounded-2xl font-bold hover:opacity-90"
      >
        العودة للرئيسية
      </Link>
    </div>
  );
}
