import type { Famille, Question, TypeSeance } from './types';

/**
 * Questionnaires par défaut (textes du cahier des charges §4.2, §5.2, §6, §7.2,
 * §8.2, §9). Ils sont créés en base au premier accès au module et deviennent
 * alors modifiables par l'administration (versionnés) ; ce fichier n'est plus
 * lu ensuite que pour « Rétablir le modèle d'origine ».
 */

export type ModeleQuestionnaire = {
  code: string;
  famille: Famille;
  titre: string;
  intro: string;
  typeSeance?: TypeSeance;
  questions: Question[];
};

const DIFFICULTES_PARCOURS = [
  'Organisation du travail et planning',
  'Compréhension de certains cours',
  'Méthodologie des QROC / réponses rédigées',
  'QCM et pièges',
  'Dossiers cliniques',
  'Mémorisation',
  'Manque de temps',
  'Motivation / fatigue',
  'Utilisation de la plateforme',
  'Autre',
];

const HOT: ModeleQuestionnaire = {
  code: 'HOT',
  famille: 'HOT',
  titre: 'Votre avis sur la séance',
  intro: 'Trente secondes pour nous dire comment s\'est passée cette séance. Vous pouvez exprimer librement votre insatisfaction : chaque réponse est lue.',
  questions: [
    { id: 'note_globale', libelle: 'Quelle note globale donnez-vous à cette séance ?', type: 'note5', obligatoire: true, critere: 'globale' },
    { id: 'clarte', libelle: 'Les explications étaient-elles claires ?', type: 'note5', obligatoire: true, critere: 'clarte' },
    { id: 'maitrise', libelle: "L'enseignant maîtrisait-il son sujet ?", type: 'note5', obligatoire: true, critere: 'maitrise' },
    { id: 'rythme', libelle: 'Le rythme de la séance était-il adapté ?', type: 'note5', obligatoire: true, critere: 'rythme' },
    { id: 'pertinence', libelle: 'Le contenu était-il pertinent pour les EVC ?', type: 'note5', obligatoire: true, critere: 'pertinence' },
    { id: 'supports', libelle: 'Les supports pédagogiques étaient-ils satisfaisants ?', type: 'note5', obligatoire: true, critere: 'supports' },
    { id: 'difficulte', libelle: 'Avez-vous rencontré une difficulté ?', type: 'oui_non', obligatoire: true, role: 'difficulte' },
    { id: 'difficulte_detail', libelle: 'Laquelle ?', type: 'texte', obligatoire: false, siQuestion: 'difficulte', siValeur: 'true' },
    { id: 'amelioration', libelle: "Qu'aurions-nous pu améliorer ?", type: 'texte', obligatoire: false },
  ],
};

const HOT_METHODO: ModeleQuestionnaire = {
  code: 'HOT_METHODOLOGIE',
  famille: 'HOT',
  typeSeance: 'methodologie',
  titre: 'Questions complémentaires — méthodologie rédactionnelle',
  intro: '',
  questions: [
    { id: 'methodo_mots_cles', libelle: 'Les mots-clés attendus et la manière de structurer une réponse ont-ils été suffisamment expliqués ?', type: 'note5', obligatoire: true, critere: 'clarte' },
  ],
};

const HOT_QCM: ModeleQuestionnaire = {
  code: 'HOT_QCM',
  famille: 'HOT',
  typeSeance: 'qcm',
  titre: 'Questions complémentaires — séance QCM',
  intro: '',
  questions: [
    { id: 'qcm_pieges', libelle: 'Les pièges et les raisonnements permettant de sélectionner les bonnes réponses ont-ils été clairement expliqués ?', type: 'note5', obligatoire: true, critere: 'clarte' },
  ],
};

const HOT_DOSSIER: ModeleQuestionnaire = {
  code: 'HOT_DOSSIER',
  famille: 'HOT',
  typeSeance: 'dossier',
  titre: 'Questions complémentaires — dossiers cliniques',
  intro: '',
  questions: [
    { id: 'dossier_raisonnement', libelle: 'Le raisonnement clinique attendu à chaque étape du dossier a-t-il été clairement expliqué ?', type: 'note5', obligatoire: true, critere: 'clarte' },
  ],
};

function questionsIntermediaires(): Question[] {
  return [
    { id: 'satisfaction_globale', libelle: 'Quelle est votre satisfaction globale sur la formation à ce stade ?', type: 'note5', obligatoire: true, critere: 'globale' },
    { id: 'enseignements', libelle: 'Comment jugez-vous la qualité des enseignements ?', type: 'note5', obligatoire: true, critere: 'enseignements' },
    { id: 'disponibilite', libelle: 'Les enseignants sont-ils suffisamment disponibles ?', type: 'note5', obligatoire: true, critere: 'disponibilite' },
    { id: 'supports', libelle: 'Les supports sont-ils pertinents ?', type: 'note5', obligatoire: true, critere: 'supports' },
    { id: 'actualisation', libelle: 'Les contenus vous semblent-ils à jour ?', type: 'note5', obligatoire: true, critere: 'actualisation' },
    { id: 'entrainements', libelle: 'Comment jugez-vous la qualité des QCM, QROC et dossiers cliniques ?', type: 'note5', obligatoire: true, critere: 'entrainements' },
    { id: 'plateforme', libelle: "Comment jugez-vous l'ergonomie de la plateforme ?", type: 'note5', obligatoire: true, critere: 'plateforme' },
    { id: 'accompagnement', libelle: "Comment jugez-vous l'accompagnement humain ?", type: 'note5', obligatoire: true, critere: 'accompagnement' },
    { id: 'difficulte', libelle: 'Rencontrez-vous actuellement des difficultés dans votre préparation ?', type: 'oui_non', obligatoire: true, role: 'difficulte' },
    { id: 'difficultes', libelle: 'Lesquelles ? (plusieurs choix possibles)', type: 'choix_multiple', obligatoire: false, options: DIFFICULTES_PARCOURS, role: 'difficultes', siQuestion: 'difficulte', siValeur: 'true' },
    { id: 'contenus_incomplets', libelle: 'Certains contenus vous semblent-ils incomplets ou insuffisamment actualisés ? Lesquels ?', type: 'texte', obligatoire: false },
    { id: 'besoins', libelle: 'De quoi auriez-vous besoin en plus ?', type: 'texte', obligatoire: false },
    { id: 'contact', libelle: "Souhaiteriez-vous être contacté par l'équipe pédagogique ?", type: 'oui_non', obligatoire: true, role: 'contact' },
    { id: 'commentaire', libelle: 'Commentaire libre', type: 'texte', obligatoire: false },
  ];
}

const PROGRESS_33: ModeleQuestionnaire = {
  code: 'PROGRESS_33',
  famille: 'PROGRESS',
  titre: 'Bilan intermédiaire — un tiers du parcours',
  intro: 'Vous avez parcouru environ un tiers de votre formation. Ce bilan nous permet de vérifier que tout se passe bien et de vous aider si ce n\'est pas le cas.',
  questions: questionsIntermediaires(),
};

const PROGRESS_66: ModeleQuestionnaire = {
  code: 'PROGRESS_66',
  famille: 'PROGRESS',
  titre: 'Bilan intermédiaire — deux tiers du parcours',
  intro: 'Vous avez parcouru environ deux tiers de votre formation. Nous mesurons votre évolution depuis le premier bilan.',
  questions: [
    ...questionsIntermediaires().filter((q) => q.id !== 'commentaire'),
    { id: 'resolu', libelle: 'Les difficultés que vous aviez signalées ont-elles été résolues ?', type: 'choix_unique', obligatoire: false, options: ['Oui, entièrement', 'En partie', 'Non', "Je n'avais pas signalé de difficulté"], role: 'resolu' },
    { id: 'progression', libelle: 'Constatez-vous une progression depuis le début de votre préparation ?', type: 'note5', obligatoire: true, critere: 'preparation', role: 'preparation' },
    { id: 'accompagnement_attentes', libelle: "L'accompagnement répond-il à vos attentes ?", type: 'note5', obligatoire: true, critere: 'accompagnement' },
    { id: 'nouvelles_difficultes', libelle: 'De nouvelles difficultés sont-elles apparues ?', type: 'texte', obligatoire: false },
    { id: 'ameliorations_avant_examen', libelle: "Quelles améliorations seraient encore nécessaires avant l'examen ?", type: 'texte', obligatoire: false },
    { id: 'commentaire', libelle: 'Commentaire libre', type: 'texte', obligatoire: false },
  ],
};

const FINAL: ModeleQuestionnaire = {
  code: 'FINAL',
  famille: 'FINAL',
  titre: 'Bilan final de votre formation',
  intro: 'Votre première épreuve approche. Avant de vous laisser vous concentrer sur vos dernières révisions, dites-nous ce que vous avez pensé de l\'ensemble de votre formation Major ECN. Une fois ce bilan complété, vous retrouvez immédiatement tous vos contenus.',
  questions: [
    { id: 'satisfaction_globale', libelle: 'Quelle est votre satisfaction globale sur la formation ?', type: 'note5', obligatoire: true, critere: 'globale' },
    { id: 'enseignants', libelle: 'Qualité des enseignants', type: 'note5', obligatoire: true, critere: 'enseignements' },
    { id: 'directs', libelle: 'Qualité des séances en direct', type: 'note5', obligatoire: true, critere: 'directs' },
    { id: 'replays', libelle: 'Qualité des replays', type: 'note5', obligatoire: true, critere: 'replays' },
    { id: 'fiches', libelle: 'Pertinence des fiches', type: 'note5', obligatoire: true, critere: 'fiches' },
    { id: 'actualisation', libelle: 'Actualisation des contenus', type: 'note5', obligatoire: true, critere: 'actualisation' },
    { id: 'entrainements', libelle: 'Qualité des entraînements', type: 'note5', obligatoire: true, critere: 'entrainements' },
    { id: 'corrections', libelle: 'Qualité des corrections', type: 'note5', obligatoire: true, critere: 'corrections' },
    { id: 'plateforme', libelle: 'Fonctionnement de la plateforme', type: 'note5', obligatoire: true, critere: 'plateforme' },
    { id: 'accompagnement', libelle: 'Accompagnement humain', type: 'note5', obligatoire: true, critere: 'accompagnement' },
    { id: 'organisation', libelle: 'Organisation et communication', type: 'note5', obligatoire: true, critere: 'organisation' },
    { id: 'adequation', libelle: 'La formation reçue correspond-elle à la formation annoncée ?', type: 'note5', obligatoire: true, critere: 'adequation' },
    { id: 'preparation', libelle: 'Indépendamment de votre satisfaction, vous sentez-vous prêt(e) pour les épreuves ?', type: 'note5', obligatoire: true, critere: 'preparation', role: 'preparation', aide: 'Cette question mesure votre niveau de préparation ressenti, pas votre satisfaction.' },
    { id: 'recommandation', libelle: 'Recommanderiez-vous Major ECN à un collègue ? (0 = pas du tout, 10 = certainement)', type: 'recommandation', obligatoire: true },
    { id: 'contact', libelle: "Souhaitez-vous être contacté par l'équipe pédagogique avant les épreuves ?", type: 'oui_non', obligatoire: false, role: 'contact' },
    { id: 'suggestions', libelle: "Vos suggestions d'amélioration", type: 'texte', obligatoire: false },
  ],
};

const POST_EXAM: ModeleQuestionnaire = {
  code: 'POST_EXAM',
  famille: 'POST_EXAM',
  titre: 'Après les épreuves : votre retour',
  intro: 'Vos épreuves sont terminées. Votre retour aidera directement les promotions suivantes. Ce questionnaire est facultatif.',
  questions: [
    { id: 'adequation_sujets', libelle: 'Les enseignements correspondaient-ils aux sujets rencontrés ?', type: 'note5', obligatoire: true, critere: 'pertinence' },
    { id: 'qcm_qroc', libelle: "Les QCM et QROC d'entraînement étaient-ils pertinents ?", type: 'note5', obligatoire: true, critere: 'entrainements' },
    { id: 'dossiers', libelle: 'Étiez-vous bien préparé(e) aux dossiers cliniques ?', type: 'note5', obligatoire: true, critere: 'preparation' },
    { id: 'methodologie', libelle: 'Les séances de méthodologie vous ont-elles été utiles ?', type: 'note5', obligatoire: false, critere: 'utilite' },
    { id: 'inattendus', libelle: 'Avez-vous rencontré des sujets inattendus ? Lesquels ?', type: 'texte', obligatoire: false },
    { id: 'difficultes_epreuves', libelle: 'Quelles difficultés avez-vous rencontrées pendant les épreuves ?', type: 'texte', obligatoire: false },
    { id: 'contenus_utiles', libelle: 'Quels contenus vous ont été particulièrement utiles ?', type: 'texte', obligatoire: false },
    { id: 'ameliorations', libelle: 'Quelles améliorations souhaiteriez-vous pour les promotions suivantes ?', type: 'texte', obligatoire: false },
  ],
};

const FOLLOW_UP: ModeleQuestionnaire = {
  code: 'FOLLOW_UP',
  famille: 'FOLLOW_UP',
  titre: 'Six mois après votre formation',
  intro: 'Six mois ont passé depuis la fin de votre formation Major ECN. Quelques questions sur votre devenir et sur ce que la formation vous a apporté.',
  questions: [
    { id: 'devenir', libelle: 'Quelle est votre situation actuelle ?', type: 'choix_unique', obligatoire: true, options: ['En poste dans la spécialité visée', 'En poste dans une autre spécialité', 'Je prépare une nouvelle session', 'En recherche', 'Autre'] },
    { id: 'situation_evc', libelle: 'Quelle est votre situation concernant les EVC ?', type: 'choix_unique', obligatoire: true, options: ['Lauréat(e)', 'Non lauréat(e)', 'Résultats non connus', 'Je ne me suis pas présenté(e)'] },
    { id: 'resultat', libelle: 'Votre résultat, si vous souhaitez le partager (rang, note…)', type: 'texte', obligatoire: false, role: 'resultat', aide: 'Résultat déclaré : il reste distinct des résultats officiellement vérifiés.' },
    { id: 'utilite', libelle: 'Avec le recul, la formation vous a-t-elle été utile ?', type: 'note5', obligatoire: true, critere: 'utilite' },
    { id: 'acquis', libelle: 'Quelles compétences ou connaissances en avez-vous retenues ?', type: 'texte', obligatoire: false },
    { id: 'satisfaction', libelle: 'Votre satisfaction globale, avec le recul', type: 'note5', obligatoire: true, critere: 'globale' },
    { id: 'recommandation', libelle: 'Recommanderiez-vous Major ECN ? (0 à 10)', type: 'recommandation', obligatoire: true },
    { id: 'ameliorations', libelle: 'Quelles améliorations proposeriez-vous ?', type: 'texte', obligatoire: false },
  ],
};

const FUNDER: ModeleQuestionnaire = {
  code: 'FUNDER_SURVEY',
  famille: 'FUNDER_SURVEY',
  titre: 'Questionnaire financeur',
  intro: 'Questionnaire demandé par l\'organisme qui finance votre formation.',
  questions: [
    { id: 'satisfaction_globale', libelle: 'Satisfaction globale sur la formation', type: 'note5', obligatoire: true, critere: 'globale' },
    { id: 'objectifs', libelle: 'Les objectifs annoncés ont-ils été atteints ?', type: 'note5', obligatoire: true, critere: 'adequation' },
    { id: 'commentaire', libelle: 'Commentaire', type: 'texte', obligatoire: false },
  ],
};

export const MODELES_DEFAUT: ModeleQuestionnaire[] = [
  HOT, HOT_METHODO, HOT_QCM, HOT_DOSSIER, PROGRESS_33, PROGRESS_66, FINAL, POST_EXAM, FOLLOW_UP, FUNDER,
];

export function modeleDefaut(code: string): ModeleQuestionnaire | null {
  return MODELES_DEFAUT.find((m) => m.code === code) ?? null;
}
