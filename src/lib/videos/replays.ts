import type { SupabaseClient } from '@supabase/supabase-js';
import type { Offer, PermissionScope, Voie } from '@/types/domain';
import { scopeOffers } from '@/lib/auth/permissions';
import type { ContentAccess } from '@/lib/auth/permissions';
import { supportVisible, videoVisible, eleveAutorise, eleveExclu } from './audience';
import { categorieDeVideo, type CategorieVideo } from './categories';

/**
 * Replays d'un item, tels que CET élève les voit : chaque vidéo avec ses
 * supports, filtrés par l'audience (voie, formules, listes nominatives) et par
 * les permissions propres de chaque support.
 *
 * Point de chargement unique pour l'aperçu, la page « Séance intensive » et la
 * page « Séances approfondies » : les trois affichent le même programme, la
 * même association vidéo ⇄ supports, et ne peuvent plus diverger sur ce qu'un
 * élève est censé voir.
 */

export type ReplaySupport = { id: string; titre: string; order_index: number };

export type ReplayVideo = {
  id: string;
  titre: string;
  type: CategorieVideo;
  rubrique: string | null;
  order_index: number | null;
  bunny_video_id: string | null;
  storage_path: string | null;
  serie_id: string | null;
  unlock_direct: boolean | null;
  voies: string[] | null;
  offers: string[] | null;
  denied_user_ids: string[] | null;
  allowed_user_ids: string[] | null;
  /** Supports visibles par l'élève, dans l'ordre choisi par l'administration. */
  supports: ReplaySupport[];
};

export type Replays = {
  /** Vidéos visibles par catégorie, ordonnées. */
  cours: ReplayVideo[];
  seance_approfondie: ReplayVideo[];
  /** Au moins une vidéo de l'item autorise l'élève nominativement (sans l'exclure). */
  autoriseParVideo: boolean;
};

type Ligne = Omit<ReplayVideo, 'type' | 'supports'> & {
  type: string | null;
  video_supports?: { id: string; titre: string; order_index: number; voies: string[] | null; offers: string[] | null }[] | null;
};

export type ContexteEleve = {
  userId: string;
  scope: PermissionScope;
  /** Droits de la formule ; `undefined` pour l'administration (tout est visible). */
  access: ContentAccess | undefined;
  isAdmin: boolean;
};

/** Filtre les vidéos (et leurs supports) selon l'audience de l'élève. Pur. */
export function filtrerReplays(lignes: readonly Ligne[], ctx: ContexteEleve): Replays {
  const offres: readonly Offer[] = scopeOffers(ctx.scope);
  const voie: Voie | null = ctx.scope.voie ?? null;
  const droitFormule = (type: CategorieVideo) =>
    !ctx.access || (type === 'seance_approfondie' ? ctx.access.seanceApprofondie : ctx.access.video);

  const out: Replays = { cours: [], seance_approfondie: [], autoriseParVideo: false };
  const triees = lignes
    .map((v, i) => ({ v, i }))
    .sort((a, b) => ((a.v.order_index ?? 0) - (b.v.order_index ?? 0)) || (a.i - b.i))
    .map((x) => x.v);

  for (const v of triees) {
    const type = categorieDeVideo(v.type);
    if (eleveAutorise(v, ctx.userId) && !eleveExclu(v, ctx.userId)) out.autoriseParVideo = true;
    const options = { offres, voie, droitFormule: droitFormule(type), userId: ctx.userId };
    if (!ctx.isAdmin && !videoVisible(v, options)) continue;
    const supports = (v.video_supports ?? [])
      .filter((d) => ctx.isAdmin || supportVisible(d, v, options))
      .slice()
      .sort((a, b) => a.order_index - b.order_index)
      .map((d) => ({ id: d.id, titre: d.titre, order_index: d.order_index }));
    out[type].push({
      id: v.id,
      titre: v.titre,
      type,
      rubrique: v.rubrique ?? null,
      order_index: v.order_index ?? null,
      bunny_video_id: v.bunny_video_id ?? null,
      storage_path: v.storage_path ?? null,
      serie_id: v.serie_id ?? null,
      unlock_direct: v.unlock_direct ?? null,
      voies: v.voies ?? null,
      offers: v.offers ?? null,
      denied_user_ids: v.denied_user_ids ?? null,
      allowed_user_ids: v.allowed_user_ids ?? null,
      supports,
    });
  }
  return out;
}

/** Charge puis filtre les replays d'un item pour cet élève. */
export async function chargerReplays(
  supabase: SupabaseClient,
  coursId: string,
  ctx: ContexteEleve,
): Promise<Replays> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('videos')
    .select('id, titre, type, rubrique, order_index, bunny_video_id, storage_path, serie_id, unlock_direct, voies, offers, denied_user_ids, allowed_user_ids, video_supports(id, titre, order_index, voies, offers)')
    .eq('cours_id', coursId)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true });
  return filtrerReplays((data ?? []) as Ligne[], ctx);
}

/** Nombre de vidéos et de supports visibles d'une catégorie. */
export function compterReplays(videos: readonly ReplayVideo[]): { seances: number; supports: number } {
  return {
    seances: videos.length,
    supports: videos.reduce((n, v) => n + v.supports.length, 0),
  };
}
