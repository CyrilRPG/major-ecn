import 'server-only';
import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { startOfUtcIsoWeek, sumTrackedSeconds, type StudyTimeRow } from '@/lib/student/study-time';
import type { JourActivite } from '@/lib/student/activite';

/**
 * Lectures partagées de l'accueil, dédupliquées par requête (React `cache`) :
 * l'en-tête (pastilles) et le tableau de bord lisent les mêmes chiffres sans
 * refaire les requêtes.
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

/** Jours (sur les 7 derniers, aujourd'hui compris) avec une activité mesurée. */
export function joursActifs7(jours: JourActivite[] | null, aujourdhui: string): number {
  if (!jours) return 0;
  const debut = new Date(`${aujourdhui}T12:00:00Z`);
  debut.setUTCDate(debut.getUTCDate() - 6);
  const depuis = debut.toISOString().slice(0, 10);
  return jours.filter((j) => j.d >= depuis && j.d <= aujourdhui && (j.s > 0 || j.qcm + j.cas + j.fc + j.transv > 0)).length;
}
