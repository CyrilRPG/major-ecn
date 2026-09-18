import 'server-only';
import { NextResponse } from 'next/server';
import { getRequestUser, type RequestAuth } from './bearer';
import { createAdminClient } from '@/lib/supabase/admin';
import { accesEquipeExpire } from './collaborateurs';

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

type RoleEtAcces = { role: string | null; is_active: boolean | null; access_end: string | null };

async function roleOf(auth: RequestAuth): Promise<RoleEtAcces> {
  const vide: RoleEtAcces = { role: null, is_active: null, access_end: null };
  try {
    const { data } = await createAdminClient()
      .from('profiles').select('role, is_active, access_end').eq('id', auth.user.id).maybeSingle();
    return (data as RoleEtAcces | null) ?? vide;
  } catch {
    // Clé service-role absente (dev) : lecture RLS de son propre profil.
    const { data } = await auth.supabase
      .from('profiles').select('role, is_active, access_end').eq('id', auth.user.id).maybeSingle();
    return (data as RoleEtAcces | null) ?? vide;
  }
}

function refuse(status: 401 | 403, message: string): GuardResult {
  return { ok: false, error: NextResponse.json({ error: message }, { status }) };
}

/** Compte désactivé ou membre du personnel dont la date de fin est dépassée. */
function compteFerme(p: RoleEtAcces): GuardResult | null {
  if (p.is_active === false) return refuse(403, 'Compte désactivé');
  if (accesEquipeExpire(p)) return refuse(403, 'Accès expiré — la date de fin de votre accès est dépassée.');
  return null;
}

/** Réservé aux admins. `!guard.ok` ⇒ renvoyer `guard.error` (401/403). */
export async function requireAdminRequest(req: Request): Promise<GuardResult> {
  const auth = await getRequestUser(req);
  if (!auth) return refuse(401, 'Non authentifié — recharge la page et réessaie.');
  const p = await roleOf(auth);
  if (p.role !== 'admin') return refuse(403, 'Réservé aux administrateurs');
  const ferme = compteFerme(p);
  if (ferme) return ferme;
  return { ok: true, auth: { ...auth, role: p.role } };
}

/** Réservé aux admins et professeurs (panels de gestion partagés). */
export async function requireStaffRequest(req: Request): Promise<GuardResult> {
  const auth = await getRequestUser(req);
  if (!auth) return refuse(401, 'Non authentifié — recharge la page et réessaie.');
  const p = await roleOf(auth);
  if (p.role !== 'admin' && p.role !== 'professor') return refuse(403, 'Réservé à l’équipe pédagogique');
  const ferme = compteFerme(p);
  if (ferme) return ferme;
  return { ok: true, auth: { ...auth, role: p.role } };
}
