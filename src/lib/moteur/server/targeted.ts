import 'server-only';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { parseScope, canAccessCollege } from '@/lib/auth/permissions';
import { canStudentReadSerie } from '@/lib/data/qcm-access-rules';
import { aplatirUnites, choisirUnites, dossiersDepuisSeries, regrouperEnUnites } from '@/lib/pedago/dossiers';
import { uniteIncomplete } from '@/lib/qcm/donnees-manquantes';
import { gradeQroc } from '@/lib/qcm/grade';
import { accessFor, coursAllowed, exposuresFor } from '@/lib/checkup/server/pool';
import { isRecentlySeen, signalStrength } from '../signal';
import type { PedagoSignal } from '../types';
import { coursCatalog, getOrchestratorConfig, listItemStates, moteurDb } from './db';
import { candidateContext } from './candidate';
import { ingestSignals } from './ingest';

/**
 * Révision ciblée d'un ou plusieurs items : l'activité ouverte par le
 * programme du jour (révision prioritaire, réactivation J+7/14/30/60,
 * contrôle) et par « M'entraîner sur mes lacunes ». C'est une révision
 * transversale ÉVALUATIVE : chaque réponse produit un signal de force
 * intermédiaire (faible si la question est récemment vue ou si c'est une QROC
 * auto-évaluée), et la fin de la révision ferme les besoins satisfaits.
 *
 * Les questions servies sont liées à la session par un jeton signé : une
 * réponse à une autre question est refusée, les bonnes réponses ne sont
 * révélées qu'après validation.
 */

export type TargetedQuestion = {
  id: string;
  itemId: string;
  itemName: string;
  format: 'qcm' | 'qroc';
  enonce: string;
  images: string[];
  vignette: string | null;
  dossier: { position: number; total: number } | null;
  items: { lettre: string; enonce: string; images: string[] }[];
};

export type TargetedSession = { token: string; activityId: string; questions: TargetedQuestion[]; itemNames: Record<string, string> };

const SECRET = () => process.env.PEDAGO_SESSION_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'dev';
type TokenPayload = { u: string; a: string; q: string[]; i: string[]; m: string; t: number };
function sign(p: TokenPayload): string {
  const body = Buffer.from(JSON.stringify(p)).toString('base64url');
  const mac = createHmac('sha256', SECRET()).update(body).digest('base64url');
  return `${body}.${mac}`;
}
export function verifyToken(token: string, userId: string): TokenPayload | null {
  const [body, mac] = token.split('.');
  if (!body || !mac) return null;
  const expected = createHmac('sha256', SECRET()).update(body).digest('base64url');
  if (expected.length !== mac.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(mac))) return null;
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString()) as TokenPayload;
    if (p.u !== userId || Date.now() - p.t > 12 * 3_600_000) return null;
    return p;
  } catch { return null; }
}

type VivierQuestion = { id: string; serie_id: string; order_index: number; format: string | null; n_items: number };
type VivierSerie = { id: string; label: string | null; type: string | null; vignette: string | null; n_questions: number };

/** Compose une révision ciblée sur des items accessibles (voie, formule) : questions les moins récemment vues d'abord, dossiers entiers. */
export async function composeTargeted(userId: string, permissionScope: unknown, itemIds: string[], motif: string, size = 10): Promise<TargetedSession | { error: string }> {
  const { byId, parentOf } = await coursCatalog();
  const scope = parseScope(permissionScope);
  const items = itemIds.filter((id) => {
    const c = byId.get(id);
    if (!c) return false;
    return canAccessCollege(scope, c.specialityId) && coursAllowed(permissionScope, { id: c.id, titre: c.titre, matiereId: c.matiere_id, importance: c.importance });
  }).slice(0, 12);
  if (items.length === 0) return { error: 'Aucun item accessible pour cette révision.' };
  void parentOf;
  const { data, error } = await moteurDb().rpc('vivier_revisions_cours', { p_cours_ids: items });
  if (error) throw new Error(error.message);
  const doc = (data ?? {}) as { questions?: VivierQuestion[]; series?: VivierSerie[] };
  const series = new Map((doc.series ?? []).map((s) => [s.id, s]));
  // Lecture des droits de chaque série (voie, formule) avec les colonnes d'accès,
  // par tranches (jamais d'URL géante) ; les formats des questions servent au
  // repli de voie des entraînements, comme dans la policy SQL.
  const serieIds = Array.from(series.keys());
  const access: { id: string; label: string; type: string | null; kind: string | null; allowed_voies: string[] | null; allowed_offers: string[] | null; mg_series: boolean | null; is_revisions: boolean | null; cours_id: string }[] = [];
  for (let i = 0; i < serieIds.length; i += 150) {
    const { data: a, error: e } = await moteurDb().from('qcm_series').select('id, label, type, kind, allowed_voies, allowed_offers, mg_series, is_revisions, cours_id').in('id', serieIds.slice(i, i + 150));
    if (e) throw new Error(e.message);
    access.push(...((a ?? []) as typeof access));
  }
  const formatsBySerie = new Map<string, string[]>();
  for (const q of doc.questions ?? []) formatsBySerie.set(q.serie_id, [...(formatsBySerie.get(q.serie_id) ?? []), q.format ?? 'qcm']);
  const { ctx, geriatrie } = accessFor(permissionScope, scope.voie ?? null);
  const readable = new Set<string>();
  for (const s of access) {
    if ((s.type === 'qcm' || s.type === 'qroc') && canStudentReadSerie(s, { ...ctx, geriatrieMgBonus: geriatrie && s.mg_series === true }, formatsBySerie.get(s.id))) readable.add(s.id);
  }
  const pool = (doc.questions ?? []).filter((q) => readable.has(q.serie_id) && ((q.format ?? 'qcm') === 'qroc' || q.n_items >= 2));
  if (pool.length === 0) return { error: 'Aucune question disponible sur ces items pour votre voie : relisez la fiche de l’item.' };
  const exposures = await exposuresFor(userId, items);
  // Empreintes canoniques par tranches de 150 (URL bornée, plafond PostgREST de 1000 lignes).
  const canon = new Map<string, string>();
  const poolIds = pool.map((q) => q.id);
  for (let i = 0; i < poolIds.length; i += 150) {
    const { data: fps } = await moteurDb().from('question_fingerprints').select('question_id, canonical_question_id').in('question_id', poolIds.slice(i, i + 150));
    for (const r of (fps ?? []) as { question_id: string; canonical_question_id: string }[]) canon.set(r.question_id, r.canonical_question_id);
  }
  const nowSec = Date.now() / 1000;
  // Score d'urgence (plus bas = servi d'abord) : jamais vue, puis la plus anciennement vue.
  const scoreDe = (q: VivierQuestion) => {
    const e = exposures.get(canon.get(q.id) ?? q.id);
    if (!e) return 0;
    const ageDays = (nowSec - e.last) / 86_400;
    return ageDays > 30 ? 1 + 1 / Math.max(1, ageDays) : 3;
  };
  const dossiers = dossiersDepuisSeries(Array.from(series.values()).filter((s) => readable.has(s.id)).map((s) => ({ id: s.id, label: s.label, vignette: s.vignette, type: s.type, nbQuestions: s.n_questions })));
  const { unites } = regrouperEnUnites(pool, dossiers);
  // Équilibre entre items : chaque item reçoit sa part avant qu'un autre en reçoive davantage.
  const chosen = choisirUnites(unites, scoreDe, size);
  const flat = aplatirUnites(chosen);
  const ids = flat.map((x) => x.question.id);
  const { data: full } = await moteurDb().from('qcm_questions')
    .select('id, enonce, images, format, qcm_items(lettre, enonce, images), qcm_series!inner(id, vignette, cours_id)').in('id', ids);
  type Full = { id: string; enonce: string; images: string[] | null; format: string | null; qcm_items: { lettre: string; enonce: string; images: string[] | null }[] | null; qcm_series: { id: string; vignette: string | null; cours_id: string } };
  const byQ = new Map(((full ?? []) as Full[]).map((q) => [q.id, q]));
  // Garde « données absentes » : un dossier ou une question intraitable n'est jamais servi.
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
  const questions: TargetedQuestion[] = flat.filter((x) => !bad.has(x.question.id)).map((x) => {
    const f = byQ.get(x.question.id)!;
    const itemId = f.qcm_series.cours_id;
    return {
      id: f.id, itemId, itemName: byId.get(itemId)?.titre ?? 'Item', format: (f.format ?? 'qcm') === 'qroc' ? 'qroc' : 'qcm',
      enonce: f.enonce, images: f.images ?? [], vignette: x.dossier ? f.qcm_series.vignette : null,
      dossier: x.dossier ? { position: x.dossier.position, total: x.dossier.total } : null,
      items: (f.qcm_items ?? []).slice().sort((a, b) => a.lettre.localeCompare(b.lettre)).map((i) => ({ lettre: i.lettre, enonce: i.enonce, images: i.images ?? [] })),
    };
  });
  if (questions.length === 0) return { error: 'Aucune question exploitable sur ces items pour le moment : relisez la fiche de l’item.' };
  const activityId = `ciblee:${randomUUID()}`;
  const token = sign({ u: userId, a: activityId, q: questions.map((q) => q.id), i: items, m: motif.slice(0, 30), t: Date.now() });
  return { token, activityId, questions, itemNames: Object.fromEntries(items.map((i) => [i, byId.get(i)?.titre ?? 'Item'])) };
}

export type TargetedCorrection = {
  result: 'positive' | 'partial' | 'incorrect';
  correct: string[];
  items: { lettre: string; is_correct: boolean; justification: string | null }[];
  reponseAttendue: string | null;
  correction: string | null;
  autoMatch?: boolean;
};

/** Correction d'une réponse (après validation seulement) : tentative enregistrée et signal émis. */
export async function answerTargeted(userId: string, token: string, questionId: string, answer: { selected?: string[]; text?: string; selfGrade?: 'correct' | 'partial' | 'incorrect' }): Promise<TargetedCorrection> {
  const p = verifyToken(token, userId);
  if (!p || !p.q.includes(questionId)) throw new Error('Question hors de cette révision.');
  const db = moteurDb();
  const { data } = await db.from('qcm_questions').select('id, format, reponse_attendue, correction_generale, qcm_items(lettre, is_correct, justification), qcm_series!inner(cours_id)').eq('id', questionId).maybeSingle();
  const q = data as { id: string; format: string | null; reponse_attendue: string | null; correction_generale: string | null; qcm_items: { lettre: string; is_correct: boolean; justification: string | null }[] | null; qcm_series: { cours_id: string } } | null;
  if (!q) throw new Error('Question introuvable.');
  const items = (q.qcm_items ?? []).slice().sort((a, b) => a.lettre.localeCompare(b.lettre));
  const isQroc = (q.format ?? 'qcm') === 'qroc';
  let result: TargetedCorrection['result'];
  let selected: string[] = [];
  let autoMatch: boolean | undefined;
  if (isQroc) {
    const text = (answer.text ?? '').slice(0, 5000);
    autoMatch = q.reponse_attendue ? gradeQroc(text, q.reponse_attendue) : undefined;
    if (!answer.selfGrade) {
      // Première étape d'une QROC : on révèle la correction ; la note viendra de l'auto-évaluation.
      return { result: 'incorrect', correct: [], items: [], reponseAttendue: q.reponse_attendue, correction: q.correction_generale, autoMatch };
    }
    result = !text.trim() ? 'incorrect' : answer.selfGrade === 'correct' ? 'positive' : answer.selfGrade === 'partial' ? 'partial' : 'incorrect';
  } else {
    const letters = new Set(items.map((i) => i.lettre));
    selected = Array.from(new Set((answer.selected ?? []).filter((x) => letters.has(x)))).sort();
    const disc = items.filter((i) => i.is_correct !== selected.includes(i.lettre)).length;
    result = selected.length === 0 ? 'incorrect' : disc === 0 ? 'positive' : disc === 1 ? 'partial' : 'incorrect';
  }
  const correctionOnly = { result, correct: items.filter((i) => i.is_correct).map((i) => i.lettre), items, reponseAttendue: q.reponse_attendue, correction: q.correction_generale, autoMatch };
  // Une question déjà répondue dans CETTE révision n'est jamais comptée deux fois (tentative ni signal).
  const { data: already } = await db.from('pedago_signals').select('signal_id').eq('signal_id', `${p.a}:${questionId}`).maybeSingle();
  if (already) return correctionOnly;
  const at = new Date().toISOString();
  // Tentative de la plateforme (statistiques, progression) — non recollectée : origine « revision_ciblee ».
  await db.from('qcm_attempts').insert({
    user_id: userId, question_id: questionId, selected_items: selected, is_correct: result === 'positive', text_answer: isQroc ? (answer.text ?? '').slice(0, 5000) : null,
    attempted_at: at, origin: 'revision_ciblee',
  });
  const [config, { data: fp }, { data: prev }] = await Promise.all([
    getOrchestratorConfig(),
    db.from('question_fingerprints').select('canonical_question_id').eq('question_id', questionId).maybeSingle(),
    db.from('qcm_attempts').select('attempted_at').eq('user_id', userId).eq('question_id', questionId).lt('attempted_at', at).order('attempted_at', { ascending: false }).limit(1).maybeSingle(),
  ]);
  const recentlySeen = isRecentlySeen((prev as { attempted_at: string } | null)?.attempted_at ?? null, at, config.recent_seen_days);
  const itemId = p.i.includes(q.qcm_series.cours_id) ? q.qcm_series.cours_id : null;
  const strength = signalStrength({ source: 'transversal_review', contentSource: 'structured_item', recentlySeen, selfAssessed: isQroc });
  const signal: Partial<PedagoSignal> = {
    signal_id: `${p.a}:${questionId}`, candidate_id: userId, item_id: itemId, source: 'transversal_review', content_source: 'structured_item',
    source_strength: strength, result_type: result, need_type: itemId ? (result === 'incorrect' ? 'review' : result === 'partial' ? 'consolidate' : 'none') : 'none',
    created_at: at, expires_at: null, origin_activity_id: p.a, origin_question_id: (fp as { canonical_question_id: string } | null)?.canonical_question_id ?? questionId,
    estimated_duration_minutes: null, metadata: { question_id: questionId, targeted: true, motif: p.m, ...(recentlySeen ? { recently_seen: true } : {}), ...(isQroc ? { self_assessed: true } : {}) },
  };
  const ctx = await candidateContext(userId);
  await ingestSignals(userId, [signal], { examDate: ctx?.examDate ?? null, plannerActive: !!ctx?.plannerActive });
  return correctionOnly;
}

/** Fin de la révision ciblée : événement de fin, besoins satisfaits fermés, statuts mis à jour. */
export async function finishTargeted(userId: string, token: string): Promise<{ items: { itemId: string; name: string; status: string; reason: string | null }[] }> {
  const p = verifyToken(token, userId);
  if (!p) throw new Error('Révision introuvable.');
  const ctx = await candidateContext(userId);
  // Un signal « completed » marque la fin de l'activité (fermeture des besoins, événement TRANSVERSAL_REVIEW_COMPLETED).
  await ingestSignals(userId, [], { examDate: ctx?.examDate ?? null, plannerActive: !!ctx?.plannerActive, activityCompleted: true, activityLabel: 'révision ciblée' });
  await moteurDb().from('pedago_events').upsert({ event_key: `fin:${p.a}`, user_id: userId, event_type: 'TRANSVERSAL_REVIEW_COMPLETED', source: 'transversal_review', activity_id: p.a, detail: { items: p.i, motif: p.m } }, { onConflict: 'event_key', ignoreDuplicates: true });
  const states = new Map((await listItemStates(userId)).map((s) => [s.item_id, s]));
  const { byId } = await coursCatalog();
  return { items: p.i.map((id) => ({ itemId: id, name: byId.get(id)?.titre ?? 'Item', status: states.get(id)?.mastery_status ?? 'non_evalue', reason: states.get(id)?.status_reason ?? null })) };
}
