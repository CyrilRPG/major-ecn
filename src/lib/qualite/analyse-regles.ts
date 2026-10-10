import type { ContenuType, Gravite, NatureCommentaire, Sentiment } from './types';

/**
 * Analyse des commentaires par RÈGLES (§15) — module PUR, testé.
 *
 * Elle s'applique immédiatement à chaque réponse (alertes sans attendre) et
 * sert de repli quand l'analyse par intelligence artificielle est désactivée
 * ou indisponible. L'IA, lancée ensuite par le balayage, affine la
 * classification ; l'administration peut toujours la corriger. Le texte
 * original n'est jamais modifié.
 *
 * Les thèmes forment un vocabulaire FERMÉ : c'est ce qui permet de regrouper
 * « Le professeur va trop vite », « Impossible de suivre le rythme » et « Les
 * explications sont trop rapides » sous un même thème (§16).
 */

export type Theme = {
  cle: string;
  libelle: string;
  /** Code `categorie:sous_categorie` (§14). */
  categorie: string;
  /** Motifs recherchés dans le texte normalisé (sans accents, minuscules). */
  motifs: string[];
  /** Le thème décrit un problème (un commentaire qui le porte n'est pas positif). */
  probleme: boolean;
};

export const THEMES: Theme[] = [
  { cle: 'rythme_trop_rapide', libelle: 'Rythme pédagogique trop rapide', categorie: 'enseignants:rythme', probleme: true,
    motifs: ['trop vite', 'trop rapide', 'va vite', 'allait vite', 'allez vite', 'suivre le rythme', 'ralentir', 'rythme soutenu', 'rythme trop', 'debit trop', 'parle vite', 'parlait vite', 'impossible de suivre', 'difficile de suivre', 'du mal a suivre', 'pas le temps de noter', 'prendre des notes'] },
  { cle: 'rythme_trop_lent', libelle: 'Rythme trop lent', categorie: 'enseignants:rythme', probleme: true,
    motifs: ['trop lent', 'trop lente', 'lenteur', 'des longueurs', 'trainait', 'trop long', 'trop longue', 's eternise'] },
  { cle: 'explications_peu_claires', libelle: 'Explications peu claires', categorie: 'enseignants:clarte', probleme: true,
    motifs: ['pas clair', 'pas claire', 'peu clair', 'peu claire', 'confus', 'incomprehensible', 'pas compris', 'rien compris', 'difficile a comprendre', 'flou', 'embrouill', 'manque de clarte', 'pas assez explique', 'mal explique', 'detaill'] },
  { cle: 'manque_methodologie', libelle: 'Méthodologie rédactionnelle insuffisante', categorie: 'enseignants:pedagogie', probleme: true,
    motifs: ['methodo', 'mots cles', 'mots-cles', 'mot cle', 'structurer', 'structure de reponse', 'rediger', 'redaction', 'plan de reponse', 'reponse structuree'] },
  { cle: 'manque_exemples', libelle: "Manque d'exemples et de cas pratiques", categorie: 'enseignants:pedagogie', probleme: true,
    motifs: ['plus d exemple', 'manque d exemple', 'pas d exemple', 'cas concret', 'cas pratique', 'plus de cas', 'illustrer'] },
  { cle: 'maitrise_insuffisante', libelle: 'Maîtrise du sujet insuffisante', categorie: 'enseignants:maitrise', probleme: true,
    motifs: ['ne maitrise', 'ne maitrisait', 'maitrise pas', 'maitrisait pas', 'hesitant', 'lisait ses', 'lit ses diapo', 'se trompait', 'se trompe'] },
  { cle: 'disponibilite_enseignants', libelle: 'Disponibilité des enseignants', categorie: 'enseignants:disponibilite', probleme: true,
    motifs: ['pas de reponse', 'repond pas', 'repondu', 'jamais de reponse', 'injoignable', 'pas disponible', 'peu disponible', 'indisponible'] },
  { cle: 'erreur_contenu', libelle: 'Erreur dans un contenu', categorie: 'contenus:exactitude', probleme: true,
    motifs: ['erreur', 'errone', 'faux', 'fausse', 'incorrect', 'inexact', 'coquille', 'contradiction', 'contradictoire'] },
  { cle: 'contenu_non_actualise', libelle: 'Contenu non actualisé', categorie: 'contenus:actualisation', probleme: true,
    motifs: ['pas a jour', 'plus a jour', 'obsolete', 'ancienne recommandation', 'anciennes recommandations', 'recommandations recentes', 'nouvelles recommandations', 'actualis', 'mettre a jour', 'mise a jour', 'depasse', 'date de'] },
  { cle: 'contenu_incomplet', libelle: 'Contenu incomplet', categorie: 'contenus:exhaustivite', probleme: true,
    motifs: ['incomplet', 'incomplete', 'il manque', 'manque des', 'manque la', 'manque le', 'pas traite', 'non traite', 'lacune', 'absent'] },
  { cle: 'pertinence_evc', libelle: 'Pertinence pour les EVC', categorie: 'contenus:pertinence', probleme: true,
    motifs: ['hors programme', 'pas pertinent', 'peu pertinent', 'inutile pour', 'tombe pas', 'tombera pas', 'pas au programme'] },
  { cle: 'correction_contestee', libelle: 'Correction contestée', categorie: 'entrainements:corrections', probleme: true,
    motifs: ['correction fausse', 'correction erronee', 'mauvaise correction', 'corrige faux', 'reponse attendue', 'bonne reponse', 'la correction', 'le corrige'] },
  { cle: 'qroc', libelle: 'QROC', categorie: 'entrainements:qroc', probleme: false, motifs: ['qroc'] },
  { cle: 'dossiers_cliniques', libelle: 'Dossiers cliniques', categorie: 'entrainements:dossiers', probleme: false, motifs: ['dossier clinique', 'dossiers cliniques', 'dossier progressif', ' dp '] },
  { cle: 'annales', libelle: 'Annales', categorie: 'entrainements:annales', probleme: false, motifs: ['annale'] },
  { cle: 'qcm', libelle: 'QCM', categorie: 'entrainements:qcm', probleme: false, motifs: ['qcm', 'question a choix', 'piege'] },
  { cle: 'bug_plateforme', libelle: 'Bug ou dysfonctionnement de la plateforme', categorie: 'plateforme:bugs', probleme: true,
    motifs: ['bug', 'beug', 'plante', 'crash', 'ne marche pas', 'ne marchait pas', 'ne fonctionne pas', 'ne fonctionnait pas', 'page blanche', 'erreur 500', 'message d erreur', 'ca rame', 'lent a charger', 'charge pas', 'chargement'] },
  { cle: 'video_replay', libelle: 'Problème de vidéo ou de replay', categorie: 'plateforme:videos', probleme: true,
    motifs: ['video coupe', 'son coupe', 'pas de son', 'probleme de son', 'mauvais son', 'image floue', 'saccade', 'replay indisponible', 'replay pas', 'video ne', 'lecture video', 'micro'] },
  { cle: 'acces', libelle: "Problème d'accès", categorie: 'plateforme:acces', probleme: true,
    motifs: ['pas acces', 'plus acces', 'acces refuse', 'impossible de me connecter', 'connexion impossible', 'mot de passe', 'identifiant', 'deconnecte', 'deconnexion', 'lien zoom ne'] },
  { cle: 'ergonomie', libelle: 'Navigation et ergonomie', categorie: 'plateforme:ergonomie', probleme: true,
    motifs: ['pas intuitif', 'peu intuitif', 'difficile de trouver', 'on ne trouve', 'navigation', 'ergonom', 'interface', 'trop de clics'] },
  { cle: 'planning', libelle: 'Planning et horaires', categorie: 'organisation:planning', probleme: true,
    motifs: ['horaire', 'planning', 'trop tard', 'trop tot', 'en meme temps', 'chevauche', 'calendrier'] },
  { cle: 'reports_annulations', libelle: 'Reports et annulations', categorie: 'organisation:reports', probleme: true,
    motifs: ['report', 'annul', 'decale', 'repousse', 'deplace au dernier'] },
  { cle: 'communication', libelle: 'Information et communication', categorie: 'organisation:communication', probleme: true,
    motifs: ['pas informe', 'pas prevenu', 'pas ete prevenu', 'manque d information', 'manque de communication', 'aucune information', 'communication'] },
  { cle: 'accompagnement_individuel', libelle: 'Accompagnement individuel insuffisant', categorie: 'accompagnement:suivi_individuel', probleme: true,
    motifs: ['pas de suivi', 'peu de suivi', 'manque de suivi', 'livre a moi', 'seul face', 'pas accompagne', 'plus d accompagnement', 'besoin d aide', 'besoin d un suivi'] },
  { cle: 'reactivite_support', libelle: 'Réactivité du support', categorie: 'accompagnement:reactivite', probleme: true,
    motifs: ['delai de reponse', 'toujours pas de reponse', 'attends une reponse', 'attend une reponse', 'relance sans', 'pas de retour'] },
  { cle: 'rapport_qualite_prix', libelle: 'Rapport qualité-prix', categorie: 'formation:rapport_qualite_prix', probleme: true,
    motifs: ['trop cher', 'prix', 'tarif', 'rembours', 'pas rentable', 'cher pour'] },
  { cle: 'attentes_decues', libelle: 'Formation différente des attentes', categorie: 'formation:attentes', probleme: true,
    motifs: ['decu', 'decue', 'decevant', 'decevante', 'deception', 'pas a la hauteur', 'pas ce qui', 'promis', 'annonce', 'publicite mensongere'] },
  { cle: 'supports', libelle: 'Supports pédagogiques', categorie: 'contenus:pertinence', probleme: true,
    motifs: ['support', 'diapo', 'slides', 'polycop', 'pas de pdf', 'documents de cours'] },
];

const POSITIFS = [
  'merci', 'super', 'excellent', 'excellente', 'top', 'tres bien', 'parfait', 'parfaite', 'genial', 'geniale', 'bravo',
  'tres utile', 'utile', 'au top', 'tres bon', 'tres bonne', 'satisfait', 'satisfaite', 'efficace', 'interessant',
  'interessante', 'clair et', 'tres clair', 'tres claire', 'pedagogue', 'agreable', 'qualite', 'continuez', 'rien a redire',
  'impeccable', 'formidable', 'riche', 'complet', 'complete', 'bien explique', 'bien structure',
];

const NEGATIFS = [
  'nul', 'nulle', 'mauvais', 'mauvaise', 'dommage', 'probleme', 'difficile', 'insuffisant', 'insuffisante', 'regret',
  'pire', 'inadmissible', 'inacceptable', 'scandal', 'honteux', 'honte', 'colere', 'decu', 'decue', 'deception', 'decevant',
  'manque', 'trop', 'pas assez', 'pas clair', 'pas claire', 'aucun interet', 'perte de temps', 'ennuy', 'mediocre',
  'catastroph', 'lamentable', 'agace', 'frustr', 'enerv', 'n importe quoi', 'inutile', 'bacle',
];

/** Réponses « rien à signaler » : jamais négatives. */
const NEUTRES_EXACTS = [
  'rien', 'ras', 'r a s', 'rien a signaler', 'rien a ajouter', 'rien de plus', 'aucun', 'aucune', 'non', 'nan',
  'pas de remarque', 'pas de remarques', 'aucune remarque', 'pas de souci', 'pas de soucis', 'pas de probleme', 'non merci',
  'rien de particulier', 'je ne vois pas', 'nothing', 'no', 'n a', 'na', 'ok', '/', '-', '.',
];

const RECLAMATION = [
  'reclamation', 'rembours', 'plainte', 'litige', 'mise en demeure', 'avocat', 'arnaque', 'escroquer', 'inadmissible',
  'inacceptable', 'scandal', 'je demande', 'j exige', 'nous exigeons', 'resilier', 'resiliation', 'annuler mon inscription',
];
const GRAVES = ['harcel', 'insult', 'irrespect', 'humili', 'mepris', 'discrimin', 'raciste', 'sexiste', 'menace', 'agress'];
const DEMANDE = [
  'contactez', 'contacter', 'rappelez', 'me rappeler', 'besoin d aide', 'pouvez vous', 'pourriez vous', 'pourrait on',
  'j aimerais etre', 'merci de me', 'aidez', 'urgent', 'svp', 's il vous plait', 'que quelqu un', 'qu on me', 'je souhaiterais',
];

/** Texte → forme comparable : minuscules, sans accents ni ponctuation, espaces simples, bordé d'espaces. */
export function normaliser(texte: string): string {
  return ' ' + texte
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[’'`´]/g, ' ')
    .replace(/[^a-z0-9%]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() + ' ';
}

/** Motif cherché en DÉBUT de mot (« rembours » trouve « remboursement », « nul » ne trouve pas « annuler »). */
const contient = (t: string, motif: string) => t.includes(motif.startsWith(' ') ? motif : ` ${motif}`);

export type AnalyseCommentaire = {
  sentiment: Sentiment;
  /** Thème principal (vocabulaire fermé) ; null si aucun. */
  themeCle: string | null;
  themeLibelle: string | null;
  /** Sujet principal lisible. */
  sujet: string | null;
  /** Codes `categorie:sous` : principal puis secondaires. */
  categories: string[];
  gravite: Gravite;
  demandeIntervention: boolean;
  nature: NatureCommentaire;
  contenuType: ContenuType | null;
  /** Indices bruts (utile au débogage et aux tests). */
  scores: { positif: number; negatif: number };
};

export function analyserCommentaire(texte: string, noteAssociee?: number | null): AnalyseCommentaire {
  const t = normaliser(texte);
  const nu = t.trim();
  const vide = nu.length === 0 || NEUTRES_EXACTS.includes(nu);

  const themes = vide ? [] : THEMES
    .map((th) => ({ th, n: th.motifs.reduce((acc, m) => acc + (contient(t, m) ? 1 : 0), 0) }))
    .filter((x) => x.n > 0)
    // Les thèmes « problème » passent devant les thèmes de simple sujet (QCM, annales…).
    .sort((a, b) => Number(b.th.probleme) - Number(a.th.probleme) || b.n - a.n);

  let positif = vide ? 0 : POSITIFS.reduce((acc, m) => acc + (contient(t, m) ? 1 : 0), 0);
  let negatif = vide ? 0 : NEGATIFS.reduce((acc, m) => acc + (contient(t, m) ? 1 : 0), 0);
  // « pas » / « ne … pas » devant un mot positif : « pas clair », « pas utile », « pas top ».
  if (!vide && /\b(pas|plus|jamais|peu) (tres |assez |vraiment |du tout )?(clair|claire|utile|top|bien|bon|bonne|efficace|interessant|interessante|satisfait|satisfaite|pertinent|pertinente|adapte|adaptee|a jour)\b/.test(t)) {
    negatif += 2;
    positif = Math.max(0, positif - 1);
  }
  const problemes = themes.filter((x) => x.th.probleme).length;
  negatif += problemes;
  const reclamation = !vide && RECLAMATION.some((m) => contient(t, m));
  const grave = !vide && GRAVES.some((m) => contient(t, m));
  const demande = !vide && DEMANDE.some((m) => contient(t, m));

  let sentiment: Sentiment;
  if (vide) sentiment = 'neutre';
  else if (negatif > 0 && positif > 0) sentiment = negatif >= positif + 2 ? 'negatif' : 'mixte';
  else if (negatif > 0) sentiment = 'negatif';
  else if (positif > 0) sentiment = 'positif';
  else sentiment = typeof noteAssociee === 'number' && noteAssociee <= 2 ? 'negatif' : 'neutre';
  if (reclamation || grave) sentiment = 'negatif';

  let gravite: Gravite = 'faible';
  if (grave || (reclamation && negatif > 0)) gravite = 'critique';
  else if (reclamation) gravite = 'elevee';
  else if (sentiment === 'negatif' && (themes.some((x) => ['erreur_contenu', 'acces', 'bug_plateforme', 'correction_contestee'].includes(x.th.cle)) || negatif >= 4 || demande)) gravite = 'elevee';
  else if (sentiment === 'negatif' || sentiment === 'mixte') gravite = 'moyenne';

  let nature: NatureCommentaire = 'remarque';
  if (reclamation) nature = 'reclamation';
  else if (demande && themes.some((x) => ['acces', 'bug_plateforme', 'video_replay'].includes(x.th.cle))) nature = 'assistance';

  let contenuType: ContenuType | null = null;
  if (/\bqroc\b/.test(t)) contenuType = 'qroc';
  else if (/\bqcm\b/.test(t)) contenuType = 'qcm';
  else if (/\b(dossier|dp)\b/.test(t)) contenuType = 'dossier';
  else if (/\bannales?\b/.test(t)) contenuType = 'annale';
  else if (/\bfiches?\b/.test(t)) contenuType = 'fiche';
  else if (/\b(correction|corrige)\b/.test(t)) contenuType = 'correction';
  else if (/\b(video|replay)\b/.test(t)) contenuType = 'video';

  const principal = themes[0]?.th ?? null;
  const categories = Array.from(new Set(themes.map((x) => x.th.categorie)));
  if (reclamation) categories.push('reclamations:' + (demande ? 'demande_resolution' : 'insatisfaction_formelle'));
  if (categories.length === 0 && !vide && sentiment !== 'neutre') categories.push('formation:satisfaction');

  return {
    sentiment,
    themeCle: principal?.cle ?? null,
    themeLibelle: principal?.libelle ?? null,
    sujet: principal?.libelle ?? (categories[0] === 'formation:satisfaction' ? 'Satisfaction générale' : null),
    categories,
    gravite,
    demandeIntervention: demande,
    nature,
    contenuType,
    scores: { positif, negatif },
  };
}

export function themeParCle(cle: string | null | undefined): Theme | null {
  if (!cle) return null;
  return THEMES.find((t) => t.cle === cle) ?? null;
}

/** Commentaire « analysable » au sens du taux de commentaires négatifs (§17). */
export function estAnalysable(texte: string): boolean {
  const nu = normaliser(texte).trim();
  return nu.length >= 2 && !NEUTRES_EXACTS.includes(nu);
}
