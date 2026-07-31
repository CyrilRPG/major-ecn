'use server';

import { revalidatePath } from 'next/cache';
import {
  assertCanWrite,
  profCanAccessCours,
  requireContentEditor,
} from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { extractBunnyVideoId } from '@/lib/bunny-link';
import { logAudit } from '@/lib/audit/log';

/**
 * Gestion autonome des vidéos d'un item par l'administrateur : ajout, ordre,
 * renommage, remplacement du lien Bunny, suppression, et support de séance.
 *
 * Toutes les écritures passent par le client service-role APRÈS contrôle
 * explicite des droits (éditeur de contenu + périmètre du cours + droit
 * d'écriture sur le type « video »), et sont tracées dans le journal admin.
 *
 * Le TYPE de la vidéo porte la permission côté élève :
 *   - `cours`              → visible par la Formule Intensive (formula_permissions.video)
 *   - `seance_approfondie` → visible par le Programme Approfondi (…seance_approfondie)
 * Il n'est donc jamais modifiable après coup : on supprime et on recrée, pour
 * qu'un contenu ne change pas silencieusement de public.
 */

export type VideoType = 'cours' | 'seance_approfondie';

const LABEL: Record<VideoType, string> = {
  cours: 'Cours vidéo',
  seance_approfondie: 'Séance approfondie',
};

type Ctx = {
  admin: ReturnType<typeof createAdminClient>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  a: any;
  profile: Awaited<ReturnType<typeof requireContentEditor>>['profile'];
  cours: { id: string; titre: string; matiere_id: string; matiereNom: string | null };
};

/** Contrôles communs : éditeur de contenu, droit d'écriture vidéo, périmètre. */
async function guard(coursId: string): Promise<Ctx | { error: string }> {
  const { profile, scope } = await requireContentEditor();
  try {
    assertCanWrite(scope, 'video');
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

/** Charge une vidéo et applique les mêmes contrôles via son cours. */
async function guardVideo(videoId: string) {
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (admin as any)
    .from('videos')
    .select('id, cours_id, titre, type, order_index, support_path')
    .eq('id', videoId)
    .maybeSingle();
  if (!data) return { error: 'Vidéo introuvable.' as const };
  const video = data as {
    id: string; cours_id: string; titre: string; type: VideoType;
    order_index: number; support_path: string | null;
  };
  const ctx = await guard(video.cours_id);
  if ('error' in ctx) return ctx;
  return { ...ctx, video };
}

function refresh(coursId: string) {
  revalidatePath(`/admin/contenu/${coursId}`);
  revalidatePath(`/cours/${coursId}`, 'layout');
}

/** Ajoute une vidéo (lien Bunny collé) à la fin de la liste de son type. */
export async function addVideoAction(input: {
  coursId: string;
  type: VideoType;
  titre: string;
  lien: string;
}): Promise<{ ok: true; videoId: string } | { error: string }> {
  const ctx = await guard(input.coursId);
  if ('error' in ctx) return ctx;

  const titre = input.titre.trim().slice(0, 200);
  if (!titre) return { error: 'Donnez un titre à la vidéo.' };
  const bunnyId = extractBunnyVideoId(input.lien);
  if (!bunnyId) {
    return { error: 'Lien Bunny.net non reconnu. Collez le lien de la vidéo (ou son identifiant).' };
  }

  const { data: last } = await ctx.a
    .from('videos')
    .select('order_index')
    .eq('cours_id', input.coursId)
    .eq('type', input.type)
    .order('order_index', { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextIndex = ((last?.order_index as number | undefined) ?? -1) + 1;

  const { data: created, error } = await ctx.a
    .from('videos')
    .insert({
      cours_id: input.coursId,
      titre,
      bunny_video_id: bunnyId,
      type: input.type,
      order_index: nextIndex,
    })
    .select('id')
    .single();
  if (error) return { error: error.message };

  await logAudit({
    actor: ctx.profile,
    action: 'create',
    entity: 'video',
    entityId: created.id as string,
    coursId: ctx.cours.id,
    coursTitre: ctx.cours.titre,
    matiereNom: ctx.cours.matiereNom,
    description: `Ajout de « ${titre} » (${LABEL[input.type]})`,
    diff: { bunny_video_id: bunnyId, type: input.type, order_index: nextIndex },
  });

  refresh(input.coursId);
  return { ok: true, videoId: created.id as string };
}

/** Renomme une vidéo. Le titre sert aussi de nom d'onglet du support. */
export async function renameVideoAction(input: {
  videoId: string;
  titre: string;
}): Promise<{ ok: true } | { error: string }> {
  const ctx = await guardVideo(input.videoId);
  if ('error' in ctx) return ctx;
  const titre = input.titre.trim().slice(0, 200);
  if (!titre) return { error: 'Le titre ne peut pas être vide.' };

  const { error } = await ctx.a
    .from('videos')
    .update({ titre, updated_at: new Date().toISOString() })
    .eq('id', input.videoId);
  if (error) return { error: error.message };

  await logAudit({
    actor: ctx.profile,
    action: 'update',
    entity: 'video',
    entityId: input.videoId,
    coursId: ctx.cours.id,
    coursTitre: ctx.cours.titre,
    matiereNom: ctx.cours.matiereNom,
    description: `Renommage : « ${ctx.video.titre} » → « ${titre} »`,
    diff: { from: ctx.video.titre, to: titre },
  });

  refresh(ctx.cours.id);
  return { ok: true };
}

/** Remplace la vidéo Bunny associée (nouveau lien collé). */
export async function replaceVideoLinkAction(input: {
  videoId: string;
  lien: string;
}): Promise<{ ok: true } | { error: string }> {
  const ctx = await guardVideo(input.videoId);
  if ('error' in ctx) return ctx;
  const bunnyId = extractBunnyVideoId(input.lien);
  if (!bunnyId) {
    return { error: 'Lien Bunny.net non reconnu. Collez le lien de la vidéo (ou son identifiant).' };
  }

  const { error } = await ctx.a
    .from('videos')
    .update({ bunny_video_id: bunnyId, storage_path: null, updated_at: new Date().toISOString() })
    .eq('id', input.videoId);
  if (error) return { error: error.message };

  await logAudit({
    actor: ctx.profile,
    action: 'replace',
    entity: 'video',
    entityId: input.videoId,
    coursId: ctx.cours.id,
    coursTitre: ctx.cours.titre,
    matiereNom: ctx.cours.matiereNom,
    description: `Nouvelle vidéo pour « ${ctx.video.titre} »`,
    diff: { bunny_video_id: bunnyId },
  });

  refresh(ctx.cours.id);
  return { ok: true };
}

/** Supprime la vidéo (et son support éventuel). */
export async function deleteVideoAction(input: {
  videoId: string;
}): Promise<{ ok: true } | { error: string }> {
  const ctx = await guardVideo(input.videoId);
  if ('error' in ctx) return ctx;

  if (ctx.video.support_path) {
    await ctx.admin.storage.from('supports').remove([ctx.video.support_path]);
  }
  const { error } = await ctx.a.from('videos').delete().eq('id', input.videoId);
  if (error) return { error: error.message };

  // Renumérote la liste pour éviter les trous.
  await renumber(ctx.a, ctx.cours.id, ctx.video.type);

  await logAudit({
    actor: ctx.profile,
    action: 'delete',
    entity: 'video',
    entityId: input.videoId,
    coursId: ctx.cours.id,
    coursTitre: ctx.cours.titre,
    matiereNom: ctx.cours.matiereNom,
    description: `Suppression de « ${ctx.video.titre} » (${LABEL[ctx.video.type]})`,
    diff: { support_supprime: !!ctx.video.support_path },
  });

  refresh(ctx.cours.id);
  return { ok: true };
}

/** Déplace une vidéo d'un cran vers le haut ou vers le bas dans sa liste. */
export async function moveVideoAction(input: {
  videoId: string;
  direction: 'up' | 'down';
}): Promise<{ ok: true } | { error: string }> {
  const ctx = await guardVideo(input.videoId);
  if ('error' in ctx) return ctx;

  const { data: rows } = await ctx.a
    .from('videos')
    .select('id, order_index')
    .eq('cours_id', ctx.cours.id)
    .eq('type', ctx.video.type)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true });
  const list = (rows ?? []) as { id: string; order_index: number }[];
  const pos = list.findIndex((v) => v.id === input.videoId);
  if (pos === -1) return { error: 'Vidéo introuvable dans la liste.' };
  const target = input.direction === 'up' ? pos - 1 : pos + 1;
  if (target < 0 || target >= list.length) return { ok: true }; // déjà en bout de liste

  // Réécriture complète des index : robuste même si les valeurs actuelles
  // comportent des doublons ou des trous (données antérieures à l'ordre).
  const reordered = [...list];
  const [moved] = reordered.splice(pos, 1);
  reordered.splice(target, 0, moved);
  for (let i = 0; i < reordered.length; i++) {
    if (reordered[i].order_index !== i) {
      await ctx.a.from('videos').update({ order_index: i }).eq('id', reordered[i].id);
    }
  }

  await logAudit({
    actor: ctx.profile,
    action: 'update',
    entity: 'video',
    entityId: input.videoId,
    coursId: ctx.cours.id,
    coursTitre: ctx.cours.titre,
    matiereNom: ctx.cours.matiereNom,
    description: `Ordre modifié : « ${ctx.video.titre} » en position ${target + 1}`,
    diff: { de: pos + 1, vers: target + 1 },
  });

  refresh(ctx.cours.id);
  return { ok: true };
}

/**
 * Enregistre le support téléversé (le fichier est déposé directement depuis le
 * navigateur vers le bucket privé `supports`, comme les fiches : pas de limite
 * de taille de requête serveur).
 */
export async function setVideoSupportAction(input: {
  videoId: string;
  path: string;
  pages?: number | null;
  fileName?: string;
}): Promise<{ ok: true } | { error: string }> {
  const ctx = await guardVideo(input.videoId);
  if ('error' in ctx) return ctx;

  // Le chemin doit appartenir à cet item : on ne fait jamais confiance au client.
  if (!input.path.startsWith(`${ctx.cours.id}/`)) {
    return { error: 'Chemin de support invalide.' };
  }

  const previous = ctx.video.support_path;
  const { error } = await ctx.a
    .from('videos')
    .update({
      support_path: input.path,
      support_pages: input.pages ?? null,
      support_updated_at: new Date().toISOString(),
    })
    .eq('id', input.videoId);
  if (error) return { error: error.message };

  if (previous && previous !== input.path) {
    await ctx.admin.storage.from('supports').remove([previous]);
  }

  await logAudit({
    actor: ctx.profile,
    action: previous ? 'replace' : 'create',
    entity: 'video',
    entityId: input.videoId,
    coursId: ctx.cours.id,
    coursTitre: ctx.cours.titre,
    matiereNom: ctx.cours.matiereNom,
    description: `${previous ? 'Remplacement' : 'Ajout'} du support de « ${ctx.video.titre} »${input.fileName ? ` (${input.fileName})` : ''}`,
    diff: { support_path: input.path },
  });

  refresh(ctx.cours.id);
  return { ok: true };
}

/** Retire le support d'une vidéo (l'onglet élève disparaît). */
export async function removeVideoSupportAction(input: {
  videoId: string;
}): Promise<{ ok: true } | { error: string }> {
  const ctx = await guardVideo(input.videoId);
  if ('error' in ctx) return ctx;
  if (!ctx.video.support_path) return { ok: true };

  await ctx.admin.storage.from('supports').remove([ctx.video.support_path]);
  const { error } = await ctx.a
    .from('videos')
    .update({ support_path: null, support_pages: null, support_updated_at: null })
    .eq('id', input.videoId);
  if (error) return { error: error.message };

  await logAudit({
    actor: ctx.profile,
    action: 'delete',
    entity: 'video',
    entityId: input.videoId,
    coursId: ctx.cours.id,
    coursTitre: ctx.cours.titre,
    matiereNom: ctx.cours.matiereNom,
    description: `Suppression du support de « ${ctx.video.titre} »`,
    diff: { support_path: ctx.video.support_path },
  });

  refresh(ctx.cours.id);
  return { ok: true };
}

/** Recompacte les index d'une liste (après suppression). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function renumber(a: any, coursId: string, type: VideoType) {
  const { data } = await a
    .from('videos')
    .select('id, order_index')
    .eq('cours_id', coursId)
    .eq('type', type)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true });
  const list = (data ?? []) as { id: string; order_index: number }[];
  for (let i = 0; i < list.length; i++) {
    if (list[i].order_index !== i) {
      await a.from('videos').update({ order_index: i }).eq('id', list[i].id);
    }
  }
}
