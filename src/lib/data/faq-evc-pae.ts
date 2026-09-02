/**
 * FAQ détaillée « Préparation EVC / PAE » — 43 questions issues du document
 * de référence (FAQ_Major_ECN_Preparation_EVC_PAE_SEO.docx). Texte repris
 * intégralement, classé par thématiques avec numérotation continue (1 → 43).
 * Utilisée par le bloc FAQ de la page d'accueil et par le JSON-LD FAQPage.
 * Fichier généré depuis le document source — ne pas reformuler les textes.
 */

export type FaqBlock =
  | { t: 'p'; text: string }
  | { t: 'h'; text: string }
  | { t: 'ul'; items: string[] };

export type FaqEvcQA = {
  /** Numéro continu affiché (1 → 43). */
  n: number;
  q: string;
  a: FaqBlock[];
};

export type FaqEvcCategory = {
  id: string;
  title: string;
  qas: FaqEvcQA[];
};

/** Intro SEO du document, affichée sous le titre du bloc FAQ. */
export const FAQ_EVC_INTRO: string[] = [
  "La préparation aux EVC (épreuves de vérification des connaissances) s'inscrit dans le parcours d'autorisation d'exercice (PAE) de nombreux médecins et professionnels de santé diplômés hors de France, notamment les PADHUE. Cette FAQ Major ECN répond aux principales questions sur la préparation EVC, la préparation PAE, les voies interne et externe, les QCM, les QROC, les recommandations françaises, l'organisation des révisions, l'accompagnement pédagogique et les informations officielles publiées notamment par le CNG.",
  "Selon la situation du candidat et son parcours en France, les termes PAE, PADHUE, FFI, EVC, CNG EVC ou CNG PAE peuvent apparaître dans ses recherches. Major ECN concentre ici les réponses pédagogiques et pratiques utiles pour comprendre comment organiser une préparation structurée et adaptée aux exigences des EVC."
];

export const FAQ_EVC_CATEGORIES: FaqEvcCategory[] = [
  {
    "id": "preparation-evc-pae",
    "title": "Préparation EVC / PAE",
    "qas": [
      {
        "n": 1,
        "q": "Pourquoi suivre une préparation EVC / PAE plutôt que préparer les EVC seul ?",
        "a": [
          {
            "t": "p",
            "text": "Il est tout à fait possible de préparer les EVC seul. La véritable question est plutôt : combien de temps pouvez-vous consacrer à chercher les bons supports, comprendre seul les notions difficiles, sélectionner ce qui est réellement important, trouver les recommandations actualisées, comprendre les attentes de l'épreuve et construire votre propre programme de révision ?"
          },
          {
            "t": "p",
            "text": "Pour la majorité des candidats, le temps est justement la ressource la plus précieuse. Vous n'êtes souvent plus étudiant : vous exercez, parfois à l'hôpital, vous avez des responsabilités professionnelles et personnelles, une famille, et vous devez préparer les EVC en parallèle."
          },
          {
            "t": "p",
            "text": "L'un des premiers objectifs de Major ECN est donc de vous faire gagner du temps et de vous permettre de concentrer vos efforts là où ils sont réellement utiles."
          },
          {
            "t": "p",
            "text": "Avec Major ECN, vous disposez notamment :"
          },
          {
            "t": "ul",
            "items": [
              "de supports sélectionnés et organisés ;",
              "d'explications sur les items et les points clés ;",
              "d'enseignants médecins spécialistes pour répondre à vos questions ;",
              "des recommandations françaises actualisées ;",
              "des corrections et analyses des sujets déjà tombés ;",
              "de sujets, dossiers, QCM et QROC inédits ;",
              "de cas cliniques et flashcards ;",
              "d'un système de répétition et de révisions régulières ;",
              "d'interrogations permettant de mesurer votre niveau ;",
              "d'épreuves blanches ;",
              "d'un suivi de votre progression ;",
              "d'un accompagnement humain et méthodologique."
            ]
          },
          {
            "t": "p",
            "text": "L'objectif n'est pas de vous demander d'apprendre toujours davantage."
          },
          {
            "t": "p",
            "text": "Nous vous aidons à cibler : les bons supports, les connaissances indispensables, les recommandations à maîtriser, les erreurs à corriger et les sujets sur lesquels vous devez progresser."
          },
          {
            "t": "p",
            "text": "Car dans une préparation aussi vaste que celle des EVC, savoir ce que l'on peut laisser de côté est presque aussi important que savoir ce que l'on doit apprendre."
          },
          {
            "t": "p",
            "text": "Et surtout, vous n'êtes pas seul."
          },
          {
            "t": "p",
            "text": "Lorsqu'une notion n'est pas comprise, qu'une réponse vous semble ambiguë, que vous ne savez pas jusqu'où approfondir un sujet ou que vous avez un doute sur une recommandation, vous pouvez vous tourner vers l'équipe pédagogique."
          },
          {
            "t": "p",
            "text": "Vous restez naturellement celui ou celle qui devra apprendre, comprendre et s'entraîner. Mais vous n'avez plus à perdre votre temps à vous demander en permanence quoi travailler, comment le travailler et si vous êtes sur la bonne voie."
          }
        ]
      },
      {
        "n": 2,
        "q": "Je suis médecin et j'ai déjà un bon niveau médical. Qu'est-ce que Major ECN peut réellement m'apporter ?",
        "a": [
          {
            "t": "p",
            "text": "Avoir un bon niveau médical et savoir réussir les EVC sont deux choses différentes."
          },
          {
            "t": "p",
            "text": "De nombreux candidats possèdent plusieurs années d'expérience clinique et de solides connaissances. Mais les EVC évaluent également votre capacité à mobiliser ces connaissances selon les attentes précises de l'épreuve."
          },
          {
            "t": "p",
            "text": "Il faut connaître les recommandations françaises, identifier les informations prioritaires, comprendre ce que recherche la question et restituer ses connaissances sous la forme attendue."
          },
          {
            "t": "p",
            "text": "Pour les épreuves rédactionnelles, il faut notamment savoir faire apparaître les mots-clés, les éléments indispensables et les PMZ."
          },
          {
            "t": "p",
            "text": "Pour les QCM, il faut comprendre la logique particulière des questions, identifier les informations discriminantes, analyser précisément les propositions et apprendre à éviter les pièges."
          },
          {
            "t": "p",
            "text": "Major ECN ne cherche donc pas simplement à vous réapprendre la médecine."
          },
          {
            "t": "p",
            "text": "La préparation vous aide à transformer vos connaissances médicales en réponses adaptées aux exigences des EVC et en points le jour J."
          }
        ]
      },
      {
        "n": 3,
        "q": "J'ai fait une longue pause dans le domaine médical. Puis-je quand même réussir les EVC ?",
        "a": [
          {
            "t": "p",
            "text": "Oui, c'est possible."
          },
          {
            "t": "p",
            "text": "Une interruption de plusieurs années ne signifie pas que vous ne pouvez plus réussir les EVC. Elle nécessite en revanche une remise à niveau sérieuse, du travail personnel, de la régularité et beaucoup de motivation."
          },
          {
            "t": "p",
            "text": "Major ECN a déjà accompagné des médecins ayant été éloignés de la pratique médicale pendant plusieurs années."
          },
          {
            "t": "p",
            "text": "C'est notamment le cas du Dr Khaoula Farah. N'ayant pas la possibilité d'exercer comme médecin en France, elle avait travaillé pendant près de dix ans dans l'industrie pharmaceutique."
          },
          {
            "t": "p",
            "text": "À la suite d'un changement dans sa situation professionnelle, elle a décidé de revenir à son projet médical et de préparer les EVC. Lorsqu'elle a rejoint Major ECN, il ne lui restait qu'environ trois mois et demi avant les épreuves."
          },
          {
            "t": "p",
            "text": "Elle s'est alors pleinement investie dans sa préparation. Major ECN l'a accompagnée dans une remise à niveau intensive : connaissances essentielles, recommandations françaises, raisonnements cliniques, méthodologie et entraînements."
          },
          {
            "t": "p",
            "text": "Elle a finalement réussi les EVC."
          },
          {
            "t": "p",
            "text": "Son parcours montre qu'une longue interruption n'est pas nécessairement un obstacle définitif. Mais il montre également qu'il n'existe pas de raccourci : il faut accepter de travailler, de reprendre les fondamentaux et de rester régulier."
          },
          {
            "t": "p",
            "text": "Le rôle de Major ECN est de vous aider à identifier rapidement ce qu'il faut remettre à niveau et à concentrer votre travail sur les connaissances réellement importantes."
          }
        ]
      },
      {
        "n": 4,
        "q": "Médecin diplômé à l'étranger / PADHUE : pourquoi la méthodologie des EVC est-elle particulièrement importante ?",
        "a": [
          {
            "t": "p",
            "text": "Les candidats aux EVC sont déjà médecins et ont naturellement été évalués pendant leurs études. Beaucoup ont également l'habitude des QCM."
          },
          {
            "t": "p",
            "text": "Mais avoir déjà travaillé sur des QCM ne signifie pas nécessairement être familiarisé avec la façon dont les questions sont conçues dans les épreuves françaises."
          },
          {
            "t": "p",
            "text": "Même lorsque le format paraît similaire, l'approche peut être différente : construction de la question, détails importants, recommandations françaises, nuances entre plusieurs propositions, pièges ou raisonnement permettant d'éliminer certaines réponses."
          },
          {
            "t": "p",
            "text": "Une proposition peut être médicalement défendable dans l'absolu mais ne pas correspondre à la réponse attendue dans la situation précise décrite."
          },
          {
            "t": "p",
            "text": "Major ECN vous entraîne donc à raisonner face aux QCM tels qu'ils sont conçus pour les EVC."
          },
          {
            "t": "p",
            "text": "Cette adaptation est également essentielle pour les épreuves rédactionnelles : mots-clés, éléments indispensables, hiérarchisation des réponses et PMZ."
          },
          {
            "t": "p",
            "text": "L'objectif n'est pas de remettre en cause votre formation médicale, mais de vous apprendre les codes spécifiques des EVC afin que vos connaissances puissent être pleinement valorisées le jour J."
          }
        ]
      },
      {
        "n": 5,
        "q": "Pourquoi choisir Major ECN pour sa préparation EVC / PAE ?",
        "a": [
          {
            "t": "p",
            "text": "Choisir Major ECN, ce n'est pas simplement accéder à une plateforme ou à une banque de QCM."
          },
          {
            "t": "p",
            "text": "C'est bénéficier de 15 années d'expérience dans la préparation médicale et d'une connaissance approfondie des attentes des EVC."
          },
          {
            "t": "p",
            "text": "Au fil des années, les supports, cours, exercices et méthodes pédagogiques ont été travaillés, corrigés et affinés à partir de l'expérience acquise auprès des candidats."
          },
          {
            "t": "p",
            "text": "Cette expérience se retrouve aujourd'hui dans toute la préparation : fiches, QCM, QROC, cas cliniques, flashcards, annales corrigées, sujets inédits, capsules vidéo, outils de mémorisation, évaluations et suivi de progression."
          },
          {
            "t": "p",
            "text": "Mais une plateforme, aussi complète soit-elle, ne remplace pas un enseignant."
          },
          {
            "t": "p",
            "text": "Les enseignants Major ECN sont des médecins spécialistes dans leur discipline, dont plusieurs interviennent au sein de la préparation depuis de nombreuses années."
          },
          {
            "t": "p",
            "text": "Ils possèdent ainsi à la fois une solide expertise médicale et une véritable expérience pédagogique auprès des candidats aux EVC."
          },
          {
            "t": "p",
            "text": "Ils connaissent les notions qui posent régulièrement problème, savent sur quels points insister, jusqu'où approfondir et surtout comment rendre accessibles des connaissances qui pouvaient auparavant paraître compliquées."
          },
          {
            "t": "p",
            "text": "C'est un retour que nous entendons régulièrement : certains candidats découvrent qu'une matière qu'ils redoutaient devient beaucoup plus claire après les explications de leur enseignant."
          },
          {
            "t": "p",
            "text": "Bien enseigner ne consiste pas simplement à posséder beaucoup de connaissances. C'est savoir les transmettre."
          },
          {
            "t": "p",
            "text": "Major ECN associe ainsi l'expérience, des enseignants spécialistes particulièrement pédagogues, une plateforme complète et un véritable accompagnement humain."
          }
        ]
      },
      {
        "n": 6,
        "q": "Quelle est la différence entre les formations Essentielle, Intensive et Approfondie ?",
        "a": [
          {
            "t": "p",
            "text": "La différence réside principalement dans le niveau d'accompagnement humain et le degré d'approfondissement du programme."
          },
          {
            "t": "h",
            "text": "Formation Essentielle"
          },
          {
            "t": "p",
            "text": "Elle s'adresse principalement aux candidats souhaitant travailler de façon autonome avec la plateforme Major ECN."
          },
          {
            "t": "p",
            "text": "Vous disposez notamment des fiches, flashcards, entraînements adaptés à votre voie — QCM pour la voie interne et QROC pour la voie externe — exercices, outils de progression et système de révisions régulières."
          },
          {
            "t": "p",
            "text": "Essentielle = une préparation principalement autonome avec une plateforme complète et structurée."
          },
          {
            "t": "h",
            "text": "Formation Intensive"
          },
          {
            "t": "p",
            "text": "Elle comprend la plateforme et 18 heures d'enseignement."
          },
          {
            "t": "p",
            "text": "L'objectif est de balayer rapidement un grand nombre de points importants avec les enseignants : dossiers transversaux, rappels de cours, raisonnements importants, nouveaux sujets et principaux points clés."
          },
          {
            "t": "p",
            "text": "C'est une préparation dynamique pour les candidats qui souhaitent conserver une certaine autonomie tout en bénéficiant d'un accompagnement humain permettant de les guider et d'intensifier leurs révisions."
          },
          {
            "t": "p",
            "text": "Les cours sont disponibles en replay pendant la période de préparation."
          },
          {
            "t": "p",
            "text": "Intensive = plateforme + 18 heures pour revoir rapidement et efficacement les principaux points clés avec les enseignants."
          },
          {
            "t": "h",
            "text": "Formation Approfondie"
          },
          {
            "t": "p",
            "text": "Elle correspond au niveau d'accompagnement pédagogique le plus poussé."
          },
          {
            "t": "p",
            "text": "Elle n'est pas réservée aux candidats ayant un faible niveau. Vous pouvez déjà disposer de bonnes connaissances et choisir l'Approfondie parce que vous souhaitez mettre toutes les chances de votre côté."
          },
          {
            "t": "p",
            "text": "Le programme est repris de manière structurée et très complète avec les enseignants : rappels de cours, connaissances fondamentales, recommandations, items importants, points complexes, méthodologie, dossiers et sujets."
          },
          {
            "t": "p",
            "text": "L'objectif est de réduire au maximum les angles morts de votre préparation : éviter d'arriver le jour J face à un item important que vous auriez négligé ou insuffisamment compris."
          },
          {
            "t": "p",
            "text": "Les cours sont également disponibles en replay pendant votre période de préparation."
          },
          {
            "t": "p",
            "text": "Approfondie = passer le programme en revue de manière très complète avec les enseignants pour réduire au maximum les zones d'ombre et mettre toutes les chances de son côté."
          }
        ]
      },
      {
        "n": 7,
        "q": "Comment savoir ce qu'il faut réellement apprendre pour les EVC et jusqu'où approfondir ?",
        "a": [
          {
            "t": "p",
            "text": "La médecine est immense. Tout apprendre avec le même niveau de profondeur est impossible et inefficace."
          },
          {
            "t": "p",
            "text": "Le rôle de Major ECN est de vous aider à distinguer :"
          },
          {
            "t": "ul",
            "items": [
              "le socle indispensable que tout candidat doit maîtriser ;",
              "les notions prioritaires pour les EVC ;",
              "les points susceptibles de faire la différence entre des candidats ayant déjà un bon niveau ;",
              "les connaissances secondaires, intéressantes médicalement mais sur lesquelles il serait contre-productif de consacrer trop de temps."
            ]
          },
          {
            "t": "p",
            "text": "Un bon enseignant doit également savoir vous dire :"
          },
          {
            "t": "p",
            "text": "« Jusqu'ici, c'est indispensable. Au-delà, c'est utile, mais ce n'est pas là que vous devez concentrer votre temps en priorité. »"
          }
        ]
      },
      {
        "n": 8,
        "q": "Comment Major ECN m'aide-t-il à gagner du temps dans ma préparation EVC ?",
        "a": [
          {
            "t": "p",
            "text": "Le temps est l'une des ressources les plus précieuses pendant la préparation."
          },
          {
            "t": "p",
            "text": "Major ECN vous évite une grande partie du travail de recherche, de sélection et d'organisation qui précède normalement l'apprentissage."
          },
          {
            "t": "p",
            "text": "Au lieu de chercher pendant des heures quel support utiliser, quelle recommandation est actualisée, si une notion est importante ou jusqu'où l'approfondir, vous disposez d'un cadre déjà structuré."
          },
          {
            "t": "p",
            "text": "Et lorsqu'une question ou un point précis vous pose problème, vous pouvez interroger un enseignant."
          },
          {
            "t": "p",
            "text": "Obtenir rapidement une explication claire et, lorsque cela est nécessaire, les références correspondantes peut vous éviter plusieurs heures de recherches, de lectures et d'hésitations."
          },
          {
            "t": "p",
            "text": "Quelques heures de travail parfaitement ciblées peuvent ainsi vous permettre d'avancer beaucoup plus rapidement que plusieurs jours de recherches et de révisions dispersées."
          },
          {
            "t": "p",
            "text": "Votre temps doit être consacré autant que possible à apprendre, comprendre, mémoriser et vous entraîner — pas à chercher ce que vous devriez être en train d'apprendre."
          }
        ]
      }
    ]
  },
  {
    "id": "methodologie-epreuves",
    "title": "Méthodologie des épreuves",
    "qas": [
      {
        "n": 9,
        "q": "Comment apprendre à répondre comme attendu aux EVC et pas simplement comme dans ma pratique quotidienne ?",
        "a": [
          {
            "t": "p",
            "text": "La pratique clinique et une épreuve nationale ne répondent pas exactement aux mêmes contraintes."
          },
          {
            "t": "p",
            "text": "Pendant les EVC, vous devez rapidement identifier ce que la question cherche à évaluer et faire apparaître les éléments attendus."
          },
          {
            "t": "p",
            "text": "Major ECN vous entraîne donc progressivement à vous demander :"
          },
          {
            "t": "p",
            "text": "« Qu'attend-on précisément de moi dans cette question ? »"
          },
          {
            "t": "p",
            "text": "Pour les épreuves rédactionnelles, vous apprenez à analyser l'énoncé, structurer votre réponse, hiérarchiser les informations et faire apparaître les éléments indispensables."
          },
          {
            "t": "p",
            "text": "Pour les QCM, vous apprenez à analyser précisément l'énoncé et chacune des propositions."
          },
          {
            "t": "p",
            "text": "L'objectif est de transformer une connaissance médicale en réponse d'examen efficace."
          }
        ]
      },
      {
        "n": 10,
        "q": "Comment apprendre à identifier les pièges dans les QCM ?",
        "a": [
          {
            "t": "p",
            "text": "Réussir un QCM ne consiste pas uniquement à connaître son cours."
          },
          {
            "t": "p",
            "text": "Les entraînements Major ECN vous apprennent notamment à :"
          },
          {
            "t": "ul",
            "items": [
              "identifier les informations déterminantes ;",
              "distinguer une proposition vraie en général d'une proposition exacte dans la situation présentée ;",
              "repérer les nuances importantes ;",
              "différencier indication, contre-indication, urgence et priorité ;",
              "maîtriser les recommandations françaises ;",
              "vous adapter aux questions à réponses multiples ou à réponse unique ;",
              "éliminer méthodiquement certaines propositions ;",
              "analyser vos erreurs pour comprendre pourquoi vous vous êtes trompé."
            ]
          },
          {
            "t": "p",
            "text": "La correction est donc aussi importante que la question elle-même."
          },
          {
            "t": "p",
            "text": "L'objectif est de développer progressivement des automatismes de raisonnement adaptés aux EVC."
          }
        ]
      },
      {
        "n": 11,
        "q": "Pour l'épreuve rédactionnelle, comment savoir exactement ce que le correcteur attend ?",
        "a": [
          {
            "t": "p",
            "text": "Le travail commence avant même d'écrire : il faut savoir analyser l'énoncé."
          },
          {
            "t": "p",
            "text": "Certains mots, certaines données cliniques ou formulations constituent des indices permettant de comprendre ce que la question cherche à évaluer."
          },
          {
            "t": "p",
            "text": "Major ECN vous apprend notamment à identifier :"
          },
          {
            "t": "ul",
            "items": [
              "les informations déterminantes de l'énoncé ;",
              "les mots-clés attendus ;",
              "les éléments indispensables ;",
              "les priorités diagnostiques et thérapeutiques ;",
              "les conduites à tenir ;",
              "les éléments permettant de gagner des points ;",
              "les PMZ (« pas mis = zéro »)."
            ]
          },
          {
            "t": "p",
            "text": "Les PMZ sont particulièrement importants : l'omission d'un élément considéré comme indispensable peut conduire à obtenir zéro à la question, même lorsque d'autres éléments corrects figurent dans votre réponse."
          },
          {
            "t": "p",
            "text": "Vous apprenez progressivement à suivre un réflexe :"
          },
          {
            "t": "p",
            "text": "analyser l'énoncé → comprendre ce qui est demandé → identifier les éléments indispensables → construire une réponse claire et hiérarchisée."
          },
          {
            "t": "p",
            "text": "Le jour J, vous ne devez donc pas seulement connaître la médecine."
          },
          {
            "t": "p",
            "text": "Vous devez savoir analyser la question et transformer vos connaissances en points."
          }
        ]
      },
      {
        "n": 12,
        "q": "Les annales suffisent-elles pour préparer les EVC ?",
        "a": [
          {
            "t": "p",
            "text": "Non. Les annales sont indispensables, mais elles constituent une base et non une préparation complète."
          },
          {
            "t": "p",
            "text": "Lorsqu'un sujet est connu et corrigé, tous les candidats qui l'ont sérieusement travaillé peuvent en connaître les réponses."
          },
          {
            "t": "p",
            "text": "La différence doit donc également se faire sur la capacité à mobiliser réellement ses connaissances face à une question nouvelle."
          },
          {
            "t": "p",
            "text": "Major ECN propose ainsi, en complément des annales, des QCM, QROC, dossiers, cas cliniques et sujets inédits, construits autour des connaissances importantes et des thèmes susceptibles d'être évalués."
          },
          {
            "t": "p",
            "text": "La vraie question devient alors :"
          },
          {
            "t": "p",
            "text": "« Suis-je capable d'utiliser mes connaissances lorsque la question est nouvelle ? »"
          },
          {
            "t": "p",
            "text": "C'est cette capacité que nous cherchons également à développer."
          }
        ]
      }
    ]
  },
  {
    "id": "progression-memorisation",
    "title": "Progression et mémorisation",
    "qas": [
      {
        "n": 13,
        "q": "Comment savoir si je progresse réellement ?",
        "a": [
          {
            "t": "p",
            "text": "Le nombre d'heures travaillées ne suffit pas."
          },
          {
            "t": "p",
            "text": "Major ECN multiplie donc les occasions de mesurer vos connaissances : QCM, QROC, cas cliniques, flashcards, exercices, interrogations, révisions programmées, épreuves blanches et suivi de progression sur la plateforme."
          },
          {
            "t": "p",
            "text": "Vous identifiez non seulement ce que vous savez, mais surtout ce que vous devez encore améliorer."
          },
          {
            "t": "p",
            "text": "Une erreur devient alors une information utile pour orienter la suite de vos révisions."
          }
        ]
      },
      {
        "n": 14,
        "q": "Comment éviter d'oublier ce que j'ai appris plusieurs semaines auparavant ?",
        "a": [
          {
            "t": "p",
            "text": "Comprendre une notion une fois ne signifie pas qu'elle restera disponible plusieurs mois plus tard."
          },
          {
            "t": "p",
            "text": "La plateforme Major ECN intègre donc une logique de réactivation régulière des connaissances grâce notamment aux flashcards, QCM, QROC, exercices et révisions programmées."
          },
          {
            "t": "p",
            "text": "Les connaissances reviennent progressivement au cours de la préparation."
          },
          {
            "t": "p",
            "text": "L'objectif n'est plus seulement :"
          },
          {
            "t": "p",
            "text": "« Je l'ai appris. »"
          },
          {
            "t": "p",
            "text": "Mais :"
          },
          {
            "t": "p",
            "text": "« Je suis capable de le retrouver plusieurs semaines plus tard lorsque j'en ai besoin. »"
          }
        ]
      },
      {
        "n": 15,
        "q": "À quoi servent les interrogations surprises ?",
        "a": [
          {
            "t": "p",
            "text": "Elles permettent de mesurer votre niveau réel à un instant T."
          },
          {
            "t": "p",
            "text": "Lorsque vous venez de réviser un chapitre, votre résultat mesure en partie votre mémoire immédiate."
          },
          {
            "t": "p",
            "text": "Une interrogation surprise permet d'évaluer ce qui est véritablement resté en mémoire."
          },
          {
            "t": "p",
            "text": "Elle révèle les connaissances solides mais également celles que vous pensiez maîtriser et qui doivent encore être retravaillées."
          },
          {
            "t": "p",
            "text": "L'objectif n'est pas de vous sanctionner, mais de vous confronter à la réalité de votre niveau suffisamment tôt pour pouvoir progresser."
          }
        ]
      },
      {
        "n": 16,
        "q": "Pourquoi les épreuves blanches sont-elles importantes ?",
        "a": [
          {
            "t": "p",
            "text": "Elles ne servent pas uniquement à vérifier vos connaissances."
          },
          {
            "t": "p",
            "text": "Elles vous apprennent également à gérer le temps, la concentration, la pression, la méthode et les difficultés imprévues."
          },
          {
            "t": "p",
            "text": "Plus vous avez déjà vécu une situation proche de l'examen pendant votre préparation, moins vous aurez de choses nouvelles à gérer le jour J."
          },
          {
            "t": "p",
            "text": "Les épreuves blanches constituent ainsi un outil d'évaluation mais également un moyen de réduire une partie du stress lié à l'inconnu."
          }
        ]
      },
      {
        "n": 17,
        "q": "Comment savoir où je me situe par rapport aux autres candidats ?",
        "a": [
          {
            "t": "p",
            "text": "Obtenir un certain pourcentage de bonnes réponses constitue un premier indicateur, mais ce résultat devient beaucoup plus intéressant lorsqu'il est replacé dans un contexte."
          },
          {
            "t": "p",
            "text": "Les entraînements collectifs et les épreuves blanches permettent de mesurer votre niveau, d'observer votre progression et de mieux comprendre où vous vous situez par rapport aux autres candidats."
          },
          {
            "t": "p",
            "text": "L'objectif n'est pas d'installer une compétition permanente ni de vous mettre sous pression."
          },
          {
            "t": "p",
            "text": "Il s'agit surtout de pouvoir répondre régulièrement à deux questions essentielles :"
          },
          {
            "t": "p",
            "text": "« Si l'épreuve avait lieu aujourd'hui, où en serais-je ? »"
          },
          {
            "t": "p",
            "text": "Et surtout :"
          },
          {
            "t": "p",
            "text": "« Quels sont les points que je dois encore améliorer pour progresser ? »"
          },
          {
            "t": "p",
            "text": "Cette confrontation régulière avec votre niveau réel permet d'éviter deux erreurs : se croire prêt trop tôt, ou au contraire se sous-estimer alors que les résultats montrent une réelle progression."
          },
          {
            "t": "p",
            "text": "Elle permet également d'orienter les dernières semaines de préparation vers les domaines qui peuvent encore vous faire gagner des points."
          }
        ]
      },
      {
        "n": 18,
        "q": "Que se passe-t-il si je prends du retard dans mes révisions ?",
        "a": [
          {
            "t": "p",
            "text": "Prendre du retard peut arriver, particulièrement lorsque l'on prépare les EVC parallèlement à une activité professionnelle, des gardes ou une vie familiale."
          },
          {
            "t": "p",
            "text": "L'important est de détecter ce décrochage suffisamment tôt pour pouvoir agir."
          },
          {
            "t": "p",
            "text": "Grâce au suivi de votre activité sur la plateforme Major ECN, lorsqu'une diminution significative de votre travail ou un décrochage est identifié, l'équipe est alertée."
          },
          {
            "t": "p",
            "text": "Nous pouvons alors faire le point avec vous : comprendre ce qui s'est passé, déterminer ce qui doit être rattrapé en priorité, identifier ce qui peut éventuellement être décalé et réorganiser votre planning en fonction du temps dont vous disposez réellement."
          },
          {
            "t": "p",
            "text": "L'objectif n'est jamais de vous culpabiliser parce que vous avez pris du retard."
          },
          {
            "t": "p",
            "text": "Il est de trouver une solution et de vous remettre progressivement sur la bonne trajectoire."
          },
          {
            "t": "p",
            "text": "C'est aussi cela, l'accompagnement humain Major ECN : ne pas vous laisser seul face à un programme que vous n'arrivez plus à tenir."
          }
        ]
      },
      {
        "n": 19,
        "q": "Est-il plus difficile de rester motivé lorsqu'on prépare les EVC seul ?",
        "a": [
          {
            "t": "p",
            "text": "Pour beaucoup de candidats, oui."
          },
          {
            "t": "p",
            "text": "La préparation s'étend sur plusieurs mois et vient souvent s'ajouter au travail, aux gardes, aux responsabilités familiales et à toutes les contraintes de la vie quotidienne."
          },
          {
            "t": "p",
            "text": "Lorsque l'on travaille seul, il est facile de perdre progressivement son rythme, de reporter une séance de travail au lendemain puis de voir le retard s'accumuler."
          },
          {
            "t": "p",
            "text": "Avec Major ECN, vous intégrez une véritable dynamique de préparation : enseignants, cours, entraînements, interrogations, épreuves blanches, objectifs et suivi."
          },
          {
            "t": "p",
            "text": "Vous voyez également que d'autres médecins travaillent pour atteindre le même objectif."
          },
          {
            "t": "p",
            "text": "Cette dynamique permet de maintenir plus facilement la régularité et de traverser les périodes de doute ou de fatigue."
          },
          {
            "t": "p",
            "text": "Vous préparez votre concours individuellement, mais vous n'êtes pas obligé de le préparer dans l'isolement."
          }
        ]
      },
      {
        "n": 20,
        "q": "Major ECN peut-il m'aider à être moins stressé pendant ma préparation ?",
        "a": [
          {
            "t": "p",
            "text": "Une préparation ne peut naturellement pas supprimer tout le stress lié à un concours aussi important."
          },
          {
            "t": "p",
            "text": "Mais une grande partie du stress vient de l'incertitude :"
          },
          {
            "t": "p",
            "text": "Est-ce que je travaille les bons supports ?"
          },
          {
            "t": "p",
            "text": "Cette recommandation est-elle toujours valable ?"
          },
          {
            "t": "p",
            "text": "Est-ce que j'en fais suffisamment ?"
          },
          {
            "t": "p",
            "text": "Est-ce que je vais trop loin dans les détails ?"
          },
          {
            "t": "p",
            "text": "Est-ce que ma méthode est correcte ?"
          },
          {
            "t": "p",
            "text": "Est-ce que mon niveau progresse ?"
          },
          {
            "t": "p",
            "text": "Est-ce que j'ai oublié une partie importante du programme ?"
          },
          {
            "t": "p",
            "text": "L'objectif de l'accompagnement Major ECN est précisément de réduire progressivement ces zones d'incertitude."
          },
          {
            "t": "p",
            "text": "Vous disposez d'une direction, d'enseignants auxquels poser vos questions, d'outils d'évaluation et d'un suivi de votre progression."
          },
          {
            "t": "p",
            "text": "Les interrogations et les épreuves blanches permettent également de rendre la situation d'examen progressivement plus familière."
          },
          {
            "t": "p",
            "text": "Vous restez responsable de votre travail, mais vous n'avez plus à prendre seul toutes les décisions concernant votre préparation."
          }
        ]
      },
      {
        "n": 21,
        "q": "Pourquoi être accompagné par des médecins spécialistes connaissant les EVC et le système français est-il important ?",
        "a": [
          {
            "t": "p",
            "text": "Parce qu'un bon enseignant ne transmet pas uniquement des connaissances médicales."
          },
          {
            "t": "p",
            "text": "Chez Major ECN, nos enseignants sont des médecins spécialistes dans leur discipline, dont plusieurs interviennent au sein de la préparation depuis de nombreuses années."
          },
          {
            "t": "p",
            "text": "Ils disposent donc à la fois d'une solide expertise médicale et d'une véritable expérience pédagogique auprès des candidats aux EVC."
          },
          {
            "t": "p",
            "text": "Ils connaissent les difficultés récurrentes, les notions qui posent problème, les erreurs fréquentes et les points sur lesquels il faut particulièrement insister."
          },
          {
            "t": "p",
            "text": "Mais surtout, ils savent expliquer."
          },
          {
            "t": "p",
            "text": "Une matière peut parfois paraître extrêmement compliquée simplement parce qu'elle n'a jamais été présentée d'une manière qui vous correspond."
          },
          {
            "t": "p",
            "text": "Nous avons régulièrement des candidats qui commencent un cours en expliquant qu'ils n'aiment pas une matière ou qu'ils ne l'ont jamais réellement comprise et qui, après les explications de leur enseignant, découvrent qu'elle devient beaucoup plus accessible."
          },
          {
            "t": "p",
            "text": "Bien enseigner ne consiste pas seulement à maîtriser sa spécialité. C'est savoir rendre simple et compréhensible ce qui paraissait compliqué."
          },
          {
            "t": "p",
            "text": "C'est également pouvoir répondre à vos questions lorsqu'un point vous bloque et vous éviter plusieurs heures de recherches et d'incertitudes."
          }
        ]
      },
      {
        "n": 22,
        "q": "Major ECN m'apprend-il uniquement à réussir un concours ?",
        "a": [
          {
            "t": "p",
            "text": "La priorité de la préparation reste naturellement de vous aider à réussir les EVC."
          },
          {
            "t": "p",
            "text": "Mais travailler les recommandations françaises actualisées, structurer son raisonnement clinique, revoir les conduites à tenir et consolider ses connaissances fondamentales a également une utilité bien au-delà de l'épreuve."
          },
          {
            "t": "p",
            "text": "Les supports et les explications des enseignants sont conçus pour vous permettre de comprendre et maîtriser les notions, et pas simplement de mémoriser une réponse pour le jour J."
          },
          {
            "t": "p",
            "text": "Les connaissances consolidées pendant votre préparation pourront donc continuer à vous servir dans votre pratique médicale."
          },
          {
            "t": "p",
            "text": "L'objectif est double :"
          },
          {
            "t": "p",
            "text": "vous préparer efficacement aux EVC tout en consolidant votre niveau médical."
          }
        ]
      }
    ]
  },
  {
    "id": "organisation-temps",
    "title": "Organiser sa préparation quand on manque de temps",
    "qas": [
      {
        "n": 23,
        "q": "Je travaille à l'hôpital et j'ai une vie de famille. Puis-je réellement préparer les EVC ?",
        "a": [
          {
            "t": "p",
            "text": "Oui, mais l'organisation et la régularité deviennent essentielles."
          },
          {
            "t": "p",
            "text": "La majorité des candidats aux EVC ne disposent pas de journées entières pour réviser. Ils travaillent, ont parfois des gardes, une famille et de nombreuses responsabilités."
          },
          {
            "t": "p",
            "text": "Dans cette situation, l'objectif n'est pas seulement de trouver davantage d'heures."
          },
          {
            "t": "p",
            "text": "Il faut surtout optimiser chaque heure disponible."
          },
          {
            "t": "p",
            "text": "C'est précisément l'un des intérêts d'une préparation structurée."
          },
          {
            "t": "p",
            "text": "Quelques heures de travail parfaitement ciblées, avec les bons supports, les bonnes explications et les bonnes priorités, peuvent permettre d'avancer beaucoup plus rapidement que de nombreuses heures passées seul à chercher des informations, comparer des ressources ou travailler des notions secondaires."
          },
          {
            "t": "p",
            "text": "Avec Major ECN, votre temps doit être utilisé pour progresser, pas pour chercher comment progresser."
          },
          {
            "t": "p",
            "text": "La plateforme a également été pensée pour pouvoir travailler régulièrement, même lorsque les plages disponibles sont courtes."
          },
          {
            "t": "p",
            "text": "Une heure le matin avant d'aller travailler."
          },
          {
            "t": "p",
            "text": "Un moment entre midi et deux."
          },
          {
            "t": "p",
            "text": "Une séance le soir."
          },
          {
            "t": "p",
            "text": "Quelques flashcards ou QCM lorsqu'un créneau se libère."
          },
          {
            "t": "p",
            "text": "Ces petites périodes de travail, lorsqu'elles sont utilisées avec beaucoup de régularité, finissent par représenter un volume considérable."
          },
          {
            "t": "p",
            "text": "La plateforme a également été conçue pour rendre cette préparation plus interactive et agréable : fiches, flashcards, exercices, QCM ou QROC, progression et révisions régulières permettent d'alterner les modes de travail."
          },
          {
            "t": "p",
            "text": "Au début, les progrès peuvent parfois sembler lents."
          },
          {
            "t": "p",
            "text": "Mais au fur et à mesure que les connaissances sont apprises, réactivées puis utilisées dans les exercices, les liens se créent et les automatismes apparaissent. La progression devient progressivement beaucoup plus visible."
          },
          {
            "t": "p",
            "text": "Cela demande néanmoins une véritable discipline personnelle."
          },
          {
            "t": "p",
            "text": "Il faut profiter des périodes disponibles et éviter autant que possible de reporter systématiquement au lendemain ce qui pouvait être travaillé aujourd'hui."
          },
          {
            "t": "p",
            "text": "Régularité, organisation et travail ciblé peuvent permettre de réaliser des progrès considérables, même avec un emploi du temps chargé."
          }
        ]
      },
      {
        "n": 24,
        "q": "Je commence tard ma préparation. Est-il encore possible de réussir les EVC ?",
        "a": [
          {
            "t": "p",
            "text": "Commencer tardivement ne signifie pas qu'il est trop tard pour réussir."
          },
          {
            "t": "p",
            "text": "Major ECN a déjà accompagné des candidats ayant commencé leur préparation seulement quelques mois avant les épreuves et obtenu de très bons résultats."
          },
          {
            "t": "p",
            "text": "Une préparation longue n'est d'ailleurs pas automatiquement une préparation efficace."
          },
          {
            "t": "p",
            "text": "Lorsque l'échéance paraît lointaine, il peut être tentant de reporter : « J'ai encore le temps, je travaillerai davantage demain. »"
          },
          {
            "t": "p",
            "text": "À l'inverse, une échéance relativement proche peut parfois provoquer une véritable mobilisation : travail régulier, concentration, organisation et priorisation."
          },
          {
            "t": "p",
            "text": "Mais lorsqu'il reste peu de temps, chaque heure compte davantage."
          },
          {
            "t": "p",
            "text": "Il devient indispensable de savoir :"
          },
          {
            "t": "ul",
            "items": [
              "ce qu'il faut travailler en priorité ;",
              "ce qui peut être laissé au second plan ;",
              "quels supports utiliser ;",
              "comment organiser ses journées ;",
              "quand réviser ;",
              "quand s'entraîner ;",
              "et comment ménager suffisamment de pauses pour maintenir un rythme efficace."
            ]
          },
          {
            "t": "p",
            "text": "C'est précisément là que l'encadrement Major ECN prend tout son sens."
          },
          {
            "t": "p",
            "text": "Le bon support, le bon dossier et la bonne explication au bon moment peuvent faire gagner un temps considérable."
          },
          {
            "t": "p",
            "text": "Bien entendu, le travail personnel reste déterminant. Commencer trois mois avant l'épreuve ne constitue jamais une garantie de réussite."
          },
          {
            "t": "p",
            "text": "Mais un candidat motivé, régulier, bien organisé et correctement guidé peut accomplir en quelques mois des progrès considérables."
          }
        ]
      },
      {
        "n": 25,
        "q": "J'ai déjà échoué aux EVC. Qu'est-ce que Major ECN peut changer dans ma préparation ?",
        "a": [
          {
            "t": "p",
            "text": "Un premier échec ne signifie pas que vous ne pouvez pas réussir lors d'une nouvelle tentative."
          },
          {
            "t": "p",
            "text": "Mais il est important de ne pas simplement recommencer exactement la même préparation de la même manière."
          },
          {
            "t": "p",
            "text": "La première question doit être :"
          },
          {
            "t": "p",
            "text": "« Pourquoi ai-je perdu des points ? »"
          },
          {
            "t": "p",
            "text": "Le problème venait-il des connaissances ?"
          },
          {
            "t": "p",
            "text": "De certains items insuffisamment travaillés ?"
          },
          {
            "t": "p",
            "text": "De la méthodologie ?"
          },
          {
            "t": "p",
            "text": "Des QCM ?"
          },
          {
            "t": "p",
            "text": "Des QROC ?"
          },
          {
            "t": "p",
            "text": "De la gestion du temps ?"
          },
          {
            "t": "p",
            "text": "Du stress ?"
          },
          {
            "t": "p",
            "text": "D'une mauvaise hiérarchisation des révisions ?"
          },
          {
            "t": "p",
            "text": "Major ECN peut vous aider à identifier les axes sur lesquels votre préparation doit évoluer et à reconstruire votre travail autour de ces difficultés."
          },
          {
            "t": "p",
            "text": "Nous avons déjà accompagné des candidats qui, après un premier échec, ont réalisé avec Major ECN une progression spectaculaire lors de leur nouvelle présentation aux EVC, avec plusieurs points gagnés grâce à une préparation plus ciblée, plus structurée et mieux adaptée à leurs difficultés."
          },
          {
            "t": "p",
            "text": "Le parcours du Dr Athena Haroun, ancienne élève de Major ECN et lauréate des EVC 2024 en chirurgie viscérale, en est une belle illustration : après avoir préparé seule sa première présentation, elle a considérablement amélioré ses résultats avec Major ECN grâce à une préparation plus ciblée, structurée et intensive, jusqu’à réussir brillamment les EVC avec une moyenne de 16/20."
          },
          {
            "t": "p",
            "text": "L'objectif n'est donc pas simplement de travailler davantage."
          },
          {
            "t": "p",
            "text": "Il est de comprendre ce qui n'a pas fonctionné la première fois pour travailler différemment la seconde."
          }
        ]
      },
      {
        "n": 26,
        "q": "Que faire si je suis particulièrement faible dans une matière ou si certains items me paraissent très difficiles ?",
        "a": [
          {
            "t": "p",
            "text": "C'est précisément dans ce type de situation que la qualité pédagogique de l'enseignant peut faire une énorme différence."
          },
          {
            "t": "p",
            "text": "Certaines matières deviennent progressivement des blocages : « Je n'ai jamais compris la néphrologie », « Je déteste la rhumatologie », « Je n'arrive pas à raisonner sur ce type de dossier… »"
          },
          {
            "t": "p",
            "text": "Mais une matière difficile n'est pas nécessairement une matière inaccessible."
          },
          {
            "t": "p",
            "text": "Parfois, il faut simplement qu'elle vous soit expliquée autrement."
          },
          {
            "t": "p",
            "text": "Les enseignants Major ECN sont des spécialistes de leur discipline et interviennent au sein de la préparation depuis de nombreuses années."
          },
          {
            "t": "p",
            "text": "Cette expérience leur permet de repérer les difficultés classiques, de reprendre les raisonnements étape par étape et de rendre beaucoup plus accessibles des notions qui semblaient jusque-là compliquées."
          },
          {
            "t": "p",
            "text": "Nous entendons régulièrement des candidats nous expliquer après un cours :"
          },
          {
            "t": "p",
            "text": "« C'était une matière que je détestais et, finalement, maintenant je la comprends et je l'apprécie. »"
          },
          {
            "t": "p",
            "text": "C'est l'une des grandes forces d'un enseignant particulièrement pédagogue."
          },
          {
            "t": "p",
            "text": "Il ne se contente pas de vous donner la réponse : il vous permet de comprendre pourquoi cette réponse devient logique."
          }
        ]
      }
    ]
  },
  {
    "id": "apprendre-ensemble",
    "title": "Apprendre et s’entraîner ensemble",
    "qas": [
      {
        "n": 27,
        "q": "Dois-je avoir terminé tout le programme avant de commencer les QCM et les QROC ?",
        "a": [
          {
            "t": "p",
            "text": "Non. La théorie et l'entraînement doivent progresser ensemble."
          },
          {
            "t": "p",
            "text": "Il serait contre-productif d'attendre d'avoir terminé l'intégralité du programme avant de commencer à vous confronter aux questions."
          },
          {
            "t": "p",
            "text": "Sur la plateforme Major ECN, l'apprentissage d'un item est donc associé aux QCM ou QROC correspondants, selon votre voie."
          },
          {
            "t": "p",
            "text": "Vous découvrez ou révisez les connaissances essentielles, puis vous les utilisez rapidement dans des exercices."
          },
          {
            "t": "p",
            "text": "Pourquoi ?"
          },
          {
            "t": "p",
            "text": "Parce que connaître une notion et savoir l'utiliser sont deux étapes différentes de l'apprentissage."
          },
          {
            "t": "p",
            "text": "L'exercice permet de découvrir ce que vous avez réellement compris, les détails que vous avez oubliés et les situations dans lesquelles votre raisonnement reste fragile."
          },
          {
            "t": "p",
            "text": "Vous pouvez alors revenir à la théorie, corriger votre compréhension, puis vous entraîner à nouveau."
          },
          {
            "t": "p",
            "text": "Le processus devient donc :"
          },
          {
            "t": "p",
            "text": "apprendre → pratiquer → identifier ses erreurs → reprendre la théorie → pratiquer à nouveau."
          },
          {
            "t": "p",
            "text": "Ces allers-retours permettent progressivement d'ancrer les connaissances beaucoup plus profondément."
          },
          {
            "t": "p",
            "text": "On ne maîtrise réellement un item que lorsqu'on est capable d'utiliser ses connaissances face à une question ou à une situation clinique."
          }
        ]
      },
      {
        "n": 28,
        "q": "Comment savoir si je suis réellement prêt à quelques semaines des EVC ?",
        "a": [
          {
            "t": "p",
            "text": "À l'approche des épreuves, la question n'est plus seulement :"
          },
          {
            "t": "p",
            "text": "« Est-ce que je progresse ? »"
          },
          {
            "t": "p",
            "text": "Elle devient :"
          },
          {
            "t": "p",
            "text": "« Si l'épreuve avait lieu demain, où en serais-je ? »"
          },
          {
            "t": "p",
            "text": "C'est précisément l'intérêt des interrogations, des exercices et surtout des épreuves blanches."
          },
          {
            "t": "p",
            "text": "Elles permettent de vérifier votre maîtrise des connaissances mais également votre capacité à les mobiliser dans un temps limité."
          },
          {
            "t": "p",
            "text": "Les résultats permettent d'identifier les derniers ajustements :"
          },
          {
            "t": "ul",
            "items": [
              "certains fondamentaux sont-ils encore fragiles ?",
              "existe-t-il des items sur lesquels vous perdez régulièrement des points ?",
              "votre méthodologie est-elle suffisamment solide ?",
              "gérez-vous correctement votre temps ?",
              "certaines erreurs reviennent-elles régulièrement ?"
            ]
          },
          {
            "t": "p",
            "text": "Les dernières semaines ne doivent pas nécessairement servir à apprendre toujours plus."
          },
          {
            "t": "p",
            "text": "Elles doivent surtout permettre de consolider, corriger les dernières faiblesses et sécuriser les connaissances essentielles."
          }
        ]
      }
    ]
  },
  {
    "id": "actualisation-experience",
    "title": "Actualisation et expérience Major ECN",
    "qas": [
      {
        "n": 29,
        "q": "Les recommandations médicales et contenus de préparation EVC sont-ils régulièrement actualisés ?",
        "a": [
          {
            "t": "p",
            "text": "Oui."
          },
          {
            "t": "p",
            "text": "La médecine évolue et une préparation aux EVC ne peut pas reposer sur des contenus figés pendant plusieurs années."
          },
          {
            "t": "p",
            "text": "Les supports Major ECN sont donc actualisés au fur et à mesure de l'évolution des recommandations et des bonnes pratiques françaises."
          },
          {
            "t": "p",
            "text": "Lorsqu'une recommandation importante évolue dans une spécialité, les contenus concernés de la plateforme sont mis à jour afin que les candidats puissent travailler à partir des données pertinentes pour leur préparation."
          },
          {
            "t": "p",
            "text": "C'est particulièrement important pour les médecins ayant été formés dans un autre pays ou ayant interrompu leur pratique pendant plusieurs années."
          },
          {
            "t": "p",
            "text": "Une connaissance qui était correcte quelques années auparavant peut avoir évolué."
          },
          {
            "t": "p",
            "text": "L'un des objectifs de Major ECN est précisément de vous éviter de devoir vérifier seul en permanence si ce que vous êtes en train d'apprendre est toujours conforme aux recommandations actuelles."
          }
        ]
      },
      {
        "n": 30,
        "q": "Comment Major ECN sait-il quelles connaissances sont réellement importantes pour les EVC ?",
        "a": [
          {
            "t": "p",
            "text": "C'est probablement l'un des domaines dans lesquels l'expérience acquise au fil des années prend le plus de valeur."
          },
          {
            "t": "p",
            "text": "Major ECN bénéficie de 15 années d'expérience dans la préparation médicale."
          },
          {
            "t": "p",
            "text": "Pendant toutes ces années, les équipes ont pu analyser les épreuves, les annales, les difficultés rencontrées par les candidats, l'évolution des recommandations et les attentes pédagogiques."
          },
          {
            "t": "p",
            "text": "À cela s'ajoute l'expérience de nos enseignants."
          },
          {
            "t": "p",
            "text": "Nos enseignants sont des médecins spécialistes de leur discipline, et interviennent au sein de Major ECN depuis de nombreuses années."
          },
          {
            "t": "p",
            "text": "Ils savent :"
          },
          {
            "t": "ul",
            "items": [
              "les connaissances fondamentales que tout candidat doit maîtriser ;",
              "les sujets fréquemment mal compris ;",
              "les raisonnements indispensables ;",
              "les notions sur lesquelles les candidats perdent régulièrement des points ;",
              "les évolutions des recommandations ;",
              "les thèmes qui méritent d'être approfondis ;",
              "et les connaissances secondaires sur lesquelles il serait inutile de consacrer une part excessive de son temps."
            ]
          },
          {
            "t": "p",
            "text": "L'expérience consiste à comprendre ce qu'il faut maîtriser autour de ces sujets, afin de préparer le candidat à des questions nouvelles."
          },
          {
            "t": "p",
            "text": "Au fil des années, les supports, les cours, les dossiers et les exercices ont ainsi été travaillés, corrigés, enrichis et affinés."
          },
          {
            "t": "p",
            "text": "C'est précisément cette accumulation d'expérience qui permet aujourd'hui à Major ECN de vous aider à répondre à une question fondamentale :"
          },
          {
            "t": "p",
            "text": "« Parmi l'immensité des connaissances médicales, sur quoi dois-je réellement concentrer mon temps pour préparer les EVC ? »"
          },
          {
            "t": "p",
            "text": "C'est là que 15 années d'expérience, l'analyse des épreuves et l'expertise de médecins spécialistes prennent tout leur sens."
          }
        ]
      }
    ]
  },
  {
    "id": "questions-pratiques",
    "title": "Questions pratiques sur la préparation Major ECN",
    "qas": [
      {
        "n": 31,
        "q": "Combien de temps ai-je accès à la plateforme Major ECN ?",
        "a": [
          {
            "t": "p",
            "text": "Vous bénéficiez de l'accès à la plateforme durant toute votre période de préparation aux EVC."
          },
          {
            "t": "p",
            "text": "L'objectif est que vous puissiez retrouver au même endroit les fiches, flashcards, QCM ou QROC, exercices, révisions, contenus pédagogiques et outils de suivi nécessaires à votre préparation jusqu'aux épreuves."
          },
          {
            "t": "p",
            "text": "Vous pouvez ainsi avancer progressivement, revenir sur les notions déjà étudiées et utiliser la plateforme tout au long de votre parcours."
          }
        ]
      },
      {
        "n": 32,
        "q": "Puis-je revoir les cours en replay ?",
        "a": [
          {
            "t": "p",
            "text": "Oui."
          },
          {
            "t": "p",
            "text": "Les cours dispensés dans le cadre des formations comprenant de l'enseignement sont progressivement mis à disposition en replay sur la plateforme."
          },
          {
            "t": "p",
            "text": "Vous pouvez ainsi revoir une explication, reprendre un point qui vous avait semblé difficile ou réécouter une séance lorsque vous en avez besoin."
          },
          {
            "t": "p",
            "text": "Les replays vous permettent également de disposer progressivement de l'ensemble du contenu pédagogique prévu dans votre formation, afin de pouvoir revenir sur les cours pendant toute votre période de préparation."
          }
        ]
      },
      {
        "n": 33,
        "q": "Que se passe-t-il si je ne peux pas assister à un cours en direct ?",
        "a": [
          {
            "t": "p",
            "text": "Cela ne vous empêche pas de suivre votre préparation."
          },
          {
            "t": "p",
            "text": "Le cours est ensuite mis à disposition sur la plateforme en replay, afin que vous puissiez le regarder lorsque votre emploi du temps vous le permet."
          },
          {
            "t": "p",
            "text": "C'est particulièrement important pour les candidats qui travaillent à l'hôpital, effectuent des gardes ou doivent gérer des contraintes familiales."
          },
          {
            "t": "p",
            "text": "Le direct reste naturellement intéressant pour suivre le cours avec le groupe et pouvoir interagir, mais un imprévu professionnel ou personnel ne doit pas vous faire perdre le contenu du cours."
          }
        ]
      },
      {
        "n": 34,
        "q": "Comment puis-je poser mes questions aux enseignants ?",
        "a": [
          {
            "t": "p",
            "text": "Vous pouvez poser vos questions par l'intermédiaire du chat de la plateforme ou par email."
          },
          {
            "t": "p",
            "text": "Lorsqu'une notion n'est pas claire, qu'une correction vous pose problème ou que vous avez besoin d'une précision sur une recommandation, vous pouvez solliciter l'équipe pédagogique."
          },
          {
            "t": "p",
            "text": "Les questions sont traitées rapidement, afin que vous puissiez obtenir l'explication nécessaire et poursuivre votre préparation sans rester bloqué inutilement."
          },
          {
            "t": "p",
            "text": "Lorsque cela est utile, les explications peuvent également être accompagnées des références correspondantes."
          },
          {
            "t": "p",
            "text": "L'objectif est simple : vous éviter de perdre plusieurs heures à rechercher seul une réponse lorsqu'un enseignant peut vous aider à résoudre rapidement votre difficulté."
          }
        ]
      },
      {
        "n": 35,
        "q": "Préparation EVC voie interne et voie externe : quelles différences ?",
        "a": [
          {
            "t": "p",
            "text": "Les connaissances médicales indispensables restent naturellement au cœur des deux préparations, mais la méthodologie et les entraînements diffèrent en fonction du type d'épreuve."
          },
          {
            "t": "h",
            "text": "Pour la voie interne"
          },
          {
            "t": "p",
            "text": "La préparation met particulièrement l'accent sur les QCM."
          },
          {
            "t": "p",
            "text": "Vous travaillez notamment :"
          },
          {
            "t": "ul",
            "items": [
              "les questions à réponses multiples ou à réponse unique ;",
              "l'analyse précise des énoncés ;",
              "les informations discriminantes ;",
              "les formulations susceptibles de constituer des pièges ;",
              "l'élimination des propositions incorrectes ;",
              "les recommandations françaises ;",
              "la gestion du temps ;",
              "l'analyse détaillée de vos erreurs."
            ]
          },
          {
            "t": "p",
            "text": "L'objectif est de développer progressivement les automatismes de raisonnement nécessaires pour répondre efficacement aux QCM des EVC."
          },
          {
            "t": "h",
            "text": "Pour la voie externe"
          },
          {
            "t": "p",
            "text": "La préparation met davantage l'accent sur les QROC et les réponses rédactionnelles."
          },
          {
            "t": "p",
            "text": "Vous apprenez notamment à :"
          },
          {
            "t": "ul",
            "items": [
              "analyser précisément l'énoncé ;",
              "identifier les mots et informations importants de la question ;",
              "comprendre ce que le correcteur attend ;",
              "faire apparaître les mots-clés nécessaires ;",
              "hiérarchiser votre réponse ;",
              "identifier les éléments indispensables ;",
              "repérer les PMZ (« pas mis = zéro ») ;",
              "rédiger une réponse claire, précise et adaptée au barème."
            ]
          },
          {
            "t": "p",
            "text": "Dans les deux voies, l'objectif reste identique :"
          },
          {
            "t": "p",
            "text": "vous apprendre non seulement la médecine nécessaire pour les EVC, mais également la manière de restituer efficacement vos connaissances dans le format précis de votre épreuve."
          }
        ]
      },
      {
        "n": 36,
        "q": "Comment m'inscrire à une formation Major ECN ?",
        "a": [
          {
            "t": "p",
            "text": "L'inscription est simple."
          },
          {
            "t": "p",
            "text": "Il vous suffit de cliquer sur le bouton « Inscription » du site Major ECN puis de sélectionner la spécialité et la formule qui correspondent à votre situation."
          },
          {
            "t": "p",
            "text": "Vous pouvez choisir entre les formations Essentielle, Intensive ou Approfondie selon votre niveau, votre autonomie et le degré d'accompagnement que vous souhaitez."
          },
          {
            "t": "p",
            "text": "Si vous hésitez entre plusieurs formules, vous pouvez également contacter l'équipe Major ECN afin d'être orienté vers la préparation la plus adaptée à votre situation."
          }
        ]
      },
      {
        "n": 37,
        "q": "Puis-je payer ma formation en plusieurs fois ?",
        "a": [
          {
            "t": "p",
            "text": "Oui."
          },
          {
            "t": "p",
            "text": "Major ECN propose des possibilités de règlement permettant d'étaler le coût de la formation."
          },
          {
            "t": "p",
            "text": "Vous pouvez notamment régler votre préparation en trois ou quatre fois."
          },
          {
            "t": "p",
            "text": "Si vous avez besoin d'un étalement plus important, n'hésitez pas à contacter directement l'équipe Major ECN : selon votre situation, il peut être possible d'organiser un règlement allant jusqu'à dix mensualités."
          },
          {
            "t": "p",
            "text": "L'objectif est que les modalités de paiement puissent être adaptées autant que possible à votre situation."
          }
        ]
      },
      {
        "n": 38,
        "q": "Quand puis-je commencer ma préparation ?",
        "a": [
          {
            "t": "p",
            "text": "Dès votre inscription."
          },
          {
            "t": "p",
            "text": "Une fois votre inscription finalisée, vous pouvez commencer immédiatement à travailler sur la plateforme Major ECN."
          },
          {
            "t": "p",
            "text": "Vous n'avez donc pas besoin d'attendre le début d'une nouvelle session pour commencer vos révisions."
          },
          {
            "t": "p",
            "text": "Vous pouvez immédiatement découvrir vos supports, commencer les fiches, travailler vos flashcards, réaliser vos premiers QCM ou QROC et organiser progressivement votre préparation."
          },
          {
            "t": "p",
            "text": "Plus tôt vous commencez à utiliser régulièrement les outils mis à votre disposition, plus vous pouvez installer progressivement les connaissances et les automatismes nécessaires pour le jour J."
          }
        ]
      },
      {
        "n": 39,
        "q": "Je ne sais pas quelle formule choisir. Major ECN peut-il m'aider ?",
        "a": [
          {
            "t": "p",
            "text": "Oui."
          },
          {
            "t": "p",
            "text": "Le choix de la formation dépend de plusieurs éléments :"
          },
          {
            "t": "ul",
            "items": [
              "votre niveau médical actuel ;",
              "la date à laquelle vous commencez votre préparation ;",
              "votre disponibilité ;",
              "votre capacité à travailler de façon autonome ;",
              "l'ancienneté de certaines connaissances ;",
              "votre spécialité ;",
              "votre besoin d'encadrement humain."
            ]
          },
          {
            "t": "p",
            "text": "La formation Essentielle conviendra davantage à un candidat souhaitant principalement travailler en autonomie sur la plateforme."
          },
          {
            "t": "p",
            "text": "La formation Intensive permettra d'ajouter 18 heures de cours pour être guidé et revoir rapidement les principaux points clés."
          },
          {
            "t": "p",
            "text": "La formation Approfondie permettra de reprendre le programme de façon beaucoup plus structurée et complète avec les enseignants, afin de réduire au maximum les zones d'ombre et mettre toutes les chances de son côté."
          },
          {
            "t": "p",
            "text": "Si vous hésitez, vous pouvez contacter l'équipe Major ECN afin d'échanger sur votre situation et déterminer la formule qui paraît la plus adaptée à votre préparation."
          }
        ]
      },
      {
        "n": 40,
        "q": "Puis-je accéder à la plateforme Major ECN depuis l’étranger ?",
        "a": [
          {
            "t": "p",
            "text": "Oui. La plateforme Major ECN est accessible en ligne, que vous soyez en France ou à l’étranger."
          },
          {
            "t": "p",
            "text": "Vous pouvez ainsi commencer votre préparation aux EVC avant même votre arrivée en France et retrouver depuis votre espace personnel l’ensemble des ressources correspondant à votre formation : fiches, flashcards, QCM ou QROC, cas cliniques, annales, outils de révision et suivi de progression."
          },
          {
            "t": "p",
            "text": "Si votre formule comprend des cours, vous pouvez également retrouver les replays mis à disposition sur la plateforme, ce qui est particulièrement utile lorsque vous résidez à l’étranger ou lorsqu’un horaire de cours est difficilement compatible avec votre fuseau horaire."
          },
          {
            "t": "p",
            "text": "Vous pouvez également poser vos questions à l’équipe pédagogique directement depuis la plateforme et poursuivre votre préparation à distance."
          },
          {
            "t": "p",
            "text": "Où que vous soyez, l'objectif est que vous puissiez avancer dans votre préparation avec les mêmes contenus, la même méthode et le même accompagnement pédagogique."
          }
        ]
      },
      {
        "n": 41,
        "q": "Puis-je rejoindre la formation si les cours ont déjà commencé ?",
        "a": [
          {
            "t": "p",
            "text": "Oui. Il n'est pas nécessaire d'avoir rejoint Major ECN dès le premier cours pour intégrer la préparation."
          },
          {
            "t": "p",
            "text": "Lorsque vous vous inscrivez en cours d'année, vous accédez immédiatement à la plateforme et aux contenus déjà mis à votre disposition."
          },
          {
            "t": "p",
            "text": "Si votre formule comprend des cours, les séances déjà dispensées sont disponibles en replay, ce qui vous permet de reprendre progressivement les enseignements que vous n'avez pas suivis en direct."
          },
          {
            "t": "p",
            "text": "Vous retrouvez également les supports, fiches, flashcards, QCM ou QROC, exercices, annales, dossiers et autres contenus correspondant à votre préparation."
          },
          {
            "t": "p",
            "text": "L'objectif est ensuite de vous permettre de rattraper intelligemment sans désorganiser la suite de votre travail."
          },
          {
            "t": "p",
            "text": "Il ne s'agit pas nécessairement de tout regarder immédiatement. Selon le temps restant avant les EVC, il faut savoir hiérarchiser : commencer par les connaissances prioritaires, utiliser les replays de façon ciblée, s'entraîner et avancer parallèlement avec la suite de la préparation."
          },
          {
            "t": "p",
            "text": "L'accompagnement Major ECN prend alors tout son sens : vous aider à déterminer par où commencer et comment utiliser efficacement le temps qu'il vous reste."
          },
          {
            "t": "p",
            "text": "Vous pouvez donc rejoindre la préparation alors que les cours ont déjà commencé et bénéficier des contenus déjà disponibles ainsi que de la suite du programme."
          },
          {
            "t": "p",
            "text": "Vous ne repartez pas de zéro : tout ce qui a déjà été mis à disposition vous permet de rejoindre progressivement la dynamique de préparation."
          }
        ]
      },
      {
        "n": 42,
        "q": "Les contenus Major ECN sont-ils réellement adaptés à ma spécialité ?",
        "a": [
          {
            "t": "p",
            "text": "Oui. La préparation est construite spécifiquement pour chaque spécialité."
          },
          {
            "t": "p",
            "text": "Une préparation aux EVC en cardiologie ne peut pas être identique à une préparation en pédiatrie, en anesthésie-réanimation, en psychiatrie, en médecine générale ou dans une autre spécialité."
          },
          {
            "t": "p",
            "text": "Chez Major ECN, les contenus sont donc adaptés aux connaissances, aux enjeux et aux exigences propres à chaque spécialité."
          },
          {
            "t": "p",
            "text": "Cela concerne aussi bien :"
          },
          {
            "t": "ul",
            "items": [
              "les fiches et les items à maîtriser ;",
              "les connaissances prioritaires ;",
              "les recommandations françaises ;",
              "les QCM ;",
              "les QROC ;",
              "les cas et dossiers cliniques ;",
              "les annales ;",
              "les sujets inédits ;",
              "les cours ;",
              "les exercices ;",
              "les points méthodologiques spécifiques."
            ]
          },
          {
            "t": "p",
            "text": "Les enseignements sont dispensés par des médecins spécialistes de la discipline concernée, dont plusieurs interviennent chez Major ECN depuis de nombreuses années."
          },
          {
            "t": "p",
            "text": "La préparation est également adaptée à votre voie."
          },
          {
            "t": "p",
            "text": "Pour la voie interne, l'entraînement met notamment l'accent sur les QCM, leur raisonnement, leurs formulations et leurs pièges."
          },
          {
            "t": "p",
            "text": "Pour la voie externe, le travail porte notamment sur les QROC et la méthodologie rédactionnelle : analyse de l'énoncé, mots-clés, hiérarchisation de la réponse, éléments indispensables et PMZ."
          },
          {
            "t": "p",
            "text": "Il ne s'agit donc pas d'une préparation EVC générique à laquelle on change simplement le nom de la spécialité."
          },
          {
            "t": "p",
            "text": "La préparation est construite sur mesure autour de votre spécialité et du format d'épreuve auquel vous allez réellement être confronté."
          }
        ]
      },
      {
        "n": 43,
        "q": "Major ECN garantit-il ma réussite aux EVC ?",
        "a": [
          {
            "t": "p",
            "text": "Non. Aucune préparation sérieuse ne peut garantir la réussite à un concours."
          },
          {
            "t": "p",
            "text": "Le travail personnel du candidat restera toujours indispensable."
          },
          {
            "t": "p",
            "text": "Il faut apprendre, réviser, s'entraîner, accepter de corriger ses erreurs, rester régulier et maintenir ses efforts jusqu'au jour J."
          },
          {
            "t": "p",
            "text": "En revanche, le rôle de Major ECN est de mettre à votre disposition tout ce qui peut faciliter et optimiser ce travail."
          },
          {
            "t": "p",
            "text": "Nous cherchons à vous apporter, en un même endroit :"
          },
          {
            "t": "ul",
            "items": [
              "les bons supports ;",
              "les connaissances essentielles ;",
              "les recommandations actualisées ;",
              "les explications nécessaires pour comprendre les points difficiles ;",
              "des enseignants spécialistes et pédagogues ;",
              "une méthodologie adaptée aux EVC ;",
              "des QCM ou QROC selon votre voie ;",
              "des annales corrigées ;",
              "des dossiers et sujets inédits ;",
              "des flashcards et outils de mémorisation ;",
              "un système de révision permettant de lutter contre l'oubli ;",
              "des interrogations et épreuves blanches ;",
              "un suivi de votre progression ;",
              "du coaching ;",
              "un accompagnement lorsque vous prenez du retard ou rencontrez une difficulté."
            ]
          },
          {
            "t": "p",
            "text": "Autrement dit, Major ECN cherche à mettre sur la table tous les outils nécessaires pour que vous puissiez vous concentrer sur votre travail et votre progression."
          },
          {
            "t": "p",
            "text": "Nous sélectionnons, organisons, expliquons, faisons pratiquer, évaluons et accompagnons."
          },
          {
            "t": "p",
            "text": "Mais c'est ensuite votre investissement personnel qui permet de transformer cet accompagnement en résultat."
          },
          {
            "t": "p",
            "text": "Certains parcours de nos anciens élèves montrent particulièrement bien ce que cette association peut permettre."
          },
          {
            "t": "p",
            "text": "Le Dr Ilanserane Gundugolanu Saranya, originaire d'Inde, a dû notamment s'adapter à un nouveau système de formation et d'évaluation en France, tout en progressant dans la maîtrise du français médical et dans la méthodologie attendue aux épreuves."
          },
          {
            "t": "p",
            "text": "Major ECN l'a accompagnée de façon très complète : reprise complète des connaissances, contenus clairs et ciblés, méthodologie de réponse adaptée, entraînements intensifs et appropriation progressive des attentes spécifiques des épreuves françaises."
          },
          {
            "t": "p",
            "text": "Avec son travail personnel, sa détermination et son investissement tout au long de la préparation, elle a finalement réussi brillamment les épreuves, jusqu'à se classer major en odontologie en 2023."
          },
          {
            "t": "p",
            "text": "Son parcours illustre parfaitement notre philosophie."
          },
          {
            "t": "p",
            "text": "Nous ne pouvons pas travailler à votre place."
          },
          {
            "t": "p",
            "text": "En revanche, nous pouvons vous éviter de travailler seul et mettre à votre disposition tout ce qui est nécessaire pour construire une préparation solide : vous donner les contenus théoriques indispensables, sélectionner les connaissances à maîtriser en priorité, vous proposer des dossiers, QCM, QROC et exercices inédits ciblés, vous transmettre les méthodes, réflexes et astuces qui peuvent faire la différence le jour J, vous montrer la bonne direction et vous aider à concentrer vos efforts là où ils sont réellement utiles."
          },
          {
            "t": "p",
            "text": "Nos enseignants sont également là pour vous expliquer clairement les notions difficiles, répondre à vos questions, reprendre avec vous les points que vous n'avez pas compris et vous éviter de perdre des heures à chercher seul une réponse."
          },
          {
            "t": "p",
            "text": "Mais l'accompagnement Major ECN ne s'arrête pas aux connaissances."
          },
          {
            "t": "p",
            "text": "Il consiste aussi à vous guider, vous organiser, vous évaluer, vous aider à corriger vos faiblesses, vous remotiver lorsque cela devient difficile et maintenir avec vous une dynamique de travail jusqu'aux épreuves."
          },
          {
            "t": "p",
            "text": "Supports théoriques, recommandations actualisées, dossiers et sujets inédits, entraînements, méthodologie, mémorisation, évaluations, enseignants spécialistes, réponses à vos questions, organisation, motivation et accompagnement humain : notre rôle est de mettre à votre disposition l'ensemble des outils pédagogiques et humains nécessaires pour vous permettre de vous préparer dans les meilleures conditions et de mettre toutes les chances de votre côté jusqu'au jour J."
          },
          {
            "t": "p",
            "text": "Major ECN met ainsi tout en œuvre pour vous permettre de travailler dans les meilleures conditions et de mettre toutes les chances de votre côté."
          },
          {
            "t": "p",
            "text": "La réussite reste le résultat d'une association indispensable :"
          },
          {
            "t": "p",
            "text": "une préparation très solide + un accompagnement de grande qualité + votre travail personnel."
          }
        ]
      }
    ]
  }
];

/** Nombre total de questions (affiché dans le bloc FAQ). */
export const FAQ_EVC_TOTAL = FAQ_EVC_CATEGORIES.reduce((s, c) => s + c.qas.length, 0);

/** Aplatis en texte simple — pour le JSON-LD FAQPage. */
export function faqEvcPlainQAs(): { q: string; a: string }[] {
  return FAQ_EVC_CATEGORIES.flatMap((c) =>
    c.qas.map((qa) => ({
      q: qa.q,
      a: qa.a.map((b) => (b.t === 'ul' ? b.items.join(' ') : b.text)).join(' '),
    })),
  );
}
