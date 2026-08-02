'use server';

import { revalidatePath } from 'next/cache';
import { assertCanWrite, profCanAccessCours, requireContentEditor } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAudit } from '@/lib/audit/log';

/**
 * Fiche déposée directement au format PDF (par opposition à la fiche HTML,
 * convertie puis éditable en ligne).
 *
 * Le fichier est téléversé depuis le navigateur vers le bucket `fiches` (comme
 * les autres documents : pas de limite de taille de requête serveur) ; cette
 * action n'enregistre que la référence, après contrôle des droits.
 *
 * `content_format` passe à `pdf` : c'est le PDF déposé qui fait foi pour les
 * élèves. Une éventuelle version structurée reste stockée mais n'est plus
 * servie — on ne l'efface pas, pour ne rien détruire par inadvertance.
 */
export async function setFichePdfAction(input: {
  coursId: string;
  path: string;
  fileName: string;
}): Promise<{ ok: true } | { error: string }> {
  const { profile, scope } = await requireContentEditor();
  try {
    assertCanWrite(scope, 'fiche');
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Permission insuffisante.' };
  }

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;

  const { data: c } = await a
    .from('cours')
    .select('id, titre, matiere_id, matieres(nom)')
    .eq('id', input.coursId)
    .maybeSingle();
  if (!c) return { error: 'Item introuvable.' };
  const cours = c as { id: string; titre: string; matiere_id: string; matieres?: { nom?: string } | null };
  if (!profCanAccessCours(scope, cours.matiere_id, cours.id)) return { error: 'Accès refusé à cet item.' };

  // Le chemin doit appartenir à cet item : on ne fait jamais confiance au client.
  if (!input.path.startsWith(`${input.coursId}/`)) return { error: 'Chemin de fiche invalide.' };

  const { data: existante } = await a
    .from('fiches')
    .select('id, storage_path')
    .eq('cours_id', input.coursId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const patch = {
    storage_path: input.path,
    content_format: 'pdf',
    pages: null,
    updated_by: profile.id,
    updated_at: new Date().toISOString(),
  };

  if (existante?.id) {
    const { error } = await a.from('fiches').update(patch).eq('id', existante.id);
    if (error) return { error: error.message };
    // Remplace le fichier précédent : on ne laisse pas de PDF orphelin.
    const ancien = (existante as { storage_path: string | null }).storage_path;
    if (ancien && ancien !== input.path) {
      await admin.storage.from('fiches').remove([ancien]);
    }
  } else {
    const { error } = await a.from('fiches').insert({
      cours_id: input.coursId,
      titre: `Fiche — ${cours.titre}`.slice(0, 200),
      ...patch,
    });
    if (error) return { error: error.message };
  }

  await logAudit({
    actor: profile,
    action: existante?.id ? 'replace' : 'create',
    entity: 'fiche',
    entityId: existante?.id ?? null,
    coursId: cours.id,
    coursTitre: cours.titre,
    matiereNom: cours.matieres?.nom ?? null,
    description: `Fiche déposée en PDF : « ${input.fileName} »`,
    diff: { storage_path: input.path, content_format: 'pdf' },
  });

  revalidatePath(`/admin/contenu/${input.coursId}`);
  revalidatePath(`/cours/${input.coursId}`, 'layout');
  return { ok: true };
}
