import 'server-only';

/**
 * Recherche d'un compte Auth par email — SANS pagination fragile.
 *
 * POURQUOI CE FICHIER (09/09/2026)
 * --------------------------------
 * Le provisioning Stripe et les routes admin cherchaient un compte existant
 * avec `auth.admin.listUsers({ page: 1, perPage: 500 })` puis un `find()` sur
 * l'email. GoTrue renvoie les comptes du PLUS RÉCENT au plus ancien : passé
 * 500 comptes, tous les anciens deviennent invisibles.
 *
 * Conséquence en production, constatée le 09/09/2026 : une élève inscrite en
 * juin (564ᵉ compte le plus récent sur 736) rachète une formule. Le
 * provisioning ne la trouve pas, tente de CRÉER son compte, GoTrue répond
 * « user already registered » — et tout s'arrête là : pas de mise à niveau du
 * `permission_scope` (elle est restée en Découverte alors qu'elle avait payé),
 * pas d'email d'activation, pas même une ligne dans
 * `stripe_provisioning_log`. La page de remerciement affichait seulement
 * « l'email d'activation n'a pas pu partir ». Le nombre de comptes touchés
 * augmentait d'un par nouvelle inscription.
 *
 * L'API admin de GoTrue sait filtrer côté serveur (`?filter=`), ce que le SDK
 * n'expose pas : on l'appelle directement, avec un repli paginé si le filtre
 * venait à disparaître d'une version future.
 */

/** Ce que les appelants utilisent réellement du compte GoTrue. */
export type CompteAuth = {
  id: string;
  email: string | null;
  email_confirmed_at?: string | null;
  last_sign_in_at?: string | null;
  created_at?: string | null;
};

type UtilisateurGoTrue = { id: string; email?: string | null } & Partial<CompteAuth>;

const compte = (u: UtilisateurGoTrue): CompteAuth => ({
  id: u.id,
  email: u.email ?? null,
  email_confirmed_at: u.email_confirmed_at ?? null,
  last_sign_in_at: u.last_sign_in_at ?? null,
  created_at: u.created_at ?? null,
});

/** Vrai si les deux adresses désignent le même compte (casse ignorée). */
const memeEmail = (a: string | null | undefined, b: string) =>
  (a ?? '').toLowerCase().trim() === b.toLowerCase().trim();

/**
 * Index email → compte, construit sur TOUTES les pages. Pour les traitements
 * par lot, qui feraient sinon une requête filtrée par adresse.
 */
export async function indexerComptesAuthParEmail(): Promise<Map<string, CompteAuth>> {
  const index = new Map<string, CompteAuth>();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return index;
  const headers = { apikey: key, authorization: `Bearer ${key}` };
  for (let page = 1; page <= 40; page++) {
    const r = await fetch(`${url}/auth/v1/admin/users?page=${page}&per_page=200`, { headers, cache: 'no-store' });
    if (!r.ok) break;
    const j = (await r.json()) as { users?: Array<UtilisateurGoTrue> };
    const users = j.users ?? [];
    for (const u of users) if (u.email) index.set(u.email.toLowerCase(), compte(u));
    if (users.length < 200) break;
  }
  return index;
}

/**
 * Renvoie le compte Auth portant cet email, ou `null`. Ne lève jamais : un
 * appelant qui reçoit `null` doit pouvoir tenter la création et traiter
 * proprement un éventuel « already registered ».
 */
export async function trouverCompteAuthParEmail(email: string): Promise<CompteAuth | null> {
  const cible = email.trim();
  if (!cible) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const headers = { apikey: key, authorization: `Bearer ${key}` };

  // 1) Filtre serveur : une requête, quel que soit le nombre de comptes.
  try {
    const r = await fetch(`${url}/auth/v1/admin/users?filter=${encodeURIComponent(cible)}&per_page=50`, {
      headers,
      cache: 'no-store',
    });
    if (r.ok) {
      const j = (await r.json()) as { users?: Array<UtilisateurGoTrue> };
      const u = (j.users ?? []).find((x) => memeEmail(x.email, cible));
      if (u) return compte(u);
      // `filter` a répondu sans correspondance exacte : le compte n'existe pas.
      // On ne retombe sur le balayage que si la requête elle-même a échoué.
      if ((j.users ?? []).length > 0) return null;
    }
  } catch {
    /* réseau : on tente le repli ci-dessous */
  }

  // 2) Repli : balayage page par page, jusqu'au bout (pas seulement la 1ʳᵉ).
  try {
    for (let page = 1; page <= 40; page++) {
      const r = await fetch(`${url}/auth/v1/admin/users?page=${page}&per_page=200`, { headers, cache: 'no-store' });
      if (!r.ok) return null;
      const j = (await r.json()) as { users?: Array<UtilisateurGoTrue> };
      const users = j.users ?? [];
      const u = users.find((x) => memeEmail(x.email, cible));
      if (u) return compte(u);
      if (users.length < 200) return null;
    }
  } catch {
    return null;
  }
  return null;
}
