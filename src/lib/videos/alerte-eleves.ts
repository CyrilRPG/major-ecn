import type { PermissionScope } from '@/types/domain';
import type { ContentAccess } from '@/lib/auth/permissions';
import { canAccessCollege, canAccessCours, scopeOffers } from '@/lib/auth/permissions';
import { eleveAutorise, eleveExclu, supportVisible, videoVisible } from '@/lib/videos/audience';

/**
 * « Alerter les élèves concernés » (bibliothèque vidéo, 29/09/2026) : QUI doit
 * recevoir l'e-mail annonçant de nouvelles vidéos / de nouveaux supports, et
 * QUOI lui annoncer. Module PUR : mêmes règles que la page élève
 * (`(student)/cours/[cours]/layout.tsx`) — un élève n'est prévenu que d'un
 * contenu qu'il peut réellement ouvrir.
 *
 *  1. accès à l'item : collège (+ item s'il est restreint), sauf autorisation
 *     nominative sur la vidéo ;
 *  2. vidéo visible : exclusion nominative, voie, formules cochées, droit de la
 *     formule en repli (`videoVisible`) ;
 *  3. supports : chacun avec ses permissions propres (`supportVisible`).
 */

export type VideoAAlerter = {
  id: string;
  titre: string;
  type: 'cours' | 'seance_approfondie';
  bunny_video_id: string | null;
  live_at: string | null;
  voies: string[] | null;
  offers: string[] | null;
  denied_user_ids: string[] | null;
  allowed_user_ids: string[] | null;
  supports: { titre: string; voies: string[] | null; offers: string[] | null }[];
};

export type CoursAAlerter = {
  id: string;
  titre: string;
  matiere_id: string;
  /** `cours.access_type` */
  access_type: 'all' | 'specific' | null;
  /** `matieres.access_type` */
  college_access_type: 'all' | 'specific' | null;
};

export type ContenuAnnonce = {
  videoId: string;
  titre: string;
  type: VideoAAlerter['type'];
  /** Séance à venir : pas encore de vidéo, seulement des dossiers. */
  aVenir: boolean;
  liveAt: string | null;
  supports: string[];
};

/** Ce qu'un élève voit parmi les vidéos publiées (vide = pas d'e-mail). */
export function contenusPourEleve(
  eleve: { id: string; scope: PermissionScope; access: ContentAccess },
  cours: CoursAAlerter,
  videos: VideoAAlerter[],
): ContenuAnnonce[] {
  const { id: userId, scope, access } = eleve;
  const accesItem =
    canAccessCollege(scope, cours.matiere_id, cours.college_access_type ?? 'all')
    && canAccessCours(scope, cours.matiere_id, cours.id, cours.access_type ?? 'all');
  const offres = scopeOffers(scope);
  const voie = scope.voie ?? null;

  const annonces: ContenuAnnonce[] = [];
  for (const v of videos) {
    const nominatif = eleveAutorise(v, userId) && !eleveExclu(v, userId);
    if (!accesItem && !nominatif) continue;
    const droitFormule = v.type === 'seance_approfondie' ? access.seanceApprofondie : access.video;
    const options = { offres, voie, droitFormule, userId };
    if (!videoVisible(v, options)) continue;
    const supports = v.supports.filter((s) => supportVisible(s, v, options)).map((s) => s.titre);
    const aVenir = !v.bunny_video_id;
    // Séance à venir sans aucun dossier visible : rien à ouvrir pour l'élève.
    if (aVenir && supports.length === 0) continue;
    annonces.push({ videoId: v.id, titre: v.titre, type: v.type, aVenir, liveAt: v.live_at, supports });
  }
  return annonces;
}

/** Une vidéo est-elle en ligne MAINTENANT (publiée, pas programmée plus tard) ? */
export function enLigne(v: { status: string | null; publish_at: string | null }, maintenant = Date.now()): boolean {
  if (v.status === 'a_valider') return false;
  return !v.publish_at || new Date(v.publish_at).getTime() <= maintenant;
}
