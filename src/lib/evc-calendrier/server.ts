import 'server-only';
import { unstable_cache } from 'next/cache';
import { createPublicClient } from '@/lib/supabase/public';
import { COLONNES_EPREUVE, COLONNES_REGLAGES, normaliserEpreuve, normaliserReglages } from './lignes';
import { CALENDRIER_REPLI } from './repli';
import type { CalendrierEvc } from './types';
import { faitsSpecialite, type FaitsSpecialite } from './faits';

/**
 * Lecture du calendrier EVC pour les pages publiques (accueil, pages
 * spécialités, /visite-guidee) et le planificateur.
 *
 * Client ANONYME sans cookies (les deux tables sont en lecture publique) :
 * utilisable dans `unstable_cache`, la page reste servie depuis le cache.
 * Cache court (5 min) ; l'enregistrement dans /admin/calendrier-evc invalide
 * l'étiquette, la modification est donc visible immédiatement.
 *
 * REPLI : base injoignable → valeurs figées de la session 2026 (repli.ts).
 * Le site ne casse jamais pour un calendrier ; la réponse de repli n'est pas
 * mise en cache (une erreur lève, `unstable_cache` ne mémorise pas un rejet).
 */

export const EVC_CALENDRIER_TAG = 'evc-calendrier';

const lireEnCache = unstable_cache(
  async (): Promise<CalendrierEvc> => {
    // Tables absentes des types générés : client non typé, comme ailleurs.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createPublicClient() as any;
    const [epreuves, reglages] = await Promise.all([
      db.from('evc_calendrier').select(COLONNES_EPREUVE).order('date_epreuve', { ascending: true }),
      db.from('evc_calendrier_sessions').select(COLONNES_REGLAGES),
    ]);
    if (epreuves.error || reglages.error || !epreuves.data) {
      throw new Error(epreuves.error?.message ?? reglages.error?.message ?? 'calendrier illisible');
    }
    return {
      epreuves: (epreuves.data as Record<string, unknown>[]).map(normaliserEpreuve).filter((e) => e.slug && e.nom),
      reglages: normaliserReglages(reglages.data?.[0]),
      source: 'base',
    };
  },
  ['evc-calendrier-v1'],
  { revalidate: 300, tags: [EVC_CALENDRIER_TAG] },
);

export async function chargerCalendrierEvc(): Promise<CalendrierEvc> {
  try {
    return await lireEnCache();
  } catch (e) {
    console.error('[evc-calendrier] lecture impossible, repli sur les valeurs figées :', e instanceof Error ? e.message : e);
    return CALENDRIER_REPLI;
  }
}

/**
 * Instant du rendu serveur, transmis aux composants datés : leur premier rendu
 * dans le navigateur part de la même valeur (pas d'écart d'hydratation), puis
 * `useMaintenant` recalcule avec l'heure réelle.
 */
export function instantDuRendu(): number {
  return Date.now();
}

/** Faits d'une spécialité (page publique), depuis le calendrier en cache. */
export async function chargerFaitsSpecialite(slug: string): Promise<FaitsSpecialite | null> {
  return faitsSpecialite(await chargerCalendrierEvc(), slug);
}
