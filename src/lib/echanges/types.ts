/**
 * Module « Échanges » — formes des données échangées entre le serveur, le
 * site et l'application mobile. Module PUR (aucune dépendance serveur).
 *
 * Ce que ces objets NE contiennent jamais (CDC §15, §100, §117) : identifiant
 * de profil d'un tiers, nom de famille ou e-mail d'un enseignant, chemin de
 * stockage d'un fichier, nom de fichier d'origine dans une URL.
 */

export type Canal = 'discussion' | 'annonces';
export type TypeAuteur = 'candidat' | 'enseignant' | 'equipe' | 'systeme';

export type AuteurDTO = {
  /** Clé opaque, stable dans un groupe (regroupement visuel), sans lien avec l'identifiant du compte. */
  cle: string;
  nom: string;
  type: TypeAuteur;
  /** « Enseignant Cardiologie », « Équipe Major ECN » ; null pour un candidat. */
  qualite: string | null;
  avatar: { mode: 'dessin' | 'initiale' | 'majorecn' | 'neutre' | 'photo'; seed: string | null; initiale: string; url: string | null };
  moi: boolean;
};

export type ContexteDTO = {
  type: 'fiche' | 'qcm' | 'qroc' | 'cas' | 'replay' | 'video' | 'correction' | 'item' | 'serie';
  ressourceId: string;
  titre: string;
  itemNumero: number | null;
  itemTitre: string | null;
  specialiteId: string | null;
  specialiteNom: string | null;
  lien: string | null;
};

export type PieceJointeDTO = {
  id: string;
  nom: string;
  mime: string | null;
  taille: number | null;
  legende: string | null;
  estImage: boolean;
  /** Validation en cours (image analysée, en attente de l'équipe). */
  enModeration: boolean;
};

export type TagDTO = {
  /** Identifiant de l'enseignant dans le groupe (jamais celui de son compte). */
  enseignantId: string;
  enseignant: string;
  statut: 'en_attente' | 'traitee' | 'annulee' | 'a_reaffecter';
  enRetard: boolean;
};

export type MessageDTO = {
  id: string;
  groupeId: string;
  canal: Canal;
  auteur: AuteurDTO;
  contenu: string | null;
  createdAt: string;
  modifie: boolean;
  /** Fin de la fenêtre de modification (null : non modifiable). */
  modifiableJusqua: string | null;
  supprimable: boolean;
  signalable: boolean;
  reponseA: { id: string; auteur: string; extrait: string; disponible: boolean } | null;
  mentions: { id: string; nom: string }[];
  reactions: { emoji: string; n: number; moi: boolean }[];
  pieces: PieceJointeDTO[];
  epingle: { at: string; par: string; avecQuestion: boolean } | null;
  important: boolean;
  accuseRequis: boolean;
  accuse: boolean;
  statut: 'publie' | 'en_attente' | 'refuse';
  attenteMotif: string | null;
  contexte: ContexteDTO | null;
  tags: TagDTO[];
  /** Vue modérateur : nombre de lectures d'une annonce (accusés). */
  lectures?: { vus: number; accuses: number; membres: number } | null;
  /** Vue modérateur : identité de modération (fiche candidat). */
  moderation?: { auteurProfilId: string | null } | null;
};

export type DroitsDTO = {
  lire: boolean;
  publier: boolean;
  repondre: boolean;
  taguer: boolean;
  joindre: boolean;
  reagir: boolean;
  publierAnnonce: boolean;
  epingler: boolean;
  moderer: boolean;
  motif: string | null;
};

export type EnseignantTagDTO = { id: string; prenom: string; libelle: string; specialite: string | null };

export type GroupeDTO = {
  id: string;
  nom: string;
  promotion: string | null;
  annee: number | null;
  specialiteNom: string | null;
  statut: 'brouillon' | 'active' | 'cloturee' | 'archivee';
  role: 'candidat' | 'enseignant' | 'equipe';
  droits: DroitsDTO;
  nonLus: { discussion: number; annonces: number; reponsesEnseignant: number };
  dernierMessage: { auteur: string; extrait: string; at: string } | null;
  topic: string;
  reglesAAccepter: boolean;
  moderationPrealable: boolean;
  bibliotheque: boolean;
  sourdine: boolean;
};

export type ResumeEchangesDTO = {
  actif: boolean;
  groupes: GroupeDTO[];
  totalNonLus: number;
  reponsesEnseignant: number;
  questionsATraiter: number;
};

export type PageMessagesDTO = {
  messages: MessageDTO[];
  /** Il reste des messages plus anciens / plus récents à charger. */
  plusAnciens: boolean;
  plusRecents: boolean;
  /** Curseur de synchronisation (maj_at max). */
  curseur: string;
  /** Premier message non lu (reprise de lecture, §63). */
  premierNonLu: string | null;
  dernierLuAt: string | null;
};

export type ChangementsDTO = {
  messages: MessageDTO[];
  /** Messages disparus du flux (supprimés, refusés) : à retirer de l'affichage. */
  retires: string[];
  curseur: string;
};

export type ResultatRechercheDTO = {
  source: 'message' | 'bibliotheque';
  id: string;
  groupeId: string | null;
  groupeNom: string | null;
  canal: Canal | null;
  auteur: string;
  auteurType: TypeAuteur | null;
  at: string;
  /** Extrait découpé : les segments `fort` portent les termes recherchés (§124). */
  extrait: { t: string; fort: boolean }[];
  epingle: boolean;
  pieces: number;
  itemNumero: number | null;
  titre: string | null;
};

export type QuestionEnseignantDTO = {
  tagId: string;
  messageId: string;
  groupeId: string;
  groupeNom: string;
  promotion: string | null;
  eleve: string;
  extrait: string;
  tagAt: string;
  statut: 'en_attente' | 'traitee' | 'annulee' | 'a_reaffecter';
  reponduAt: string | null;
  enRetard: boolean;
  disponible: boolean;
};

export type BibliothequeDTO = {
  id: string;
  titre: string;
  question: string | null;
  questionAuteur: string;
  reponse: string;
  enseignant: string | null;
  specialiteNom: string | null;
  itemNumero: number | null;
  itemTitre: string | null;
  valideLabel: string;
  valideAt: string;
  misAJourAt: string;
};

/** Messages courts renvoyés aux erreurs prévisibles (affichés tels quels). */
export type ErreurEchanges = { error: string; code?: 'BLOQUE' | 'QUOTA' | 'DROITS' | 'INTROUVABLE' | 'INVALIDE' | 'REGLES' };
