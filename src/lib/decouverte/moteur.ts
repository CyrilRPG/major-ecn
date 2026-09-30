/**
 * Moteur des relances de l'Offre Découverte — statut, prochaine action, date,
 * raisons lisibles et éligibilité à l'envoi. SOURCE UNIQUE : liste admin,
 * bannière du tableau de bord, confirmation d'envoi, contrôle serveur juste
 * avant chaque e-mail, exports et statistiques appellent ces fonctions.
 *
 * Règles métier (cahier §4, §5, §6, §7, §20, §24, §26, §28) :
 *  1. VERT dès la première connexion, à n'importe quel moment (sortie
 *     immédiate : plus JAMAIS un e-mail affirmant une non-connexion) ;
 *  2. DÉSINSCRIT si une opposition s'applique (adresse ou compte) ;
 *  3. GRIS si le compte est supprimé, désactivé, suspendu ou n'est plus en
 *     Offre Découverte (raison explicite) ;
 *  4. BLOQUÉ si l'adresse ACTIVE est celle qui a rebondi (hard bounce) — le
 *     blocage tombe de lui-même quand l'adresse change ;
 *  5. GRIS si la campagne « ancien accès » est partie (pas de boucle), si R3
 *     (ou le dernier niveau actif) est partie, ou si le maximum de relances
 *     est atteint ;
 *  6. VIOLET si jamais aucune R1/R2/R3 (envoyée OU importée) et ancienneté
 *     depuis J0 ≥ seuil « ancien accès » ;
 *  7. sinon, prochain niveau = niveau ACTIF suivant le plus haut niveau déjà
 *     parti (historique importé, saisies et envois manuels compris — jamais de
 *     retour artificiel à R1), échéance = max(J0 + délai du niveau, dernière
 *     relance + écart minimal) en jour calendaire de Paris : ROUGE si échue,
 *     ORANGE sinon.
 *
 * Module PUR : aucune lecture base, aucune horloge implicite (`maintenant`).
 */
import { ajouterJours, ecartJours, formatDateHeure, formatJour, jourParis, maxJour } from './dates';
import {
  NIVEAUX, STATUT_LABEL, TYPE_COURT, dateEnvoi, emailValide, envoiCompte, normaliserEmail,
  type CandidatEtat, type EnvoiEtat, type Niveau, type OppositionEtat, type Parametres, type Statut, type TypeRelance,
} from './types';

export type EtatCompte = 'ok' | 'supprime' | 'inactif' | 'banni' | 'hors_offre';
export const ETAT_COMPTE_LABEL: Record<EtatCompte, string> = {
  ok: 'Compte actif',
  supprime: 'Compte supprimé',
  inactif: 'Compte désactivé',
  banni: 'Compte suspendu',
  hors_offre: 'N’est plus en Offre Découverte',
};

export type Evaluation = {
  statut: Statut;
  /** Adresse ACTIVE (compte Auth frais, sinon fiche). */
  email: string;
  j0: string;                       // instant ISO de l'accès initial (J0)
  ancienneteJours: number;          // jours calendaires de Paris depuis J0
  connecteAt: string | null;
  connexionApprochee: boolean;
  opposition: OppositionEtat | null;
  bloque: { adresse: string; raison: string | null; at: string | null } | null;
  compte: EtatCompte;
  compteDetail: string | null;
  dernierNiveau: Niveau | null;
  dernierNiveauAt: string | null;
  nbRelances: number;               // R1/R2/R3 parties
  derniereRelanceAt: string | null; // toute relance (R, ancien accès, ancien système)
  derniereRelanceType: string | null;
  ancienAccesAt: string | null;
  prochainType: TypeRelance | null;
  echeance: string | null;          // AAAA-MM-JJ (Paris)
  echue: boolean;
  prochaineAction: string;
  /** « Pourquoi » : explication lisible du statut et de la prochaine action. */
  pourquoi: string[];
};

type Ctx = { maintenant: Date | string };

const ORDRE: Record<Niveau, number> = { R1: 1, R2: 2, R3: 3 };

/** Oppositions qui s'appliquent au candidat : même adresse (active ou fiche), même compte ou même fiche. */
export function oppositionsDuCandidat(c: CandidatEtat, oppositions: OppositionEtat[]): OppositionEtat[] {
  const emails = new Set([normaliserEmail(c.email_actuel), normaliserEmail(c.auth_email)].filter(Boolean));
  return oppositions.filter((o) =>
    o.candidat_id === c.id || (c.user_id !== null && o.user_id === c.user_id) || emails.has(normaliserEmail(o.email_normalise)));
}

export function etatCompte(c: CandidatEtat, maintenant: Date | string): { etat: EtatCompte; detail: string | null } {
  const now = new Date(maintenant).getTime();
  if (!c.user_id || c.auth_existe === false || c.auth_deleted_at || c.compte_supprime_at) {
    return { etat: 'supprime', detail: c.compte_supprime_at ? `Compte supprimé le ${formatJour(c.compte_supprime_at)}` : 'Compte supprimé' };
  }
  if (c.profil_existe === false) return { etat: 'supprime', detail: 'Profil supprimé' };
  if (c.profil_actif === false) return { etat: 'inactif', detail: 'Compte désactivé par l’administration' };
  if (c.auth_banned_until && new Date(c.auth_banned_until).getTime() > now) return { etat: 'banni', detail: 'Compte suspendu (connexion bloquée)' };
  const offre = c.profil_offre ?? null;
  if (offre !== null && offre !== 'decouverte') return { etat: 'hors_offre', detail: `A changé d’offre (formule « ${offre} »)` };
  if (c.profil_espace_decouverte !== undefined && c.profil_espace_decouverte !== null && c.profil_espace_decouverte !== 'true') {
    return { etat: 'hors_offre', detail: 'N’est plus rattaché à l’espace découverte' };
  }
  return { etat: 'ok', detail: null };
}

/** J0 = accès initial (e-mail d'activation) ; à défaut création du compte, puis demande. */
export function j0Du(c: CandidatEtat): string {
  return c.acces_initial_at ?? c.compte_cree_at ?? c.demande_at;
}

/** Relances qui comptent pour l'écart minimal et l'historique. */
function estRelance(e: EnvoiEtat): boolean {
  return (e.type === 'R1' || e.type === 'R2' || e.type === 'R3' || e.type === 'ancien_acces' || e.type === 'ancienne_relance') && envoiCompte(e);
}

export function evaluerCandidat(
  c: CandidatEtat,
  envoisTous: EnvoiEtat[],
  p: Parametres,
  oppositions: OppositionEtat[],
  ctx: Ctx,
): Evaluation {
  const aujourdHui = jourParis(ctx.maintenant);
  const envois = envoisTous.filter((e) => e.candidat_id === c.id);
  const j0 = j0Du(c);
  const jourJ0 = jourParis(j0);
  const anciennete = Math.max(0, ecartJours(jourJ0, aujourdHui));
  const email = (c.auth_email && c.auth_email.trim()) || c.email_actuel;

  // Connexion : colonne tenue par le trigger, doublée par la relecture fraîche d'auth.users.
  const connecteAt = c.premiere_connexion_at ?? c.auth_last_sign_in_at ?? null;
  const connexionApprochee = !!c.premiere_connexion_approx || (!c.premiere_connexion_at && !!c.auth_last_sign_in_at);

  const opps = oppositionsDuCandidat(c, oppositions);
  const opposition = opps[0] ?? null;
  const compte = etatCompte(c, ctx.maintenant);
  const bloque = c.email_bloque_adresse && normaliserEmail(email) === normaliserEmail(c.email_bloque_adresse)
    ? { adresse: c.email_bloque_adresse, raison: c.email_bloque_raison, at: c.email_bloque_at }
    : null;

  // Historique de la séquence.
  const relances = envois.filter(estRelance).sort((a, b) => dateEnvoi(a).localeCompare(dateEnvoi(b)));
  const rParties = relances.filter((e) => e.type === 'R1' || e.type === 'R2' || e.type === 'R3');
  let dernierNiveau: Niveau | null = null;
  let dernierNiveauAt: string | null = null;
  for (const e of rParties) {
    const n = e.type as Niveau;
    if (!dernierNiveau || ORDRE[n] > ORDRE[dernierNiveau] || (ORDRE[n] === ORDRE[dernierNiveau] && dateEnvoi(e) > (dernierNiveauAt ?? ''))) {
      dernierNiveau = n;
      dernierNiveauAt = dateEnvoi(e);
    }
  }
  const nbRelances = rParties.length;
  const derniere = relances[relances.length - 1] ?? null;
  const derniereRelanceAt = derniere ? dateEnvoi(derniere) : null;
  const ancien = relances.filter((e) => e.type === 'ancien_acces');
  const ancienAccesAt = ancien.length ? dateEnvoi(ancien[ancien.length - 1]) : null;

  const base = {
    email, j0, ancienneteJours: anciennete, connecteAt, connexionApprochee, opposition, bloque,
    compte: compte.etat, compteDetail: compte.detail, dernierNiveau, dernierNiveauAt, nbRelances,
    derniereRelanceAt, derniereRelanceType: derniere ? TYPE_COURT[derniere.type] : null, ancienAccesAt,
  };
  const fin = (statut: Statut, prochaineAction: string, pourquoi: string[], suite: Partial<Pick<Evaluation, 'prochainType' | 'echeance' | 'echue'>> = {}): Evaluation => ({
    ...base, statut, prochaineAction, pourquoi,
    prochainType: suite.prochainType ?? null, echeance: suite.echeance ?? null, echue: suite.echue ?? false,
  });

  // 1. Première connexion : sortie immédiate.
  if (connecteAt) {
    return fin('VERT', 'Aucune — candidat activé', [
      `Première connexion le ${formatDateHeure(connecteAt)}${connexionApprochee ? ' (date approchée)' : ''} : sortie immédiate de la séquence, plus aucune relance de non-connexion.`,
    ]);
  }
  // 2. Opposition.
  if (opposition) {
    return fin('DESINSCRIT', 'Aucune — opposition enregistrée', [
      `Opposition enregistrée le ${formatDateHeure(opposition.created_at)} (${LIBELLE_SOURCE[opposition.source] ?? opposition.source}) : exclu de toutes les relances, jamais réintégré automatiquement.`,
    ]);
  }
  // 3. Compte non éligible.
  if (compte.etat !== 'ok') {
    return fin('GRIS', 'Aucune — compte non éligible', [`${compte.detail ?? ETAT_COMPTE_LABEL[compte.etat]} : aucune relance.`]);
  }
  // 4. Hard bounce sur l'adresse active.
  if (bloque) {
    return fin('BLOQUE', 'Corriger l’adresse e-mail du candidat', [
      `L’adresse ${bloque.adresse} a été rejetée définitivement${bloque.at ? ` le ${formatDateHeure(bloque.at)}` : ''}${bloque.raison ? ` (${bloque.raison})` : ''} : relances bloquées jusqu’à la correction de l’adresse (le blocage tombe de lui-même quand l’adresse du compte change).`,
    ]);
  }
  if (!emailValide(email)) {
    return fin('BLOQUE', 'Corriger l’adresse e-mail du candidat', [`Adresse « ${email} » invalide : aucune relance possible.`]);
  }
  // 5. Fin de séquence.
  if (ancienAccesAt) {
    return fin('GRIS', 'Aucune — réactivation déjà envoyée', [
      `Campagne « ancien accès » envoyée le ${formatDateHeure(ancienAccesAt)} sans connexion depuis : pas de boucle automatique de réactivation.`,
    ]);
  }
  if (dernierNiveau === 'R3') {
    return fin('GRIS', 'Aucune — séquence terminée', [
      `R3 (dernière relance) partie le ${formatDateHeure(dernierNiveauAt)} sans connexion : STOP, aucune R4/R5 sur ce motif.`,
    ]);
  }
  if (nbRelances > 0 && nbRelances >= p.maxRelances) {
    return fin('GRIS', 'Aucune — maximum de relances atteint', [
      `${nbRelances} relance(s) déjà partie(s) : le nombre maximal réglé (${p.maxRelances}) est atteint.`,
    ]);
  }

  const ordreDernier = dernierNiveau ? ORDRE[dernierNiveau] : 0;
  const suivant = nbRelances >= p.maxRelances ? null : NIVEAUX.find((n) => ORDRE[n] > ordreDernier && p.actifs[n]) ?? null;

  // 6. Ancien stock : jamais relancé et au-delà du seuil.
  if (!dernierNiveau && anciennete >= p.seuilAncienJours) {
    const pourquoi = [
      `Accès initial le ${formatJour(j0)}, il y a ${anciennete} jours (seuil « ancien accès » : ${p.seuilAncienJours} j), jamais connecté et aucune relance R1/R2/R3 : ancien accès.`,
    ];
    if (!p.actifs.ancien_acces) {
      return fin('VIOLET', 'Aucune — campagne de réactivation désactivée', [...pourquoi, 'La campagne « ancien accès » est désactivée dans les paramètres.']);
    }
    const echeance = derniereRelanceAt ? maxJour(aujourdHui, ajouterJours(jourParis(derniereRelanceAt), p.ecartMinJours)) : aujourdHui;
    const echue = echeance <= aujourdHui;
    if (!echue) pourquoi.push(`Dernière relance (${TYPE_COURT[derniere!.type]}) le ${formatJour(derniereRelanceAt)} : écart minimal de ${p.ecartMinJours} j à respecter, réactivation possible le ${formatJour(echeance)}.`);
    return fin('VIOLET', echue ? 'Envoyer la campagne « ancien accès »' : `Campagne « ancien accès » le ${formatJour(echeance)}`, pourquoi, {
      prochainType: 'ancien_acces', echeance, echue,
    });
  }

  if (!suivant) {
    if (!dernierNiveau && p.maxRelances === 0) {
      return fin('GRIS', 'Aucune — relances désactivées', ['Le nombre maximal de relances est réglé à 0.']);
    }
    return fin('GRIS', 'Aucune — séquence terminée', [
      dernierNiveau
        ? `${dernierNiveau} partie le ${formatDateHeure(dernierNiveauAt)} et aucun niveau suivant n’est actif : séquence terminée.`
        : 'Aucun niveau de relance n’est actif dans les paramètres.',
    ]);
  }

  // 7. Prochain niveau et échéance.
  const echeanceDelai = ajouterJours(jourJ0, p.delais[suivant]);
  const echeanceEcart = derniereRelanceAt ? ajouterJours(jourParis(derniereRelanceAt), p.ecartMinJours) : null;
  const echeance = maxJour(echeanceDelai, echeanceEcart);
  const echue = echeance <= aujourdHui;
  const pourquoi: string[] = [];
  pourquoi.push(`Jamais connecté. Accès initial (J0) le ${formatJour(j0)} — J+${anciennete}.`);
  if (dernierNiveau) {
    pourquoi.push(`Dernier niveau parti : ${dernierNiveau} le ${formatDateHeure(dernierNiveauAt)} ; la séquence reprend à ${suivant} (jamais de retour à R1).`);
  }
  const sautes = NIVEAUX.filter((n) => ORDRE[n] > ordreDernier && ORDRE[n] < ORDRE[suivant]);
  if (sautes.length) pourquoi.push(`${sautes.join(', ')} désactivé(s) : passage direct à ${suivant}.`);
  pourquoi.push(`${suivant} prévue à J+${p.delais[suivant]}, soit le ${formatJour(echeanceDelai)}.`);
  if (echeanceEcart && echeanceEcart > echeanceDelai) {
    pourquoi.push(`Dernière relance (${TYPE_COURT[derniere!.type]}) le ${formatJour(derniereRelanceAt)} : écart minimal de ${p.ecartMinJours} j, ${suivant} repoussée au ${formatJour(echeanceEcart)}.`);
  }
  pourquoi.push(echue ? `Échéance atteinte (${formatJour(echeance)}) : ${suivant} à envoyer.` : `En attente jusqu’au ${formatJour(echeance)} : aucune action aujourd’hui.`);
  return fin(echue ? 'ROUGE' : 'ORANGE', echue ? `Envoyer ${suivant}` : `${suivant} le ${formatJour(echeance)}`, pourquoi, {
    prochainType: suivant, echeance, echue,
  });
}

export const LIBELLE_SOURCE: Record<string, string> = {
  lien_desinscription: 'lien de désinscription',
  one_click: 'désinscription en un clic depuis la messagerie',
  plainte: 'signalement comme indésirable',
  admin: 'saisie par l’administration',
  campagne: 'désinscription de la campagne de bienvenue',
};

/* ─────────────────────────── Contrôle avant envoi ─────────────────────────── */

export type DemandeEnvoi =
  | { mode: 'relance' }                                       // envoi normal : le moteur choisit le modèle
  | { mode: 'exceptionnel'; type: TypeRelance };              // relance manuelle exceptionnelle confirmée

export type Controle =
  | { ok: true; type: TypeRelance; avertissements: string[] }
  | { ok: false; raison: string };

/**
 * Contrôle d'éligibilité (§11) sur une évaluation FRAÎCHE. Toujours bloquants,
 * y compris pour une relance exceptionnelle : connexion, opposition, compte
 * non éligible, adresse invalide ou en erreur, pause globale. Le « déjà
 * envoyé » est en plus garanti par l'index unique en base.
 */
export function controlerEnvoi(ev: Evaluation, demande: DemandeEnvoi, p: Parametres, envoisDuCandidat: EnvoiEtat[] = []): Controle {
  if (p.pause) return { ok: false, raison: 'Envois en pause (paramètre global)' };
  if (ev.connecteAt) return { ok: false, raison: `Déjà connecté (le ${formatDateHeure(ev.connecteAt)})` };
  if (ev.opposition) return { ok: false, raison: 'Opposition / désinscription enregistrée' };
  if (ev.compte !== 'ok') return { ok: false, raison: ev.compteDetail ?? ETAT_COMPTE_LABEL[ev.compte] };
  if (ev.bloque) return { ok: false, raison: `Adresse en erreur (hard bounce) : ${ev.bloque.adresse}` };
  if (!emailValide(ev.email)) return { ok: false, raison: `Adresse e-mail invalide : ${ev.email}` };

  if (demande.mode === 'relance') {
    if (ev.statut === 'ROUGE' && ev.prochainType) return { ok: true, type: ev.prochainType, avertissements: [] };
    if (ev.statut === 'VIOLET') {
      if (!p.actifs.ancien_acces) return { ok: false, raison: 'Campagne « ancien accès » désactivée' };
      if (!ev.echue) return { ok: false, raison: `Écart minimal non respecté : réactivation possible le ${formatJour(ev.echeance)}` };
      return { ok: true, type: 'ancien_acces', avertissements: [] };
    }
    if (ev.statut === 'ORANGE') return { ok: false, raison: `Pas encore échue : ${ev.prochainType} le ${formatJour(ev.echeance)}` };
    return { ok: false, raison: `${STATUT_LABEL[ev.statut]} : ${ev.prochaineAction}` };
  }

  // Relance exceptionnelle : type choisi par l'administrateur, avertissements.
  const t = demande.type;
  const avertissements: string[] = [];
  const deja = envoisDuCandidat.filter((e) => e.type === t && envoiCompte(e));
  if (deja.length) avertissements.push(`${TYPE_COURT[t]} déjà partie le ${formatDateHeure(dateEnvoi(deja[deja.length - 1]))} : ce serait un second envoi du même modèle.`);
  if (!p.actifs[t]) avertissements.push(`${TYPE_COURT[t]} est désactivée dans les paramètres.`);
  if (ev.prochainType !== t) avertissements.push(`Le moteur prévoit ${ev.prochainType ? `${TYPE_COURT[ev.prochainType]}${ev.echeance ? ` le ${formatJour(ev.echeance)}` : ''}` : 'aucune relance'} (${ev.prochaineAction}).`);
  else if (!ev.echue && ev.echeance) avertissements.push(`Échéance normale le ${formatJour(ev.echeance)} : envoi anticipé.`);
  return { ok: true, type: t, avertissements };
}

/** Évalue tout un état (liste admin, bannière, exports, statistiques). */
export function evaluerTout(etat: { candidats: CandidatEtat[]; envois: EnvoiEtat[]; oppositions: OppositionEtat[] }, p: Parametres, maintenant: Date | string) {
  const parCandidat = new Map<string, EnvoiEtat[]>();
  for (const e of etat.envois) {
    if (!e.candidat_id) continue;
    const l = parCandidat.get(e.candidat_id);
    if (l) l.push(e); else parCandidat.set(e.candidat_id, [e]);
  }
  return etat.candidats.map((c) => {
    const envois = parCandidat.get(c.id) ?? [];
    return { candidat: c, envois, evaluation: evaluerCandidat(c, envois, p, etat.oppositions, { maintenant }) };
  });
}
export type LigneEvaluee = ReturnType<typeof evaluerTout>[number];

/** Résumé de la bannière du tableau de bord (§8, §27). */
export function resumeAction(lignes: LigneEvaluee[]) {
  const r = { aRelancer: 0, R1: 0, R2: 0, R3: 0, anciensAcces: 0 };
  for (const { evaluation: e } of lignes) {
    if (e.statut === 'ROUGE' && e.prochainType && e.prochainType !== 'ancien_acces') { r.aRelancer++; r[e.prochainType]++; }
    if (e.statut === 'VIOLET' && e.prochainType === 'ancien_acces' && e.echue) r.anciensAcces++;
  }
  return r;
}
