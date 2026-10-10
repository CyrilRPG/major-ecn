import type { AnalyseCommentaire } from './analyse-regles';
import type { ReponseExploitee } from './reponses';
import { CRITERE_LABEL, FAMILLE_LABEL, type Critere, type Famille, type NiveauAlerte, type NiveauDifficulte, type TypeAlerte } from './types';

/**
 * Analyse automatique d'une réponse (§4.4, §5.3, §6, §21) — module PUR, testé.
 *
 *   - note de 1 ou 2/5 (à n'importe quelle question notée) → alerte CRITIQUE ;
 *   - note de 3/5 → indicateur de vigilance (statistiques), pas d'alerte individuelle ;
 *   - 4 ou 5/5 → favorable, SAUF commentaire négatif : un commentaire négatif
 *     déclenche son alerte quelle que soit la note ;
 *   - difficulté déclarée, demande de contact → fiche de suivi + alerte de vigilance ;
 *   - difficulté précédente « non » résolue au bilan suivant → vigilance.
 */

export type AlerteACreer = {
  niveau: NiveauAlerte;
  type: TypeAlerte;
  titre: string;
  detail: string;
  /** Clé de déduplication (unique en base). */
  cle: string;
  /** Index du commentaire concerné dans `commentaires` (alerte de commentaire). */
  commentaireIndex?: number;
};

export type DifficulteACreer = {
  cle: string;
  libelle: string;
  categorie: string;
  detail: string | null;
  niveau: NiveauDifficulte;
};

export type AnalyseReponse = { alertes: AlerteACreer[]; difficultes: DifficulteACreer[] };

export function analyserReponse(input: {
  reponseId: string;
  famille: Famille;
  titreContexte: string;
  exploitee: ReponseExploitee;
  /** Analyse de chaque commentaire, même ordre que `exploitee.commentaires`. */
  analyses: AnalyseCommentaire[];
  /** Difficultés encore ouvertes du candidat (persistance). */
  difficultesOuvertes?: { cle: string | null; occurrences: number }[];
}): AnalyseReponse {
  const { reponseId, famille, exploitee: r, analyses } = input;
  const alertes: AlerteACreer[] = [];
  const difficultes: DifficulteACreer[] = [];
  const ctx = `${FAMILLE_LABEL[famille]} — ${input.titreContexte}`;

  // Notes basses : une seule alerte par réponse, qui liste les critères concernés.
  if (r.noteMin !== null && r.noteMin <= 2) {
    const basses = Object.entries(r.notes)
      .filter(([, n]) => typeof n === 'number' && n <= 2)
      .map(([c, n]) => `${CRITERE_LABEL[c as Critere]} : ${n}/5`);
    alertes.push({
      niveau: 'critique', type: 'note_basse', cle: `note_basse:${reponseId}`,
      titre: r.noteGlobale !== null && r.noteGlobale <= 2 ? `Note globale de ${r.noteGlobale}/5` : `Note de ${r.noteMin}/5`,
      detail: `${ctx}. ${basses.length ? basses.join(' · ') : ''}`.trim(),
    });
  }

  analyses.forEach((a, i) => {
    if (a.sentiment !== 'negatif' && a.sentiment !== 'mixte') return;
    if (a.gravite === 'faible') return;
    const c = r.commentaires[i];
    const extrait = c.texte.length > 180 ? c.texte.slice(0, 177) + '…' : c.texte;
    alertes.push({
      niveau: a.gravite === 'critique' ? 'critique' : 'vigilance',
      type: 'commentaire_negatif',
      cle: `commentaire:${reponseId}:${c.questionId}`,
      titre: a.nature === 'reclamation' ? 'Réclamation exprimée dans une enquête' : `Remarque négative${a.themeLibelle ? ` : ${a.themeLibelle.toLowerCase()}` : ''}`,
      detail: `${ctx}. « ${extrait} »`,
      commentaireIndex: i,
    });
  });

  const ouvertes = new Map((input.difficultesOuvertes ?? []).filter((d) => d.cle).map((d) => [d.cle as string, d.occurrences]));
  const niveau = (cle: string): NiveauDifficulte => {
    const occ = ouvertes.get(cle) ?? 0;
    if (occ >= 2) return 'prioritaire';
    if (occ >= 1) return 'persistante';
    return 'ponctuelle';
  };

  if (r.difficulte) {
    const detailHot = r.commentaires.find((c) => c.questionId.startsWith('difficulte'))?.texte ?? null;
    const liste = r.difficultes.length ? r.difficultes : [famille === 'HOT' ? 'Difficulté pendant une séance' : 'Difficulté dans la préparation'];
    for (const d of liste) {
      const cle = `difficulte:${d.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')}`;
      difficultes.push({ cle, libelle: d, categorie: famille === 'HOT' ? 'seance' : 'preparation', detail: detailHot, niveau: niveau(cle) });
    }
    alertes.push({
      niveau: difficultes.some((d) => d.niveau === 'prioritaire') ? 'critique' : 'vigilance',
      type: 'difficulte', cle: `difficulte:${reponseId}`,
      titre: liste.length > 1 ? `${liste.length} difficultés signalées` : `Difficulté signalée : ${liste[0]}`,
      detail: `${ctx}.${detailHot ? ` « ${detailHot.slice(0, 180)} »` : ''}`,
    });
  }

  if (r.demandeContact) {
    alertes.push({
      niveau: 'vigilance', type: 'demande_contact', cle: `contact:${reponseId}`,
      titre: "Souhaite être contacté par l'équipe pédagogique",
      detail: ctx,
    });
    difficultes.push({ cle: 'demande_contact', libelle: 'Demande de contact', categorie: 'accompagnement', detail: null, niveau: niveau('demande_contact') });
  }

  if (r.resolu === 'Non' || r.resolu === 'En partie') {
    alertes.push({
      niveau: r.resolu === 'Non' ? 'critique' : 'vigilance', type: 'difficulte_non_resolue', cle: `non_resolu:${reponseId}`,
      titre: r.resolu === 'Non' ? 'Difficultés précédentes non résolues' : 'Difficultés précédentes résolues en partie',
      detail: ctx,
    });
  }

  return { alertes, difficultes };
}
