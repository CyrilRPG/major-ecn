import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireStaff } from '@/lib/auth/require-role';
import { exigenceMfa } from '@/lib/auth/mfa';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { UserMenu } from '@/components/user-menu';
import { ImpersonationBanner } from '@/components/impersonation-banner';

export const metadata = { title: 'Administration' };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireStaff();

  // Double authentification (cahier des charges 18/09/2026, §8) : une session
  // dont le facteur est enrôlé mais pas vérifié va saisir son code ; un compte
  // pour lequel la 2FA est obligatoire mais pas encore activée va l'activer.
  const h = await headers();
  const pathname = h.get('x-pathname') ?? '';
  const exigence = await exigenceMfa(profile, pathname);
  if (exigence === 'verifier') redirect(`/admin/securite/verifier?next=${encodeURIComponent(pathname || '/admin')}`);
  if (exigence === 'activer') redirect('/admin/securite?obligatoire=1');

  // « Se connecter en tant que » un membre de l'équipe : le bandeau de retour
  // doit exister aussi dans l'administration, pas seulement en vue élève.
  const cookieStore = await cookies();
  const impersonating = cookieStore.has('impersonator_id');
  const impersonatedName = cookieStore.get('impersonator_target_name')?.value;

  return (
    <div className="flex min-h-screen flex-col">
      {impersonating && <ImpersonationBanner targetName={impersonatedName} />}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <AdminSidebar profile={profile} />
        <div className="flex min-w-0 flex-1 flex-col bg-(--color-surface-soft)">
          <header className="flex h-16 shrink-0 items-center justify-end gap-3 border-b border-(--color-border) bg-(--color-surface) px-4">
            <UserMenu profile={profile} />
          </header>
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
