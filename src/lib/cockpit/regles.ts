/**
 * Cockpit administrateur — règles métier PURES (aucun accès serveur), partagées
 * par les pages, les actions serveur et les tests de recette (C01 à C18).
 *
 * CDC « Mon cockpit administrateur et messagerie administrative intelligente »
 * (version consolidée du 08/10/2026) + addendum « Cockpit de pilotage
 * opérationnel » + rubrique « Réclamations & Améliorations ».
 */

/* ------------------------------------------------------------------ */
/* Libellés                                                            */
/* ------------------------------------------------------------------ */

export const STATUTS_TACHE = ['a_faire', 'en_cours', 'attente_reponse', 'reponse_recue', 'reportee', 'terminee', 'annulee'] as const;
export type StatutTache = (typeof STATUTS_TACHE)[number];

export const STATUT_TACHE_LABEL: Record<StatutTache, string> = {
  a_faire: 'À faire',
  en_cours: 'En cours',
  attente_reponse: 'En attente de réponse',
  reponse_recue: 'Réponse reçue',
  reportee: 'Reportée',
  terminee: 'Terminée',
  annulee: 'Annulée',
};

/** Statuts « vivants » : la tâche reste à piloter. */
export const STATUTS_OUVERTS: readonly StatutTache[] = ['a_faire', 'en_cours', 'attente_reponse', 'reponse_recue', 'reportee'];
export const estOuverte = (s: string): boolean => (STATUTS_OUVERTS as readonly string[]).includes(s);

export const PRIORITES = ['basse', 'normale', 'haute', 'urgente'] as const;
export type Priorite = (typeof PRIORITES)[number];
export const PRIORITE_LABEL: Record<Priorite, string> = { basse: 'Basse', normale: 'Normale', haute: 'Haute', urgente: 'Urgente' };
export const POIDS_PRIORITE: Record<Priorite, number> = { urgente: 0, haute: 1, normale: 2, basse: 3 };

/** Catégories par défaut (§3) — personnalisables : toute valeur libre est acceptée. */
export const CATEGORIES_DEFAUT = [
  'enseignants', 'contenus', 'pedagogie', 'developpement', 'marketing', 'finances', 'commercial', 'administration',
] as const;
export const CATEGORIE_LABEL: Record<string, string> = {
  enseignants: 'Enseignants',
  contenus: 'Contenus',
  pedagogie: 'Pédagogie',
  developpement: 'Développement',
  marketing: 'Marketing',
  finances: 'Finances',
  commercial: 'Commercial',
  administration: 'Administration',
  client: 'Client',
};
export function libelleCategorie(c: string): string {
  return CATEGORIE_LABEL[c] ?? (c.charAt(0).toUpperCase() + c.slice(1));
}

export const RECURRENCES = ['aucune', 'quotidienne', 'hebdomadaire', 'mensuelle'] as const;
export type Recurrence = (typeof RECURRENCES)[number];
export const RECURRENCE_LABEL: Record<Recurrence, string> = {
  aucune: 'Aucune', quotidienne: 'Chaque jour', hebdomadaire: 'Chaque semaine', mensuelle: 'Chaque mois',
};

export const DROITS = ['lecture', 'commentaire', 'modification'] as const;
export type Droit = (typeof DROITS)[number];
export const DROIT_LABEL: Record<Droit, string> = { lecture: 'Consulter', commentaire: 'Commenter', modification: 'Modifier' };

export const NATURES_DEMANDE = ['pedagogique', 'administrative', 'commerciale', 'comptable'] as const;
export type NatureDemande = (typeof NATURES_DEMANDE)[number];
export const NATURE_DEMANDE_LABEL: Record<NatureDemande, string> = {
  pedagogique: 'Pédagogique', administrative: 'Administrative', commerciale: 'Commerciale', comptable: 'Comptable',
};
export const SOUS_TYPES_COMPTABLES = ['facture', 'echeancier', 'paiement', 'justificatif', 'remboursement', 'autre'] as const;
export const SOUS_TYPE_LABEL: Record<string, string> = {
  facture: 'Demande de facture', echeancier: 'Échéancier', paiement: 'Question de paiement',
  justificatif: 'Demande de justificatif', remboursement: 'Demande de remboursement', autre: 'Autre réclamation administrative',
};
export const STATUTS_DEMANDE = ['a_traiter', 'en_cours', 'en_attente', 'terminee'] as const;
export type StatutDemande = (typeof STATUTS_DEMANDE)[number];
export const STATUT_DEMANDE_LABEL: Record<StatutDemande, string> = {
  a_traiter: 'À traiter', en_cours: 'En cours', en_attente: 'En attente', terminee: 'Terminé',
};
export const CANAUX = ['telephone', 'email', 'messagerie', 'courrier', 'autre'] as const;
export const CANAL_LABEL: Record<string, string> = {
  telephone: 'Téléphone', email: 'E-mail', messagerie: 'Messagerie', courrier: 'Courrier', autre: 'Autre',
};

export const CATEGORIES_RECLAMATION = ['fonctionnalite', 'contenu', 'pedagogie', 'technique', 'service', 'facturation', 'autre'] as const;
export const CATEGORIE_RECLAMATION_LABEL: Record<string, string> = {
  fonctionnalite: 'Fonctionnalité', contenu: 'Contenu', pedagogie: 'Pédagogie', technique: 'Technique',
  service: 'Service', facturation: 'Facturation', autre: 'Autre',
};
/** Nature du problème : évite de demander une correction technique quand un accompagnement suffit. */
export const TYPES_PROBLEME = ['individuel', 'pedagogique_collectif', 'technique', 'service'] as const;
export const TYPE_PROBLEME_LABEL: Record<string, string> = {
  individuel: 'Problème individuel',
  pedagogique_collectif: 'Problème pédagogique collectif',
  technique: 'Problème technique',
  service: 'Problème de service',
};
export const TYPE_PROBLEME_AIDE: Record<string, string> = {
  individuel: 'Un élève ne comprend pas un chapitre : accompagnement individuel.',
  pedagogique_collectif: 'Plusieurs élèves bloquent sur le même point : revoir le contenu.',
  technique: 'Un contenu ou une fonctionnalité ne fonctionne pas : correction à demander.',
  service: 'Délai de réponse, planning, facturation ou accompagnement.',
};
export const STATUTS_RECLAMATION = ['a_traiter', 'a_analyser', 'en_cours', 'resolu', 'cloturee'] as const;
export const STATUT_RECLAMATION_LABEL: Record<string, string> = {
  a_traiter: 'À traiter', a_analyser: 'À analyser', en_cours: 'En cours', resolu: 'Résolu', cloturee: 'Clôturée',
};
export const STATUTS_AMELIORATION = ['a_planifier', 'a_traiter', 'en_cours', 'a_valider', 'realisee', 'verifiee', 'abandonnee'] as const;
export const STATUT_AMELIORATION_LABEL: Record<string, string> = {
  a_planifier: 'À planifier', a_traiter: 'À corriger', en_cours: 'En cours', a_valider: 'À valider',
  realisee: 'Réalisée', verifiee: 'Vérifiée', abandonnee: 'Abandonnée',
};
export const AMELIORATION_OUVERTE = (s: string) => !['realisee', 'verifiee', 'abandonnee'].includes(s);
export const RECLAMATION_OUVERTE = (s: string) => !['resolu', 'cloturee'].includes(s);

export const GENRES_RDV = ['rendez_vous', 'reunion', 'appel', 'echeance', 'autre'] as const;
export const GENRE_RDV_LABEL: Record<string, string> = {
  rendez_vous: 'Rendez-vous', reunion: 'Réunion', appel: 'Appel', echeance: 'Échéance', autre: 'Autre',
};

/** Tons proposés à l'IA de rédaction (§6). */
export const TONS = ['professionnel', 'chaleureux', 'direct', 'ferme_courtois'] as const;
export type Ton = (typeof TONS)[number];
export const TON_LABEL: Record<Ton, string> = {
  professionnel: 'Professionnel', chaleureux: 'Chaleureux', direct: 'Direct', ferme_courtois: 'Ferme et courtois',
};
export const ACTIONS_IA = ['rediger', 'corriger', 'reformuler', 'raccourcir', 'developper', 'objet'] as const;
export type ActionIa = (typeof ACTIONS_IA)[number];

/* ------------------------------------------------------------------ */
/* Confidentialité et droits (§4) — C01, C02, C18                      */
/* ------------------------------------------------------------------ */

export type TacheAcces = { owner_id: string; assignee_id: string | null };
export type PartageAcces = { user_id: string; droit: Droit; revoque_at: string | null };
export type NiveauAcces = 'proprietaire' | Droit;

const RANG_DROIT: Record<NiveauAcces, number> = { lecture: 1, commentaire: 2, modification: 3, proprietaire: 4 };

/**
 * Droit d'un utilisateur sur une tâche. Le rôle « admin » n'ouvre RIEN : une
 * tâche privée d'un administrateur reste invisible des autres administrateurs
 * (règle impérative §4). Seuls comptent la propriété, l'affectation (droit de
 * modification : la personne doit pouvoir faire avancer la tâche) et un
 * partage explicite non révoqué.
 */
export function niveauAccesTache(t: TacheAcces, partages: readonly PartageAcces[], userId: string): NiveauAcces | null {
  if (t.owner_id === userId) return 'proprietaire';
  let niveau: NiveauAcces | null = t.assignee_id === userId ? 'modification' : null;
  for (const p of partages) {
    if (p.user_id !== userId || p.revoque_at) continue;
    if (!niveau || RANG_DROIT[p.droit] > RANG_DROIT[niveau]) niveau = p.droit;
  }
  return niveau;
}

export function peut(niveau: NiveauAcces | null, requis: NiveauAcces): boolean {
  return !!niveau && RANG_DROIT[niveau] >= RANG_DROIT[requis];
}

/** Seul le propriétaire partage, révoque, archive, supprime ou réaffecte. */
export const peutAdministrer = (n: NiveauAcces | null) => n === 'proprietaire';

export type DemandeAcces = { created_by: string; assignee_id: string | null; nature: string };

/**
 * Demandes clients : dossiers professionnels visibles de leur auteur, de la
 * personne chargée du traitement et des administrateurs. Un membre de
 * l'équipe non administrateur ne voit que ce qui le concerne. Une demande
 * comptable (informations financières sensibles) n'est jamais ouverte au-delà
 * de l'auteur, de la personne affectée et des administrateurs.
 */
export function peutVoirDemande(d: DemandeAcces, userId: string, estAdmin: boolean): boolean {
  if (d.created_by === userId || d.assignee_id === userId) return true;
  return estAdmin;
}

/** Réclamations / améliorations : pilotage qualité des administrateurs, ou personne affectée. */
export function peutVoirReclamation(r: { created_by: string | null; assignee_id: string | null }, userId: string, estAdmin: boolean): boolean {
  return estAdmin || r.created_by === userId || r.assignee_id === userId;
}

export type ConversationAcces = { owner_id: string; interlocuteur_id: string | null; interlocuteur_type: string };

/**
 * Messagerie administrative privée (§5) : le propriétaire de la conversation
 * et l'enseignant interlocuteur, personne d'autre — ni un autre
 * administrateur, ni un élève (C16). Un élève n'est jamais interlocuteur
 * en plateforme : ses relances partent par e-mail.
 */
export function roleDansConversation(c: ConversationAcces, userId: string, role: string): 'proprietaire' | 'enseignant' | null {
  if (c.owner_id === userId) return 'proprietaire';
  if (c.interlocuteur_type === 'enseignant' && c.interlocuteur_id === userId && (role === 'professor' || role === 'admin')) return 'enseignant';
  return null;
}

/* ------------------------------------------------------------------ */
/* Statuts : transitions automatiques (§9, C13)                        */
/* ------------------------------------------------------------------ */

/** Après l'envoi d'un message lié : la tâche attend une réponse (sauf si close). */
export function statutApresEnvoi(s: StatutTache): StatutTache {
  return estOuverte(s) ? 'attente_reponse' : s;
}

/**
 * Après une réponse de l'enseignant : « Réponse reçue », JAMAIS « Terminée »
 * sans validation du propriétaire (C13). Une tâche déjà close n'est pas
 * rouverte en silence.
 */
export function statutApresReponse(s: StatutTache): StatutTache {
  return estOuverte(s) ? 'reponse_recue' : s;
}

/* ------------------------------------------------------------------ */
/* E-mails (§7, §8) — C10, C11                                         */
/* ------------------------------------------------------------------ */

export const PREFIXE_OBJET_COPIE = '[MAJOR ECN - MESSAGERIE INTERNE]';

/** Objet STABLE et filtrable de la copie d'une réponse enseignant (C11). */
export function objetCopieReponse(prenom: string, sujet: string): string {
  const p = prenom.trim() || 'enseignant';
  return `${PREFIXE_OBJET_COPIE} Réponse de ${p} - ${sujet.trim()}`.slice(0, 250);
}

/** Objet de l'e-mail adressé à l'enseignant (§7). */
export function objetMessageEnseignant(sujet: string): string {
  return `[MAJOR ECN] ${sujet.trim()}`.slice(0, 250);
}

/** Lien profond vers le fil, conservé après authentification (C14). */
export function lienConversation(base: string, conversationId: string): string {
  return `${base.replace(/\/+$/, '')}/admin/cockpit/messagerie/${conversationId}`;
}

/** Clé d'idempotence fournisseur d'un envoi : la même pour toutes les tentatives (C12). */
export function cleEnvoi(envoiId: string): string {
  return `cockpit-envoi-${envoiId}`;
}

export const ENVOI_MAX_TENTATIVES = 6;

/** Délai avant nouvelle tentative : 2, 4, 8, 16, 32 minutes. */
export function delaiReprise(tentatives: number): number {
  return Math.min(32, 2 ** Math.max(1, tentatives)) * 60_000;
}

/* ------------------------------------------------------------------ */
/* Dates (heure de Paris, jamais toISOString().slice(0,10))             */
/* ------------------------------------------------------------------ */

export function ajouterJoursIso(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().slice(0, 10);
}

/** Lundi de la semaine (ISO) contenant `iso`. */
export function lundiDe(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const jour = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 = dimanche
  return ajouterJoursIso(iso, -((jour + 6) % 7));
}

export function premierDuMois(iso: string): string {
  return iso.slice(0, 8) + '01';
}

/** Prochaine occurrence d'une tâche récurrente. */
export function prochaineEcheance(echeance: string, r: Recurrence): string | null {
  if (r === 'aucune') return null;
  if (r === 'quotidienne') return ajouterJoursIso(echeance, 1);
  if (r === 'hebdomadaire') return ajouterJoursIso(echeance, 7);
  const [y, m, d] = echeance.split('-').map(Number);
  // Le 31 janvier + 1 mois = le 28/29 février (dernier jour du mois suivant).
  const dernier = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const jour = Math.min(d, dernier);
  return `${m === 12 ? y + 1 : y}-${String(m === 12 ? 1 : m + 1).padStart(2, '0')}-${String(jour).padStart(2, '0')}`;
}

/** Libellé relatif d'une échéance : « Aujourd'hui », « Demain », « 10 oct. », « En retard ». */
export function libelleEcheance(echeance: string | null, aujourdHui: string, heure?: string | null): string {
  if (!echeance) return 'Sans échéance';
  const h = heure ? ` - ${heure.slice(0, 5)}` : '';
  if (echeance === aujourdHui) return `Aujourd’hui${h}`;
  if (echeance === ajouterJoursIso(aujourdHui, 1)) return `Demain${h}`;
  if (echeance === ajouterJoursIso(aujourdHui, -1)) return `Hier${h}`;
  const [y, m, d] = echeance.split('-').map(Number);
  const txt = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  return `${txt}${h}`;
}

/** « Il y a 3 jours » à partir d'un instant ISO. */
export function depuis(iso: string, maintenant: Date = new Date()): string {
  const min = Math.max(0, Math.round((maintenant.getTime() - new Date(iso).getTime()) / 60_000));
  if (min < 1) return 'À l’instant';
  if (min < 60) return `Il y a ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `Il y a ${h} h`;
  const j = Math.round(h / 24);
  return j === 1 ? 'Hier' : `Il y a ${j} jours`;
}

/* ------------------------------------------------------------------ */
/* Tri et indicateurs                                                  */
/* ------------------------------------------------------------------ */

export type TacheTri = { priorite: string; echeance: string | null; heure: string | null; ordre: number; created_at: string };

/** Ordre d'affichage : échéance (sans échéance en dernier), heure, priorité, ordre manuel. */
export function comparerTaches(a: TacheTri, b: TacheTri): number {
  const ea = a.echeance ?? '9999-12-31';
  const eb = b.echeance ?? '9999-12-31';
  if (ea !== eb) return ea < eb ? -1 : 1;
  const ha = a.heure ?? '99:99';
  const hb = b.heure ?? '99:99';
  if (ha !== hb) return ha < hb ? -1 : 1;
  const pa = POIDS_PRIORITE[a.priorite as Priorite] ?? 2;
  const pb = POIDS_PRIORITE[b.priorite as Priorite] ?? 2;
  if (pa !== pb) return pa - pb;
  if (a.ordre !== b.ordre) return a.ordre - b.ordre;
  return a.created_at < b.created_at ? -1 : 1;
}

/** Une tâche est « urgente » : priorité urgente, ou haute et due au plus tard aujourd'hui, ou en retard. */
export function estUrgente(t: { priorite: string; echeance: string | null; statut: string }, aujourdHui: string): boolean {
  if (!estOuverte(t.statut)) return false;
  if (t.priorite === 'urgente') return true;
  if (t.echeance && t.echeance < aujourdHui) return true;
  return t.priorite === 'haute' && !!t.echeance && t.echeance <= aujourdHui;
}

/**
 * Taux de réponse : part des messages envoyés (hors brouillons) sur la période
 * qui ont reçu une réponse dans le même fil. `null` sans envoi.
 */
export function tauxDeReponse(envoyes: number, repondus: number): number | null {
  if (envoyes <= 0) return null;
  return Math.round((Math.min(repondus, envoyes) / envoyes) * 100);
}

/** Réordonne une liste d'ids (déplacement d'un cran vers le haut ou le bas). */
export function deplacer<T>(liste: readonly T[], index: number, sens: -1 | 1): T[] {
  const cible = index + sens;
  if (index < 0 || index >= liste.length || cible < 0 || cible >= liste.length) return [...liste];
  const copie = [...liste];
  [copie[index], copie[cible]] = [copie[cible], copie[index]];
  return copie;
}

/** Prénom affichable d'un profil. */
export function prenomDe(p: { first_name?: string | null; last_name?: string | null; email?: string | null } | null | undefined): string {
  if (!p) return '';
  return (p.first_name ?? '').trim() || (p.email ?? '').split('@')[0] || '';
}

export function nomComplet(p: { first_name?: string | null; last_name?: string | null; email?: string | null } | null | undefined): string {
  if (!p) return '';
  const n = [p.first_name, p.last_name].map((s) => (s ?? '').trim()).filter(Boolean).join(' ');
  return n || (p.email ?? '');
}

export function initiales(nom: string): string {
  const parts = nom.replace(/^(dr|pr|mme|m)\.?\s+/i, '').split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}
