import type { AnthropicUsage } from './anthropic';

/** Tarifs Anthropic (USD/M tokens), Claude Sonnet 4.5/4.6 par défaut. */
const RATES: Record<string, { in: number; out: number }> = {
  'claude-sonnet-4-5':       { in: 3,  out: 15 },
  'claude-sonnet-4-6':       { in: 3,  out: 15 },
  'claude-sonnet-4-7':       { in: 3,  out: 15 },
  'claude-opus-4-5':         { in: 15, out: 75 },
  'claude-opus-4-6':         { in: 15, out: 75 },
  'claude-opus-4-7':         { in: 15, out: 75 },
  'claude-haiku-4-5':        { in: 1,  out: 5  },
};

function rateFor(model: string) {
  // Strip date suffixes like "-20251001"
  const base = model.split('-').slice(0, 4).join('-');
  return RATES[base] ?? RATES['claude-sonnet-4-5'];
}

export function usageToUsd(usage: AnthropicUsage, model: string): number {
  const r = rateFor(model);
  return (usage.input_tokens / 1_000_000) * r.in + (usage.output_tokens / 1_000_000) * r.out;
}

/** Prix facturé à l'étudiant / centre, en €. */
export const PRICE_EUR = {
  flashcards: 3,
  qcm: 5,
} as const;

/**
 * Tarification de la facturation IA, calculée en direct sur le contenu
 * réellement disponible (et non par génération) :
 *  - tous les QCM + DP d'un cours        → 5 €
 *  - une fiche                            → 10 €
 *  - toutes les flashcards d'un cours     → 3 €
 *  - une réponse de l'assistant IA        → 0,10 €
 * Règle Découverte : pour les cours du collège Découverte, on ne facture que
 * la fiche (QCM / flashcards non comptés).
 */
export const BILLING_EUR = {
  qcm_per_course: 5,
  fiche: 10,
  flashcards_per_course: 3,
  ai_response: 0.1,
} as const;

/**
 * Seuils « cours complet » servant à la tarification PROPORTIONNELLE des
 * spécialités de Médecine générale (contenu produit de façon incrémentale) :
 *  - une spécialité complète = 200 flashcards → 3 € (proportionnel en deçà) ;
 *  - une spécialité complète = 10 séries QCM/DP → 5 € (proportionnel en deçà) ;
 *  - 1 fiche pour toute la spécialité → 10 €.
 * Les autres collèges restent facturés au forfait par cours.
 */
export const BILLING_MG_THRESHOLDS = {
  flashcards_full: 200,
  qcm_series_full: 10,
} as const;

/** Prix € des contenus d'une ligne de facturation (voir admin_facturation_lines). */
export function billingLinePrices(line: {
  is_mg: boolean;
  is_decouverte: boolean;
  has_fiche: boolean;
  n_series: number;
  n_flash: number;
}): { fiche: number; qcm: number; flash: number } {
  const fiche = line.has_fiche ? BILLING_EUR.fiche : 0;
  if (line.is_decouverte) return { fiche, qcm: 0, flash: 0 };
  if (line.is_mg) {
    const qcm = Math.min(
      BILLING_EUR.qcm_per_course,
      (BILLING_EUR.qcm_per_course * line.n_series) / BILLING_MG_THRESHOLDS.qcm_series_full,
    );
    const flash = Math.min(
      BILLING_EUR.flashcards_per_course,
      (BILLING_EUR.flashcards_per_course * line.n_flash) / BILLING_MG_THRESHOLDS.flashcards_full,
    );
    return { fiche, qcm: Math.round(qcm * 100) / 100, flash: Math.round(flash * 100) / 100 };
  }
  // Collèges hors MG : forfait par cours (binaire).
  return {
    fiche,
    qcm: line.n_series > 0 ? BILLING_EUR.qcm_per_course : 0,
    flash: line.n_flash > 0 ? BILLING_EUR.flashcards_per_course : 0,
  };
}

/** Identifiant du collège « Découverte » (facturation : fiche seule). */
export const DECOUVERTE_COLLEGE_ID = 'col-decouverte';

