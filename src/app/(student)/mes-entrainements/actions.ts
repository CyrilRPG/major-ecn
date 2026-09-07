'use server';

/**
 * Entraînements d'élèves — actions de l'élève (créer, modifier, supprimer ses
 * propres flashcards et QCM).
 *
 * Les écritures passent par le client RLS de l'utilisateur : la policy
 * `student_exercises_owner` garantit qu'un élève ne touche qu'à ses lignes,
 * quel que soit l'identifiant envoyé par le navigateur. Une ligne déjà
 * publiée dans la base commune n'est plus modifiable par l'élève (la copie
 * publique vit sa vie côté équipe pédagogique) ; elle reste supprimable de
 * son espace sans effet sur la copie publiée.
 */
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import {
  FlashcardInputSchema, QcmInputSchema, texteVersHtml, normaliserItems, estTableAbsente,
  MESSAGE_TABLE_ABSENTE, MAX_EXERCICES_PAR_ITEM, type StudentExerciseKind,
} from '@/lib/student-exercises/regles';

export type ActionEleve = { ok: true; id: string } | { ok: false; error: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = { from: (table: string) => any };

function premierMessage(e: z.ZodError): string {
  return e.issues[0]?.message ?? 'Saisie invalide.';
}

async function contexte() {
  const { user } = await requireUser();
  const supabase = await createClient();
  return { user, db: supabase as unknown as Db };
}

async function verifierPlafond(db: Db, userId: string, coursId: string): Promise<string | null> {
  const { count, error } = await db.from('student_exercises')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId).eq('cours_id', coursId);
  if (error) return estTableAbsente(error) ? MESSAGE_TABLE_ABSENTE : error.message;
  if ((count ?? 0) >= MAX_EXERCICES_PAR_ITEM) return `Vous avez atteint ${MAX_EXERCICES_PAR_ITEM} entraînements personnels sur cet item.`;
  return null;
}

function revalider(coursId: string) {
  revalidatePath('/mes-entrainements');
  revalidatePath(`/mes-entrainements/${coursId}`);
  revalidatePath(`/cours/${coursId}/flashcards`);
  revalidatePath(`/cours/${coursId}/qcm`);
}

export async function creerFlashcardEleveAction(raw: unknown): Promise<ActionEleve> {
  const parsed = FlashcardInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: premierMessage(parsed.error) };
  const { user, db } = await contexte();
  const plafond = await verifierPlafond(db, user.id, parsed.data.coursId);
  if (plafond) return { ok: false, error: plafond };
  const { data, error } = await db.from('student_exercises').insert({
    user_id: user.id, cours_id: parsed.data.coursId, kind: 'flashcard',
    recto: texteVersHtml(parsed.data.recto), verso: texteVersHtml(parsed.data.verso),
  }).select('id').single();
  if (error) return { ok: false, error: estTableAbsente(error) ? MESSAGE_TABLE_ABSENTE : error.message };
  revalider(parsed.data.coursId);
  return { ok: true, id: data.id };
}

export async function modifierFlashcardEleveAction(raw: unknown): Promise<ActionEleve> {
  const parsed = FlashcardInputSchema.extend({ id: z.string().uuid() }).safeParse(raw);
  if (!parsed.success) return { ok: false, error: premierMessage(parsed.error) };
  const { user, db } = await contexte();
  const { data, error } = await db.from('student_exercises')
    .update({ recto: texteVersHtml(parsed.data.recto), verso: texteVersHtml(parsed.data.verso) })
    .eq('id', parsed.data.id).eq('user_id', user.id).eq('kind', 'flashcard').neq('status', 'published')
    .select('id').maybeSingle();
  if (error) return { ok: false, error: estTableAbsente(error) ? MESSAGE_TABLE_ABSENTE : error.message };
  if (!data) return { ok: false, error: 'Flashcard introuvable, ou déjà versée dans la base commune (elle n’est plus modifiable).' };
  revalider(parsed.data.coursId);
  return { ok: true, id: data.id };
}

export async function creerQcmEleveAction(raw: unknown): Promise<ActionEleve> {
  const parsed = QcmInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: premierMessage(parsed.error) };
  const { user, db } = await contexte();
  const plafond = await verifierPlafond(db, user.id, parsed.data.coursId);
  if (plafond) return { ok: false, error: plafond };
  const { data, error } = await db.from('student_exercises').insert({
    user_id: user.id, cours_id: parsed.data.coursId, kind: 'qcm',
    enonce: texteVersHtml(parsed.data.enonce),
    items: normaliserItems(parsed.data.items),
    correction_generale: parsed.data.correction_generale ? texteVersHtml(parsed.data.correction_generale) : null,
  }).select('id').single();
  if (error) return { ok: false, error: estTableAbsente(error) ? MESSAGE_TABLE_ABSENTE : error.message };
  revalider(parsed.data.coursId);
  return { ok: true, id: data.id };
}

export async function modifierQcmEleveAction(raw: unknown): Promise<ActionEleve> {
  const parsed = QcmInputSchema.safeParse(raw);
  const id = z.string().uuid().safeParse((raw as { id?: unknown })?.id);
  if (!parsed.success) return { ok: false, error: premierMessage(parsed.error) };
  if (!id.success) return { ok: false, error: 'Exercice invalide.' };
  const { user, db } = await contexte();
  const { data, error } = await db.from('student_exercises')
    .update({
      enonce: texteVersHtml(parsed.data.enonce),
      items: normaliserItems(parsed.data.items),
      correction_generale: parsed.data.correction_generale ? texteVersHtml(parsed.data.correction_generale) : null,
    })
    .eq('id', id.data).eq('user_id', user.id).eq('kind', 'qcm').neq('status', 'published')
    .select('id').maybeSingle();
  if (error) return { ok: false, error: estTableAbsente(error) ? MESSAGE_TABLE_ABSENTE : error.message };
  if (!data) return { ok: false, error: 'QCM introuvable, ou déjà versé dans la base commune (il n’est plus modifiable).' };
  revalider(parsed.data.coursId);
  return { ok: true, id: data.id };
}

export async function supprimerExerciceEleveAction(input: { id: string; coursId: string }): Promise<ActionEleve> {
  const parsed = z.object({ id: z.string().uuid(), coursId: z.string().uuid() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Exercice invalide.' };
  const { user, db } = await contexte();
  const { error } = await db.from('student_exercises').delete().eq('id', parsed.data.id).eq('user_id', user.id);
  if (error) return { ok: false, error: estTableAbsente(error) ? MESSAGE_TABLE_ABSENTE : error.message };
  revalider(parsed.data.coursId);
  return { ok: true, id: parsed.data.id };
}

export type { StudentExerciseKind };
