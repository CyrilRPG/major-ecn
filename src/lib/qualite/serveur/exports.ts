import 'server-only';
import type { Filtres } from '../filtres';
import { dateFr } from '../format';
import { CRITERE_LABEL, FAMILLE_LABEL, STATUT_ENVOI_LABEL, libelleCategorie, type Critere, type Famille, type StatutEnvoi } from '../types';
import { calculerIndicateurs, chargerCommentaires, chargerEnvois, chargerReponses, listeCandidats, nomsCandidats } from './admin';
import { qdb, toutesLesLignes } from './base';

/**
 * Exports (§33 traçabilité Qualiopi) : une feuille par registre. Le dossier
 * « Qualiopi » rassemble tout sur la période choisie. Ces fichiers sont des
 * éléments de traçabilité, pas une attestation de conformité.
 */

export type Feuille = { nom: string; lignes: Record<string, string | number | null>[] };

const oui = (b: boolean | null | undefined) => (b === true ? 'Oui' : b === false ? 'Non' : '');

async function feuilleEnvois(f: Filtres): Promise<Feuille> {
  const envois = await chargerEnvois(f);
  const noms = await nomsCandidats(envois.map((e) => e.user_id));
  return {
    nom: 'Questionnaires envoyés',
    lignes: envois.map((e) => ({
      Identifiant: e.id, Candidat: noms.get(e.user_id)?.nom ?? '', Email: noms.get(e.user_id)?.email ?? '', Questionnaire: FAMILLE_LABEL[e.famille], Titre: e.titre,
      'Prévu le': dateFr(e.programme_pour, true), 'Envoyé le': dateFr(e.envoye_at, true), Statut: STATUT_ENVOI_LABEL[e.statut as StatutEnvoi], 'Complété le': dateFr(e.complete_at, true),
      Obligatoire: oui(e.obligatoire), 'Périmètre de blocage': e.blocking_scope, Relances: e.relances, 'Motif neutralisation': e.neutralise_motif, 'Motif dispense': e.dispense_motif,
      Session: e.exam_session_id, Spécialités: (e.contexte?.candidat?.colleges ?? []).join(', '), Voie: e.contexte?.candidat?.voie ?? '',
    })),
  };
}

async function feuilleReponses(f: Filtres): Promise<Feuille> {
  const reps = await chargerReponses(f);
  const noms = await nomsCandidats(reps.map((r) => r.user_id ?? ''));
  return {
    nom: 'Réponses',
    lignes: reps.map((r) => {
      const base: Record<string, string | number | null> = {
        Identifiant: r.id, Candidat: r.user_id ? noms.get(r.user_id)?.nom ?? '' : 'Compte supprimé', Questionnaire: FAMILLE_LABEL[r.famille as Famille] ?? r.famille,
        Version: r.questionnaire_code, 'Répondu le': dateFr(r.soumis_at, true), Canal: r.canal, 'Note globale': r.note_globale, 'Note minimale': r.note_min,
        Difficulté: oui(r.difficulte), 'Demande de contact': oui(r.demande_contact), Recommandation: r.recommandation, Enseignant: r.enseignant_nom, Séance: r.seance_id,
        Mode: r.mode, Spécialités: r.colleges.join(', '), Voie: r.voie, Formule: r.formule, Promotion: r.promotion, Session: r.exam_session_id,
      };
      for (const [c, n] of Object.entries(r.notes ?? {})) base[`Note — ${CRITERE_LABEL[c as Critere] ?? c}`] = n as number;
      for (const q of r.questions ?? []) {
        const v = r.reponses?.[q.id];
        if (q.type === 'note5' || v === null || v === undefined) continue;
        base[q.libelle.slice(0, 80)] = Array.isArray(v) ? v.join(' | ') : typeof v === 'boolean' ? oui(v) : String(v);
      }
      return base;
    }),
  };
}

async function feuilleCommentaires(f: Filtres): Promise<Feuille> {
  const coms = await chargerCommentaires(f);
  const noms = await nomsCandidats(coms.map((c) => c.user_id ?? ''));
  return {
    nom: 'Remarques',
    lignes: coms.map((c) => ({
      Identifiant: c.id, Date: dateFr(c.created_at, true), Candidat: c.user_id ? noms.get(c.user_id)?.nom ?? '' : 'Compte supprimé', Questionnaire: FAMILLE_LABEL[c.famille as Famille] ?? c.famille,
      Question: c.question_libelle, 'Texte original': c.texte, 'Note associée': c.note_associee, Sentiment: c.sentiment, Thème: c.theme_libelle,
      Catégories: c.categories.map(libelleCategorie).join(' | '), Gravité: c.gravite, Nature: c.nature, 'Demande d’intervention': oui(c.demande_intervention),
      Contenu: [c.contenu_type, c.contenu_label].filter(Boolean).join(' : '), Enseignant: c.enseignant_nom, 'Classé par': c.analyse_source, 'Corrigé le': dateFr(c.corrige_at, true),
    })),
  };
}

async function feuilleTable(nom: string, table: string, map: (r: Record<string, unknown>) => Record<string, string | number | null>, f: Filtres, colDate = 'created_at'): Promise<Feuille> {
  const rows = await toutesLesLignes<Record<string, unknown>>((a, b) => {
    let q = qdb().from(table).select('*');
    if (f.du) q = q.gte(colDate, `${f.du}T00:00:00+01:00`);
    if (f.au) q = q.lte(colDate, `${f.au}T23:59:59+01:00`);
    return q.order(colDate, { ascending: false }).order('id').range(a, b);
  });
  return { nom, lignes: rows.map(map) };
}

const s = (v: unknown) => (v === null || v === undefined ? null : typeof v === 'object' ? JSON.stringify(v) : (v as string | number));

export async function construireExport(type: string, f: Filtres): Promise<Feuille[]> {
  const alertes = () => feuilleTable('Alertes', 'qualite_alertes', (r) => ({ Numéro: s(r.numero), Créée: dateFr(r.created_at as string, true), Niveau: s(r.niveau), Type: s(r.type), Titre: s(r.titre), Détail: s(r.detail), Statut: s(r.statut), Traitement: s(r.traitement), 'Traitée le': dateFr(r.traitee_at as string, true), 'E-mail direction': dateFr(r.email_envoye_at as string, true) }), f);
  const actions = () => feuilleTable('Actions correctives', 'qualite_actions', (r) => ({ Numéro: s(r.numero), Titre: s(r.titre), 'Problème constaté': s(r.probleme), Cause: s(r.cause), 'Action décidée': s(r.action_decidee), Responsable: s(r.responsable_nom), 'Date limite': s(r.echeance), Statut: s(r.statut), 'Réalisée le': dateFr(r.realisee_at as string), 'Mesure avant': s(r.mesure_avant), 'Mesure après': s(r.mesure_apres), 'Constat d’efficacité': s(r.efficacite_constat), 'Sans suite': s(r.justification_sans_suite), 'Clôturée le': dateFr(r.cloture_at as string) }), f);
  const reclamations = () => feuilleTable('Réclamations', 'cockpit_reclamations', (r) => ({ Identifiant: s(r.id), Reçue: dateFr(r.created_at as string, true), Candidat: s(r.candidat_label), Sujet: s(r.sujet), Motif: s(r.motif), Catégorie: s(r.categorie), Priorité: s(r.priorite), Statut: s(r.statut), Décision: s(r.decision), 'Clôturée le': dateFr(r.cloturee_at as string), Origine: s(r.origine) }), f);
  const verifs = () => feuilleTable('Vérifications contenus', 'qualite_verifications', (r) => ({ Numéro: s(r.numero), Nature: s(r.nature), Contenu: s(r.contenu_label), Type: s(r.contenu_type), Demande: s(r.demande), Source: s(r.source_citee), Relecteur: s(r.responsable_nom), Statut: s(r.statut), Décision: s(r.decision), Justification: s(r.decision_detail), 'Vérifiée le': dateFr(r.verifiee_at as string), 'Mise à jour le': dateFr(r.mise_a_jour_at as string), Version: s(r.version_corrigee) }), f);
  const interventions = async () => {
    const fe = await feuilleTable('Interventions', 'qualite_interventions', (r) => ({ Candidat: s(r.user_id), 'Signalé le': dateFr(r.signale_at as string), Type: s(r.type), Action: s(r.action), 'Traité par': s(r.traite_par_nom), Statut: s(r.statut), 'Réalisée le': dateFr(r.realisee_at as string), Résultat: s(r.resultat), 'Avis du candidat': s(r.retour_candidat) }), f);
    const noms = await nomsCandidats(fe.lignes.map((l) => String(l.Candidat ?? '')));
    fe.lignes = fe.lignes.map((l) => ({ ...l, Candidat: noms.get(String(l.Candidat))?.nom ?? l.Candidat }));
    return fe;
  };
  const journal = () => feuilleTable('Journal', 'qualite_journal', (r) => ({ Date: dateFr(r.at as string, true), Objet: s(r.objet_type), Identifiant: s(r.objet_id), Action: s(r.action), Candidat: s(r.user_id), Auteur: s(r.auteur_nom), Détails: s(r.details) }), f, 'at');
  const parametres = () => feuilleTable('Historique paramètres', 'qualite_parametres_historique', (r) => ({ Date: dateFr(r.at as string, true), Auteur: s(r.auteur_nom), Motif: s(r.motif), Configuration: s(r.apres) }), f, 'at');

  switch (type) {
    case 'envois': return [await feuilleEnvois(f)];
    case 'reponses': return [await feuilleReponses(f)];
    case 'commentaires': return [await feuilleCommentaires(f)];
    case 'alertes': return [await alertes()];
    case 'actions': return [await actions()];
    case 'reclamations': return [await reclamations()];
    case 'verifications': return [await verifs()];
    case 'interventions': return [await interventions()];
    case 'journal': return [await journal()];
    case 'candidats': {
      const l = await listeCandidats();
      return [{ nom: 'Candidats', lignes: l.map((c) => ({ Nom: c.nom, Email: c.email, Promotion: c.promotion, Formules: c.formules.join(' + '), Voie: c.voie, Spécialités: c.specialites.join(', '), 'Première épreuve': c.premiereEpreuve, Progression: c.progression === null ? null : Math.round(c.progression), 'Enquêtes complétées': c.completes, 'Enquêtes attendues': c.attendus, 'Dernière note': c.derniereNote, 'Difficultés ouvertes': c.difficultes, 'Niveau': c.difficulteMax, 'Palier d’inactivité': c.inactivitePalier, 'Alertes ouvertes': c.alertes })) }];
    }
    case 'enseignants': {
      const reps = await chargerReponses({ ...f, famille: 'HOT' });
      const coms = await chargerCommentaires({ ...f, famille: 'HOT' });
      const cles = Array.from(new Set(reps.map((r) => r.enseignant_cle).filter((x): x is string => !!x)));
      return [{ nom: 'Enseignants', lignes: cles.map((cle) => {
        const r = reps.filter((x) => x.enseignant_cle === cle);
        const i = calculerIndicateurs(r, coms.filter((c) => c.enseignant_cle === cle), []);
        const ligne: Record<string, string | number | null> = { Enseignant: r[0]?.enseignant_nom ?? cle, Réponses: i.reponses, Répondants: i.repondants, 'Note moyenne': i.moyenne.moyenne, 'Satisfaction %': i.satisfaction.pct, 'Défavorables %': i.defavorables.pct, 'Commentaires négatifs %': i.commentairesNegatifs.pct, Séances: new Set(r.map((x) => x.seance_id)).size };
        for (const [c, m] of Object.entries(i.criteres)) ligne[CRITERE_LABEL[c as Critere] ?? c] = m?.moyenne ?? null;
        return ligne;
      }) }];
    }
    case 'qualiopi': {
      const [envois, reponses, commentaires] = await Promise.all([feuilleEnvois(f), feuilleReponses(f), feuilleCommentaires(f)]);
      const repsBrutes = await chargerReponses(f);
      const comsBruts = await chargerCommentaires(f);
      const envBruts = await chargerEnvois(f);
      const ind = calculerIndicateurs(repsBrutes, comsBruts, envBruts);
      const synthese: Feuille = {
        nom: 'Synthèse',
        lignes: [
          { Indicateur: 'Période', Valeur: `${f.du ?? 'origine'} → ${f.au ?? 'aujourd’hui'}`, Effectif: null },
          { Indicateur: 'Taux de participation (%)', Valeur: ind.participation.pct, Effectif: `${ind.participation.n}/${ind.participation.total}` },
          { Indicateur: 'Note globale moyenne (/5)', Valeur: ind.moyenne.moyenne, Effectif: ind.moyenne.n },
          { Indicateur: 'Satisfaction 4-5/5 (%)', Valeur: ind.satisfaction.pct, Effectif: `${ind.satisfaction.n}/${ind.satisfaction.total}` },
          { Indicateur: 'Notes défavorables 1-2/5 (%)', Valeur: ind.defavorables.pct, Effectif: `${ind.defavorables.n}/${ind.defavorables.total}` },
          { Indicateur: 'Commentaires négatifs (%)', Valeur: ind.commentairesNegatifs.pct, Effectif: `${ind.commentairesNegatifs.n}/${ind.commentairesNegatifs.total}` },
          { Indicateur: 'NPS', Valeur: ind.nps.score, Effectif: ind.nps.n },
          { Indicateur: 'Candidats répondants', Valeur: ind.repondants, Effectif: null },
          { Indicateur: 'Avertissement', Valeur: 'Élément de traçabilité exporté de la plateforme ; ne constitue pas, seul, une preuve de conformité Qualiopi.', Effectif: null },
        ],
      };
      return [synthese, envois, reponses, commentaires, await alertes(), await reclamations(), await actions(), await verifs(), await interventions(), await parametres(), await journal()];
    }
    default: throw new Error('Type d’export inconnu');
  }
}
