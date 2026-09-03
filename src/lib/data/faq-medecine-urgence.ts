/**
 * Foire aux questions de la page EVC Médecine d'urgence.
 *
 * Contenu fourni par Cyril le 03/09/2026, repris mot pour mot, dans son ordre :
 * la section « La session 2026 » vient en tête, avant le programme puis la
 * préparation. Les six questions de cette première section sont visibles sans
 * dépliage (`FAQ_URGENCE_VISIBLES`), les suivantes s'ouvrent avec « Voir toutes
 * les questions » — mais TOUTES les réponses sont dans le HTML servi par le
 * serveur, accordéon fermé compris, et publiées en `FAQPage` par la route
 * (cf. `faqSchema` dans app/(marketing)/specialites/medecine-d-urgence/page.tsx).
 *
 * Le tarif du Programme Approfondi n'est pas écrit ici : il est résolu au
 * rendu depuis le catalogue Stripe.
 */

export type BlocFaqUrgence =
  | { p: string }
  | { liste: string[] }
  | { questions: string[] }
  | { chaine: string[] }
  | { formules: { cle: 'essentielle' | 'intensive' | 'approfondie'; nom: string; texte: string }[] }
  | { chute: string };

export type QuestionUrgence = { q: string; blocs: BlocFaqUrgence[] };

export const FAQ_URGENCE: QuestionUrgence[] = [
  /* ── 1. La session 2026 en médecine d'urgence ── */
  {
    q: 'Combien de postes sont ouverts en médecine d’urgence aux EVC 2026 ?',
    blocs: [
      { p: 'Pour la session 2026, 270 postes sont ouverts en voie interne et 72 en voie externe, soit 342 postes au total en médecine d’urgence.' },
      { p: 'Ces chiffres figurent en annexe de l’arrêté du 12 juin 2026 portant ouverture des épreuves de vérification des connaissances.' },
      { chute: 'La médecine d’urgence est la troisième spécialité la plus dotée en voie interne, derrière la médecine interne polyvalente (MIPIC) et la psychiatrie.' },
    ],
  },
  {
    q: 'Quand a lieu l’épreuve de médecine d’urgence ?',
    blocs: [
      { p: 'L’épreuve se déroule le jeudi 19 novembre 2026, à l’Espace Jean-Monnet de Rungis.' },
      { p: 'C’est la troisième épreuve du calendrier 2026-2027, qui s’étend du 10 novembre 2026 au 15 janvier 2027.' },
      { chute: 'Cette date précoce a une conséquence directe : les candidats en médecine d’urgence disposent de moins de temps de préparation que ceux des spécialités programmées en décembre ou en janvier.' },
    ],
  },
  {
    q: 'Quel est le format de l’épreuve en médecine d’urgence ?',
    blocs: [
      { p: 'Le format dépend de votre voie.' },
      { p: 'La voie interne repose sur une épreuve de QCM, de 10 h à 12 h.' },
      { p: 'La voie externe comporte deux épreuves écrites de deux heures chacune, de 10 h à 12 h puis de 15 h à 17 h.' },
      { chute: 'Les deux voies passent le même jour. Les connaissances médicales évaluées se recoupent largement ; c’est la manière de les restituer le jour de l’épreuve qui diffère.' },
    ],
  },
  {
    q: 'La médecine d’urgence est-elle ouverte dans les deux voies ?',
    blocs: [
      { p: 'Oui. C’est l’une des treize spécialités ouvertes en voie externe pour 2026, et elle figure également parmi les spécialités les mieux dotées en voie interne.' },
      { chute: 'Un candidat en médecine d’urgence peut donc se présenter dans l’une ou l’autre voie, selon sa situation. Plusieurs spécialités, notamment chirurgicales, ne sont ouvertes qu’en voie interne cette année.' },
    ],
  },
  {
    q: 'Le nombre de postes signifie-t-il que l’épreuve est plus facile ?',
    blocs: [
      { p: 'Non. Un nombre élevé de postes attire mécaniquement davantage de candidats.' },
      { p: 'C’est le rapport entre le nombre de candidats et le nombre de postes qui détermine la sélectivité réelle, et ce rapport n’est pas connu à l’avance.' },
      { chute: 'Il faut aussi garder à l’esprit qu’un poste reste vacant si aucune copie n’atteint le niveau attendu : la sélection porte sur un niveau, pas seulement sur un rang.' },
    ],
  },
  {
    q: 'Comment obtenir ma convocation ?',
    blocs: [
      { p: 'La convocation est mise à disposition par le Centre national de gestion, au plus tôt un mois avant la date de l’épreuve.' },
      { chute: 'Pour la médecine d’urgence, l’épreuve ayant lieu le 19 novembre 2026, la convocation ne sera donc pas disponible avant la seconde moitié du mois d’octobre.' },
    ],
  },

  /* ── 2. Le programme et les attendus ── */
  {
    q: 'Le programme de médecine d’urgence est très vaste. Comment savoir quoi travailler en priorité ?',
    blocs: [
      { p: 'C’est l’une des principales difficultés de cette spécialité. L’urgentiste est confronté à de nombreuses disciplines : cardiologie, neurologie, pneumologie, traumatologie, pédiatrie, psychiatrie, gériatrie, obstétrique ou encore toxicologie.' },
      { p: 'Cette polyvalence rend l’accumulation de supports particulièrement inefficace. Travailler davantage ne signifie pas nécessairement mieux préparer les EVC.' },
      { chute: 'Il faut d’abord identifier les situations réellement évaluées, hiérarchiser les connaissances, puis les organiser autour du raisonnement d’urgence : reconnaître, hiérarchiser, décider et répondre dans un temps contraint.' },
    ],
  },
  {
    q: 'Quelles sont les grandes situations cliniques à maîtriser ?',
    blocs: [
      { p: 'Sans prétendre à l’exhaustivité, les situations les plus structurantes relèvent de six domaines :' },
      {
        liste: [
          'Urgences vitales : arrêt cardio-respiratoire, détresse respiratoire aiguë, états de choc, coma…',
          'Urgences cardiovasculaires : syndrome coronarien aigu, troubles du rythme, embolie pulmonaire, insuffisance cardiaque aiguë…',
          'Urgences neurologiques : accident vasculaire cérébral, état de mal épileptique, céphalées aiguës, troubles de conscience…',
          'Traumatologie : polytraumatisé, traumatisme crânien, traumatismes des membres, hémorragie…',
          'Urgences médicales diverses : sepsis, intoxications, troubles métaboliques et hydro-électrolytiques, douleur abdominale aiguë…',
          'Populations particulières : urgences pédiatriques, gériatriques, psychiatriques et obstétricales…',
        ],
      },
    ],
  },
  {
    q: 'Les recommandations françaises sont-elles différentes de celles de mon pays ?',
    blocs: [
      { p: 'Souvent, oui — et c’est une difficulté importante pour les praticiens à diplôme étranger.' },
      { p: 'La médecine d’urgence est très protocolisée en France. Les seuils, les algorithmes, les délais de prise en charge ou les molécules de première intention peuvent différer de ceux appliqués dans d’autres pays.' },
      { p: 'Une conduite à tenir pratiquée pendant des années peut donc ne pas correspondre exactement à ce qu’attend une grille de correction française.' },
      { chute: 'Pour un médecin expérimenté, il ne s’agit pas de réapprendre son métier, mais de remettre ses connaissances en cohérence avec les recommandations françaises et d’adapter sa manière de répondre au format de l’épreuve.' },
    ],
  },
  {
    q: 'Est-ce que mon expérience aux urgences suffit à réussir l’épreuve ?',
    blocs: [
      { p: 'L’expérience clinique est un atout considérable, mais elle ne suffit pas.' },
      { p: 'Aux urgences, vous décidez avec un patient devant vous, un examen clinique, des examens complémentaires et la possibilité de réévaluer. Aux EVC, vous disposez d’un énoncé écrit, d’un format contraint et de quelques minutes.' },
      { chute: 'Ce sont deux exercices différents. De nombreux candidats expérimentés perdent des points non par méconnaissance, mais parce que leur réponse ne prend pas la forme attendue : comprendre précisément ce qui est demandé, identifier les éléments discriminants et restituer la réponse dans le format de l’épreuve sont des compétences qui se travaillent.' },
    ],
  },
  {
    q: 'La gestion du temps est-elle un vrai enjeu en médecine d’urgence ?',
    blocs: [
      { p: 'Oui, et probablement plus que dans d’autres spécialités, parce que le programme est particulièrement large.' },
      { p: 'Deux heures d’épreuve imposent un rythme qu’il faut avoir mesuré avant le jour J. Un candidat qui approfondit excessivement les premières questions peut perdre des points sur les dernières, alors même qu’il en connaissait les réponses.' },
      { chute: 'La seule façon de connaître son rythme réel est de s’entraîner en conditions chronométrées, sur des sujets complets.' },
    ],
  },
  {
    q: 'Faut-il travailler différemment selon sa voie ?',
    blocs: [
      { p: 'Oui. C’est essentiel.' },
      { p: 'En voie interne, l’entraînement porte notamment sur la précision de lecture, l’analyse des propositions, les pièges de formulation et la stratégie de réponse au QCM.' },
      { p: 'En voie externe, il porte davantage sur la construction de la réponse : hiérarchisation, mots-clés attendus, éléments indispensables et structuration.' },
      { chute: 'Un candidat qui s’entraîne dans le mauvais format travaille un exercice qu’il ne passera pas. C’est une perte de temps que peu de candidats identifient à temps.' },
    ],
  },

  /* ── 3. Se préparer avec Major ECN ── */
  {
    q: 'Comment Major ECN prépare-t-il spécifiquement aux EVC de médecine d’urgence ?',
    blocs: [
      { p: 'La préparation est construite autour de la spécialité, du format de votre voie et de votre progression.' },
      { p: 'Elle réunit fiches de synthèse et fiches éclair, QCM ou QROC selon votre voie, dossiers cliniques, annales corrigées, flashcards, entraînements et outils de suivi de progression.' },
      { p: 'Selon la formule choisie, cet environnement est complété par des cours en direct avec des médecins spécialistes, les replays des enseignements et un accompagnement pédagogique.' },
      { chute: 'L’objectif n’est pas de multiplier les ressources. Il est de vous aider à savoir quoi travailler, quoi revoir et où concentrer vos efforts jusqu’aux EVC.' },
    ],
  },
  {
    q: 'Je travaille aux urgences avec des gardes et des horaires décalés. Est-ce compatible ?',
    blocs: [
      { p: 'Oui. C’est même l’une des contraintes les plus fréquentes chez les candidats en médecine d’urgence.' },
      { p: 'La plateforme est accessible à toute heure. Fiches, entraînements, cas cliniques et annales peuvent être travaillés par séquences courtes, en fonction de vos disponibilités réelles.' },
      { p: 'Selon la formule choisie, les cours en direct restent ensuite accessibles en replay, ce qui permet de poursuivre sa préparation lorsqu’une garde empêche d’assister à une séance.' },
      { chute: 'Une préparation qui suppose plusieurs heures disponibles chaque soir n’est pas réaliste pour un urgentiste. C’est à la préparation de s’adapter au rythme du candidat, et non l’inverse.' },
    ],
  },
  {
    q: 'J’ai déjà passé les EVC et j’ai échoué. Comment reprendre différemment ?',
    blocs: [
      { p: 'Vous ne repartez pas de zéro.' },
      { p: 'Après un échec, la question n’est pas seulement « qu’est-ce que je dois réapprendre ? », mais « qu’est-ce qui m’a empêché de réussir ? » Manque de connaissances sur certains domaines ? Mauvaise priorisation ? Méthodologie ? Gestion du temps ? Difficulté à structurer les réponses ?' },
      { chute: 'Le suivi de progression et les corrections détaillées permettent de transformer les erreurs en axes de travail, plutôt que de reprendre uniformément l’ensemble du programme.' },
    ],
  },
  {
    q: 'Il me reste peu de temps avant l’épreuve. Est-ce encore utile de commencer ?',
    blocs: [
      { p: 'Oui, mais la stratégie change lorsque le temps est compté.' },
      { p: 'Reprendre uniformément l’intégralité du programme n’est plus réaliste. Il faut identifier les situations prioritaires, repérer ses lacunes principales et augmenter la part d’entraînement dans le format de sa voie.' },
      { chute: 'À quelques semaines de l’épreuve, la marge de progression se situe souvent dans la méthode, le rythme et la forme des réponses plutôt que dans les connaissances elles-mêmes. Le travail se concentre alors sur ce qui peut encore être amélioré jusqu’au jour J.' },
    ],
  },
  {
    q: 'Comment identifier mes lacunes ?',
    blocs: [
      { p: 'Faire beaucoup de questions ne suffit pas. Il faut comprendre pourquoi on se trompe.' },
      { p: 'Une erreur peut provenir d’une mauvaise lecture, d’une connaissance insuffisante, d’un problème de formulation ou d’une mauvaise gestion du temps.' },
      { chute: 'Un score indique un résultat. Une erreur analysée devient un axe de progression. C’est le principe des corrections détaillées et du suivi de progression : identifier les points qui restent fragiles et orienter les révisions en conséquence.' },
    ],
  },
  {
    q: 'Les concours blancs apportent-ils vraiment quelque chose ?',
    blocs: [
      { p: 'Oui, car connaître son cours et réussir une épreuve sont deux compétences différentes.' },
      { p: 'Un concours blanc permet de travailler la gestion du temps, la concentration, la précision et la stratégie de réponse. Il révèle aussi, avant l’épreuve, les domaines qui restent fragiles.' },
      { chute: 'Le jour des EVC ne devrait pas être la première fois où vous vous confrontez réellement aux contraintes de votre épreuve.' },
    ],
  },
  {
    q: 'Quelle formule choisir pour préparer les EVC de médecine d’urgence ?',
    blocs: [
      { p: 'Le choix dépend principalement de votre niveau actuel, du temps restant avant l’épreuve et du degré d’accompagnement dont vous avez besoin.' },
      { p: 'Certains candidats ont surtout besoin d’une plateforme structurée pour organiser leurs révisions et s’entraîner. D’autres souhaitent y ajouter des cours en direct, des replays et un accompagnement plus important.' },
      { p: 'Plusieurs niveaux de préparation sont proposés, afin de ne pas imposer le même accompagnement à tous les candidats.' },
      { chute: 'Si vous hésitez, indiquez-nous votre voie, votre situation actuelle et l’avancement de vos révisions : nous vous orienterons vers la formule la plus adaptée.' },
    ],
  },
  {
    q: 'Major ECN garantit-il la réussite aux EVC ?',
    blocs: [
      { p: 'Non. Et aucune préparation sérieuse ne peut garantir la réussite à un concours.' },
      { p: 'Les EVC dépendent notamment du niveau des copies, du nombre de candidats et du nombre de postes ouverts. Aucun organisme de préparation ne maîtrise ces paramètres.' },
      { p: 'Ce qu’une préparation peut apporter, en revanche, c’est un cadre de travail structuré, des contenus adaptés à la spécialité et à votre voie, des entraînements réguliers, des corrections détaillées, un suivi de progression et, selon la formule choisie, l’accompagnement de médecins spécialistes.' },
      { chute: 'Le travail personnel, la régularité et l’investissement du candidat restent déterminants.' },
    ],
  },
];

/** Les six questions de la session 2026 restent visibles ; les suivantes se déplient. */
export const FAQ_URGENCE_VISIBLES = 6;

/** Réponse aplatie en texte simple — pour le JSON-LD FAQPage. */
export function reponseTexteUrgence(q: QuestionUrgence, prixApprofondie: string): string {
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
