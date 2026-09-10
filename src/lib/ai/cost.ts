import type { AnthropicUsage } from './anthropic';

/** Tarifs Anthropic (USD/M tokens). Sonnet 5 : 2 $ / 10 $ ; Opus 5 : 5 $ / 25 $ ;
 *  Fable 5.1 : 10 $ / 50 $ ; Haiku 4.5 : 1 $ / 5 $. Modèle inconnu → Sonnet 4.5. */
const RATES: Record<string, { in: number; out: number }> = {
  'claude-sonnet-5':         { in: 2,  out: 10 },
  'claude-opus-5':           { in: 5,  out: 25 },
  'claude-opus-4-8':         { in: 5,  out: 25 },
  'claude-fable-5-1':        { in: 10, out: 50 },
  'claude-fable-5':          { in: 10, out: 50 },
  'claude-sonnet-4-5':       { in: 3,  out: 15 },
  'claude-sonnet-4-6':       { in: 3,  out: 15 },
  'claude-sonnet-4-7':       { in: 3,  out: 15 },
  'claude-opus-4-5':         { in: 15, out: 75 },
  'claude-opus-4-6':         { in: 15, out: 75 },
  'claude-opus-4-7':         { in: 15, out: 75 },
  'claude-haiku-4-5':        { in: 1,  out: 5  },
};

function rateFor(model: string) {
  // Retire un éventuel suffixe de date (« -20251001 ») : on retient le plus
  // long préfixe connu, car les identifiants n'ont pas tous le même nombre de
  // segments (« claude-sonnet-5 » vs « claude-sonnet-4-6 »).
  const parts = model.split('-');
  for (let n = parts.length; n >= 2; n--) {
    const r = RATES[parts.slice(0, n).join('-')];
    if (r) return r;
  }
  return RATES['claude-sonnet-4-5'];
}

export function usageToUsd(usage: AnthropicUsage, model: string): number {
  const r = rateFor(model);
  // Cache de prompt : lecture facturée 10 % du tarif d'entrée, écriture 125 %.
  const lus = usage.cache_read_input_tokens ?? 0;
  const ecrits = usage.cache_creation_input_tokens ?? 0;
  return (usage.input_tokens / 1_000_000) * r.in
    + (lus / 1_000_000) * r.in * 0.1
    + (ecrits / 1_000_000) * r.in * 1.25
    + (usage.output_tokens / 1_000_000) * r.out;
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
  /** Collège Odontologie (copie de Major Odontologie) : la production IA des
   *  QCM / questions rédactionnelles y est facturée 2,50 € le cours au lieu de
   *  5 € — arbitrage de Cyril, 06/09/2026. */
  qcm_per_course_odontologie: 2.5,
  fiche: 10,
  flashcards_per_course: 3,
  ai_response: 0.1,
  /** Génération IA d'une interrogation de fin de parcours (1 item). */
  interrogation_generation: 0.3,
  /** Génération IA d'une épreuve blanche (multi-items). */
  exam_generation: 1.3,
  /** Import d'un article de blog par IA (mise en page + SEO), par article généré. */
  article: 2.5,
  /** EVC Arena : corrigé PDF d'une manche rédigé par IA à partir des corrigés
   *  de la base (aucune correction inventée), par document généré. */
  arena_corrections: 1,
} as const;

/** Discriminant `ai_generations.feature` des générations facturées au forfait. */
export const GEN_FEATURE = {
  interrogation: 'interrogation_generation',
  epreuve: 'exam_generation',
  article: 'blog_article_generation',
  arenaCorrections: 'arena_corrections_generation',
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
  /** Cours du collège Odontologie ou de l'un de ses sous-collèges. */
  is_odontologie?: boolean;
  has_fiche: boolean;
  n_series: number;
  n_flash: number;
}): { fiche: number; qcm: number; flash: number } {
  const fiche = line.has_fiche ? BILLING_EUR.fiche : 0;
  if (line.is_decouverte) return { fiche, qcm: 0, flash: 0 };
  if (line.is_odontologie) {
    return {
      fiche,
      qcm: line.n_series > 0 ? BILLING_EUR.qcm_per_course_odontologie : 0,
      flash: line.n_flash > 0 ? BILLING_EUR.flashcards_per_course : 0,
    };
  }
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

/**
 * Collège « Odontologie » de Major ECN : copie de la faculté Major Odontologie
 * (cf. scripts/dupliquer-odontologie-vers-ecn.mjs). Ses cours vivent dans des
 * sous-collèges ; la facturation les regroupe sous le nom du collège parent.
 */
export const ODONTOLOGIE_COLLEGE_ID = 'col-ecn-odontologie';
