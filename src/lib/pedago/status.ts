/**
 * Statuts officiels de spécialité — vocabulaire CANONIQUE du cahier des charges.
 *
 * La base écrit exclusivement : 'validee' | 'fragile' | 'insuffisante'
 * (contrainte CHECK de specialty_evaluations). Certains anciens écrans
 * testaient 'consolider' / 'renforcer' — valeurs qui n'ont jamais existé en
 * base : ce module est LE point unique de normalisation pour que plus aucun
 * lecteur ne divorce du vocabulaire écrit.
 *
 * Correspondance cahier des charges :
 *   validee      → vert   → « Spécialité validée »
 *   fragile      → orange → « Spécialité fragile » → action : consolidation
 *   insuffisante → rouge  → « Insuffisamment maîtrisée » → action : renforcement
 */

export type SpecialtyStatus = 'validee' | 'fragile' | 'insuffisante';

/** Normalise une valeur lue en base (tolère l'ancien vocabulaire des écrans). */
export function normalizeSpecialtyStatus(raw: string | null | undefined): SpecialtyStatus | null {
  if (raw === 'validee') return 'validee';
  if (raw === 'fragile' || raw === 'consolider') return 'fragile';
  if (raw === 'insuffisante' || raw === 'renforcer') return 'insuffisante';
  return null;
}

/** Statut résultant d'un score d'évaluation officielle (sections 10-12). */
export function statusFromPct(pct: number): SpecialtyStatus {
  if (pct >= 75) return 'validee';
  if (pct >= 50) return 'fragile';
  return 'insuffisante';
}

export type ScoreTier = 'green' | 'orange' | 'red';

/** Palier de couleur d'un score (sections 4, 6-8). */
export function tierFromPct(pct: number): ScoreTier {
  if (pct >= 75) return 'green';
  if (pct >= 50) return 'orange';
  return 'red';
}

export const STATUS_META: Record<SpecialtyStatus | 'non_evaluee', {
  dot: string; label: string; actionLabel: string | null;
}> = {
  validee: { dot: '#16793C', label: 'Validée', actionLabel: null },
  fragile: { dot: '#E8742C', label: 'Fragile', actionLabel: 'Consolider la spécialité' },
  insuffisante: { dot: '#A91D2C', label: 'Insuffisamment maîtrisée', actionLabel: 'Renforcement approfondi' },
  non_evaluee: { dot: '#9AA1AE', label: 'Non évaluée', actionLabel: null },
};

/* ────────────────────────────────────────────────────────────────────────────
   Maintien des acquis — seuils d'absence (section 5) et formats de session.
   ──────────────────────────────────────────────────────────────────────────── */

export const SEUIL_REEVALUATION = 14;
export const SEUIL_REEVALUATION_APPROFONDIE = 30;
export const SEUIL_BILAN_GLOBAL = 60;

export type ReevaluationKind = 'reevaluation' | 'reevaluation_deep' | 'bilan_global';

/** Réévaluation exigée selon le nombre de jours sans révision transversale. */
export function requiredReevaluationKind(days: number): ReevaluationKind {
  if (days >= SEUIL_BILAN_GLOBAL) return 'bilan_global';
  if (days >= SEUIL_REEVALUATION_APPROFONDIE) return 'reevaluation_deep';
  return 'reevaluation';
}

/** Tailles de session selon le nombre de SPÉCIALITÉS (matières) étudiées — section 2 zone 3. */
export function sessionSizesFor(nSpecialties: number): {
  daily: number; recommended: number | null; intensive: number | null;
} {
  if (nSpecialties <= 5) return { daily: 25, recommended: null, intensive: null };
  if (nSpecialties <= 10) return { daily: 30, recommended: 50, intensive: null };
  if (nSpecialties <= 15) return { daily: 35, recommended: 60, intensive: null };
  return { daily: 40, recommended: 75, intensive: 120 };
}

/** Nombre de questions d'une session selon son type (sections 2 et 5-8). */
export function transversalSessionSize(
  kind: 'daily' | 'recommended' | 'intensive' | ReevaluationKind,
  nSpecialties: number,
): number {
  if (kind === 'intensive') return 120;
  if (kind === 'reevaluation') return 30;
  if (kind === 'reevaluation_deep') return 50;
  if (kind === 'bilan_global') return 75;
  const sizes = sessionSizesFor(nSpecialties);
  if (kind === 'recommended') return sizes.recommended ?? sizes.daily;
  return sizes.daily;
}
