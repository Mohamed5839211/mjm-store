import { TableSkeleton } from '@/components/ui/Skeleton';

/** Loading fallback for every admin route. */
export default function AdminLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="جاري تحميل لوحة التحكم">
      <TableSkeleton rows={6} cols={4} />
    </div>
  );
}
