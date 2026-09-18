import type { AlerteCalculee } from './alertes-auto';

/**
 * Types et constantes du tableau « Suivi élèves / Commercial » importables
 * depuis les composants client : le module `eleves.ts` est server-only
 * (il ouvre la base), un composant client ne doit jamais l'importer.
 */

export type StatutSuivi = 'a_contacter' | 'contacte' | 'a_rappeler' | 'resolu' | 'a_surveiller' | 'urgent';
export const STATUTS_SUIVI: StatutSuivi[] = ['a_contacter', 'contacte', 'a_rappeler', 'resolu', 'a_surveiller', 'urgent'];
export const STATUT_SUIVI_LABEL: Record<StatutSuivi, string> = {
  a_contacter: 'À contacter',
  contacte: 'Contacté',
  a_rappeler: 'À rappeler',
  resolu: 'Situation résolue',
  a_surveiller: 'À surveiller',
  urgent: 'Urgent',
};

export type Collaborateur = { id: string; nom: string };

export type LigneEleve = {
  id: string;
  nom: string;
  email: string | null;
  phone: string | null;
  specialite: string;
  offer: string;
  voie: 'interne' | 'externe' | null;
  inscritLe: string;
  derniereConnexion: string | null;
  derniereActivite: string | null;
  activite: 'fort' | 'moyen' | 'faible' | 'nul';
  /** 0-100, part du programme abordé ; null si le programme est inconnu. */
  progression: number | null;
  qcmFaits: number;
  videosVues: number;
  fichesLues: number;
  alertes: AlerteCalculee[];
  dernierContact: string | null;
  prochainContact: string | null;
  statut: StatutSuivi;
  affecteA: Collaborateur | null;
  nbComptesRendus: number;
};

export type StatsSuivi = {
  total: number;
  affectes: number;
  aRappelerAujourdhui: number;
  sansContact10j: number;
  urgents: number;
  enAlerte: number;
};

export type TableauEleves = {
  lignes: LigneEleve[];
  collaborateurs: Collaborateur[];
  stats: StatsSuivi;
  /** L'acteur voit-il tout le monde (administrateur / gestion) ou son seul périmètre ? */
  perimetreRestreint: boolean;
  peutAffecter: boolean;
  peutRediger: boolean;
};
