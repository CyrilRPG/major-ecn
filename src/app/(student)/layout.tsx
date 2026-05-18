import { requireUser } from '@/lib/auth/require-role';
import { ImpersonationBanner } from '@/components/impersonation-banner';
import { cookies } from 'next/headers';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  const cookieStore = await cookies();
  const isImpersonating = cookieStore.has('impersonator_id');
  const impersonatedName = cookieStore.get('impersonator_target_name')?.value;

  return (
    <div className="min-h-screen flex flex-col">
      {isImpersonating && <ImpersonationBanner targetName={impersonatedName} />}
      {children}
    </div>
  );
}
