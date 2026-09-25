import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { eleveVisiblePourScope, lireScopeEquipe } from '@/lib/auth/collaborateurs';
import type { SuiviRole } from './types';

/**
 * Périmètre du module « Suivi individuel » (candidats, tableau de bord,
 * exports, fiches PDF). Le tableau de travail « Suivi élèves » bornait déjà
 * ses lignes au périmètre du collaborateur ; la vue « Candidats » et ses
 * exports listaient TOUS les élèves, quelle que soit la spécialité cochée.
 *
 * Renvoie `null` pour un administrateur (aucun filtre), sinon le prédicat à
 * appliquer au `permission_scope` brut de chaque élève.
 */
export type FiltreEleve = ((eleveScope: unknown) => boolean) | null;

export async function filtreElevesSuivi(userId: string, role: SuiviRole): Promise<FiltreEleve> {
  if (role === 'admin') return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (createAdminClient() as any)
    .from('profiles').select('role, permission_scope').eq('id', userId).maybeSingle();
  const p = data as { role?: string; permission_scope?: unknown } | null;
  if (p?.role === 'admin') return null;
  const scope = lireScopeEquipe(p?.permission_scope, role);
  return (eleveScope: unknown) => eleveVisiblePourScope(scope, eleveScope);
}

export const HORS_PERIMETRE_SUIVI = 'Cet élève ne fait pas partie de votre périmètre.';
