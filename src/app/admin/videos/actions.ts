'use server';
import { EDN_FACULTE_ID } from '@/lib/data/faculte';

import { revalidatePath } from 'next/cache';
import {
  assertCanWrite,
  peutCreerItemRevisions,
  profCanAccessCours,
  requireContentEditor,
} from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { extractBunnyVideoId } from '@/lib/bunny-link';
import { estItemRevisions, porteItemRevisions, revisionsTitre } from '@/lib/videos/revisions';
import {
  normaliserOffres, normaliserVoies, resumeAudience, VIDEO_OFFERS,
} from '@/lib/videos/audience';
import { normaliserRubrique, rubriqueParDefaut } from '@/lib/videos/rubriques';
import {
  erreurColonneLiveAt, estSeanceAVenir, formaterDateSeance, MIGRATION_SEANCE_A_VENIR, normaliserDateSeance,
} from '@/lib/videos/a-venir';
import { logAudit } from '@/lib/audit/log';
import { accesOnglets, lireScopeEquipe, peutContenu, type DroitContenu } from '@/lib/auth/collaborateurs';
import { bunnyEmbedLibraryId, bunnyEmbedUrl } from '@/lib/bunny';
import { dureeIsoEnSecondes } from '@/lib/videos/bibliotheque';
import { deplacerElement, ecrituresOrdre, elementDeplace, memesIdentifiants } from '@/lib/videos/ordre';

/**
 * Bibliothèque vidéo de l'administration (onglet « Vidéos ») : navigation
 * collège → sous-collège → item → catégorie, puis ajout, ordre, renommage,
 * remplacement du lien Bunny, suppression et support de séance.
 *
 * « Séance à venir » : une entrée peut être créée SANS lien Bunny, pour mettre
 * en ligne les dossiers à préparer avant une séance en direct (date
 * facultative, `live_at`). Le lien se colle ensuite depuis le crayon, sur la
 * même entrée : ses supports restent attachés (cf. lib/videos/a-venir.ts).
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

/**
 * Droit fin du cahier des charges (18/09/2026, §5) sur les vidéos : créer /
 * modifier / publier / supprimer. L'administrateur a tout ; un membre du
 * personnel suit son module « Contenus » (un professeur historique y a tous
 * les droits, comme avant).
 */
function droitVideo(profile: Ctx['profile'], droit: DroitContenu): boolean {
  if (profile.role === 'admin') return true;
  return peutContenu(lireScopeEquipe(profile.permission_scope), droit, 'video');
}

const REFUS_DROIT: Record<DroitContenu, string> = {
  creer: 'Votre accès ne permet pas de déposer une vidéo.',
  modifier: 'Votre accès ne permet pas de modifier les vidéos.',
  publier: 'Votre accès ne permet pas de publier : la vidéo reste « À valider ».',
  supprimer: 'Votre accès ne permet pas de supprimer une vidéo.',
};

/** Contrôles communs : éditeur de contenu, droit d'écriture vidéo, droit fin, périmètre. */
async function guard(coursId: string, droit: DroitContenu = 'modifier'): Promise<Ctx | { error: string }> {
  const { profile, scope } = await requireContentEditor();
  try {
    assertCanWrite(scope, 'video');
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Permission insuffisante.' };
  }
  if (!droitVideo(profile, droit)) return { error: REFUS_DROIT[droit] };
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

/**
 * Consultation de la bibliothèque : même règle que l'onglet « Vidéos »
 * (`requireOnglet('videos')` de la page) — un collaborateur sans le type
 * « vidéo » n'a pas à lister les vidéos, même en appelant l'action à la main.
 */
function lectureVideosAutorisee(profile: Ctx['profile']): boolean {
  if (profile.role === 'admin') return true;
  return accesOnglets(lireScopeEquipe(profile.permission_scope)).videos;
}
const REFUS_LECTURE = 'Votre accès ne comprend pas les vidéos.';

/** Contrôles de LECTURE seule (consultation de la bibliothèque). */
async function guardRead(coursId: string): Promise<Ctx | { error: string }> {
  const { profile, scope } = await requireContentEditor();
  if (!lectureVideosAutorisee(profile)) return { error: REFUS_LECTURE };
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
async function guardVideo(videoId: string, droit: DroitContenu = 'modifier') {
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (admin as any)
    .from('videos')
    .select('id, cours_id, titre, type, rubrique, order_index, support_path, status, publish_at, bunny_video_id, storage_path')
    .eq('id', videoId)
    .maybeSingle();
  if (!data) return { error: 'Vidéo introuvable.' as const };
  const video = data as {
    id: string; cours_id: string; titre: string; type: VideoType; rubrique: string | null;
    order_index: number; support_path: string | null; status: 'publie' | 'a_valider' | null; publish_at: string | null;
    bunny_video_id: string | null; storage_path: string | null;
  };
  const ctx = await guard(video.cours_id, droit);
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
  /** Séance à venir : ni lien Bunny ni fichier — seulement des dossiers à préparer. */
  a_venir: boolean;
  /** Date de la séance en direct (facultative). */
  live_at: string | null;
  order_index: number;
  /** « À valider » tant qu'une personne habilitée n'a pas publié (cahier §5). */
  status: 'publie' | 'a_valider';
  /** Publication programmée : invisible des élèves avant cette date. */
  publish_at: string | null;
  /** Intitulé de rubrique affiché à l'élève (NULL = libellé par défaut du type). */
  rubrique: string | null;
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
  const { profile, scope } = await requireContentEditor();
  if (!lectureVideosAutorisee(profile)) return { error: REFUS_LECTURE };
  // Collège hors périmètre : refus explicite (le sélecteur ne le propose pas).
  if (scope !== null && scope.type !== 'all' && !scope.colleges.includes(matiereId)) {
    return { error: 'Ce collège ne fait pas partie de votre périmètre.' };
  }
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

  const lire = (colonnes: string) => ctx.a
    .from('videos')
    .select(`id, titre, bunny_video_id, storage_path, ${colonnes}order_index, rubrique, voies, offers, denied_user_ids, allowed_user_ids, status, publish_at, video_supports(id, titre, order_index, voies, offers)`)
    .eq('cours_id', coursId)
    .eq('type', type)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true });
  // `live_at` n'existe qu'après la migration « séance à venir » : sans elle, on
  // relit sans la date plutôt que de vider la bibliothèque.
  let res = await lire('live_at, ');
  if (erreurColonneLiveAt(res.error)) res = await lire('');
  const { data, error } = res;
  if (error) return { error: error.message };
  type Ligne = Omit<VideoLibraryVideo, 'a_venir' | 'live_at' | 'supports'> & {
    storage_path: string | null;
    live_at?: string | null;
    video_supports?: VideoSupportDoc[] | null;
  };
  const videos = ((data ?? []) as Ligne[])
    .map((v) => ({
      id: v.id,
      titre: v.titre,
      bunny_video_id: v.bunny_video_id,
      a_venir: estSeanceAVenir(v),
      live_at: v.live_at ?? null,
      order_index: v.order_index,
      status: v.status === 'a_valider' ? 'a_valider' as const : 'publie' as const,
      publish_at: v.publish_at ?? null,
      rubrique: normaliserRubrique(v.rubrique),
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
  /** Lien Bunny ; facultatif pour une séance à venir (`aVenir`). */
  lien?: string | null;
  /** Séance à venir : création sans vidéo, pour déposer les dossiers d'abord. */
  aVenir?: boolean;
  /** Date de la séance en direct (ISO), facultative. */
  liveAt?: string | null;
  position?: number | null;
  /** Rubrique affichée à l'élève ; vide ⇒ libellé par défaut du type. */
  rubrique?: string | null;
  voies?: string[];
  offers?: string[];
  deniedUserIds?: string[];
  allowedUserIds?: string[];
}): Promise<AddResult> {
  const ctx = await guard(input.coursId, 'creer');
  if ('error' in ctx) return ctx;
  return insertVideo(ctx, input);
}

export type AddResult = { ok: true; videoId: string; coursId: string; status: 'publie' | 'a_valider' } | { error: string };

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

type SourceVideo = { bunnyId: string | null; liveAt: string | null };

/**
 * Vérifie la source d'un ajout : un lien Bunny reconnu, OU rien du tout pour
 * une séance à venir (case cochée). Un lien saisi est toujours validé, même
 * sur une séance à venir : il en fait simplement une vidéo ordinaire.
 */
function validerSource(input: { lien?: string | null; aVenir?: boolean; liveAt?: string | null }): SourceVideo | { error: string } {
  const lien = (input.lien ?? '').trim();
  const date = normaliserDateSeance(input.liveAt);
  if ('error' in date) return date;
  if (!lien) {
    if (input.aVenir) return { bunnyId: null, liveAt: date.liveAt };
    return { error: 'Collez le lien Bunny.net de la vidéo, ou cochez « Séance à venir » pour déposer les dossiers d’abord.' };
  }
  const bunnyId = extractBunnyVideoId(lien);
  if (!bunnyId) {
    return { error: 'Lien Bunny.net non reconnu. Collez le lien de la vidéo (ou son identifiant).' };
  }
  return { bunnyId, liveAt: date.liveAt };
}

/** Message clair quand la colonne `live_at` manque (migration non appliquée). */
function erreurLiveAt(error: { message?: string | null }): { error: string } {
  return erreurColonneLiveAt(error)
    ? { error: `La date de séance nécessite la migration ${MIGRATION_SEANCE_A_VENIR} (éditeur SQL Supabase). Réessayez sans date, ou appliquez-la d’abord.` }
    : { error: error.message ?? 'Erreur inconnue.' };
}

/** Insertion effective, partagée par l'ajout normal et l'ajout « Révisions ». */
async function insertVideo(
  ctx: Ctx,
  input: {
    type: VideoType; titre: string; lien?: string | null; aVenir?: boolean; liveAt?: string | null;
    position?: number | null; rubrique?: string | null;
    voies?: string[]; offers?: string[]; deniedUserIds?: string[]; allowedUserIds?: string[];
  },
): Promise<AddResult> {
  const coursId = ctx.cours.id;
  const titre = input.titre.trim().slice(0, 200);
  if (!titre) return { error: 'Donnez un titre à la vidéo.' };
  const rubrique = normaliserRubrique(input.rubrique);
  const source = validerSource(input);
  if ('error' in source) return source;
  const { bunnyId, liveAt } = source;
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

  // Cahier des charges §5 : sans le droit « Publier », le dépôt reste
  // « À valider » — invisible des élèves jusqu'à ce qu'une personne habilitée
  // le publie.
  const publie = droitVideo(ctx.profile, 'publier');
  const maintenant = new Date().toISOString();
  const { data: created, error } = await ctx.a
    .from('videos')
    .insert({
      cours_id: coursId,
      titre,
      bunny_video_id: bunnyId,
      // Colonne ajoutée par la migration « séance à venir » : citée seulement
      // quand une date est saisie, pour que l'ajout ordinaire marche sans elle.
      ...(liveAt ? { live_at: liveAt } : {}),
      type: input.type,
      rubrique,
      order_index: insertAt,
      voies: audience.voies,
      offers: audience.offers,
      denied_user_ids: deniedUserIds,
      allowed_user_ids: allowedUserIds,
      status: publie ? 'publie' : 'a_valider',
      created_by: ctx.profile.id,
      published_by: publie ? ctx.profile.id : null,
      published_at: publie ? maintenant : null,
    })
    .select('id')
    .single();
  if (error) return erreurLiveAt(error);

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
      + (bunnyId ? '' : ` — séance à venir, sans vidéo${liveAt ? ` (le ${formaterDateSeance(liveAt)})` : ''}`)
      + ` — ${resumeAudience(audience)}`
      + (rubrique ? ` — rubrique « ${rubrique} »` : '')
      + (deniedUserIds.length > 0 ? ` — ${deniedUserIds.length} élève(s) exclu(s)` : '')
      + (allowedUserIds.length > 0 ? ` — ${allowedUserIds.length} élève(s) autorisé(s)` : ''),
    diff: {
      bunny_video_id: bunnyId, live_at: liveAt, type: input.type, rubrique, order_index: insertAt,
      voies: audience.voies, offers: audience.offers,
      denied_user_ids: deniedUserIds, allowed_user_ids: allowedUserIds,
    },
  });

  refresh(coursId);
  return { ok: true, videoId: created.id as string, coursId, status: publie ? 'publie' : 'a_valider' };
}

/**
 * Ajoute une vidéo à l'item « Replays - Révisions », en le CRÉANT s'il
 * n'existe pas encore (en tête du collège, comme les autres items de révisions).
 *
 * L'item n'est créé qu'au moment où on lui donne une première vidéo : on ne
 * laisse jamais traîner un item vide visible par les élèves.
 */
export async function addVideoToRevisionsAction(input: {
  matiereId: string;
  type: VideoType;
  titre: string;
  lien?: string | null;
  aVenir?: boolean;
  liveAt?: string | null;
  position?: number | null;
  rubrique?: string | null;
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
  // L'item de révisions n'est qu'un conteneur de vidéos : le créer fait partie
  // de la mission de quiconque peut DÉPOSER une vidéo (monteur vidéo compris),
  // pourvu que le collège soit dans son périmètre. Un compte restreint à
  // quelques items précis (`scope.cours`) ne crée rien : ses items sont fixés.
  if (!droitVideo(profile, 'creer')) return { error: REFUS_DROIT.creer };
  if (scope !== null && !peutCreerItemRevisions(scope, input.matiereId)) {
    return {
      error: scope.type === 'college' && scope.cours && scope.cours.length > 0
        ? 'Votre accès est limité à des items précis : demandez à un administrateur de créer l’item de révisions.'
        : 'Ce collège ne fait pas partie de votre périmètre. Un administrateur peut l’y ajouter (Équipe & Permissions).',
    };
  }

  // Le lien est vérifié AVANT toute création : un lien invalide ne doit pas
  // laisser derrière lui un item vide. (Une séance à venir n'en a pas.)
  const source = validerSource(input);
  if ('error' in source) return source;
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
  // Même règle que la bibliothèque : un seul item de révisions par collège, à
  // son niveau (sauf Médecine générale : un par sous-collège). Jamais de
  // second item dans un sous-collège d'Odontologie ou d'Imagerie.
  const parentId = (matiere as { parent_matiere_id: string | null }).parent_matiere_id;
  const { count: nbEnfants } = parentId
    ? { count: 1 }
    : await a.from('matieres').select('id', { count: 'exact', head: true }).eq('parent_matiere_id', input.matiereId);
  if (!porteItemRevisions(parentId ?? input.matiereId, input.matiereId, (nbEnfants ?? 0) > 0)) {
    return { error: 'L’item « Replays - Révisions » de ce collège se crée au niveau du collège (« items du collège »), pas dans un sous-collège.' };
  }
  const titreItem = revisionsTitre(nomCollege);

  // Item existant ? (nouveau libellé « Replays - Révisions » OU ancien
  // « Révisions - <Collège> », comparaison tolérante : jamais de doublon).
  const { data: existants } = await a
    .from('cours')
    .select('id, titre')
    .eq('matiere_id', input.matiereId);
  const dejaLa = ((existants ?? []) as { id: string; titre: string }[]).find((c) => estItemRevisions(c.titre, nomCollege)) ?? null;

  let coursId = dejaLa?.id ?? null;

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
/**
 * Renomme la rubrique (titre de section côté élève) de toutes les vidéos d'un
 * type pour un item — appelé depuis le crayon de la vue étudiant. Libellé vide
 * ⇒ NULL ⇒ libellé par défaut du type (« Séance intensive »…).
 */
export async function renameRubriqueAction(input: {
  coursId: string;
  type: 'cours' | 'seance_approfondie';
  rubrique: string;
}): Promise<{ ok: true; videos: number } | { error: string }> {
  const ctx = await guard(input.coursId);
  if ('error' in ctx) return ctx;
  if (input.type !== 'cours' && input.type !== 'seance_approfondie') return { error: 'Type de vidéo inconnu.' };
  const rubrique = normaliserRubrique(input.rubrique);
  const { data, error } = await ctx.a
    .from('videos')
    .update({ rubrique, updated_at: new Date().toISOString() })
    .eq('cours_id', input.coursId)
    .eq('type', input.type)
    .select('id');
  if (error) return { error: error.message };
  const videos = (data ?? []).length;
  if (videos === 0) return { error: 'Aucune vidéo de ce type sur cet item : ajoutez d’abord une vidéo pour nommer sa rubrique.' };
  await logAudit({
    actor: ctx.profile,
    action: 'update',
    entity: 'video',
    entityId: input.coursId,
    coursId: ctx.cours.id,
    coursTitre: ctx.cours.titre,
    matiereNom: ctx.cours.matiereNom,
    description: `Rubrique ${input.type === 'cours' ? 'Séance intensive' : 'Séances approfondies'} renommée « ${rubrique ?? rubriqueParDefaut(input.type)} » (${videos} vidéo(s))`,
    diff: { type: input.type, to: rubrique },
  });
  refresh(input.coursId);
  revalidatePath(`/cours/${input.coursId}`);
  revalidatePath(`/cours/${input.coursId}/video`);
  revalidatePath(`/cours/${input.coursId}/seance-approfondie`);
  return { ok: true, videos };
}

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
 * Change la rubrique d'une vidéo (titre de section dans l'espace élève).
 * Vide ⇒ retour au libellé par défaut du type.
 */
export async function updateVideoRubriqueAction(input: {
  videoId: string;
  rubrique: string | null;
}): Promise<{ ok: true } | { error: string }> {
  const ctx = await guardVideo(input.videoId);
  if ('error' in ctx) return ctx;
  const rubrique = normaliserRubrique(input.rubrique);
  const avant = normaliserRubrique(ctx.video.rubrique);
  if (rubrique === avant) return { ok: true };

  const { error } = await ctx.a
    .from('videos')
    .update({ rubrique, updated_at: new Date().toISOString() })
    .eq('id', input.videoId);
  if (error) return { error: error.message };

  const libelle = (r: string | null) => r ?? `${rubriqueParDefaut(ctx.video.type)} (par défaut)`;
  await logAudit({
    actor: ctx.profile,
    action: 'update',
    entity: 'video',
    entityId: input.videoId,
    coursId: ctx.cours.id,
    coursTitre: ctx.cours.titre,
    matiereNom: ctx.cours.matiereNom,
    description: `Rubrique de « ${ctx.video.titre} » : « ${libelle(avant)} » → « ${libelle(rubrique)} »`,
    diff: { from: avant, to: rubrique },
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

  // Séance à venir complétée : la vidéo rejoint ses dossiers, déjà en ligne.
  const completee = estSeanceAVenir(ctx.video);
  await logAudit({
    actor: ctx.profile,
    action: 'replace',
    entity: 'video',
    entityId: input.videoId,
    coursId: ctx.cours.id,
    coursTitre: ctx.cours.titre,
    matiereNom: ctx.cours.matiereNom,
    description: completee
      ? `Vidéo ajoutée à la séance à venir « ${ctx.video.titre} »`
      : `Nouvelle vidéo pour « ${ctx.video.titre} »`,
    diff: { bunny_video_id: bunnyId },
  });

  refresh(ctx.cours.id);
  return { ok: true };
}

/** Date de la séance en direct d'une séance à venir (vide ⇒ retirée). */
export async function updateVideoLiveAtAction(input: {
  videoId: string;
  liveAt: string | null;
}): Promise<{ ok: true } | { error: string }> {
  const ctx = await guardVideo(input.videoId);
  if ('error' in ctx) return ctx;
  const date = normaliserDateSeance(input.liveAt);
  if ('error' in date) return date;

  const { error } = await ctx.a
    .from('videos')
    .update({ live_at: date.liveAt, updated_at: new Date().toISOString() })
    .eq('id', input.videoId);
  if (error) return erreurLiveAt(error);

  await logAudit({
    actor: ctx.profile,
    action: 'update',
    entity: 'video',
    entityId: input.videoId,
    coursId: ctx.cours.id,
    coursTitre: ctx.cours.titre,
    matiereNom: ctx.cours.matiereNom,
    description: date.liveAt
      ? `Date de la séance « ${ctx.video.titre} » : le ${formaterDateSeance(date.liveAt)}`
      : `Date de la séance « ${ctx.video.titre} » retirée`,
    diff: { live_at: date.liveAt },
  });

  refresh(ctx.cours.id);
  return { ok: true };
}

/** Supprime la vidéo (et son support éventuel). */
export async function deleteVideoAction(input: {
  videoId: string;
}): Promise<{ ok: true } | { error: string }> {
  const ctx = await guardVideo(input.videoId, 'supprimer');
  if ('error' in ctx) return ctx;

  const res = await supprimerVideo(ctx, ctx.video, ctx.cours);
  if ('error' in res) return res;

  // Renumérote la liste pour éviter les trous.
  await renumber(ctx.a, ctx.cours.id, ctx.video.type);
  refresh(ctx.cours.id);
  return { ok: true };
}

type VideoASupprimer = { id: string; titre: string; type: VideoType; support_path: string | null };

/**
 * Suppression effective d'une séance/vidéo, APRÈS contrôle des droits : ses
 * supports (fichiers du bucket `supports` compris — les lignes partent en
 * cascade), puis la vidéo, puis le journal d'audit. La vidéo hébergée sur
 * bunny.net n'est pas touchée. Ne renumérote pas : l'appelant le fait une
 * fois par liste (suppression unitaire ou par lot).
 */
async function supprimerVideo(
  ctx: Pick<Ctx, 'a' | 'admin' | 'profile'>,
  video: VideoASupprimer,
  cours: Ctx['cours'],
  contexte?: string,
): Promise<{ ok: true } | { error: string }> {
  const { data: docs } = await ctx.a
    .from('video_supports')
    .select('storage_path')
    .eq('video_id', video.id);
  const chemins = ((docs ?? []) as { storage_path: string | null }[])
    .map((d) => d.storage_path)
    .filter((p): p is string => !!p);
  if (video.support_path) chemins.push(video.support_path);
  if (chemins.length > 0) {
    await ctx.admin.storage.from('supports').remove(chemins);
  }
  const { error } = await ctx.a.from('videos').delete().eq('id', video.id);
  if (error) return { error: error.message };

  await logAudit({
    actor: ctx.profile,
    action: 'delete',
    entity: 'video',
    entityId: video.id,
    coursId: cours.id,
    coursTitre: cours.titre,
    matiereNom: cours.matiereNom,
    description: `Suppression de « ${video.titre} » (${LABEL[video.type]})${contexte ? ` — ${contexte}` : ''}`,
    diff: { supports_supprimes: chemins.length },
  });
  return { ok: true };
}

/** Plafond d'une suppression groupée (une liste d'item dépasse rarement 60 séances). */
const LOT_MAX = 200;

export type DeleteVideosResult =
  | { ok: true; supprimees: string[]; refus: { id: string; titre: string | null; error: string }[] }
  | { error: string };

/**
 * Suppression GROUPÉE (cases à cocher de la liste) : chaque vidéo passe les
 * mêmes contrôles que la suppression unitaire — droit « supprimer » sur le
 * type vidéo ET item dans le périmètre de la personne —, puis la même
 * suppression (supports et fichiers compris), une entrée de journal par
 * vidéo. Les vidéos refusées sont renvoyées avec leur motif ; les autres
 * partent. Les listes touchées sont renumérotées une seule fois chacune.
 */
export async function deleteVideosAction(input: {
  videoIds: string[];
}): Promise<DeleteVideosResult> {
  const { profile, scope } = await requireContentEditor();
  try {
    assertCanWrite(scope, 'video');
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Permission insuffisante.' };
  }
  if (!droitVideo(profile, 'supprimer')) return { error: REFUS_DROIT.supprimer };

  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const ids = Array.from(new Set((input.videoIds ?? []).filter((x) => typeof x === 'string' && uuid.test(x))));
  if (ids.length === 0) return { error: 'Aucune vidéo sélectionnée.' };
  if (ids.length > LOT_MAX) return { error: `Sélectionnez au plus ${LOT_MAX} vidéos à la fois.` };

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;
  const { data: vids, error: errVids } = await a
    .from('videos')
    .select('id, cours_id, titre, type, support_path')
    .in('id', ids);
  if (errVids) return { error: errVids.message };
  const videos = (vids ?? []) as (VideoASupprimer & { cours_id: string })[];

  const coursIds = Array.from(new Set(videos.map((v) => v.cours_id)));
  const { data: coursRows, error: errCours } = coursIds.length > 0
    ? await a.from('cours').select('id, titre, matiere_id, matieres(nom)').in('id', coursIds)
    : { data: [], error: null };
  if (errCours) return { error: errCours.message };
  const coursParId = new Map<string, Ctx['cours']>(
    ((coursRows ?? []) as { id: string; titre: string; matiere_id: string; matieres?: { nom?: string } | null }[])
      .map((c) => [c.id, { id: c.id, titre: c.titre, matiere_id: c.matiere_id, matiereNom: c.matieres?.nom ?? null }]),
  );

  const supprimees: string[] = [];
  const refus: { id: string; titre: string | null; error: string }[] = [];
  const listesTouchees = new Map<string, { coursId: string; type: VideoType }>();
  const contexte = ids.length > 1 ? `suppression groupée (${ids.length} sélectionnées)` : undefined;

  for (const id of ids) {
    const video = videos.find((v) => v.id === id);
    // Déjà supprimée (autre onglet, double clic) : le but est atteint.
    if (!video) { supprimees.push(id); continue; }
    const cours = coursParId.get(video.cours_id);
    if (!cours) { refus.push({ id, titre: video.titre, error: 'Item introuvable.' }); continue; }
    // Périmètre vérifié pour CHAQUE vidéo : une sélection ne contourne rien.
    if (!profCanAccessCours(scope, cours.matiere_id, cours.id)) {
      refus.push({ id, titre: video.titre, error: 'Accès refusé à cet item.' });
      continue;
    }
    const res = await supprimerVideo({ a, admin, profile }, video, cours, contexte);
    if ('error' in res) { refus.push({ id, titre: video.titre, error: res.error }); continue; }
    supprimees.push(id);
    listesTouchees.set(`${cours.id}|${video.type}`, { coursId: cours.id, type: video.type });
  }

  for (const { coursId, type } of listesTouchees.values()) {
    await renumber(a, coursId, type);
    refresh(coursId);
  }
  return { ok: true, supprimees, refus };
}

/* ------------------------------------------------------------------ */
/*  Aperçu d'un lien Bunny (avant enregistrement)                      */
/* ------------------------------------------------------------------ */

export type ApercuBunny = {
  videoId: string;
  /** URL d'embed que liront les élèves (bibliothèque de la plateforme, signée si besoin). */
  embedUrl: string;
  /** Titre du fichier sur bunny.net, quand la page publique d'embed le donne. */
  titre: string | null;
  dureeSecondes: number | null;
  /** true : bunny.net ne connaît pas cette vidéo dans la bibliothèque de la plateforme. */
  introuvable: boolean;
  /** Bibliothèque citée dans le lien collé, si elle diffère de celle de la plateforme. */
  autreBibliotheque: string | null;
  bibliotheque: string;
};

/**
 * Aperçu d'un lien collé : l'iframe que verront les élèves + le titre et la
 * durée lus sur la page PUBLIQUE d'embed de bunny.net (données JSON-LD), sans
 * clé d'API — la lecture ne doit jamais dépendre de la configuration serveur
 * (repli de bibliothèque 691475, cf. lib/bunny). Rien n'est écrit.
 */
export async function apercuLienBunnyAction(lien: string): Promise<ApercuBunny | { error: string }> {
  const { profile } = await requireContentEditor();
  if (!lectureVideosAutorisee(profile)) return { error: REFUS_LECTURE };
  const brut = (lien ?? '').trim().slice(0, 2000);
  const videoId = extractBunnyVideoId(brut);
  if (!videoId) return { error: 'Lien Bunny.net non reconnu. Collez le lien de la vidéo (ou son identifiant).' };

  const bibliotheque = bunnyEmbedLibraryId();
  const citee = /(?:embed|play|stream|library)\/(\d{3,})(?:\/|\b)/i.exec(brut)?.[1] ?? null;
  const autreBibliotheque = citee && citee !== bibliotheque ? citee : null;
  // Aperçu : pas de préchargement (la vidéo ne part qu'au clic sur lecture).
  const embedUrl = bunnyEmbedUrl(videoId, { libraryId: bibliotheque }).replace('preload=true', 'preload=false');

  let titre: string | null = null;
  let dureeSecondes: number | null = null;
  let introuvable = false;
  try {
    const res = await fetch(`https://iframe.mediadelivery.net/embed/${bibliotheque}/${videoId}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(6000),
    });
    const html = res.ok ? await res.text() : '';
    const ld = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/i.exec(html)?.[1];
    if (ld) {
      const d = JSON.parse(ld) as { name?: unknown; duration?: unknown };
      titre = typeof d.name === 'string' && d.name.trim() ? d.name.trim().slice(0, 300) : null;
      dureeSecondes = dureeIsoEnSecondes(typeof d.duration === 'string' ? d.duration : null);
    } else {
      // Page d'erreur de bunny.net (« 404 ») : la vidéo n'existe pas dans
      // cette bibliothèque — l'élève verrait la même erreur.
      introuvable = res.status === 404 || /<title>\s*404\s*<\/title>/i.test(html);
    }
  } catch {
    // Réseau indisponible : l'iframe reste le juge, sans titre ni durée.
  }
  return { videoId, embedUrl, titre, dureeSecondes, introuvable, autreBibliotheque, bibliotheque };
}

/**
 * Publie une vidéo « À valider » (cahier §5) — tout de suite, ou à une date
 * programmée (`publishAt`, ISO) : la vidéo reste invisible des élèves jusque-là.
 */
export async function publishVideoAction(input: {
  videoId: string;
  publishAt?: string | null;
}): Promise<{ ok: true } | { error: string }> {
  const ctx = await guardVideo(input.videoId, 'publier');
  if ('error' in ctx) return ctx;
  const quand = input.publishAt ? new Date(input.publishAt) : null;
  if (quand && Number.isNaN(quand.getTime())) return { error: 'Date de publication invalide.' };
  const { error } = await ctx.a
    .from('videos')
    .update({
      status: 'publie',
      publish_at: quand ? quand.toISOString() : null,
      published_by: ctx.profile.id,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
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
    description: quand
      ? `Publication de « ${ctx.video.titre} » programmée le ${quand.toLocaleDateString('fr-FR')}`
      : `Publication de « ${ctx.video.titre} »`,
    diff: { status: 'publie', publish_at: quand?.toISOString() ?? null },
  });
  refresh(ctx.cours.id);
  return { ok: true };
}

/** Retire une vidéo de la publication : elle repasse « À valider ». */
export async function unpublishVideoAction(input: {
  videoId: string;
}): Promise<{ ok: true } | { error: string }> {
  const ctx = await guardVideo(input.videoId, 'publier');
  if ('error' in ctx) return ctx;
  const { error } = await ctx.a
    .from('videos')
    .update({ status: 'a_valider', publish_at: null, updated_at: new Date().toISOString() })
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
    description: `« ${ctx.video.titre} » retirée de la publication (à valider)`,
    diff: { status: 'a_valider' },
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
 * Nouvel ordre COMPLET d'une liste (un item × une catégorie), en un seul
 * appel : glisser-déposer et flèches ↑/↓ de la bibliothèque. `orderedIds` doit
 * contenir exactement les vidéos actuelles de la liste — sinon (vidéo ajoutée
 * ou supprimée ailleurs entre-temps) rien n'est écrit et l'interface se
 * resynchronise. Chaque vidéo est vérifiée : elle appartient bien à cet item
 * et à cette catégorie, item dans le périmètre de la personne (guard).
 * Les `order_index` sont réécrits 0..n-1 (trous et doublons anciens compris).
 */
export async function reorderVideosAction(input: {
  coursId: string;
  type: VideoType;
  orderedIds: string[];
  /** Vidéo glissée (pour le journal) ; facultatif. */
  deplaceeId?: string;
}): Promise<{ ok: true } | { error: string }> {
  if (input.type !== 'cours' && input.type !== 'seance_approfondie') return { error: 'Type de vidéo inconnu.' };
  const ctx = await guard(input.coursId);
  if ('error' in ctx) return ctx;
  const ids = Array.isArray(input.orderedIds) ? input.orderedIds.filter((x) => typeof x === 'string') : [];
  if (ids.length > LOT_MAX) return { error: `Liste trop longue (${LOT_MAX} vidéos au plus).` };

  const { data: rows, error: errLecture } = await ctx.a
    .from('videos')
    .select('id, titre, order_index')
    .eq('cours_id', ctx.cours.id)
    .eq('type', input.type)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true });
  if (errLecture) return { error: errLecture.message };
  const list = (rows ?? []) as { id: string; titre: string; order_index: number | null }[];
  if (!memesIdentifiants(ids, list.map((v) => v.id))) {
    return { error: 'La liste a changé entre-temps (vidéo ajoutée ou supprimée ailleurs) : elle vient d’être actualisée, recommencez le déplacement.' };
  }

  const ecritures = ecrituresOrdre(list, ids);
  if (ecritures.length === 0) return { ok: true };
  const resultats = await Promise.all(
    ecritures.map((e) => ctx.a.from('videos').update({ order_index: e.order_index }).eq('id', e.id).eq('cours_id', ctx.cours.id)),
  );
  const echec = resultats.find((r: { error?: { message?: string } | null }) => r.error);
  if (echec) {
    // Écriture partielle possible : on recompacte dans l'ordre enregistré
    // pour ne jamais laisser de doublons, puis l'interface se resynchronise.
    await renumber(ctx.a, ctx.cours.id, input.type);
    return { error: `Ordre non enregistré : ${echec.error.message ?? 'erreur inconnue'}.` };
  }

  const avant = list.map((v) => v.id);
  // Deux voisines échangées : les deux lectures sont justes ; on nomme celle
  // que la personne a déplacée (indiquée par l'interface) si elle concorde.
  const indiquee = input.deplaceeId ? { id: input.deplaceeId, de: avant.indexOf(input.deplaceeId), vers: ids.indexOf(input.deplaceeId) } : null;
  const bouge = indiquee && indiquee.de >= 0 && indiquee.vers >= 0
    && deplacerElement(avant, indiquee.de, indiquee.vers).every((id, i) => id === ids[i])
    ? { id: indiquee.id, de: indiquee.de + 1, vers: indiquee.vers + 1 }
    : elementDeplace(avant, ids);
  const titreDe = (id: string) => list.find((v) => v.id === id)?.titre ?? id;
  await logAudit({
    actor: ctx.profile,
    action: 'update',
    entity: 'video',
    entityId: bouge?.id ?? ctx.cours.id,
    coursId: ctx.cours.id,
    coursTitre: ctx.cours.titre,
    matiereNom: ctx.cours.matiereNom,
    description: bouge
      ? `Ordre modifié : « ${titreDe(bouge.id)} » de la position ${bouge.de} à la position ${bouge.vers} (${LABEL[input.type]})`
      : `Ordre modifié : ${ecritures.length} vidéo(s) renumérotée(s) (${LABEL[input.type]})`,
    diff: { type: input.type, avant, apres: ids, ...(bouge ? { de: bouge.de, vers: bouge.vers } : {}) },
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
