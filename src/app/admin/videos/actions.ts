'use server';

import { revalidatePath } from 'next/cache';
import {
  assertCanWrite,
  profCanAccessCours,
  requireContentEditor,
} from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { extractBunnyVideoId } from '@/lib/bunny-link';
import { revisionsTitre } from '@/lib/videos/revisions';
import { logAudit } from '@/lib/audit/log';

/**
 * Bibliothèque vidéo de l'administration (onglet « Vidéos ») : navigation
 * collège → sous-collège → item → catégorie, puis ajout, ordre, renommage,
 * remplacement du lien Bunny, suppression et support de séance.
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

/** Contrôles de LECTURE seule (consultation de la bibliothèque). */
async function guardRead(coursId: string): Promise<Ctx | { error: string }> {
  const { profile, scope } = await requireContentEditor();
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
  revalidatePath('/admin/videos');
  revalidatePath(`/admin/contenu/${coursId}`);
  revalidatePath(`/cours/${coursId}`, 'layout');
}

/* ------------------------------------------------------------------ */
/*  Lecture — cascade collège → item → catégorie                       */
/* ------------------------------------------------------------------ */

export type VideoLibraryItem = {
  id: string;
  titre: string;
  orderIndex: number;
  nbCours: number;
  nbSeances: number;
};

export type VideoLibraryVideo = {
  id: string;
  titre: string;
  bunny_video_id: string | null;
  order_index: number;
  support_path: string | null;
};

/** Items d'un collège, avec le nombre de vidéos de chaque catégorie. */
export async function listItemsAction(
  matiereId: string,
): Promise<{ items: VideoLibraryItem[] } | { error: string }> {
  const { scope } = await requireContentEditor();
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;

  const { data: coursRows, error } = await a
    .from('cours')
    .select('id, titre, order_index')
    .eq('matiere_id', matiereId)
    .order('order_index', { ascending: true })
    .order('titre', { ascending: true });
  if (error) return { error: error.message };

  const cours = ((coursRows ?? []) as { id: string; titre: string; order_index: number }[])
    .filter((c) => profCanAccessCours(scope, matiereId, c.id));
  if (cours.length === 0) return { items: [] };

  const { data: vids } = await a
    .from('videos')
    .select('cours_id, type')
    .in('cours_id', cours.map((c) => c.id));

  const counts = new Map<string, { cours: number; seances: number }>();
  for (const v of ((vids ?? []) as { cours_id: string; type: string | null }[])) {
    const entry = counts.get(v.cours_id) ?? { cours: 0, seances: 0 };
    if (v.type === 'seance_approfondie') entry.seances++;
    else entry.cours++;
    counts.set(v.cours_id, entry);
  }

  return {
    items: cours.map((c) => ({
      id: c.id,
      titre: c.titre,
      orderIndex: c.order_index,
      nbCours: counts.get(c.id)?.cours ?? 0,
      nbSeances: counts.get(c.id)?.seances ?? 0,
    })),
  };
}

/** Vidéos d'un item pour une catégorie, dans l'ordre d'affichage élève. */
export async function listVideosAction(
  coursId: string,
  type: VideoType,
): Promise<{ videos: VideoLibraryVideo[] } | { error: string }> {
  const ctx = await guardRead(coursId);
  if ('error' in ctx) return ctx;

  const { data, error } = await ctx.a
    .from('videos')
    .select('id, titre, bunny_video_id, order_index, support_path')
    .eq('cours_id', coursId)
    .eq('type', type)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) return { error: error.message };
  return { videos: (data ?? []) as VideoLibraryVideo[] };
}

/* ------------------------------------------------------------------ */
/*  Écriture                                                           */
/* ------------------------------------------------------------------ */

/**
 * Ajoute une vidéo (lien Bunny collé). Sans `position`, elle se range à la fin
 * de sa catégorie ; sinon elle s'insère à la place demandée (1 = en tête).
 */
export async function addVideoAction(input: {
  coursId: string;
  type: VideoType;
  titre: string;
  lien: string;
  position?: number | null;
}): Promise<AddResult> {
  const ctx = await guard(input.coursId);
  if ('error' in ctx) return ctx;
  return insertVideo(ctx, input);
}

export type AddResult = { ok: true; videoId: string; coursId: string } | { error: string };

/** Insertion effective, partagée par l'ajout normal et l'ajout « Révisions ». */
async function insertVideo(
  ctx: Ctx,
  input: { type: VideoType; titre: string; lien: string; position?: number | null },
): Promise<AddResult> {
  const coursId = ctx.cours.id;
  const titre = input.titre.trim().slice(0, 200);
  if (!titre) return { error: 'Donnez un titre à la vidéo.' };
  const bunnyId = extractBunnyVideoId(input.lien);
  if (!bunnyId) {
    return { error: 'Lien Bunny.net non reconnu. Collez le lien de la vidéo (ou son identifiant).' };
  }

  // Liste actuelle de la catégorie : sert à insérer à la position demandée et
  // à renuméroter proprement (les données antérieures peuvent avoir des trous).
  const { data: existing } = await ctx.a
    .from('videos')
    .select('id, order_index')
    .eq('cours_id', coursId)
    .eq('type', input.type)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true });
  const list = (existing ?? []) as { id: string; order_index: number }[];

  const wanted = input.position == null ? list.length : input.position - 1;
  const insertAt = Math.max(0, Math.min(list.length, wanted));

  const { data: created, error } = await ctx.a
    .from('videos')
    .insert({
      cours_id: coursId,
      titre,
      bunny_video_id: bunnyId,
      type: input.type,
      order_index: insertAt,
    })
    .select('id')
    .single();
  if (error) return { error: error.message };

  // Décale ce qui suit (et recompacte au passage).
  const reordered = [...list];
  reordered.splice(insertAt, 0, { id: created.id as string, order_index: insertAt });
  for (let i = 0; i < reordered.length; i++) {
    if (reordered[i].order_index !== i) {
      await ctx.a.from('videos').update({ order_index: i }).eq('id', reordered[i].id);
    }
  }

  await logAudit({
    actor: ctx.profile,
    action: 'create',
    entity: 'video',
    entityId: created.id as string,
    coursId: ctx.cours.id,
    coursTitre: ctx.cours.titre,
    matiereNom: ctx.cours.matiereNom,
    description: `Ajout de « ${titre} » (${LABEL[input.type]}) en position ${insertAt + 1}`,
    diff: { bunny_video_id: bunnyId, type: input.type, order_index: insertAt },
  });

  refresh(coursId);
  return { ok: true, videoId: created.id as string, coursId };
}

/**
 * Ajoute une vidéo à l'item « Révisions - <Collège> », en le CRÉANT s'il
 * n'existe pas encore (en tête du collège, comme les autres items de révisions).
 *
 * L'item n'est créé qu'au moment où on lui donne une première vidéo : on ne
 * laisse jamais traîner un item vide visible par les élèves.
 */
export async function addVideoToRevisionsAction(input: {
  matiereId: string;
  type: VideoType;
  titre: string;
  lien: string;
  position?: number | null;
}): Promise<AddResult> {
  const { profile, scope } = await requireContentEditor();
  try {
    assertCanWrite(scope, 'video');
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Permission insuffisante.' };
  }
  // Créer un item est une opération d'administrateur (un professeur n'agit que
  // sur les items déjà inscrits dans son périmètre).
  if (scope !== null) return { error: 'Seul un administrateur peut créer l’item de révisions.' };

  // Le lien est vérifié AVANT toute création : un lien invalide ne doit pas
  // laisser derrière lui un item vide.
  if (!extractBunnyVideoId(input.lien)) {
    return { error: 'Lien Bunny.net non reconnu. Collez le lien de la vidéo (ou son identifiant).' };
  }
  if (!input.titre.trim()) return { error: 'Donnez un titre à la vidéo.' };

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;

  const { data: matiere } = await a
    .from('matieres')
    .select('id, nom, parent_matiere_id')
    .eq('id', input.matiereId)
    .maybeSingle();
  if (!matiere) return { error: 'Collège introuvable.' };
  const nomCollege = (matiere as { nom: string }).nom;
  const titreItem = revisionsTitre(nomCollege);

  // Item existant ? (comparaison insensible à la casse, pour ne jamais créer
  // un doublon de « Révisions - Cardiologie »).
  const { data: dejaLa } = await a
    .from('cours')
    .select('id, titre')
    .eq('matiere_id', input.matiereId)
    .ilike('titre', titreItem)
    .limit(1)
    .maybeSingle();

  let coursId = (dejaLa as { id?: string } | null)?.id ?? null;

  if (!coursId) {
    // Décale les items existants : les révisions se placent en tête.
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
    const { data: cree, error } = await a
      .from('cours')
      .insert({ matiere_id: input.matiereId, titre: titreItem, order_index: 0 })
      .select('id')
      .single();
    if (error) return { error: error.message };
    coursId = cree.id as string;

    await logAudit({
      actor: profile,
      action: 'create',
      entity: 'cours',
      entityId: coursId,
      coursId,
      coursTitre: titreItem,
      matiereNom: nomCollege,
      description: `Création automatique de l’item « ${titreItem} » (ajout d’une vidéo)`,
      diff: { matiere_id: input.matiereId, order_index: 0 },
    });
    revalidatePath('/admin/contenu');
    revalidatePath('/facultes');
  }

  return insertVideo(
    {
      admin,
      a,
      profile,
      cours: { id: coursId, titre: titreItem, matiere_id: input.matiereId, matiereNom: nomCollege },
    },
    input,
  );
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
