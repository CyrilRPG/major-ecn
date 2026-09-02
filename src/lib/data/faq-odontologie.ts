/**
 * Foire aux questions de la page EVC Odontologie & Chirurgie dentaire.
 *
 * Les douze premières sont les questions prioritaires du cahier des charges ;
 * les suivantes complètent le corpus fourni et se déplient avec « Voir toutes
 * les questions ». Toutes les réponses sont dans le HTML dès le chargement,
 * accordéon fermé compris.
 *
 * Le tarif du Programme Approfondi n'est pas écrit ici : il est résolu au
 * rendu depuis le catalogue Stripe.
 */

export type BlocFaqOdo =
  | { p: string }
  | { liste: string[] }
  | { questions: string[] }
  | { chaine: string[] }
  | { formules: { cle: 'essentielle' | 'intensive' | 'approfondie'; nom: string; accroche: string; texte: string }[] }
  | { chute: string };

export type QuestionOdo = { q: string; blocs: BlocFaqOdo[] };

export const FAQ_ODO: QuestionOdo[] = [
  {
    q: 'Peut-on préparer seul les EVC d’odontologie ?',
    blocs: [
      { p: 'Oui, il est possible de préparer les EVC seul. Mais cela demande beaucoup de temps pour chercher les bons supports, sélectionner les informations pertinentes, organiser ses révisions et déterminer ce qui doit réellement être travaillé en priorité.' },
      { p: 'Or, lorsqu’on exerce parallèlement une activité professionnelle et que l’on a une vie personnelle ou familiale, chaque heure disponible devient précieuse.' },
      { p: 'Major ECN vous apporte un cadre déjà structuré : des supports pédagogiques ciblés, plus de 2 000 QCM, des dossiers cliniques, des annales corrigées, des outils de suivi et, selon la formule choisie, des cours et un accompagnement avec des enseignants.' },
      { chute: 'Moins de temps à chercher comment travailler, plus de temps à réellement préparer vos EVC.' },
    ],
  },
  {
    q: 'Comment Major ECN me fait-il gagner du temps ?',
    blocs: [
      { p: 'Le programme d’odontologie est vaste. Le risque, lorsqu’on travaille seul, est de passer beaucoup de temps sur certaines notions sans savoir si elles doivent réellement être prioritaires, ou de multiplier les supports sans parvenir à construire une progression cohérente.' },
      { p: 'Major ECN vous aide à savoir :' },
      {
        liste: [
          'quoi travailler ;',
          'sur quels supports travailler ;',
          'dans quel ordre avancer ;',
          'comment vous entraîner ;',
          'comment analyser vos erreurs ;',
          'et quels points doivent encore être consolidés.',
        ],
      },
      { p: 'Les cours, les supports, les QCM, les dossiers cliniques, les annales et le suivi de progression sont organisés dans une même logique pédagogique.' },
      { chute: 'Vous consacrez ainsi davantage de votre temps disponible à apprendre, vous entraîner et progresser, plutôt qu’à construire seul toute votre préparation.' },
    ],
  },
  {
    q: 'Quels domaines de l’odontologie sont travaillés ?',
    blocs: [
      { p: 'La préparation couvre les grands domaines de l’odontologie :' },
      {
        liste: [
          'patients à risque et prise en charge médicale ;',
          'endodontie ;',
          'parodontologie ;',
          'odontologie conservatrice ;',
          'prothèse ;',
          'chirurgie orale ;',
          'traumatologie dento-alvéolaire ;',
          'odontologie pédiatrique ;',
          'prescriptions, urgences et hémostase ;',
          'imagerie, diagnostic et stratégie thérapeutique.',
        ],
      },
      { chute: 'Et bien d’autres thématiques abordées en détail dans votre préparation.' },
    ],
  },
  {
    q: 'Quel est l’intérêt de disposer de plus de 2 000 QCM ?',
    blocs: [
      { p: 'Le nombre permet de multiplier les situations rencontrées, mais l’objectif n’est pas simplement de « faire 2 000 questions ».' },
      { p: 'Un entraînement devient réellement utile lorsqu’il vous permet de comprendre :' },
      {
        liste: [
          'pourquoi une réponse est juste ;',
          'pourquoi une proposition est fausse ;',
          'quelle connaissance vous manquait ;',
          'quel piège vous n’avez pas identifié ;',
          'et comment éviter de reproduire la même erreur.',
        ],
      },
      { p: 'À force de rencontrer des situations, de vous tromper, de corriger et de recommencer, certains raisonnements deviennent progressivement plus naturels.' },
      { chaine: ['S’entraîner', 'Se corriger', 'Comprendre', 'Revoir', 'Recommencer'] },
      { chute: 'L’objectif est de développer progressivement des automatismes, de la précision et de la rapidité.' },
    ],
  },
  {
    q: 'Pourquoi les dossiers cliniques sont-ils importants ?',
    blocs: [
      { p: 'Parce qu’ils permettent de vérifier que vous êtes capable d’utiliser vos connaissances, et pas seulement de les reconnaître dans un cours.' },
      { p: 'Face à une situation clinique, vous devez analyser les informations disponibles, identifier les éléments importants, mobiliser plusieurs connaissances et déterminer une conduite adaptée.' },
      { p: 'Les dossiers constituent également un excellent moyen d’identifier vos lacunes. Une notion qui semble parfaitement maîtrisée à la lecture peut devenir beaucoup plus difficile lorsqu’elle doit être mobilisée dans une situation concrète.' },
      { chute: 'C’est en confrontant régulièrement vos connaissances à des situations que le raisonnement devient progressivement plus fluide.' },
    ],
  },
  {
    q: 'À quoi servent les annales corrigées ?',
    blocs: [
      { p: 'Les annales permettent de vous confronter à la manière dont les connaissances ont été transformées en questions d’épreuve. Mais leur véritable intérêt se trouve dans la correction.' },
      { p: 'Après une erreur, il faut comprendre :' },
      {
        questions: [
          'Quelle connaissance me manquait ?',
          'Ai-je mal lu la question ?',
          'Ai-je confondu deux notions ?',
          'Quel élément aurait dû m’orienter ?',
          'Comment éviter cette erreur la prochaine fois ?',
        ],
      },
      { chute: 'L’objectif est que chaque erreur devienne une information utile pour la suite de votre préparation.' },
    ],
  },
  {
    q: 'Comment Major ECN m’aide-t-il à savoir sur quoi concentrer mes efforts ?',
    blocs: [
      { p: 'Toutes les connaissances ne nécessitent pas le même niveau de travail au même moment. Vos priorités dépendent notamment de votre niveau, de vos erreurs aux entraînements et des notions qui restent fragiles.' },
      { p: 'Les enseignants, les supports et les résultats obtenus sur la plateforme vous permettent progressivement d’identifier ces priorités.' },
      { p: 'Plutôt que de travailler indistinctement tout le programme, vous pouvez davantage concentrer vos efforts sur les connaissances importantes et sur vos propres difficultés.' },
      { chute: 'Le but n’est pas simplement de travailler davantage. Le but est d’utiliser intelligemment les heures dont vous disposez.' },
    ],
  },
  {
    q: 'Puis-je poser mes questions aux enseignants ?',
    blocs: [
      { p: 'Oui. C’est une composante importante de l’accompagnement Major ECN.' },
      { p: 'Vos questions peuvent concerner un cours, une fiche, un QCM, une correction, une prescription, une conduite à tenir, un dossier clinique ou votre méthodologie.' },
      { p: 'L’intérêt est double : comprendre plus rapidement ce qui vous bloque et éviter de conserver une mauvaise compréhension pendant plusieurs semaines. Selon votre formule, les temps d’échange avec les enseignants sont plus ou moins importants.' },
      { chute: 'L’objectif reste le même : ne pas vous laisser seul face à une difficulté.' },
    ],
  },
  {
    q: 'Puis-je préparer les EVC tout en travaillant et en ayant une vie familiale ?',
    blocs: [
      { p: 'Oui, et c’est précisément dans cette situation que l’organisation du temps devient particulièrement importante.' },
      { p: 'Entre l’activité professionnelle, les gardes éventuelles, les obligations personnelles et la vie familiale, les périodes disponibles pour réviser peuvent être limitées.' },
      { p: 'Major ECN est conçu pour vous permettre de travailler à distance et de retrouver vos ressources sur une même plateforme pendant votre période de préparation. Selon votre formule, les cours, replays et échanges avec les enseignants complètent ce travail autonome.' },
      { chute: 'L’objectif est de vous permettre de tirer le maximum des heures dont vous disposez, sans avoir à reconstruire seul toute votre préparation.' },
    ],
  },
  {
    q: 'Quelle différence entre les formules Essentielle, Intensive et Approfondie ?',
    blocs: [
      {
        formules: [
          { cle: 'essentielle', nom: 'Essentielle', accroche: 'Autonomie guidée', texte: 'Elle s’adresse principalement aux candidats qui disposent déjà de bonnes bases et souhaitent surtout s’entraîner et se perfectionner en autonomie. Vous bénéficiez notamment de la plateforme, des supports, des QCM, des dossiers, des annales, des outils de révision et du suivi de progression.' },
          { cle: 'intensive', nom: 'Intensive', accroche: 'Entraînement + accompagnement', texte: 'Elle comprend le socle de l’Essentielle auquel s’ajoutent 18 heures de cours et d’accompagnement. Vous bénéficiez ainsi de davantage d’échanges avec les enseignants, de cours, de replays, de dossiers travaillés, de corrections et d’un accompagnement jusqu’aux épreuves.' },
          { cle: 'approfondie', nom: 'Approfondie', accroche: 'Accompagnement renforcé', texte: 'Elle comprend le socle de l’Intensive avec à partir de 36 heures de cours et d’accompagnement, selon la formule choisie. Elle permet d’aller plus loin dans la reprise des connaissances, de travailler davantage de dossiers, de sujets et de rappels de cours et de bénéficier d’un accompagnement humain plus important.' },
        ],
      },
      { chute: 'Plus vous montez en gamme, plus le temps d’enseignement et le niveau d’accompagnement humain augmentent.' },
    ],
  },
  {
    q: 'Est-il trop tard pour commencer ma préparation ?',
    blocs: [
      { p: 'Plus vous commencez tôt, plus vous disposez de temps pour apprendre, vous entraîner, revenir sur vos erreurs et consolider vos connaissances.' },
      { p: 'Mais lorsque le temps restant est limité, la nécessité de travailler de manière ciblée devient encore plus importante. Il faut rapidement identifier les connaissances prioritaires, vos principales lacunes et les entraînements les plus utiles.' },
      { chute: 'C’est précisément là qu’un cadre structuré peut faire gagner beaucoup de temps : plutôt que de passer plusieurs semaines à déterminer seul par où commencer, vous pouvez concentrer plus rapidement vos efforts sur ce qui doit être travaillé.' },
    ],
  },
  {
    q: 'Comment savoir si je suis prêt pour les EVC ?',
    blocs: [
      { p: 'Ne vous fiez pas uniquement au nombre d’heures travaillées ou au nombre de chapitres relus. À l’approche des EVC, vous devez progressivement être capable de :' },
      {
        liste: [
          'mobiliser rapidement les connaissances importantes ;',
          'obtenir des résultats plus réguliers aux entraînements ;',
          'identifier les pièges ;',
          'raisonner face à une situation clinique ;',
          'gérer votre temps ;',
          'comprendre vos erreurs ;',
          'et connaître précisément vos derniers points faibles.',
        ],
      },
      { p: 'Les QCM, dossiers, annales, examens blancs et outils de suivi vous permettent justement de mesurer cette progression.' },
      { chute: 'Je sais ce que je maîtrise, je sais ce qu’il me reste à travailler et je sais comment utiliser le temps qu’il me reste.' },
    ],
  },

  /* ── Questions supplémentaires, dépliées par « Voir toutes les questions » ── */

  {
    q: 'Pourquoi utiliser la plateforme Major ECN plutôt que multiplier les supports de révision ?',
    blocs: [
      { p: 'Parce qu’avoir accès à toujours plus de ressources n’est pas nécessairement un avantage. Cours, livres, recommandations, groupes de discussion, vidéos et documents circulant en ligne peuvent rapidement représenter une masse considérable d’informations.' },
      { p: 'La difficulté devient alors de savoir :' },
      {
        questions: [
          'Quel support utiliser ?',
          'Quelle information retenir ?',
          'Jusqu’où approfondir ?',
          'Que travailler en premier ?',
        ],
      },
      { p: 'La plateforme Major ECN centralise les ressources de votre préparation : fiches, entraînements, plus de 2 000 QCM, dossiers cliniques, annales corrigées, outils de révision et suivi de progression.' },
      { chute: 'L’objectif n’est pas de vous donner encore davantage de documents. Il est de vous aider à travailler avec les bons outils, au bon moment et avec une méthode.' },
    ],
  },
  {
    q: 'Les QCM peuvent-ils réellement m’aider à répondre plus rapidement le jour de l’épreuve ?',
    blocs: [
      { p: 'C’est précisément l’un des objectifs de l’entraînement régulier.' },
      { p: 'Face à une question totalement nouvelle, vous devez mobiliser vos connaissances, comprendre la situation et construire votre raisonnement. Lorsque vous avez déjà travaillé de nombreuses situations proches, vous pouvez plus rapidement reconnaître certains éléments importants, identifier les connaissances à mobiliser et repérer certains pièges.' },
      { chute: 'L’objectif n’est pas de répondre mécaniquement, mais d’arriver au concours avec davantage de réflexes et une méthode de réponse plus efficace.' },
    ],
  },
  {
    q: 'Comment les entraînements peuvent-ils m’aider à prendre confiance avant les EVC ?',
    blocs: [
      { p: 'La confiance ne vient pas uniquement du nombre d’heures passées à réviser. Elle vient surtout du fait de constater que vous êtes progressivement capable de répondre, raisonner, corriger vos erreurs et obtenir des résultats plus réguliers.' },
      { p: 'Les QCM, dossiers cliniques, annales et examens blancs vous confrontent régulièrement à vos connaissances. Vous identifiez ainsi ce que vous maîtrisez réellement et ce qui nécessite encore du travail.' },
      { p: 'À l’approche du concours, l’objectif est de remplacer « J’espère avoir suffisamment travaillé » par :' },
      { chute: 'Je sais ce que je maîtrise, je connais mes points faibles et je sais ce qu’il me reste à consolider.' },
    ],
  },
  {
    q: 'Pourquoi l’accompagnement des enseignants est-il important ?',
    blocs: [
      { p: 'Parce qu’une préparation ne se résume pas à disposer de contenus.' },
      { p: 'Vous pouvez rencontrer une notion que vous ne comprenez pas, hésiter sur une correction, ne pas savoir comment interpréter une question ou vous demander si vous consacrez trop de temps à un sujet secondaire. Pouvoir échanger avec un enseignant permet de lever un doute, obtenir une explication et continuer à avancer.' },
      { p: 'Selon la formule choisie, les enseignants vous accompagnent également pour vous aider à cibler vos efforts, reprendre les notions importantes, travailler la méthodologie et analyser vos erreurs.' },
      { chute: 'Vous disposez d’une plateforme pour travailler, mais vous n’êtes pas laissé seul devant la plateforme.' },
    ],
  },
  {
    q: 'Est-ce que le fait d’être accompagné permet d’être moins stressé ?',
    blocs: [
      { p: 'L’accompagnement ne supprime évidemment pas le stress d’un concours, mais il peut réduire une grande source d’incertitude : ne pas savoir si l’on travaille dans la bonne direction.' },
      { p: 'Lorsque vous préparez seul, certaines questions peuvent revenir constamment :' },
      {
        questions: [
          'Est-ce que je travaille les bons sujets ?',
          'Est-ce que j’en fais suffisamment ?',
          'Est-ce que ce support est fiable ?',
          'Pourquoi cette réponse est-elle fausse ?',
          'Qu’est-ce que je dois reprendre maintenant ?',
        ],
      },
      { chute: 'Vous pouvez alors consacrer davantage d’énergie à travailler, plutôt qu’à constamment remettre en question votre organisation.' },
    ],
  },
  {
    q: 'Major ECN me donne-t-il un rythme de travail ?',
    blocs: [
      { p: 'Oui. C’est particulièrement important lorsque la préparation s’étend sur plusieurs mois.' },
      { p: 'Lorsqu’on travaille seul, il est facile de rester trop longtemps sur une thématique, de repousser certains entraînements ou de perdre progressivement son rythme.' },
      { p: 'La plateforme, les entraînements, les révisions et, selon votre formule, les cours avec les enseignants permettent de structurer votre progression. Vous savez ce que vous avez travaillé, ce qui reste fragile et ce qui doit encore être consolidé.' },
      { chute: 'Vous conservez la souplesse nécessaire pour adapter vos révisions à votre emploi du temps tout en bénéficiant d’un fil conducteur jusqu’aux épreuves.' },
    ],
  },
  {
    q: 'Pourquoi l’expérience de Major ECN est-elle importante ?',
    blocs: [
      { p: 'Préparer des candidats à un concours médical ne consiste pas simplement à leur fournir des cours. Il faut savoir structurer une préparation, hiérarchiser les connaissances, construire des entraînements, identifier les difficultés récurrentes et accompagner des candidats pendant plusieurs mois.' },
      { p: 'Major ECN prépare les médecins et professionnels de santé depuis 2011 et a accompagné plus de 9 000 candidats. Cette expérience nourrit la manière dont sont conçus les supports, les entraînements, la méthodologie et l’accompagnement.' },
      { chute: 'Le candidat n’a donc pas à inventer seul sa méthode de préparation : il bénéficie d’un cadre construit et amélioré au fil des années.' },
    ],
  },
  {
    q: 'Pourquoi ne pas simplement chercher mes réponses sur Internet ou les réseaux sociaux ?',
    blocs: [
      { p: 'Internet et les groupes de candidats peuvent être utiles pour échanger, mais les informations qui y circulent peuvent être incomplètes, contradictoires, non vérifiées ou ne pas correspondre précisément au format de votre épreuve.' },
      { p: 'Lorsqu’une information est importante pour votre préparation, passer du temps à comparer plusieurs réponses contradictoires peut également devenir chronophage.' },
      { p: 'Major ECN vous permet de travailler dans un environnement pédagogique structuré et de pouvoir, selon votre formule, poser directement vos questions aux enseignants.' },
      { chute: 'L’objectif est de limiter le temps passé à chercher une réponse parmi de multiples sources et de vous permettre de revenir rapidement à votre travail.' },
    ],
  },
  {
    q: 'Quels supports vais-je retrouver dans ma préparation ?',
    blocs: [
      { p: 'Selon la formule choisie, la préparation réunit notamment :' },
      {
        liste: [
          'fiches et ressources pédagogiques ;',
          'plus de 2 000 QCM ;',
          'dossiers cliniques ;',
          'annales corrigées ;',
          'entraînements ;',
          'outils de révision ;',
          'suivi de progression ;',
          'cours et replays selon la formule ;',
          'accompagnement et réponses aux questions.',
        ],
      },
      { p: 'Chaque format répond à un objectif différent : apprendre, revoir, tester, appliquer, corriger ou consolider.' },
      { chute: 'L’intérêt est de disposer d’un écosystème cohérent, plutôt que d’une accumulation de ressources indépendantes.' },
    ],
  },
  {
    q: 'La plateforme est-elle différente selon ma voie ?',
    blocs: [
      { p: 'La logique de préparation reste la même, mais les entraînements sont adaptés au format de votre voie.' },
      { p: 'Pour la voie interne, la plateforme propose des entraînements adaptés au format QCM. Pour la voie externe, les entraînements sont adaptés au format QROC.' },
      { chute: 'Vous n’avez donc pas à choisir entre deux plateformes différentes : votre environnement de préparation s’adapte au format de l’épreuve que vous préparez.' },
    ],
  },
];

/** Les douze premières questions restent visibles ; les suivantes se déplient. */
export const FAQ_ODO_VISIBLES = 12;

/** Réponse aplatie en texte simple — pour le JSON-LD FAQPage. */
export function reponseTexteOdo(q: QuestionOdo, prixApprofondie: string): string {
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
            return `${f.nom} — ${prix} — ${f.accroche} : ${f.texte}`;
          })
          .join(' '),
      );
    }
  }
  return morceaux.join(' ');
}
