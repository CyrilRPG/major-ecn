import 'server-only';
import { createHash, randomBytes } from 'node:crypto';

/**
 * Liens sécurisés des questionnaires envoyés par e-mail (§8.1, §9) : le jeton
 * n'est JAMAIS stocké en clair (seule son empreinte SHA-256 l'est) ; il expire ;
 * il ne donne accès qu'à SON questionnaire, sans ouvrir de session.
 */

export function nouveauJeton(): { jeton: string; hash: string } {
  const jeton = randomBytes(32).toString('base64url');
  return { jeton, hash: hacherJeton(jeton) };
}

export function hacherJeton(jeton: string): string {
  return createHash('sha256').update(jeton).digest('hex');
}

export function jetonValideFormat(jeton: string): boolean {
  return /^[A-Za-z0-9_-]{40,60}$/.test(jeton);
}
