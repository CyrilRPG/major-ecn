import 'server-only';
import { cache } from 'react';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  ACCES_ADMIN, accesOnglets, lireScopeEquipe, premierePage,
  type AccesOnglets, type ScopeEquipe,
} from './collaborateurs';

/**
 * Résolution SERVEUR du scope d'un membre du personnel, pour les gardes de
 * page et la barre latérale. Un compte récent porte ses modules dans
 * `permission_scope` ; un compte historique n'a que ses `content_permissions`
 * et, éventuellement, un rôle du module de suivi dans `suivi_staff_roles` —
 * qu'il faut lire en base pour lui rouvrir le suivi.
 *
 * Aucun import de `require-role` ni de `suivi/roles` ici : les deux s'appuient
 * sur ce module.
 */

type ProfilEquipe = { id: string; role?: string | null; permission_scope?: unknown };

/** Rôle historique du module de suivi (mémoïsé par requête). */
const suiviHerite = cache(async (userId: string): Promise<'responsable' | 'intervenant' | 'lecture' | null> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (createAdminClient() as any)
      .from('suivi_staff_roles').select('role').eq('user_id', userId).maybeSingle();
    const r = (data as { role?: string } | null)?.role;
    return r === 'responsable' || r === 'intervenant' || r === 'lecture' ? r : null;
  } catch {
    return null;
  }
});

/** Scope complet (modules + périmètre) d'un collaborateur ; null pour un non-collaborateur. */
export async function scopeEquipeResolu(profile: ProfilEquipe): Promise<ScopeEquipe | null> {
  if (profile.role !== 'professor') return null;
  const raw = profile.permission_scope as { modules?: unknown } | null | undefined;
  const aModules = !!raw && typeof raw === 'object' && !!raw.modules;
  return lireScopeEquipe(profile.permission_scope, aModules ? null : await suiviHerite(profile.id));
}

/** Onglets d'administration ouverts : tout pour un administrateur, rien pour un élève. */
export async function ongletsDe(profile: ProfilEquipe): Promise<AccesOnglets> {
  if (profile.role === 'admin') return { ...ACCES_ADMIN };
  return accesOnglets(await scopeEquipeResolu(profile));
}

/** Page d'atterrissage d'un membre du personnel non administrateur, selon ses modules. */
export async function atterrissageEquipe(profile: ProfilEquipe | null): Promise<string> {
  if (!profile || profile.role !== 'professor') return '/app';
  return premierePage(await scopeEquipeResolu(profile));
}
