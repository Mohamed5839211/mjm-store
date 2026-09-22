import { Skeleton } from '@/components/ui/Skeleton';

/** Global loading fallback for route transitions. */
export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-12 space-y-6" aria-busy="true" aria-label="جاري التحميل">
      <Skeleton className="h-10 w-2/3" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
