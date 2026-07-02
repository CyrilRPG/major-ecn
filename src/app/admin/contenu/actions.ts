'use server';

import { revalidatePath } from 'next/cache';
import { profCanAccessCours, requireContentEditor } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAudit } from '@/lib/audit/log';

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
