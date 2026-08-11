'use server';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAudit } from '@/lib/audit/log';
import {
  estimateExerciseImportCents, extractExerciseImport, EXERCISE_IMPORT_MAX_FILE_BYTES,
  type ImportFormat, type ImportMode, type ImportVoie,
} from '@/lib/ai/exercise-import';

const Offers = z.enum(['decouverte', 'essentiel', 'intensif', 'approfondi']);
const Input = z.object({
  voie: z.enum(['interne', 'externe']),
  collegeId: z.string().min(1),
  coursId: z.string().uuid(),
  offers: z.array(Offers).min(1),
  format: z.enum(['pdf', 'docx', 'txt']),
  sourceMode: z.enum(['combined', 'paired']),
  title: z.string().trim().min(3).max(180),
});

type ActionResult = { ok: true; id: string } | { ok: false; error: string };

function extMime(format: ImportFormat) {
  return format === 'pdf' ? 'application/pdf' : format === 'docx'
    ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'text/plain';
}

function getFile(data: FormData, name: string): File | null {
  const v = data.get(name);
  return v instanceof File && v.size > 0 ? v : null;
}

export async function estimateExerciseImportAction(input: { files: Array<{ size: number }> }) {
  await requireAdmin();
  if (!Array.isArray(input.files) || input.files.length < 1) return { ok: false as const, error: 'Ajoutez au moins un document.' };
  return { ok: true as const, cents: estimateExerciseImportCents(input.files) };
}

export async function createExerciseImportAction(formData: FormData): Promise<ActionResult> {
  const { profile } = await requireAdmin();
  const parsed = Input.safeParse({
    voie: formData.get('voie'), collegeId: formData.get('collegeId'), coursId: formData.get('coursId'),
    offers: String(formData.get('offers') ?? '').split(',').filter(Boolean), format: formData.get('format'),
    sourceMode: formData.get('sourceMode'), title: formData.get('title'),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Paramètres invalides.' };
  const input = parsed.data;
  const subject = getFile(formData, 'subject');
  const answer = getFile(formData, 'answer');
  if (!subject || (input.sourceMode === 'paired' && !answer)) return { ok: false, error: 'Le document sujet et, si nécessaire, le corrigé sont requis.' };
  if ([subject, answer].filter(Boolean).some((f) => f!.size > EXERCISE_IMPORT_MAX_FILE_BYTES)) return { ok: false, error: 'Un document dépasse la taille maximale de 25 Mo.' };

  const expectedMime = extMime(input.format);
  if ([subject, answer].filter(Boolean).some((f) => f!.type && f!.type !== expectedMime)) return { ok: false, error: `Le format sélectionné est ${input.format.toUpperCase()}; choisissez des fichiers correspondants.` };

  const admin = createAdminClient();
  const a = admin as unknown as { from: (table: string) => any; storage: typeof admin.storage; rpc: (name: string, args: unknown) => any };
  const { data: course } = await a.from('cours').select('id, titre, matiere_id').eq('id', input.coursId).maybeSingle();
  if (!course || course.matiere_id !== input.collegeId) return { ok: false, error: 'L’item sélectionné ne correspond pas au collège.' };

  const id = crypto.randomUUID();
  const pathFor = (file: File, role: string) => `${profile.id}/${id}/${role}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const subjectPath = pathFor(subject, 'source');
  const answerPath = answer ? pathFor(answer, 'corrige') : null;
  const files = [subject, ...(answer ? [answer] : [])];
  const { error: srcErr } = await a.storage.from('exercise-imports').upload(subjectPath, subject, { contentType: subject.type || expectedMime, upsert: false });
  if (srcErr) return { ok: false, error: srcErr.message };
  if (answer && answerPath) {
    const { error } = await a.storage.from('exercise-imports').upload(answerPath, answer, { contentType: answer.type || expectedMime, upsert: false });
    if (error) { await a.storage.from('exercise-imports').remove([subjectPath]); return { ok: false, error: error.message }; }
  }
  const cents = estimateExerciseImportCents(files);
  const { error: insertErr } = await a.from('exercise_imports').insert({
    id, created_by: profile.id, cours_id: input.coursId, college_id: input.collegeId, voie: input.voie,
    format: input.format, source_mode: input.sourceMode, allowed_offers: input.offers, title: input.title,
    status: 'processing', sujet_path: subjectPath, corrige_path: answerPath, estimated_price_cents: cents,
  });
  if (insertErr) return { ok: false, error: insertErr.message };

  try {
    const result = await extractExerciseImport({
      voie: input.voie as ImportVoie, mode: input.sourceMode as ImportMode,
      files: await Promise.all([
        toInputFile(subject, input.format, input.sourceMode === 'combined' ? 'combined' : 'subject'),
        ...(answer ? [toInputFile(answer, input.format, 'answer')] : []),
      ]),
    });
    if (result.questions.length === 0) throw new Error('Aucun exercice exploitable n’a été trouvé.');
    const { error } = await a.from('exercise_imports').update({
      status: 'ready', result, warnings: result.warnings, model: 'gpt-5.6-terra', billed_price_cents: cents, processed_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }).eq('id', id);
    if (error) throw new Error(error.message);
    await logAudit({ actor: profile, action: 'create', entity: 'exercise_import', entityId: id, coursId: input.coursId, coursTitre: course.titre, description: `Import d’exercices analysé : ${result.questions.length} exercice(s)` });
    revalidatePath('/admin/import-exercices'); revalidatePath('/admin/facturation');
    return { ok: true, id };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Échec de l’analyse IA.';
    await a.from('exercise_imports').update({ status: 'failed', error_message: message, updated_at: new Date().toISOString() }).eq('id', id);
    return { ok: false, error: message };
  }
}

async function toInputFile(file: File, format: ImportFormat, role: 'combined' | 'subject' | 'answer') {
  return { filename: file.name, mime: file.type || extMime(format), bytes: new Uint8Array(await file.arrayBuffer()), role };
}

export async function publishExerciseImportAction(id: string): Promise<ActionResult & { serieId?: string }> {
  const { profile } = await requireAdmin();
  if (!z.string().uuid().safeParse(id).success) return { ok: false, error: 'Import invalide.' };
  const admin = createAdminClient();
  const a = admin as unknown as { rpc: (name: string, args: unknown) => any; from: (table: string) => any };
  const { data, error } = await a.rpc('publish_exercise_import', { p_import_id: id });
  if (error || !data) return { ok: false, error: error?.message ?? 'Publication impossible.' };
  await logAudit({ actor: profile, action: 'create', entity: 'qcm_series', entityId: data as string, description: `Publication de l’import d’exercices ${id.slice(0, 8)}` });
  revalidatePath('/admin/import-exercices'); revalidatePath('/admin/facturation');
  return { ok: true, id, serieId: data as string };
}

export async function cancelExerciseImportAction(id: string): Promise<ActionResult> {
  const { profile } = await requireAdmin();
  const admin = createAdminClient();
  const a = admin as unknown as { from: (table: string) => any };
  const { data: row } = await a.from('exercise_imports').select('status').eq('id', id).maybeSingle();
  if (!row || row.status === 'published') return { ok: false, error: 'Cet import ne peut pas être annulé.' };
  const { error } = await a.from('exercise_imports').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  await logAudit({ actor: profile, action: 'update', entity: 'exercise_import', entityId: id, description: 'Import d’exercices annulé' });
  revalidatePath('/admin/import-exercices');
  return { ok: true, id };
}
