import 'server-only';
import { parseScope } from '@/lib/auth/permissions';
import { uniteIncomplete, type QuestionLisible } from '@/lib/qcm/donnees-manquantes';
import { coursCatalog, getCheckupConfig, getOrchestratorConfig, insertEvents, moteurDb } from '@/lib/moteur/server/db';
import { candidateContext } from '@/lib/moteur/server/candidate';
import { buildUnits, composeExterne, composeInterne, computeGauge, type ComposedQuestion, type Gauge, type Unit } from '../composition';
import { aggregate, isBlankText, normalizeSelection, scoreQcm, scoreQroc } from '../scoring';
import { analyseLisible, analyze, shouldRecommendCheckup, synthesis, type CheckupAnalysis, type ResultQuestion } from '../results';
import {
  FORMAT_VOIE, FORMATS_OF_VOIE, TEXTS, formatSpec,
  type BankFamily, type CheckupConfig, type CheckupFormat, type CheckupMode, type CheckupStatus, type QuestionResult, type QuestionType, type Voie,
} from '../types';
import { accessibleSpecialties, exposuresFor, familyOf, poolForCandidate, specialtyPool } from './pool';
import { emitCheckupSignals, neutralizeSignals } from './signals';

/**
 * EVC Check-up — cycle de vie complet, côté serveur :
 *  lancement (jauge, composition, questions FIGÉES) → passation (chronomètre
 *  serveur, sauvegarde de chaque réponse, une seule session active, appareil
 *  de départ, dossiers progressifs verrouillés) → soumission (volontaire ou
 *  automatique à 00:00) → auto-correction des QROC rédigées
 *  (pending_self_review) → résultat, analyse, plan de reprise.
 * Les bonnes réponses ne quittent jamais le serveur avant la soumission.
 */

export type ProfileLite = { id: string; role: string; permission_scope: unknown };

export type SessionRow = {
  id: string; user_id: string; voie: Voie; specialite_id: string; mode: CheckupMode; scope_kind: 'global' | 'cible'; category_ids: string[]; item_ids: string[];
  format: CheckupFormat; planned_seconds: number; question_count: number; block_count: number | null; started_at: string; deadline_at: string;
  submitted_at: string | null; ended_reason: string | null; status: CheckupStatus; self_review_completed_at: string | null; completed_at: string | null;
  duration_seconds: number | null; score_percent: number | null; points_obtained: number | null; points_possible: number | null;
  qcm_points_obtained: number | null; qcm_points_possible: number | null; device_id: string; alerts_sent: number[]; composition: Record<string, unknown>;
  results: CheckupAnalysis | null; recommendations: Record<string, unknown> | null; actions: unknown[]; neutralized_reason: string | null;
  neutralized_at: string | null; qcm_signals_emitted_at: string | null; signals_emitted_at: string | null; created_at: string;
};

export type Snapshot = {
  enonce: string;
  images: string[];
  vignette: string | null;
  serie_label: string | null;
  items: { lettre: string; enonce: string; is_correct: boolean; justification: string | null; images: string[] }[];
  reponse_attendue: string | null;
  correction_generale: string | null;
  commentaire_enseignant: string | null;
  item_name: string | null;
  category_name: string | null;
};

export type QuestionRow = {
  id: string; session_id: string; position: number; block_index: number; dossier_id: string | null; question_order: number | null; dossier_size: number | null;
  question_id: string | null; canonical_question_id: string; content_source: BankFamily; item_id: string | null; category_id: string | null; speciality_id: string;
  priority_level: number | null; question_type: QuestionType; annale_year: number | null; snapshot: Snapshot; presented_at: string | null; answer: { selected?: string[]; text?: string } | null;
  answered_at: string | null; marked_review: boolean; locked_at: string | null; self_grade: QuestionResult | null; self_graded_at: string | null;
  result: QuestionResult | null; points: number | null; discordances: number | null; origin: 'auto' | 'auto_evaluee' | 'vide' | null;
  seen_before: boolean; days_since_last_seen: number | null; signal_strength: string | null;
};

const db = () => moteurDb();
const nowIso = () => new Date().toISOString();

export class CheckupError extends Error {
  constructor(message: string, public code: 'introuvable' | 'autre_appareil' | 'expire' | 'verrouille' | 'banque_insuffisante' | 'invalide' | 'deja_active' | 'acces') {
    super(message);
  }
}

/* ─── Lancement : options, jauge ─── */

export type LaunchOptions = {
  voie: Voie | null;
  formats: CheckupFormat[];
  specialties: { id: string; nom: string; categories: { id: string; nom: string }[]; items: { id: string; nom: string; categoryId: string | null; stars: number }[] }[];
  active: { id: string; deadline_at: string } | null;
  pendingCorrections: { id: string; started_at: string }[];
  recommendation: { recommend: boolean; reason: string | null };
};

export async function launchOptions(profile: ProfileLite): Promise<LaunchOptions> {
  const scope = parseScope(profile.permission_scope);
  const voie = scope.voie ?? null;
  const specs = await accessibleSpecialties(profile.permission_scope);
  const { byId, parentOf, names } = await coursCatalog();
  const specialties = specs.map((s) => {
    const fam = new Set(familyOf(s.id, parentOf));
    const categories = Array.from(fam).filter((id) => id !== s.id).map((id) => ({ id, nom: names.get(id) ?? id })).sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
    const items = Array.from(byId.values())
      .filter((c) => fam.has(c.matiere_id) && /^(?!annales?\b|replays?\s*-|r[ée]visions?\s*-|entra[iî]nements?\s+transversa|d[ée]couverte\b)/i.test(c.titre.trim()) && !/\bDESC?\b/.test(c.titre))
      .map((c) => ({ id: c.id, nom: c.titre, categoryId: c.categoryId, stars: c.importance }))
      .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
    return { id: s.id, nom: s.nom, categories, items };
  }).filter((s) => s.items.length >= 1);
  const [{ data: active }, { data: pending }, recommendation] = await Promise.all([
    db().from('checkup_sessions').select('id, deadline_at').eq('user_id', profile.id).eq('status', 'active').maybeSingle(),
    db().from('checkup_sessions').select('id, started_at').eq('user_id', profile.id).eq('status', 'pending_self_review').order('started_at', { ascending: false }),
    checkupRecommendation(profile.id),
  ]);
  return {
    voie, formats: voie ? FORMATS_OF_VOIE[voie] : (['interne_40_60', 'externe_3_60', 'externe_5_120'] as CheckupFormat[]),
    specialties, active: (active as LaunchOptions['active']) ?? null, pendingCorrections: (pending ?? []) as LaunchOptions['pendingCorrections'], recommendation,
  };
}

export type LaunchParams = { specialiteId: string; mode: CheckupMode; categoryIds: string[]; itemIds: string[]; format: CheckupFormat };

/** Validation du périmètre demandé : rien hors de la formule, aucun élargissement silencieux. */
async function validateParams(profile: ProfileLite, p: LaunchParams): Promise<{ voie: Voie }> {
  const scope = parseScope(profile.permission_scope);
  const specs = await accessibleSpecialties(profile.permission_scope);
  if (!specs.some((s) => s.id === p.specialiteId)) throw new CheckupError('Cette spécialité ne fait pas partie de votre formule.', 'acces');
  const voie = FORMAT_VOIE[p.format];
  if (scope.voie && scope.voie !== voie) throw new CheckupError('Ce format ne correspond pas à votre voie d’EVC.', 'invalide');
  const { byId, parentOf } = await coursCatalog();
  const fam = new Set(familyOf(p.specialiteId, parentOf));
  if (p.mode === 'categories') {
    if (p.categoryIds.length === 0) throw new CheckupError('Choisissez au moins une catégorie.', 'invalide');
    if (p.categoryIds.some((c) => !fam.has(c) || c === p.specialiteId)) throw new CheckupError('Catégorie invalide.', 'invalide');
  }
  if (p.mode === 'items') {
    if (p.itemIds.length === 0) throw new CheckupError('Choisissez au moins un item.', 'invalide');
    if (p.itemIds.some((i) => !byId.has(i) || !fam.has(byId.get(i)!.matiere_id))) throw new CheckupError('Item invalide.', 'invalide');
  }
  return { voie };
}

async function unitsFor(profile: ProfileLite, p: LaunchParams, voie: Voie, config: CheckupConfig, excluded: Set<string> = new Set()) {
  const pool = await specialtyPool(p.specialiteId);
  const { questions, series } = poolForCandidate(pool, profile.permission_scope, voie);
  const exposures = await exposuresFor(profile.id, Array.from(pool.cours.keys()));
  const built = buildUnits({
    questions: excluded.size > 0 ? questions.filter((q) => !excluded.has(q.serieId) && !excluded.has(q.id)) : questions,
    series, cours: pool.cours, parentOf: pool.parentOf, exposures, nowSec: Math.floor(Date.now() / 1000), config, format: p.format,
    scope: { specialiteId: p.specialiteId, mode: p.mode, categoryIds: p.categoryIds, itemIds: p.itemIds },
  });
  return { ...built, pool };
}

export async function gauge(profile: ProfileLite, p: LaunchParams): Promise<Gauge & { fallbackText: string | null; blockedText: string | null }> {
  const { voie } = await validateParams(profile, p);
  const config = await getCheckupConfig();
  const { units } = await unitsFor(profile, p, voie, config);
  const g = computeGauge(units, p.format, config);
  return {
    ...g,
    fallbackText: g.ok && g.fallbackNotice ? TEXTS.fallbackNotice : null,
    blockedText: g.ok ? null : p.mode === 'global'
      ? 'Le contenu disponible pour cette spécialité ne permet pas encore ce format de Check-up.'
      : 'Le périmètre choisi ne contient pas assez de questions : ajoutez un item ou une catégorie.',
  };
}

/* ─── Démarrage ─── */

export async function startCheckup(profile: ProfileLite, p: LaunchParams, deviceId: string): Promise<{ id: string; resumed: boolean }> {
  if (!deviceId) throw new CheckupError('Appareil non identifié.', 'invalide');
  // Une seule session active par candidat (§28) : reprise sur le même appareil, sinon blocage.
  const { data: act } = await db().from('checkup_sessions').select('id, device_id, deadline_at').eq('user_id', profile.id).eq('status', 'active').maybeSingle();
  if (act) {
    const a = act as { id: string; device_id: string; deadline_at: string };
    if (Date.parse(a.deadline_at) + 15_000 < Date.now()) await finishCheckup(profile.id, a.id, a.device_id, 'expired');
    else if (a.device_id === deviceId) return { id: a.id, resumed: true };
    else throw new CheckupError(TEXTS.otherDevice, 'autre_appareil');
  }
  const { voie } = await validateParams(profile, p);
  const config = await getCheckupConfig();
  const excluded = new Set<string>();
  for (let attempt = 0; attempt < 4; attempt++) {
    const { units, excludedDossiers } = await unitsFor(profile, p, voie, config, excluded);
    const seed = `${profile.id}:${Date.now()}:${attempt}`;
    const res = FORMAT_VOIE[p.format] === 'interne' ? composeInterne(units, config, seed, excludedDossiers) : composeExterne(units, p.format, config, seed, excludedDossiers);
    if (!res.ok) throw new CheckupError(p.mode === 'global' ? 'Contenu insuffisant pour ce format de Check-up.' : 'Le périmètre choisi ne contient pas assez de questions : ajoutez un item ou une catégorie.', 'banque_insuffisante');
    // Questions figées : énoncés, propositions, corrections. Une unité dont une question exige un
    // document ou des résultats invisibles est écartée et la composition recommencée.
    const content = await loadContent(res.questions.map((q) => q.id));
    const bad = incompleteUnits(res.questions, content);
    if (bad.size > 0) { for (const k of bad) excluded.add(k); continue; }
    return insertSession(profile, p, voie, res.questions, content, res.blocks, res.summary as unknown as Record<string, unknown>, config, deviceId, units);
  }
  throw new CheckupError('Contenu insuffisant pour ce format de Check-up.', 'banque_insuffisante');
}

type ContentRow = {
  id: string; enonce: string; images: string[] | null; reponse_attendue: string | null; correction_generale: string | null; commentaire_enseignant: string | null;
  qcm_items: { lettre: string; enonce: string; is_correct: boolean; justification: string | null; images: string[] | null }[] | null;
  qcm_series: { id: string; label: string | null; vignette: string | null } | null;
};
async function loadContent(ids: string[]): Promise<Map<string, ContentRow>> {
  const out = new Map<string, ContentRow>();
  for (let i = 0; i < ids.length; i += 60) {
    const { data, error } = await db().from('qcm_questions')
      .select('id, enonce, images, reponse_attendue, correction_generale, commentaire_enseignant, qcm_items(lettre, enonce, is_correct, justification, images), qcm_series!inner(id, label, vignette)')
      .in('id', ids.slice(i, i + 60));
    if (error) throw new Error(error.message);
    for (const r of (data ?? []) as ContentRow[]) out.set(r.id, r);
  }
  return out;
}

function incompleteUnits(questions: ComposedQuestion[], content: Map<string, ContentRow>): Set<string> {
  const bad = new Set<string>();
  const byDossier = new Map<string, ComposedQuestion[]>();
  for (const q of questions) {
    const c = content.get(q.id);
    if (!c) { bad.add(q.dossierId ?? q.id); continue; }
    if (q.dossierId) { byDossier.set(q.dossierId, [...(byDossier.get(q.dossierId) ?? []), q]); continue; }
    if (uniteIncomplete([lisible(c)], false)) bad.add(q.id);
  }
  for (const [serie, qs] of byDossier) {
    const rows = qs.map((q) => content.get(q.id)).filter((x): x is ContentRow => !!x);
    if (rows.length !== qs.length || uniteIncomplete(rows.map(lisible), true)) bad.add(serie);
  }
  return bad;
}
function lisible(c: ContentRow): QuestionLisible {
  return { enonce: c.enonce, images: c.images ?? [], qcm_items: (c.qcm_items ?? []).map((i) => ({ images: i.images ?? [] })), qcm_series: { vignette: c.qcm_series?.vignette ?? null } };
}

async function insertSession(
  profile: ProfileLite, p: LaunchParams, voie: Voie, questions: ComposedQuestion[], content: Map<string, ContentRow>, blocks: number | null,
  summary: Record<string, unknown>, config: CheckupConfig, deviceId: string, units: Unit[],
): Promise<{ id: string; resumed: boolean }> {
  const spec = formatSpec(p.format, config);
  const started = new Date();
  const { byId, names } = await coursCatalog();
  const { data, error } = await db().from('checkup_sessions').insert({
    user_id: profile.id, voie, specialite_id: p.specialiteId, mode: p.mode, scope_kind: p.mode === 'global' ? 'global' : 'cible',
    category_ids: p.mode === 'categories' ? p.categoryIds : [], item_ids: p.mode === 'items' ? p.itemIds : [], format: p.format,
    planned_seconds: spec.minutes * 60, question_count: questions.length, block_count: blocks, started_at: started.toISOString(),
    deadline_at: new Date(started.getTime() + spec.minutes * 60_000).toISOString(), status: 'active', device_id: deviceId,
    composition: { ...summary, units: units.length },
  }).select('id').single();
  if (error) {
    if ((error as { code?: string }).code === '23505') {
      const { data: act } = await db().from('checkup_sessions').select('id, device_id').eq('user_id', profile.id).eq('status', 'active').maybeSingle();
      if (act && (act as { device_id: string }).device_id === deviceId) return { id: (act as { id: string }).id, resumed: true };
      throw new CheckupError(TEXTS.otherDevice, 'autre_appareil');
    }
    throw new Error(error.message);
  }
  const id = (data as { id: string }).id;
  const nowSec = Date.now() / 1000;
  const rows = questions.map((q) => {
    const c = content.get(q.id)!;
    const item = q.itemId ? byId.get(q.itemId) : null;
    const snapshot: Snapshot = {
      enonce: c.enonce, images: c.images ?? [], vignette: c.qcm_series?.vignette ?? null, serie_label: c.qcm_series?.label ?? null,
      items: (c.qcm_items ?? []).slice().sort((a, b) => a.lettre.localeCompare(b.lettre)).map((i) => ({ lettre: i.lettre, enonce: i.enonce, is_correct: i.is_correct, justification: i.justification, images: i.images ?? [] })),
      reponse_attendue: c.reponse_attendue, correction_generale: c.correction_generale, commentaire_enseignant: c.commentaire_enseignant,
      item_name: item?.titre ?? null, category_name: q.categoryId ? names.get(q.categoryId) ?? null : null,
    };
    return {
      session_id: id, position: q.position, block_index: q.block, dossier_id: q.dossierId, question_order: q.questionOrder, dossier_size: q.dossierSize,
      question_id: q.id, canonical_question_id: q.canonicalId, content_source: q.family, item_id: q.itemId, category_id: q.categoryId, speciality_id: p.specialiteId,
      priority_level: q.importance, question_type: q.questionType, annale_year: q.annaleYear, snapshot,
      seen_before: q.lastSeen !== null, days_since_last_seen: q.lastSeen !== null ? Math.floor((nowSec - q.lastSeen) / 86_400) : null,
    };
  });
  for (let i = 0; i < rows.length; i += 100) {
    const { error: e } = await db().from('checkup_questions').insert(rows.slice(i, i + 100));
    if (e) {
      await db().from('checkup_sessions').delete().eq('id', id);
      throw new Error(e.message);
    }
  }
  await insertEvents([{ event_key: `checkup-start:${id}`, user_id: profile.id, event_type: 'CHECKUP_STARTED', source: 'checkup', activity_id: `checkup:${id}`, detail: { format: p.format, mode: p.mode, specialite: p.specialiteId, questions: questions.length } }]);
  return { id, resumed: false };
}

/* ─── Passation ─── */

export async function getSession(sessionId: string): Promise<SessionRow | null> {
  const { data } = await db().from('checkup_sessions').select('*').eq('id', sessionId).maybeSingle();
  return (data as SessionRow | null) ?? null;
}
export async function getQuestions(sessionId: string): Promise<QuestionRow[]> {
  const { data, error } = await db().from('checkup_questions').select('*').eq('session_id', sessionId).order('position');
  if (error) throw new Error(error.message);
  return (data ?? []) as QuestionRow[];
}

async function ownSession(userId: string, sessionId: string): Promise<SessionRow> {
  const s = await getSession(sessionId);
  if (!s || s.user_id !== userId) throw new CheckupError('Évaluation introuvable.', 'introuvable');
  return s;
}

export type RunnerQuestion = {
  position: number; block: number; dossierId: string | null; questionOrder: number | null; dossierSize: number | null; type: QuestionType;
  /** Question d'un dossier pas encore révélée : son contenu n'est pas envoyé. */
  hidden: boolean;
  enonce: string | null; images: string[]; vignette: string | null; serieLabel: string | null;
  items: { lettre: string; enonce: string; images: string[] }[];
  answer: { selected?: string[]; text?: string } | null; marked: boolean; locked: boolean;
};

export type RunnerView = {
  id: string; status: CheckupStatus; format: CheckupFormat; voie: Voie; specialite: string; scopeLabel: string; deadlineAt: string; serverNow: string;
  plannedSeconds: number; alerts: number[]; questions: RunnerQuestion[]; blocks: number | null;
};

/**
 * Vue de passation : SANS bonnes réponses ni corrections ; les questions d'un
 * dossier progressif ne sont révélées qu'après validation de la précédente
 * (qui devient alors en lecture seule, §12).
 */
export async function runnerView(userId: string, sessionId: string, deviceId: string): Promise<RunnerView | { redirect: string } | { blocked: string }> {
  let s = await ownSession(userId, sessionId);
  if (s.status === 'active' && Date.parse(s.deadline_at) + 15_000 < Date.now()) {
    await finishCheckup(userId, s.id, s.device_id, 'expired');
    s = (await getSession(sessionId))!;
  }
  if (s.status !== 'active') return { redirect: s.status === 'pending_self_review' ? `/checkup/${s.id}/correction` : `/checkup/${s.id}/resultat` };
  if (s.device_id !== deviceId) return { blocked: TEXTS.otherDevice };
  const config = await getCheckupConfig();
  const qs = await getQuestions(sessionId);
  const firstOpen = new Map<string, number>();
  for (const q of qs) if (q.dossier_id && !q.locked_at && !firstOpen.has(q.dossier_id)) firstOpen.set(q.dossier_id, q.question_order ?? 0);
  const { names } = await coursCatalog();
  return {
    id: s.id, status: s.status, format: s.format, voie: s.voie, specialite: names.get(s.specialite_id) ?? s.specialite_id,
    scopeLabel: s.mode === 'global' ? 'Check-up global' : s.mode === 'categories' ? `Check-up ciblé · ${s.category_ids.length} catégorie(s)` : `Check-up ciblé · ${s.item_ids.length} item(s)`,
    deadlineAt: s.deadline_at, serverNow: nowIso(), plannedSeconds: s.planned_seconds, alerts: formatSpec(s.format, config).alerts, blocks: s.block_count,
    questions: qs.map((q) => {
      const open = q.dossier_id ? firstOpen.get(q.dossier_id) : undefined;
      const hidden = !!q.dossier_id && open !== undefined && (q.question_order ?? 0) > open;
      return {
        position: q.position, block: q.block_index, dossierId: q.dossier_id, questionOrder: q.question_order, dossierSize: q.dossier_size, type: q.question_type, hidden,
        enonce: hidden ? null : q.snapshot.enonce, images: hidden ? [] : q.snapshot.images ?? [],
        vignette: q.dossier_id ? q.snapshot.vignette : q.snapshot.vignette, serieLabel: q.dossier_id ? q.snapshot.serie_label : null,
        items: hidden ? [] : (q.snapshot.items ?? []).map((i) => ({ lettre: i.lettre, enonce: i.enonce, images: i.images ?? [] })),
        answer: q.answer, marked: q.marked_review, locked: !!q.locked_at,
      };
    }),
  };
}

function assertActive(s: SessionRow, deviceId: string, config: CheckupConfig) {
  if (s.status !== 'active') throw new CheckupError('Cette évaluation est terminée : aucune modification n’est possible.', 'verrouille');
  if (s.device_id !== deviceId) throw new CheckupError(TEXTS.otherDevice, 'autre_appareil');
  if (Date.now() > Date.parse(s.deadline_at) + config.grace_seconds * 1000) throw new CheckupError('Le temps est écoulé : vos réponses enregistrées ont été soumises.', 'expire');
}

/** Sauvegarde automatique d'une réponse (chaque modification, §28). */
export async function saveAnswer(userId: string, sessionId: string, deviceId: string, position: number, answer: { selected?: unknown; text?: unknown }): Promise<{ savedAt: string }> {
  const s = await ownSession(userId, sessionId);
  const config = await getCheckupConfig();
  try { assertActive(s, deviceId, config); } catch (e) {
    if (e instanceof CheckupError && e.code === 'expire') await finishCheckup(userId, sessionId, s.device_id, 'expired');
    throw e;
  }
  const { data: q } = await db().from('checkup_questions').select('id, question_type, snapshot, dossier_id, question_order, locked_at').eq('session_id', sessionId).eq('position', position).maybeSingle();
  if (!q) throw new CheckupError('Question introuvable.', 'introuvable');
  const row = q as Pick<QuestionRow, 'id' | 'question_type' | 'snapshot' | 'dossier_id' | 'question_order' | 'locked_at'>;
  if (row.locked_at) throw new CheckupError('Cette question est validée : relecture possible, modification impossible.', 'verrouille');
  if (row.dossier_id) await assertDossierReachable(sessionId, row.dossier_id, row.question_order ?? 0);
  const value = row.question_type === 'QROC'
    ? { text: typeof answer.text === 'string' ? answer.text.slice(0, 5000) : '' }
    : { selected: normalizeSelection(answer.selected, row.snapshot.items ?? []) };
  if (row.question_type === 'QRU' && (value.selected?.length ?? 0) > 1) value.selected = value.selected!.slice(-1);
  const at = nowIso();
  const { error } = await db().from('checkup_questions').update({ answer: value, answered_at: at }).eq('id', row.id).is('locked_at', null);
  if (error) throw new Error(error.message);
  return { savedAt: at };
}

/** Une question de dossier n'est atteignable que si les précédentes sont validées. */
async function assertDossierReachable(sessionId: string, dossierId: string, order: number) {
  if (order <= 1) return;
  const { data } = await db().from('checkup_questions').select('question_order, locked_at').eq('session_id', sessionId).eq('dossier_id', dossierId);
  const prev = ((data ?? []) as { question_order: number | null; locked_at: string | null }[]).filter((x) => (x.question_order ?? 0) < order);
  if (prev.some((x) => !x.locked_at)) throw new CheckupError('Validez d’abord la question précédente du dossier.', 'invalide');
}

/** « Valider et continuer » dans un dossier progressif : la question devient en lecture seule (§12). */
export async function lockDossierQuestion(userId: string, sessionId: string, deviceId: string, position: number): Promise<void> {
  const s = await ownSession(userId, sessionId);
  assertActive(s, deviceId, await getCheckupConfig());
  const { data: q } = await db().from('checkup_questions').select('id, dossier_id, question_order, locked_at').eq('session_id', sessionId).eq('position', position).maybeSingle();
  const row = q as { id: string; dossier_id: string | null; question_order: number | null; locked_at: string | null } | null;
  if (!row || !row.dossier_id) throw new CheckupError('Question introuvable.', 'introuvable');
  if (row.locked_at) return;
  await assertDossierReachable(sessionId, row.dossier_id, row.question_order ?? 0);
  await db().from('checkup_questions').update({ locked_at: nowIso(), presented_at: nowIso() }).eq('id', row.id).is('locked_at', null);
}

export async function toggleMark(userId: string, sessionId: string, deviceId: string, position: number, marked: boolean): Promise<void> {
  const s = await ownSession(userId, sessionId);
  assertActive(s, deviceId, await getCheckupConfig());
  await db().from('checkup_questions').update({ marked_review: marked }).eq('session_id', sessionId).eq('position', position);
}

/** Question réellement affichée : elle devient « déjà vue » pour l'anti-répétition, même en cas d'abandon (I§16). */
export async function markPresented(userId: string, sessionId: string, positions: number[]): Promise<void> {
  const s = await ownSession(userId, sessionId);
  if (s.status !== 'active' || positions.length === 0) return;
  await db().from('checkup_questions').update({ presented_at: nowIso() }).eq('session_id', sessionId).in('position', positions.slice(0, 200)).is('presented_at', null);
}

/** Alertes de temps restant déjà affichées (évite de les répéter après un rechargement). */
export async function recordAlert(userId: string, sessionId: string, minutes: number): Promise<void> {
  const s = await ownSession(userId, sessionId);
  if (s.status !== 'active' || s.alerts_sent.includes(minutes)) return;
  await db().from('checkup_sessions').update({ alerts_sent: [...s.alerts_sent, minutes] }).eq('id', sessionId).eq('status', 'active');
}

/* ─── Soumission ─── */

/**
 * Fin de la partie chronométrée — validation volontaire ou automatique à
 * 00:00 (idempotente : une seule soumission compte). QCM notés aussitôt ;
 * QROC vide = 0 ; QROC rédigée → auto-correction (pending_self_review), sans
 * aucun zéro attribué d'office (§15).
 */
export async function finishCheckup(userId: string, sessionId: string, deviceId: string, reason: 'submitted' | 'expired'): Promise<{ status: CheckupStatus }> {
  const s = await ownSession(userId, sessionId);
  if (s.status !== 'active') return { status: s.status };
  if (reason === 'submitted' && s.device_id !== deviceId) throw new CheckupError(TEXTS.otherDevice, 'autre_appareil');
  const config = await getCheckupConfig();
  const qs = await getQuestions(sessionId);
  const at = new Date();
  const submittedAt = reason === 'expired' ? new Date(Math.min(at.getTime(), Date.parse(s.deadline_at))).toISOString() : at.toISOString();
  const updates: { id: string; patch: Partial<QuestionRow> }[] = [];
  let writtenQroc = 0;
  for (const q of qs) {
    if (q.question_type === 'QROC') {
      const text = q.answer?.text;
      if (isBlankText(text)) updates.push({ id: q.id, patch: { result: 'incorrect', points: 0, origin: 'vide' } });
      else writtenQroc++;
    } else {
      const sc = scoreQcm(q.question_type, q.snapshot.items ?? [], q.answer?.selected ?? [], config);
      updates.push({ id: q.id, patch: { result: sc.result, points: sc.points, discordances: sc.discordances, origin: 'auto' } });
    }
  }
  const nextStatus: CheckupStatus = writtenQroc > 0 ? 'pending_self_review' : reason === 'expired' ? 'expired' : 'completed';
  // Transition conditionnelle : deux soumissions simultanées, une seule gagne.
  const { data: won } = await db().from('checkup_sessions').update({
    status: nextStatus, submitted_at: submittedAt, ended_reason: reason,
    duration_seconds: Math.max(0, Math.round((Date.parse(submittedAt) - Date.parse(s.started_at)) / 1000)),
    ...(nextStatus !== 'pending_self_review' ? { completed_at: at.toISOString() } : {}),
  }).eq('id', sessionId).eq('status', 'active').select('id');
  if (!won || (won as unknown[]).length === 0) return { status: (await getSession(sessionId))?.status ?? s.status };
  for (const u of updates) await db().from('checkup_questions').update(u.patch).eq('id', u.id);
  const fresh = await getQuestions(sessionId);
  // Les QRU/QRM alimentent le profil IMMÉDIATEMENT après soumission (I§16).
  await emitCheckupSignals(userId, { ...s, status: nextStatus }, fresh, { qcmOnly: nextStatus === 'pending_self_review' });
  if (nextStatus !== 'pending_self_review') await finalizeResults(userId, sessionId);
  else {
    const qcm = aggregate(fresh.filter((q) => q.question_type !== 'QROC').map((q) => ({ type: q.question_type, points: Number(q.points ?? 0), block: q.block_index, dossierId: q.dossier_id })));
    await db().from('checkup_sessions').update({ qcm_points_obtained: qcm.obtained, qcm_points_possible: qcm.possible }).eq('id', sessionId);
  }
  return { status: nextStatus };
}

/* ─── Auto-correction des QROC (§14 à §16) ─── */

export async function selfGrade(userId: string, sessionId: string, position: number, grade: QuestionResult): Promise<{ remaining: number; completed: boolean }> {
  const s = await ownSession(userId, sessionId);
  if (s.status !== 'pending_self_review') throw new CheckupError('Aucune correction en attente pour cette évaluation.', 'verrouille');
  const { data: q } = await db().from('checkup_questions').select('id, question_type, answer, self_grade').eq('session_id', sessionId).eq('position', position).maybeSingle();
  const row = q as { id: string; question_type: QuestionType; answer: { text?: string } | null; self_grade: QuestionResult | null } | null;
  if (!row || row.question_type !== 'QROC') throw new CheckupError('Question introuvable.', 'introuvable');
  const sc = scoreQroc(row.answer?.text, grade);
  if (!sc) throw new CheckupError('Réponse vide : déjà notée 0.', 'invalide');
  await db().from('checkup_questions').update({ self_grade: grade, self_graded_at: nowIso(), result: sc.result, points: sc.points, origin: 'auto_evaluee' }).eq('id', row.id);
  const qs = await getQuestions(sessionId);
  const remaining = qs.filter((x) => x.question_type === 'QROC' && x.origin !== 'vide' && !x.self_grade).length;
  if (remaining === 0) {
    // pending_self_review → completed : score définitif, analyse et plan de reprise À CE MOMENT seulement.
    const { data: won } = await db().from('checkup_sessions').update({ status: 'completed', self_review_completed_at: nowIso(), completed_at: nowIso() })
      .eq('id', sessionId).eq('status', 'pending_self_review').select('id');
    if (won && (won as unknown[]).length > 0) {
      const fresh = await getQuestions(sessionId);
      await emitCheckupSignals(userId, { ...s, status: 'completed' }, fresh, { qrocOnly: true });
      await finalizeResults(userId, sessionId);
    }
    return { remaining: 0, completed: true };
  }
  return { remaining, completed: false };
}

/** Score définitif, analyse par domaine et par item, prescription (§22, §23, §35). */
async function finalizeResults(userId: string, sessionId: string): Promise<void> {
  const s = (await getSession(sessionId))!;
  const qs = await getQuestions(sessionId);
  const rq: ResultQuestion[] = qs.map((q) => ({
    position: q.position, block: q.block_index, itemId: q.item_id, itemName: q.snapshot.item_name, categoryId: q.category_id, categoryName: q.snapshot.category_name,
    family: q.content_source, points: Number(q.points ?? 0), result: q.result ?? 'incorrect', origin: q.origin ?? 'auto',
    // Même règle que les signaux : une question jamais affichée ne produit aucun diagnostic d'item.
    displayed: !!q.presented_at || !!q.answer || !!q.locked_at,
  }));
  const a = analyze(rq, { externe: s.voie === 'externe' });
  await db().from('checkup_sessions').update({
    score_percent: a.percent, points_obtained: a.obtained, points_possible: a.possible, results: a,
    recommendations: { synthese: synthesis(a), a_revoir: a.aRevoir.map((i) => i.itemId), a_consolider: a.aConsolider.map((i) => i.itemId), positifs: a.positifs.map((i) => i.itemId) },
  }).eq('id', sessionId);
  await insertEvents([{ event_key: `checkup-results:${sessionId}`, user_id: userId, event_type: 'CHECKUP_COMPLETED', source: 'checkup', activity_id: `checkup:${sessionId}`, detail: { score: a.percent, a_revoir: a.aRevoir.length, a_consolider: a.aConsolider.length } }]);
}

/* ─── Abandon, incident technique ─── */

/** Abandon (§31) : action distincte, confirmée ; aucun faux score, exclu des courbes ; les questions affichées restent « déjà vues ». */
export async function abandonCheckup(userId: string, sessionId: string, deviceId: string): Promise<void> {
  const s = await ownSession(userId, sessionId);
  if (s.status !== 'active') throw new CheckupError('Cette évaluation n’est plus en cours.', 'verrouille');
  if (s.device_id !== deviceId) throw new CheckupError(TEXTS.otherDevice, 'autre_appareil');
  await db().from('checkup_sessions').update({ status: 'abandoned', ended_reason: 'abandoned', submitted_at: nowIso(), duration_seconds: Math.round((Date.now() - Date.parse(s.started_at)) / 1000) })
    .eq('id', sessionId).eq('status', 'active');
  await insertEvents([{ event_key: `checkup-abandon:${sessionId}`, user_id: userId, event_type: 'CHECKUP_ABANDONED', source: 'checkup', activity_id: `checkup:${sessionId}` }]);
}

/** Incident technique (§32) : l'administrateur neutralise ; aucune statistique pédagogique ; recommencement possible. */
export async function neutralizeCheckup(adminId: string, sessionId: string, reason: string): Promise<void> {
  const s = await getSession(sessionId);
  if (!s) throw new CheckupError('Évaluation introuvable.', 'introuvable');
  if (s.status === 'cancelled_technical') return;
  await db().from('checkup_sessions').update({ status: 'cancelled_technical', ended_reason: 'cancelled_technical', neutralized_by: adminId, neutralized_reason: reason.slice(0, 500), neutralized_at: nowIso() }).eq('id', sessionId);
  if (s.qcm_signals_emitted_at || s.signals_emitted_at) await neutralizeSignals(s.user_id, sessionId);
  await insertEvents([{ event_key: `checkup-neutralise:${sessionId}`, user_id: s.user_id, event_type: 'CHECKUP_NEUTRALIZED', source: 'checkup', activity_id: `checkup:${sessionId}`, detail: { reason, by: adminId } }]);
}

/** Balayage : sessions dont le temps est écoulé pendant l'absence du candidat → soumission automatique (§28). */
export async function expireDueCheckups(now: Date = new Date()): Promise<number> {
  const config = await getCheckupConfig();
  const limit = new Date(now.getTime() - config.grace_seconds * 1000).toISOString();
  const { data } = await db().from('checkup_sessions').select('id, user_id, device_id').eq('status', 'active').lt('deadline_at', limit).limit(200);
  let n = 0;
  for (const s of (data ?? []) as { id: string; user_id: string; device_id: string }[]) {
    try { await finishCheckup(s.user_id, s.id, s.device_id, 'expired'); n++; } catch (e) { console.error('[checkup] expiration', s.id, e instanceof Error ? e.message : e); }
  }
  return n;
}

/* ─── Résultat, historique, recommandation ─── */

export type ResultView = {
  session: SessionRow;
  specialiteName: string;
  analysis: CheckupAnalysis | null;
  questions: (QuestionRow & { correct: string[] })[];
  pendingQroc: number;
};

export async function resultView(userId: string, sessionId: string): Promise<ResultView> {
  const s = await ownSession(userId, sessionId);
  const { names } = await coursCatalog();
  const qs = s.status === 'active' ? [] : await getQuestions(sessionId);
  return {
    session: s, specialiteName: names.get(s.specialite_id) ?? s.specialite_id, analysis: analyseLisible(s.results),
    questions: qs.map((q) => ({ ...q, correct: (q.snapshot.items ?? []).filter((i) => i.is_correct).map((i) => i.lettre) })),
    pendingQroc: qs.filter((q) => q.question_type === 'QROC' && q.origin !== 'vide' && !q.self_grade).length,
  };
}

export type HistoryRow = Pick<SessionRow, 'id' | 'status' | 'format' | 'mode' | 'scope_kind' | 'specialite_id' | 'started_at' | 'score_percent' | 'points_obtained' | 'points_possible' | 'duration_seconds' | 'question_count' | 'category_ids' | 'item_ids'> & { specialiteName: string };
export async function history(userId: string): Promise<{ global: HistoryRow[]; cible: HistoryRow[] }> {
  const { data } = await db().from('checkup_sessions')
    .select('id, status, format, mode, scope_kind, specialite_id, started_at, score_percent, points_obtained, points_possible, duration_seconds, question_count, category_ids, item_ids')
    .eq('user_id', userId).order('started_at', { ascending: false }).limit(100);
  const { names } = await coursCatalog();
  const rows = ((data ?? []) as Omit<HistoryRow, 'specialiteName'>[]).map((r) => ({ ...r, specialiteName: names.get(r.specialite_id) ?? r.specialite_id }));
  return { global: rows.filter((r) => r.scope_kind === 'global'), cible: rows.filter((r) => r.scope_kind === 'cible') };
}

/** Recommandation d'un nouveau Check-up (O§32, I§24) : 20 nouveaux items travaillés OU 21 jours. Jamais de lancement automatique. */
export async function checkupRecommendation(userId: string): Promise<{ recommend: boolean; reason: string | null }> {
  const config = await getOrchestratorConfig();
  const { data: last } = await db().from('checkup_sessions').select('started_at').eq('user_id', userId).in('status', ['completed', 'expired', 'pending_self_review'])
    .order('started_at', { ascending: false }).limit(1).maybeSingle();
  const since = (last as { started_at: string } | null)?.started_at ?? new Date(Date.now() - 60 * 86_400_000).toISOString();
  // Items réellement travaillés depuis (une ligne d'état par item : aucun plafond de lignes),
  // hors items seulement touchés par le Check-up lui-même.
  const { count } = await db().from('candidate_item_state').select('item_id', { count: 'exact', head: true }).eq('user_id', userId)
    .gt('last_activity_at', since).or('last_result_source.is.null,last_result_source.neq.checkup');
  return shouldRecommendCheckup({
    lastCheckupAt: (last as { started_at: string } | null)?.started_at ?? null, newItemsWorkedSince: count ?? 0, now: nowIso(),
    newItemsThreshold: config.checkup_recommendation.new_items_worked, daysThreshold: config.checkup_recommendation.days_since_last,
  });
}

/* ─── Prescription : actions du résultat (§23, I§18, I§19) ─── */

async function lacunes(userId: string, sessionId: string): Promise<{ s: SessionRow; items: string[] }> {
  const s = await ownSession(userId, sessionId);
  if (s.status !== 'completed' && s.status !== 'expired') throw new CheckupError('Le résultat définitif n’est pas encore disponible.', 'verrouille');
  const r = (s.recommendations ?? {}) as { a_revoir?: string[]; a_consolider?: string[] };
  return { s, items: Array.from(new Set([...(r.a_revoir ?? []), ...(r.a_consolider ?? [])])) };
}

/**
 * « Ajouter à mes révisions » : les lacunes entrent dans les réactivations
 * (J+7, intervalles ÷2 dans les 30 derniers jours, jamais après l'EVC). Le
 * moteur l'a déjà fait à la soumission : l'action le garantit et le confirme.
 */
export async function addLacunesToRevisions(userId: string, sessionId: string): Promise<{ count: number; firstDue: string | null }> {
  const { s, items } = await lacunes(userId, sessionId);
  if (items.length === 0) return { count: 0, firstDue: null };
  const [{ listScheduledReviews, insertReview, getOrchestratorConfig: cfg }, { scheduleReview }] = await Promise.all([import('@/lib/moteur/server/db'), import('@/lib/moteur/reviews')]);
  const config = await cfg();
  const ctx = await candidateContext(userId);
  const today = ctx?.today ?? new Date().toISOString().slice(0, 10);
  const scheduled = new Map((await listScheduledReviews(userId, items)).map((r) => [r.item_id, r.due_on]));
  for (const itemId of items) {
    if (scheduled.has(itemId)) continue;
    const d = scheduleReview({ fromDay: today, step: 0, examDate: ctx?.examDate ?? null, today }, config);
    if (!d.dueOn) continue;
    await insertReview({ user_id: userId, item_id: itemId, step: 0, interval_days: d.intervalDays, due_on: d.dueOn, theoretical_due_on: d.theoreticalDueOn, adjusted: d.adjusted, origin: 'checkup_lacune', source_signal_id: null });
    scheduled.set(itemId, d.dueOn);
  }
  const firstDue = Array.from(scheduled.values()).sort()[0] ?? null;
  await db().from('checkup_sessions').update({ actions: [...(s.actions ?? []), { type: 'ajout_revisions', at: nowIso(), items: items.length }] }).eq('id', sessionId);
  return { count: items.length, firstDue };
}

/**
 * « Ajouter à mon planning » (planificateur actif seulement) : le planificateur
 * relit les besoins du moteur central et les place sans dépasser la charge
 * maximale ; rien n'est empilé directement (I§19).
 */
export async function addLacunesToPlanning(userId: string, sessionId: string): Promise<{ count: number }> {
  const { s, items } = await lacunes(userId, sessionId);
  const ctx = await candidateContext(userId);
  if (!ctx?.plannerActive) throw new CheckupError('Votre planificateur n’est pas actif.', 'acces');
  const plan = await import('@/lib/plan/service') as Record<string, unknown>;
  if (typeof plan.requestPlannerRecalc === 'function') await (plan.requestPlannerRecalc as (u: string, t: string) => Promise<unknown>)(userId, 'checkup');
  else if (typeof plan.regeneratePlan === 'function') await (plan.regeneratePlan as (u: string, t: string) => Promise<unknown>)(userId, 'checkup');
  await insertEvents([{ event_key: `checkup-planning:${sessionId}:${Date.now()}`, user_id: userId, event_type: 'PLANNER_RECALCULATION_REQUIRED', source: 'checkup', activity_id: `checkup:${sessionId}`, detail: { items: items.length } }]);
  await db().from('checkup_sessions').update({ actions: [...(s.actions ?? []), { type: 'ajout_planning', at: nowIso(), items: items.length }] }).eq('id', sessionId);
  return { count: items.length };
}

/** Contexte d'ingestion du candidat (date d'EVC, planificateur). */
export async function ingestContextFor(userId: string): Promise<{ examDate: string | null; plannerActive: boolean }> {
  const ctx = await candidateContext(userId);
  return { examDate: ctx?.examDate ?? null, plannerActive: !!ctx?.plannerActive };
}
