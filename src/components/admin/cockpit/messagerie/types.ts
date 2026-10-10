/**
 * Messagerie administrative — types d'affichage et utilitaires PURS, partagés
 * entre les pages serveur (qui préparent les données) et les composants
 * client (qui les affichent). Aucun accès serveur ici.
 */

export type RoleFil = 'proprietaire' | 'enseignant';
export type TypeInterlocuteur = 'enseignant' | 'eleve' | 'client';

export const BOITES = ['reception', 'envoyes', 'brouillons', 'suivies', 'archivees', 'toutes'] as const;
export type Boite = (typeof BOITES)[number];
export const BOITE_LABEL: Record<Boite, string> = {
  reception: 'Boîte de réception',
  envoyes: 'Envoyés',
  brouillons: 'Brouillons',
  suivies: 'Conversations suivies',
  archivees: 'Archivées',
  toutes: 'Toutes',
};
export const estBoite = (v: string | undefined): v is Boite => !!v && (BOITES as readonly string[]).includes(v);

export const FILTRES_STATUT = ['a_traiter', 'attente', 'echec', 'brouillon'] as const;
export type FiltreStatut = (typeof FILTRES_STATUT)[number];
export const FILTRE_STATUT_LABEL: Record<FiltreStatut, string> = {
  a_traiter: 'Réponse à traiter / non lu',
  attente: 'En attente de réponse',
  echec: 'Échec d’envoi',
  brouillon: 'Brouillon en cours',
};
export const estFiltreStatut = (v: string | undefined): v is FiltreStatut => !!v && (FILTRES_STATUT as readonly string[]).includes(v);

export const TYPE_INTERLOCUTEUR_LABEL: Record<TypeInterlocuteur, string> = {
  enseignant: 'Enseignant', eleve: 'Élève', client: 'Client',
};

export type EtatEnvoi = 'en_file' | 'envoye' | 'echec' | 'non_disponible';

/** Ligne de la liste des conversations. */
export type ResumeConversation = {
  id: string;
  role: RoleFil;
  sujet: string;
  mission: string | null;
  interlocuteur: string;
  interlocuteurType: TypeInterlocuteur;
  tacheId: string | null;
  suivie: boolean;
  archivee: boolean;
  /** Date courte (« 14:32 », « 8 oct. ») calculée côté serveur, heure de Paris. */
  quand: string;
  quandComplet: string;
  apercu: string | null;
  /** Le dernier message (hors brouillon) vient-il de moi ? */
  dernierDeMoi: boolean | null;
  /** Propriétaire : réponses non traitées. Enseignant : messages non lus. */
  aTraiter: number;
  brouillon: string | null;
  /** État de l'e-mail du dernier message envoyé par le propriétaire. */
  etatDernierEmail: EtatEnvoi | null;
  echec: boolean;
  luDernier: boolean;
};

export type CompteursBoites = Record<Boite, number>;

export type FiltresListe = {
  boite: Boite;
  q: string;
  avec: string;
  mission: string;
  du: string;
  au: string;
  statut: FiltreStatut | '';
};

export type Interlocuteur = { cle: string; label: string };

/** Message tel qu'affiché dans le fil. */
export type MessageFil = {
  id: string;
  deMoi: boolean;
  sens: 'sortant' | 'entrant';
  auteur: string;
  corps: string;
  quand: string;
  redigeAvecIa: boolean;
  saisieManuelle: boolean;
  /** « Lu dans la plateforme » : instant formaté, ou null. */
  luLe: string | null;
  traite: boolean;
  reponseRecue: boolean;
  pieces: PieceFil[];
  /** E-mail principal : au destinataire (message sortant) ou copie au propriétaire (réponse). */
  email: { statut: EtatEnvoi; erreur: string | null; nouvelEssai: boolean } | null;
  push: EtatEnvoi | null;
};

export type PieceFil = { id: string; nom: string; taille: number; mime: string | null };

export type ConversationFil = {
  id: string;
  role: RoleFil;
  sujet: string;
  mission: string | null;
  interlocuteur: string;
  interlocuteurType: TypeInterlocuteur;
  interlocuteurEmail: string | null;
  /** Vue enseignant : nom de l'administrateur propriétaire du fil. */
  proprietaire: string | null;
  suivie: boolean;
  archivee: boolean;
  creeLe: string;
};

export type TacheFil = {
  id: string;
  titre: string;
  statut: string;
  echeance: string | null;
  echeanceLabel: string;
  peutModifier: boolean;
};

/** Préremplissage du formulaire « Nouveau message » / « Relancer quelqu'un ». */
export type InitialRelance = {
  type?: TypeInterlocuteur;
  personneId?: string;
  personneLabel?: string;
  email?: string;
  sujet?: string;
  mission?: string;
  tacheId?: string;
};

/* ------------------------------------------------------------------ */

const FUSEAU = 'Europe/Paris';

/** Jour calendaire (AAAA-MM-JJ) d'un instant, heure de Paris. */
export function jourParis(iso: string | Date): string {
  return new Date(iso).toLocaleDateString('fr-CA', { timeZone: FUSEAU });
}

/** « 14:32 » aujourd'hui, « 8 oct. » cette année, « 8 oct. 2025 » sinon. */
export function dateCourte(iso: string, maintenant: Date = new Date()): string {
  const d = new Date(iso);
  if (jourParis(d) === jourParis(maintenant)) {
    return d.toLocaleTimeString('fr-FR', { timeZone: FUSEAU, hour: '2-digit', minute: '2-digit' });
  }
  const memeAnnee = jourParis(d).slice(0, 4) === jourParis(maintenant).slice(0, 4);
  return d.toLocaleDateString('fr-FR', { timeZone: FUSEAU, day: 'numeric', month: 'short', ...(memeAnnee ? {} : { year: 'numeric' }) });
}

/** « mer. 8 oct. 2026 à 14:32 ». */
export function dateLongue(iso: string): string {
  const d = new Date(iso);
  const jour = d.toLocaleDateString('fr-FR', { timeZone: FUSEAU, weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const heure = d.toLocaleTimeString('fr-FR', { timeZone: FUSEAU, hour: '2-digit', minute: '2-digit' });
  return `${jour} à ${heure}`;
}

/** « 10/10 » à partir de AAAA-MM-JJ. */
export function jjmm(iso: string): string {
  const [, m, j] = iso.split('-');
  return `${j}/${m}`;
}

/** « 10/10/2026 » à partir de AAAA-MM-JJ. */
export function jjmmaaaa(iso: string): string {
  const [a, m, j] = iso.split('-');
  return `${j}/${m}/${a}`;
}

export function tailleLisible(octets: number): string {
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${Math.round(octets / 1024)} Ko`;
  return `${(octets / 1024 / 1024).toFixed(1).replace('.', ',')} Mo`;
}

/** Texte comparable : minuscules, sans accents. */
export function normaliser(s: string | null | undefined): string {
  return (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/**
 * Clé d'idempotence d'un message composé (C12) : une seule par message, réutilisée
 * à chaque nouvel essai ou double clic, régénérée seulement après un envoi réussi.
 */
export function nouvelleCle(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID().replace(/-/g, '');
  const octets = new Uint8Array(16);
  if (c && typeof c.getRandomValues === 'function') c.getRandomValues(octets);
  else for (let i = 0; i < octets.length; i++) octets[i] = Math.floor(Math.random() * 256);
  return Array.from(octets, (o) => o.toString(16).padStart(2, '0')).join('');
}
