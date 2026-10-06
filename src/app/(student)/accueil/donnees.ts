import 'server-only';
import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { startOfUtcIsoWeek, sumTrackedSeconds, type StudyTimeRow } from '@/lib/student/study-time';
import type { JourActivite } from '@/lib/student/activite';
import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import { COLONNES_VUE, lienDetail, normaliser, noteVisible, pourEleve, type Evaluation } from '@/lib/evaluations/historique-core';
import { listScheduledReviews, moteurDb } from '@/lib/moteur/server/db';
import type { EngagementLevel } from '@/lib/engagement/types';

/**
 * Lectures partagées de l'accueil, dédupliquées par requête (React `cache`) :
 * l'en-tête, le bandeau de chiffres et les sections lisent les mêmes chiffres
 * sans refaire les requêtes.
 */

/**
 * Secondes de travail mesurées depuis le lundi (fenêtre explicite lundi →
 * aujourd'hui, pour que les heures de la veille ne disparaissent pas au fil
 * des jours).
 */
export const secondesSemaine = cache(async (userId: string): Promise<number> => {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- table hors types générés
  const { data } = await (supabase as any).from('platform_time_tracking').select('total_seconds').eq('user_id', userId).gte('session_date', startOfUtcIsoWeek());
  return sumTrackedSeconds(data as StudyTimeRow[] | null);
});

/** « Votre activité » : un point par jour civil (Paris) sur 90 jours ; null si la lecture a échoué. */
export const activiteQuotidienne = cache(async (): Promise<JourActivite[] | null> => {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- RPC hors types générés
  const { data, error } = await (supabase as any).rpc('get_activite_quotidienne', { p_jours: 90 });
  return error ? null : ((data ?? []) as JourActivite[]);
});

/** Jour actif : du temps mesuré ou une activité comptée (même règle que les pastilles de l'en-tête). */
export const jourActif = (j: JourActivite | undefined) => !!j && (j.s > 0 || j.qcm + j.cas + j.fc + j.transv > 0);

/** Jours (sur les 7 derniers, aujourd'hui compris) avec une activité mesurée. */
export function joursActifs7(jours: JourActivite[] | null, aujourdhui: string): number {
  if (!jours) return 0;
  const debut = new Date(`${aujourdhui}T12:00:00Z`);
  debut.setUTCDate(debut.getUTCDate() - 6);
  const depuis = debut.toISOString().slice(0, 10);
  return jours.filter((j) => j.d >= depuis && j.d <= aujourdhui && jourActif(j)).length;
}

const decaler = (jour: string, n: number) => {
  const d = new Date(`${jour}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

/** Aujourd'hui à Paris, « AAAA-MM-JJ » (jamais toISOString : décalage de fuseau). */
export const aujourdhuiParis = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Paris' });

/**
 * Régularité de la semaine : jours consécutifs actifs jusqu'à aujourd'hui
 * (plafonnés à 7, la veille compte si la journée n'est pas encore travaillée),
 * jours actifs de la semaine civile (lundi → dimanche) et évolution du temps
 * de travail par rapport à la même période de la semaine précédente.
 */
export function regularite(jours: JourActivite[] | null, aujourdhui: string): {
  consecutifs: number; semaine: boolean[]; evolution: number | null; secondes7: number;
} {
  const parJour = new Map((jours ?? []).map((j) => [j.d, j]));
  let consecutifs = 0;
  let curseur = jourActif(parJour.get(aujourdhui)) ? aujourdhui : decaler(aujourdhui, -1);
  while (consecutifs < 7 && jourActif(parJour.get(curseur))) { consecutifs++; curseur = decaler(curseur, -1); }
  const dow = (new Date(`${aujourdhui}T12:00:00Z`).getUTCDay() + 6) % 7; // 0 = lundi
  const lundi = decaler(aujourdhui, -dow);
  const semaine = Array.from({ length: 7 }, (_, i) => { const d = decaler(lundi, i); return d <= aujourdhui && jourActif(parJour.get(d)); });
  const somme = (de: string, a: string) => (jours ?? []).filter((j) => j.d >= de && j.d <= a).reduce((s, j) => s + j.s, 0);
  const cetteSemaine = somme(lundi, aujourdhui);
  const precedente = somme(decaler(lundi, -7), decaler(aujourdhui, -7));
  return {
    consecutifs,
    semaine,
    evolution: precedente > 0 ? Math.round(((cetteSemaine - precedente) / precedente) * 100) : null,
    secondes7: somme(decaler(aujourdhui, -6), aujourdhui),
  };
}

/** Engagement du moteur central (niveau, révisions transversales des 14 derniers jours). */
export const etatEngagement = cache(async (userId: string): Promise<{
  niveau: EngagementLevel | null; transversalesProposees: number; transversalesFaites: number;
} | null> => {
  const { data, error } = await moteurDb().from('engagement_state')
    .select('engagement_level, transversal_reviews_assigned, transversal_reviews_completed').eq('user_id', userId).maybeSingle();
  if (error || !data) return null;
  const e = data as { engagement_level: EngagementLevel | null; transversal_reviews_assigned: number | null; transversal_reviews_completed: number | null };
  return { niveau: e.engagement_level, transversalesProposees: e.transversal_reviews_assigned ?? 0, transversalesFaites: e.transversal_reviews_completed ?? 0 };
});

/** Réactivations programmées par le moteur central, comptées par délai (J+7, J+14, J+30, J+60). */
export const reactivationsParDelai = cache(async (userId: string): Promise<Map<number, number>> => {
  const out = new Map<number, number>();
  try {
    for (const r of await listScheduledReviews(userId)) out.set(r.interval_days, (out.get(r.interval_days) ?? 0) + 1);
  } catch { /* moteur indisponible : aucune réactivation affichée */ }
  return out;
});

/** Cours consultés (dernière consultation sur 90 jours) : la part « Cours » de la répartition du travail. */
export const coursConsultes = cache(async (userId: string): Promise<string[]> => {
  const supabase = await createClient();
  const { data } = await supabase.from('course_progress').select('last_seen_at').eq('user_id', userId)
    .gte('last_seen_at', new Date(Date.now() - 90 * 86_400_000).toISOString()).limit(2000);
  return ((data ?? []) as { last_seen_at: string }[]).map((r) => r.last_seen_at.slice(0, 10));
});

export type ResultatAccueil = { cle: string; intitule: string; pourcentage: number; date: string; href: string | null; checkup: boolean };

/**
 * Derniers résultats publiés de l'élève (historique des évaluations, mêmes règles que /evaluations :
 * rien de non publié ne quitte le serveur), du plus récent au plus ancien.
 */
export const derniersResultats = cache(async (userId: string): Promise<ResultatAccueil[]> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- vue hors types générés
  const { data, error } = await (createAdminClient() as any).from('evaluations_historique').select(COLONNES_VUE)
    .eq('faculte_id', EDN_FACULTE_ID).eq('user_id', userId).eq('statut', 'termine')
    .order('date_evaluation', { ascending: false }).limit(60);
  if (error) return [];
  return ((data ?? []) as Record<string, unknown>[])
    .map(normaliser)
    .map(pourEleve)
    .filter((e: Evaluation) => !e.archive && noteVisible(e, true))
    .map((e) => ({ cle: e.cle, intitule: e.intitule, pourcentage: e.pourcentage!, date: e.date, href: lienDetail(e, 'eleve'), checkup: e.source === 'checkup' }));
});

