import { NextResponse } from 'next/server';
import { z } from 'zod';
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
import {
  chunk,
  classifyAttemptError,
  classifyDbError,
  groupByKey,
  nextPullCursor,
  splitAttemptsBySession,
  writeByBisection,
  type DbErrorLike,
  type RejectKind,
} from './sync-core';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Lignes par page PostgREST (plafond serveur : 1000). */
const PAGE_SIZE = 1000;
/**
 * Lignes au plus par table et par appel : au-delà, la table est rendue
 * « incomplète » avec un curseur de reprise et l'app rappelle aussitôt. Borne
 * la réponse sous la limite de 4,5 Mo des fonctions Vercel (un élève assidu
 * dépasse 10 000 tentatives QCM).
 */
const PULL_MAX_ROWS_PER_TABLE = 4000;
/** Taille des tranches d'identifiants passées en `.in()` (URL PostgREST). */
const IN_CHUNK = 100;
/**
 * Budget de l'isolement des lignes fautives (dichotomie) : au-delà, les ops
 * non écrites sont libérées de `sync_ops` et rejouées au prochain sync,
 * jamais déclarées appliquées.
 */
const WRITE_BUDGET_MS = 20_000;
const WRITE_BUDGET_WRITES = 150;

type Rejected = { op_id: string; reason: string; kind: RejectKind };

const PULL_TABLES = ['course_progress', 'course_notes', 'qcm_sessions', 'qcm_attempts', 'flashcard_reviews'] as const;
type PullTable = (typeof PULL_TABLES)[number];

/**
 * Extension du protocole (app ≥ 1.2) : un curseur par table. Absent (ancienne
 * app), chaque table repart de `last_pull_at`. Lu à part pour ne pas toucher
 * au schéma commun du protocole.
 */
const PullCursorsSchema = z.object({
  pull_since: z.record(z.string(), z.string().datetime({ offset: true }).nullable()).optional(),
});

/**
 * POST /api/mobile/sync — replay idempotent de la file hors ligne + pull delta.
 *
 * Corps : `{ last_pull_at, ops[], pull_since? }`.
 * Réponse : `{ applied[], rejected[{ op_id, reason, kind }], pull, pull_cursors,
 * pull_complete, license, server_time, access }`.
 *
 * Règles par table :
 *  - qcm_sessions            : upsert (id client) — dernier état poussé gagne,
 *                              ops dédoublonnées par id, propriétaire vérifié
 *  - qcm_attempts            : append-only (insert, doublons ignorés), séance
 *                              d'un autre compte refusée
 *  - flashcard_reviews       : append-only
 *  - student_saved_questions : saved=true → upsert ; saved=false → delete
 *  - course_progress         : OR-merge des booléens + greatest(last_seen_at)
 *  - course_notes            : last-write-wins sur updated_at
 *  - time_tracking           : accumulation plafonnée (≤ 6 h/op, ≤ 16 h/jour)
 *
 * Rejets : `kind: 'definitive'` (l'app retire l'op) ou `'transient'` (l'app la
 * garde et réessaie). Un lot en échec définitif est coupé en deux jusqu'à
 * isoler la ligne fautive (dichotomie bornée en écritures et en temps ; le
 * reste est rendu transitoire et sa réservation libérée).
 *
 * L'idempotence est portée par `sync_ops` (op_id client) : seuls les op_id
 * nouvellement revendiqués sont appliqués ; un rejeu renvoie applied sans effet.
 * Un accès expiré n'empêche PAS la synchro (la progression faite avant
 * expiration appartient à l'étudiant) — l'app verrouille l'UI via `access`.
 *
 * Appareil révoqué (un autre appareil a pris le créneau) : la file de CET
 * appareil est tout de même appliquée pour l'utilisateur du jeton, puis la
 * route répond 401 DEVICE_REVOKED avec `applied`/`rejected` — sinon les
 * réponses faites hors ligne étaient effacées avec le reste du hors ligne.
 */
export async function POST(req: Request) {
  const auth = await getBearerUser(req);
  if (!auth) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const deviceId = req.headers.get(DEVICE_HEADER);
  const check = await assertDeviceSlot(auth.user.id, deviceId);
  let revoked: { error: string; reason?: string } | null = null;
  if (!check.ok) {
    const b = await check.response.clone().json().then(
      (x: { code?: string; reason?: string; error?: string }) => x,
      () => ({} as { code?: string; reason?: string; error?: string }),
    );
    // Seule la révocation (créneau perdu ou compte désactivé, cf. device.ts)
    // laisse passer la file — le dernier envoi de l'app avant sa purge ; une
    // requête sans appareil n'écrit rien.
    if (b.code !== 'DEVICE_REVOKED') return check.response;
    revoked = { error: b.error ?? 'Votre compte a été connecté sur un autre appareil.', reason: b.reason };
  }

  const body = await req.json().catch(() => ({}));
  const parsed = SyncRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Données invalides' }, { status: 400 });
  }
  const cursorsParsed = PullCursorsSchema.safeParse(body);
  const pullSince = cursorsParsed.success ? cursorsParsed.data.pull_since ?? {} : {};
  const { ops, last_pull_at } = parsed.data;
  const userId = auth.user.id;
  const admin = createAdminClient();
  const budget = { deadline: Date.now() + WRITE_BUDGET_MS, writesLeft: WRITE_BUDGET_WRITES };
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

  const ok = (opsList: { op_id: string }[]) => {
    for (const o of opsList) applied.push(o.op_id);
  };
  /** Retire la revendication des ops rejetés pour permettre un nouvel essai. */
  const unclaim = async (opsList: { op_id: string }[]) => {
    for (const part of chunk(opsList.map((o) => o.op_id), IN_CHUNK)) {
      await db.from('sync_ops').delete().in('op_id', part).eq('user_id', userId);
    }
  };
  const fail = async (opsList: { op_id: string }[], reason: string, kind: RejectKind) => {
    for (const o of opsList) rejected.push({ op_id: o.op_id, reason, kind });
    await unclaim(opsList);
  };

  type Group<O> = { ops: O[]; row: Record<string, unknown> };
  /**
   * Écrit des groupes (une ligne par groupe, portée par une ou plusieurs ops).
   * Échec transitoire → la tranche est rendue transitoire. Échec définitif sur
   * plusieurs lignes → dichotomie (writeByBisection) pour n'écarter que la
   * ligne fautive (une question supprimée ne fait pas perdre toute la séance),
   * bornée par `budget` : ce qui n'a pas pu être tenté est libéré de
   * `sync_ops` et rendu transitoire. Renvoie les groupes écrits.
   */
  const writeGroups = async <O extends { op_id: string }>(
    groups: Group<O>[],
    write: (rows: Record<string, unknown>[]) => Promise<DbErrorLike>,
    classify: (err: DbErrorLike) => RejectKind = classifyDbError,
  ): Promise<Group<O>[]> => {
    if (groups.length === 0) return [];
    const res = await writeByBisection(groups, (slice) => write(slice.map((g) => g.row)), classify, budget);
    ok(res.ok.flatMap((g) => g.ops));
    for (const f of res.failed) await fail(f.group.ops, f.error.message ?? 'Erreur base', f.kind);
    for (const t of res.transient) await fail(t.groups.flatMap((g) => g.ops), t.error.message ?? 'Erreur base', 'transient');
    if (res.deferred.length > 0) {
      await fail(res.deferred.flatMap((g) => g.ops), 'Synchronisation différée (délai de traitement atteint)', 'transient');
    }
    return res.ok;
  };

  /** Propriétaires des séances existantes parmi `ids` (tranches de 100). */
  const sessionOwners = async (ids: string[]): Promise<Map<string, string> | DbErrorLike> => {
    const owners = new Map<string, string>();
    for (const part of chunk(Array.from(new Set(ids)), IN_CHUNK)) {
      const { data, error } = await db.from('qcm_sessions').select('id, user_id').in('id', part);
      if (error) return error as DbErrorLike;
      for (const r of (data ?? []) as { id: string; user_id: string }[]) owners.set(r.id, r.user_id);
    }
    return owners;
  };

  // Séances écrites avec succès dans CETTE requête (voir qcm_attempts).
  const writtenSessionIds = new Set<string>();

  // qcm_sessions — upsert (dernier état poussé gagne), propriétaire vérifié
  {
    const list = byTable('qcm_sessions');
    if (list.length > 0) {
      const owners = await sessionOwners(list.map((o) => o.row.id));
      if (!(owners instanceof Map)) {
        await fail(list, owners?.message ?? 'Lecture des séances impossible', 'transient');
      } else {
        // Une séance d'un autre compte ne doit jamais être réécrite (l'upsert
        // sur `id` lui aurait volé la ligne en forçant user_id).
        const foreign = list.filter((o) => { const u = owners.get(o.row.id); return u !== undefined && u !== userId; });
        if (foreign.length > 0) await fail(foreign, 'Séance d’un autre compte', 'definitive');
        const mine = list.filter((o) => !foreign.includes(o));
        const groups = groupByKey(mine, (o) => o.row.id).map((g) => ({
          ops: g.items,
          row: { ...g.last.row, finished_at: g.last.row.finished_at ?? null, user_id: userId },
        }));
        const written = await writeGroups(groups, async (rows) => (await db.from('qcm_sessions').upsert(rows, { onConflict: 'id' })).error);
        for (const g of written) writtenSessionIds.add(String(g.row.id));
      }
    }
  }

  // qcm_attempts — append-only, rattachées à une séance de CE compte
  {
    const list = byTable('qcm_attempts');
    if (list.length > 0) {
      const sessionIds = list.map((o) => o.row.session_id).filter((id): id is string => !!id);
      const owners = sessionIds.length > 0 ? await sessionOwners(sessionIds) : new Map<string, string>();
      if (!(owners instanceof Map)) {
        await fail(list, owners?.message ?? 'Lecture des séances impossible', 'transient');
      } else {
        const foreign = list.filter((o) => {
          const u = o.row.session_id ? owners.get(o.row.session_id) : undefined;
          return u !== undefined && u !== userId;
        });
        if (foreign.length > 0) await fail(foreign, 'Séance d’un autre compte', 'definitive');
        // Séance ni en base ni écrite ici (création hors ligne dont l'écriture
        // vient d'échouer, ou op de séance encore en attente dans l'app) : ne
        // rien écrire, rejet TRANSITOIRE — l'insert violerait la clé étrangère
        // (23503), jadis classée définitive, et l'app effaçait les réponses.
        const known = new Set<string>(writtenSessionIds);
        for (const [id, owner] of owners) if (owner === userId) known.add(id);
        const { ready: mine, pending } = splitAttemptsBySession(
          list.filter((o) => !foreign.includes(o)),
          (o) => o.row.session_id,
          known,
        );
        if (pending.length > 0) await fail(pending, 'Séance pas encore synchronisée', 'transient');
        const groups = groupByKey(mine, (o) => o.row.id).map((g) => ({
          ops: g.items,
          row: {
            ...g.last.row,
            session_id: g.last.row.session_id ?? null,
            selected_items: g.last.row.selected_items ?? [],
            time_spent_seconds: g.last.row.time_spent_seconds ?? null,
            text_answer: g.last.row.text_answer ?? null,
            user_id: userId,
          },
        }));
        await writeGroups(
          groups,
          async (rows) => (await db.from('qcm_attempts').upsert(rows, { onConflict: 'id', ignoreDuplicates: true })).error,
          classifyAttemptError,
        );
      }
    }
  }

  // flashcard_reviews — append-only
  {
    const groups = groupByKey(byTable('flashcard_reviews'), (o) => o.row.id).map((g) => ({
      ops: g.items,
      row: { ...g.last.row, user_id: userId },
    }));
    await writeGroups(groups, async (rows) =>
      (await db.from('flashcard_reviews').upsert(rows, { onConflict: 'id', ignoreDuplicates: true })).error);
  }

  // student_saved_questions — dernier état par question : upsert / delete
  {
    const groups = groupByKey(byTable('student_saved_questions'), (o) => o.row.question_id);
    const toSave = groups.filter((g) => g.last.row.saved).map((g) => ({
      ops: g.items,
      row: {
        user_id: userId,
        question_id: g.last.row.question_id,
        serie_id: g.last.row.serie_id ?? null,
        cours_id: g.last.row.cours_id ?? null,
      },
    }));
    const toUnsave = groups.filter((g) => !g.last.row.saved).map((g) => ({
      ops: g.items,
      row: { question_id: g.last.row.question_id },
    }));
    await writeGroups(toSave, async (rows) =>
      (await db.from('student_saved_questions').upsert(rows, { onConflict: 'user_id,question_id', ignoreDuplicates: true })).error);
    await writeGroups(toUnsave, async (rows) => {
      for (const part of chunk(rows.map((r) => r.question_id as string), IN_CHUNK)) {
        const { error } = await db.from('student_saved_questions').delete().eq('user_id', userId).in('question_id', part);
        if (error) return error as DbErrorLike;
      }
      return null;
    });
  }

  // course_progress — OR-merge (lecture → fusion → upsert)
  {
    const list = byTable('course_progress');
    if (list.length > 0) {
      const coursIds = Array.from(new Set(list.map((o) => o.row.cours_id)));
      type Progress = { cours_id: string; fiche_read: boolean; video_watched: boolean; last_seen_at: string };
      const existing = new Map<string, Progress>();
      let readError: DbErrorLike = null;
      for (const part of chunk(coursIds, IN_CHUNK)) {
        const { data, error } = await db
          .from('course_progress')
          .select('cours_id, fiche_read, video_watched, last_seen_at')
          .eq('user_id', userId)
          .in('cours_id', part);
        if (error) { readError = error; break; }
        for (const r of (data ?? []) as Progress[]) existing.set(r.cours_id, r);
      }
      if (readError) {
        await fail(list, readError.message ?? 'Lecture impossible', 'transient');
      } else {
        const groups = groupByKey(list, (o) => o.row.cours_id).map((g) => {
          let merged: Progress | undefined = existing.get(g.key);
          for (const o of g.items) {
            merged = {
              cours_id: o.row.cours_id,
              fiche_read: (merged?.fiche_read ?? false) || o.row.fiche_read,
              video_watched: (merged?.video_watched ?? false) || o.row.video_watched,
              last_seen_at: merged && merged.last_seen_at > o.row.last_seen_at ? merged.last_seen_at : o.row.last_seen_at,
            };
          }
          return { ops: g.items, row: { ...merged!, user_id: userId } };
        });
        await writeGroups(groups, async (rows) =>
          (await db.from('course_progress').upsert(rows, { onConflict: 'user_id,cours_id' })).error);
      }
    }
  }

  // course_notes — last-write-wins sur updated_at
  {
    const list = byTable('course_notes');
    if (list.length > 0) {
      const coursIds = Array.from(new Set(list.map((o) => o.row.cours_id)));
      const existing = new Map<string, string>();
      let readError: DbErrorLike = null;
      for (const part of chunk(coursIds, IN_CHUNK)) {
        const { data, error } = await db
          .from('course_notes')
          .select('cours_id, updated_at')
          .eq('user_id', userId)
          .in('cours_id', part);
        if (error) { readError = error; break; }
        for (const r of (data ?? []) as { cours_id: string; updated_at: string }[]) existing.set(r.cours_id, r.updated_at);
      }
      if (readError) {
        await fail(list, readError.message ?? 'Lecture impossible', 'transient');
      } else {
        const groups: Group<(typeof list)[number]>[] = [];
        for (const g of groupByKey(list, (o) => o.row.cours_id)) {
          // Version la plus récente du groupe ; plus ancienne que le serveur →
          // « appliquée » sans effet (le pull renverra la version serveur).
          const newest = g.items.reduce((a, b) => (b.row.updated_at > a.row.updated_at ? b : a));
          const current = existing.get(g.key);
          if (current && current >= newest.row.updated_at) { ok(g.items); continue; }
          groups.push({ ops: g.items, row: { ...newest.row, user_id: userId } });
        }
        await writeGroups(groups, async (rows) =>
          (await db.from('course_notes').upsert(rows, { onConflict: 'user_id,cours_id' })).error);
      }
    }
  }

  // time_tracking — accumulation plafonnée par (user, jour)
  {
    const list = byTable('time_tracking');
    if (list.length > 0) {
      const days = groupByKey(list, (o) => o.row.session_date);
      const dates = days.map((d) => d.key);
      const { data: existingRows, error: readError } = await db
        .from('platform_time_tracking')
        .select('session_date, total_seconds')
        .eq('user_id', userId)
        .in('session_date', dates);
      if (readError) {
        await fail(list, readError.message ?? 'Lecture impossible', 'transient');
      } else {
        const existing = new Map(
          ((existingRows ?? []) as { session_date: string; total_seconds: number }[]).map((r) => [r.session_date, r.total_seconds]),
        );
        const nowIso = new Date().toISOString();
        const groups = days.map((d) => {
          // Cumul du jour côté requête (plusieurs ops possibles), plafonné.
          const added = Math.min(d.items.reduce((s, o) => s + o.row.seconds, 0), MAX_SECONDS_PER_TIME_OP * 4);
          return {
            ops: d.items,
            row: {
              user_id: userId,
              session_date: d.key,
              total_seconds: Math.min((existing.get(d.key) ?? 0) + added, MAX_SECONDS_PER_DAY),
              last_heartbeat: nowIso,
            },
          };
        });
        await writeGroups(groups, async (rows) =>
          (await db.from('platform_time_tracking').upsert(rows, { onConflict: 'user_id,session_date' })).error);
      }
    }
  }

  // Filet : un op revendiqué mais ni appliqué ni rejeté ne doit jamais rester
  // réservé dans sync_ops (il passerait pour « déjà appliqué » au rejeu).
  {
    const settled = new Set<string>([...applied, ...rejected.map((r) => r.op_id)]);
    const orphans = freshOps.filter((o) => !settled.has(o.op_id));
    if (orphans.length > 0) await fail(orphans, 'Synchronisation différée', 'transient');
  }

  // Appareil révoqué : la file est appliquée, rien d'autre n'est servi.
  if (revoked) {
    return NextResponse.json(
      { code: 'DEVICE_REVOKED', reason: revoked.reason, error: revoked.error, applied, rejected },
      { status: 401 },
    );
  }

  // ── 3) Pull delta paginé (état serveur → app) ──
  // Heure relevée AVANT les lectures : une ligne écrite pendant le pull sera
  // relue au prochain appel plutôt que sautée.
  const serverTime = new Date().toISOString();
  const sinceFor = (table: PullTable): string | null =>
    (table in pullSince ? pullSince[table] : last_pull_at) ?? null;

  type PullSpec = { select: string; sortCol: string; tieCol: string; since: (q: unknown, s: string) => unknown };
  const gte = (col: string) => (q: unknown, s: string) => (q as { gte: (c: string, v: string) => unknown }).gte(col, s);
  const SPECS: Record<PullTable, PullSpec> = {
    course_progress: { select: 'cours_id, fiche_read, video_watched, last_seen_at', sortCol: 'last_seen_at', tieCol: 'cours_id', since: gte('last_seen_at') },
    course_notes: { select: 'cours_id, content, updated_at', sortCol: 'updated_at', tieCol: 'cours_id', since: gte('updated_at') },
    qcm_sessions: {
      select: 'id, serie_id, started_at, finished_at, score_correct, score_total',
      sortCol: 'started_at',
      tieCol: 'id',
      since: (q, s) => (q as { or: (f: string) => unknown }).or(`started_at.gte.${s},finished_at.gte.${s}`),
    },
    qcm_attempts: {
      select: 'id, session_id, question_id, selected_items, is_correct, time_spent_seconds, attempted_at, text_answer',
      sortCol: 'attempted_at',
      tieCol: 'id',
      since: gte('attempted_at'),
    },
    flashcard_reviews: { select: 'id, flashcard_id, difficulty, weight, reviewed_at', sortCol: 'reviewed_at', tieCol: 'id', since: gte('reviewed_at') },
  };

  /** Lit une table page par page (ordre stable) jusqu'au plafond par appel. */
  const pullTable = async (table: PullTable) => {
    const spec = SPECS[table];
    const since = sinceFor(table);
    const rows: Record<string, unknown>[] = [];
    let complete = true;
    for (let from = 0; ; from += PAGE_SIZE) {
      let q = db.from(table).select(spec.select).eq('user_id', userId);
      if (since) q = spec.since(q, since);
      const { data, error } = await q
        .order(spec.sortCol, { ascending: true })
        .order(spec.tieCol, { ascending: true })
        .range(from, from + PAGE_SIZE - 1);
      if (error) return { rows, complete: false, cursor: since, failed: true };
      const page = (data ?? []) as Record<string, unknown>[];
      rows.push(...page);
      if (page.length < PAGE_SIZE) break;
      if (rows.length >= PULL_MAX_ROWS_PER_TABLE) { complete = false; break; }
    }
    const last = rows.length > 0 ? (rows[rows.length - 1][spec.sortCol] as string | null) : null;
    return { rows, complete, cursor: nextPullCursor(complete, serverTime, last, since), failed: false };
  };

  const [pulled, saved] = await Promise.all([
    Promise.all(PULL_TABLES.map(async (t) => [t, await pullTable(t)] as const)),
    // Liste complète à chaque sync (petite) — permet de propager les retraits.
    (async () => {
      const out: Record<string, unknown>[] = [];
      for (let from = 0; ; from += PAGE_SIZE) {
        const { data, error } = await db
          .from('student_saved_questions')
          .select('question_id, serie_id, cours_id, created_at')
          .eq('user_id', userId)
          .order('question_id', { ascending: true })
          .range(from, from + PAGE_SIZE - 1);
        if (error) return null;
        out.push(...((data ?? []) as Record<string, unknown>[]));
        if ((data ?? []).length < PAGE_SIZE || from >= 20 * PAGE_SIZE) break;
      }
      return out;
    })(),
  ]);

  const pull: Record<string, unknown> = {};
  const pullCursors: Record<string, string | null> = {};
  let pullComplete = true;
  for (const [table, res] of pulled) {
    pull[table] = res.rows;
    pullCursors[table] = res.cursor;
    if (!res.complete) pullComplete = false;
  }
  pull.student_saved_questions = saved ?? [];
  // Une liste en erreur n'est pas « complète » : l'app ne doit pas en déduire
  // que toutes les questions ont été retirées.
  pull.saved_questions_is_full_list = saved !== null;

  const { license, accessEnd, expired } = await buildLicense(admin, userId, deviceId as string);

  return NextResponse.json({
    applied,
    rejected,
    pull,
    pull_cursors: pullCursors,
    pull_complete: pullComplete,
    license,
    server_time: serverTime,
    access: { expired, access_end: accessEnd },
  });
}
