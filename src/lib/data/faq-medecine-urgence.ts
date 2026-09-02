/**
 * Foire aux questions de la page EVC Médecine d'urgence.
 *
 * Les douze premières questions sont celles de la maquette, propres à la
 * spécialité ; les suivantes reprennent le corpus transverse fourni et se
 * déplient avec « Voir toutes les questions ». Toutes les réponses sont dans
 * le HTML dès le chargement, accordéon fermé compris.
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
  {
    q: 'Peut-on préparer seul les EVC de médecine d’urgence ?',
    blocs: [
      { p: 'C’est possible, mais préparer seul les EVC signifie devoir répondre quotidiennement aux mêmes questions :' },
      {
        questions: [
          'Que dois-je travailler aujourd’hui ?',
          'Quelles notions sont réellement prioritaires ?',
          'Qu’est-ce que j’ai déjà oublié ?',
          'Quels sont mes points faibles ?',
          'Suis-je suffisamment avancé ?',
        ],
      },
      { p: 'Major ECN a justement pour objectif de vous éviter cette préparation désorganisée. La préparation associe méthodologie, enseignement, entraînement, révisions ciblées, suivi de progression et accompagnement pédagogique.' },
      { chute: 'Votre temps de travail est ainsi consacré aux notions qui vous permettront réellement de progresser.' },
    ],
  },
  {
    q: 'Comment Major ECN me fait-il gagner du temps ?',
    blocs: [
      { p: 'En médecine d’urgence, la difficulté n’est pas de trouver de l’information : elle est de savoir laquelle retenir et jusqu’où l’approfondir.' },
      { p: 'La plateforme réunit au même endroit vos fiches, QCM, cas cliniques, annales, flashcards et révisions. Vous ne repartez pas chaque jour d’une page blanche et vous ne passez pas vos soirées à comparer des ressources.' },
      { chute: 'Moins de temps à chercher comment travailler. Plus de temps à développer les réflexes attendus aux EVC.' },
    ],
  },
  {
    q: 'Comment savoir quelles situations travailler en priorité ?',
    blocs: [
      { p: 'Les résultats obtenus aux QCM, cas cliniques, évaluations et épreuves blanches font apparaître les domaines les moins bien maîtrisés.' },
      { p: 'Vous pouvez progressivement identifier :' },
      {
        liste: [
          'les notions encore fragiles ;',
          'les thèmes régulièrement oubliés ;',
          'les erreurs récurrentes ;',
          'les domaines nécessitant davantage d’entraînement.',
        ],
      },
      { chute: 'Vous consacrez alors davantage de temps là où il peut réellement vous faire progresser.' },
    ],
  },
  {
    q: 'Comment les entraînements m’aident-ils à gagner en rapidité ?',
    blocs: [
      { p: 'Aux urgences comme aux EVC, la rapidité vient de la reconnaissance des situations.' },
      { p: 'Les QCM permettent de transformer une connaissance théorique en connaissance mobilisable, et de repérer rapidement les confusions et les notions insuffisamment maîtrisées. Les cas cliniques travaillent la mobilisation de plusieurs connaissances autour d’une même situation.' },
      { chute: 'Les entraînements ne sont pas un test final : ils font partie de l’apprentissage.' },
    ],
  },
  {
    q: 'Comment sont corrigés les cas cliniques et les annales ?',
    blocs: [
      { p: 'Les entraînements et les épreuves blanches donnent lieu à une correction permettant d’analyser les réponses et les erreurs commises.' },
      { p: 'Selon les modalités de la préparation, cette analyse permet également de cibler plus précisément les connaissances à retravailler.' },
      { chute: 'L’intérêt d’une correction n’est pas seulement d’obtenir une note : elle doit vous permettre de savoir quoi corriger ensuite.' },
    ],
  },
  {
    q: 'Puis-je poser mes questions aux enseignants ?',
    blocs: [
      { p: 'Oui. C’est l’un des points importants de la préparation Major ECN.' },
      { p: 'Lorsque vous ne comprenez pas une notion, une correction ou une réponse, vous ne devez pas rester seul avec votre difficulté. Vous pouvez poser vos questions à l’équipe pédagogique selon les modalités prévues dans votre formule.' },
      { chute: 'Major ECN met l’accent non seulement sur la quantité de contenus disponibles, mais également sur la disponibilité pédagogique.' },
    ],
  },
  {
    q: 'Comment Major ECN m’aide-t-il à garder un rythme et ma motivation ?',
    blocs: [
      { p: 'Les cours, entraînements et révisions structurent votre préparation semaine après semaine. Vous savez ce que vous avez travaillé et ce qu’il vous reste à consolider.' },
      { p: 'Il n’existe pas de durée de travail identique pour tous les candidats : elle dépend de votre niveau initial, de votre activité professionnelle et du temps restant avant l’épreuve.' },
      { chute: 'Une heure de travail correctement ciblée peut être beaucoup plus utile que plusieurs heures de révision désorganisée.' },
    ],
  },
  {
    q: 'Puis-je préparer les EVC tout en travaillant aux urgences ?',
    blocs: [
      { p: 'Oui. Une grande partie des candidats prépare les EVC parallèlement à une activité professionnelle.' },
      { p: 'La plateforme, les replays, les fiches, les flashcards et les différents outils de révision permettent d’organiser votre travail en fonction de vos disponibilités — gardes comprises.' },
      { chute: 'La méthodologie vise justement à vous aider à utiliser efficacement le temps dont vous disposez.' },
    ],
  },
  {
    q: 'Est-il trop tard pour commencer ma préparation ?',
    blocs: [
      { p: 'Non. Il reste possible de progresser même lorsque l’on commence tardivement, mais la stratégie doit être différente.' },
      { p: 'Lorsque le temps devient limité, il est particulièrement important de :' },
      {
        liste: [
          'hiérarchiser les connaissances ;',
          'cibler les domaines prioritaires ;',
          'identifier rapidement ses lacunes ;',
          'multiplier les entraînements ;',
          'organiser des révisions régulières.',
        ],
      },
      { chute: 'La préparation vous évite justement de perdre les premières semaines à construire seul votre méthode.' },
    ],
  },
  {
    q: 'Pourquoi l’expérience de Major ECN est-elle importante ?',
    blocs: [
      { p: 'La préparation s’appuie sur une équipe médicale et pédagogique ayant une expérience importante de la préparation aux EVC.' },
      { p: 'Cette connaissance des épreuves permet de mieux hiérarchiser les notions, d’orienter les révisions et d’éviter une préparation trop généraliste ou déconnectée des exigences du concours.' },
      { chute: 'Major ECN prépare les médecins aux concours et aux épreuves médicales depuis 2011, et a accompagné plus de 9 000 médecins.' },
    ],
  },
  {
    q: 'Quelle formule choisir pour les EVC de médecine d’urgence ?',
    blocs: [
      { p: 'Le choix dépend de votre niveau, de votre autonomie et du temps dont vous disposez.' },
      {
        formules: [
          { cle: 'essentielle', nom: 'Essentielle', texte: 'Pour les candidats qui souhaitent travailler de manière autonome avec les outils de la plateforme.' },
          { cle: 'intensive', nom: 'Intensive', texte: 'Ajoute un programme de révisions et d’entraînement plus soutenu afin de renforcer la préparation avant les EVC.' },
          { cle: 'approfondie', nom: 'Approfondie', texte: 'L’accompagnement le plus complet : reprise plus approfondie des connaissances, enseignements, entraînements, accompagnement humain renforcé et suivi jusqu’au concours.' },
        ],
      },
      { chute: 'Les candidats disposant déjà de bases solides et souhaitant principalement des outils de travail peuvent choisir une formule plus légère.' },
    ],
  },
  {
    q: 'Quelles sont les thématiques abordées en médecine d’urgence ?',
    blocs: [
      { p: 'La préparation couvre les grands domaines nécessaires aux EVC de médecine d’urgence :' },
      {
        liste: [
          'urgences vitales et défaillances ;',
          'urgences cardiovasculaires ;',
          'urgences respiratoires ;',
          'urgences neurologiques ;',
          'traumatologie et polytraumatisé ;',
          'urgences métaboliques et toxicologiques ;',
          'urgences abdominales et infectieuses ;',
          'situations spécifiques et stratégie EVC.',
        ],
      },
      { chute: 'Et de nombreuses autres situations essentielles de médecine d’urgence travaillées au cours de votre préparation.' },
    ],
  },

  /* ── Questions supplémentaires, dépliées par « Voir toutes les questions » ── */

  {
    q: 'À qui s’adresse la préparation EVC Médecine d’urgence de Major ECN ?',
    blocs: [
      { p: 'La préparation s’adresse aux médecins souhaitant préparer les Épreuves de Vérification des Connaissances en médecine d’urgence.' },
      { p: 'Elle est conçue aussi bien pour les candidats qui souhaitent reprendre méthodiquement l’ensemble de leur préparation que pour ceux qui disposent déjà de connaissances solides mais ont besoin de mieux cibler leurs révisions et d’identifier leurs dernières lacunes.' },
      { chute: 'L’objectif n’est pas simplement de vous donner accès à des cours supplémentaires : Major ECN vous apporte une méthode, un cadre de travail, des outils d’entraînement, un suivi de progression et un accompagnement humain.' },
    ],
  },
  {
    q: 'La préparation concerne-t-elle la voie interne et la voie externe ?',
    blocs: [
      { p: 'Oui.' },
      { p: 'La préparation tient compte des particularités de la voie dans laquelle vous vous présentez afin d’adapter votre entraînement et votre méthodologie aux modalités de l’épreuve.' },
    ],
  },
  {
    q: 'Comment savoir si je progresse réellement ?',
    blocs: [
      { p: 'La plateforme Major ECN intègre un suivi de progression détaillé : votre avancement, vos résultats aux différents entraînements et les domaines dans lesquels vous rencontrez encore des difficultés.' },
      { p: 'L’objectif n’est pas uniquement de savoir combien de cours vous avez regardés ou combien de fiches vous avez lues. Le suivi doit vous permettre de répondre à une question beaucoup plus importante :' },
      { chute: 'Qu’est-ce que je maîtrise déjà, et sur quoi dois-je encore travailler ?' },
    ],
  },
  {
    q: 'Comment fonctionnent les révisions programmées ?',
    blocs: [
      { p: 'Une difficulté classique des EVC est d’oublier, quelques mois plus tard, ce qui avait été parfaitement appris.' },
      { p: 'La préparation intègre donc des systèmes de révision programmée et transversale. Les connaissances déjà travaillées sont régulièrement réactivées afin de ne pas disparaître progressivement de votre mémoire.' },
      { chute: 'L’objectif est de maintenir les connaissances actives jusqu’au concours.' },
    ],
  },
  {
    q: 'Qu’est-ce qu’une révision transversale ?',
    blocs: [
      { p: 'Une révision transversale permet de revenir régulièrement sur plusieurs thèmes déjà étudiés au lieu de réviser uniquement le chapitre du moment.' },
      { p: 'Vous pouvez par exemple travailler un nouveau domaine tout en réactivant des connaissances de traumatologie, de toxicologie ou d’urgences respiratoires déjà étudiées. Cette organisation permet :' },
      {
        liste: [
          'd’entretenir les connaissances dans la durée ;',
          'de limiter l’oubli ;',
          'de faire des liens entre différents domaines ;',
          'd’arriver au concours avec un programme régulièrement réactivé.',
        ],
      },
    ],
  },
  {
    q: 'Y a-t-il des épreuves blanches ?',
    blocs: [
      { p: 'Oui. Des épreuves blanches sont proposées dans le cadre de la préparation selon la formule choisie.' },
      { p: 'Elles permettent de vous confronter à une épreuve plus globale et de mesurer votre niveau dans des conditions plus proches du concours. Leur intérêt ne s’arrête pas à la réalisation du sujet : elles permettent également de' },
      {
        liste: [
          'mesurer votre niveau ;',
          'identifier vos erreurs ;',
          'repérer les domaines insuffisamment maîtrisés ;',
          'vous entraîner à gérer votre temps ;',
          'vous situer par rapport aux autres candidats.',
        ],
      },
    ],
  },
  {
    q: 'Les flashcards sont-elles vraiment utiles pour les EVC ?',
    blocs: [
      { p: 'Oui. Les flashcards reposent sur un principe de mémoire active : au lieu de relire une information, vous devez essayer de la retrouver avant d’afficher la réponse.' },
      { p: 'Elles sont particulièrement utiles pour les notions qui doivent pouvoir être retrouvées rapidement : critères diagnostiques, conduites à tenir, traitements, seuils, complications, classifications ou éléments de surveillance.' },
      { chute: 'L’objectif est d’ancrer progressivement certaines connaissances afin qu’elles deviennent beaucoup plus facilement mobilisables le jour de l’épreuve.' },
    ],
  },
  {
    q: 'Les flashcards remplacent-elles les cours ?',
    blocs: [
      { p: 'Non. Les flashcards sont un outil de mémorisation, utilisé après l’apprentissage et la compréhension des connaissances.' },
      { chaine: ['Comprendre', 'Apprendre', 'S’entraîner', 'Mémoriser', 'Réactiver', 'S’évaluer'] },
      { chute: 'Chaque outil de la plateforme intervient à une étape différente de votre préparation.' },
    ],
  },
  {
    q: 'Quel est l’intérêt des fiches éclair ?',
    blocs: [
      { p: 'Les fiches éclair sont conçues pour permettre une révision très rapide des éléments essentiels.' },
      { p: 'Elles deviennent particulièrement utiles lorsque le concours approche et que le temps disponible pour reprendre un thème entier devient limité.' },
      { chute: 'L’objectif est de pouvoir retrouver rapidement les notions fondamentales à connaître.' },
    ],
  },
  {
    q: 'Les cours sont-ils disponibles en replay ?',
    blocs: [
      { p: 'Lorsque le replay est inclus dans votre formule, les séances concernées peuvent être reprises depuis votre espace pédagogique.' },
      { chute: 'Cela permet aux candidats ayant une activité hospitalière de poursuivre leur préparation même lorsqu’ils ne peuvent pas assister à une séance en direct.' },
    ],
  },
  {
    q: 'Peut-on commencer en cours d’année ?',
    blocs: [
      { p: 'Oui. Vous pouvez rejoindre la préparation en cours d’année et reprendre progressivement les contenus disponibles.' },
      { chute: 'L’organisation de votre travail sera naturellement différente selon qu’il reste plusieurs mois ou seulement quelques semaines avant les EVC.' },
    ],
  },
  {
    q: 'Comment savoir ce que je dois réviser à l’approche du concours ?',
    blocs: [
      { p: 'À mesure que le concours approche, votre suivi, vos résultats aux entraînements et vos épreuves blanches permettent d’identifier plus précisément les domaines qui nécessitent encore du travail. Vous pouvez alors concentrer vos dernières semaines sur :' },
      {
        liste: [
          'vos faiblesses ;',
          'les connaissances fréquemment oubliées ;',
          'les erreurs récurrentes ;',
          'les domaines prioritaires.',
        ],
      },
      { chute: 'Les dernières semaines ne doivent pas être consacrées à tout recommencer, mais à consolider ce qui peut encore vous faire gagner des points.' },
    ],
  },
  {
    q: 'Les contenus sont-ils actualisés ?',
    blocs: [
      { p: 'Les contenus sont suivis et peuvent évoluer afin de tenir compte des recommandations et référentiels utiles à la préparation.' },
    ],
  },
];

/** Les douze premières questions restent visibles ; les suivantes se déplient. */
export const FAQ_URGENCE_VISIBLES = 12;

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
