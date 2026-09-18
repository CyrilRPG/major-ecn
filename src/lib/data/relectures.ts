import { createAdminClient } from '@/lib/supabase/admin';
import { estTableRelecturesAbsente, type Relecture } from './relectures-pure';

export { estTableRelecturesAbsente, libelleRelecture, type Relecture } from './relectures-pure';

/**
 * Marques de relecture des professeurs (table `content_reviews`, migration
 * 20260918120000) : « cette série a été relue », « cet item est entièrement
 * relu ». Lecture par le client service-role (la table n'a pas de policy
 * élève), UNIQUEMENT pour l'affichage au personnel. Module SERVEUR : les
 * composants client importent `relectures-pure`.
 *
 * Tant que la migration n'est pas appliquée, la table n'existe pas : on ne
 * fait jamais échouer une page pour cela — les indicateurs disparaissent,
 * `indisponible` le signale au personnel.
 */

export type RelecturesItem = {
  /** Marque de l'item entier (« j'ai fini de tout relire »), ou null. */
  cours: Relecture | null;
  /** Marques par série, indexées par identifiant de série. */
  series: Map<string, Relecture>;
  /** La table n'existe pas encore (migration à appliquer). */
  indisponible: boolean;
};

type Ligne = {
  scope: 'serie' | 'cours';
  serie_id: string | null;
  reviewed_by: string;
  reviewed_by_name: string | null;
  reviewed_at: string;
};

export async function chargerRelectures(coursId: string): Promise<RelecturesItem> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (createAdminClient() as any)
    .from('content_reviews')
    .select('scope, serie_id, reviewed_by, reviewed_by_name, reviewed_at')
    .eq('cours_id', coursId);
  if (error) {
    if (estTableRelecturesAbsente(error)) return { cours: null, series: new Map(), indisponible: true };
    throw error;
  }
  const out: RelecturesItem = { cours: null, series: new Map(), indisponible: false };
  for (const l of (data ?? []) as Ligne[]) {
    const r: Relecture = { reviewedBy: l.reviewed_by, reviewedByName: l.reviewed_by_name, reviewedAt: l.reviewed_at };
    if (l.scope === 'cours') out.cours = r;
    else if (l.serie_id) out.series.set(l.serie_id, r);
  }
  return out;
}

/** Items entièrement relus parmi une liste (badge des listes d'administration). */
export async function coursRelus(coursIds: string[]): Promise<Set<string>> {
  if (coursIds.length === 0) return new Set();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (createAdminClient() as any)
    .from('content_reviews')
    .select('cours_id')
    .eq('scope', 'cours')
    .in('cours_id', coursIds);
  if (error) {
    if (estTableRelecturesAbsente(error)) return new Set();
    throw error;
  }
  return new Set(((data ?? []) as { cours_id: string }[]).map((r) => r.cours_id));
}
