/**
 * Foire aux questions de la page EVC Cardiologie.
 *
 * Données pures : la page cliente les affiche en accordéons et la route
 * serveur les aplatit pour le JSON-LD FAQPage. Les réponses sont dans le HTML
 * dès le chargement, accordéon fermé compris.
 *
 * Le tarif du Programme Approfondi n'est pas écrit ici : il est résolu au
 * rendu depuis le catalogue Stripe, pour que la FAQ ne puisse pas annoncer un
 * montant que le paiement ne pratique plus.
 */

export type BlocFaqCardio =
  | { p: string }
  | { liste: string[] }
  | { voies: { titre: string; voie: 'interne' | 'externe'; textes: string[] }[] }
  | { formules: { cle: 'essentielle' | 'intensive' | 'approfondie'; nom: string; texte: string }[] }
  | { chute: string };

export type QuestionCardio = { q: string; blocs: BlocFaqCardio[] };

export const FAQ_CARDIO: QuestionCardio[] = [
  {
    q: 'En quoi Major ECN m’apporte-t-il plus qu’une simple plateforme de préparation aux EVC ?',
    blocs: [
      { p: 'Major ECN ne se limite pas à mettre des contenus à disposition. La préparation a été conçue pour vous donner un cadre, un rythme et une méthode de travail.' },
      { p: 'Selon la formule choisie, vous bénéficiez de cours, de supports ciblés, d’entraînements, de cas cliniques, de QCM ou QROC adaptés à votre voie, de flashcards, d’examens blancs et d’un suivi de votre progression.' },
      { chute: 'L’objectif est de vous aider à savoir quoi travailler, comment vous entraîner et où concentrer vos efforts, plutôt que de vous laisser seul face à l’étendue du programme de cardiologie.' },
    ],
  },
  {
    q: 'Comment Major ECN m’aide-t-il à gagner du temps dans ma préparation ?',
    blocs: [
      { p: 'Le programme des EVC de cardiologie est vaste et il est facile de se disperser.' },
      { p: 'Les enseignements et les supports Major ECN vous aident à hiérarchiser votre travail, à identifier les notions importantes et à organiser vos révisions.' },
      { chute: 'Vous consacrez ainsi davantage de temps aux connaissances et aux raisonnements à maîtriser, et moins de temps à chercher seul comment structurer votre préparation.' },
    ],
  },
  {
    q: 'Les enseignants sont-ils disponibles si j’ai une question ?',
    blocs: [
      { p: 'Oui. Major ECN associe les ressources numériques à un accompagnement humain.' },
      { p: 'Selon votre formule, vous pouvez poser vos questions au cours de votre préparation et obtenir des réponses permettant de débloquer une difficulté, comprendre une correction ou mieux orienter votre travail.' },
      { chute: 'Vous n’êtes donc pas seul face aux cours et aux entraînements.' },
    ],
  },
  {
    q: 'Comment se déroulent les cours de cardiologie ?',
    blocs: [
      { p: 'Les cours permettent d’avancer de manière structurée dans les différentes thématiques de cardiologie.' },
      { p: 'Les enseignants reviennent sur les connaissances importantes, les raisonnements cliniques, les éléments à savoir hiérarchiser et les difficultés fréquemment rencontrées dans une préparation aux EVC.' },
      { chute: 'Les cours en direct créent également un rythme régulier de travail et permettent de bénéficier des questions posées par les autres candidats.' },
    ],
  },
  {
    q: 'Les cours sont-ils disponibles en replay ?',
    blocs: [
      { p: 'Oui. Les cours concernés sont accessibles en replay pendant votre période de préparation.' },
      { p: 'Vous pouvez ainsi reprendre un enseignement, revenir sur une notion difficile ou suivre un cours que vous n’avez pas pu regarder en direct.' },
    ],
  },
  {
    q: 'La préparation est-elle adaptée à la voie interne et à la voie externe des EVC ?',
    blocs: [
      { p: 'Oui. La préparation est adaptée au format de la voie préparée.' },
      {
        voies: [
          {
            titre: 'Voie interne — QCM',
            voie: 'interne',
            textes: ['Vous travaillez notamment la précision, l’analyse des propositions, les pièges et la rapidité de décision.'],
          },
          {
            titre: 'Voie externe — QROC',
            voie: 'externe',
            textes: ['Vous travaillez notamment la hiérarchisation de la réponse, les mots-clés, la formulation concise et la méthodologie de réponse.'],
          },
        ],
      },
      { chute: 'Chaque candidat choisit sa voie et les entraînements sont adaptés en conséquence.' },
    ],
  },
  {
    q: 'Quels types d’entraînements sont proposés en cardiologie ?',
    blocs: [
      { p: 'Selon la formule et la voie préparée, Major ECN propose notamment des QCM, QROC, cas cliniques, flashcards et examens blancs.' },
      { chute: 'L’objectif n’est pas uniquement de vérifier vos connaissances. Les corrections doivent vous permettre d’identifier vos erreurs, de comprendre pourquoi vous vous êtes trompé et de déterminer ce qu’il faut retravailler.' },
    ],
  },
  {
    q: 'Les entraînements et l’épreuve blanche permettent-ils de se préparer aux conditions du concours ?',
    blocs: [
      { p: 'Les entraînements réguliers permettent de vérifier progressivement l’acquisition des connaissances et d’identifier les points qui nécessitent encore du travail.' },
      { p: 'L’épreuve blanche permet également de se confronter à des contraintes importantes du concours : gestion du temps, concentration, mobilisation des connaissances et gestion du stress.' },
      { chute: 'Elle permet ensuite d’orienter les dernières semaines de révision.' },
    ],
  },
  {
    q: 'Comment Major ECN m’aide-t-il à mémoriser sur la durée ?',
    blocs: [
      { p: 'La préparation associe différents formats : cours, fiches, fiches éclair, QCM ou QROC, cas cliniques, flashcards et révisions programmées.' },
      { p: 'Cette répétition des notions sous différentes formes permet de revenir régulièrement sur les connaissances importantes et de repérer celles qui restent fragiles.' },
      { chute: 'La plateforme permet également de suivre votre progression et de mieux cibler vos révisions.' },
    ],
  },
  {
    q: 'Puis-je suivre la préparation tout en travaillant à l’hôpital ?',
    blocs: [
      { p: 'La préparation a été pensée pour pouvoir s’intégrer à un emploi du temps médical chargé.' },
      { p: 'Les cours en direct apportent un rythme, tandis que les replays et les ressources numériques permettent de travailler lorsque vous êtes disponible.' },
      { chute: 'Vous pouvez ainsi organiser votre préparation autour de vos contraintes professionnelles tout en conservant une progression structurée.' },
    ],
  },
  {
    q: 'Puis-je commencer la préparation si les cours ont déjà débuté ?',
    blocs: [
      { p: 'Oui.' },
      { p: 'Les ressources disponibles sur la plateforme et les replays des cours concernés permettent de reprendre les enseignements déjà réalisés.' },
      { chute: 'L’objectif est de vous permettre de rejoindre la préparation et d’organiser progressivement votre travail jusqu’aux EVC.' },
    ],
  },
  {
    q: 'Quelles thématiques de cardiologie sont travaillées ?',
    blocs: [
      { p: 'La préparation couvre les grandes thématiques nécessaires à la préparation des EVC de cardiologie.' },
      {
        liste: [
          'la cardiologie ischémique et les urgences cardiovasculaires ;',
          'le rythme et l’ECG ;',
          'l’insuffisance cardiaque ;',
          'les valvulopathies et l’endocardite ;',
          'l’HTA, la prévention et les pathologies vasculaires ;',
          'les cardiomyopathies et les situations cardiovasculaires complexes.',
        ],
      },
      { chute: 'Et bien d’autres thématiques : les enseignements, les supports et les entraînements vous permettent de travailler progressivement l’ensemble des domaines de la cardiologie.' },
    ],
  },
  {
    q: 'Quelle formule Major ECN choisir pour préparer les EVC de cardiologie ?',
    blocs: [
      { p: 'Cela dépend principalement de votre besoin d’accompagnement.' },
      {
        formules: [
          { cle: 'essentielle', nom: 'Essentielle', texte: 'Pour travailler principalement en autonomie avec la plateforme et ses ressources pédagogiques.' },
          { cle: 'intensive', nom: 'Intensive', texte: 'Pour bénéficier du socle de l’Essentielle complété par une préparation intensive permettant de structurer les derniers mois avant l’épreuve.' },
          { cle: 'approfondie', nom: 'Approfondie', texte: 'Pour bénéficier d’un accompagnement pédagogique beaucoup plus complet avec des cours approfondis et un encadrement renforcé.' },
        ],
      },
      { chute: 'Les trois formules sont proposées pour la voie interne ou la voie externe.' },
    ],
  },
  {
    q: 'Pourquoi choisir Major ECN pour préparer les EVC de cardiologie ?',
    blocs: [
      { p: 'Parce qu’une préparation efficace ne consiste pas seulement à accumuler des documents.' },
      { p: 'Major ECN associe contenus pédagogiques, entraînements, méthodologie, outils de mémorisation, examens blancs, suivi de progression et accompagnement humain.' },
      { chute: 'L’objectif est de vous donner les outils et la méthode nécessaires pour structurer votre travail et vous présenter aux EVC dans les meilleures conditions possibles.' },
    ],
  },
];

/** Réponse aplatie en texte simple — pour le JSON-LD FAQPage.
 *  `prixApprofondie` est injecté afin que le balisage annonce exactement le
 *  montant affiché à l'écran. */
export function reponseTexteCardio(q: QuestionCardio, prixApprofondie: string): string {
  const morceaux: string[] = [];
  for (const b of q.blocs) {
    if ('p' in b) morceaux.push(b.p);
    else if ('chute' in b) morceaux.push(b.chute);
    else if ('liste' in b) morceaux.push(b.liste.join(' '));
    else if ('voies' in b) morceaux.push(b.voies.map((v) => `${v.titre}. ${v.textes.join(' ')}`).join(' '));
    else {
      morceaux.push(
        b.formules
          .map((f) => {
            const prix =
              f.cle === 'essentielle' ? '495 €'
              : f.cle === 'intensive' ? '995 €'
              : `à partir de ${prixApprofondie} €`;
            return `${f.nom} — ${prix} : ${f.texte}`;
          })
          .join(' '),
      );
    }
  }
  return morceaux.join(' ');
}
