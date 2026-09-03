'use server';
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Import d'exercices — actions serveur.
 *
 * POURQUOI LE FICHIER NE PASSE PLUS PAR UNE ACTION SERVEUR (03/09/2026)
 * --------------------------------------------------------------------
 * L'action précédente recevait le PDF dans son `FormData`. Or Vercel plafonne
 * le corps d'une requête de fonction à 4,5 Mo, AVANT d'exécuter le code : au-delà,
 * la plateforme répond 413 et l'action n'est jamais appelée (vérifié en
 * production : 6 Mo → 413, 3 Mo → traité). `bodySizeLimit: '30mb'` dans
 * `next.config.ts` est un réglage Next, il ne lève pas ce plafond. La limite de
 * 25 Mo annoncée dans l'interface était donc inatteignable, et l'échec
 * remontait en promesse rejetée dans le `useTransition` du composant : l'écran
 * « Cette page n'a pas pu s'afficher » à la place d'un message d'erreur.
 *
 * Le navigateur téléverse maintenant DIRECTEMENT dans Supabase Storage, via une
 * URL signée délivrée ici. Seuls des identifiants circulent ensuite par le
 * réseau, et l'analyse (longue) vit dans une route dédiée qui porte son propre
 * `maxDuration` : cf. `src/app/api/admin/import-exercices/analyse/route.ts`.
 */

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAudit } from '@/lib/audit/log';
import { estimateExerciseImportCents, EXERCISE_IMPORT_MAX_FILE_BYTES } from '@/lib/ai/exercise-import';

const Offers = z.enum(['decouverte', 'essentiel', 'intensif', 'approfondi']);
const FileMeta = z.object({
  name: z.string().trim().min(1).max(255),
  size: z.number().int().positive().max(EXERCISE_IMPORT_MAX_FILE_BYTES),
});
const Input = z.object({
  voie: z.enum(['interne', 'externe']),
  collegeId: z.string().min(1),
  coursId: z.string().uuid(),
  offers: z.array(Offers).min(1),
  format: z.enum(['pdf', 'docx', 'txt']),
  sourceMode: z.enum(['combined', 'paired']),
  title: z.string().trim().min(3).max(180),
  subject: FileMeta,
  answer: FileMeta.nullable().optional(),
});

export type PrepareResult =
  | {
      ok: true;
      id: string;
      /** Cible de téléversement direct, une par document. */
      uploads: Array<{ role: 'subject' | 'answer'; path: string; token: string }>;
    }
  | { ok: false; error: string };

type ActionResult = { ok: true; id: string } | { ok: false; error: string };

export async function estimateExerciseImportAction(input: { files: Array<{ size: number }> }) {
  await requireAdmin();
  if (!Array.isArray(input.files) || input.files.length < 1) return { ok: false as const, error: 'Ajoutez au moins un document.' };
  return { ok: true as const, cents: estimateExerciseImportCents(input.files) };
}

/**
 * Crée le brouillon d'import et renvoie une URL signée par document.
 *
 * La ligne est écrite AVANT le téléversement (statut `draft`) : un import
 * abandonné en cours de téléversement reste visible et annulable, plutôt que de
 * laisser des fichiers orphelins dans le bucket.
 */
export async function prepareExerciseImportAction(raw: unknown): Promise<PrepareResult> {
  const { profile } = await requireAdmin();
  const parsed = Input.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const tropGros = issue?.code === 'too_big' && String(issue.path.join('.')).endsWith('size');
    return { ok: false, error: tropGros ? 'Un document dépasse la taille maximale de 25 Mo.' : (issue?.message ?? 'Paramètres invalides.') };
  }
  const input = parsed.data;
  const answer = input.sourceMode === 'paired' ? (input.answer ?? null) : null;
  if (input.sourceMode === 'paired' && !answer) return { ok: false, error: 'Le document sujet et son corrigé sont requis.' };

  const admin = createAdminClient();
  const a = admin as unknown as { from: (table: string) => any; storage: typeof admin.storage };
  const { data: course } = await a.from('cours').select('id, titre, matiere_id').eq('id', input.coursId).maybeSingle();
  if (!course || course.matiere_id !== input.collegeId) return { ok: false, error: 'L’item sélectionné ne correspond pas au collège.' };

  const id = crypto.randomUUID();
  const pathFor = (name: string, role: string) => `${profile.id}/${id}/${role}-${name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const subjectPath = pathFor(input.subject.name, 'source');
  const answerPath = answer ? pathFor(answer.name, 'corrige') : null;

  const cents = estimateExerciseImportCents([input.subject, ...(answer ? [answer] : [])]);
  const { error: insertErr } = await a.from('exercise_imports').insert({
    id, created_by: profile.id, cours_id: input.coursId, college_id: input.collegeId, voie: input.voie,
    format: input.format, source_mode: input.sourceMode, allowed_offers: input.offers, title: input.title,
    status: 'draft', sujet_path: subjectPath, corrige_path: answerPath, estimated_price_cents: cents,
  });
  if (insertErr) return { ok: false, error: insertErr.message };

  const uploads: Array<{ role: 'subject' | 'answer'; path: string; token: string }> = [];
  for (const [role, path] of [['subject', subjectPath], ['answer', answerPath]] as const) {
    if (!path) continue;
    const { data, error } = await a.storage.from('exercise-imports').createSignedUploadUrl(path);
    if (error || !data?.token) {
      await a.from('exercise_imports').delete().eq('id', id);
      return { ok: false, error: error?.message ?? 'Impossible de préparer le téléversement.' };
    }
    uploads.push({ role, path, token: data.token });
  }

  revalidatePath('/admin/import-exercices');
  return { ok: true, id, uploads };
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
