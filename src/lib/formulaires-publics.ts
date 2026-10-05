import type { NextRequest } from 'next/server';
import {
  PAGES_FORMULAIRE_AUTH,
  estParametreSensible,
  estSoumissionNative,
  purgerParametresSensibles,
} from '@/lib/auth/formulaires-auth';

/**
 * Aucune saisie dans une URL sur les pages publiques dont le formulaire, présent
 * dans le HTML serveur, porte des champs nommés : identification et contact.
 *
 * Avant l'hydratation, un clic soumet ce formulaire nativement ; sans `method`,
 * en GET : `/contact?first_name=…&email=…&phone=…&message=…` (constaté le
 * 05/10/2026) — historique, journaux Vercel, Referer, et `page_location` de
 * Google Tag Manager. Le middleware renvoie donc ces pages en GET (303), sans
 * jamais lire le corps, sur toute soumission native et sur toute URL qui porte
 * encore des champs du formulaire. Mécanisme : lib/auth/formulaires-auth.ts.
 *
 * Une liste fermée PAR page : `email` ne disparaît que des pages dont un
 * formulaire le saisit — ailleurs (pages admin filtrées par e-mail en GET), il
 * doit passer.
 */

/**
 * Champs nommés du formulaire de contact (components/marketing/contact-form.tsx),
 * plus la réponse que Turnstile insère dans son conteneur. `motif` (objet
 * présélectionné, cf. ETABLISSEMENT_LIEN), les utm_* et gclid passent.
 */
const CHAMPS_CONTACT: ReadonlySet<string> = new Set([
  'company', 'first_name', 'last_name', 'email', 'phone', 'objet', 'specialite', 'message',
  'cf-turnstile-response',
]);

export function estChampContact(nom: string): boolean {
  return CHAMPS_CONTACT.has(nom.toLowerCase());
}

/** Paramètres à retirer de l'URL de cette page ; null : page sans garde. */
export function parametresSensiblesDe(pathname: string): ((nom: string) => boolean) | null {
  if (PAGES_FORMULAIRE_AUTH.has(pathname)) return estParametreSensible;
  if (pathname === '/contact') return estChampContact;
  return null;
}

/**
 * URL vers laquelle renvoyer la requête en GET (303) — la même page, sans les
 * champs de son formulaire —, ou null si elle passe telle quelle.
 */
export function redirectionSansSaisie(
  requete: Pick<NextRequest, 'method' | 'headers' | 'nextUrl'>,
): NextRequest['nextUrl'] | null {
  const estSensible = parametresSensiblesDe(requete.nextUrl.pathname);
  if (!estSensible) return null;
  const url = requete.nextUrl.clone();
  const purgee = purgerParametresSensibles(url, estSensible);
  return purgee || estSoumissionNative(requete.method, requete.headers) ? url : null;
}
