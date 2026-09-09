import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AccessSubmit } from '@/components/arena/access-submit';
import { AuthCard } from '@/components/arena/auth-card';
import { LoginForm } from '@/components/arena/login-form';
import { ARENA, BODY } from '@/components/arena/tokens';
import { activeArenaSpace, lookupConfirmationToken } from '@/lib/arena/auth-links';
import { confirmEmailAction } from './actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Confirmation de votre adresse — EVC Arena', robots: { index: false, follow: false } };

/**
 * Atterrissage du lien de confirmation (§3.2). Le GET n'a aucun effet : les
 * antivirus de messagerie « cliquent » les liens avant l'utilisateur. Un bouton
 * confirme (action serveur), puis ouvre l'espace participant.
 */
export default async function ConfirmLandingPage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t } = await searchParams;
  const found = await lookupConfirmationToken(t ?? '');

  if (found.status !== 'blocked') {
    const space = await activeArenaSpace(found.status === 'ok' ? found.participant.id : undefined);
    if (space) redirect(space);
  }

  if (found.status !== 'ok') {
    return (
      <AuthCard
        title={found.status === 'blocked' ? 'Compte suspendu' : found.status === 'expired' ? 'Votre lien a expiré' : 'Reprendre la connexion'}
        lead={found.status === 'blocked'
          ? 'Ce compte a été suspendu par l’organisation. Contactez Major ECN si vous pensez qu’il s’agit d’une erreur.'
          : 'Ce lien n’est plus disponible. Indiquez l’adresse de votre inscription pour recevoir un nouvel accès à votre Arena.'}
      >
        {found.status !== 'blocked' && <LoginForm />}
        <p className="text-center text-[13px]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
          Pas encore inscrit ? <Link href="/arena" className="font-semibold underline-offset-4 hover:underline" style={{ color: ARENA.redSoft }}>Voir les tournois</Link>
        </p>
      </AuthCard>
    );
  }

  const { participant: p, tournament } = found;
  const already = Boolean(p.email_confirmed_at);
  return (
    <AuthCard
      title={already ? 'Adresse déjà confirmée' : 'Confirmez votre adresse'}
      lead={<>
        {already ? 'Votre adresse est déjà confirmée.' : <>Bonjour {p.first_name}, confirmez votre adresse <strong className="break-words [overflow-wrap:anywhere]" style={{ color: ARENA.text }}>{p.email}</strong> pour ouvrir votre espace.</>}
        <span className="mt-2 block text-[12.5px]" style={{ color: ARENA.textMuted }}>{tournament.title} · pseudonyme « {p.pseudo} »</span>
      </>}
    >
      <form action={confirmEmailAction}>
        <input type="hidden" name="t" value={t} />
        <AccessSubmit>{already ? 'Ouvrir mon espace' : 'Confirmer mon adresse'}</AccessSubmit>
      </form>
      <p className="text-center text-[12px]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
        Cette confirmation authentifie votre compte. Elle ne vaut pas consentement à recevoir les informations de Major ECN.
      </p>
    </AuthCard>
  );
}
