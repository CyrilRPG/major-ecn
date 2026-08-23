'use server';
import { EDN_FACULTE_ID } from '@/lib/data/faculte';

import { revalidatePath } from 'next/cache';
import {
  assertCanWrite,
  profCanAccessCours,
  requireContentEditor,
} from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { extractBunnyVideoId } from '@/lib/bunny-link';
import { revisionsTitre } from '@/lib/videos/revisions';
import {
  normaliserOffres, normaliserVoies, resumeAudience, VIDEO_OFFERS,
} from '@/lib/videos/audience';
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

export type VideoSupportDoc = {
  id: string;
  titre: string;
  order_index: number;
  /** Permissions propres au support (NULL/[] = hérite de la vidéo). */
  voies: string[] | null;
  offers: string[] | null;
};

export type VideoLibraryVideo = {
  id: string;
  titre: string;
  bunny_video_id: string | null;
  order_index: number;
  /** Voies de concours concernées (les deux = aucune restriction). */
  voies: string[];
  /** Formules ayant accès à cette vidéo. */
  offers: string[];
  /** Élèves explicitement privés d'accès à cette séance (exclusion nominative). */
  denied_user_ids: string[];
  /** Élèves explicitement autorisés (accès nominatif contournant voie/formule/item). */
  allowed_user_ids: string[];
  /** Supports PDF de la vidéo, dans l'ordre d'affichage élève. */
  supports: VideoSupportDoc[];
};

/** Élève proposé dans le sélecteur d'exclusion d'une séance. */
export type StudentLite = {
  id: string;
  nom: string;
  email: string | null;
  promotion: string | null;
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
    .select('id, titre, bunny_video_id, order_index, voies, offers, denied_user_ids, allowed_user_ids, video_supports(id, titre, order_index, voies, offers)')
    .eq('cours_id', coursId)
    .eq('type', type)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) return { error: error.message };
  const videos = ((data ?? []) as Array<VideoLibraryVideo & { video_supports?: VideoSupportDoc[] | null }>)
    .map((v) => ({
      id: v.id,
      titre: v.titre,
      bunny_video_id: v.bunny_video_id,
      order_index: v.order_index,
      voies: normaliserVoies(v.voies),
      offers: normaliserOffres(v.offers),
      denied_user_ids: (v.denied_user_ids ?? []).filter((x): x is string => typeof x === 'string'),
      allowed_user_ids: (v.allowed_user_ids ?? []).filter((x): x is string => typeof x === 'string'),
      supports: (v.video_supports ?? [])
        .slice()
        .sort((a, b) => a.order_index - b.order_index)
        .map((s) => ({
          id: s.id,
          titre: s.titre,
          order_index: s.order_index,
          voies: s.voies && s.voies.length > 0 ? normaliserVoies(s.voies) : null,
          offers: s.offers && s.offers.length > 0 ? normaliserOffres(s.offers) : null,
        })),
    }));
  return { videos };
}

/**
 * Liste des élèves, pour le sélecteur d'exclusion d'une séance. Réservé à
 * l'administrateur : un professeur gère les vidéos de son périmètre mais n'a
 * pas à voir l'annuaire complet des élèves.
 */
export async function listStudentsAction(): Promise<{ students: StudentLite[] } | { error: string }> {
  const { scope } = await requireContentEditor();
  // scope === null ⇒ administrateur (les professeurs ont un scope non nul).
  if (scope !== null) return { error: 'Réservé à l’administrateur.' };
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('profiles')
    .select('id, first_name, last_name, email, promotion')
    .eq('role', 'student').eq('faculte_id', EDN_FACULTE_ID)
    .order('last_name', { ascending: true, nullsFirst: false })
    .order('first_name', { ascending: true, nullsFirst: false });
  if (error) return { error: error.message };
  const students = ((data ?? []) as { id: string; first_name: string | null; last_name: string | null; email: string | null; promotion: string | null }[])
    .map((s) => ({
      id: s.id,
      nom: `${s.first_name ?? ''} ${s.last_name ?? ''}`.trim() || (s.email ?? 'Élève sans nom'),
      email: s.email,
      promotion: s.promotion,
    }));
  return { students };
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
  voies?: string[];
  offers?: string[];
  deniedUserIds?: string[];
  allowedUserIds?: string[];
}): Promise<AddResult> {
  const ctx = await guard(input.coursId);
  if ('error' in ctx) return ctx;
  return insertVideo(ctx, input);
}

export type AddResult = { ok: true; videoId: string; coursId: string } | { error: string };

/** Normalise une liste d'IDs d'élèves (UUID, dédoublonnés). Sert autant à
 *  l'exclusion nominative (denied) qu'à l'autorisation nominative (allowed). */
function normaliserExclus(ids?: string[] | null): string[] {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return Array.from(new Set((ids ?? []).filter((x) => typeof x === 'string' && uuid.test(x))));
}

/** Audience par défaut d'un nouveau contenu, à l'identique de ce qui existait
 *  avant le ciblage par vidéo : cours vidéo → Formule Intensive, séance
 *  approfondie → Programme Approfondi. L'administrateur peut tout changer. */
const OFFRES_PAR_DEFAUT: Record<VideoType, string[]> = {
  cours: ['intensif'],
  seance_approfondie: ['approfondi'],
};

/** Valide voies + formules d'une vidéo. Au moins une case de chaque côté :
 *  sinon la vidéo serait invisible pour tout le monde (et la base la refuse). */
function validerAudience(
  type: VideoType,
  input: { voies?: string[]; offers?: string[] },
): { voies: string[]; offers: string[] } | { error: string } {
  const voies = normaliserVoies(input.voies);
  const offers = input.offers === undefined
    ? OFFRES_PAR_DEFAUT[type]
    : normaliserOffres(input.offers);
  if (offers.length === 0) {
    return { error: `Cochez au moins une formule (${VIDEO_OFFERS.map((o) => o.label).join(', ')}).` };
  }
  return { voies, offers };
}

/** Insertion effective, partagée par l'ajout normal et l'ajout « Révisions ». */
async function insertVideo(
  ctx: Ctx,
  input: {
    type: VideoType; titre: string; lien: string; position?: number | null;
    voies?: string[]; offers?: string[]; deniedUserIds?: string[]; allowedUserIds?: string[];
  },
): Promise<AddResult> {
  const coursId = ctx.cours.id;
  const titre = input.titre.trim().slice(0, 200);
  if (!titre) return { error: 'Donnez un titre à la vidéo.' };
  const bunnyId = extractBunnyVideoId(input.lien);
  if (!bunnyId) {
    return { error: 'Lien Bunny.net non reconnu. Collez le lien de la vidéo (ou son identifiant).' };
  }
  const audience = validerAudience(input.type, input);
  if ('error' in audience) return audience;
  const deniedUserIds = normaliserExclus(input.deniedUserIds);
  const allowedUserIds = normaliserExclus(input.allowedUserIds);

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
      voies: audience.voies,
      offers: audience.offers,
      denied_user_ids: deniedUserIds,
      allowed_user_ids: allowedUserIds,
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
    description: `Ajout de « ${titre} » (${LABEL[input.type]}) en position ${insertAt + 1}`
      + ` — ${resumeAudience(audience)}`
      + (deniedUserIds.length > 0 ? ` — ${deniedUserIds.length} élève(s) exclu(s)` : '')
      + (allowedUserIds.length > 0 ? ` — ${allowedUserIds.length} élève(s) autorisé(s)` : ''),
    diff: {
      bunny_video_id: bunnyId, type: input.type, order_index: insertAt,
      voies: audience.voies, offers: audience.offers,
      denied_user_ids: deniedUserIds, allowed_user_ids: allowedUserIds,
    },
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
  voies?: string[];
  offers?: string[];
  deniedUserIds?: string[];
  allowedUserIds?: string[];
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

/**
 * Change l'audience d'une vidéo : voies de concours et formules.
 *
 * Les supports de la vidéo suivent automatiquement — ils héritent de la
 * permission de leur vidéo, ici comme dans les pages élève et la route PDF.
 */
export async function updateVideoAudienceAction(input: {
  videoId: string;
  voies: string[];
  offers: string[];
  /** Élèves à exclure nominativement. Absent ⇒ la liste actuelle est conservée. */
  deniedUserIds?: string[];
  /** Élèves à autoriser nominativement. Absent ⇒ la liste actuelle est conservée. */
  allowedUserIds?: string[];
}): Promise<{ ok: true } | { error: string }> {
  const ctx = await guardVideo(input.videoId);
  if ('error' in ctx) return ctx;

  const audience = validerAudience(ctx.video.type, input);
  if ('error' in audience) return audience;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const patch: Record<string, any> = {
    voies: audience.voies, offers: audience.offers, updated_at: new Date().toISOString(),
  };
  const deniedUserIds = input.deniedUserIds !== undefined ? normaliserExclus(input.deniedUserIds) : undefined;
  if (deniedUserIds !== undefined) patch.denied_user_ids = deniedUserIds;
  const allowedUserIds = input.allowedUserIds !== undefined ? normaliserExclus(input.allowedUserIds) : undefined;
  if (allowedUserIds !== undefined) patch.allowed_user_ids = allowedUserIds;

  const { error } = await ctx.a.from('videos').update(patch).eq('id', input.videoId);
  if (error) return { error: error.message };

  await logAudit({
    actor: ctx.profile,
    action: 'update',
    entity: 'video',
    entityId: input.videoId,
    coursId: ctx.cours.id,
    coursTitre: ctx.cours.titre,
    matiereNom: ctx.cours.matiereNom,
    description: `Audience de « ${ctx.video.titre} » : ${resumeAudience(audience)}`
      + (deniedUserIds !== undefined
        ? deniedUserIds.length > 0 ? ` — ${deniedUserIds.length} élève(s) exclu(s)` : ' — aucune exclusion'
        : '')
      + (allowedUserIds !== undefined
        ? allowedUserIds.length > 0 ? ` — ${allowedUserIds.length} élève(s) autorisé(s)` : ' — aucune autorisation nominative'
        : ''),
    diff: {
      voies: audience.voies, offers: audience.offers,
      ...(deniedUserIds !== undefined ? { denied_user_ids: deniedUserIds } : {}),
      ...(allowedUserIds !== undefined ? { allowed_user_ids: allowedUserIds } : {}),
    },
  });

  refresh(ctx.cours.id);
  return { ok: true };
}

/**
 * Permissions PROPRES d'un support de séance.
 *
 * `differentes = false` ⇒ le support revient à l'héritage de sa vidéo (voies et
 * formules remises à NULL). `differentes = true` ⇒ il porte ses propres voies +
 * formules (au moins une case de chaque côté), qui priment pour CE support.
 */
export async function updateVideoSupportAudienceAction(input: {
  supportId: string;
  differentes: boolean;
  voies?: string[];
  offers?: string[];
}): Promise<{ ok: true } | { error: string }> {
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;
  const { data: doc } = await a
    .from('video_supports')
    .select('id, video_id, titre')
    .eq('id', input.supportId)
    .maybeSingle();
  if (!doc) return { error: 'Support introuvable.' };
  const ctx = await guardVideo((doc as { video_id: string }).video_id);
  if ('error' in ctx) return ctx;

  let voies: string[] | null = null;
  let offers: string[] | null = null;
  if (input.differentes) {
    const audience = validerAudience(ctx.video.type, { voies: input.voies, offers: input.offers });
    if ('error' in audience) return audience;
    voies = audience.voies;
    offers = audience.offers;
  }

  const { error } = await ctx.a
    .from('video_supports')
    .update({ voies, offers })
    .eq('id', input.supportId);
  if (error) return { error: error.message };

  await logAudit({
    actor: ctx.profile,
    action: 'update',
    entity: 'video',
    entityId: ctx.video.id,
    coursId: ctx.cours.id,
    coursTitre: ctx.cours.titre,
    matiereNom: ctx.cours.matiereNom,
    description: input.differentes
      ? `Permissions propres du support « ${(doc as { titre: string }).titre} » : ${resumeAudience({ voies, offers })}`
      : `Support « ${(doc as { titre: string }).titre} » : retour aux permissions de la vidéo`,
    diff: { voies, offers },
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

  // Retire les fichiers de tous ses supports (les lignes partent en cascade).
  const { data: docs } = await ctx.a
    .from('video_supports')
    .select('storage_path')
    .eq('video_id', input.videoId);
  const chemins = ((docs ?? []) as { storage_path: string }[]).map((d) => d.storage_path);
  if (ctx.video.support_path) chemins.push(ctx.video.support_path);
  if (chemins.length > 0) {
    await ctx.admin.storage.from('supports').remove(chemins);
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
    diff: { supports_supprimes: chemins.length },
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
 * Enregistre un support téléversé (le fichier est déposé directement depuis le
 * navigateur vers le bucket privé `supports`, comme les fiches : pas de limite
 * de taille de requête serveur). Une vidéo peut en porter plusieurs.
 */
export async function addVideoSupportAction(input: {
  videoId: string;
  path: string;
  titre?: string;
  fileName?: string;
}): Promise<{ ok: true; supportId: string } | { error: string }> {
  const ctx = await guardVideo(input.videoId);
  if ('error' in ctx) return ctx;

  // Le chemin doit appartenir à cet item : on ne fait jamais confiance au client.
  if (!input.path.startsWith(`${ctx.cours.id}/`)) {
    return { error: 'Chemin de support invalide.' };
  }

  const titre = (input.titre ?? input.fileName ?? 'Support')
    .replace(/\.pdf$/i, '')
    .trim()
    .slice(0, 200) || 'Support';

  const { data: derniers } = await ctx.a
    .from('video_supports')
    .select('order_index')
    .eq('video_id', input.videoId)
    .order('order_index', { ascending: false })
    .limit(1)
    .maybeSingle();
  const rang = ((derniers?.order_index as number | undefined) ?? -1) + 1;

  const { data: cree, error } = await ctx.a
    .from('video_supports')
    .insert({ video_id: input.videoId, titre, storage_path: input.path, order_index: rang })
    .select('id')
    .single();
  if (error) return { error: error.message };

  await logAudit({
    actor: ctx.profile,
    action: 'create',
    entity: 'video',
    entityId: input.videoId,
    coursId: ctx.cours.id,
    coursTitre: ctx.cours.titre,
    matiereNom: ctx.cours.matiereNom,
    description: `Support « ${titre} » ajouté à « ${ctx.video.titre} »`,
    diff: { storage_path: input.path },
  });

  refresh(ctx.cours.id);
  return { ok: true, supportId: cree.id as string };
}

/** Renomme un support (le nom est affiché à l'élève). */
export async function renameVideoSupportAction(input: {
  supportId: string;
  titre: string;
}): Promise<{ ok: true } | { error: string }> {
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;
  const { data: doc } = await a
    .from('video_supports')
    .select('id, video_id, titre')
    .eq('id', input.supportId)
    .maybeSingle();
  if (!doc) return { error: 'Support introuvable.' };
  const ctx = await guardVideo((doc as { video_id: string }).video_id);
  if ('error' in ctx) return ctx;

  const titre = input.titre.trim().slice(0, 200);
  if (!titre) return { error: 'Le nom ne peut pas être vide.' };

  const { error } = await ctx.a.from('video_supports').update({ titre }).eq('id', input.supportId);
  if (error) return { error: error.message };

  await logAudit({
    actor: ctx.profile,
    action: 'update',
    entity: 'video',
    entityId: ctx.video.id,
    coursId: ctx.cours.id,
    coursTitre: ctx.cours.titre,
    matiereNom: ctx.cours.matiereNom,
    description: `Support renommé : « ${(doc as { titre: string }).titre} » → « ${titre} »`,
  });

  refresh(ctx.cours.id);
  return { ok: true };
}

/** Retire un support (fichier compris). */
export async function removeVideoSupportAction(input: {
  supportId: string;
}): Promise<{ ok: true } | { error: string }> {
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;
  const { data: doc } = await a
    .from('video_supports')
    .select('id, video_id, titre, storage_path')
    .eq('id', input.supportId)
    .maybeSingle();
  if (!doc) return { ok: true };
  const support = doc as { id: string; video_id: string; titre: string; storage_path: string };
  const ctx = await guardVideo(support.video_id);
  if ('error' in ctx) return ctx;

  await ctx.admin.storage.from('supports').remove([support.storage_path]);
  const { error } = await ctx.a.from('video_supports').delete().eq('id', support.id);
  if (error) return { error: error.message };

  await logAudit({
    actor: ctx.profile,
    action: 'delete',
    entity: 'video',
    entityId: ctx.video.id,
    coursId: ctx.cours.id,
    coursTitre: ctx.cours.titre,
    matiereNom: ctx.cours.matiereNom,
    description: `Support « ${support.titre} » retiré de « ${ctx.video.titre} »`,
  });

  refresh(ctx.cours.id);
  return { ok: true };
}

/** Déplace un support d'un cran vers le haut ou vers le bas. */
export async function moveVideoSupportAction(input: {
  supportId: string;
  direction: 'up' | 'down';
}): Promise<{ ok: true } | { error: string }> {
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;
  const { data: doc } = await a
    .from('video_supports')
    .select('id, video_id, titre, order_index')
    .eq('id', input.supportId)
    .maybeSingle();
  if (!doc) return { error: 'Support introuvable.' };
  const support = doc as { id: string; video_id: string; titre: string; order_index: number };
  const ctx = await guardVideo(support.video_id);
  if ('error' in ctx) return ctx;

  const { data: rows } = await ctx.a
    .from('video_supports')
    .select('id, order_index')
    .eq('video_id', support.video_id)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true });
  const list = (rows ?? []) as { id: string; order_index: number }[];
  const pos = list.findIndex((s) => s.id === input.supportId);
  if (pos === -1) return { error: 'Support introuvable dans la liste.' };
  const target = input.direction === 'up' ? pos - 1 : pos + 1;
  if (target < 0 || target >= list.length) return { ok: true };

  const reordered = [...list];
  const [moved] = reordered.splice(pos, 1);
  reordered.splice(target, 0, moved);
  for (let i = 0; i < reordered.length; i++) {
    if (reordered[i].order_index !== i) {
      await ctx.a.from('video_supports').update({ order_index: i }).eq('id', reordered[i].id);
    }
  }

  await logAudit({
    actor: ctx.profile,
    action: 'update',
    entity: 'video',
    entityId: ctx.video.id,
    coursId: ctx.cours.id,
    coursTitre: ctx.cours.titre,
    matiereNom: ctx.cours.matiereNom,
    description: `Ordre du support « ${support.titre} » : position ${pos + 1} → ${target + 1}`,
    diff: { de: pos + 1, vers: target + 1 },
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
