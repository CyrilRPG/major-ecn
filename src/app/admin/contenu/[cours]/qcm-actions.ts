'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { assertCanWrite, requireContentEditor } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAudit } from '@/lib/audit/log';

/* ============================================================
   Création / édition / suppression manuelles de QCM
   ============================================================ */

const ItemSchema = z.object({
  lettre: z.enum(['A', 'B', 'C', 'D', 'E']),
  enonce: z.string().min(1, 'Énoncé requis'),
  is_correct: z.boolean(),
  justification: z.string().optional().default(''),
  images: z.array(z.string().url().or(z.string().startsWith('/'))).optional().default([]),
});

const QuestionSchema = z.object({
  enonce: z.string().min(3, 'Énoncé requis (3+ caractères)'),
  correction_generale: z.string().optional().nullable(),
  images: z.array(z.string()).optional().default([]),
  items: z.array(ItemSchema).min(2, 'Au moins 2 items').max(5, 'Maximum 5 items'),
});

export type QcmQuestionInput = z.infer<typeof QuestionSchema>;

async function loadCoursCtx(coursId: string) {
  const admin = createAdminClient();
  const { data: c } = await admin
    .from('cours')
    .select('id, titre, matieres(nom)')
    .eq('id', coursId)
    .maybeSingle();
  return c as { id: string; titre: string; matieres?: { nom?: string } | null } | null;
}

/* ───── Séries QCM ───── */

export async function createQcmSerieAction(input: {
  coursId: string;
  label: string;
  kind: 'qcm' | 'dp';
  vignette?: string;
}): Promise<{ ok: true; id: string } | { error: string }> {
  const { profile, scope } = await requireContentEditor();
  try { assertCanWrite(scope, 'qcm'); } catch (e) { return { error: (e as Error).message }; }
  if (!input.label.trim()) return { error: 'Intitulé requis.' };

  const admin = createAdminClient();
  const { data: last } = await admin
    .from('qcm_series')
    .select('order_index')
    .eq('cours_id', input.coursId)
    .eq('type', 'qcm')
    .order('order_index', { ascending: false })
    .limit(1);
  const nextIdx = (last?.[0]?.order_index ?? -1) + 1;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('qcm_series')
    .insert({
      cours_id: input.coursId,
      label: input.label.trim(),
      type: 'qcm',
      order_index: nextIdx,
      vignette: input.kind === 'dp' ? (input.vignette?.trim() || null) : null,
    })
    .select('id').single();
  if (error || !data) return { error: error?.message ?? 'Échec de la création.' };

  const ctx = await loadCoursCtx(input.coursId);
  await logAudit({
    actor: profile,
    action: 'create',
    entity: 'qcm_series',
    entityId: data.id,
    coursId: input.coursId,
    coursTitre: ctx?.titre ?? null,
    matiereNom: ctx?.matieres?.nom ?? null,
    description: `Création de la série « ${input.label.trim()} » (${input.kind === 'dp' ? 'DP' : 'QCM'})`,
  });

  revalidatePath(`/admin/contenu/${input.coursId}`);
  return { ok: true, id: data.id };
}

/** Mise à jour de la vignette clinique (contexte) d'un DP. */
export async function updateSerieVignetteAction(input: {
  serieId: string;
  coursId: string;
  vignette: string;
}): Promise<{ ok: true } | { error: string }> {
  const { profile, scope } = await requireContentEditor();
  try { assertCanWrite(scope, 'qcm'); } catch (e) { return { error: (e as Error).message }; }
  const admin = createAdminClient();
  const { data: serie } = await admin.from('qcm_series').select('label').eq('id', input.serieId).maybeSingle();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from('qcm_series')
    .update({ vignette: input.vignette.trim() || null })
    .eq('id', input.serieId);
  if (error) return { error: error.message };

  const ctx = await loadCoursCtx(input.coursId);
  await logAudit({
    actor: profile,
    action: 'update',
    entity: 'qcm_series',
    entityId: input.serieId,
    coursId: input.coursId,
    coursTitre: ctx?.titre ?? null,
    matiereNom: ctx?.matieres?.nom ?? null,
    description: `Modification du contexte clinique de « ${serie?.label ?? input.serieId} »`,
  });
  revalidatePath(`/admin/contenu/${input.coursId}`);
  revalidatePath(`/cours/${input.coursId}/qcm`);
  return { ok: true };
}

export async function deleteQcmSerieAction(serieId: string, coursId: string): Promise<{ ok: true } | { error: string }> {
  const { profile, scope } = await requireContentEditor();
  try { assertCanWrite(scope, 'qcm'); } catch (e) { return { error: (e as Error).message }; }
  const admin = createAdminClient();
  const { data: serie } = await admin.from('qcm_series').select('label').eq('id', serieId).maybeSingle();
  const { error } = await admin.from('qcm_series').delete().eq('id', serieId);
  if (error) return { error: error.message };

  const ctx = await loadCoursCtx(coursId);
  await logAudit({
    actor: profile,
    action: 'delete',
    entity: 'qcm_series',
    entityId: serieId,
    coursId,
    coursTitre: ctx?.titre ?? null,
    matiereNom: ctx?.matieres?.nom ?? null,
    description: `Suppression de la série « ${serie?.label ?? serieId} »`,
  });
  revalidatePath(`/admin/contenu/${coursId}`);
  return { ok: true };
}

/* ───── Questions ───── */

export async function upsertQcmQuestionAction(input: {
  questionId?: string;          // si fourni → update, sinon → insert
  serieId: string;
  coursId: string;
  question: QcmQuestionInput;
}): Promise<{ ok: true; id: string } | { error: string }> {
  const { profile, scope } = await requireContentEditor();
  try { assertCanWrite(scope, 'qcm'); } catch (e) { return { error: (e as Error).message }; }

  const parsed = QuestionSchema.safeParse(input.question);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Données invalides.' };
  const q = parsed.data;
  if (q.items.filter((i) => i.is_correct).length < 1) {
    return { error: 'Au moins un item doit être marqué comme correct.' };
  }
  // unicité des lettres
  const letters = q.items.map((i) => i.lettre);
  if (new Set(letters).size !== letters.length) {
    return { error: 'Les lettres d\'items doivent être uniques (A, B, C, D, E).' };
  }

  const admin = createAdminClient();

  let questionId = input.questionId ?? null;
  if (questionId) {
    // UPDATE question
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin as any).from('qcm_questions').update({
      enonce: q.enonce,
      correction_generale: q.correction_generale ?? null,
      images: q.images ?? [],
    }).eq('id', questionId);
    if (error) return { error: error.message };
    // purge items existants → reinsert
    await admin.from('qcm_items').delete().eq('question_id', questionId);
  } else {
    // INSERT question
    const { data: last } = await admin.from('qcm_questions')
      .select('order_index').eq('serie_id', input.serieId)
      .order('order_index', { ascending: false }).limit(1);
    const nextIdx = (last?.[0]?.order_index ?? -1) + 1;
    // Lettres dans l'ordre attendu → "ACE" si A, C, E sont corrects
    const reponse = letters.filter((l) => q.items.find((it) => it.lettre === l)?.is_correct).join('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (admin as any).from('qcm_questions').insert({
      serie_id: input.serieId,
      enonce: q.enonce,
      order_index: nextIdx,
      reponse_attendue: reponse,
      correction_generale: q.correction_generale ?? null,
      images: q.images ?? [],
    }).select('id').single();
    if (error || !data) return { error: error?.message ?? 'Échec de la création.' };
    questionId = data.id;
  }

  // Insert items
  const itemsToInsert = q.items.map((it) => ({
    question_id: questionId!,
    lettre: it.lettre,
    enonce: it.enonce,
    is_correct: it.is_correct,
    justification: it.justification ?? '',
    images: it.images ?? [],
  }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: itemsErr } = await (admin as any).from('qcm_items').insert(itemsToInsert);
  if (itemsErr) return { error: itemsErr.message };

  const ctx = await loadCoursCtx(input.coursId);
  await logAudit({
    actor: profile,
    action: input.questionId ? 'update' : 'create',
    entity: 'qcm_question',
    entityId: questionId!,
    coursId: input.coursId,
    coursTitre: ctx?.titre ?? null,
    matiereNom: ctx?.matieres?.nom ?? null,
    description: input.questionId
      ? `Modification de la question : « ${q.enonce.slice(0, 80)}${q.enonce.length > 80 ? '…' : ''} »`
      : `Création d'une question : « ${q.enonce.slice(0, 80)}${q.enonce.length > 80 ? '…' : ''} »`,
  });

  revalidatePath(`/admin/contenu/${input.coursId}`);
  revalidatePath(`/cours/${input.coursId}/qcm`);
  return { ok: true, id: questionId! };
}

export async function deleteQcmQuestionAction(questionId: string, coursId: string): Promise<{ ok: true } | { error: string }> {
  const { profile, scope } = await requireContentEditor();
  try { assertCanWrite(scope, 'qcm'); } catch (e) { return { error: (e as Error).message }; }
  const admin = createAdminClient();
  // Snapshot complet (question + items) AVANT delete → permet la restauration depuis les logs.
  const { data: snapshot } = await admin
    .from('qcm_questions')
    .select('id, serie_id, enonce, order_index, reponse_attendue, correction_generale, images, qcm_items(lettre, enonce, is_correct, justification, images)')
    .eq('id', questionId)
    .maybeSingle();
  const { error } = await admin.from('qcm_questions').delete().eq('id', questionId);
  if (error) return { error: error.message };

  const ctx = await loadCoursCtx(coursId);
  await logAudit({
    actor: profile,
    action: 'delete',
    entity: 'qcm_question',
    entityId: questionId,
    coursId,
    coursTitre: ctx?.titre ?? null,
    matiereNom: ctx?.matieres?.nom ?? null,
    description: `Suppression de la question : « ${(snapshot as { enonce?: string } | null)?.enonce?.slice(0, 80) ?? questionId}${((snapshot as { enonce?: string } | null)?.enonce?.length ?? 0) > 80 ? '…' : ''} »`,
    diff: { snapshot: snapshot as Record<string, unknown> | null },
  });
  revalidatePath(`/admin/contenu/${coursId}`);
  revalidatePath(`/cours/${coursId}/qcm`);
  return { ok: true };
}

/* ───── Flashcards ───── */

const FlashcardSchema = z.object({
  recto: z.string().min(2, 'Recto requis'),
  verso: z.string().min(2, 'Verso requis'),
});

export async function upsertFlashcardAction(input: {
  id?: string;
  coursId: string;
  recto: string;
  verso: string;
}): Promise<{ ok: true; id: string } | { error: string }> {
  const { profile, scope } = await requireContentEditor();
  try { assertCanWrite(scope, 'flashcards'); } catch (e) { return { error: (e as Error).message }; }
  const parsed = FlashcardSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Données invalides.' };

  const admin = createAdminClient();
  let id = input.id;
  if (id) {
    const { error } = await admin.from('flashcards').update({ recto: input.recto.trim(), verso: input.verso.trim() }).eq('id', id);
    if (error) return { error: error.message };
  } else {
    const { data: last } = await admin.from('flashcards')
      .select('order_index').eq('cours_id', input.coursId)
      .order('order_index', { ascending: false }).limit(1);
    const nextIdx = (last?.[0]?.order_index ?? -1) + 1;
    const { data, error } = await admin.from('flashcards').insert({
      cours_id: input.coursId,
      recto: input.recto.trim(),
      verso: input.verso.trim(),
      order_index: nextIdx,
    }).select('id').single();
    if (error || !data) return { error: error?.message ?? 'Échec de la création.' };
    id = data.id;
  }

  const ctx = await loadCoursCtx(input.coursId);
  await logAudit({
    actor: profile,
    action: input.id ? 'update' : 'create',
    entity: 'flashcard',
    entityId: id,
    coursId: input.coursId,
    coursTitre: ctx?.titre ?? null,
    matiereNom: ctx?.matieres?.nom ?? null,
    description: input.id
      ? `Modification de la flashcard : « ${input.recto.slice(0, 60)}${input.recto.length > 60 ? '…' : ''} »`
      : `Création d'une flashcard : « ${input.recto.slice(0, 60)}${input.recto.length > 60 ? '…' : ''} »`,
  });
  revalidatePath(`/admin/contenu/${input.coursId}`);
  revalidatePath(`/cours/${input.coursId}/flashcards`);
  return { ok: true, id: id! };
}

export async function deleteFlashcardAction(id: string, coursId: string): Promise<{ ok: true } | { error: string }> {
  const { profile, scope } = await requireContentEditor();
  try { assertCanWrite(scope, 'flashcards'); } catch (e) { return { error: (e as Error).message }; }
  const admin = createAdminClient();
  const { data: snapshot } = await admin.from('flashcards')
    .select('id, cours_id, recto, verso, order_index')
    .eq('id', id).maybeSingle();
  const { error } = await admin.from('flashcards').delete().eq('id', id);
  if (error) return { error: error.message };

  const ctx = await loadCoursCtx(coursId);
  await logAudit({
    actor: profile,
    action: 'delete',
    entity: 'flashcard',
    entityId: id,
    coursId,
    coursTitre: ctx?.titre ?? null,
    matiereNom: ctx?.matieres?.nom ?? null,
    description: `Suppression de la flashcard : « ${(snapshot as { recto?: string } | null)?.recto?.slice(0, 60) ?? id}${((snapshot as { recto?: string } | null)?.recto?.length ?? 0) > 60 ? '…' : ''} »`,
    diff: { snapshot: snapshot as Record<string, unknown> | null },
  });
  revalidatePath(`/admin/contenu/${coursId}`);
  revalidatePath(`/cours/${coursId}/flashcards`);
  return { ok: true };
}

/* ────────── Restauration depuis les logs (admin uniquement) ────────── */

export async function restoreFromLogAction(logId: string): Promise<{ ok: true; entity: string } | { error: string }> {
  const { profile } = await requireContentEditor();
  if (profile.role !== 'admin') return { error: 'Seuls les administrateurs peuvent restaurer.' };
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: log } = await (admin as any)
    .from('admin_audit_logs')
    .select('id, action, entity_type, entity_id, cours_id, diff')
    .eq('id', logId)
    .maybeSingle();
  if (!log) return { error: 'Log introuvable.' };
  if (log.action !== 'delete') return { error: 'Cette action n\'est pas une suppression — rien à restaurer.' };
  const snap = (log.diff as { snapshot?: Record<string, unknown> } | null)?.snapshot;
  if (!snap) return { error: 'Aucun instantané disponible (suppression antérieure à la fonctionnalité).' };

  try {
    if (log.entity_type === 'flashcard') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (admin as any).from('flashcards').insert({
        id: snap.id, cours_id: snap.cours_id, recto: snap.recto, verso: snap.verso,
        order_index: snap.order_index,
      });
      if (error) return { error: error.message };
    } else if (log.entity_type === 'qcm_question') {
      const items = (snap.qcm_items as Array<Record<string, unknown>>) ?? [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: qErr } = await (admin as any).from('qcm_questions').insert({
        id: snap.id, serie_id: snap.serie_id, enonce: snap.enonce, order_index: snap.order_index,
        reponse_attendue: snap.reponse_attendue, correction_generale: snap.correction_generale,
        images: snap.images ?? [],
      });
      if (qErr) return { error: qErr.message };
      if (items.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: iErr } = await (admin as any).from('qcm_items').insert(
          items.map((it) => ({
            question_id: snap.id,
            lettre: it.lettre, enonce: it.enonce, is_correct: it.is_correct,
            justification: it.justification ?? '', images: it.images ?? [],
          })),
        );
        if (iErr) return { error: iErr.message };
      }
    } else if (log.entity_type === 'qcm_series') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (admin as any).from('qcm_series').insert(snap);
      if (error) return { error: error.message };
    } else {
      return { error: `Restauration non supportée pour le type « ${log.entity_type} ».` };
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Échec de la restauration.' };
  }

  await logAudit({
    actor: profile,
    action: 'create',
    entity: (log.entity_type as 'flashcard' | 'qcm_question' | 'qcm_series'),
    entityId: (snap.id as string | undefined) ?? null,
    coursId: (log.cours_id as string | null) ?? null,
    description: `Restauration depuis le journal (log #${logId.slice(0, 8)})`,
  });
  if (log.cours_id) {
    revalidatePath(`/admin/contenu/${log.cours_id}`);
    revalidatePath(`/cours/${log.cours_id}/qcm`);
    revalidatePath(`/cours/${log.cours_id}/flashcards`);
  }
  return { ok: true, entity: log.entity_type };
}

/* ───── Image upload helper ───── */

export async function uploadQcmImageAction(formData: FormData): Promise<{ ok: true; url: string } | { error: string }> {
  const { scope } = await requireContentEditor();
  try { assertCanWrite(scope, 'qcm'); } catch (e) { return { error: (e as Error).message }; }
  const file = formData.get('file');
  if (!(file instanceof File)) return { error: 'Fichier manquant.' };
  if (file.size > 5 * 1024 * 1024) return { error: 'Image trop volumineuse (max 5 Mo).' };
  if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type)) {
    return { error: 'Format non supporté (PNG, JPEG, WEBP, GIF uniquement).' };
  }
  const admin = createAdminClient();
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await admin.storage.from('qcm-images').upload(path, file, {
    contentType: file.type,
    cacheControl: '3600',
    upsert: false,
  });
  if (error) return { error: error.message };
  const { data: pub } = admin.storage.from('qcm-images').getPublicUrl(path);
  return { ok: true, url: pub.publicUrl };
}
