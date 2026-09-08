'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { logAudit } from '@/lib/audit/log';
import { ensureArenaAdmin, logAdmin, roundHasAttempts } from '@/lib/arena/admin';
import { arenaDb, getQuestion, getRound, getTournament, listAttemptsForRounds, listParticipants, listQuestions } from '@/lib/arena/db';
import { neutralizedEmail, sendArenaEmail } from '@/lib/arena/emails';
import { recomputeRound } from '@/lib/arena/grading';
import { parseImportedRows } from '@/lib/arena/import';
import { LETTERS, sanitizeItems } from '@/lib/arena/types';

/**
 * EVC Arena — questions d'une manche (§20) : saisie, import en masse,
 * pioche dans la banque de QCM de la plateforme, réordonnancement,
 * neutralisation (§10).
 *
 * Une manche qui a déjà des tentatives réelles ne peut plus voir ses
 * questions modifiées ou supprimées : seule la neutralisation reste possible,
 * suivie d'un recalcul et d'une information des participants.
 */

type Ok<T = object> = { ok: true } & T;
type Err = { ok: false; error: string };
const err = (error: string): Err => ({ ok: false, error });

function revalidate(tournamentId: string) {
  revalidatePath(`/admin/arena/${tournamentId}`);
}

const ItemSchema = z.object({
  enonce: z.string().trim().max(2000),
  is_correct: z.boolean().default(false),
  indispensable: z.boolean().default(false),
  inacceptable: z.boolean().default(false),
  justification: z.string().trim().max(4000).default(''),
});

const QuestionSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  round_id: z.string().uuid(),
  type: z.enum(['QRM', 'QRU', 'QRP']),
  expected_count: z.number().int().min(1).max(11).nullable().optional(),
  weight: z.number().positive().max(10).default(1),
  /** Durée propre à la question, en secondes. `null` = celle du tournoi. */
  duration_seconds: z.number().int().min(5).max(3600).nullable().optional(),
  enonce: z.string().trim().min(1, 'Énoncé requis.').max(5000),
  vignette: z.string().trim().max(5000).nullable().optional(),
  images: z.array(z.string().url().max(500)).max(6).default([]),
  items: z.array(ItemSchema).min(2).max(11),
  explanation: z.string().trim().max(10000).default(''),
  pieges: z.string().trim().max(5000).default(''),
  erreurs_frequentes: z.string().trim().max(5000).default(''),
  references_text: z.string().trim().max(3000).default(''),
});

export type QuestionInput = z.input<typeof QuestionSchema>;

export async function saveQuestion(raw: QuestionInput): Promise<Ok<{ id: string; issues: string[] }> | Err> {
  const actor = await ensureArenaAdmin();
  const parsed = QuestionSchema.safeParse(raw);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Question invalide.');
  const d = parsed.data;
  const round = await getRound(d.round_id);
  if (!round) return err('Manche introuvable.');
  if (await roundHasAttempts(round.id)) return err('Cette manche a déjà des participants : les questions ne sont plus modifiables (neutralisation uniquement).');
  const expected = d.type === 'QRP' ? (d.expected_count ?? d.items.filter((i) => i.is_correct).length) : null;
  const { items, issues } = sanitizeItems(d.items, d.type, expected);
  if (items.length < 2) return err('Au moins deux propositions sont nécessaires.');
  const db = arenaDb();
  const payload = {
    round_id: d.round_id, type: d.type, expected_count: expected, weight: d.weight, duration_seconds: d.duration_seconds ?? null,
    enonce: d.enonce, vignette: d.vignette || null,
    images: d.images, items, explanation: d.explanation, pieges: d.pieges, erreurs_frequentes: d.erreurs_frequentes, references_text: d.references_text,
  };
  let id = d.id ?? null;
  if (id) {
    const { error } = await db.from('arena_questions').update(payload).eq('id', id);
    if (error) return err(error.message);
  } else {
    const { count } = await db.from('arena_questions').select('id', { count: 'exact', head: true }).eq('round_id', d.round_id);
    const { data, error } = await db.from('arena_questions').insert({ ...payload, order_index: count ?? 0 }).select('id').single();
    if (error || !data) return err(error?.message ?? 'Enregistrement impossible.');
    id = data.id as string;
  }
  await logAudit({ actor: actor.profile, action: d.id ? 'update' : 'create', entity: 'arena_question', entityId: id, description: `EVC Arena manche ${round.number} : question ${d.id ? 'modifiée' : 'ajoutée'}` });
  revalidate(round.tournament_id);
  return { ok: true, id, issues };
}

export async function deleteQuestion(id: string): Promise<Ok | Err> {
  const actor = await ensureArenaAdmin();
  const q = await getQuestion(id);
  if (!q) return err('Question introuvable.');
  const round = await getRound(q.round_id);
  if (!round) return err('Manche introuvable.');
  if (await roundHasAttempts(round.id)) return err('Cette manche a déjà des participants : neutralisez la question au lieu de la supprimer.');
  await arenaDb().from('arena_questions').delete().eq('id', id);
  await logAudit({ actor: actor.profile, action: 'delete', entity: 'arena_question', entityId: id, description: `EVC Arena manche ${round.number} : question supprimée` });
  revalidate(round.tournament_id);
  return { ok: true };
}

export async function reorderQuestions(roundId: string, ids: string[]): Promise<Ok | Err> {
  await ensureArenaAdmin();
  const round = await getRound(roundId);
  if (!round) return err('Manche introuvable.');
  if (await roundHasAttempts(roundId)) return err('Ordre figé : la manche a déjà des participants.');
  const db = arenaDb();
  for (let i = 0; i < ids.length; i++) await db.from('arena_questions').update({ order_index: i }).eq('id', ids[i]).eq('round_id', roundId);
  revalidate(round.tournament_id);
  return { ok: true };
}

/** Import en masse depuis des lignes déjà parsées côté navigateur (CSV / tableur → objets). */
export async function importQuestions(roundId: string, rows: Record<string, unknown>[], replace: boolean): Promise<Ok<{ inserted: number; rejected: { line: number; reason: string }[] }> | Err> {
  const actor = await ensureArenaAdmin();
  const round = await getRound(roundId);
  if (!round) return err('Manche introuvable.');
  if (await roundHasAttempts(roundId)) return err('Cette manche a déjà des participants : import impossible.');
  if (!Array.isArray(rows) || rows.length === 0) return err('Aucune ligne à importer.');
  if (rows.length > 500) return err('500 lignes maximum par import.');
  const { questions, rejected } = parseImportedRows(rows);
  const db = arenaDb();
  if (replace) await db.from('arena_questions').delete().eq('round_id', roundId);
  const { count } = await db.from('arena_questions').select('id', { count: 'exact', head: true }).eq('round_id', roundId);
  const base = count ?? 0;
  if (questions.length) {
    const { error } = await db.from('arena_questions').insert(questions.map((q, i) => ({ ...q, round_id: roundId, order_index: base + i, images: [] })));
    if (error) return err(error.message);
  }
  await logAdmin(actor, { tournamentId: round.tournament_id, roundId, kind: 'questions_imported', newValue: { inserted: questions.length, rejected: rejected.length, replace }, details: `Import manche ${round.number} : ${questions.length} question(s) insérée(s), ${rejected.length} rejetée(s).` });
  revalidate(round.tournament_id);
  return { ok: true, inserted: questions.length, rejected };
}

/**
 * Pioche dans la banque de QCM de la plateforme (copie figée). Le type est
 * déduit : une seule proposition exacte → QRU, sinon QRM ; l'administrateur
 * peut ensuite requalifier en QRP et compléter les corrections.
 */
export async function importFromBank(roundId: string, questionIds: string[]): Promise<Ok<{ inserted: number }> | Err> {
  const actor = await ensureArenaAdmin();
  const round = await getRound(roundId);
  if (!round) return err('Manche introuvable.');
  if (await roundHasAttempts(roundId)) return err('Cette manche a déjà des participants : import impossible.');
  const ids = [...new Set(questionIds)].slice(0, 200);
  if (ids.length === 0) return err('Aucune question sélectionnée.');
  const db = arenaDb();
  const { data, error } = await db
    .from('qcm_questions')
    .select('id, enonce, format, images, correction_generale, qcm_items(lettre, enonce, is_correct, justification), qcm_series(vignette)')
    .in('id', ids);
  if (error) return err(error.message);
  const { count } = await db.from('arena_questions').select('id', { count: 'exact', head: true }).eq('round_id', roundId);
  const base = count ?? 0;
  const rows: Record<string, unknown>[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const q of (data ?? []) as any[]) {
    if (q.format === 'qroc') continue;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const src = [...(q.qcm_items ?? [])].sort((a: any, b: any) => LETTERS.indexOf(a.lettre) - LETTERS.indexOf(b.lettre));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = src.map((it: any) => ({ enonce: String(it.enonce ?? '').replace(/<[^>]*>/g, ' ').trim(), is_correct: Boolean(it.is_correct), indispensable: false, inacceptable: false, justification: String(it.justification ?? '').replace(/<[^>]*>/g, ' ').trim() }));
    const correct = items.filter((i) => i.is_correct).length;
    const type = correct === 1 ? 'QRU' : 'QRM';
    const { items: clean, issues } = sanitizeItems(items, type, null);
    if (issues.length) continue;
    rows.push({
      round_id: roundId, order_index: base + rows.length, type, expected_count: null, weight: 1,
      enonce: String(q.enonce ?? '').replace(/<[^>]*>/g, ' ').trim(),
      vignette: q.qcm_series?.vignette ? String(q.qcm_series.vignette).replace(/<[^>]*>/g, ' ').trim() : null,
      images: Array.isArray(q.images) ? q.images.filter((s: unknown) => typeof s === 'string') : [],
      items: clean,
      explanation: String(q.correction_generale ?? '').replace(/<[^>]*>/g, ' ').trim(),
      source_question_id: q.id,
    });
  }
  if (rows.length === 0) return err('Aucune question importable (QROC exclues, propositions invalides).');
  const { error: insErr } = await db.from('arena_questions').insert(rows);
  if (insErr) return err(insErr.message);
  await logAdmin(actor, { tournamentId: round.tournament_id, roundId, kind: 'questions_from_bank', newValue: { inserted: rows.length }, details: `${rows.length} question(s) copiée(s) depuis la banque pour la manche ${round.number}.` });
  revalidate(round.tournament_id);
  return { ok: true, inserted: rows.length };
}

/** Neutralisation (§10) : retrait du barème, recalcul automatique, information des participants de la manche. */
export async function neutralizeQuestion(id: string, reason: string): Promise<Ok<{ recomputed: number; notified: number }> | Err> {
  const actor = await ensureArenaAdmin();
  const q = await getQuestion(id);
  if (!q) return err('Question introuvable.');
  if (q.neutralized_at) return err('Question déjà neutralisée.');
  const round = await getRound(q.round_id);
  const t = round ? await getTournament(round.tournament_id) : null;
  if (!round || !t) return err('Manche introuvable.');
  await arenaDb().from('arena_questions').update({ neutralized_at: new Date().toISOString(), neutralized_reason: reason.trim() || null, neutralized_by: actor.user.id }).eq('id', id);
  const recomputed = await recomputeRound(round.id);
  const questions = await listQuestions(round.id);
  const index = questions.findIndex((x) => x.id === id) + 1;
  // Information des participants ayant joué la manche (§10) — une seule fois par question.
  const attempts = await listAttemptsForRounds([round.id]);
  const played = new Set(attempts.map((a) => a.participant_id));
  const participants = (await listParticipants(t.id)).filter((p) => played.has(p.id) && p.email_confirmed_at && !p.blocked_at && !p.anonymized_at);
  let notified = 0;
  for (const p of participants) {
    const r = await sendArenaEmail({ tournament: t, participant: p, to: p.email, kind: 'neutralized', roundId: round.id, dedupeKey: `neutralized:${id}:${p.id}`, mail: neutralizedEmail(t, p, round.number, index, reason.trim()), triggeredBy: actor.user.id });
    if (r.ok) notified++;
  }
  await logAdmin(actor, { tournamentId: t.id, roundId: round.id, kind: 'question_neutralized', newValue: { questionId: id, index, reason }, details: `Question ${index} de la manche ${round.number} neutralisée : ${reason.trim() || 'sans motif'}. ${recomputed} tentative(s) recalculée(s), ${notified} participant(s) informé(s).` });
  await logAudit({ actor: actor.profile, action: 'update', entity: 'arena_question', entityId: id, description: `EVC Arena manche ${round.number} : question ${index} neutralisée` });
  revalidate(t.id);
  return { ok: true, recomputed, notified };
}

export async function restoreQuestion(id: string): Promise<Ok<{ recomputed: number }> | Err> {
  const actor = await ensureArenaAdmin();
  const q = await getQuestion(id);
  if (!q || !q.neutralized_at) return err('Question introuvable ou non neutralisée.');
  const round = await getRound(q.round_id);
  if (!round) return err('Manche introuvable.');
  await arenaDb().from('arena_questions').update({ neutralized_at: null, neutralized_reason: null, neutralized_by: null }).eq('id', id);
  const recomputed = await recomputeRound(round.id);
  await logAdmin(actor, { tournamentId: round.tournament_id, roundId: round.id, kind: 'question_restored', newValue: { questionId: id }, details: `Question rétablie dans le barème de la manche ${round.number} ; ${recomputed} tentative(s) recalculée(s).` });
  revalidate(round.tournament_id);
  return { ok: true, recomputed };
}
