'use server';

import { revalidatePath } from 'next/cache';
import { profCanAccessCours, requireContentEditor } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAudit } from '@/lib/audit/log';

/**
 * Crée un item (cours) dans un collège et le place EN TÊTE de la liste.
 * Réservé aux administrateurs : un professeur n'a de droits que sur les items
 * déjà inscrits dans son périmètre, il ne peut pas en créer de nouveaux.
 */
export async function createCoursAction(input: {
  matiereId: string;
  titre: string;
}): Promise<{ ok: true; coursId: string } | { error: string }> {
  const { profile, scope } = await requireContentEditor();
  if (scope !== null) return { error: 'Seul un administrateur peut créer un item.' };

  const titre = input.titre.trim().slice(0, 200);
  if (!titre) return { error: 'Donnez un titre à l’item.' };

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;

  const { data: matiere } = await a
    .from('matieres')
    .select('id, nom')
    .eq('id', input.matiereId)
    .maybeSingle();
  if (!matiere) return { error: 'Collège introuvable.' };

  // Décale les items existants pour libérer la première place.
  const { data: siblings } = await a
    .from('cours')
    .select('id, order_index')
    .eq('matiere_id', input.matiereId)
    .order('order_index', { ascending: true });
  const list = (siblings ?? []) as { id: string; order_index: number }[];
  for (let i = 0; i < list.length; i++) {
    if (list[i].order_index !== i + 1) {
      await a.from('cours').update({ order_index: i + 1 }).eq('id', list[i].id);
    }
  }

  const { data: created, error } = await a
    .from('cours')
    .insert({ matiere_id: input.matiereId, titre, order_index: 0 })
    .select('id')
    .single();
  if (error) return { error: error.message };

  await logAudit({
    actor: profile,
    action: 'create',
    entity: 'cours',
    entityId: created.id as string,
    coursId: created.id as string,
    coursTitre: titre,
    matiereNom: (matiere as { nom?: string }).nom ?? null,
    description: `Création de l’item « ${titre} » en tête du collège`,
    diff: { matiere_id: input.matiereId, order_index: 0 },
  });

  revalidatePath('/admin/contenu');
  revalidatePath('/facultes');
  return { ok: true, coursId: created.id as string };
}

/**
 * Règle l'importance pédagogique (0-5 étoiles) d'un item (cours).
 * Réservé aux éditeurs de contenu ; un professeur ne peut modifier que les
 * items de son périmètre.
 */
export async function setCoursImportanceAction(input: {
  coursId: string;
  importance: number;
}): Promise<{ ok: true } | { error: string }> {
  const { profile, scope } = await requireContentEditor();
  const importance = Math.max(0, Math.min(5, Math.round(Number(input.importance) || 0)));

  const admin = createAdminClient();
  const { data: c } = await admin
    .from('cours')
    .select('id, titre, matiere_id, matieres(nom)')
    .eq('id', input.coursId)
    .maybeSingle();
  if (!c) return { error: 'Item introuvable.' };
  const cc = c as unknown as { id: string; titre: string; matiere_id: string; matieres?: { nom?: string } | null };
  if (!profCanAccessCours(scope, cc.matiere_id, cc.id)) return { error: 'Accès refusé.' };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from('cours').update({ importance }).eq('id', input.coursId);
  if (error) return { error: error.message };

  await logAudit({
    actor: profile,
    action: 'update',
    entity: 'cours',
    entityId: cc.id,
    coursId: cc.id,
    coursTitre: cc.titre,
    matiereNom: cc.matieres?.nom ?? null,
    description: `Importance réglée à ${importance}/5`,
    diff: { importance },
  });

  revalidatePath('/admin/contenu');
  return { ok: true };
}
