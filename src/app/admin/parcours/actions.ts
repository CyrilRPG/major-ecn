'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Éditeur admin des Parcours du Major : contenu du parcours (rappel, cas
 * clinique, date d'ouverture) et ses questions (QCM auto-corrigés + QROC
 * auto-évalués). Réservé aux administrateurs.
 */

export type QcmItem = { lettre: string; texte: string; correct: boolean };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function admin(): any {
  return createAdminClient();
}

export async function updateParcoursAction(input: {
  id: string;
  titre: string;
  sousTitre: string | null;
  introHtml: string;
  vignetteHtml: string | null;
  availableAt: string; // ISO
  active: boolean;
}): Promise<{ ok: true } | { error: string }> {
  await requireAdmin();
  const titre = input.titre.trim().slice(0, 300);
  if (!titre) return { error: 'Le titre est obligatoire.' };
  const when = new Date(input.availableAt);
  if (Number.isNaN(when.getTime())) return { error: 'Date d’ouverture invalide.' };

  const { error } = await admin()
    .from('major_parcours')
    .update({
      titre,
      sous_titre: input.sousTitre?.trim() || null,
      intro_html: input.introHtml ?? '',
      vignette_html: input.vignetteHtml?.trim() || null,
      available_at: when.toISOString(),
      active: input.active,
    })
    .eq('id', input.id);
  if (error) return { error: error.message };

  revalidatePath('/admin/parcours');
  revalidatePath('/parcours');
  return { ok: true };
}

export async function addQuestionAction(input: {
  parcoursId: string;
  section: 'qcm' | 'cas_clinique';
  format: 'qcm' | 'qroc';
}): Promise<{ ok: true; id: string } | { error: string }> {
  await requireAdmin();
  const a = admin();
  const { data: last } = await a
    .from('major_parcours_questions')
    .select('ordre')
    .eq('parcours_id', input.parcoursId)
    .eq('section', input.section)
    .order('ordre', { ascending: false })
    .limit(1)
    .maybeSingle();
  const ordre = ((last?.ordre as number | undefined) ?? -1) + 1;
  const items: QcmItem[] = input.format === 'qcm'
    ? ['A', 'B', 'C', 'D', 'E'].map((l) => ({ lettre: l, texte: '', correct: false }))
    : [];

  const { data, error } = await a
    .from('major_parcours_questions')
    .insert({
      parcours_id: input.parcoursId,
      section: input.section,
      format: input.format,
      ordre,
      enonce_html: '',
      items,
      reponse_attendue: input.format === 'qroc' ? '' : null,
    })
    .select('id')
    .single();
  if (error) return { error: error.message };

  revalidatePath(`/admin/parcours/${input.parcoursId}`);
  return { ok: true, id: data.id as string };
}

export async function updateQuestionAction(input: {
  id: string;
  parcoursId: string;
  enonceHtml: string;
  items: QcmItem[];
  reponseAttendue: string | null;
  explicationHtml: string | null;
  imagePath: string | null;
  ordre: number;
}): Promise<{ ok: true } | { error: string }> {
  await requireAdmin();
  const { error } = await admin()
    .from('major_parcours_questions')
    .update({
      enonce_html: input.enonceHtml ?? '',
      items: input.items ?? [],
      reponse_attendue: input.reponseAttendue?.trim() || null,
      explication_html: input.explicationHtml?.trim() || null,
      image_path: input.imagePath?.trim() || null,
      ordre: input.ordre,
    })
    .eq('id', input.id);
  if (error) return { error: error.message };

  revalidatePath(`/admin/parcours/${input.parcoursId}`);
  revalidatePath('/parcours');
  return { ok: true };
}

export async function deleteQuestionAction(input: {
  id: string;
  parcoursId: string;
}): Promise<{ ok: true } | { error: string }> {
  await requireAdmin();
  const { error } = await admin().from('major_parcours_questions').delete().eq('id', input.id);
  if (error) return { error: error.message };
  revalidatePath(`/admin/parcours/${input.parcoursId}`);
  return { ok: true };
}
