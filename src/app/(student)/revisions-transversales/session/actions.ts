'use server';

import { createClient } from '@/lib/supabase/server';
import { getVerifiedUser } from '@/lib/auth/verified-user';
import { checkAlertsAfterTransversalSession } from '@/lib/pedago/alerts';

export type TransversalKind =
  | 'daily'
  | 'recommended'
  | 'intensive'
  | 'reevaluation'
  | 'reevaluation_deep'
  | 'bilan_global';

export type RecordTransversalSessionInput = {
  kind: TransversalKind;
  qcm_count: number;
  score_correct: number;
  /** ratio correct/total par cours_id, ex. { "1111...": 0.66 } */
  specialty_scores: Record<string, number>;
  /** ratio correct/total par matiere_id (spécialité), ex. { "col-cardiologie": 0.5 } */
  matiere_scores?: Record<string, number>;
  /** Noms des spécialités (pour les emails d'alerte), par matiere_id. */
  matiere_names?: Record<string, string>;
  /** ISO timestamp of when the session started */
  started_at: string;
};

/**
 * Enregistre une session transversale terminée.
 *
 * Effets (sections 4-8 du cahier des charges) :
 *  - la session est comptabilisée ; les compteurs de maintien des acquis
 *    (user_revision_stats) sont mis à jour par trigger en base ;
 *  - une réévaluation (14 j / 30 j / 60 j) terminée LÈVE le blocage des
 *    nouveaux contenus (le seuil des 14 jours repart de zéro) ;
 *  - la chaîne d'alertes admin est déroulée côté serveur : réévaluation ou
 *    bilan rouge → Priorité 1 + email ; orange → Priorité 2 selon les règles ;
 *    accumulation de mauvaises révisions du jour → Priorité 2.
 *  - AUCUN statut officiel de spécialité n'est modifié (le score de révision
 *    est informatif ; seule une évaluation officielle change une note).
 */
export async function recordTransversalSession(
  input: RecordTransversalSessionInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const user = await getVerifiedUser(supabase);
  if (!user) return { ok: false, error: 'Non authentifié' };

  const now = new Date().toISOString();
  const { error } = await (supabase as unknown as {
    from: (t: string) => { insert: (v: Record<string, unknown>) => Promise<{ error: { message: string } | null }> };
  }).from('transversal_sessions').insert({
    user_id: user.id,
    started_at: input.started_at,
    completed_at: now,
    qcm_count: input.qcm_count,
    score_correct: input.score_correct,
    kind: input.kind,
    specialty_scores: input.specialty_scores,
    matiere_scores: input.matiere_scores ?? {},
  });
  if (error) return { ok: false, error: error.message };

  // Chaîne d'alertes (best-effort, jamais bloquante pour l'élève).
  try {
    const pct = input.qcm_count > 0 ? Math.round((input.score_correct / input.qcm_count) * 100) : 0;
    const weakMatieres = Object.entries(input.matiere_scores ?? {})
      .map(([matiereId, ratio]) => ({
        matiereId,
        nom: input.matiere_names?.[matiereId] ?? matiereId,
        pct: Math.round(ratio * 100),
      }))
      .filter((w) => w.pct < 75)
      .sort((a, b) => a.pct - b.pct);
    await checkAlertsAfterTransversalSession(
      user.id,
      { kind: input.kind, pct, weakMatieres },
      supabase as never,
    );
  } catch (err) {
    console.error('[TransversalSession] chaîne d\'alertes en échec', err);
  }

  return { ok: true };
}
