import { redirect } from 'next/navigation';

/** « Mot de passe oublié » côté arène : il n'y a pas de mot de passe, la connexion se fait par lien email. */
export default function ArenaForgotPasswordPage() {
  redirect('/arena/connexion?info=sans-mdp');
}
