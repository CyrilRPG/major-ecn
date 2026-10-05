/**
 * Matrice Major ECN (§3) — module PUR : importance STRUCTURELLE d'un item
 * (aucune faiblesse individuelle), niveau P1–P4 de la voie, charge de travail
 * d'acquisition. Le score I de l'orchestrateur en découle (§9).
 */
import { MATRIX_CRITERIA, type MatrixCriteria, type PlanParams } from './config';
import type { CompetencyTag, PriorityLevel, Voie } from './model';

/** Item tel que la matrice le décrit (sous-ensemble de `plan_items`). */
export type MatrixItem = {
  id: string;
  criteres: Partial<MatrixCriteria> | null;
  score_interne: number | null;
  score_externe: number | null;
  priorite_interne: PriorityLevel | null;
  priorite_externe: PriorityLevel | null;
  /** Pertinence 2026 (0–5), distincte de l'historique (§3), active seulement si activée au back-office. */
  pertinence_2026?: number | null;
  pertinence_2026_active?: boolean | null;
  temps_reference: number | null;
  volume: number;
};

export function completeCriteria(c: Partial<MatrixCriteria> | null | undefined): c is MatrixCriteria {
  return !!c && MATRIX_CRITERIA.every((k) => typeof c[k] === 'number' && Number.isFinite(c[k]));
}

/**
 * Critères effectifs : quand la pertinence 2026 est activée pour l'item, elle
 * remplace l'historique EVC lorsqu'elle lui est supérieure — un nouvel item
 * 2026 (déontologie, certificats…) peut être fortement pondéré sans historique
 * (§4) ; un historique nul ne vaut jamais priorité nulle.
 */
export function effectiveCriteria(item: MatrixItem): Partial<MatrixCriteria> | null {
  if (!item.criteres) return null;
  const c = { ...item.criteres };
  if (item.pertinence_2026_active && typeof item.pertinence_2026 === 'number' && Number.isFinite(item.pertinence_2026)) {
    c.historique = Math.max(c.historique ?? 0, Math.max(0, Math.min(5, item.pertinence_2026)));
  }
  return c;
}

/**
 * Score structurel voie-spécifique (/100) : Σ poids × critère / (5 × Σ poids)
 * (profils §3.1), pertinence 2026 incluse. À défaut de critères complets, le
 * score importé de la voie ; voie inconnue : moyenne des deux profils.
 */
export function structuralScore(item: MatrixItem, voie: Voie | null, p: PlanParams): number | null {
  if (!voie) {
    const a = structuralScore(item, 'interne', p);
    const b = structuralScore(item, 'externe', p);
    return a === null || b === null ? (a ?? b) : Math.round(((a + b) / 2) * 10) / 10;
  }
  const c = effectiveCriteria(item);
  if (completeCriteria(c)) {
    const w = p.matrix.voie_weights[voie];
    const total = MATRIX_CRITERIA.reduce((n, k) => n + w[k], 0);
    if (total > 0) {
      const sum = MATRIX_CRITERIA.reduce((n, k) => n + w[k] * Math.max(0, Math.min(5, c[k])), 0);
      return Math.round((sum / (5 * total)) * 1000) / 10;
    }
  }
  const stored = voie === 'interne' ? item.score_interne : item.score_externe;
  if (stored === null || stored === undefined || !Number.isFinite(Number(stored))) return null;
  // Matrice versionnée sans critères complets : la pertinence 2026 activée relève le score importé.
  const base = Number(stored);
  if (item.pertinence_2026_active && typeof item.pertinence_2026 === 'number') return Math.max(base, Math.min(100, item.pertinence_2026 * 20));
  return base;
}

/** Niveau P1–P4 : celui que la matrice fixe pour la voie, sinon déduit du score structurel. */
export function priorityLevel(item: MatrixItem, voie: Voie | null, p: PlanParams): PriorityLevel {
  const fixed = voie === 'interne' ? item.priorite_interne : voie === 'externe' ? item.priorite_externe : (item.priorite_interne ?? item.priorite_externe);
  if (fixed === 'P1' || fixed === 'P2' || fixed === 'P3' || fixed === 'P4') return fixed;
  const s = structuralScore(item, voie, p) ?? 0;
  if (s >= p.matrix.levels.p1) return 'P1';
  if (s >= p.matrix.levels.p2) return 'P2';
  if (s >= p.matrix.levels.p3) return 'P3';
  return 'P4';
}

/** Durée de référence de l'acquisition d'un item (temps de référence de la matrice, sinon classe de charge). */
export function learnReferenceMinutes(item: Pick<MatrixItem, 'temps_reference' | 'volume'>, p: PlanParams): number {
  if (item.temps_reference && item.temps_reference > 0) return item.temps_reference;
  const key = String(Math.max(1, Math.min(5, Math.round(item.volume || 3)))) as keyof PlanParams['durations']['learn_by_volume'];
  return p.durations.learn_by_volume[key];
}

/** Moteur : item prêt à orchestrer et à planifier. */
export type EngineItem = {
  id: string;
  name: string;
  /** Domaine (référentiel HIERARCHICAL) ; null en structure plate. */
  domainId: string | null;
  coursId: string | null;
  level: PriorityLevel;
  /** Score structurel /100 (I × 100). */
  structural: number;
  hardPriority: boolean;
  /** Acquisition d'un item jamais travaillé (min, avant facteur de maîtrise et vitesse). */
  learnMinutes: number;
  incontournables: string[];
  prerequisites: { itemId: string; blocking: boolean }[];
  mandatory: Partial<Record<CompetencyTag, number>>;
  content: ItemContent;
  order: number;
};

/** Ressources réellement disponibles pour l'item (dimensionnement des unités). */
export type ItemContent = {
  flashcards: number;
  questions: number;
  /** Part de QROC dans le vivier accessible au candidat (0–1). */
  qrocShare: number;
  /** Séries d'entraînement (dossiers progressifs, annales) : identifiant, libellé, nombre de questions. */
  practice: { id: string; label: string; questions: number; kind: 'dp' | 'annale' | 'serie'; done: boolean }[];
};

export const EMPTY_CONTENT: ItemContent = { flashcards: 0, questions: 0, qrocShare: 0, practice: [] };

/** Compteur hard_priority (§9.5) : part des items actifs ; alerte au-delà de 5 %, blocage de publication au-delà de 10 %. */
export function hardPriorityStatus(total: number, hard: number, p: PlanParams): { share: number; alert: boolean; blocked: boolean } {
  const share = total > 0 ? hard / total : 0;
  return { share, alert: share > p.hard_priority.alert_share + 1e-9, blocked: share > p.hard_priority.block_share + 1e-9 };
}
