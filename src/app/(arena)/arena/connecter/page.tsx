import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AccessSubmit } from '@/components/arena/access-submit';
import { AuthCard } from '@/components/arena/auth-card';
import { LoginForm } from '@/components/arena/login-form';
import { ARENA, BODY } from '@/components/arena/tokens';
import { activeArenaSpace, lookupLoginToken } from '@/lib/arena/auth-links';
import { loginWithTokenAction } from './actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Connexion — EVC Arena', robots: { index: false, follow: false } };

/**
 * Atterrissage du lien de connexion (lien magique). Le GET n'a aucun effet :
 * les antivirus de messagerie ouvrent les liens avant l'utilisateur. Un bouton
 * ouvre la session (action serveur). Lien expiré ou inconnu : nouveau lien.
 */
export default async function LoginLandingPage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t } = await searchParams;
  const found = await lookupLoginToken(t ?? '');

  // Un lien déjà utilisé reste une entrée vers l'espace dans le navigateur connecté.
  // Un lien valide d'un autre participant conserve son propre parcours de connexion.
  if (found.status !== 'blocked') {
    const space = await activeArenaSpace(found.status === 'ok' ? found.participant.id : undefined);
    if (space) redirect(space);
  }

  if (found.status !== 'ok') {
    const titles = { unknown: 'Reprendre la connexion', expired: 'Votre lien a expiré', blocked: 'Compte suspendu' } as const;
    const leads = {
      unknown: 'Ce lien n’est plus disponible. Indiquez l’adresse de votre inscription pour recevoir un nouvel accès à votre Arena.',
      expired: 'Les liens de connexion sont valables deux heures. Vous pouvez en demander un nouveau ci-dessous.',
      blocked: 'Ce compte a été suspendu par l’organisation. Contactez Major ECN si vous pensez qu’il s’agit d’une erreur.',
    } as const;
    return (
      <AuthCard title={titles[found.status]} lead={leads[found.status]}>
        {found.status !== 'blocked' && <LoginForm />}
        <p className="text-center text-[13px]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
          Pas encore inscrit ? <Link href="/arena" className="font-semibold underline-offset-4 hover:underline" style={{ color: ARENA.redSoft }}>Voir les tournois</Link>
        </p>
      </AuthCard>
    );
  }

  const { participant: p, tournament } = found;
  return (
    <AuthCard
      title="Bienvenue dans l’arène"
      slug={tournament.slug}
      lead={<>
        Bonjour {p.first_name}, votre lien de connexion est valide.
        <span className="mt-2 block text-[12.5px]" style={{ color: ARENA.textMuted }}>{tournament.title} · pseudonyme « {p.pseudo} »</span>
      </>}
    >
      <form action={loginWithTokenAction}>
        <input type="hidden" name="t" value={t} />
        <AccessSubmit>Ouvrir mon espace</AccessSubmit>
      </form>
    </AuthCard>
  );
}
