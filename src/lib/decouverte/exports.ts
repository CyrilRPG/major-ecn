/**
 * Tables d'export (CSV / Excel) du module de relances (cahier §21, §29) : la
 * liste filtrée, l'historique des envois des candidats filtrés et les
 * statistiques du même périmètre. Construites à partir des lignes DÉJÀ
 * filtrées par `appliquer()` : un export reflète exactement l'écran.
 *
 * Module PUR (pas de dépendance serveur).
 */
import { formatDateHeure, formatDuree, formatJour } from './dates';
import { formatTaux, type Kpi } from './kpi';
import type { LigneEvaluee } from './moteur';
import { ORIGINE_LABEL, STATUT_LABEL, TYPE_COURT, TYPES_RELANCE, dateEnvoi, type TypeRelance } from './types';

export type Table = { nom: string; entetes: string[]; lignes: Array<Array<string | number>> };

const nomDe = (l: LigneEvaluee) => [l.candidat.prenom, l.candidat.nom].filter(Boolean).join(' ');

export function tableListe(lignes: LigneEvaluee[]): Table {
  return {
    nom: 'Candidats',
    entetes: ['Candidat', 'Prénom', 'Nom', 'E-mail', 'Téléphone', 'Spécialité', 'Voie', 'Origine', 'Demande', 'Nombre de demandes',
      'Compte créé', 'Accès initial (J0)', 'Ancienneté (jours)', 'Première connexion', 'Date approchée', 'Dernière connexion',
      'Dernière relance', 'Type de la dernière relance', 'Relances R envoyées', 'Prochaine action', 'Date de la prochaine action',
      'Statut', 'Pourquoi', 'Désinscription / opposition', 'Adresse en erreur', 'Relance attribuée', 'Délai relance → connexion', 'Identifiant'],
    lignes: lignes.map((l) => {
      const c = l.candidat, e = l.evaluation;
      const att = c.relance_attribuee ? l.envois.find((x) => x.id === c.relance_attribuee) : null;
      return [
        nomDe(l), c.prenom ?? '', c.nom ?? '', e.email, c.telephone ?? '', c.specialite ?? '', c.voie ?? '', c.origine ?? '',
        formatDateHeure(c.demande_at), c.nb_demandes ?? 1, formatDateHeure(c.compte_cree_at), formatDateHeure(e.j0), e.ancienneteJours,
        formatDateHeure(e.connecteAt), e.connecteAt && e.connexionApprochee ? 'oui' : '', formatDateHeure(c.derniere_connexion_at ?? c.auth_last_sign_in_at),
        formatDateHeure(e.derniereRelanceAt), e.derniereRelanceType ?? '', e.nbRelances, e.prochaineAction, formatJour(e.echeance),
        STATUT_LABEL[e.statut], e.pourquoi.join(' '), e.opposition ? formatDateHeure(e.opposition.created_at) : '',
        e.bloque ? `${e.bloque.adresse} (${e.bloque.raison ?? 'rejet définitif'})` : '',
        att ? TYPE_COURT[att.type] : '', formatDuree(c.delai_connexion_sec), c.id,
      ];
    }),
  };
}

export function tableHistorique(lignes: LigneEvaluee[]): Table {
  const rows: Table['lignes'] = [];
  for (const l of lignes) {
    for (const e of [...l.envois].sort((a, b) => dateEnvoi(a).localeCompare(dateEnvoi(b)))) {
      rows.push([
        nomDe(l), l.evaluation.email, TYPE_COURT[e.type], ORIGINE_LABEL[e.origine] ?? e.origine, e.exceptionnel ? 'oui' : '',
        e.statut, formatDateHeure(dateEnvoi(e)), e.date_approx ? 'oui' : '', e.email_utilise ?? '', e.sujet ?? '', e.modele_version ?? '',
        e.envoye_par_nom ?? '', e.operation_id ?? '', formatDateHeure(e.delivre_at), formatDateHeure(e.ouvert_at), e.nb_ouvertures ?? 0,
        formatDateHeure(e.clic_cta_at), e.nb_clics_cta ?? 0, formatDateHeure(e.clic_video_at), e.nb_clics_video ?? 0,
        e.bounce_at ? `${formatDateHeure(e.bounce_at)} (${e.bounce_type ?? ''})` : '', formatDateHeure(e.plainte_at), formatDateHeure(e.desinscrit_at),
        e.erreur ?? '', e.commentaire ?? '', l.candidat.relance_attribuee === e.id ? 'oui' : '', e.id,
      ]);
    }
  }
  return {
    nom: 'Historique des envois',
    entetes: ['Candidat', 'E-mail actif', 'Type', 'Origine', 'Exceptionnel', 'Statut', 'Date', 'Date approchée', 'Adresse utilisée', 'Objet',
      'Version du modèle', 'Envoyé par', 'Opération', 'Délivré', 'Première ouverture (indicatif)', 'Ouvertures', 'Premier clic plateforme',
      'Clics plateforme', 'Premier clic vidéo', 'Clics vidéo', 'Bounce', 'Plainte', 'Désinscription', 'Erreur', 'Commentaire',
      'Relance attribuée à la connexion', 'Identifiant d’envoi'],
    lignes: rows,
  };
}

const LIBELLE_MODELE: Record<TypeRelance, string> = { R1: 'R1', R2: 'R2', R3: 'R3', ancien_acces: 'Ancien accès' };

export function tablesStats(k: Kpi, perimetre: string): Table[] {
  const synthese: Table = {
    nom: 'Synthèse',
    entetes: ['Indicateur', 'Valeur'],
    lignes: [
      ['Périmètre', perimetre],
      ['Demandes', k.demandes],
      ['Jamais connectés', k.jamaisConnectes],
      ['En attente', k.enAttente],
      ['À relancer (R1 / R2 / R3)', `${k.aRelancer} (${k.aRelancerParNiveau.R1} / ${k.aRelancerParNiveau.R2} / ${k.aRelancerParNiveau.R3})`],
      ['Anciens accès', k.anciensAcces],
      ['Activés (première connexion)', k.actives],
      ['Terminés', k.termines],
      ['Désinscrits / oppositions', k.desinscrits],
      ['Adresses en erreur', k.erreurs],
      ['Premières connexions attribuées à une relance', k.connexionsAttribueesTotal],
      ['Premières connexions sans relance attribuée', k.connexionsSansRelance],
      ['Taux d’activation global', formatTaux(k.tauxActivationGlobal)],
      ['Délai moyen relance → première connexion', formatDuree(k.delaiMoyenSec)],
      ['Délai médian relance → première connexion', formatDuree(k.delaiMedianSec)],
    ],
  };
  const modeles: Table = {
    nom: 'Par modèle',
    entetes: ['Modèle', 'Envoyés', 'dont importés / saisis', 'Délivrés', 'Ouverts (indicatif)', 'Clics plateforme', 'Clics vidéo', 'Bounces', 'Échecs',
      'Premières connexions attribuées', 'Taux d’activation', 'Délai moyen → connexion', 'Délai médian → connexion', 'Désinscriptions', 'Taux de désinscription'],
    lignes: TYPES_RELANCE.map((t) => {
      const m = k.parModele[t];
      return [LIBELLE_MODELE[t], m.envoyes, m.dontImportes, m.delivres, m.ouverts, m.clicsCta, m.clicsVideo, m.bounces, m.echecs,
        m.connexionsAttribuees, formatTaux(m.tauxActivation), formatDuree(m.delaiMoyenSec), formatDuree(m.delaiMedianSec), m.desinscriptions, formatTaux(m.tauxDesinscription)];
    }),
  };
  return [synthese, modeles];
}
