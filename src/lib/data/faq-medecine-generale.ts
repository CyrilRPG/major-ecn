/**
 * Foire aux questions de la page EVC Médecine générale.
 *
 * Données pures : la page cliente les affiche en accordéons et la route
 * serveur les aplatit pour le JSON-LD FAQPage. Les dix premières questions
 * sont celles que le cahier des charges SEO demande de montrer en premier ;
 * les suivantes sont dans le HTML dès le chargement et se déplient avec le
 * bouton « Voir toutes les questions ».
 */

/** Les formes que prend une réponse : paragraphe, liste, encadré par voie,
    phrase de chute, enchaînement d'étapes ou repères par année. */
export type BlocFaqMg =
  | { p: string }
  | { liste: string[] }
  | { voies: { titre: string; voie: 'interne' | 'externe'; textes: string[] }[] }
  | { chute: string }
  | { chaine: string[] }
  | { annees: { an: string; texte: string }[] };

export type QuestionMg = { q: string; blocs: BlocFaqMg[] };

export const FAQ_MG: QuestionMg[] = [
  {
    q: 'Pourquoi choisir Major ECN pour préparer les EVC de médecine générale ?',
    blocs: [
      { p: 'Parce qu’une préparation aux EVC ne consiste pas simplement à accumuler des cours, des fiches et des questions.' },
      { p: 'Major ECN vous apporte un cadre, une méthode, des supports ciblés, des entraînements adaptés à votre voie et un accompagnement humain pour vous aider à savoir quoi travailler, comment le travailler et comment progresser.' },
      { p: 'Avec plus de 15 ans d’expérience dans la préparation aux concours médicaux et plus de 9 000 médecins accompagnés, Major ECN connaît les difficultés auxquelles sont confrontés les candidats : programme très vaste, manque de temps, activité professionnelle, vie familiale, difficulté à hiérarchiser les connaissances ou encore méthodologie de réponse.' },
      { p: 'Notre philosophie est simple :' },
      { chute: 'L’objectif n’est pas de tout faire. C’est de travailler ce qui vous fera réussir.' },
    ],
  },
  {
    q: 'Est-ce vraiment utile d’être accompagné pour préparer les EVC ?',
    blocs: [
      { p: 'Oui, notamment parce que l’une des principales difficultés des EVC est de savoir où concentrer son temps et son énergie.' },
      { p: 'Seul, on peut facilement multiplier les ressources, passer trop de temps sur certaines notions, négliger des sujets importants ou accumuler les entraînements sans réellement comprendre ses erreurs.' },
      { p: 'Avec Major ECN, vous disposez d’une direction : les enseignants vous guident, les supports ciblent les notions importantes, les corrections permettent de comprendre vos erreurs et la plateforme vous aide à suivre votre progression.' },
      { chute: 'Vous restez acteur de votre réussite, mais vous n’êtes pas seul dans votre préparation.' },
    ],
  },
  {
    q: 'Major ECN peut-il me faire gagner du temps ?',
    blocs: [
      { p: 'C’est précisément l’un des objectifs de la préparation.' },
      { p: 'Beaucoup de candidats doivent concilier les EVC avec un poste, des gardes, une activité professionnelle, une vie personnelle et des responsabilités familiales. Dans ces conditions, chaque heure disponible est précieuse.' },
      { p: 'Major ECN vous évite de repartir systématiquement de zéro : chercher vos supports, multiplier les sources, construire seul vos entraînements ou essayer de déterminer ce qui est prioritaire.' },
      { p: 'Vous pouvez consacrer davantage de votre temps à ce qui compte réellement :' },
      { chute: 'apprendre, vous entraîner, comprendre vos erreurs et progresser.' },
    ],
  },
  {
    q: 'Je travaille à temps plein. La préparation Major ECN est-elle adaptée ?',
    blocs: [
      { p: 'Oui.' },
      { p: 'Une grande partie des candidats prépare les EVC parallèlement à une activité professionnelle.' },
      { p: 'Les supports sont disponibles sur la plateforme et les cours concernés restent accessibles en replay pendant la période de préparation. Vous pouvez donc organiser votre travail en fonction de vos disponibilités.' },
      { p: 'Et lorsque votre temps est limité, l’accompagnement prend encore davantage de sens : vous devez savoir rapidement sur quoi concentrer vos efforts plutôt que perdre du temps à chercher quoi travailler.' },
    ],
  },
  {
    q: 'Quelle est la différence entre la voie interne et la voie externe en médecine générale ?',
    blocs: [
      { p: 'Les formats d’épreuve ne sont pas identiques et la préparation doit donc être adaptée.' },
      {
        voies: [
          {
            titre: 'Voie interne — QCM',
            voie: 'interne',
            textes: [
              'La voie interne nécessite une préparation spécifique au format QCM.',
              'Il ne suffit pas de connaître son cours : il faut également savoir analyser précisément l’énoncé, repérer les pièges, distinguer des propositions parfois très proches et éviter les erreurs liées à une lecture trop rapide.',
              'La préparation Major ECN vous apprend à développer une véritable méthodologie QCM : comprendre ce qui est réellement demandé, déceler les pièges sans tomber dedans, mobiliser rapidement les connaissances pertinentes et gagner progressivement en précision et en rapidité.',
              'Une banque complète de QCM corrigés permet ensuite de multiplier les entraînements et de développer les automatismes nécessaires.',
              'En QCM, connaître la réponse est essentiel. Savoir éviter les pièges peut faire la différence.',
            ],
          },
          {
            titre: 'Voie externe — QROC',
            voie: 'externe',
            textes: [
              'La voie externe nécessite une approche différente.',
              'Il faut savoir rédiger la réponse attendue, utiliser les bons mots-clés dans sa réponse, aller à l’essentiel, hiérarchiser les informations et connaître les éléments indispensables et les PMZ (« pas mis = zéro ») lorsqu’ils s’appliquent.',
              'Major ECN met à disposition une banque complète de QROC corrigés et une méthodologie spécifiquement adaptée à la voie externe.',
            ],
          },
        ],
      },
    ],
  },
  {
    q: 'Pourquoi la méthodologie QROC est-elle si importante en voie externe ?',
    blocs: [
      { p: 'Parce qu’il ne suffit pas de connaître la médecine. Il faut savoir transformer ses connaissances en une réponse qui contient les éléments attendus.' },
      { p: 'Major ECN vous apprend notamment à :' },
      {
        liste: [
          'utiliser les bons mots-clés dans votre réponse ;',
          'aller directement à l’essentiel ;',
          'hiérarchiser les informations ;',
          'rédiger une réponse précise et concise ;',
          'connaître les éléments indispensables ;',
          'maîtriser les PMZ lorsqu’ils s’appliquent ;',
          'éviter de perdre du temps dans une réponse longue mais insuffisamment ciblée.',
        ],
      },
      { chute: 'En QROC, il ne suffit pas de savoir. Il faut savoir répondre.' },
    ],
  },
  {
    q: 'Que signifie PMZ dans une épreuve QROC ?',
    blocs: [
      { p: 'PMZ signifie « pas mis = zéro ».' },
      { p: 'Lorsqu’un élément est considéré comme indispensable dans une question, son omission peut avoir des conséquences importantes sur la notation, même si d’autres informations pertinentes figurent dans la réponse.' },
      { p: 'La préparation Major ECN apprend donc au candidat à être particulièrement attentif aux éléments indispensables et aux mots-clés attendus dans sa réponse.' },
    ],
  },
  {
    q: 'Comment éviter d’oublier ce que j’ai travaillé plusieurs semaines auparavant ?',
    blocs: [
      { p: 'C’est précisément l’un des rôles de la plateforme Major ECN.' },
      { p: 'En médecine générale, les connaissances sont nombreuses et très transversales. Travailler une spécialité une fois puis passer à la suivante expose au risque d’oublier progressivement ce qui avait été acquis.' },
      { p: 'La plateforme intègre donc des révisions quotidiennes et transversales tout au long de votre préparation.' },
      { p: 'Par exemple, lorsque vous commencez par travailler la cardiologie, vos premières révisions portent sur cette spécialité. Lorsque vous abordez ensuite la neurologie, la plateforme ne vous fait pas oublier la cardiologie : vos révisions quotidiennes associent progressivement cardiologie et neurologie.' },
      { p: 'Puis, à mesure que de nouvelles spécialités sont étudiées, elles viennent s’intégrer aux révisions des connaissances déjà travaillées.' },
      { p: 'Vous êtes ainsi régulièrement amené à réactiver les différentes notions abordées grâce à plusieurs formats :' },
      {
        liste: [
          'flashcards pour réactiver rapidement les connaissances essentielles ;',
          'QCM pour tester régulièrement vos acquis et développer vos automatismes ;',
          'QROC pour la voie externe, afin de retravailler la formulation des réponses et les mots-clés attendus ;',
          'dossiers et cas cliniques pour mobiliser plusieurs connaissances dans des situations concrètes ;',
          'révisions transversales associant progressivement plusieurs spécialités.',
        ],
      },
      { p: 'L’objectif est de ne pas travailler selon une logique : Cardiologie → terminée → Neurologie → terminée → spécialité suivante. Mais selon une logique cumulative : Cardiologie → Cardiologie + Neurologie → Cardiologie + Neurologie + nouvelle spécialité → etc.' },
      { p: 'Les connaissances déjà étudiées restent ainsi régulièrement mobilisées pendant que vous avancez dans le programme.' },
      { chaine: ['Apprendre', 'S’entraîner', 'Réactiver', 'Croiser les spécialités', 'Consolider'] },
      { chute: 'L’objectif est simple : éviter de perdre les acquis au fil des semaines et favoriser leur ancrage jusqu’aux épreuves.' },
    ],
  },
  {
    q: 'Comment Major ECN m’aide-t-il à savoir quoi travailler ?',
    blocs: [
      { p: 'La préparation associe programme structuré, supports ciblés, entraînements, annales, suivi de progression et accompagnement pédagogique selon la formule choisie.' },
      { p: 'Les enseignants mettent également l’accent sur les notions essentielles, les points clés du programme et la méthodologie attendue aux EVC.' },
      { chute: 'L’objectif est de limiter la dispersion et de donner une direction à votre travail.' },
    ],
  },
  {
    q: 'Quels résultats les candidats accompagnés par Major ECN ont-ils obtenus en médecine générale ?',
    blocs: [
      { p: 'Lorsque le CNG publiait un classement permettant de situer précisément les candidats, des candidats accompagnés par Major ECN se sont classés parmi les tout premiers aux EVC de médecine générale.' },
      {
        annees: [
          { an: '2021', texte: 'Une candidate accompagnée par Major ECN s’est classée 2e aux épreuves de médecine générale.' },
          { an: '2022', texte: 'Aucune épreuve correspondante n’a été organisée par le CNG.' },
          { an: '2023', texte: 'Une candidate accompagnée par Major ECN s’est classée 1re de sa session.' },
          { an: '2024–2025', texte: 'Le classement n’étant plus publié de la même manière, nous nous appuyons notamment sur les notes communiquées par nos candidats. Plusieurs candidats accompagnés par Major ECN ont obtenu des résultats particulièrement élevés, avec des notes avoisinant les 17/20.' },
        ],
      },
      { p: 'Ces résultats montrent qu’au fil des différentes sessions, des candidats ayant suivi la préparation Major ECN et s’étant fortement investis ont pu atteindre un excellent niveau.' },
      { chute: 'Ils ne constituent cependant jamais une garantie individuelle de réussite : le travail personnel, la régularité et l’implication du candidat demeurent fondamentaux.' },
    ],
  },

  /* ── Questions supplémentaires, dépliées par « Voir toutes les questions » ── */

  {
    q: 'Depuis combien de temps Major ECN prépare-t-il les médecins aux concours et aux EVC ?',
    blocs: [
      { p: 'Major ECN dispose de plus de 15 ans d’expérience dans la préparation aux concours et épreuves médicales.' },
      { p: 'Au fil des années, nous avons accompagné des candidats aux profils extrêmement différents : médecins en activité, candidats disposant de peu de temps, médecins éloignés de la pratique depuis plusieurs années, candidats préparant une nouvelle tentative ou encore médecins disposant déjà d’un excellent niveau.' },
      { p: 'Cette expérience nous a permis de faire évoluer les cours, les supports, les entraînements et la méthodologie afin de répondre aux exigences des épreuves et aux contraintes réelles des candidats.' },
    ],
  },
  {
    q: 'Major ECN peut-il garantir ma réussite aux EVC ?',
    blocs: [
      { p: 'Non. Aucun organisme sérieux ne peut garantir la réussite individuelle à un concours.' },
      { p: 'Major ECN peut vous apporter des enseignants, une méthodologie, des supports, des entraînements, des corrections, une plateforme et un cadre de travail.' },
      { p: 'Mais votre réussite dépend fortement du temps consacré à la préparation, de votre régularité et de votre investissement personnel.' },
      { chute: 'Notre objectif est donc de vous donner les moyens de préparer les EVC dans les meilleures conditions possibles, et non de vous promettre un résultat qui dépend également de votre travail.' },
    ],
  },
  {
    q: 'J’ai une vie familiale chargée et peu de temps pour réviser. Major ECN peut-il m’aider ?',
    blocs: [
      { p: 'Oui.' },
      { p: 'Vous n’avez pas nécessairement besoin de disposer de journées entières pour travailler. En revanche, lorsque le temps est limité, chaque séance de travail doit avoir un objectif précis.' },
      { p: 'Les cours ciblés, supports organisés, entraînements, corrections, replays et outils de progression permettent de mieux exploiter le temps disponible.' },
      { chute: 'Major ECN vous apporte un cadre et une direction. Votre régularité et votre travail personnel restent ensuite essentiels.' },
    ],
  },
  {
    q: 'Je commence tard ma préparation. Est-il encore utile de rejoindre Major ECN ?',
    blocs: [
      { p: 'Oui, mais plus l’épreuve approche, plus la priorisation devient importante.' },
      { p: 'Lorsqu’il ne reste que quelques mois, essayer de reprendre l’intégralité de la médecine générale sans hiérarchie peut conduire à une importante perte de temps.' },
      { p: 'Major ECN vous permet d’accéder immédiatement à des supports, entraînements, annales corrigées et outils méthodologiques.' },
      { p: 'Selon votre formule, l’accompagnement permet également de mieux cibler les notions essentielles et les points nécessitant davantage de travail.' },
      { chute: 'Moins il reste de temps, plus il est important de savoir comment l’utiliser.' },
    ],
  },
  {
    q: 'Je n’ai pas exercé la médecine depuis plusieurs années. Est-il encore possible de préparer les EVC ?',
    blocs: [
      { p: 'Oui. Une interruption prolongée de la pratique médicale nécessite généralement une remise à niveau plus importante, mais elle n’interdit pas de reprendre une préparation sérieuse.' },
      { p: 'Major ECN a notamment accompagné en 2019 une candidate, Dr Khaoula Farah, qui avait été éloignée de l’exercice médical pendant près de dix ans et avait travaillé dans l’industrie pharmaceutique.' },
      { p: 'Elle a pu bénéficier de conditions personnelles lui permettant de consacrer une période particulièrement intensive à ses révisions. Elle a repris le programme avec Major ECN et s’est fortement investie pendant environ trois mois, avant de réussir les épreuves dès sa première tentative.' },
      { p: 'Ce parcours ne signifie évidemment pas qu’une remise à niveau complète peut systématiquement être réalisée en trois mois.' },
      { chute: 'Il illustre en revanche qu’avec beaucoup de travail, des conditions adaptées et une préparation structurée, un parcours professionnel atypique ou une longue interruption de la pratique médicale ne condamnent pas à l’échec.' },
    ],
  },
  {
    q: 'Peut-on réellement se remettre à niveau en trois mois ?',
    blocs: [
      { p: 'Cela dépend entièrement de votre niveau initial, du temps quotidien dont vous disposez et de votre capacité à vous consacrer à la préparation.' },
      { p: 'Certains candidats ont réussi après quelques mois de travail particulièrement intensif. D’autres ont besoin d’une préparation beaucoup plus longue.' },
      { p: 'Major ECN ne promet donc pas de vous remettre à niveau en trois mois.' },
      { chute: 'Notre rôle est de vous aider à hiérarchiser le programme, structurer votre travail et utiliser efficacement le temps dont vous disposez.' },
    ],
  },
  {
    q: 'J’ai déjà un bon niveau. Major ECN peut-il quand même m’apporter quelque chose ?',
    blocs: [
      { p: 'Oui.' },
      { p: 'Lorsque les connaissances sont déjà solides, l’objectif n’est pas nécessairement de reprendre tout le programme depuis le début.' },
      { p: 'Il devient plus pertinent d’identifier les dernières lacunes, perfectionner sa méthodologie, gagner en rapidité et multiplier les entraînements dans le format de l’épreuve.' },
      { chute: 'Les QCM ou QROC selon votre voie, les annales, les concours blancs et le suivi de progression permettent de transformer de bonnes connaissances médicales en une préparation réellement orientée vers les EVC.' },
    ],
  },
  {
    q: 'Je suis complètement perdu dans mes révisions. Major ECN est-il adapté ?',
    blocs: [
      { p: 'Oui.' },
      { p: 'Lorsque le programme paraît immense et que l’on ne sait plus par où commencer, disposer d’un environnement structuré permet justement de retrouver une direction.' },
      { chute: 'Cours, supports, entraînements, annales, méthodologie et accompagnement permettent de transformer progressivement un programme très vaste en étapes de travail concrètes.' },
    ],
  },
  {
    q: 'Je suis très autonome. Ai-je réellement besoin d’une préparation ?',
    blocs: [
      { p: 'Être autonome est un avantage. Mais autonomie ne signifie pas nécessairement devoir tout construire soi-même.' },
      { p: 'Un candidat autonome peut utiliser Major ECN comme cadre de travail, banque d’entraînement, source de supports ciblés et outil de mesure de sa progression.' },
      { chute: 'Vous restez libre dans votre organisation tout en bénéficiant d’un environnement déjà structuré.' },
    ],
  },
  {
    q: 'Pourquoi Major ECN propose-t-il une banque aussi complète de QCM et de QROC ?',
    blocs: [
      { p: 'Parce que chaque candidat n’a pas les mêmes lacunes et ne doit pas nécessairement réaliser les mêmes entraînements.' },
      { p: 'Une banque très riche permet de travailler différentes disciplines, différents thèmes et différents niveaux de difficulté.' },
      { p: 'Mais notre philosophie n’est pas de vous demander de tout faire.' },
      { chute: 'L’objectif n’est pas de tout faire. C’est de travailler ce qui vous fera réussir.' },
      { p: 'La richesse de la banque permet justement de disposer des entraînements dont vous avez besoin au moment où vous en avez besoin.' },
    ],
  },
  {
    q: 'Major ECN est-il simplement une plateforme en ligne ?',
    blocs: [
      { p: 'Non.' },
      { p: 'La plateforme constitue votre espace central de travail, mais la préparation Major ECN associe technologie et accompagnement humain.' },
      { p: 'Vous y retrouvez vos supports, entraînements, annales, cas cliniques, révisions et outils de progression.' },
      { p: 'Selon votre formule, cet environnement est complété par des cours, des replays, de la méthodologie, des corrections et l’accompagnement des enseignants.' },
      { chute: 'Une plateforme pour travailler. Des enseignants pour vous guider.' },
    ],
  },
  {
    q: 'Les enseignants peuvent-ils réellement m’aider à progresser ?',
    blocs: [
      { p: 'Oui.' },
      { p: 'Le rôle d’un enseignant ne consiste pas uniquement à transmettre un cours.' },
      { p: 'Il permet également de vous montrer ce qui est important, ce qui doit être priorisé, pourquoi une réponse est insuffisante et comment améliorer votre manière de répondre.' },
      { chute: 'En médecine générale, cette capacité à hiérarchiser est particulièrement importante compte tenu de l’étendue du programme.' },
    ],
  },
  {
    q: 'Les cours sont-ils disponibles en replay ?',
    blocs: [
      { p: 'Oui. Les cours concernés sont disponibles en replay pendant votre période de préparation.' },
      { p: 'Vous pouvez ainsi suivre votre préparation malgré certaines contraintes professionnelles ou personnelles et revenir sur une explication ou une notion particulièrement importante.' },
    ],
  },
  {
    q: 'Les supports Major ECN permettent-ils d’aller à l’essentiel ?',
    blocs: [
      { p: 'C’est précisément leur objectif.' },
      { p: 'La médecine générale couvre un champ extrêmement vaste.' },
      { p: 'Les cours, fiches, planches et dossiers permettent de structurer les connaissances et de mettre en évidence les notions importantes.' },
      { p: 'Ils complètent les entraînements afin que vous puissiez travailler avec des ressources cohérentes réunies dans un même environnement.' },
    ],
  },
  {
    q: 'Les annales des EVC de médecine générale sont-elles corrigées ?',
    blocs: [
      { p: 'Oui.' },
      { p: 'La préparation permet de travailler les annales EVC disponibles avec leurs corrections.' },
      { p: 'Les annales sont essentielles pour comprendre les exigences réelles des épreuves : nature des situations évaluées, niveau de précision attendu et manière dont les connaissances sont mobilisées.' },
      { chute: 'Les corrections permettent d’en faire un véritable outil d’apprentissage plutôt qu’une simple succession de sujets.' },
    ],
  },
  {
    q: 'Comment les corrections m’aident-elles à progresser ?',
    blocs: [
      { p: 'Une erreur devient réellement utile lorsque vous comprenez pourquoi votre réponse était incorrecte ou insuffisante.' },
      { p: 'Les corrections permettent de revenir sur les connaissances et le raisonnement concernés.' },
      { p: 'En voie externe, elles permettent également de comprendre les mots-clés attendus, la formulation de la réponse et les éléments indispensables.' },
      { p: 'Selon la formule choisie, l’accompagnement pédagogique permet d’aller plus loin avec des explications et des corrections plus personnalisées.' },
    ],
  },
  {
    q: 'Comment Major ECN m’aide-t-il à gagner en rapidité ?',
    blocs: [
      { p: 'La rapidité s’acquiert progressivement par l’entraînement et la maîtrise du format de l’épreuve.' },
      { p: 'En voie interne, les séries de QCM permettent de développer la reconnaissance des situations, la précision et les automatismes.' },
      { p: 'En voie externe, les QROC permettent d’apprendre à formuler rapidement une réponse précise avec les bons mots-clés, sans perdre de temps dans des développements inutiles.' },
      { chute: 'L’objectif est progressivement de répondre plus vite, mais surtout plus juste.' },
    ],
  },
  {
    q: 'Comment savoir si je progresse réellement ?',
    blocs: [
      { p: 'La plateforme Major ECN permet de suivre votre activité et votre progression.' },
      { p: 'Vous pouvez visualiser vos entraînements, vos résultats et les domaines nécessitant encore du travail.' },
      { p: 'Cela permet de ne plus seulement se demander : « Est-ce que j’ai beaucoup travaillé ? » mais plutôt : « Est-ce que je maîtrise mieux ce que je dois savoir pour réussir l’épreuve ? »' },
    ],
  },
  {
    q: 'Major ECN propose-t-il des cas cliniques, des interrogations régulières et des concours blancs ?',
    blocs: [
      { p: 'Oui, et ces évaluations occupent une place importante dans la préparation.' },
      { p: 'Les cas cliniques permettent de replacer les connaissances dans des situations concrètes, de développer le raisonnement médical et d’apprendre à mobiliser plusieurs notions face à une même situation.' },
      { p: 'Mais Major ECN n’attend pas les concours blancs pour évaluer votre niveau.' },
      { p: 'Tout au long de la préparation, des interrogations et des entraînements réguliers permettent de tester vos connaissances au fur et à mesure de votre progression. Vous pouvez ainsi repérer suffisamment tôt les notions insuffisamment maîtrisées et les retravailler avant qu’elles ne deviennent de véritables lacunes.' },
      { p: 'Les concours blancs permettent ensuite de faire un véritable point d’étape. Ils permettent notamment de :' },
      {
        liste: [
          'vous confronter à une épreuve plus globale ;',
          'vous situer par rapport aux autres candidats ;',
          'mesurer le niveau atteint à un moment précis de votre préparation ;',
          'identifier les spécialités dans lesquelles vous êtes déjà solide ;',
          'repérer celles qui nécessitent encore un travail important ;',
          'tester votre gestion du temps ;',
          'vous confronter au stress d’une épreuve chronométrée ;',
          'vous habituer progressivement aux conditions du concours ;',
          'mesurer votre progression d’un concours blanc au suivant ;',
          'réorganiser vos priorités de révision en fonction de vos résultats.',
        ],
      },
      { p: 'S’entraîner aussi à gérer le stress du jour J. Le concours blanc n’évalue pas uniquement vos connaissances. Il permet de vous placer dans des conditions proches de celles de l’examen : temps limité, questions qui s’enchaînent, nécessité de prendre rapidement des décisions et pression liée au résultat.' },
      { p: 'Cette mise en situation permet de mieux connaître vos réactions face au stress et d’apprendre progressivement à les maîtriser. En répétant l’expérience avant les véritables EVC, le format de l’épreuve devient plus familier. Le jour J n’est plus la première fois que vous devez mobiliser vos connaissances sous pression.' },
      { p: 'Un résultat insuffisant au premier concours blanc peut être très utile. Il peut parfois mettre en évidence un niveau inférieur à celui que l’on imaginait. Ce constat peut être difficile, mais il est surtout précieux lorsqu’il intervient suffisamment tôt.' },
      { p: 'Il peut provoquer une véritable prise de conscience : il reste du travail, certaines spécialités doivent être reprises et l’intensité des révisions doit éventuellement être augmentée. Plutôt que de découvrir ces difficultés le jour des EVC, vous disposez encore de temps pour agir.' },
      { p: 'Le concours blanc suivant permet alors de mesurer concrètement le chemin parcouru : ai-je progressé ? Quelles spécialités restent fragiles ? Où est-ce que je perds encore des points ? Est-ce que je gère mieux mon temps et mon stress ? Que dois-je retravailler en priorité ?' },
      { p: 'L’objectif n’est donc pas simplement d’obtenir une note. Chaque évaluation doit permettre d’orienter la suite de votre préparation.' },
      { chaine: ['Se tester', 'Identifier ses lacunes', 'Retravailler', 'Se réévaluer', 'Mesurer sa progression', 'S’habituer aux conditions de l’épreuve'] },
      { chute: 'Mieux vaut découvrir ses points faibles — et apprendre à gérer son stress — pendant la préparation que le jour du concours.' },
    ],
  },
  {
    q: 'J’ai déjà échoué une fois aux EVC. Major ECN peut-il m’aider différemment ?',
    blocs: [
      { p: 'Oui.' },
      { p: 'Une nouvelle préparation ne doit pas consister à refaire exactement la même chose en espérant un résultat différent.' },
      { p: 'Il est important d’identifier ce qui a pu manquer lors de la précédente tentative : connaissances insuffisamment consolidées, manque d’entraînement, méthodologie QCM ou QROC, mauvaise gestion du temps, difficultés d’organisation, stress ou manque de régularité.' },
      { p: 'Major ECN vous permet de repartir avec une préparation structurée, des entraînements adaptés à votre voie, des corrections, des révisions transversales, un suivi de progression et, selon votre formule, l’accompagnement des enseignants.' },
      { p: 'L’objectif est de comprendre où vous perdez encore des points et ce qu’il faut modifier dans votre préparation.' },
      { chute: 'Il ne s’agit pas simplement de recommencer. Il s’agit de mieux préparer la prochaine session.' },
    ],
  },
  {
    q: 'J’ai beaucoup de connaissances médicales mais je perds des points aux épreuves. Pourquoi ?',
    blocs: [
      { p: 'C’est une situation possible, car les EVC n’évaluent pas uniquement la quantité de connaissances.' },
      { p: 'En voie interne, il faut savoir analyser rapidement les QCM, repérer les pièges, distinguer des propositions proches et éviter certaines erreurs d’inattention.' },
      { p: 'En voie externe, il faut savoir transformer ses connaissances en une réponse QROC précise, hiérarchisée, contenant les bons mots-clés et les éléments indispensables, notamment les PMZ lorsqu’ils s’appliquent.' },
      { p: 'Major ECN travaille donc à la fois les connaissances et la manière de les restituer dans le format de l’épreuve.' },
      { chute: 'Savoir est indispensable. Savoir répondre l’est aussi.' },
    ],
  },
  {
    q: 'Comment Major ECN m’aide-t-il à organiser mes révisions jusqu’aux EVC ?',
    blocs: [
      { p: 'La plateforme ne sert pas uniquement à mettre des cours et des questions à votre disposition.' },
      { p: 'Elle vous accompagne progressivement dans votre préparation et vous permet de continuer à travailler les spécialités déjà étudiées pendant que vous avancez dans le programme.' },
      { p: 'Après avoir travaillé, par exemple, la cardiologie puis la neurologie, les révisions quotidiennes peuvent progressivement associer les connaissances de ces différentes spécialités.' },
      { p: 'Flashcards, QCM ou QROC selon votre voie, dossiers, cas cliniques et révisions transversales permettent ainsi de réactiver régulièrement les connaissances déjà acquises.' },
      { chute: 'L’objectif est d’éviter une préparation dans laquelle on termine une spécialité avant de l’oublier progressivement en passant à la suivante.' },
    ],
  },
  {
    q: 'Comment savoir quelles spécialités je dois retravailler en priorité ?',
    blocs: [
      { p: 'Les entraînements réguliers, le suivi de progression et les concours blancs permettent d’identifier les domaines dans lesquels vos résultats restent insuffisants.' },
      { p: 'Vous pouvez ainsi distinguer ce qui est déjà bien maîtrisé de ce qui nécessite encore du travail.' },
      { p: 'Selon la formule choisie, l’accompagnement pédagogique permet également de vous aider à mieux hiérarchiser vos priorités.' },
      { chute: 'Votre temps de révision peut ainsi être consacré davantage à vos véritables points faibles qu’à ce que vous maîtrisez déjà.' },
    ],
  },
  {
    q: 'Major ECN est-il adapté à tous les profils de candidats ?',
    blocs: [
      { p: 'Oui, car tous les candidats n’ont pas les mêmes besoins.' },
      { p: 'Certains commencent leur préparation très tôt ; d’autres seulement quelques mois avant les épreuves. Certains exercent quotidiennement la médecine ; d’autres doivent effectuer une remise à niveau importante. Certains sont très autonomes ; d’autres ont besoin d’un cadre. Certains disposent de beaucoup de temps ; d’autres doivent concilier travail, gardes et vie familiale.' },
      { p: 'Major ECN permet d’adapter la préparation à ces différents profils grâce à plusieurs niveaux d’accompagnement, une plateforme accessible tout au long de la préparation, des contenus structurés, des entraînements adaptés à la voie choisie et un suivi de progression.' },
      { chute: 'Le point de départ peut être différent. L’objectif reste le même : utiliser au mieux le temps disponible pour arriver aux EVC avec la préparation la plus solide possible.' },
    ],
  },
  {
    q: 'À quel moment faut-il idéalement commencer sa préparation aux EVC ?',
    blocs: [
      { p: 'Plus une préparation commence tôt, plus il est possible d’organiser progressivement l’apprentissage, l’entraînement et les révisions. Mais tous les candidats n’ont pas cette possibilité.' },
      { p: 'Lorsque le temps disponible est plus court, la priorité devient alors de hiérarchiser davantage le travail et d’éviter la dispersion.' },
      { p: 'Major ECN a accompagné des candidats aux parcours et aux durées de préparation très différents. Une candidate éloignée de la pratique médicale depuis près de dix ans a notamment pu, dans des conditions personnelles lui permettant un travail particulièrement intensif, effectuer une importante remise à niveau en environ trois mois avant de réussir les épreuves.' },
      { p: 'Ce parcours ne signifie évidemment pas que trois mois suffisent à tous les candidats.' },
      { chute: 'Plus le temps est court, plus chaque heure de préparation doit être utilisée intelligemment.' },
    ],
  },
  {
    q: 'Pourquoi les révisions transversales sont-elles particulièrement importantes en médecine générale ?',
    blocs: [
      { p: 'La médecine générale est par définition transversale.' },
      { p: 'Un même patient peut nécessiter de mobiliser simultanément des connaissances de cardiologie, pneumologie, infectiologie, endocrinologie, neurologie ou encore de pharmacologie.' },
      { p: 'Il est donc important de ne pas réviser les spécialités comme des blocs totalement indépendants.' },
      { p: 'Les révisions transversales de la plateforme Major ECN permettent de continuer à mobiliser les spécialités déjà étudiées tout en intégrant progressivement les nouvelles.' },
      { chute: 'Cela favorise à la fois l’ancrage des connaissances et la capacité à les mobiliser dans des situations cliniques plus proches de la réalité.' },
    ],
  },
];

/** Les dix premières questions restent visibles ; les suivantes se déplient. */
export const FAQ_MG_VISIBLES = 10;

/** Réponse aplatie en texte simple — pour le JSON-LD FAQPage. */
export function reponseTexteMg(q: QuestionMg): string {
  const morceaux: string[] = [];
  for (const b of q.blocs) {
    if ('p' in b) morceaux.push(b.p);
    else if ('chute' in b) morceaux.push(b.chute);
    else if ('liste' in b) morceaux.push(b.liste.join(' '));
    else if ('chaine' in b) morceaux.push(b.chaine.join(' → ') + '.');
    else if ('annees' in b) morceaux.push(b.annees.map((a) => `${a.an} : ${a.texte}`).join(' '));
    else morceaux.push(b.voies.map((v) => `${v.titre}. ${v.textes.join(' ')}`).join(' '));
  }
  return morceaux.join(' ');
}
