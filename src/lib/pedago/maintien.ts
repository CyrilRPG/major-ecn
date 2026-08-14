import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import { EDN_FACULTE_ID } from '@/lib/data/navigator';
import { canAccessCollege, type parseScope } from '@/lib/auth/permissions';
import {
  SEUIL_REEVALUATION, requiredReevaluationKind,
  normalizeSpecialtyStatus, type ReevaluationKind, type SpecialtyStatus,
} from '@/lib/pedago/status';

type Scope = ReturnType<typeof parseScope>;
// Les tables du module ne sont pas dans les types générés : client non typé ciblé.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any, any, any>;

/* ────────────────────────────────────────────────────────────────────────────
   Compteurs de maintien des acquis (section 5) — lus depuis la table
   user_revision_stats (maintenue par trigger + cron), avec repli calculé.
   ──────────────────────────────────────────────────────────────────────────── */

export type MaintienStats = {
  /** null = aucune révision transversale terminée (état « jamais révisé »). */
  lastRevision: Date | null;
  /** null si jamais révisé — NE PAS traiter comme « une infinité de jours ». */
  daysSinceLast: number | null;
  revisions30d: number;
  currentStreak: number;
  bestStreak: number;
  totalRevisions: number;
};

export async function getMaintienStats(supabase: AnyClient, userId: string): Promise<MaintienStats> {
  const { data: row } = await supabase
    .from('user_revision_stats')
    .select('last_transversal_revision_date, transversal_revisions_last_30_days, current_consecutive_transversal_revisions, best_consecutive_transversal_revisions, total_transversal_revisions')
    .eq('user_id', userId)
    .maybeSingle();

  if (row) {
    const last = row.last_transversal_revision_date ? new Date(row.last_transversal_revision_date) : null;
    return {
      lastRevision: last,
      daysSinceLast: last ? Math.max(0, Math.floor((Date.now() - last.getTime()) / 86_400_000)) : null,
      revisions30d: row.transversal_revisions_last_30_days ?? 0,
      currentStreak: row.current_consecutive_transversal_revisions ?? 0,
      bestStreak: row.best_consecutive_transversal_revisions ?? 0,
      totalRevisions: row.total_transversal_revisions ?? 0,
    };
  }

  // Repli (élève sans ligne de stats) : calcul direct sur les sessions.
  const { data: sessions } = await supabase
    .from('transversal_sessions')
    .select('completed_at')
    .eq('user_id', userId)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false });
  const rows = (sessions ?? []) as { completed_at: string }[];
  const last = rows.length > 0 ? new Date(rows[0].completed_at) : null;
  const days30Ago = Date.now() - 30 * 86_400_000;
  return {
    lastRevision: last,
    daysSinceLast: last ? Math.max(0, Math.floor((Date.now() - last.getTime()) / 86_400_000)) : null,
    revisions30d: rows.filter((r) => new Date(r.completed_at).getTime() >= days30Ago).length,
    currentStreak: 0,
    bestStreak: 0,
    totalRevisions: rows.length,
  };
}

/* ────────────────────────────────────────────────────────────────────────────
   Blocage des nouveaux contenus (section 15).

   Règle : blocage UNIQUEMENT après 14 jours sans révision transversale, pour
   un élève qui a déjà l'usage des révisions (≥ 1 session terminée). Un élève
   qui n'a JAMAIS fait de révision transversale n'est pas bloqué (l'ancien
   comportement le classait « 60 jours d'absence » dès l'inscription).
   Le blocage est levé dès que la réévaluation exigée est réalisée : elle crée
   une session terminée, daysSinceLast repasse sous 14.
   ──────────────────────────────────────────────────────────────────────────── */

export type MaintienGate =
  | { blocked: false; requiredKind: null; daysSinceLast: number | null }
  | { blocked: true; requiredKind: ReevaluationKind; daysSinceLast: number };

export function gateFromStats(stats: MaintienStats): MaintienGate {
  if (stats.daysSinceLast === null || stats.daysSinceLast < SEUIL_REEVALUATION) {
    return { blocked: false, requiredKind: null, daysSinceLast: stats.daysSinceLast };
  }
  return {
    blocked: true,
    requiredKind: requiredReevaluationKind(stats.daysSinceLast),
    daysSinceLast: stats.daysSinceLast,
  };
}

export async function getMaintienGate(supabase: AnyClient, userId: string): Promise<MaintienGate> {
  return gateFromStats(await getMaintienStats(supabase, userId));
}

/* ────────────────────────────────────────────────────────────────────────────
   Spécialités étudiées — la « spécialité » du cahier des charges est la
   MATIÈRE (collège : cardiologie, pneumologie…), pas l'item de cours.
   ──────────────────────────────────────────────────────────────────────────── */

export type StudiedSpecialty = {
  matiereId: string;
  nom: string;
  coursTotal: number;
  coursStudied: number;
  /** Tous les cours de la spécialité ont été abordés. */
  isFinished: boolean;
  /** Statut OFFICIEL (dernière évaluation officielle), null si jamais évaluée. */
  officialStatus: SpecialtyStatus | null;
  officialPct: number | null;
  officialAt: Date | null;
  /** Terminée mais interrogation officielle non réalisée → « Validation en attente ». */
  awaitingValidation: boolean;
  lastActivity: Date | null;
  attempts30d: number;
  totalAttempts: number;
  correctRatio: number;
  /** Cours étudiés de la spécialité (pour la sélection de questions). */
  studiedCoursIds: string[];
};

export async function getStudiedSpecialties(
  supabase: AnyClient,
  userId: string,
  scope: Scope,
): Promise<StudiedSpecialty[]> {
  const days30Ago = new Date(Date.now() - 30 * 86_400_000).toISOString();

  const [{ data: progressRaw }, { data: attemptsRaw }, { data: evalsRaw }] = await Promise.all([
    supabase
      .from('course_progress')
      .select('cours_id, video_watched, fiche_read, last_seen_at, cours!inner(matiere_id, matieres!inner(id, nom, semestres!inner(faculte_id)))')
      .eq('user_id', userId),
    supabase
      .from('qcm_attempts')
      .select('question_id, is_correct, attempted_at, qcm_questions!inner(qcm_series!inner(cours_id, cours!inner(matiere_id, matieres!inner(id, nom, semestres!inner(faculte_id)))))')
      .eq('user_id', userId),
    supabase
      .from('specialty_evaluations')
      .select('matiere_id, status, score_correct, score_total, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
  ]);

  type Mat = { id: string; nom: string; semestres: { faculte_id: string } };
  type ProgressRow = {
    cours_id: string; video_watched: boolean | null; fiche_read: boolean | null;
    last_seen_at: string | null; cours: { matiere_id: string; matieres: Mat };
  };
  type AttemptRow = {
    question_id: string; is_correct: boolean; attempted_at: string;
    qcm_questions: { qcm_series: { cours_id: string; cours: { matiere_id: string; matieres: Mat } } };
  };
  type EvalRow = { matiere_id: string; status: string; score_correct: number; score_total: number; created_at: string };

  type Acc = {
    nom: string;
    studiedCours: Set<string>;
    lastActivity: Date | null;
    attempts30d: number;
    totalAttempts: number;
    correctAttempts: number;
  };
  const byMatiere = new Map<string, Acc>();
  const touch = (m: Mat): Acc | null => {
    if (m.semestres.faculte_id !== EDN_FACULTE_ID) return null;
    if (!canAccessCollege(scope, m.id)) return null;
    let acc = byMatiere.get(m.id);
    if (!acc) {
      acc = { nom: m.nom, studiedCours: new Set(), lastActivity: null, attempts30d: 0, totalAttempts: 0, correctAttempts: 0 };
      byMatiere.set(m.id, acc);
    }
    return acc;
  };

  for (const p of (progressRaw ?? []) as unknown as ProgressRow[]) {
    if (!p.video_watched && !p.fiche_read) continue;
    const acc = touch(p.cours.matieres);
    if (!acc) continue;
    acc.studiedCours.add(p.cours_id);
    if (p.last_seen_at) {
      const d = new Date(p.last_seen_at);
      if (!acc.lastActivity || d > acc.lastActivity) acc.lastActivity = d;
    }
  }
  for (const a of (attemptsRaw ?? []) as unknown as AttemptRow[]) {
    const serie = a.qcm_questions.qcm_series;
    const acc = touch(serie.cours.matieres);
    if (!acc) continue;
    acc.studiedCours.add(serie.cours_id);
    acc.totalAttempts++;
    if (a.is_correct) acc.correctAttempts++;
    if (a.attempted_at >= days30Ago) acc.attempts30d++;
    const d = new Date(a.attempted_at);
    if (!acc.lastActivity || d > acc.lastActivity) acc.lastActivity = d;
  }

  if (byMatiere.size === 0) return [];

  // Nombre total de cours par spécialité étudiée (détection « terminée »).
  const { data: coursRaw } = await supabase
    .from('cours')
    .select('id, matiere_id')
    .in('matiere_id', [...byMatiere.keys()]);
  const coursTotalByMatiere = new Map<string, number>();
  for (const c of (coursRaw ?? []) as { id: string; matiere_id: string }[]) {
    coursTotalByMatiere.set(c.matiere_id, (coursTotalByMatiere.get(c.matiere_id) ?? 0) + 1);
  }

  // Dernière évaluation officielle par spécialité.
  const latestEval = new Map<string, EvalRow>();
  for (const e of (evalsRaw ?? []) as EvalRow[]) {
    if (!latestEval.has(e.matiere_id)) latestEval.set(e.matiere_id, e);
  }

  const out: StudiedSpecialty[] = [];
  for (const [matiereId, acc] of byMatiere) {
    const coursTotal = coursTotalByMatiere.get(matiereId) ?? 0;
    const ev = latestEval.get(matiereId) ?? null;
    const officialStatus = ev ? normalizeSpecialtyStatus(ev.status) : null;
    const isFinished = coursTotal > 0 && acc.studiedCours.size >= coursTotal;
    out.push({
      matiereId,
      nom: acc.nom,
      coursTotal,
      coursStudied: acc.studiedCours.size,
      isFinished,
      officialStatus,
      officialPct: ev && ev.score_total > 0 ? Math.round((ev.score_correct / ev.score_total) * 100) : null,
      officialAt: ev ? new Date(ev.created_at) : null,
      awaitingValidation: isFinished && !ev,
      lastActivity: acc.lastActivity,
      attempts30d: acc.attempts30d,
      totalAttempts: acc.totalAttempts,
      correctRatio: acc.totalAttempts > 0 ? acc.correctAttempts / acc.totalAttempts : 0,
      studiedCoursIds: [...acc.studiedCours],
    });
  }

  // Tri : insuffisantes d'abord, puis fragiles, puis non évaluées, puis validées.
  const order = (s: SpecialtyStatus | null) =>
    s === 'insuffisante' ? 0 : s === 'fragile' ? 1 : s === null ? 2 : 3;
  out.sort((a, b) => order(a.officialStatus) - order(b.officialStatus) || a.nom.localeCompare(b.nom, 'fr'));
  return out;
}
