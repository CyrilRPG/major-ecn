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
import {
  acquitterAlerte, appliquerPatchQuestion, estResultatFinal, recalculerFiabilite,
  type AlerteImport, type Fiabilite, type PatchQuestion, type QuestionFinale, type ResultatFinal,
} from '@/lib/ai/exercise-import-pipeline';

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

/**
 * Publication d'un import validé.
 *
 * `publish_exercise_import` est ATOMIQUE et IDEMPOTENTE : un import déjà publié
 * renvoie simplement sa série existante. Cliquer deux fois ne crée donc jamais
 * de doublon — ce qui compte, parce que la réponse de cette action peut se
 * perdre alors que l'écriture, elle, a été validée en base (constaté le
 * 08/09/2026 sur un import de 358 questions : série créée, mais
 * « An unexpected response was received from the server » à l'écran).
 *
 * Deux précautions contre ce scénario :
 *  - AUCUN `revalidatePath` sur `/admin/import-exercices`. La page est
 *    `force-dynamic` : il n'y a pas de cache à invalider, mais Next renvoie
 *    alors l'arbre RSC complet de la page DANS la réponse de l'action — la
 *    liste des 30 derniers imports, `result` compris (plus de 400 ko de JSON
 *    pour un seul import), en plus des 1 300 cours du sélecteur. Le composant
 *    appelle `router.refresh()` de son côté, ce qui rafraîchit la liste par une
 *    requête séparée, sans alourdir la réponse de la publication.
 *  - le corps est enveloppé : une exception (réseau, jeton, quota) redescend en
 *    message affichable au lieu d'une 500 que le client ne sait pas lire.
 */
export async function publishExerciseImportAction(id: string): Promise<ActionResult & { serieId?: string }> {
  const { profile } = await requireAdmin();
  if (!z.string().uuid().safeParse(id).success) return { ok: false, error: 'Import invalide.' };
  try {
    const admin = createAdminClient();
    const a = admin as unknown as { rpc: (name: string, args: unknown) => any; from: (table: string) => any };

    // GARDE (10/09/2026) : tant qu'il reste une alerte BLOQUANTE non traitée
    // (question ni corrigée-et-vérifiée, ni écartée ; alerte globale non
    // acquittée), la publication est refusée et l'import reste « à valider ».
    // Le verdict est recalculé ici, jamais lu tel quel : l'écran peut être
    // en retard sur la base.
    const { data: row } = await a.from('exercise_imports').select('status, result').eq('id', id).maybeSingle();
    if (!row) return { ok: false, error: 'Import introuvable.' };
    if (row.status === 'ready' && estResultatFinal(row.result)) {
      const fiabilite = recalculerFiabilite(row.result as ResultatFinal);
      if (fiabilite.verdict === 'rouge') {
        return { ok: false, error: `Publication refusée : ${fiabilite.alertesBloquantes} alerte(s) bloquante(s) restent à traiter (corrigez ou cochez « Vérifiée » sur chaque question concernée, ou écartez-la).` };
      }
      if (!row.result.questions?.length) return { ok: false, error: 'Publication refusée : aucune question à publier (toutes ont été écartées).' };
    }

    const { data, error } = await a.rpc('publish_exercise_import', { p_import_id: id });
    if (error || !data) return { ok: false, error: error?.message ?? 'Publication impossible.' };
    await logAudit({ actor: profile, action: 'create', entity: 'qcm_series', entityId: data as string, description: `Publication de l’import d’exercices ${id.slice(0, 8)}` });
    revalidatePath('/admin/facturation');
    return { ok: true, id, serieId: data as string };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Publication impossible.' };
  }
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

/* ─────────── Relecture : modifications de l'administrateur (10/09/2026) ─────────── */

const PatchItem = z.object({
  lettre: z.string().min(1).max(3),
  enonce: z.string().max(4000).optional(),
  is_correct: z.boolean().optional(),
  justification: z.string().max(8000).optional(),
});
const Patch = z.object({
  enonce: z.string().max(20000).optional(),
  items: z.array(PatchItem).max(11).optional(),
  reponse_attendue: z.string().max(4000).optional(),
  correction_generale: z.string().max(20000).optional(),
  images: z.array(z.string().url().max(600)).max(20).optional(),
  validee_par_admin: z.boolean().optional(),
  supprimee: z.boolean().optional(),
});

export type PatchResult =
  | { ok: true; question: QuestionFinale | null; fiabilite: Fiabilite; modifications: string[]; warnings: string[] }
  | { ok: false; error: string };

/** Lit un import « à valider » avec son résultat final, ou explique pourquoi il n'est pas modifiable. */
async function lireImportModifiable(id: string): Promise<{ ok: true; a: { from: (table: string) => any }; result: ResultatFinal } | { ok: false; error: string }> {
  if (!z.string().uuid().safeParse(id).success) return { ok: false, error: 'Import invalide.' };
  const admin = createAdminClient();
  const a = admin as unknown as { from: (table: string) => any };
  const { data: row, error } = await a.from('exercise_imports').select('status, result').eq('id', id).maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!row) return { ok: false, error: 'Import introuvable.' };
  if (row.status !== 'ready') return { ok: false, error: 'Seul un import « à valider » peut être modifié.' };
  if (!estResultatFinal(row.result) || !row.result.fiabilite) return { ok: false, error: 'Cet import a été analysé avant la mise en place du rapport de fiabilité : relancez son analyse pour le modifier.' };
  return { ok: true, a, result: row.result as ResultatFinal };
}

/**
 * Modifie une question d'un import à valider : énoncé, propositions (texte,
 * vrai/faux, justification), réponse attendue, corrigé général, images
 * (retrait ou ajout d'une URL déjà connue de l'import), case « Vérifiée »,
 * ou l'écarte (`supprimee: true`, restaurable). Les champs sont bornés ici,
 * appliqués par `appliquerPatchQuestion` (pur, testé), journalisés dans
 * `warnings`, et la fiabilité est recalculée : c'est elle qui débloque la
 * publication.
 */
export async function updateImportQuestionAction(importId: string, clientId: string, rawPatch: unknown): Promise<PatchResult> {
  const { profile } = await requireAdmin();
  const parsed = Patch.safeParse(rawPatch);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Modification invalide.' };
  if (typeof clientId !== 'string' || !clientId.trim()) return { ok: false, error: 'Question invalide.' };
  try {
    const lu = await lireImportModifiable(importId);
    if (!lu.ok) return lu;
    const { question, modifications } = appliquerPatchQuestion(lu.result, clientId, parsed.data as PatchQuestion);
    if (!question) return { ok: false, error: 'Question introuvable dans cet import.' };
    if (modifications.length) {
      const { error } = await lu.a.from('exercise_imports').update({ result: lu.result, warnings: lu.result.warnings, updated_at: new Date().toISOString() }).eq('id', importId);
      if (error) return { ok: false, error: error.message };
      await logAudit({ actor: profile, action: 'update', entity: 'exercise_import', entityId: importId, description: `Import d’exercices : question ${question.numero_document ?? question.numero_source ?? clientId.slice(0, 8)} — ${modifications.join(', ')}` });
    }
    return { ok: true, question, fiabilite: lu.result.fiabilite, modifications, warnings: lu.result.warnings };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Modification impossible.' };
  }
}

/** Acquitte (ou rouvre) une alerte GLOBALE (sans question : pages non importées, images non extraites…). */
export async function acknowledgeImportAlerteAction(importId: string, index: number, traitee: boolean): Promise<{ ok: true; alerte: AlerteImport; fiabilite: Fiabilite; warnings: string[] } | { ok: false; error: string }> {
  const { profile } = await requireAdmin();
  if (!Number.isInteger(index) || index < 0) return { ok: false, error: 'Alerte invalide.' };
  try {
    const lu = await lireImportModifiable(importId);
    if (!lu.ok) return lu;
    const alerte = acquitterAlerte(lu.result, index, !!traitee);
    if (!alerte) return { ok: false, error: 'Alerte introuvable.' };
    const { error } = await lu.a.from('exercise_imports').update({ result: lu.result, warnings: lu.result.warnings, updated_at: new Date().toISOString() }).eq('id', importId);
    if (error) return { ok: false, error: error.message };
    await logAudit({ actor: profile, action: 'update', entity: 'exercise_import', entityId: importId, description: `Import d’exercices : alerte ${traitee ? 'acquittée' : 'rouverte'} — ${alerte.message.slice(0, 100)}` });
    return { ok: true, alerte, fiabilite: lu.result.fiabilite, warnings: lu.result.warnings };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Modification impossible.' };
  }
}

/**
 * URL signée de LECTURE (1 h) du document source, pour afficher la page d'une
 * question dans l'écran de relecture. Le bucket `exercise-imports` est privé.
 */
export async function getExerciseImportSourceUrlAction(importId: string, role: 'sujet' | 'corrige' = 'sujet'): Promise<{ ok: true; url: string; format: string } | { ok: false; error: string }> {
  await requireAdmin();
  if (!z.string().uuid().safeParse(importId).success) return { ok: false, error: 'Import invalide.' };
  try {
    const admin = createAdminClient();
    const a = admin as unknown as { from: (table: string) => any; storage: typeof admin.storage };
    const { data: row } = await a.from('exercise_imports').select('sujet_path, corrige_path, format').eq('id', importId).maybeSingle();
    if (!row) return { ok: false, error: 'Import introuvable.' };
    const path = role === 'corrige' ? row.corrige_path : row.sujet_path;
    if (!path) return { ok: false, error: 'Ce document n’existe pas pour cet import.' };
    const { data, error } = await a.storage.from('exercise-imports').createSignedUrl(path, 3600);
    if (error || !data?.signedUrl) return { ok: false, error: error?.message ?? 'Le document source n’est plus disponible dans le stockage.' };
    return { ok: true, url: data.signedUrl, format: row.format };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Document indisponible.' };
  }
}
