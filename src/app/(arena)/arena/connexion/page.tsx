import Link from 'next/link';
import { KeyRound } from 'lucide-react';
import { Notice } from '@/components/arena/arena-shell';
import { AuthCard } from '@/components/arena/auth-card';
import { LoginForm } from '@/components/arena/login-form';
import { ARENA, BODY } from '@/components/arena/tokens';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Connexion — EVC Arena', robots: { index: false, follow: false } };

const ERRORS: Record<string, string> = {
  lien: 'Ce lien n’est plus valable (déjà utilisé ou incomplet). Demandez un nouveau lien de connexion ci-dessous.',
  expire: 'Ce lien de connexion a expiré (il est valable deux heures). Demandez-en un nouveau ci-dessous.',
  bloque: 'Ce compte a été suspendu par l’organisation. Contactez Major ECN si vous pensez qu’il s’agit d’une erreur.',
};

/**
 * Connexion par lien magique (sans mot de passe). Messages contextuels :
 * lien invalide ou expiré, compte suspendu, « mot de passe oublié » (il n'y a
 * pas de mot de passe), adresse déjà inscrite (renvoi depuis l'inscription).
 */
export default async function ArenaLoginPage({ searchParams }: { searchParams: Promise<{ erreur?: string; info?: string; deja?: string; e?: string }> }) {
  const { erreur, info, deja, e } = await searchParams;
  const alreadyRegistered = deja === '1';
  return (
    <AuthCard
      title={alreadyRegistered ? 'Vous êtes déjà inscrit' : 'Connexion'}
      lead={alreadyRegistered
        ? <>Cette adresse participe déjà au tournoi. Nous venons de lui envoyer un <strong style={{ color: ARENA.text }}>lien de connexion</strong> : ouvrez l’email et cliquez sur « Ouvrir mon espace ». Rien reçu ? Redemandez un lien ci-dessous.</>
        : <>Pas de mot de passe sur EVC Arena : indiquez l’adresse email de votre inscription, vous recevrez un lien de connexion valable deux heures.</>}
    >
      {erreur && ERRORS[erreur] && <Notice tone="red">{ERRORS[erreur]}</Notice>}
      {info === 'sans-mdp' && (
        <Notice tone="amber" icon={<KeyRound className="h-4 w-4" style={{ color: ARENA.warn }} />}>
          <strong>Mot de passe oublié ?</strong> Il n’y en a pas : EVC Arena vous connecte par un lien envoyé à votre adresse email. Indiquez-la ci-dessous.
        </Notice>
      )}
      <LoginForm defaultEmail={e ?? ''} />
      <p className="text-center text-[13px]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
        Pas encore inscrit ? <Link href="/arena" className="font-semibold underline-offset-4 hover:underline" style={{ color: ARENA.redSoft }}>Voir les tournois</Link>
      </p>
      <p className="text-center text-[12px]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
        Élève ou enseignant Major ECN ? La plateforme de cours a son propre accès : <Link href="/login" className="underline-offset-4 hover:underline" style={{ color: ARENA.textSoft }}>se connecter à la plateforme</Link>.
      </p>
    </AuthCard>
  );
}
