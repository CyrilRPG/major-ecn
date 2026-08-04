import { requireStaff } from '@/lib/auth/require-role';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { UserMenu } from '@/components/user-menu';

export const metadata = { title: 'Administration' };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireStaff();
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AdminSidebar profile={profile} />
      <div className="flex min-w-0 flex-1 flex-col bg-(--color-surface-soft)">
        <header className="flex h-16 shrink-0 items-center justify-end gap-3 border-b border-(--color-border) bg-(--color-surface) px-4">
          <UserMenu profile={profile} />
        </header>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
