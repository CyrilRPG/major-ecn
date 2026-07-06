import 'server-only';
import { unstable_cache } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';

export type FaculteTotals = {
  qcm_counts: { cours_id: string; n: number }[];
  flashcards_total: number;
};

/**
 * Totaux de contenu d'une faculté (nombre de questions QCM par cours + total
 * flashcards). Ces valeurs sont IDENTIQUES pour tous les élèves et ne changent
 * qu'à l'ingestion de contenu — on les met donc en cache global 1h au lieu de
 * les recalculer dans get_accueil_stats à chaque rendu (P4 optimisation accueil).
 *
 * Client service-role (pas de cookies) car unstable_cache ne peut pas accéder
 * au contexte de requête. Renvoie des totaux vides si le RPC n'est pas encore
 * déployé → l'appelant retombe alors sur les champs de get_accueil_stats.
 */
export const getFaculteContentTotals = unstable_cache(
  async (faculteId: string): Promise<FaculteTotals> => {
    try {
      const admin = createAdminClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (admin as any).rpc('get_faculte_content_totals', {
        p_faculte_id: faculteId,
      });
      const d = data as FaculteTotals | null;
      if (d && Array.isArray(d.qcm_counts) && d.qcm_counts.length > 0) return d;
    } catch {
      // service-role indisponible / RPC absent → fallback géré par l'appelant
    }
    return { qcm_counts: [], flashcards_total: 0 };
  },
  ['faculte-content-totals'],
  { revalidate: 3600, tags: ['faculte-content-totals'] },
);
