/**
 * Aucun identifiant dans une URL sur les pages d'authentification.
 *
 * Nos formulaires sont gérés par React (`onSubmit` + `preventDefault`), mais le
 * navigateur peut encore les soumettre lui-même : clic avant l'hydratation,
 * extension qui appelle `form.submit()`. Sans `method`, il les envoie en GET et
 * chaque champ nommé passe dans l'URL — `/login?email=…&password=…` : historique
 * du navigateur, journaux Vercel, en-tête Referer (constaté le 05/10/2026).
 *
 * Trois verrous :
 *  - les formulaires déclarent `method="post"` : les champs restent dans le corps ;
 *  - le middleware répond à ce POST natif par un 303 vers la même page en GET,
 *    sans jamais lire le corps ;
 *  - il purge les paramètres sensibles des URL déjà en circulation (favoris,
 *    historique) avant tout rendu — et avant la redirection des comptes déjà
 *    connectés vers /app, qui recopiait la query string.
 *
 * Le formulaire de contact passe par la même garde, avec sa propre liste de
 * champs : lib/formulaires-publics.ts.
 */

/** Pages qui portent un formulaire d'identification. */
export const PAGES_FORMULAIRE_AUTH: ReadonlySet<string> = new Set([
  '/login',
  '/forgot-password',
  '/auth/setup-password',
]);

/**
 * Noms de champ d'identification. Liste fermée : les liens d'activation
 * arrivent sur /auth/setup-password avec `code`, `error`, `error_code`… qui
 * doivent passer, et une simple sous-chaîne « pass » viserait aussi
 * `x-vercel-protection-bypass`.
 */
const PARAMETRE_SENSIBLE = /^e-?mail$|passw|^pwd$|^mdp$|mot.?de.?passe|^confirm/i;

export function estParametreSensible(nom: string): boolean {
  return PARAMETRE_SENSIBLE.test(nom);
}

/**
 * Retire de `url` (modifiée sur place) les paramètres sensibles — par défaut
 * ceux des pages d'authentification ; true s'il y en avait.
 */
export function purgerParametresSensibles(
  url: { searchParams: URLSearchParams },
  estSensible: (nom: string) => boolean = estParametreSensible,
): boolean {
  const sensibles = [...new Set(url.searchParams.keys())].filter((nom) => estSensible(nom));
  for (const nom of sensibles) url.searchParams.delete(nom);
  return sensibles.length > 0;
}

/**
 * Soumission native d'un formulaire : un POST qui n'est pas une action serveur.
 * Celles-ci arrivent avec l'en-tête `Next-Action` (JavaScript actif) ou en
 * multipart (sans JavaScript) : on les laisse à Next.
 */
export function estSoumissionNative(methode: string, enTetes: Headers): boolean {
  if (methode !== 'POST' || enTetes.has('next-action')) return false;
  return !(enTetes.get('content-type') ?? '').toLowerCase().startsWith('multipart/form-data');
}
