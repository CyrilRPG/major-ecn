import { NextResponse } from 'next/server';
import { getBearerUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildLicense } from '@/lib/license/sign';
import {
  MAX_SECONDS_PER_DAY,
  MAX_SECONDS_PER_TIME_OP,
  SyncRequestSchema,
  type SyncOp,
} from '@/lib/schemas/mobile-sync';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PULL_LIMIT = 10_000;

type Rejected = { op_id: string; reason: string };

/**
 * POST /api/mobile/sync — replay idempotent de la file hors ligne + pull delta.
 *
 * Règles par table :
 *  - qcm_sessions            : upsert (id client) — le dernier état pousse gagne
 *  - qcm_attempts            : append-only (insert, doublons ignorés)
 *  - flashcard_reviews       : append-only
 *  - student_saved_questions : saved=true → upsert ; saved=false → delete
 *  - course_progress         : OR-merge des booléens + greatest(last_seen_at)
 *  - course_notes            : last-write-wins sur updated_at
 *  - time_tracking           : accumulation plafonnée (≤ 6 h/op, ≤ 16 h/jour)
 *
 * L'idempotence est portée par `sync_ops` (op_id client) : seuls les op_id
 * nouvellement revendiqués sont appliqués ; un rejeu renvoie applied sans effet.
 * Un accès expiré n'empêche PAS la synchro (la progression faite avant
 * expiration appartient à l'étudiant) — l'app verrouille l'UI via `access`.
 */
export async function POST(req: Request) {
  const auth = await getBearerUser(req);
  if (!auth) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const deviceId = req.headers.get(DEVICE_HEADER);
  const check = await assertDeviceSlot(auth.user.id, deviceId);
  if (!check.ok) return check.response;

  const parsed = SyncRequestSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Données invalides' }, { status: 400 });
  }
  const { ops, last_pull_at } = parsed.data;
  const userId = auth.user.id;
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;

  // ── 1) Revendication des op_id (dédup) : seuls les nouveaux sont appliqués ──
  const applied: string[] = [];
  const rejected: Rejected[] = [];
  const freshOps: SyncOp[] = [];
  if (ops.length > 0) {
    const { data: claimedRows, error: claimErr } = await db
      .from('sync_ops')
      .upsert(ops.map((o) => ({ op_id: o.op_id, user_id: userId })), { onConflict: 'op_id', ignoreDuplicates: true })
      .select('op_id');
    if (claimErr) {
      return NextResponse.json({ error: `Idempotence indisponible : ${claimErr.message}` }, { status: 500 });
    }
    const claimed = new Set(((claimedRows ?? []) as { op_id: string }[]).map((r) => r.op_id));
    for (const op of ops) {
      if (claimed.has(op.op_id)) freshOps.push(op);
      else applied.push(op.op_id); // déjà appliqué lors d'un sync précédent (rejeu)
    }
  }

  // Garde-fou : un op_id revendiqué par un AUTRE utilisateur (collision forgée)
  // ne doit jamais être appliqué — le upsert ignoreDuplicates ne renvoie que les
  // lignes réellement insérées (pour CE user), donc freshOps est sûr.

  // ── 2) Application groupée par table, dans l'ordre d'envoi ──
  const byTable = <T extends SyncOp['table']>(t: T) =>
    freshOps.filter((o): o is Extract<SyncOp, { table: T }> => o.table === t);

  const fail = (opsList: { op_id: string }[], reason: string) => {
    for (const o of opsList) rejected.push({ op_id: o.op_id, reason });
  };
  const ok = (opsList: { op_id: string }[]) => {
    for (const o of opsList) applied.push(o.op_id);
  };
  /** Retire la revendication des ops rejetés pour permettre un nouvel essai. */
  const unclaim = async (opsList: { op_id: string }[]) => {
    if (opsList.length === 0) return;
    await db.from('sync_ops').delete().in('op_id', opsList.map((o) => o.op_id)).eq('user_id', userId);
  };

  // qcm_sessions — upsert (dernier état poussé gagne)
  {
    const list = byTable('qcm_sessions');
    if (list.length > 0) {
      const rows = list.map((o) => ({ ...o.row, finished_at: o.row.finished_at ?? null, user_id: userId }));
      const { error } = await db.from('qcm_sessions').upsert(rows, { onConflict: 'id' });
      if (error) { fail(list, error.message); await unclaim(list); } else ok(list);
    }
  }

  // qcm_attempts — append-only
  {
    const list = byTable('qcm_attempts');
    if (list.length > 0) {
      const rows = list.map((o) => ({
        ...o.row,
        session_id: o.row.session_id ?? null,
        selected_items: o.row.selected_items ?? [],
        time_spent_seconds: o.row.time_spent_seconds ?? null,
        text_answer: o.row.text_answer ?? null,
        user_id: userId,
      }));
      const { error } = await db.from('qcm_attempts').upsert(rows, { onConflict: 'id', ignoreDuplicates: true });
      if (error) { fail(list, error.message); await unclaim(list); } else ok(list);
    }
  }

  // flashcard_reviews — append-only
  {
    const list = byTable('flashcard_reviews');
    if (list.length > 0) {
      const rows = list.map((o) => ({ ...o.row, user_id: userId }));
      const { error } = await db.from('flashcard_reviews').upsert(rows, { onConflict: 'id', ignoreDuplicates: true });
      if (error) { fail(list, error.message); await unclaim(list); } else ok(list);
    }
  }

  // student_saved_questions — upsert / delete selon `saved`
  {
    const list = byTable('student_saved_questions');
    const toSave = list.filter((o) => o.row.saved);
    const toUnsave = list.filter((o) => !o.row.saved);
    if (toSave.length > 0) {
      const rows = toSave.map((o) => ({
        user_id: userId,
        question_id: o.row.question_id,
        serie_id: o.row.serie_id ?? null,
        cours_id: o.row.cours_id ?? null,
      }));
      const { error } = await db
        .from('student_saved_questions')
        .upsert(rows, { onConflict: 'user_id,question_id', ignoreDuplicates: true });
      if (error) { fail(toSave, error.message); await unclaim(toSave); } else ok(toSave);
    }
    if (toUnsave.length > 0) {
      const { error } = await db
        .from('student_saved_questions')
        .delete()
        .eq('user_id', userId)
        .in('question_id', toUnsave.map((o) => o.row.question_id));
      if (error) { fail(toUnsave, error.message); await unclaim(toUnsave); } else ok(toUnsave);
    }
  }

  // course_progress — OR-merge (lecture → fusion → upsert)
  {
    const list = byTable('course_progress');
    if (list.length > 0) {
      const coursIds = Array.from(new Set(list.map((o) => o.row.cours_id)));
      const { data: existingRows } = await db
        .from('course_progress')
        .select('cours_id, fiche_read, video_watched, last_seen_at')
        .eq('user_id', userId)
        .in('cours_id', coursIds);
      const existing = new Map(
        ((existingRows ?? []) as { cours_id: string; fiche_read: boolean; video_watched: boolean; last_seen_at: string }[])
          .map((r) => [r.cours_id, r]),
      );
      // Dernière op par cours (les booléens sont OR-mergés avec l'existant).
      const merged = new Map<string, { cours_id: string; fiche_read: boolean; video_watched: boolean; last_seen_at: string }>();
      for (const o of list) {
        const prev = merged.get(o.row.cours_id) ?? existing.get(o.row.cours_id);
        merged.set(o.row.cours_id, {
          cours_id: o.row.cours_id,
          fiche_read: (prev?.fiche_read ?? false) || o.row.fiche_read,
          video_watched: (prev?.video_watched ?? false) || o.row.video_watched,
          last_seen_at:
            prev && prev.last_seen_at > o.row.last_seen_at ? prev.last_seen_at : o.row.last_seen_at,
        });
      }
      const rows = Array.from(merged.values()).map((r) => ({ ...r, user_id: userId }));
      const { error } = await db.from('course_progress').upsert(rows, { onConflict: 'user_id,cours_id' });
      if (error) { fail(list, error.message); await unclaim(list); } else ok(list);
    }
  }

  // course_notes — last-write-wins sur updated_at
  {
    const list = byTable('course_notes');
    if (list.length > 0) {
      const coursIds = Array.from(new Set(list.map((o) => o.row.cours_id)));
      const { data: existingRows } = await db
        .from('course_notes')
        .select('cours_id, updated_at')
        .eq('user_id', userId)
        .in('cours_id', coursIds);
      const existing = new Map(
        ((existingRows ?? []) as { cours_id: string; updated_at: string }[]).map((r) => [r.cours_id, r.updated_at]),
      );
      const winners = new Map<string, { cours_id: string; content: string; updated_at: string }>();
      const stale: typeof list = [];
      for (const o of list) {
        const current = winners.get(o.row.cours_id)?.updated_at ?? existing.get(o.row.cours_id);
        if (current && current >= o.row.updated_at) { stale.push(o); continue; }
        winners.set(o.row.cours_id, o.row);
      }
      // Une note plus ancienne que l'état serveur est « appliquée » sans effet
      // (le pull renverra la version la plus récente).
      ok(stale);
      if (winners.size > 0) {
        const rows = Array.from(winners.values()).map((r) => ({ ...r, user_id: userId }));
        const { error } = await db.from('course_notes').upsert(rows, { onConflict: 'user_id,cours_id' });
        const written = list.filter((o) => winners.get(o.row.cours_id) === o.row);
        if (error) { fail(written, error.message); await unclaim(written); } else ok(written);
      }
    }
  }

  // time_tracking — accumulation plafonnée par (user, jour)
  {
    const list = byTable('time_tracking');
    if (list.length > 0) {
      // Cumul par jour côté requête (plusieurs ops possibles pour un même jour).
      const perDay = new Map<string, number>();
      for (const o of list) {
        perDay.set(
          o.row.session_date,
          Math.min((perDay.get(o.row.session_date) ?? 0) + o.row.seconds, MAX_SECONDS_PER_TIME_OP * 4),
        );
      }
      const dates = Array.from(perDay.keys());
      const { data: existingRows } = await db
        .from('platform_time_tracking')
        .select('session_date, total_seconds')
        .eq('user_id', userId)
        .in('session_date', dates);
      const existing = new Map(
        ((existingRows ?? []) as { session_date: string; total_seconds: number }[]).map((r) => [r.session_date, r.total_seconds]),
      );
      const rows = dates.map((d) => ({
        user_id: userId,
        session_date: d,
        total_seconds: Math.min((existing.get(d) ?? 0) + (perDay.get(d) ?? 0), MAX_SECONDS_PER_DAY),
        last_heartbeat: new Date().toISOString(),
      }));
      const { error } = await db
        .from('platform_time_tracking')
        .upsert(rows, { onConflict: 'user_id,session_date' });
      if (error) { fail(list, error.message); await unclaim(list); } else ok(list);
    }
  }

  // ── 3) Pull delta (état serveur → app) ──
  const since = last_pull_at ?? null;
  const pullQuery = (table: string, select: string, sinceCol: string | null) => {
    let q = db.from(table).select(select).eq('user_id', userId).limit(PULL_LIMIT);
    if (since && sinceCol) q = q.gt(sinceCol, since);
    return q;
  };

  const [progress, notes, sessions, attempts, reviews, saved] = await Promise.all([
    pullQuery('course_progress', 'cours_id, fiche_read, video_watched, last_seen_at', 'last_seen_at'),
    pullQuery('course_notes', 'cours_id, content, updated_at', 'updated_at'),
    since
      ? db.from('qcm_sessions')
          .select('id, serie_id, started_at, finished_at, score_correct, score_total')
          .eq('user_id', userId)
          .or(`started_at.gt.${since},finished_at.gt.${since}`)
          .limit(PULL_LIMIT)
      : pullQuery('qcm_sessions', 'id, serie_id, started_at, finished_at, score_correct, score_total', null),
    pullQuery('qcm_attempts', 'id, session_id, question_id, selected_items, is_correct, time_spent_seconds, attempted_at, text_answer', 'attempted_at'),
    pullQuery('flashcard_reviews', 'id, flashcard_id, difficulty, weight, reviewed_at', 'reviewed_at'),
    // Liste complète à chaque sync (petite) — permet de propager les retraits.
    db.from('student_saved_questions').select('question_id, serie_id, cours_id, created_at').eq('user_id', userId).limit(PULL_LIMIT),
  ]);

  const { license, accessEnd, expired } = await buildLicense(admin, userId, deviceId as string);

  return NextResponse.json({
    applied,
    rejected,
    pull: {
      course_progress: progress.data ?? [],
      course_notes: notes.data ?? [],
      qcm_sessions: sessions.data ?? [],
      qcm_attempts: attempts.data ?? [],
      flashcard_reviews: reviews.data ?? [],
      student_saved_questions: saved.data ?? [],
      saved_questions_is_full_list: true,
    },
    license,
    server_time: new Date().toISOString(),
    access: { expired, access_end: accessEnd },
  });
}
