/**
 * Foire aux questions de la page EVC Pédiatrie.
 *
 * Données pures : la page cliente les affiche en accordéons et la route
 * serveur les aplatit pour le JSON-LD FAQPage. Les réponses sont dans le HTML
 * dès le chargement, accordéon fermé compris.
 *
 * Le tarif du Programme Approfondi n'est pas écrit ici : il est résolu au
 * rendu depuis le catalogue Stripe, pour que la FAQ ne puisse pas annoncer un
 * montant que le paiement ne pratique plus.
 */

export type BlocFaqPedia =
  | { p: string }
  | { liste: string[] }
  | { questions: string[] }
  | { chaine: string[] }
  | { formules: { cle: 'essentielle' | 'intensive' | 'approfondie'; nom: string; texte: string }[] }
  | { chute: string };

export type QuestionPedia = { q: string; blocs: BlocFaqPedia[] };

export const FAQ_PEDIA: QuestionPedia[] = [
  {
    q: 'Pourquoi choisir Major ECN pour préparer les EVC de pédiatrie ?',
    blocs: [
      { p: 'Parce que réussir les EVC ne consiste pas simplement à connaître la pédiatrie.' },
      { p: 'Il faut également savoir quelles notions prioriser, jusqu’où les approfondir, comment organiser ses révisions et comment restituer ses connaissances dans le format attendu le jour de l’épreuve.' },
      { p: 'Depuis 2011, Major ECN accompagne des médecins dans la préparation de concours et d’épreuves médicales. La préparation s’appuie sur des enseignants qui connaissent les exigences des EVC, leur méthodologie et l’esprit dans lequel les épreuves sont construites.' },
      { p: 'Au fil des années, des candidats accompagnés par Major ECN ont réussi leurs EVC, certains avec d’excellents résultats.' },
      { chute: 'L’objectif est donc double : vous faire maîtriser les connaissances nécessaires et vous apprendre à les utiliser efficacement le jour J.' },
    ],
  },
  {
    q: 'Pourquoi payer une préparation alors qu’il existe des livres, PDF et ressources gratuites ?',
    blocs: [
      { p: 'Parce que le problème n’est pas de trouver de l’information. Il y en a énormément.' },
      { p: 'La difficulté est de savoir :' },
      {
        questions: [
          'Quel support utiliser ?',
          'Quelle information retenir ?',
          'Quelles notions sont prioritaires ?',
          'Jusqu’où approfondir ?',
          'Qu’est-ce qui est réellement attendu aux EVC ?',
          'Comment répondre ?',
          'Comment savoir si je progresse ?',
        ],
      },
      { p: 'Major ECN vous apporte un environnement déjà structuré, mais également, selon votre formule, des enseignants auxquels poser vos questions au fur et à mesure de votre préparation.' },
      { p: 'Vous gagnez du temps, vous ciblez davantage vos efforts et vous évitez de passer des semaines à vous demander si vous travaillez dans la bonne direction.' },
      { chute: 'La valeur d’une préparation ne réside donc pas uniquement dans les contenus fournis, mais aussi dans le temps gagné, les erreurs évitées et la direction donnée à vos révisions.' },
    ],
  },
  {
    q: 'Comment Major ECN m’aide-t-il à cibler mes révisions ?',
    blocs: [
      { p: 'Le programme de pédiatrie est vaste et toutes les connaissances ne doivent pas nécessairement être travaillées avec la même intensité au même moment.' },
      { p: 'Les supports structurent le programme, les enseignants vous orientent sur les notions importantes et vos résultats aux QCM, dossiers et entraînements permettent d’identifier progressivement vos points forts et vos lacunes.' },
      { p: 'Votre travail peut ainsi être davantage concentré sur les domaines qui nécessitent réellement votre attention.' },
      { chute: 'L’objectif n’est pas de tout revoir indistinctement. Il est de savoir où placer vos efforts pour progresser.' },
    ],
  },
  {
    q: 'Major ECN m’apprend-il seulement les connaissances ou également comment répondre aux EVC ?',
    blocs: [
      { p: 'Les deux. Et c’est un point essentiel de la préparation.' },
      { p: 'Posséder la connaissance ne garantit pas que vous saurez l’utiliser correctement dans une épreuve.' },
      { p: 'Les enseignants vous transmettent également une méthodologie propre aux EVC : comment analyser un énoncé, identifier ce qui est réellement demandé, hiérarchiser les informations, éviter certains pièges et construire la réponse attendue.' },
      { chute: 'Vous apprenez donc progressivement non seulement quoi savoir, mais également comment utiliser ce savoir dans l’épreuve.' },
    ],
  },
  {
    q: 'Comment Major ECN me prépare-t-il aux QCM de la voie interne ?',
    blocs: [
      { p: 'Un QCM ne se résume pas à savoir si une proposition est vraie ou fausse.' },
      { p: 'L’entraînement vous apprend progressivement à lire précisément l’énoncé, repérer les éléments déterminants, identifier les formulations susceptibles de vous piéger, hiérarchiser les informations et mobiliser rapidement la bonne connaissance.' },
      { p: 'Les corrections permettent ensuite de comprendre pourquoi vous avez commis une erreur et quel raisonnement aurait dû vous conduire à la bonne réponse. À force d’entraînement, vous développez des automatismes.' },
      { chute: 'L’objectif : connaître votre cours, mais également apprendre à déjouer les pièges et à répondre plus rapidement et plus sûrement aux QCM.' },
    ],
  },
  {
    q: 'Comment Major ECN me prépare-t-il aux QROC de la voie externe ?',
    blocs: [
      { p: 'La QROC demande une méthodologie différente.' },
      { p: 'Il ne suffit pas de connaître la réponse : il faut savoir ce qu’il faut écrire et comment le formuler de manière suffisamment précise et complète.' },
      { p: 'La préparation vous apprend notamment à identifier les mots-clés attendus, à structurer votre réponse, à aller à l’essentiel et à connaître les PMZ — points majeurs zéro — lorsqu’ils s’appliquent, afin d’éviter une omission susceptible de vous pénaliser fortement.' },
      { chute: 'L’objectif est de vous entraîner progressivement à produire la réponse attendue par l’épreuve, sans vous disperser dans des développements inutiles.' },
    ],
  },
  {
    q: 'Pourquoi faire plus de 2 000 QCM et entraînements ?',
    blocs: [
      { p: 'Parce que les réflexes ne s’acquièrent pas uniquement en lisant un cours.' },
      { p: 'La répétition permet de rencontrer de nombreuses situations, d’identifier les pièges, de comprendre ses erreurs et de détecter les connaissances encore fragiles.' },
      { chaine: ['S’entraîner', 'Corriger', 'Comprendre', 'Revoir', 'Recommencer'] },
      { p: 'Progressivement, vous reconnaissez plus rapidement certaines situations et mobilisez plus efficacement vos connaissances.' },
      { chute: 'L’objectif n’est donc pas de faire des QCM pour accumuler un chiffre, mais de transformer vos connaissances en réflexes utilisables le jour des EVC.' },
    ],
  },
  {
    q: 'Est-ce que les enseignants donnent aussi des astuces spécifiques aux épreuves ?',
    blocs: [
      { p: 'Oui. C’est précisément l’un des intérêts d’un enseignement réalisé par des personnes qui connaissent les exigences des EVC.' },
      { p: 'Au-delà des connaissances médicales, les enseignants peuvent attirer votre attention sur les formulations importantes, les erreurs fréquentes, les pièges classiques, la manière d’aborder un énoncé et les éléments qu’il ne faut pas oublier dans une réponse.' },
      { p: 'Pour les QCM, il s’agit notamment d’apprendre à analyser les propositions et à éviter les pièges. Pour les QROC, il s’agit notamment de travailler les mots-clés, la précision de la réponse et les PMZ lorsqu’ils sont applicables.' },
      { chute: 'Ce sont ces détails méthodologiques qui permettent progressivement de mieux comprendre l’esprit de l’épreuve.' },
    ],
  },
  {
    q: 'Pourquoi l’accompagnement humain fait-il réellement une différence ?',
    blocs: [
      { p: 'Parce que plusieurs mois de préparation génèrent inévitablement des questions et des périodes de doute :' },
      {
        questions: [
          'Est-ce que je travaille suffisamment ?',
          'Est-ce une notion prioritaire ?',
          'Est-ce que j’approfondis trop ?',
          'Pourquoi ma réponse est-elle fausse ?',
          'Qu’aurait-il fallu répondre ?',
          'Est-ce que je suis au niveau attendu ?',
        ],
      },
      { p: 'Seul, vous pouvez perdre beaucoup de temps à essayer d’y répondre.' },
      { p: 'Selon votre formule, vous pouvez poser vos questions aux enseignants, demander une explication et être réorienté lorsque cela est nécessaire.' },
      { p: 'Cela permet aussi de réduire une partie du stress lié à l’incertitude : vous vous sentez épaulé et savez vers qui vous tourner lorsque vous bloquez.' },
      { chute: 'Vous disposez d’une plateforme pour travailler, mais vous n’êtes pas laissé seul devant la plateforme.' },
    ],
  },
  {
    q: 'Comment savoir si mes efforts sont placés au bon endroit ?',
    blocs: [
      { p: 'C’est précisément l’une des difficultés d’une préparation en autonomie.' },
      { p: 'On peut travailler beaucoup tout en consacrant trop de temps à certaines notions et insuffisamment à d’autres.' },
      { p: 'Les entraînements, les corrections, le suivi de progression et l’accompagnement permettent de mieux identifier ce que vous maîtrisez déjà et ce qui mérite encore votre attention. Vous pouvez alors ajuster vos révisions au fur et à mesure.' },
      { chute: 'Il ne s’agit pas seulement de travailler plus. Il s’agit de travailler de manière plus ciblée.' },
    ],
  },
  {
    q: 'Comment savoir si je progresse réellement ?',
    blocs: [
      { p: 'Faire beaucoup d’heures ne signifie pas nécessairement progresser.' },
      { p: 'Les QCM, dossiers, annales et outils de suivi permettent d’objectiver votre évolution et d’identifier les domaines encore fragiles.' },
      { p: 'Vous passez progressivement de « J’espère être prêt. » à :' },
      { chute: 'Je sais ce que je maîtrise, je connais mes points faibles et je sais ce qu’il me reste à travailler.' },
    ],
  },
  {
    q: 'Pourquoi les corrections détaillées sont-elles importantes ?',
    blocs: [
      { p: 'Parce qu’une mauvaise réponse est particulièrement utile lorsqu’on comprend pourquoi elle était mauvaise.' },
      { p: 'Une correction doit vous permettre de répondre à plusieurs questions :' },
      {
        questions: [
          'Pourquoi me suis-je trompé ?',
          'Quelle connaissance me manquait ?',
          'Quel élément de l’énoncé aurait dû m’orienter ?',
          'Quel piège n’ai-je pas vu ?',
          'Que dois-je retenir pour la prochaine fois ?',
        ],
      },
      { chute: 'C’est ainsi qu’une erreur devient progressivement un outil de progression.' },
    ],
  },
  {
    q: 'Puis-je préparer les EVC tout en travaillant à l’hôpital ?',
    blocs: [
      { p: 'Oui. Et c’est justement lorsque votre temps est limité qu’il devient essentiel de ne pas le perdre à rechercher et comparer constamment des ressources.' },
      { p: 'La plateforme centralise vos supports et entraînements. Les replays inclus selon votre formule permettent de conserver de la flexibilité lorsque votre activité hospitalière vous empêche d’assister à certains enseignements.' },
      { chute: 'L’objectif est de concilier flexibilité et régularité, même avec une activité professionnelle importante.' },
    ],
  },
  {
    q: 'Quelle formule choisir pour préparer les EVC de pédiatrie ?',
    blocs: [
      {
        formules: [
          { cle: 'essentielle', nom: 'Essentielle', texte: 'Pour les candidats autonomes souhaitant principalement bénéficier de la plateforme, des supports, QCM, dossiers, annales et outils de progression.' },
          { cle: 'intensive', nom: 'Intensive', texte: 'Tout le socle de l’Essentielle + 18 heures de cours et d’accompagnement, avec davantage d’échanges, d’entraînements et de méthodologie.' },
          { cle: 'approfondie', nom: 'Approfondie', texte: 'Tout le socle de l’Intensive + à partir de 36 heures de cours et d’accompagnement, davantage de reprise des connaissances, de séances à suivre en direct, de dossiers, d’entraînements, de corrections et un accompagnement humain renforcé.' },
        ],
      },
    ],
  },
  {
    q: 'En une phrase, qu’est-ce que Major ECN change dans ma préparation ?',
    blocs: [
      { p: 'Major ECN vous aide à savoir :' },
      {
        chaine: [
          'Quoi réviser',
          'Quoi prioriser',
          'Jusqu’où approfondir',
          'Comment vous entraîner',
          'Comment répondre',
          'Comment éviter les pièges',
          'Comment corriger vos lacunes',
          'Où concentrer vos efforts',
        ],
      },
      { chute: 'Et surtout, selon votre formule, vous n’avez pas à répondre seul à toutes les questions qui apparaissent pendant votre préparation.' },
    ],
  },
];

/** Réponse aplatie en texte simple — pour le JSON-LD FAQPage.
 *  `prixApprofondie` est injecté afin que le balisage annonce exactement le
 *  montant affiché à l'écran. */
export function reponseTextePedia(q: QuestionPedia, prixApprofondie: string): string {
  const morceaux: string[] = [];
  for (const b of q.blocs) {
    if ('p' in b) morceaux.push(b.p);
    else if ('chute' in b) morceaux.push(b.chute);
    else if ('liste' in b) morceaux.push(b.liste.join(' '));
    else if ('questions' in b) morceaux.push(b.questions.join(' '));
    else if ('chaine' in b) morceaux.push(b.chaine.join(' → ') + '.');
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
