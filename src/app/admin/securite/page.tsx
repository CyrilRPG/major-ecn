import { ShieldCheck } from 'lucide-react';
import { requireStaff } from '@/lib/auth/require-role';
import { etatMfa } from '@/lib/auth/mfa';
import { accesEquipeExpire, lireScopeEquipe } from '@/lib/auth/collaborateurs';
import { MfaPanel } from '@/components/admin/securite/mfa-panel';

export const metadata = { title: 'Sécurité du compte' };
export const dynamic = 'force-dynamic';

/**
 * Sécurité du compte (cahier des charges 18/09/2026, §8) : double
 * authentification par application (TOTP) et date de fin d'accès. Ouverte à
 * tout le personnel ; l'administrateur peut rendre la 2FA obligatoire pour un
 * collaborateur depuis « Équipe & Permissions ».
 */
export default async function SecuritePage({ searchParams }: { searchParams: Promise<{ obligatoire?: string }> }) {
  const { profile, isAdmin } = await requireStaff();
  const { obligatoire } = await searchParams;
  const etat = await etatMfa(profile);
  const scope = isAdmin ? null : lireScopeEquipe(profile.permission_scope);
  const finAcces = profile.role === 'professor' ? (profile.access_end ?? null) : null;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="mb-6 border-b border-(--color-border) pb-5">
        <p className="text-xs font-medium text-(--color-ink-muted)">Administration</p>
        <h1 className="mt-1 flex items-center gap-2 text-xl font-semibold tracking-tight text-(--color-ink)">
          <ShieldCheck className="h-5 w-5 text-[#16793C]" /> Sécurité du compte
        </h1>
        <p className="mt-0.5 text-sm text-(--color-ink-soft)">
          Double authentification et durée de votre accès.
        </p>
      </header>

      {obligatoire === '1' && etat.facteurs.length === 0 && (
        <p className="mb-5 rounded-xl border border-[#F3B5BC] bg-[#FCEAEC] px-4 py-3 text-sm font-semibold text-[#A91D2C]">
          La double authentification est obligatoire pour votre compte : activez-la ci-dessous pour accéder à l’administration.
        </p>
      )}

      <MfaPanel
        facteurs={etat.facteurs}
        niveau={etat.niveau}
        obligatoire={etat.obligatoire || (!!scope && scope.mfa_obligatoire)}
      />

      <section className="mt-6 rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
        <h2 className="text-sm font-bold text-(--color-ink)">Durée de l’accès</h2>
        {finAcces ? (
          <p className="mt-1 text-sm text-(--color-ink-soft)">
            Votre accès prend fin le{' '}
            <strong className="text-(--color-ink)">
              {new Date(finAcces).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </strong>
            {accesEquipeExpire(profile) ? ' — il est expiré.' : '.'}
          </p>
        ) : (
          <p className="mt-1 text-sm text-(--color-ink-soft)">
            {isAdmin ? 'Compte administrateur : sans date de fin.' : 'Aucune date de fin n’est fixée pour votre accès.'}
          </p>
        )}
      </section>
    </main>
  );
}
