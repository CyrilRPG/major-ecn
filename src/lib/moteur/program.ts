/**
 * Programme du jour unique (O§1, O§19, O§20, O§28 ; I§31, I§52, I§53) —
 * module PUR.
 *
 * Le tableau de bord répond à « Que dois-je faire aujourd'hui ? » : UNE
 * liste qui fusionne les obligations du planificateur, les réactivations
 * dues et les contrôles / révisions en attente, avec la durée totale estimée
 * et l'origine de chaque activité. Une même activité satisfait plusieurs
 * besoins (une révision ciblée d'un item couvre sa révision, son contrôle et
 * sa réactivation). La charge respecte un budget en minutes ; ce qui ne tient
 * pas reste au backlog, sans jamais s'empiler (pas de dette).
 */
import { compareByPriority, effectivePriority } from './priority';
import type { NeedObjective, OrchestratorConfig } from './types';

export type ProgramNeed = {
  id: string;
  itemId: string;
  itemName: string;
  objective: NeedObjective;
  needType: 'review' | 'consolidate' | 'reactivate' | 'evaluate';
  priorityScore: number;
  rank: number;
  minutes: number;
  reasons: string[];
  dueAt: string | null;
  createdAt: string;
};

export type ProgramPlannerSession = {
  id: string;
  /** Item (cours) : clé commune avec les besoins centraux. */
  itemId: string | null;
  itemName: string;
  kindLabel: string;
  minutes: number;
  status: 'planifiee' | 'en_cours' | 'terminee';
  reason: string;
  href: string;
};

export type ProgramInProgress =
  | { kind: 'checkup_correction'; id: string; label: string }
  | { kind: 'checkup_active'; id: string; label: string }
  | { kind: 'transversal'; label: string; href: string };

export type ProgramActivity = {
  key: string;
  itemId: string | null;
  itemName: string;
  kind: 'en_cours' | 'concours_blanc' | 'planificateur' | 'revision' | 'consolidation' | 'reactivation' | 'controle' | 'suggestion';
  label: string;
  minutes: number;
  /** Raisons courtes, toutes conservées (O§33, I§35). */
  reasons: string[];
  /** Origines lisibles : « Planificateur », « Réactivation », « Contrôle »… */
  origins: string[];
  needIds: string[];
  plannerSessionId: string | null;
  href: string;
  done: boolean;
  priority: number;
};

export type ProgramInput = {
  today: string;
  /** Budget du jour (minutes) : disponibilités du planificateur ou temps du jour du candidat. */
  budgetMinutes: number;
  plannerActive: boolean;
  plannerSessions: ProgramPlannerSession[];
  needs: ProgramNeed[];
  inProgress: ProgramInProgress[];
  /** Suggestions de repli quand rien n'est dû (révision du jour, Check-up recommandé…). */
  suggestions: { key: string; label: string; minutes: number; href: string; reason: string }[];
  /** Concours blancs programmés aujourd'hui (O§12, O§25) : activité principale, journée allégée. */
  exams?: { id: string; label: string; minutes: number; href: string }[];
  config: OrchestratorConfig;
};

export type Program = {
  activities: ProgramActivity[];
  totalMinutes: number;
  remainingMinutes: number;
  budgetMinutes: number;
  /** Besoins actifs non programmés aujourd'hui (backlog centralisé). */
  backlog: number;
  /** Nombre d'items qui nécessitent actuellement l'attention du candidat (I§31). */
  attentionItems: number;
};

const ORIGIN: Record<NeedObjective, string> = { travail: 'Révision', reactivation: 'Réactivation', controle: 'Contrôle' };

export function revisionHref(itemId: string): string {
  return `/revisions-transversales/ciblee?item=${encodeURIComponent(itemId)}`;
}

/** Durée d'une activité fusionnée : la plus longue, + 5 min par objectif supplémentaire (30 min au plus). */
export function mergedMinutes(minutes: number[]): number {
  if (minutes.length === 0) return 0;
  const base = Math.max(...minutes);
  return Math.min(Math.max(base, 30), base + 5 * (minutes.length - 1));
}

function activityKind(objectives: Set<NeedObjective>, needTypes: Set<string>): ProgramActivity['kind'] {
  if (objectives.has('travail')) return needTypes.has('review') ? 'revision' : 'consolidation';
  if (objectives.has('controle')) return 'controle';
  return 'reactivation';
}

const KIND_LABEL: Record<ProgramActivity['kind'], string> = {
  en_cours: 'À terminer', concours_blanc: 'Concours blanc', planificateur: 'Planificateur', revision: 'Révision prioritaire', consolidation: 'Consolidation',
  reactivation: 'Réactivation', controle: 'Contrôle', suggestion: 'Suggestion',
};

export function composeProgram(input: ProgramInput): Program {
  const cfg = input.config;
  const activities: ProgramActivity[] = [];
  const margin = 1 - cfg.program.margin_pct / 100;
  const budget = Math.max(0, Math.round(input.budgetMinutes * margin));
  let used = 0;

  // 1. Activité commencée (Check-up à corriger ou en cours, révision interrompue).
  for (const p of input.inProgress) {
    const href = p.kind === 'transversal' ? p.href : p.kind === 'checkup_correction' ? `/checkup/${p.id}/correction` : `/checkup/${p.id}`;
    activities.push({
      key: `en_cours:${p.kind}:${'id' in p ? p.id : p.href}`, itemId: null, itemName: p.label, kind: 'en_cours', label: KIND_LABEL.en_cours,
      minutes: p.kind === 'checkup_correction' ? 10 : 15, reasons: [p.kind === 'checkup_correction' ? 'Vous avez une correction à terminer.' : 'Activité commencée : reprenez là où vous vous êtes arrêté.'],
      origins: [p.kind === 'transversal' ? 'Révisions transversales' : 'EVC Check-up'], needIds: [], plannerSessionId: null, href, done: false, priority: 1000,
    });
  }

  // 1 bis. Concours blanc programmé : il devient l'activité principale et allège le reste de la journée.
  let examMinutes = 0;
  for (const e of input.exams ?? []) {
    activities.push({
      key: `concours:${e.id}`, itemId: null, itemName: e.label, kind: 'concours_blanc', label: KIND_LABEL.concours_blanc, minutes: e.minutes,
      reasons: ['Concours blanc programmé aujourd’hui : c’est votre activité principale, le reste de la journée est allégé.'],
      origins: ['Épreuves blanches'], needIds: [], plannerSessionId: null, href: e.href, done: false, priority: 900,
    });
    examMinutes += e.minutes;
  }

  // 2. Besoins centraux regroupés PAR ITEM : une seule action par item, toutes raisons conservées.
  const byItem = new Map<string, ProgramNeed[]>();
  for (const n of input.needs) byItem.set(n.itemId, [...(byItem.get(n.itemId) ?? []), n]);
  type Group = { itemId: string; itemName: string; needs: ProgramNeed[]; score: number; rank: number; createdAt: string; key: string };
  const groups: Group[] = Array.from(byItem.entries()).map(([itemId, needs]) => {
    const best = [...needs].sort((a, b) => effectivePriority(b.priorityScore, b.rank, cfg) - effectivePriority(a.priorityScore, a.rank, cfg))[0];
    return {
      itemId, itemName: best.itemName, needs, score: Math.max(...needs.map((n) => n.priorityScore)), rank: Math.min(...needs.map((n) => n.rank)),
      createdAt: needs.map((n) => n.createdAt).sort()[0], key: itemId,
    };
  }).sort(compareByPriority(cfg));

  const toActivity = (g: Group): ProgramActivity => {
    const objectives = new Set(g.needs.map((n) => n.objective));
    const needTypes = new Set(g.needs.map((n) => n.needType));
    const kind = activityKind(objectives, needTypes);
    const reasons = Array.from(new Set(g.needs.flatMap((n) => n.reasons))).slice(0, 4);
    return {
      key: `besoin:${g.itemId}`, itemId: g.itemId, itemName: g.itemName, kind, label: KIND_LABEL[kind],
      minutes: mergedMinutes(g.needs.map((n) => n.minutes)), reasons,
      origins: Array.from(objectives).map((o) => ORIGIN[o]), needIds: g.needs.map((n) => n.id), plannerSessionId: null,
      href: revisionHref(g.itemId), done: false, priority: effectivePriority(g.score, g.rank, cfg),
    };
  };

  const consumed = new Set<string>();
  // 3. Planificateur actif : il est l'agenda. Ses séances du jour forment l'ossature ;
  //    les besoins centraux d'un item déjà programmé s'y rattachent (une seule action).
  if (input.plannerActive) {
    for (const s of input.plannerSessions) {
      const g = s.itemId ? groups.find((x) => x.itemId === s.itemId) : undefined;
      if (g) consumed.add(g.itemId);
      const extra = g ? toActivity(g) : null;
      activities.push({
        key: `plan:${s.id}`, itemId: s.itemId, itemName: s.itemName, kind: 'planificateur', label: s.kindLabel, minutes: s.minutes,
        reasons: [s.reason, ...(extra?.reasons ?? [])].filter(Boolean).slice(0, 5),
        origins: ['Planificateur', ...(extra?.origins ?? [])], needIds: extra?.needIds ?? [], plannerSessionId: s.id,
        href: s.href, done: s.status === 'terminee', priority: 500,
      });
      if (s.status !== 'terminee') used += s.minutes;
    }
  }

  // 4. Besoins restants, par priorité, dans le budget (avec planificateur : temps réservé hors agenda).
  //    Un jour de concours blanc, sa durée est retirée du budget (journée allégée).
  const extraBudget = input.plannerActive ? Math.max(0, Math.round(cfg.program.extra_minutes_with_planner * margin) - examMinutes) : budget;
  used += input.plannerActive ? 0 : examMinutes;
  let extraUsed = 0;
  let count = activities.filter((a) => !a.done).length;
  let backlog = 0;
  for (const g of groups) {
    if (consumed.has(g.itemId)) continue;
    const a = toActivity(g);
    const room = input.plannerActive ? extraBudget - extraUsed : budget - used;
    if (count >= cfg.program.max_activities || a.minutes > room) { backlog += g.needs.length; continue; }
    activities.push(a);
    count++;
    if (input.plannerActive) extraUsed += a.minutes; else used += a.minutes;
  }

  // 5. Rien de dû : une suggestion de repli (toujours proposer une solution).
  if (activities.filter((a) => !a.done).length === 0) {
    for (const sug of input.suggestions.slice(0, 2)) {
      activities.push({
        key: `suggestion:${sug.key}`, itemId: null, itemName: sug.label, kind: 'suggestion', label: KIND_LABEL.suggestion,
        minutes: sug.minutes, reasons: [sug.reason], origins: ['Suggestion'], needIds: [], plannerSessionId: null, href: sug.href, done: false, priority: 0,
      });
    }
  }

  const todo = activities.filter((a) => !a.done);
  const total = activities.reduce((n, a) => n + a.minutes, 0);
  return {
    activities,
    totalMinutes: total,
    remainingMinutes: todo.reduce((n, a) => n + a.minutes, 0),
    budgetMinutes: input.budgetMinutes,
    backlog,
    attentionItems: groups.length,
  };
}

/**
 * Activité principale du bouton « Commencer ma journée » : la première
 * activité non terminée (activité commencée, puis planificateur, puis besoin
 * le plus prioritaire).
 */
export function firstActivity(program: Program): ProgramActivity | null {
  return program.activities.find((a) => !a.done) ?? null;
}
