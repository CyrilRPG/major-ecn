import { cookies } from 'next/headers';
import { requireUser } from '@/lib/auth/require-role';
import { ImpersonationBanner } from '@/components/impersonation-banner';
import { AppShell } from '@/components/shell/app-shell';
import { getNavigatorTree } from '@/lib/data/navigator';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireUser();
  const cookieStore = await cookies();
  const isImpersonating = cookieStore.has('impersonator_id');
  const impersonatedName = cookieStore.get('impersonator_target_name')?.value;
  const tree = await getNavigatorTree(profile);

  return (
    <div className="flex h-screen flex-col">
      {isImpersonating && <ImpersonationBanner targetName={impersonatedName} />}
      <div className="min-h-0 flex-1">
        <AppShell profile={profile} tree={tree}>
          {children}
        </AppShell>
      </div>
    </div>
  );
}
