'use server';

import { revalidatePath } from 'next/cache';
import { assertCanWrite, profCanAccessCours, requireContentEditor } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAudit } from '@/lib/audit/log';
import { titreDepuisFichier } from '@/lib/fiches/documents';

/**
 * Gestion des fiches de cours d'un item — plusieurs fiches possibles, toutes
 * affichées dans le MÊME onglet « Fiche de cours » chez l'élève (calqué sur les
 * supports de séance).
 *
 * Les fichiers sont téléversés depuis le navigateur vers le bucket `fiches`
 * (comme les autres documents : pas de limite de taille de requête serveur) ;
 * ces actions n'enregistrent que les références, après contrôle des droits.
 *
 * `content_format = 'pdf'` signifie « ce PDF fait foi » : la fiche n'est alors
 * pas éditable en ligne. La fiche déposée en HTML (convertie puis modifiable
 * dans l'éditeur) reste la fiche principale, en tête de liste.
 */

type Ctx = {
  admin: ReturnType<typeof createAdminClient>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  a: any;
  profile: Awaited<ReturnType<typeof requireContentEditor>>['profile'];
  cours: { id: string; titre: string; matiere_id: string; matiereNom: string | null };
};

/** Contrôles communs : éditeur de contenu, droit d'écriture « fiche », périmètre. */
async function guard(coursId: string): Promise<Ctx | { error: string }> {
  const { profile, scope } = await requireContentEditor();
  try {
    assertCanWrite(scope, 'fiche');
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Permission insuffisante.' };
  }
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;
  const { data } = await a
    .from('cours')
    .select('id, titre, matiere_id, matieres(nom)')
    .eq('id', coursId)
    .maybeSingle();
  if (!data) return { error: 'Item introuvable.' };
  const c = data as { id: string; titre: string; matiere_id: string; matieres?: { nom?: string } | null };
  if (!profCanAccessCours(scope, c.matiere_id, c.id)) return { error: 'Accès refusé à cet item.' };
  return {
    admin,
    a,
    profile,
    cours: { id: c.id, titre: c.titre, matiere_id: c.matiere_id, matiereNom: c.matieres?.nom ?? null },
  };
}

type FicheRow = {
  id: string;
  cours_id: string;
  titre: string;
  storage_path: string | null;
  order_index: number;
  content_format: string | null;
};

/** Charge une fiche et applique les mêmes contrôles via son item. */
async function guardFiche(ficheId: string): Promise<(Ctx & { fiche: FicheRow }) | { error: string }> {
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (admin as any)
    .from('fiches')
    .select('id, cours_id, titre, storage_path, order_index, content_format')
    .eq('id', ficheId)
    .maybeSingle();
  if (!data) return { error: 'Fiche introuvable.' };
  const fiche = data as FicheRow;
  const ctx = await guard(fiche.cours_id);
  if ('error' in ctx) return ctx;
  return { ...ctx, fiche };
}

function refresh(coursId: string) {
  revalidatePath(`/admin/contenu/${coursId}`);
  revalidatePath(`/cours/${coursId}`, 'layout');
  revalidatePath(`/cours/${coursId}/fiche`);
}

/** Recompacte les rangs d'un item (après suppression ou déplacement). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function renumber(a: any, coursId: string) {
  const { data } = await a
    .from('fiches')
    .select('id, order_index')
    .eq('cours_id', coursId)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true });
  const list = (data ?? []) as { id: string; order_index: number }[];
  for (let i = 0; i < list.length; i++) {
    if (list[i].order_index !== i) {
      await a.from('fiches').update({ order_index: i }).eq('id', list[i].id);
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Ajout / remplacement de fichier                                    */
/* ------------------------------------------------------------------ */

/**
 * Ajoute une NOUVELLE fiche PDF à l'item, à la suite des fiches existantes.
 * Appelée une fois par fichier lorsqu'on en dépose plusieurs d'un coup.
 */
export async function addFichePdfAction(input: {
  coursId: string;
  path: string;
  fileName: string;
  titre?: string;
}): Promise<{ ok: true; ficheId: string } | { error: string }> {
  const ctx = await guard(input.coursId);
  if ('error' in ctx) return ctx;

  // Le chemin doit appartenir à cet item : on ne fait jamais confiance au client.
  if (!input.path.startsWith(`${input.coursId}/`)) return { error: 'Chemin de fiche invalide.' };

  const titre = (input.titre?.trim() || titreDepuisFichier(input.fileName)).slice(0, 200);

  const { data: dernier } = await ctx.a
    .from('fiches')
    .select('order_index')
    .eq('cours_id', input.coursId)
    .order('order_index', { ascending: false })
    .limit(1)
    .maybeSingle();
  const rang = ((dernier?.order_index as number | undefined) ?? -1) + 1;

  const { data: cree, error } = await ctx.a
    .from('fiches')
    .insert({
      cours_id: input.coursId,
      titre,
      storage_path: input.path,
      content_format: 'pdf',
      pages: null,
      order_index: rang,
      updated_by: ctx.profile.id,
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single();
  if (error) return { error: error.message };

  await logAudit({
    actor: ctx.profile,
    action: 'create',
    entity: 'fiche',
    entityId: cree.id as string,
    coursId: ctx.cours.id,
    coursTitre: ctx.cours.titre,
    matiereNom: ctx.cours.matiereNom,
    description: `Fiche PDF « ${titre} » ajoutée en position ${rang + 1}`,
    diff: { storage_path: input.path, content_format: 'pdf', order_index: rang },
  });

  refresh(input.coursId);
  return { ok: true, ficheId: cree.id as string };
}

/**
 * Remplace le FICHIER d'une fiche existante (le nom et la position ne bougent
 * pas). L'ancien PDF est retiré du bucket pour ne rien laisser d'orphelin.
 */
export async function replaceFichePdfAction(input: {
  ficheId: string;
  path: string;
  fileName: string;
}): Promise<{ ok: true } | { error: string }> {
  const ctx = await guardFiche(input.ficheId);
  if ('error' in ctx) return ctx;

  if (!input.path.startsWith(`${ctx.cours.id}/`)) return { error: 'Chemin de fiche invalide.' };

  const { error } = await ctx.a
    .from('fiches')
    .update({
      storage_path: input.path,
      content_format: 'pdf',
      pages: null,
      updated_by: ctx.profile.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.ficheId);
  if (error) return { error: error.message };

  const ancien = ctx.fiche.storage_path;
  if (ancien && ancien !== input.path) {
    await ctx.admin.storage.from('fiches').remove([ancien]);
  }

  await logAudit({
    actor: ctx.profile,
    action: 'replace',
    entity: 'fiche',
    entityId: input.ficheId,
    coursId: ctx.cours.id,
    coursTitre: ctx.cours.titre,
    matiereNom: ctx.cours.matiereNom,
    description: `Fichier remplacé pour « ${ctx.fiche.titre} » : « ${input.fileName} »`,
    diff: { storage_path: input.path, content_format: 'pdf' },
  });

  refresh(ctx.cours.id);
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/*  Nom, ordre, suppression                                            */
/* ------------------------------------------------------------------ */

/** Renomme une fiche (le nom est l'étiquette affichée à l'élève). */
export async function renameFicheAction(input: {
  ficheId: string;
  titre: string;
}): Promise<{ ok: true } | { error: string }> {
  const ctx = await guardFiche(input.ficheId);
  if ('error' in ctx) return ctx;
  const titre = input.titre.trim().slice(0, 200);
  if (!titre) return { error: 'Le nom ne peut pas être vide.' };

  const { error } = await ctx.a
    .from('fiches')
    .update({ titre, updated_by: ctx.profile.id, updated_at: new Date().toISOString() })
    .eq('id', input.ficheId);
  if (error) return { error: error.message };

  await logAudit({
    actor: ctx.profile,
    action: 'update',
    entity: 'fiche',
    entityId: input.ficheId,
    coursId: ctx.cours.id,
    coursTitre: ctx.cours.titre,
    matiereNom: ctx.cours.matiereNom,
    description: `Fiche renommée : « ${ctx.fiche.titre} » → « ${titre} »`,
  });

  refresh(ctx.cours.id);
  return { ok: true };
}

/** Déplace une fiche d'un cran dans l'onglet « Fiche de cours ». */
export async function moveFicheAction(input: {
  ficheId: string;
  direction: 'up' | 'down';
}): Promise<{ ok: true } | { error: string }> {
  const ctx = await guardFiche(input.ficheId);
  if ('error' in ctx) return ctx;

  const { data: rows } = await ctx.a
    .from('fiches')
    .select('id, order_index')
    .eq('cours_id', ctx.cours.id)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true });
  const list = (rows ?? []) as { id: string; order_index: number }[];
  const pos = list.findIndex((f) => f.id === input.ficheId);
  if (pos === -1) return { error: 'Fiche introuvable dans la liste.' };
  const cible = input.direction === 'up' ? pos - 1 : pos + 1;
  if (cible < 0 || cible >= list.length) return { ok: true }; // déjà en bout de liste

  // Réécriture complète des index : robuste même si les valeurs actuelles
  // comportent des doublons ou des trous.
  const reordered = [...list];
  const [moved] = reordered.splice(pos, 1);
  reordered.splice(cible, 0, moved);
  for (let i = 0; i < reordered.length; i++) {
    if (reordered[i].order_index !== i) {
      await ctx.a.from('fiches').update({ order_index: i }).eq('id', reordered[i].id);
    }
  }

  await logAudit({
    actor: ctx.profile,
    action: 'update',
    entity: 'fiche',
    entityId: input.ficheId,
    coursId: ctx.cours.id,
    coursTitre: ctx.cours.titre,
    matiereNom: ctx.cours.matiereNom,
    description: `Ordre modifié : « ${ctx.fiche.titre} » en position ${cible + 1}`,
    diff: { de: pos + 1, vers: cible + 1 },
  });

  refresh(ctx.cours.id);
  return { ok: true };
}

/** Supprime une fiche (ligne + fichier). */
export async function deleteFicheAction(input: {
  ficheId: string;
}): Promise<{ ok: true } | { error: string }> {
  const ctx = await guardFiche(input.ficheId);
  if ('error' in ctx) return ctx;

  if (ctx.fiche.storage_path) {
    await ctx.admin.storage.from('fiches').remove([ctx.fiche.storage_path]);
  }
  const { error } = await ctx.a.from('fiches').delete().eq('id', input.ficheId);
  if (error) return { error: error.message };

  await renumber(ctx.a, ctx.cours.id);

  await logAudit({
    actor: ctx.profile,
    action: 'delete',
    entity: 'fiche',
    entityId: input.ficheId,
    coursId: ctx.cours.id,
    coursTitre: ctx.cours.titre,
    matiereNom: ctx.cours.matiereNom,
    description: `Suppression de la fiche « ${ctx.fiche.titre} »`,
  });

  refresh(ctx.cours.id);
  return { ok: true };
}
