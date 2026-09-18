import { KeyRound } from 'lucide-react';
import { redirect } from 'next/navigation';
import { requireStaff } from '@/lib/auth/require-role';
import { etatMfa } from '@/lib/auth/mfa';
import { MfaVerifier } from '@/components/admin/securite/mfa-verifier';

export const metadata = { title: 'Vérification 2FA' };
export const dynamic = 'force-dynamic';

/**
 * Saisie du code de double authentification : élève la session au niveau
 * AAL2, puis renvoie vers la page demandée. Sans facteur enrôlé ou session
 * déjà vérifiée, il n'y a rien à faire ici.
 */
export default async function VerifierMfaPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { profile } = await requireStaff();
  const { next } = await searchParams;
  const cible = next && next.startsWith('/admin') && !next.startsWith('/admin/securite/verifier') ? next : '/admin';
  const etat = await etatMfa(profile);
  if (etat.facteurs.length === 0 || etat.niveau === 'aal2') redirect(cible);

  return (
    <main className="mx-auto flex w-full max-w-md flex-col px-4 py-12">
      <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-soft)">
        <h1 className="flex items-center gap-2 text-lg font-bold text-(--color-ink)">
          <KeyRound className="h-5 w-5 text-[#16793C]" /> Vérification en deux étapes
        </h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">
          Saisissez le code à six chiffres affiché par votre application d’authentification.
        </p>
        <MfaVerifier factorId={etat.facteurs[0].id} next={cible} />
      </div>
    </main>
  );
}
