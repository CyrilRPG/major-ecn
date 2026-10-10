/** Textes de modération partagés (back-office, menu d'un message) — module PUR. */

export const AVERTISSEMENTS_PREDEFINIS = [
  'Merci de garder un ton respectueux envers les autres participants.',
  'Les messages hors sujet ou répétitifs gênent la promotion : merci de rester sur les échanges pédagogiques.',
  'Le partage de coordonnées personnelles n’est pas autorisé dans les échanges Major ECN.',
  'Le tag des enseignants est réservé aux questions pédagogiques : merci d’en faire un usage raisonnable.',
  'La diffusion de contenus Major ECN à l’extérieur de la plateforme n’est pas autorisée.',
];

export const MOTIFS_SIGNALEMENT = [
  'Contenu injurieux ou irrespectueux',
  'Spam ou publicité',
  'Coordonnées personnelles',
  'Information médicale erronée',
  'Hors sujet',
  'Autre',
];

export const LIBELLE_SANCTION: Record<string, string> = {
  avertissement: 'Avertissement',
  lecture_seule: 'Lecture seule',
  suspension: 'Suspension',
  exclusion: 'Exclusion de la messagerie',
  restriction_tag: 'Tag des enseignants retiré',
};

export const DUREES: { libelle: string; heures: number | null }[] = [
  { libelle: '24 heures', heures: 24 },
  { libelle: '3 jours', heures: 72 },
  { libelle: '7 jours', heures: 168 },
  { libelle: 'Jusqu’à une date', heures: null },
  { libelle: 'Durée personnalisée', heures: -1 },
  { libelle: 'Sans limite', heures: 0 },
];
