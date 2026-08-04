import type { Offer, Voie } from '@/types/domain';

/**
 * Audience d'une vidéo : voie de concours + formules.
 *
 * Deux critères indépendants, cumulatifs — une vidéo n'est visible que si les
 * deux passent. Helpers purs : utilisables côté serveur comme côté client.
 */

/** Voies proposées à l'administrateur (les deux cochées par défaut). */
export const VOIES: { value: Voie; label: string }[] = [
  { value: 'interne', label: 'Voie interne' },
  { value: 'externe', label: 'Voie externe' },
];

/** Formules qu'une vidéo peut viser. `decouverte` est exclue : l'espace
 *  découverte a son propre parcours, verrouillé par ailleurs. */
export const VIDEO_OFFERS: { value: Exclude<Offer, 'decouverte'>; label: string }[] = [
  { value: 'essentiel', label: 'Formule Essentielle' },
  { value: 'intensif', label: 'Formule Intensive' },
  { value: 'approfondi', label: 'Programme Approfondi' },
];

export type VideoAudience = {
  voies?: string[] | null;
  offers?: string[] | null;
  /** Élèves explicitement privés d'accès (exclusion nominative). */
  denied_user_ids?: string[] | null;
};

/** Normalise une liste de voies ; vide/absente ⇒ les deux (aucune restriction). */
export function normaliserVoies(voies?: string[] | null): Voie[] {
  const v = (voies ?? []).filter((x): x is Voie => x === 'interne' || x === 'externe');
  return v.length > 0 ? Array.from(new Set(v)) : ['interne', 'externe'];
}

/** Normalise une liste de formules ; les valeurs inconnues sont ignorées. */
export function normaliserOffres(offers?: string[] | null): Offer[] {
  const valides = VIDEO_OFFERS.map((o) => o.value) as string[];
  return Array.from(new Set((offers ?? []).filter((o) => valides.includes(o)))) as Offer[];
}

/**
 * Visible pour cette voie ?
 *
 * Les DEUX voies cochées = aucune restriction : tout le monde voit la vidéo, y
 * compris un élève dont la voie n'est pas renseignée (hors médecine générale,
 * elle ne l'est pas toujours). Une seule voie cochée = restriction réelle, il
 * faut que celle de l'élève corresponde.
 */
export function visiblePourVoie(voies: string[] | null | undefined, voieEleve?: Voie | null): boolean {
  const cibles = normaliserVoies(voies);
  if (cibles.length >= 2) return true;
  return !!voieEleve && cibles.includes(voieEleve);
}

/**
 * Visible pour ces formules ?
 *
 * `offers` vide/absent ⇒ `null` : la vidéo ne porte aucun ciblage explicite, et
 * c'est au droit global de la formule (formula_permissions) de trancher. Sinon,
 * il suffit qu'une des formules détenues soit cochée.
 */
export function visiblePourOffres(
  offers: string[] | null | undefined,
  offresEleve: readonly Offer[],
): boolean | null {
  const cibles = normaliserOffres(offers);
  if (cibles.length === 0) return null;
  return offresEleve.some((o) => cibles.includes(o));
}

/**
 * Cet élève est-il explicitement privé d'accès à cette vidéo ?
 *
 * L'exclusion nominative (`denied_user_ids`) prime sur tout : un élève retiré
 * ne voit plus la séance ni ses supports, quelle que soit sa formule ou sa voie.
 */
export function eleveExclu(
  video: { denied_user_ids?: string[] | null },
  userId?: string | null,
): boolean {
  if (!userId) return false;
  return (video.denied_user_ids ?? []).includes(userId);
}

/**
 * Une vidéo est-elle visible par cet élève ?
 *
 * `droitFormule` est le droit global de la formule pour ce type de contenu
 * (`access.video` ou `access.seanceApprofondie`) : il ne sert que de repli
 * quand la vidéo ne porte aucun ciblage de formule. `userId`, s'il est fourni,
 * fait respecter l'exclusion nominative de la vidéo.
 */
export function videoVisible(
  video: VideoAudience,
  options: { offres: readonly Offer[]; voie?: Voie | null; droitFormule: boolean; userId?: string | null },
): boolean {
  if (eleveExclu(video, options.userId)) return false;
  if (!visiblePourVoie(video.voies, options.voie)) return false;
  const parOffre = visiblePourOffres(video.offers, options.offres);
  return parOffre ?? options.droitFormule;
}

/** Un support peut porter SES PROPRES voies/formules. NULL ⇒ hérite de la vidéo. */
export type SupportOverride = { voies?: string[] | null; offers?: string[] | null };

/** Le support porte-t-il des permissions propres (au moins un des deux ciblages) ? */
export function supportADesPermissionsPropres(doc: SupportOverride): boolean {
  return (doc.voies?.length ?? 0) > 0 || (doc.offers?.length ?? 0) > 0;
}

/**
 * Audience EFFECTIVE d'un support : ses ciblages propres s'ils existent, sinon
 * ceux de sa vidéo. L'exclusion nominative reste portée par la vidéo (un élève
 * retiré de la séance l'est aussi de tous ses supports).
 */
export function audienceSupport(doc: SupportOverride, video: VideoAudience): VideoAudience {
  return {
    voies: doc.voies && doc.voies.length > 0 ? doc.voies : video.voies,
    offers: doc.offers && doc.offers.length > 0 ? doc.offers : video.offers,
    denied_user_ids: video.denied_user_ids,
  };
}

/** Un support est-il visible par cet élève ? (audience effective + exclusion). */
export function supportVisible(
  doc: SupportOverride,
  video: VideoAudience,
  options: { offres: readonly Offer[]; voie?: Voie | null; droitFormule: boolean; userId?: string | null },
): boolean {
  return videoVisible(audienceSupport(doc, video), options);
}

/** Résumé lisible de l'audience, pour l'administration. */
export function resumeAudience(video: VideoAudience): string {
  const voies = normaliserVoies(video.voies);
  const offres = normaliserOffres(video.offers);
  const partVoie = voies.length >= 2 ? 'toutes voies' : `voie ${voies[0]}`;
  const partOffre = offres.length === 0
    ? 'droit de la formule'
    : offres.map((o) => VIDEO_OFFERS.find((x) => x.value === o)?.label ?? o).join(' · ');
  return `${partOffre} — ${partVoie}`;
}
