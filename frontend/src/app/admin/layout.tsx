import AdminSidebar from './components/AdminSidebar';
import { AdminGuard } from './components/AdminGuard';

export const metadata = {
  title: 'لوحة تحكم MJM',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex bg-gray-50/50 dark:bg-white/5 min-h-screen" dir="rtl">
        <AdminSidebar />
        <main className="flex-grow p-8 lg:p-12 overflow-y-auto">{children}</main>
      </div>
    </AdminGuard>
  );
}
