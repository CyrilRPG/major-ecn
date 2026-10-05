/**
 * Vue d'un item pour le planificateur — module PUR.
 *
 * L'état de maîtrise est celui du MOTEUR PÉDAGOGIQUE CENTRAL
 * (candidate_item_state, Orchestrateur V1.0 : non évalué / à revoir / à
 * consolider / en bonne voie / maîtrise consolidée). Le planificateur n'en
 * tient aucune copie : il y ajoute seulement ce qui lui appartient —
 * l'auto-évaluation du candidat (§5), l'acquisition faite dans le planning, la
 * préférence, le retrait ou la version courte (cahier « Alertes » §40).
 *
 * Hiérarchie (§5.4) : PERFORMANCE_OBSERVED (statut observé par le moteur
 * central) > ITEM_EXPLICIT > SPECIALTY_INHERITED. Tant que le moteur central
 * n'a rien observé, l'interface montre « Votre estimation ».
 */
import type { MasteryStatus as CentralStatus } from '@/lib/moteur/types';
import { STATUS_LABEL as CENTRAL_STATUS_LABEL } from '@/lib/moteur/types';
import type { DayKey } from './clock';
import { SELF_LEVEL_ITEM_LABEL, type SelfAssessmentSource, type SelfLevel } from './model';

export type { CentralStatus };
export { CENTRAL_STATUS_LABEL };

/** Intensité de travail d'un item (facteurs de durée §14). */
export type WorkLevel = 'NEW' | 'REVIEW' | 'CONSOLIDATE' | 'ON_TRACK' | 'CONSOLIDATED';

export type PlanItemView = {
  itemId: string;
  /** Statut du moteur central ('non_evalue' sans observation). */
  central: CentralStatus;
  /** Le moteur central a observé des résultats réels sur l'item. */
  observed: boolean;
  self: SelfLevel;
  selfSource: SelfAssessmentSource | null;
  /** Réponse à « Avez-vous déjà travaillé cet item ? ». */
  workedHint: 'YES' | 'NO' | 'UNSURE' | null;
  /** Acquisition faite dans le planning (activité « Nouveau » menée à son terme). */
  acquired: boolean;
  /** Minutes d'acquisition déjà réalisées (blocs terminés, acquisition inachevée). */
  learnDone: number;
  workLevel: WorkLevel;
  /** Non évalué ni observé : « non renseigné » n'est jamais « jamais travaillé ». */
  unknown: boolean;
  /** Questions ratées non encore réussies depuis (marques d'erreur du moteur central), plus récentes d'abord. */
  openErrors: string[];
  controlPending: boolean;
  /** Prochaine réactivation programmée par le moteur central. */
  nextReviewOn: DayKey | null;
  excluded: boolean;
  shortVersion: boolean;
  difficulty: number;
  lastActivityAt: string | null;
};

export type CentralStateLite = {
  status: CentralStatus;
  errors: { at: string; q: string | null }[];
  positives: { at: string; q: string | null }[];
  weakErrors: { at: string; q: string }[];
  controlPending: boolean;
  lastActivityAt: string | null;
};

export type PlannerItemRow = {
  self_assessment_level: SelfLevel;
  self_assessment_source: SelfAssessmentSource | null;
  worked_hint: 'YES' | 'NO' | 'UNSURE' | null;
  acquisition_completed_at: string | null;
  learn_minutes_done: number;
  excluded_at: string | null;
  short_version: boolean;
  difficulty_count: number;
};

/** Niveau de travail : statut observé d'abord, sinon l'auto-évaluation (et l'acquisition faite). */
export function workLevelOf(central: CentralStatus, self: SelfLevel, acquired: boolean): WorkLevel {
  switch (central) {
    case 'a_revoir': return 'REVIEW';
    case 'a_consolider': return 'CONSOLIDATE';
    case 'en_bonne_voie': return 'ON_TRACK';
    case 'maitrise_consolidee': return 'CONSOLIDATED';
    case 'non_evalue':
      if (acquired) return 'CONSOLIDATE';
      switch (self) {
        case 'NOT_WORKED':
        case 'NOT_EVALUATED': return 'NEW';
        case 'WEAK': return 'REVIEW';
        case 'TO_CONSOLIDATE': return 'CONSOLIDATE';
        case 'GOOD':
        case 'VERY_GOOD': return 'ON_TRACK';
      }
  }
}

/** Questions ratées dont aucune réussite n'a suivi (une erreur = une action, I§6). */
export function openErrorQuestions(c: Pick<CentralStateLite, 'errors' | 'positives' | 'weakErrors'> | null): string[] {
  if (!c) return [];
  const lastOk = new Map<string, string>();
  for (const p of c.positives) if (p.q && (!lastOk.has(p.q) || p.at > lastOk.get(p.q)!)) lastOk.set(p.q, p.at);
  const errs = [...c.errors.filter((e): e is { at: string; q: string } => !!e.q), ...c.weakErrors];
  const byQ = new Map<string, string>();
  for (const e of errs) if (!byQ.has(e.q) || e.at > byQ.get(e.q)!) byQ.set(e.q, e.at);
  return Array.from(byQ.entries())
    .filter(([q, at]) => !lastOk.has(q) || lastOk.get(q)! < at)
    .sort((a, b) => b[1].localeCompare(a[1]) || a[0].localeCompare(b[0]))
    .map(([q]) => q);
}

export function itemView(itemId: string, central: CentralStateLite | null, row: PlannerItemRow | null, nextReviewOn: DayKey | null): PlanItemView {
  const status: CentralStatus = central?.status ?? 'non_evalue';
  const self: SelfLevel = row?.self_assessment_level ?? 'NOT_EVALUATED';
  const acquired = !!row?.acquisition_completed_at;
  const observed = status !== 'non_evalue';
  return {
    itemId,
    central: status,
    observed,
    self,
    selfSource: row?.self_assessment_source ?? null,
    workedHint: row?.worked_hint ?? null,
    acquired,
    learnDone: Math.max(0, row?.learn_minutes_done ?? 0),
    workLevel: workLevelOf(status, self, acquired),
    unknown: !observed && !acquired && self === 'NOT_EVALUATED',
    openErrors: openErrorQuestions(central),
    controlPending: !!central?.controlPending,
    nextReviewOn,
    excluded: !!row?.excluded_at,
    shortVersion: !!row?.short_version,
    difficulty: row?.difficulty_count ?? 0,
    lastActivityAt: central?.lastActivityAt ?? null,
  };
}

/** Item « couvert » (§19, §31) : observé, acquis, ou déclaré au moins « à consolider ». */
export function isCoveredView(v: Pick<PlanItemView, 'observed' | 'acquired' | 'self'>): boolean {
  return v.observed || v.acquired || v.self === 'TO_CONSOLIDATE' || v.self === 'GOOD' || v.self === 'VERY_GOOD';
}

/** Item « travaillé » (phases du §12) : tout sauf jamais travaillé / non évalué sans preuve. */
export function isWorkedView(v: Pick<PlanItemView, 'observed' | 'acquired' | 'self'>): boolean {
  return v.observed || v.acquired || (v.self !== 'NOT_WORKED' && v.self !== 'NOT_EVALUATED');
}

/**
 * Ce que voit le candidat : le niveau observé par Major ECN dès qu'il existe,
 * sinon son estimation (jamais un score brut, §33).
 */
export function displayLevel(v: Pick<PlanItemView, 'observed' | 'central' | 'self' | 'acquired'>): { kind: 'observed' | 'estimate' | 'none'; label: string } {
  if (v.observed) return { kind: 'observed', label: CENTRAL_STATUS_LABEL[v.central] };
  if (v.self !== 'NOT_EVALUATED') return { kind: 'estimate', label: SELF_LEVEL_ITEM_LABEL[v.self] };
  return { kind: 'none', label: v.acquired ? 'Acquisition faite' : 'Non évalué' };
}
