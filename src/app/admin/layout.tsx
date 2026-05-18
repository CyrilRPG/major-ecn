import { requireAdmin } from '@/lib/auth/require-role';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

export const metadata = { title: 'Administration' };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireAdmin();
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AdminSidebar profile={profile} />
      <div className="min-w-0 flex-1 bg-(--color-surface-soft)">{children}</div>
    </div>
  );
}
