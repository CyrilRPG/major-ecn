import { requireAdmin } from '@/lib/auth/require-role';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

export const metadata = { title: 'Administration' };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireAdmin();
  return (
    <div className="min-h-screen flex">
      <AdminSidebar profile={profile} />
      <div className="flex-1 min-w-0 bg-(--color-surface-soft)">{children}</div>
    </div>
  );
}
