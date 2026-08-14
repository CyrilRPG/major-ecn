import 'server-only';
import { NextResponse } from 'next/server';
import { getRequestUser, type RequestAuth } from './bearer';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Garde d'authentification des routes API d'administration.
 *
 * POURQUOI. Ces routes vérifiaient l'identité avec `auth.getUser()` : un
 * aller-retour réseau vers l'API Auth à CHAQUE appel, et une dépendance au seul
 * cookie. Deux modes de panne déjà documentés sur cette plateforme (cf.
 * verified-user.ts et fresh-token.ts) :
 *  1. API Auth lente ou saturée → `getUser()` échoue alors que la session est
 *     parfaitement saine → « Non authentifié » pour un admin connecté ;
 *  2. onglet resté ouvert plus d'une heure : le middleware ne rafraîchit jamais
 *     les cookies sur /api/*, le JWT du cookie expire → même symptôme.
 * C'est exactement ce qui cassait la consultation des émargements et
 * l'impersonation (« Se connecter en tant que »).
 *
 * ICI, même stratégie que les routes élèves : vérification LOCALE de la
 * signature du JWT (JWKS en cache — `getRequestUser`), cookie d'abord, header
 * `Authorization: Bearer` sinon. Les composants admin envoient un jeton frais
 * via `fetchAuthentifie` / `fetchAvecJetonFrais`, donc un cookie périmé n'a
 * plus aucune conséquence. Le rôle est lu via le client service-role : aucune
 * dépendance à la RLS ni à `current_role()`.
 */

export type RoleRequestAuth = RequestAuth & { role: string };

export type GuardResult =
  | { ok: true; auth: RoleRequestAuth }
  | { ok: false; error: NextResponse };

async function roleOf(auth: RequestAuth): Promise<string | null> {
  try {
    const { data } = await createAdminClient()
      .from('profiles').select('role').eq('id', auth.user.id).maybeSingle();
    return (data as { role?: string | null } | null)?.role ?? null;
  } catch {
    // Clé service-role absente (dev) : lecture RLS de son propre profil.
    const { data } = await auth.supabase
      .from('profiles').select('role').eq('id', auth.user.id).maybeSingle();
    return (data as { role?: string | null } | null)?.role ?? null;
  }
}

function refuse(status: 401 | 403, message: string): GuardResult {
  return { ok: false, error: NextResponse.json({ error: message }, { status }) };
}

/** Réservé aux admins. `!guard.ok` ⇒ renvoyer `guard.error` (401/403). */
export async function requireAdminRequest(req: Request): Promise<GuardResult> {
  const auth = await getRequestUser(req);
  if (!auth) return refuse(401, 'Non authentifié — recharge la page et réessaie.');
  const role = await roleOf(auth);
  if (role !== 'admin') return refuse(403, 'Réservé aux administrateurs');
  return { ok: true, auth: { ...auth, role } };
}

/** Réservé aux admins et professeurs (panels de gestion partagés). */
export async function requireStaffRequest(req: Request): Promise<GuardResult> {
  const auth = await getRequestUser(req);
  if (!auth) return refuse(401, 'Non authentifié — recharge la page et réessaie.');
  const role = await roleOf(auth);
  if (role !== 'admin' && role !== 'professor') return refuse(403, 'Réservé à l’équipe pédagogique');
  return { ok: true, auth: { ...auth, role } };
}
