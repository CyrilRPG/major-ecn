'use server';

/**
 * Entraînements d'élèves — actions de l'équipe pédagogique.
 *
 * « Ajouter à la base commune » copie l'exercice de l'élève dans les tables
 * publiques de l'item : `flashcards` pour une flashcard ; pour un QCM, une
 * série « Entraînement · Propositions d'élèves » (créée au premier besoin)
 * reçoit la question et ses propositions. La ligne d'origine passe en
 * `published` et garde l'identifiant de la copie.
 *
 * Même garde que toutes les actions de contenu : `requireContentEditor` →
 * droit d'écriture sur le TYPE (`assertCanWrite`) → item dans le périmètre
 * du professeur (`checkCoursScope`). Les écritures passent par le client
 * service-role, la RLS ne protège donc pas ; ces contrôles sont la seule
 * barrière (cf. require-role.ts).
 */
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { assertCanWrite, checkCoursScope, requireContentEditor } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAudit } from '@/lib/audit/log';
import { sanitizeFlashcardHtml } from '@/lib/flashcards/rich-text';
import {
  lireExercice, lettresJustes, estTableAbsente, MESSAGE_TABLE_ABSENTE, SERIE_PROPOSITIONS_ELEVES,
  type StudentExercise,
} from '@/lib/student-exercises/regles';

export type ActionStaff = { ok: true } | { ok: false; error: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = { from: (table: string) => any };

const Id = z.string().uuid();

async function chargerExercice(db: Db, id: string): Promise<{ exercice: StudentExercise; cours: { id: string; titre: string; matiere_id: string; matieres?: { nom?: string } | null } } | { error: string }> {
  const { data, error } = await db.from('student_exercises')
    .select('*, cours:cours_id(id, titre, matiere_id, matieres(nom))')
    .eq('id', id).maybeSingle();
  if (error) return { error: estTableAbsente(error) ? MESSAGE_TABLE_ABSENTE : error.message };
  if (!data) return { error: 'Exercice introuvable.' };
  const { cours, ...reste } = data as Record<string, unknown> & { cours: { id: string; titre: string; matiere_id: string; matieres?: { nom?: string } | null } | null };
  if (!cours) return { error: 'Item introuvable.' };
  return { exercice: lireExercice(reste), cours };
}

function revalider(coursId: string) {
  revalidatePath('/admin/entrainements-eleves');
  revalidatePath(`/admin/contenu/${coursId}`);
  revalidatePath(`/cours/${coursId}/flashcards`);
  revalidatePath(`/cours/${coursId}/qcm`);
  revalidatePath('/mes-entrainements');
}

/** Verse l'exercice de l'élève dans la base commune de l'item. Idempotent. */
export async function publierExerciceEleveAction(idBrut: string): Promise<ActionStaff> {
  const id = Id.safeParse(idBrut);
  if (!id.success) return { ok: false, error: 'Exercice invalide.' };
  const { profile, scope } = await requireContentEditor();
  const admin = createAdminClient();
  const db = admin as unknown as Db;

  const charge = await chargerExercice(db, id.data);
  if ('error' in charge) return { ok: false, error: charge.error };
  const { exercice, cours } = charge;
  if (exercice.status === 'published') return { ok: true };

  try { assertCanWrite(scope, exercice.kind === 'flashcard' ? 'flashcards' : 'qcm'); } catch (e) { return { ok: false, error: (e as Error).message }; }
  const refus = await checkCoursScope(scope, cours.id);
  if (refus) return { ok: false, error: refus };

  let publie: { flashcardId?: string; questionId?: string; description: string; entity: 'flashcard' | 'qcm_question'; entityId: string };

  if (exercice.kind === 'flashcard') {
    const { data: dernier } = await db.from('flashcards').select('order_index').eq('cours_id', cours.id).order('order_index', { ascending: false }).limit(1).maybeSingle();
    const { data: fc, error } = await db.from('flashcards').insert({
      cours_id: cours.id,
      recto: sanitizeFlashcardHtml(exercice.recto ?? ''),
      verso: sanitizeFlashcardHtml(exercice.verso ?? ''),
      order_index: ((dernier as { order_index?: number } | null)?.order_index ?? -1) + 1,
    }).select('id').single();
    if (error) return { ok: false, error: error.message };
    publie = { flashcardId: fc.id, description: 'Flashcard proposée par un élève versée dans la base commune', entity: 'flashcard', entityId: fc.id };
  } else {
    // Série d'accueil : une par item, créée au premier besoin.
    const { data: existante } = await db.from('qcm_series').select('id').eq('cours_id', cours.id).eq('label', SERIE_PROPOSITIONS_ELEVES).maybeSingle();
    let serieId: string | null = (existante as { id: string } | null)?.id ?? null;
    if (!serieId) {
      const { data: derniereSerie } = await db.from('qcm_series').select('order_index').eq('cours_id', cours.id).order('order_index', { ascending: false }).limit(1).maybeSingle();
      const { data: serie, error: serieErr } = await db.from('qcm_series').insert({
        cours_id: cours.id, type: 'qcm', label: SERIE_PROPOSITIONS_ELEVES,
        order_index: ((derniereSerie as { order_index?: number } | null)?.order_index ?? -1) + 1,
      }).select('id').single();
      if (serieErr) return { ok: false, error: serieErr.message };
      serieId = serie.id;
    }
    const { data: derniereQ } = await db.from('qcm_questions').select('order_index').eq('serie_id', serieId).order('order_index', { ascending: false }).limit(1).maybeSingle();
    const { data: question, error: qErr } = await db.from('qcm_questions').insert({
      serie_id: serieId, format: 'qcm',
      enonce: sanitizeFlashcardHtml(exercice.enonce ?? ''),
      order_index: ((derniereQ as { order_index?: number } | null)?.order_index ?? -1) + 1,
      reponse_attendue: lettresJustes(exercice.items),
      correction_generale: exercice.correction_generale ? sanitizeFlashcardHtml(exercice.correction_generale) : null,
      images: [],
    }).select('id').single();
    if (qErr) return { ok: false, error: qErr.message };
    const { error: itemsErr } = await db.from('qcm_items').insert(exercice.items.map((it) => ({
      question_id: question.id, lettre: it.lettre,
      enonce: sanitizeFlashcardHtml(it.enonce), is_correct: it.is_correct,
      justification: it.justification ? sanitizeFlashcardHtml(it.justification) : '', images: [],
    })));
    if (itemsErr) {
      await db.from('qcm_questions').delete().eq('id', question.id);
      return { ok: false, error: itemsErr.message };
    }
    publie = { questionId: question.id, description: 'QCM proposé par un élève versé dans la base commune', entity: 'qcm_question', entityId: question.id };
  }

  const { error: majErr } = await db.from('student_exercises').update({
    status: 'published', reviewed_by: profile.id, reviewed_at: new Date().toISOString(), review_note: null,
    published_flashcard_id: publie.flashcardId ?? null, published_question_id: publie.questionId ?? null,
  }).eq('id', exercice.id);
  if (majErr) return { ok: false, error: majErr.message };

  await logAudit({
    actor: profile, action: 'create', entity: publie.entity, entityId: publie.entityId,
    coursId: cours.id, coursTitre: cours.titre, matiereNom: cours.matieres?.nom ?? null,
    description: publie.description, diff: { student_exercise_id: exercice.id },
  });
  revalider(cours.id);
  return { ok: true };
}

/** Écarte une proposition (elle reste dans l'espace de l'élève, avec la note). */
export async function refuserExerciceEleveAction(input: { id: string; note?: string }): Promise<ActionStaff> {
  const parsed = z.object({ id: Id, note: z.string().trim().max(1000).optional() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Saisie invalide.' };
  const { profile, scope } = await requireContentEditor();
  const db = createAdminClient() as unknown as Db;
  const charge = await chargerExercice(db, parsed.data.id);
  if ('error' in charge) return { ok: false, error: charge.error };
  if (charge.exercice.status === 'published') return { ok: false, error: 'Cet exercice est déjà dans la base commune : retirez-le depuis « Contenu » si nécessaire.' };
  const refus = await checkCoursScope(scope, charge.cours.id);
  if (refus) return { ok: false, error: refus };
  const { error } = await db.from('student_exercises').update({
    status: 'rejected', reviewed_by: profile.id, reviewed_at: new Date().toISOString(), review_note: parsed.data.note || null,
  }).eq('id', parsed.data.id);
  if (error) return { ok: false, error: error.message };
  revalider(charge.cours.id);
  return { ok: true };
}

/** Remet une proposition écartée dans la file « à examiner ». */
export async function reouvrirExerciceEleveAction(idBrut: string): Promise<ActionStaff> {
  const id = Id.safeParse(idBrut);
  if (!id.success) return { ok: false, error: 'Exercice invalide.' };
  const { scope } = await requireContentEditor();
  const db = createAdminClient() as unknown as Db;
  const charge = await chargerExercice(db, id.data);
  if ('error' in charge) return { ok: false, error: charge.error };
  if (charge.exercice.status !== 'rejected') return { ok: true };
  const refus = await checkCoursScope(scope, charge.cours.id);
  if (refus) return { ok: false, error: refus };
  const { error } = await db.from('student_exercises').update({ status: 'private', reviewed_by: null, reviewed_at: null, review_note: null }).eq('id', id.data);
  if (error) return { ok: false, error: error.message };
  revalider(charge.cours.id);
  return { ok: true };
}
