/**
 * Foire aux questions de la page EVC Odontologie & Chirurgie dentaire.
 *
 * Onze questions, choisies pour couvrir les objections réelles d’un candidat :
 * préparer seul, le temps disponible, le programme, les supports, les formules
 * et le règlement. Les questions qui se répondaient les unes les autres ont été
 * retirées. Toutes les réponses sont dans le HTML dès le chargement, accordéon
 * fermé compris.
 *
 * L’odontologie ne comporte pas de voie externe : aucune question ne mentionne
 * la voie externe ni les QROC.
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
    q: 'Puis-je régler ma préparation en plusieurs fois ?',
    blocs: [
      { p: 'Oui. Le règlement en trois ou quatre fois est proposé au moment du paiement, sans frais supplémentaires.' },
      { p: 'Si vous exercez au sein d’un établissement de santé, votre préparation peut également faire l’objet d’une prise en charge : nous établissons le devis et la convention de formation nécessaires à votre dossier.' },
      { chute: 'Si vous avez une question sur le règlement ou sur une prise en charge, écrivez-nous avant de vous inscrire : nous vous indiquerons la marche à suivre.' },
    ],
  },
];

/** Toutes les questions sont visibles : la liste a été ramenée à l’essentiel. */
export const FAQ_ODO_VISIBLES = 11;

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
