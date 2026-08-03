'use client';

import { createClient } from '@/lib/supabase/client';

/**
 * Jeton d'accès frais, côté navigateur, pour les appels qui ne DOIVENT pas
 * échouer.
 *
 * POURQUOI. Les routes serveur lisent l'identité dans les cookies. Or le
 * middleware ne rafraîchit la session que sur les routes qu'il considère
 * protégées (`/cours`, `/admin`, …) : `/api/emargement` et `/api/presences`
 * n'en font pas partie, et il sort avant tout appel Supabase. Sur une page
 * laissée ouverte pendant une longue vidéo — deux heures pour une séance
 * approfondie — plus aucune navigation ne vient donc réécrire le cookie. Le
 * jeton d'accès y expire au bout d'une heure, et l'émargement se voyait
 * répondre « Non authentifié » alors que la session était parfaitement saine.
 *
 * Le client navigateur, lui, détient toujours la session à jour et sait la
 * renouveler. On lui demande le jeton juste avant l'appel, et on l'envoie en
 * `Authorization: Bearer` — la route accepte les deux (cf. getRequestUser).
 * Le cookie périmé n'a alors plus aucune conséquence.
 */

/**
 * Renvoie un jeton d'accès valide, en renouvelant la session si besoin.
 * `null` si l'utilisateur n'a réellement plus de session exploitable.
 *
 * @param force  Renouvelle sans condition — à utiliser après un 401, quand le
 *               jeton en cache vient manifestement d'être refusé.
 */
export async function getFreshAccessToken(force = false): Promise<string | null> {
  try {
    const supabase = createClient();
    if (!force) {
      // `getSession()` ne fait un aller-retour réseau que si le jeton est
      // expiré (ou sur le point de l'être) ; sinon il rend celui du cache.
      const { data } = await supabase.auth.getSession();
      if (data.session?.access_token) return data.session.access_token;
    }
    const { data: renouvelee } = await supabase.auth.refreshSession();
    return renouvelee.session?.access_token ?? null;
  } catch {
    return null;
  }
}

/**
 * `fetch` JSON authentifié qui rejoue UNE fois après un 401, avec un jeton
 * renouvelé de force. Le 401 est très majoritairement un jeton périmé : le
 * rejeu suffit, et évite de renvoyer l'étudiant vers un cul-de-sac.
 */
export async function fetchAvecJetonFrais(
  url: string,
  body: unknown,
): Promise<Response> {
  const envoyer = async (token: string | null) =>
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

  const res = await envoyer(await getFreshAccessToken());
  if (res.status !== 401) return res;
  return envoyer(await getFreshAccessToken(true));
}
