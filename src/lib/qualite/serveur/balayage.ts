import 'server-only';
import { jourParis, partiesParis } from '@/lib/evc-calendrier/dates';
import { journaliser, lireParametres } from './base';
import { envoyerAlertesCritiques, envoyerRecapitulatif } from './alertes';
import { analyserCommentairesIA } from './ia';
import { executerOrchestration, relancer } from './orchestration';
import { synchroniserParticipations } from './participations';
import { assurerQuestionnaires } from './questionnaires';
import { synchroniserSeances } from './seances';
import { detecterRecurrences, surveillerInactivite, surveillerTauxEtDegradations } from './surveillance';

/**
 * Balayage du module Qualité (cron toutes les 15 minutes). Chaque étape est
 * isolée : l'échec de l'une n'empêche pas les suivantes. Module éteint ⇒ rien
 * d'autre que la synchronisation des séances (sans effet visible).
 */
export async function balayageQualite(now = Date.now()): Promise<Record<string, unknown>> {
  const bilan: Record<string, unknown> = {};
  const etape = async (nom: string, f: () => Promise<unknown>) => {
    try { bilan[nom] = await f(); } catch (err) {
      console.error(`[qualite] balayage ${nom} :`, err);
      bilan[nom] = { erreur: err instanceof Error ? err.message : String(err) };
    }
  };
  const params = await lireParametres();
  await etape('questionnaires', () => assurerQuestionnaires());
  await etape('seances', () => synchroniserSeances());
  if (!params.actif) return { ...bilan, actif: false };

  const heure = partiesParis(now).h;
  await etape('participations', () => synchroniserParticipations(params, now));
  await etape('orchestration', () => executerOrchestration({ now }));
  await etape('relances', () => relancer(now));
  await etape('ia', () => analyserCommentairesIA());
  await etape('recurrences', () => detecterRecurrences(params, now));
  await etape('critiques', () => envoyerAlertesCritiques());
  // Une fois par heure (premier passage de l'heure) : inactivité, taux, dégradations.
  if (partiesParis(now).min < 15) {
    // Jamais de relance d'inactivité la nuit : entre 9 h et 19 h (Paris).
    if (heure >= 9 && heure < 19) await etape('inactivite', () => surveillerInactivite(params, { now }));
    await etape('taux', () => surveillerTauxEtDegradations(params, now));
  }
  if (heure >= 7) await etape('recapitulatif', () => envoyerRecapitulatif(jourParis(now)));
  const resume = Object.fromEntries(Object.entries(bilan).filter(([, v]) => v && (typeof v !== 'object' || Object.values(v as object).some((x) => x))));
  if (Object.keys(resume).length > 2) await journaliser({ objet_type: 'balayage', action: 'passage', details: resume });
  return bilan;
}
