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
  /* ---- Session 2026 : postes, voies, date, format, convocation.
          Chiffres et date issus de l'arrêté du 12 juin 2026. ---- */
  {
    q: 'Combien de postes sont ouverts en cardiologie aux EVC 2026 ?',
    blocs: [
      { p: 'Pour la session 2026, 146 postes sont ouverts en voie interne et 20 en voie externe en médecine cardiovasculaire, soit 166 postes au total.' },
      { p: 'Ces chiffres figurent en annexe de l’arrêté du 12 juin 2026 portant ouverture des épreuves de vérification des connaissances.' },
      { chute: 'Avec seulement 20 postes, la voie externe en cardiologie est l’une des plus étroites de la session. C’est précisément pour ce type de configuration que Major ECN adapte l’intensité de la préparation : lorsque le nombre de postes est réduit, le niveau d’exigence attendu ne laisse aucune place à l’approximation.' },
    ],
  },
  {
    q: 'La cardiologie est-elle ouverte dans les deux voies ?',
    blocs: [
      { p: 'Oui. La médecine cardiovasculaire fait partie des treize spécialités ouvertes en voie externe pour 2026, et elle figure également parmi les spécialités bien dotées en voie interne.' },
      { p: 'Un candidat en cardiologie peut donc se présenter dans l’une ou l’autre voie, selon sa situation. Plusieurs spécialités, notamment chirurgicales, ne sont ouvertes qu’en voie interne cette année.' },
      { chute: 'Major ECN prépare les deux voies en cardiologie, avec des entraînements distincts : QCM pour la voie interne, QROC pour la voie externe.' },
    ],
  },
  {
    q: 'Quand a lieu l’épreuve de cardiologie ?',
    blocs: [
      { p: 'L’épreuve se déroule le jeudi 3 décembre 2026, à l’Espace Jean-Monnet de Rungis.' },
      { p: 'Elle s’inscrit dans un calendrier qui s’étend du 10 novembre 2026 au 15 janvier 2027.' },
      { chute: 'La préparation Major ECN est calée sur cette échéance : le rythme des cours, des entraînements et des révisions programmées est construit pour vous amener prêt au jour de votre épreuve, et non à une date théorique.' },
    ],
  },
  {
    q: 'Quel est le format de l’épreuve en cardiologie ?',
    blocs: [
      { p: 'Le format dépend de votre voie.' },
      { p: 'En voie interne, l’épreuve repose sur un QCM, de 10 h à 12 h.' },
      { p: 'En voie externe, deux épreuves écrites de deux heures sont prévues, de 10 h à 12 h puis de 15 h à 17 h.' },
      { p: 'Les deux voies passent le même jour. Les connaissances médicales évaluées se recoupent largement : c’est la manière de les restituer qui diffère.' },
      { chute: 'C’est pourquoi Major ECN différencie les entraînements selon la voie présentée. Un candidat qui s’entraîne dans le mauvais format travaille un exercice qu’il ne passera pas.' },
    ],
  },
  {
    q: 'Le nombre de postes signifie-t-il que l’épreuve est plus facile ?',
    blocs: [
      { p: 'Non.' },
      { p: 'Un nombre élevé de postes peut également attirer davantage de candidats. C’est le rapport entre le nombre de candidats et le nombre de postes qui détermine la sélectivité réelle, et ce rapport n’est pas connu à l’avance.' },
      { p: 'Il faut aussi garder à l’esprit qu’un poste peut rester vacant si aucune copie n’atteint le niveau attendu : la sélection porte sur un niveau, pas seulement sur un rang.' },
      { chute: 'C’est la raison d’être de la méthode Major ECN : ne pas viser un rang, mais atteindre le niveau attendu par le jury, quelle que soit la configuration de la session.' },
    ],
  },
  {
    q: 'Comment obtenir ma convocation ?',
    blocs: [
      { p: 'La convocation est mise à disposition par le Centre national de gestion, au plus tôt un mois avant la date de l’épreuve.' },
      { p: 'Pour la cardiologie, l’épreuve ayant lieu le 3 décembre 2026, la convocation ne sera donc pas disponible avant le début du mois de novembre.' },
      { chute: 'Les équipes Major ECN restent disponibles pour répondre à vos questions sur le déroulement de la session tout au long de votre préparation.' },
    ],
  },
  /* ---- La préparation Major ECN ---- */
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
  /* ---- Toujours en dernière position : aucune promesse de résultat. ---- */
  {
    q: 'Major ECN garantit-il la réussite aux EVC ?',
    blocs: [
      { p: 'Non. Et aucune préparation sérieuse ne peut garantir la réussite à un concours.' },
      { p: 'Les EVC dépendent notamment du niveau des copies, du nombre de candidats et du nombre de postes ouverts. Aucun organisme de préparation ne maîtrise ces paramètres.' },
      { p: 'Ce que Major ECN apporte, en revanche :' },
      {
        liste: [
          'un cadre de travail structuré ;',
          'des contenus adaptés à la cardiologie et à votre voie ;',
          'des cours avec des médecins spécialistes ;',
          'des entraînements réguliers ;',
          'des corrections détaillées ;',
          'des examens blancs ;',
          'un suivi de progression.',
        ],
      },
      { p: 'Depuis 2011, plus de 9 000 médecins ont préparé leurs épreuves avec Major ECN.' },
      { chute: 'Le travail personnel, la régularité et l’investissement du candidat restent déterminants.' },
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
