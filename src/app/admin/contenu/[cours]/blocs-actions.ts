'use server';

import { revalidatePath } from 'next/cache';
import { requireContentEditor } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { BLOCS, type BlocKey } from '@/lib/student/blocs';
import { logAudit } from '@/lib/audit/log';

const CLES = new Set<string>(BLOCS.map((b) => b.key));

/**
 * Enregistre les blocs MASQUÉS d'un item (`cours.hidden_blocks`).
 *
 * Réservé aux administrateurs : c'est une décision d'affichage sur l'item,
 * pas une édition de contenu (un professeur ne doit pas pouvoir faire
 * disparaître une rubrique pour tous les élèves).
 */
export async function setHiddenBlocksAction(input: {
  coursId: string;
  hidden: BlocKey[];
}): Promise<{ ok: true } | { error: string }> {
  const { profile, scope } = await requireContentEditor();
  if (scope !== null) return { error: 'Réservé aux administrateurs.' };

  const hidden = Array.from(new Set(input.hidden.filter((k) => CLES.has(k))));

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;

  const { data: c } = await a
    .from('cours')
    .select('id, titre, matiere_id, hidden_blocks, matieres(nom)')
    .eq('id', input.coursId)
    .maybeSingle();
  if (!c) return { error: 'Item introuvable.' };
  const cours = c as { id: string; titre: string; hidden_blocks: string[] | null; matieres?: { nom?: string } | null };

  const { error } = await a
    .from('cours')
    .update({ hidden_blocks: hidden })
    .eq('id', input.coursId);
  if (error) return { error: error.message };

  const libelle = (k: string) => BLOCS.find((b) => b.key === k)?.label ?? k;
  await logAudit({
    actor: profile,
    action: 'update',
    entity: 'cours',
    entityId: cours.id,
    coursId: cours.id,
    coursTitre: cours.titre,
    matiereNom: cours.matieres?.nom ?? null,
    description: hidden.length === 0
      ? 'Tous les blocs sont affichés'
      : `Blocs masqués : ${hidden.map(libelle).join(', ')}`,
    diff: { avant: cours.hidden_blocks ?? [], apres: hidden },
  });

  revalidatePath(`/admin/contenu/${input.coursId}`);
  revalidatePath(`/cours/${input.coursId}`, 'layout');
  return { ok: true };
}
