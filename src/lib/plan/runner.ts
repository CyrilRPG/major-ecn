import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { after } from 'next/server';
import { canStudentReadSerie } from '@/lib/data/qcm-access-rules';
import { accessFor, coursAllowed, exposuresFor } from '@/lib/checkup/server/pool';
import { aplatirUnites, choisirUnites, dossiersDepuisSeries, regrouperEnUnites } from '@/lib/pedago/dossiers';
import { uniteIncomplete } from '@/lib/qcm/donnees-manquantes';
import { gradeQroc } from '@/lib/qcm/grade';
import { questionContext } from '@/lib/moteur/server/collector';
import { coursCatalog, getOrchestratorConfig, insertEvents } from '@/lib/moteur/server/db';
import { ingestSignals } from '@/lib/moteur/server/ingest';
import { isRecentlySeen, signalStrength } from '@/lib/moteur/signal';
import type { PedagoSignal } from '@/lib/moteur/types';
import { voieOfScope } from './access';
import { activityCompletion } from './completion';
import { isStaffRole, loadAccount } from './context';
import { addLog, getActivity, getProfile, insertUnits, listItemsByIds, listUnits, planDb, updateActivities, type PlanActivityRow } from './db';
import { refreshPlan } from './engine';

/**
 * Lecteur d'une activité évaluative du planning (réactivation, consolidation,
 * « Mes erreurs », micro-diagnostic, entraînement au format de l'épreuve).
 *
 * Récupération active d'abord (§15) : question sans support, réponse,
 * correction immédiate. Une unité = une question réellement SOUMISE (jamais
 * ouverte, passée ou affichée) ; la même question ne compte qu'une fois dans
 * l'activité (complément « réalisation » §2). Chaque réponse produit un signal
 * `planner_activity` vers le moteur central (force intermédiaire, faible si la
 * question est récemment vue ou si c'est une QROC auto-évaluée) — c'est lui
 * seul qui fait évoluer la maîtrise.
 *
 * Les questions servies sont liées à la session par un jeton signé : une
 * réponse à une autre question est refusée, les bonnes réponses ne sont
 * révélées qu'après validation.
 */

export type RunnerQuestion = {
  id: string;
  itemName: string;
  format: 'qcm' | 'qroc';
  enonce: string;
  images: string[];
  vignette: string | null;
  dossier: { position: number; total: number } | null;
  items: { lettre: string; enonce: string; images: string[] }[];
};
export type RunnerSession = { token: string; activityId: string; questions: RunnerQuestion[]; validated: number; planned: number };
export type RunnerCorrection = {
  result: 'positive' | 'partial' | 'incorrect';
  correct: string[];
  items: { lettre: string; is_correct: boolean; justification: string | null }[];
  reponseAttendue: string | null;
  correction: string | null;
  autoMatch?: boolean;
  /** Première étape d'une QROC : correction révélée, l'auto-évaluation suit. */
  pendingSelfGrade?: boolean;
  validated: number;
  planned: number;
  completed: boolean;
};

const QUESTION_TYPES = new Set(['REACTIVATE', 'CONSOLIDATE', 'ERROR_REVIEW', 'DIAGNOSTIC', 'EXAM_PRACTICE']);
const RUNNABLE = new Set(['DUE', 'PLANNED', 'PENDING', 'IN_PROGRESS', 'PARTIALLY_COMPLETED']);

const SECRET = () => process.env.PLAN_SESSION_SECRET ?? process.env.PEDAGO_SESSION_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
type TokenPayload = { u: string; a: string; q: string[]; t: number };
function sign(p: TokenPayload): string {
  const body = Buffer.from(JSON.stringify(p)).toString('base64url');
  const mac = createHmac('sha256', `plan:${SECRET()}`).update(body).digest('base64url');
  return `${body}.${mac}`;
}
function verify(token: string, userId: string): TokenPayload | null {
  const [body, mac] = token.split('.');
  if (!body || !mac || !SECRET()) return null;
  const expected = createHmac('sha256', `plan:${SECRET()}`).update(body).digest('base64url');
  if (expected.length !== mac.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(mac))) return null;
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString()) as TokenPayload;
    return p.u === userId && Date.now() - p.t < 12 * 3_600_000 ? p : null;
  } catch { return null; }
}

type VivierQuestion = { id: string; serie_id: string; order_index: number; format: string | null; n_items: number };
type VivierSerie = { id: string; label: string | null; type: string | null; vignette: string | null; n_questions: number };
type AccessSerie = { id: string; label: string; type: string | null; kind: string | null; allowed_voies: string[] | null; allowed_offers: string[] | null; mg_series: boolean | null; is_revisions: boolean | null; cours_id: string };

/** Activité évaluative ouvrable par ce candidat. */
export function isRunnable(a: Pick<PlanActivityRow, 'activity_type' | 'measurable' | 'unit_kind' | 'status'>): boolean {
  return QUESTION_TYPES.has(a.activity_type) && a.measurable && (a.unit_kind === 'QUESTION' || a.unit_kind === 'DP_QUESTION') && RUNNABLE.has(a.status);
}

/** Compose la série de questions restantes de l'activité (questions déjà soumises exclues). */
export async function openRunner(userId: string, activityId: string): Promise<RunnerSession | { error: string }> {
  const [a, account] = await Promise.all([getActivity(userId, activityId), loadAccount(userId)]);
  if (!a || !account) return { error: 'Activité introuvable.' };
  if (!isRunnable(a)) return { error: 'Cette activité ne se fait pas avec des questions, ou elle est terminée.' };
  const staff = isStaffRole(account.role);
  const profile = await getProfile(userId);
  const voie = profile?.voie ?? voieOfScope(account.permission_scope);
  const units = await listUnits(userId, { activityIds: [a.id] });
  const doneKeys = new Set(units.map((u) => u.unit_key));
  const planned = a.planned_units ?? 0;
  const remaining = Math.max(0, planned - doneKeys.size);
  if (remaining === 0) return { error: 'Toutes les questions prévues ont déjà été traitées.' };
  const items = await listItemsByIds(a.item_ids.length > 0 ? a.item_ids : a.item_id ? [a.item_id] : []);
  const coursIds = items.map((i) => i.cours_id).filter((x): x is string => !!x);
  const { byId } = await coursCatalog();
  const allowed = coursIds.filter((id) => { const c = byId.get(id); return !!c && (staff || coursAllowed(account.permission_scope, { id: c.id, titre: c.titre, matiereId: c.matiere_id, importance: c.importance })); });
  if (allowed.length === 0) return { error: 'Cet item n’est pas accessible avec votre formule.' };
  const { data, error } = await planDb().rpc('vivier_revisions_cours', { p_cours_ids: allowed });
  if (error) throw new Error(error.message);
  const doc = (data ?? {}) as { questions?: VivierQuestion[]; series?: VivierSerie[] };
  const series = new Map((doc.series ?? []).map((s) => [s.id, s]));
  const { data: access } = await planDb().from('qcm_series').select('id, label, type, kind, allowed_voies, allowed_offers, mg_series, is_revisions, cours_id').in('id', Array.from(series.keys()).slice(0, 2000));
  const { ctx, geriatrie } = accessFor(account.permission_scope, voie);
  const readable = new Set<string>();
  for (const s of (access ?? []) as AccessSerie[]) {
    if ((s.type === 'qcm' || s.type === 'qroc') && (staff || canStudentReadSerie(s, { ...ctx, geriatrieMgBonus: geriatrie && s.mg_series === true }))) readable.add(s.id);
  }
  // Identifiants canoniques (une question et ses doublons = une seule unité).
  const vivier = (doc.questions ?? []).filter((q) => readable.has(q.serie_id) && ((q.format ?? 'qcm') === 'qroc' || q.n_items >= 2));
  const { data: fps } = await planDb().from('question_fingerprints').select('question_id, canonical_question_id').in('question_id', vivier.map((q) => q.id).slice(0, 3000));
  const canon = new Map(((fps ?? []) as { question_id: string; canonical_question_id: string }[]).map((r) => [r.question_id, r.canonical_question_id]));
  const canonical = (id: string) => canon.get(id) ?? id;
  let pool = vivier.filter((q) => !doneKeys.has(`q:${canonical(q.id)}`));
  let flat: { question: VivierQuestion; dossier: { serieId: string; position: number; total: number } | null }[] = [];
  if (a.activity_type === 'ERROR_REVIEW') {
    // Les questions ratées elles-mêmes (identifiants canoniques du moteur central).
    const targets = new Set(a.target_question_ids);
    pool = pool.filter((q) => targets.has(canonical(q.id)) || targets.has(q.id));
    const seen = new Set<string>();
    flat = pool.filter((q) => (seen.has(canonical(q.id)) ? false : (seen.add(canonical(q.id)), true))).slice(0, remaining).map((q) => ({ question: q, dossier: null }));
  } else if (a.activity_type === 'EXAM_PRACTICE' && a.resource_ids.seriesId) {
    // Entraînement au format de l'épreuve : le dossier entier, dans l'ordre.
    const sid = a.resource_ids.seriesId;
    const qs = pool.filter((q) => q.serie_id === sid).sort((x, y) => x.order_index - y.order_index);
    const total = vivier.filter((q) => q.serie_id === sid).length;
    flat = qs.slice(0, remaining).map((q) => ({ question: q, dossier: { serieId: sid, position: vivier.filter((v) => v.serie_id === sid && v.order_index <= q.order_index).length, total } }));
  } else {
    // Récupération espacée : jamais vues d'abord, puis les plus anciennement vues ; dossiers entiers.
    const exposures = await exposuresFor(userId, allowed);
    const nowSec = Date.now() / 1000;
    const scoreDe = (q: VivierQuestion) => {
      const e = exposures.get(canonical(q.id));
      if (!e) return 0;
      const ageDays = (nowSec - e.last) / 86_400;
      return ageDays > 30 ? 1 + 1 / Math.max(1, ageDays) : 3;
    };
    const dossiers = dossiersDepuisSeries(Array.from(series.values()).filter((s) => readable.has(s.id)).map((s) => ({ id: s.id, label: s.label, vignette: s.vignette, type: s.type, nbQuestions: s.n_questions })));
    const { unites } = regrouperEnUnites(pool, dossiers);
    flat = aplatirUnites(choisirUnites(unites, scoreDe, remaining)).map((x) => ({ question: x.question, dossier: x.dossier }));
  }
  if (flat.length === 0) return { error: 'Aucune question disponible sur cet item pour votre voie : étudiez la fiche de l’item, l’activité restera à faire.' };
  const ids = flat.map((x) => x.question.id);
  const { data: full } = await planDb().from('qcm_questions')
    .select('id, enonce, images, format, qcm_items(lettre, enonce, images), qcm_series!inner(id, vignette, cours_id)').in('id', ids);
  type Full = { id: string; enonce: string; images: string[] | null; format: string | null; qcm_items: { lettre: string; enonce: string; images: string[] | null }[] | null; qcm_series: { id: string; vignette: string | null; cours_id: string } };
  const byQ = new Map(((full ?? []) as Full[]).map((q) => [q.id, q]));
  // Garde « données absentes » : une question ou un dossier intraitable n'est jamais servi.
  const bad = new Set<string>();
  const bySerie = new Map<string, Full[]>();
  for (const x of flat) {
    const f = byQ.get(x.question.id);
    if (!f) { bad.add(x.question.id); continue; }
    if (x.dossier) bySerie.set(x.dossier.serieId, [...(bySerie.get(x.dossier.serieId) ?? []), f]);
    else if (uniteIncomplete([{ enonce: f.enonce, images: f.images ?? [], qcm_items: f.qcm_items ?? [], qcm_series: { vignette: f.qcm_series.vignette } }], false)) bad.add(f.id);
  }
  for (const [, fs] of bySerie) {
    if (uniteIncomplete(fs.map((f) => ({ enonce: f.enonce, images: f.images ?? [], qcm_items: f.qcm_items ?? [], qcm_series: { vignette: f.qcm_series.vignette } })), true)) for (const f of fs) bad.add(f.id);
  }
  const itemNameByCours = new Map(items.filter((i) => i.cours_id).map((i) => [i.cours_id!, i.nom_item]));
  const questions: RunnerQuestion[] = flat.filter((x) => !bad.has(x.question.id)).map((x) => {
    const f = byQ.get(x.question.id)!;
    return {
      id: f.id, itemName: itemNameByCours.get(f.qcm_series.cours_id) ?? byId.get(f.qcm_series.cours_id)?.titre ?? 'Item', format: (f.format ?? 'qcm') === 'qroc' ? 'qroc' : 'qcm',
      enonce: f.enonce, images: f.images ?? [], vignette: x.dossier ? f.qcm_series.vignette : (a.activity_type === 'ERROR_REVIEW' ? f.qcm_series.vignette : null),
      dossier: x.dossier ? { position: x.dossier.position, total: x.dossier.total } : null,
      items: (f.qcm_items ?? []).slice().sort((p, q) => p.lettre.localeCompare(q.lettre)).map((i) => ({ lettre: i.lettre, enonce: i.enonce, images: i.images ?? [] })),
    };
  });
  if (questions.length === 0) return { error: 'Aucune question exploitable sur cet item pour le moment : étudiez la fiche de l’item.' };
  const token = sign({ u: userId, a: a.id, q: questions.map((q) => q.id), t: Date.now() });
  return { token, activityId: a.id, questions, validated: doneKeys.size, planned };
}

/** Correction d'une réponse soumise : tentative, unité de réalisation, signal au moteur central. */
export async function answerRunner(userId: string, token: string, questionId: string, answer: { selected?: string[]; text?: string; selfGrade?: 'correct' | 'partial' | 'incorrect' }): Promise<RunnerCorrection> {
  const p = verify(token, userId);
  if (!p || !p.q.includes(questionId)) throw new Error('Question hors de cette activité.');
  const a = await getActivity(userId, p.a);
  if (!a || !RUNNABLE.has(a.status)) throw new Error('Cette activité n’est plus ouverte.');
  const db = planDb();
  const { data } = await db.from('qcm_questions').select('id, format, reponse_attendue, correction_generale, qcm_items(lettre, is_correct, justification), qcm_series!inner(cours_id)').eq('id', questionId).maybeSingle();
  const q = data as { id: string; format: string | null; reponse_attendue: string | null; correction_generale: string | null; qcm_items: { lettre: string; is_correct: boolean; justification: string | null }[] | null; qcm_series: { cours_id: string } } | null;
  if (!q) throw new Error('Question introuvable.');
  const items = (q.qcm_items ?? []).slice().sort((x, y) => x.lettre.localeCompare(y.lettre));
  const isQroc = (q.format ?? 'qcm') === 'qroc';
  const planned = a.planned_units ?? 0;
  let result: RunnerCorrection['result'];
  let selected: string[] = [];
  let autoMatch: boolean | undefined;
  if (isQroc) {
    const text = (answer.text ?? '').slice(0, 5000);
    autoMatch = q.reponse_attendue ? gradeQroc(text, q.reponse_attendue) : undefined;
    if (!answer.selfGrade) {
      return { result: 'incorrect', correct: [], items: [], reponseAttendue: q.reponse_attendue, correction: q.correction_generale, autoMatch, pendingSelfGrade: true, validated: a.validated_units, planned, completed: false };
    }
    if (!text.trim()) throw new Error('Rédigez votre réponse avant de vous auto-évaluer.');
    result = answer.selfGrade === 'correct' ? 'positive' : answer.selfGrade === 'partial' ? 'partial' : 'incorrect';
  } else {
    const letters = new Set(items.map((i) => i.lettre));
    selected = Array.from(new Set((answer.selected ?? []).filter((x) => letters.has(x)))).sort();
    // Une question passée sans réponse ne compte pas (complément §2).
    if (selected.length === 0) throw new Error('Cochez au moins une proposition pour valider.');
    const disc = items.filter((i) => i.is_correct !== selected.includes(i.lettre)).length;
    result = disc === 0 ? 'positive' : disc === 1 ? 'partial' : 'incorrect';
  }
  const at = new Date().toISOString();
  // Tentative de la plateforme (statistiques, progression) — non recollectée : origine « planificateur ».
  const { data: att, error: attErr } = await db.from('qcm_attempts').insert({
    user_id: userId, question_id: questionId, selected_items: selected, is_correct: result === 'positive', text_answer: isQroc ? (answer.text ?? '').slice(0, 5000) : null,
    attempted_at: at, origin: 'planificateur',
  }).select('id').single();
  if (attErr || !att) throw new Error(attErr?.message ?? 'Réponse non enregistrée.');
  const [ctxQ, config, { data: prev }] = await Promise.all([
    questionContext([questionId]),
    getOrchestratorConfig(),
    db.from('qcm_attempts').select('attempted_at').eq('user_id', userId).eq('question_id', questionId).lt('attempted_at', at).order('attempted_at', { ascending: false }).limit(1).maybeSingle(),
  ]);
  const info = ctxQ.get(questionId);
  const canonical = info?.canonical ?? questionId;
  // Unité de réalisation : une seule par question et par activité (soumissions répétées ignorées).
  await insertUnits([{ activity_id: a.id, user_id: userId, unit_key: `q:${canonical}`, source_key: `qcm_attempt:${(att as { id: string }).id}`, validated_at: at, result: result === 'positive' ? 1 : result === 'partial' ? 0.5 : 0, detail: { via: 'planificateur', format: isQroc ? 'qroc' : 'qcm' } }]);
  const all = await listUnits(userId, { activityIds: [a.id] });
  const validated = new Set(all.map((u) => u.unit_key)).size;
  const rate = activityCompletion(a.planned_units, validated);
  const completed = rate !== null && rate >= 1;
  const patch: Partial<PlanActivityRow> = { validated_units: validated, completion_rate: rate, started_at: a.started_at ?? at };
  if (completed && a.status !== 'COMPLETED') {
    patch.status = 'COMPLETED';
    patch.completed_at = at;
    if (a.started_at) patch.actual_minutes = Math.max(1, Math.min(600, Math.round((Date.parse(at) - Date.parse(a.started_at)) / 60_000)));
  } else if (a.status !== 'IN_PROGRESS' && !completed) {
    patch.status = 'IN_PROGRESS';
  }
  await updateActivities(userId, [a.id], patch);

  // Signal standardisé vers le moteur central (O§3) : c'est lui qui décide de la maîtrise et des besoins.
  const recentlySeen = isRecentlySeen((prev as { attempted_at: string } | null)?.attempted_at ?? null, at, config.recent_seen_days);
  const contentSource = info?.contentSource ?? 'structured_item';
  const centralItem = info?.itemId ?? null;
  const signal: Partial<PedagoSignal> = {
    signal_id: `planner:${a.id}:${questionId}`, candidate_id: userId, item_id: centralItem, source: 'planner_activity', content_source: contentSource,
    source_strength: signalStrength({ source: 'planner_activity', contentSource, recentlySeen, selfAssessed: isQroc }), result_type: result,
    need_type: centralItem ? (result === 'incorrect' ? 'review' : result === 'partial' ? 'consolidate' : 'none') : 'none',
    created_at: at, expires_at: null, origin_activity_id: `planner:${a.id}`, origin_question_id: canonical, estimated_duration_minutes: null,
    metadata: { question_id: questionId, activity_type: a.activity_type, ...(recentlySeen ? { recently_seen: true } : {}), ...(isQroc ? { self_assessed: true } : {}) },
  };
  // Signal au moteur central, fin d'activité et recalcul : après la réponse (`after`) — la correction
  // s'affiche sans attendre le moteur central ; hors d'une requête (script), tout reste synchrone.
  const followUp = async () => {
    const examDate = (await getProfile(userId))?.exam_date ?? null;
    await ingestSignals(userId, [signal], { examDate, plannerActive: true, ...(completed ? { activityCompleted: true, activityLabel: 'activité du planning' } : {}) })
      .catch((e) => console.error('[plan] signal non transmis :', e instanceof Error ? e.message : e));
    if (completed) {
      await insertEvents([{ event_key: `fin:planner:${a.id}`, user_id: userId, item_id: centralItem, event_type: 'PLANNER_ACTIVITY_COMPLETED', source: 'planner_activity', activity_id: `planner:${a.id}`, detail: { type: a.activity_type, unites: validated } }]).catch(() => undefined);
      await addLog({ user_id: userId, item_id: a.item_id, kind: 'activite_terminee', minutes: patch.actual_minutes ?? null, detail: { activite: a.id, unites: validated, prevues: a.planned_units } });
      await refreshPlan(userId, 'activite_terminee', { wait: false }).catch(() => undefined);
    }
  };
  let deferred = false;
  try { after(followUp); deferred = true; } catch { /* hors d'une requête */ }
  if (!deferred) await followUp();
  return {
    result, correct: items.filter((i) => i.is_correct).map((i) => i.lettre), items, reponseAttendue: q.reponse_attendue, correction: q.correction_generale, autoMatch,
    validated, planned, completed,
  };
}
