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
  flashcards: 5,
  qcm: 3,
} as const;

/**
 * Tarification de la facturation IA, calculée en direct sur le contenu
 * réellement disponible (et non par génération) :
 *  - tous les QCM + DP d'un cours        → 3 €
 *  - une fiche                            → 10 €
 *  - toutes les flashcards d'un cours     → 5 €
 *  - une réponse de l'assistant IA        → 0,10 €
 * Règle Découverte : pour les cours du collège Découverte, on ne facture que
 * la fiche (QCM / flashcards non comptés).
 */
export const BILLING_EUR = {
  qcm_per_course: 3,
  fiche: 10,
  flashcards_per_course: 5,
  ai_response: 0.1,
} as const;

/** Identifiant du collège « Découverte » (facturation : fiche seule). */
export const DECOUVERTE_COLLEGE_ID = 'col-decouverte';

