/**
 * Types, libellés et paramètres du module de relances de l'Offre Découverte
 * (cahier des charges du client, 30 sections).
 *
 * Module PUR (client et serveur) : aucune lecture base ici.
 */

export const NIVEAUX = ['R1', 'R2', 'R3'] as const;
export type Niveau = (typeof NIVEAUX)[number];

/** Type d'un e-mail « relance » au sens du module (séquence + campagne de réactivation). */
export type TypeRelance = Niveau | 'ancien_acces';
export const TYPES_RELANCE: readonly TypeRelance[] = ['R1', 'R2', 'R3', 'ancien_acces'];

export type TypeEnvoi = 'initial' | TypeRelance | 'renvoi_lien' | 'ancienne_relance' | 'test';
export type StatutEnvoi = 'en_cours' | 'envoye' | 'echec' | 'historique';
export type OrigineEnvoi = 'module' | 'manuel' | 'import' | 'ancien_systeme' | 'candidat' | 'test';

/** Modèles d'e-mail éditables en administration. */
export type TypeModele = TypeRelance | 'renvoi_lien';
export const TYPES_MODELE: readonly TypeModele[] = ['R1', 'R2', 'R3', 'ancien_acces', 'renvoi_lien'];

export const TYPE_ENVOI_LABEL: Record<TypeEnvoi, string> = {
  initial: 'E-mail d’activation initial',
  R1: 'R1 — relance principale',
  R2: 'R2 — deuxième relance',
  R3: 'R3 — dernière relance',
  ancien_acces: 'Ancien accès — réactivation',
  renvoi_lien: 'Nouveau lien d’accès (demandé par le candidat)',
  ancienne_relance: 'Relance de l’ancien système automatique',
  test: 'E-mail de test',
};
export const TYPE_COURT: Record<TypeEnvoi, string> = {
  initial: 'Initial', R1: 'R1', R2: 'R2', R3: 'R3', ancien_acces: 'Ancien accès',
  renvoi_lien: 'Nouveau lien', ancienne_relance: 'Ancien système', test: 'Test',
};
export const ORIGINE_LABEL: Record<OrigineEnvoi, string> = {
  module: 'Module (envoi contrôlé)',
  manuel: 'Saisie / envoi manuel',
  import: 'Import CSV',
  ancien_systeme: 'Ancien système',
  candidat: 'Demande du candidat',
  test: 'Test',
};

/**
 * Statuts (§2). `BLOQUE` = hard bounce sur l'adresse active : les relances
 * sont bloquées jusqu'à correction de l'adresse (§24).
 */
export type Statut = 'ROUGE' | 'ORANGE' | 'VERT' | 'VIOLET' | 'GRIS' | 'DESINSCRIT' | 'BLOQUE';
export const STATUTS: readonly Statut[] = ['ROUGE', 'ORANGE', 'VIOLET', 'VERT', 'GRIS', 'DESINSCRIT', 'BLOQUE'];
export const STATUT_LABEL: Record<Statut, string> = {
  ROUGE: 'À relancer',
  ORANGE: 'En attente',
  VERT: 'Activé',
  VIOLET: 'Ancien accès',
  GRIS: 'Terminé',
  DESINSCRIT: 'Désinscrit',
  BLOQUE: 'Adresse en erreur',
};
export const STATUT_DESCRIPTION: Record<Statut, string> = {
  ROUGE: 'Relance échue : action requise.',
  ORANGE: 'En attente : aucune action aujourd’hui.',
  VERT: 'Première connexion effectuée : sortie immédiate de la séquence.',
  VIOLET: 'Ancien accès jamais réactivé : campagne de réactivation.',
  GRIS: 'Séquence terminée sans connexion (ou compte non éligible).',
  DESINSCRIT: 'Opposition enregistrée : exclu des communications concernées.',
  BLOQUE: 'Hard bounce : relances bloquées jusqu’à correction de l’adresse.',
};
/** Couleurs d'affichage (pastilles). */
export const STATUT_COULEUR: Record<Statut, { fond: string; texte: string; point: string }> = {
  ROUGE: { fond: '#FDE8EA', texte: '#A4122B', point: '#D7263D' },
  ORANGE: { fond: '#FFF1DE', texte: '#9A5300', point: '#F08C00' },
  VERT: { fond: '#E3F5EA', texte: '#1E6B3E', point: '#2F9E5B' },
  VIOLET: { fond: '#EFE7FB', texte: '#5B2E9C', point: '#7C4DCC' },
  GRIS: { fond: '#EEF0F3', texte: '#4A5361', point: '#8A94A3' },
  DESINSCRIT: { fond: '#E9ECF5', texte: '#2B3A67', point: '#46557F' },
  BLOQUE: { fond: '#1F2430', texte: '#FFFFFF', point: '#1F2430' },
};

export type RegleAttribution = 'dernier_clic' | 'derniere_relance' | 'premiere_relance';
export const REGLE_ATTRIBUTION_LABEL: Record<RegleAttribution, string> = {
  dernier_clic: 'Dernier clic (repli : dernière relance)',
  derniere_relance: 'Dernière relance reçue',
  premiere_relance: 'Première relance de la fenêtre',
};

/** Surcharge éditable d'un modèle (champs absents = texte par défaut du code). */
export type ModeleSurcharge = Partial<{
  objet: string;
  preheader: string;
  surtitre: string;
  titre: string;
  paragraphes: string[];
  cta: string;
  sousCta: string;
  ligneVideoIntro: string;
  ligneVideo: string;
  aideTitre: string;
  aideTexte: string;
  signature: string;
}>;

export type Parametres = {
  delais: Record<Niveau, number>;
  actifs: Record<TypeRelance, boolean>;
  ecartMinJours: number;
  seuilAncienJours: number;
  maxRelances: number;
  attributionRegle: RegleAttribution;
  attributionFenetreJours: number;
  validiteLienJours: number;
  pause: boolean;
  lienVideo: string;
  modeles: Partial<Record<TypeModele, ModeleSurcharge>>;
  version: number;
  derniereSynchroAt: string | null;
  updatedAt: string | null;
};

export const PARAMETRES_DEFAUT: Parametres = {
  delais: { R1: 7, R2: 21, R3: 45 },
  actifs: { R1: true, R2: true, R3: true, ancien_acces: true },
  ecartMinJours: 7,
  seuilAncienJours: 45,
  maxRelances: 3,
  attributionRegle: 'dernier_clic',
  attributionFenetreJours: 14,
  validiteLienJours: 30,
  pause: false,
  lienVideo: '/visite-guidee',
  modeles: {},
  version: 1,
  derniereSynchroAt: null,
  updatedAt: null,
};

/** Ligne SQL `decouverte_parametres`. */
export type LigneParametres = {
  delai_r1_jours: number; delai_r2_jours: number; delai_r3_jours: number;
  r1_actif: boolean; r2_actif: boolean; r3_actif: boolean; ancien_acces_actif: boolean;
  ecart_min_jours: number; seuil_ancien_jours: number; max_relances: number;
  attribution_regle: string; attribution_fenetre_jours: number; validite_lien_jours: number;
  pause: boolean; lien_video: string; modeles: unknown; version: number;
  derniere_synchro_at?: string | null; updated_at?: string | null;
};

export function parametresDepuisLigne(l: Partial<LigneParametres> | null | undefined): Parametres {
  if (!l) return { ...PARAMETRES_DEFAUT };
  const n = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
  const b = (v: unknown, d: boolean) => (typeof v === 'boolean' ? v : d);
  const regle = l.attribution_regle === 'derniere_relance' || l.attribution_regle === 'premiere_relance' ? l.attribution_regle : 'dernier_clic';
  const modeles = l.modeles && typeof l.modeles === 'object' && !Array.isArray(l.modeles) ? (l.modeles as Parametres['modeles']) : {};
  return {
    delais: { R1: n(l.delai_r1_jours, 7), R2: n(l.delai_r2_jours, 21), R3: n(l.delai_r3_jours, 45) },
    actifs: { R1: b(l.r1_actif, true), R2: b(l.r2_actif, true), R3: b(l.r3_actif, true), ancien_acces: b(l.ancien_acces_actif, true) },
    ecartMinJours: n(l.ecart_min_jours, 7),
    seuilAncienJours: n(l.seuil_ancien_jours, 45),
    maxRelances: n(l.max_relances, 3),
    attributionRegle: regle,
    attributionFenetreJours: n(l.attribution_fenetre_jours, 14),
    validiteLienJours: n(l.validite_lien_jours, 30),
    pause: b(l.pause, false),
    lienVideo: typeof l.lien_video === 'string' && l.lien_video.trim() ? l.lien_video.trim() : '/visite-guidee',
    modeles,
    version: n(l.version, 1),
    derniereSynchroAt: l.derniere_synchro_at ?? null,
    updatedAt: l.updated_at ?? null,
  };
}

export function parametresVersLigne(p: Parametres): Omit<LigneParametres, 'derniere_synchro_at' | 'updated_at'> {
  return {
    delai_r1_jours: p.delais.R1, delai_r2_jours: p.delais.R2, delai_r3_jours: p.delais.R3,
    r1_actif: p.actifs.R1, r2_actif: p.actifs.R2, r3_actif: p.actifs.R3, ancien_acces_actif: p.actifs.ancien_acces,
    ecart_min_jours: p.ecartMinJours, seuil_ancien_jours: p.seuilAncienJours, max_relances: p.maxRelances,
    attribution_regle: p.attributionRegle, attribution_fenetre_jours: p.attributionFenetreJours,
    validite_lien_jours: p.validiteLienJours, pause: p.pause, lien_video: p.lienVideo,
    modeles: p.modeles, version: p.version,
  };
}

/** Validation des paramètres saisis (messages lisibles, [] si valide). */
export function validerParametres(p: Parametres): string[] {
  const e: string[] = [];
  const entier = (v: number, min: number, max: number, nom: string) => {
    if (!Number.isInteger(v) || v < min || v > max) e.push(`${nom} : entier entre ${min} et ${max} attendu.`);
  };
  entier(p.delais.R1, 1, 730, 'Délai R1');
  entier(p.delais.R2, 1, 730, 'Délai R2');
  entier(p.delais.R3, 1, 730, 'Délai R3');
  if (!(p.delais.R1 < p.delais.R2 && p.delais.R2 < p.delais.R3)) e.push('Les délais doivent être croissants : R1 < R2 < R3.');
  entier(p.ecartMinJours, 0, 365, 'Écart minimal entre deux relances');
  entier(p.seuilAncienJours, 1, 3650, 'Seuil « ancien accès »');
  entier(p.maxRelances, 0, 3, 'Nombre maximal de relances');
  entier(p.attributionFenetreJours, 1, 365, 'Fenêtre d’attribution');
  entier(p.validiteLienJours, 1, 365, 'Validité des liens d’accès');
  const v = p.lienVideo.trim();
  if (!v.startsWith('/') && !/^https:\/\/[^\s]+$/i.test(v)) e.push('Lien vidéo : chemin du site (« /visite-guidee ») ou URL https attendu.');
  if (v.startsWith('//')) e.push('Lien vidéo : chemin invalide.');
  return e;
}

/* ─────────────────────────── Données lues en base ─────────────────────────── */

/** Candidat tel que renvoyé par `decouverte_etat()` (colonnes + auth/profil frais). */
export type CandidatEtat = {
  id: string;
  user_id: string | null;
  email_actuel: string;
  email_normalise: string;
  prenom: string | null;
  nom: string | null;
  telephone: string | null;
  specialite: string | null;
  voie: string | null;
  origine: string | null;
  session_evc: string | null;
  pays: string | null;
  demande_at: string;
  derniere_demande_at: string | null;
  nb_demandes: number | null;
  demande_anterieure_id?: string | null;
  compte_cree_at: string | null;
  acces_initial_at: string | null;
  acces_initial_approx: boolean | null;
  premiere_connexion_at: string | null;
  premiere_connexion_approx: boolean | null;
  derniere_connexion_at: string | null;
  compte_supprime_at: string | null;
  relance_attribuee: string | null;
  regle_attribution_appliquee: string | null;
  attribution_calculee_at: string | null;
  delai_connexion_sec: number | null;
  delai_clic_sec: number | null;
  email_bloque_adresse: string | null;
  email_bloque_raison: string | null;
  email_bloque_at: string | null;
  auth_email?: string | null;
  auth_last_sign_in_at?: string | null;
  auth_banned_until?: string | null;
  auth_deleted_at?: string | null;
  auth_existe?: boolean | null;
  profil_existe?: boolean | null;
  profil_actif?: boolean | null;
  profil_offre?: string | null;
  profil_espace_decouverte?: string | null;
};

export type EnvoiEtat = {
  id: string;
  candidat_id: string | null;
  type: TypeEnvoi;
  origine: OrigineEnvoi;
  exceptionnel: boolean;
  statut: StatutEnvoi;
  email_utilise: string | null;
  sujet: string | null;
  modele_version?: number | null;
  operation_id?: string | null;
  envoye_par?: string | null;
  envoye_par_nom?: string | null;
  commentaire?: string | null;
  date_approx?: boolean | null;
  created_at: string;
  envoye_at: string | null;
  delivre_at?: string | null;
  ouvert_at?: string | null;
  nb_ouvertures?: number | null;
  clic_cta_at?: string | null;
  nb_clics_cta?: number | null;
  clic_video_at?: string | null;
  nb_clics_video?: number | null;
  dernier_clic_at?: string | null;
  bounce_at?: string | null;
  bounce_type?: string | null;
  plainte_at?: string | null;
  desinscrit_at?: string | null;
  erreur?: string | null;
};

export type OppositionEtat = {
  id: string;
  email_normalise: string;
  user_id: string | null;
  candidat_id: string | null;
  source: string;
  envoi_id: string | null;
  created_at: string;
};

export type EtatModule = {
  maintenant: string;
  candidats: CandidatEtat[];
  envois: EnvoiEtat[];
  oppositions: OppositionEtat[];
};

export function normaliserEmail(e: string | null | undefined): string {
  return (e ?? '').trim().toLowerCase();
}

/** Validation d'adresse volontairement simple (le prestataire tranche ensuite). */
export function emailValide(e: string | null | undefined): boolean {
  const t = (e ?? '').trim();
  return t.length <= 254 && /^[^\s@<>(),;:"[\]]+@[^\s@<>(),;:"[\]]+\.[a-z]{2,}$/i.test(t);
}

/** Envoi « parti » (réservé, envoyé ou importé) : compte pour la séquence. */
export function envoiCompte(e: Pick<EnvoiEtat, 'statut'>): boolean {
  return e.statut === 'envoye' || e.statut === 'historique' || e.statut === 'en_cours';
}

/** Date effective d'un envoi (date déclarée pour un import, sinon création). */
export function dateEnvoi(e: Pick<EnvoiEtat, 'envoye_at' | 'created_at'>): string {
  return e.envoye_at ?? e.created_at;
}
