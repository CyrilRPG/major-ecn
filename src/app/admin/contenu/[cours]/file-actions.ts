'use server';

import { requireContentEditor } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAudit } from '@/lib/audit/log';

/**
 * Server actions « léger » appelées par FileDropzone après l'upload/remove
 * direct vers Storage. Leur SEUL rôle est d'écrire dans le journal admin
 * (la mutation DB+Storage a déjà été faite par le client avec son auth).
 */

async function loadCoursCtx(coursId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from('cours')
    .select('titre, matieres(nom)')
    .eq('id', coursId)
    .maybeSingle();
  return data as { titre: string; matieres?: { nom?: string } | null } | null;
}

export async function logFileUploadAction(input: {
  table: 'fiches' | 'videos';
  coursId: string;
  rowId?: string | null;
  oldPath?: string | null;
  newPath: string;
  fileName: string;
}): Promise<{ ok: true } | { error: string }> {
  const { profile } = await requireContentEditor();
  const ctx = await loadCoursCtx(input.coursId);
  const entity: 'fiche' | 'video' = input.table === 'fiches' ? 'fiche' : 'video';
  const isReplace = !!input.oldPath;
  await logAudit({
    actor: profile,
    action: isReplace ? 'replace' : 'create',
    entity,
    entityId: input.rowId ?? null,
    coursId: input.coursId,
    coursTitre: ctx?.titre ?? null,
    matiereNom: ctx?.matieres?.nom ?? null,
    description: isReplace
      ? `Remplacement de la ${entity} par « ${input.fileName} »`
      : `Téléversement d'une ${entity} : « ${input.fileName} »`,
    diff: { oldPath: input.oldPath ?? null, newPath: input.newPath },
  });
  return { ok: true };
}

export async function logFileRemoveAction(input: {
  table: 'fiches' | 'videos';
  coursId: string;
  rowId?: string | null;
  oldPath: string;
}): Promise<{ ok: true } | { error: string }> {
  const { profile } = await requireContentEditor();
  const ctx = await loadCoursCtx(input.coursId);
  const entity: 'fiche' | 'video' = input.table === 'fiches' ? 'fiche' : 'video';
  await logAudit({
    actor: profile,
    action: 'delete',
    entity,
    entityId: input.rowId ?? null,
    coursId: input.coursId,
    coursTitre: ctx?.titre ?? null,
    matiereNom: ctx?.matieres?.nom ?? null,
    description: `Suppression de la ${entity} (${input.oldPath.split('/').pop()})`,
    diff: { removedPath: input.oldPath },
  });
  return { ok: true };
}
