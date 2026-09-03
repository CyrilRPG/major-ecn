const missing = new Set([47, 63, 72, 73, 89, 96]);
const S = (a, b = a) =>
  Array.from({ length: b - a + 1 }, (_, i) => a + i)
    .filter((n) => !missing.has(n))
    .map((n) => `b${String(n).padStart(5, "0")}`);
const row = (concept, bullets, sourceBlocks, image = null) => ({
  concept,
  bullets,
  sourceBlocks,
  ...(image ? { image } : {}),
});
const img = (path, caption, sourceCaption, cropBottomMm) => ({
  path,
  caption,
  sourceCaption,
  position: "after",
  size: "large",
  layout: "full_width",
  containsText: true,
  cropBottomMm,
});
const I = {
  transfer: {
    ...img(
      "img/img_001.png",
      "Transfert des outils de sécurité vers les soins",
      "Transfert d’outils de sécurité de l’aviation vers la santé",
      8,
    ),
    maskRegions: [{ leftPct: 22, topPct: 0, widthPct: 1.7, heightPct: 100 }],
  },
  ants: img(
    "img/img_002.png",
    "Compétences non techniques de l’ANTS",
    "Grille d’analyse des compétences non techniques ANTS",
    8,
  ),
  phrase1: img(
    "img/img_003.png",
    "Phraséologie : construire un message sans ambiguïté",
    "Règles de phraséologie médicale",
    8,
  ),
  phrase2: {
    ...img("img/img_004.png", "", "", 8),
    caption: null,
    sourceCaption: null,
  },
  situated: img(
    "img/img_005.png",
    "Les cinq ressources de la cognition située",
    "Représentation schématique de la cognition située",
    8,
  ),
  analysis: img(
    "img/img_006.png",
    "Analyser les outils par la cognition située",
    "Analyse des notions de facteur humain par la cognition située",
    9,
  ),
};




function buildFiche() {
  const parts = [
    {
      title: "Comprendre l’accident sans chercher un coupable",
      sections: [
        {
          title: "De l’erreur au dommage",
          rows: [
            row(
              "Erreur centrée sur le processus",
              [
                {
                  text: "Un écart de planification ou d’exécution peut exister sans dommage et un dommage peut survenir sans erreur.",
                  children: [
                    "Distinguer omission, commission, mauvais plan et mauvaise exécution",
                    "Évaluer le processus plutôt que juger uniquement l’issue clinique",
                  ],
                },
              ],
              S(3, 8),
            ),
            row(
              "Facteur humain et système",
              [
                "Étudier les interactions entre personnes, équipements, environnement et organisation afin d’améliorer bien-être et performance globale.",
              ],
              S(8, 15),
            ),
        row(
          "Complexité quotidienne",
          [
            "Une réanimation peut cumuler près de 178 activités par patient et par jour ; un faible taux d’erreur produit alors de nombreux écarts.",
            "La multiplication des professionnels augmente les interfaces ; la sécurité exige des compétences de coordination en plus du savoir médical.",
          ],
          S(16, 18),
        ),
          ],
        },
        {
          title: "Trajectoire et barrières",
          rows: [
            row(
              "Risque, incident, accident",
              [
                "Un risque n’aboutit pas toujours à un incident, et un incident n’aboutit pas toujours à un accident.",
                "L’objectif est d’interrompre la trajectoire avant le dommage.",
              ],
              S(19, 23),
            ),
            row(
              "Modèle du gruyère",
              [
                {
                  text: "Chaque barrière comporte des failles ; l’accident apparaît lorsque plusieurs failles s’alignent.",
                  children: [
                    "Une seule barrière efficace peut interrompre la trajectoire",
                    "L’analyse recherche surtout les défaillances latentes du système",
                  ],
                },
              ],
              S(21, 24),
            ),
            row(
              "Barrière utile",
              [
                "Ajouter une procédure n’est pertinent que si elle réduit effectivement le risque sans créer une charge de travail disproportionnée.",
              ],
              S(24, 25),
            ),
          ],
        },
      ],
    },
    {
      title: "Déjouer les pièges de la décision",
      sections: [
        {
          title: "Biais cognitifs",
          rows: [
            row(
              "Confirmation",
              [
                {
                  text: "Chercher préférentiellement les données compatibles avec l’hypothèse initiale et négliger celles qui la contredisent.",
                  children: [
                    "Formuler volontairement une hypothèse alternative",
                    "Rechercher une donnée qui invaliderait le diagnostic favori",
                  ],
                },
              ],
              S(26, 29),
            ),
            row(
              "Ancrage",
              [
                "Rester fixé sur l’interprétation de départ malgré l’évolution ou de nouvelles informations discordantes.",
              ],
              S(27, 31),
            ),
            row(
              "Commission",
              [
                {
                  text: "Préférer une action non indiquée à l’inaction simplement pour avoir le sentiment d’agir.",
                  children: [
                    "Comparer explicitement bénéfice, risque et option d’abstention",
                    "Réévaluer si l’action répond encore à un objectif clinique",
                  ],
                },
              ],
              S(27, 31),
            ),
          ],
        },
        {
          title: "Raisonnement sous pression",
          rows: [
            row(
              "Mode intuitif",
              [
                "La reconnaissance rapide d’un schéma est efficace dans une situation familière, mais expose aux raccourcis et à la fermeture prématurée.",
              ],
              S(31),
            ),
            row(
              "Mode analytique",
              [
                {
                  text: "Décomposer les données, produire plusieurs hypothèses, comparer les stratégies puis décider.",
                  children: [
                    "Plus lent, mais utile quand le tableau est atypique",
                    "Doit être déclenché par une discordance ou une absence de réponse au traitement",
                  ],
                },
              ],
              S(31),
            ),
            row(
              "Contre-mesures",
              [
                "Verbaliser le diagnostic de travail et préciser son degré de certitude.",
                "Annoncer la donnée qui imposerait un changement de plan.",
                "Solliciter un regard indépendant lorsqu’une discordance persiste.",
              ],
              S(27, 31),
            ),
          ],
        },
      ],
    },
    {
      title: "Faire de l’équipe une barrière de sécurité",
      sections: [
        {
          title: "Compétences non techniques",
          rows: [
            row(
              "Quatre domaines",
              [
                {
                  text: "Gestion des tâches, travail d’équipe, conscience de la situation et prise de décision complètent les compétences techniques.",
                  children: [
                    "Elles s’observent en situation réelle ou simulée",
                    "Elles sont entraînables et évaluables",
                  ],
                },
              ],
              S(58, 65),
              I.ants,
            ),
            row(
              "ANTS",
              [
                "Quinze items notés de 1 à 4, soit un maximum de 60 ; un score transforme les comportements en observables discutables.",
              ],
              S(60, 64),
            ),
            row(
              "Leadership de crise",
              [
                {
                  text: "Fixer les priorités, distribuer les rôles, demander de l’aide et réévaluer collectivement la situation.",
                  children: [
                    "Une voie aérienne impossible exige une priorité explicite à l’oxygénation",
                    "La conscience de situation doit être partagée, pas supposée",
                  ],
                },
              ],
              S(36, 37),
            ),
          ],
        },
        {
          title: "Communication fermée",
          rows: [
            row(
              "Message précis",
              [
                "Employer un verbe d’action, nommer le destinataire, donner les chiffres avec leurs unités et limiter les acronymes.",
              ],
              S(64, 67),
              I.phrase1,
            ),
            row(
              "Boucle fermée",
              [
                {
                  text: "Le destinataire répète la demande, l’émetteur confirme, puis l’exécution est annoncée.",
                  children: [
                    "Une absence de réponse n’est jamais assimilée à un accord",
                    "Le ton et le langage corporel doivent rester cohérents avec l’urgence",
                  ],
                },
              ],
              S(64, 67),
              I.phrase2,
            ),
            row(
              "Contradiction utile",
              [
                "Un tour de table ou un avocat du diable fait émerger une information minoritaire que le consensus apparent pourrait étouffer.",
              ],
              S(129, 134),
            ),
          ],
        },
      ],
    },
    {
      title: "Augmenter la cognition au moment critique",
      sections: [
        {
          title: "Aides cognitives et simulation",
          rows: [
            row(
              "Aide cognitive",
              [
                {
                  text: "Elle sécurise les étapes rares ou complexes sans exiger leur rappel intégral de mémoire.",
                  children: [
                    "Former l’équipe à son emploi avant la crise",
                    "Adapter forme, lisibilité et contenu avec une méthode telle que le CMAT",
                  ],
                },
              ],
              S(68, 77),
            ),
            row(
              "Effet mesuré",
              [
                "Après la même formation, une aide cognitive a permis 16 actions sur 21 contre 8,8 sur 21 sans support lors d’une simulation.",
              ],
              S(69, 75),
            ),
            row(
              "Code reader",
              [
                {
                  text: "Un membre lit la conduite à tenir pendant que les autres exécutent les actions.",
                  children: [
                    "Séparer lecture et gestes diminue la charge cognitive de l’opérateur",
                    "La progression de la liste devient visible pour toute l’équipe",
                  ],
                },
              ],
              S(76, 77),
            ),
            row(
              "Simulation",
              [
                "Elle entraîne les comportements, la coordination et l’usage réel des supports ; le débriefing relie décisions, communication et résultat.",
              ],
              S(90, 94),
            ),
          ],
        },
        {
          title: "Cognition située",
          rows: [
            row(
              "Ressources distribuées",
              [
                {
                  text: "La performance naît de l’interaction entre ressources individuelles, environnementales, sociales, anticipées et aides cognitives.",
                  children: [
                    "L’environnement suggère certaines actions par ses alarmes et commandes",
                    "Le groupe partage connaissances et perception de la situation",
                  ],
                },
              ],
              S(78, 87),
              I.situated,
            ),
            row(
              "Distribution temporelle",
              [
                "Anticiper un calcul, une dilution ou un plan de secours avant l’événement libère de la capacité mentale pendant la crise.",
              ],
              S(79, 81),
            ),
            row(
              "Distribution sociale",
              [
                {
                  text: "Questionner, faire reformuler et demander une opinion transforme les ressources individuelles en cognition collective.",
                  children: [
                    "Une expertise isolée ne suffit pas si elle n’est pas communiquée",
                    "L’aide extérieure devient une composante normale de la compétence",
                  ],
                },
              ],
              S(82, 85),
            ),
            row(
              "Grille d’analyse",
              [
                "Examiner chaque outil selon ses effets sur l’individu, l’environnement, le collectif, l’anticipation et les supports cognitifs.",
              ],
              S(86, 98),
              I.analysis,
            ),
          ],
        },
      ],
    },
    {
      title: "Installer une culture qui apprend",
      sections: [
        {
          title: "Cadre institutionnel",
          rows: [
            row(
              "Déclaration d’Helsinki",
              [
                {
                  text: "La sécurité périopératoire repose sur le monitorage minimal, des protocoles de crise, la checklist et la conformité des pratiques de sédation.",
                  children: [
                    "Prévoir équipement, médicaments, voie aérienne difficile, anaphylaxie, toxicité locale et hémorragie",
                    "Étendre les exigences au bloc et à la salle de réveil",
                  ],
                },
              ],
              S(99, 109),
            ),
            row(
              "Mesurer pour progresser",
              [
                "Produire un rapport annuel, recueillir morbidité et mortalité, participer aux audits et déclarer les incidents critiques.",
              ],
              S(110, 115),
            ),
            row(
              "Outils transférés",
              [
                {
                  text: "Simulation, checklist, repos, gestion de crise, enregistrement, retour d’expérience et phraséologie ont été adaptés d’industries à risque.",
                  children: [
                    "Le transfert exige adaptation au contexte clinique",
                    "L’outil doit être évalué sur son utilisation réelle",
                  ],
                },
              ],
              S(38, 57),
              I.transfer,
            ),
          ],
        },
        {
          title: "Risque, apprentissage et valeurs",
          rows: [
            row(
              "Trois modèles",
              [
                "Résilience : risque recherché et expertise individuelle ; ultrasécurité : risque exclu et procédures ; haute fiabilité : risque accepté et intelligence du groupe.",
              ],
              S(116, 125),
            ),
            row(
              "Erreur non intentionnelle",
              [
                {
                  text: "Ne pas la punir : la déclarer, l’analyser et diffuser les apprentissages pour éviter sa répétition.",
                  children: [
                    "Une culture punitive pousse à dissimuler les signaux faibles",
                    "L’analyse distingue comportement délibéré et vulnérabilité du système",
                  ],
                },
              ],
              S(126, 134),
            ),
            row(
              "Réalité de l’outil",
              [
                "Une checklist cochée dans un dossier peut être incomplètement réalisée ; l’observation de terrain vérifie la pratique réelle.",
              ],
              S(135, 139),
            ),
            row(
              "Valeurs de sécurité",
              [
                {
                  text: "Humilité, discipline et travail d’équipe rendent possibles l’emploi constant des barrières.",
                  children: [
                    "Reconnaître ses limites conduit à mobiliser une ressource externe",
                    "Appliquer les règles à chaque patient protège contre l’exception banalisée",
                  ],
                },
              ],
              S(136, 145),
            ),
          ],
        },
      ],
    },
  ];
  const sourceBlocks = [
    ...new Set(
      parts.flatMap((p) =>
        p.sections.flatMap((s) => s.rows.flatMap((r) => r.sourceBlocks)),
      ),
    ),
  ];
  return {
    matiere: "Anesthésie-Réanimation",
    title: "Les facteurs humains en anesthésie-réanimation",
    year: "2026-2027",
    coverSubtitle:
      "Erreur, décision, communication, cognition située et culture de sécurité",
    imageOmissions: [],
    imageException: {
      reason:
        "Le document source contient exactement six figures pédagogiques, toutes intégrées sans ajout externe.",
    },
    sourceBlocks,
    parts,
    synthesis: {
      compactLayout: true,
      chiffres: {
        headers: ["Repère", "Valeur"],
        rows: [
          ["Événements indésirables chirurgicaux", "9,2 %"],
          ["Part évitable", "43,5 %"],
          ["Activités en réanimation", "178/patient/j"],
          ["Erreur observée", "0,95 %"],
          ["ANTS", "15 items, maximum 60"],
          ["Aide cognitive", "16/21 vs 8,8/21"],
        ],
      },
      tables: [
        {
          title: "Barrières au raisonnement",
          headers: ["Risque", "Réponse"],
          rows: [
            ["Confirmation", "Chercher une donnée contradictoire"],
            ["Ancrage", "Réévaluer devant toute évolution"],
            ["Commission", "Comparer action et abstention"],
            ["Fermeture prématurée", "Formuler une hypothèse alternative"],
          ],
        },
        {
          title: "Cognition distribuée",
          headers: ["Ressource", "Application"],
          rows: [
            ["Anticipation", "Préparer dose et plan avant la crise"],
            ["Sociale", "Partager perception et options"],
            ["Environnement", "Alarmes, commandes, ergonomie"],
            ["Aide cognitive", "Conduite à tenir lisible et entraînée"],
          ],
        },
      ],
      keyPoints: [
        "L’erreur se juge sur le processus, pas uniquement sur l’issue.",
        "Une seule barrière efficace peut interrompre une trajectoire d’accident.",
        "Les biais doivent être recherchés activement quand la situation évolue.",
        "Les compétences non techniques sont observables et entraînables.",
        "La boucle fermée vérifie que le message a été compris et exécuté.",
        "Une aide cognitive n’est efficace que si l’équipe s’y est entraînée.",
        "La cognition se distribue dans le temps, l’équipe et l’environnement.",
        "Une culture juste transforme l’erreur non intentionnelle en apprentissage.",
      ],
      eclair: [
        "Erreur : écart de processus, avec ou sans dommage.",
        "Barrières poreuses : empêcher l’alignement des failles.",
        "Confirmation : chercher ce qui contredit.",
        "Ancrage : réviser l’hypothèse devant une donnée nouvelle.",
        "ANTS : tâches, équipe, situation, décision.",
        "Message : destinataire, verbe, chiffre, unité, répétition, confirmation.",
        "Code reader : un lit, les autres agissent.",
        "Cognition : individuel + environnement + social + anticipation + aide.",
        "Checklist : vérifier la pratique réelle, pas seulement la case.",
        "Culture : humilité, discipline, travail d’équipe.",
      ],
    },
  };
}

const card = (recto, verso, sourceBlocks) => ({ recto, verso, sourceBlocks });
function buildFlashcards() {
  const D = [
    [
      "Comment définir une erreur de soins sans regarder son résultat ?",
      "Un écart de planification ou d’exécution pouvant survenir avec ou sans dommage.",
      S(7),
    ],
    [
      "Quelle différence sépare omission et commission ?",
      "L’omission est une action attendue non faite ; la commission est une action réalisée.",
      S(7),
    ],
    [
      "Quel objet étudient les facteurs humains ?",
      "Les interactions entre personnes, équipements, environnement et organisation.",
      S(8, 15),
    ],
    [
      "Quel objectif poursuit l’ergonomie du système ?",
      "Optimiser simultanément le bien-être humain et la performance globale.",
      S(8),
    ],
    [
      "Quelle proportion d’interventions avait un événement indésirable ?",
      "9,2 % dans la revue regroupant près de 75 000 patients.",
      S(3, 4),
    ],
    [
      "Quelle part des événements chirurgicaux était évitable ?",
      "43,5 % dans la revue rapportée.",
      S(4),
    ],
    [
      "Combien d’activités quotidiennes étaient observées en réanimation ?",
      "En moyenne 178 activités par patient et par jour.",
      S(16, 18),
    ],
    [
      "Quel taux d’erreur était observé parmi ces activités ?",
      "0,95 %, dont l’impact cumulé devient important avec la complexité.",
      S(17),
    ],
    [
      "Pourquoi multiplier les intervenants augmente-t-il le risque ?",
      "Chaque interface ajoute des transmissions, coordinations et possibilités d’écart.",
      S(16, 18),
    ],
    [
      "Quelle partie de l’humain James Reason propose-t-il de changer ?",
      "Les conditions dans lesquelles il travaille, plutôt que sa nature faillible.",
      S(19, 23),
    ],
    [
      "Qu’est-ce qu’un risque ?",
      "L’éventualité d’un événement susceptible de causer un dommage.",
      S(22),
    ],
    [
      "Un accident implique-t-il toujours une erreur ?",
      "Non ; une anaphylaxie peut survenir sans erreur de soins.",
      S(22),
    ],
    [
      "Que représentent les trous du modèle du gruyère ?",
      "Les failles propres à chaque barrière de sécurité.",
      S(23),
    ],
    [
      "Quand une trajectoire d’accident traverse-t-elle le système ?",
      "Lorsque les failles de plusieurs barrières s’alignent.",
      S(23),
    ],
    [
      "Comment une seule barrière peut-elle éviter l’accident ?",
      "En interrompant la trajectoire même si les autres défenses sont poreuses.",
      S(23),
    ],
    [
      "Quel danger présente une barrière mal conçue ?",
      "Elle augmente la charge sans réduire le taux d’erreur.",
      S(24, 25),
    ],
    [
      "Quels deux facteurs majorent couramment les erreurs ?",
      "Une charge de travail excessive et les interruptions de tâche.",
      S(24),
    ],
    [
      "Qu’est-ce qu’un biais cognitif ?",
      "Un raisonnement non rationnel influençant diagnostic ou traitement.",
      S(26, 27),
    ],
    [
      "Comment agit le biais de confirmation ?",
      "Il privilégie les informations compatibles avec l’hypothèse initiale.",
      S(28, 29),
    ],
    [
      "Quelle question combat la confirmation ?",
      "Quelle donnée présente pourrait rendre mon diagnostic faux ?",
      S(28, 29),
    ],
    [
      "Comment reconnaître un biais d’ancrage ?",
      "Les nouvelles informations discordantes ne modifient plus le plan initial.",
      S(30),
    ],
    [
      "Comment agit le biais de commission ?",
      "Il pousse à agir sans indication plutôt qu’à accepter l’inaction.",
      S(31),
    ],
    [
      "Quel mode de pensée reconnaît rapidement un schéma ?",
      "Le raisonnement réflexo-intuitif.",
      S(31),
    ],
    [
      "Quel mode compare explicitement hypothèses et stratégies ?",
      "Le raisonnement analytique.",
      S(31),
    ],
    [
      "Quand déclencher une réanalyse volontaire ?",
      "Devant une évolution discordante ou l’échec du traitement attendu.",
      S(27, 31),
    ],
    [
      "Quelle erreur organisationnelle a marqué le cas Libby Zion ?",
      "Des internes épuisés, non supervisés, ont assuré sa prise en charge.",
      S(33, 35),
    ],
    [
      "Quelle réforme a suivi le cas Libby Zion ?",
      "La limitation du temps de travail des internes aux États-Unis.",
      S(34, 35),
    ],
    [
      "Quel objectif a été perdu dans le cas Elaine Bromiley ?",
      "L’oxygénation, pendant une voie aérienne impossible prolongée.",
      S(36, 37),
    ],
    [
      "Quels déficits d’équipe ont marqué le cas Bromiley ?",
      "Leadership, conscience de situation, communication et priorisation insuffisants.",
      S(36, 37),
    ],
    [
      "Quels outils ont été transférés de l’aviation vers la santé ?",
      "Simulation, checklist, repos, gestion de crise, enregistrement et retour d’expérience.",
      S(38, 57),
    ],
    [
      "Pourquoi la checklist aéronautique a-t-elle été créée ?",
      "Après l’écrasement d’un prototype B17 lié à la complexité des vérifications.",
      S(41, 45),
    ],
    [
      "Quand la checklist a-t-elle gagné le bloc opératoire ?",
      "Dans les années 2000 avec les travaux de l’OMS sur la chirurgie sûre.",
      S(44, 45),
    ],
    [
      "Quel problème a motivé la régulation du temps de travail ?",
      "Les erreurs liées à la fatigue dans les activités à risque.",
      S(48, 49),
    ],
    [
      "Que signifie ACRM ?",
      "Gestion des ressources en situation de crise en anesthésie.",
      S(50, 51),
    ],
    [
      "À quoi sert une boîte noire au bloc ?",
      "À enregistrer l’activité pour analyser objectivement les événements.",
      S(52, 53),
    ],
    [
      "Quel intérêt a le retour d’expérience anonymisé ?",
      "Diffuser les apprentissages et éviter la récurrence d’un incident.",
      S(54, 55),
    ],
    [
      "Quelles compétences complètent savoir et savoir-faire ?",
      "Les compétences non techniques, parfois appelées savoir-être.",
      S(58, 61),
    ],
    [
      "Quels sont les quatre domaines de l’ANTS ?",
      "Gestion des tâches, équipe, conscience de situation et prise de décision.",
      S(60, 64),
    ],
    ["Combien d’items comprend l’ANTS ?", "15 items.", S(61, 64)],
    [
      "Quelle est la note maximale de l’ANTS ?",
      "60 points, chaque item étant noté de 1 à 4.",
      S(61),
    ],
    [
      "Que signifie une note ANTS de 1 ?",
      "Un comportement qui met le patient en danger.",
      S(61),
    ],
    [
      "Que signifie une note ANTS de 4 ?",
      "Un comportement pouvant servir d’exemple.",
      S(61),
    ],
    [
      "Où peut-on observer les compétences non techniques ?",
      "Dans les soins réels comme dans une simulation.",
      S(60, 64),
    ],
    [
      "Quel comportement traduit une bonne prise de décision ?",
      "Énoncer les options et les discuter avec l’équipe si nécessaire.",
      S(64, 65),
    ],
    [
      "Quel comportement partage la conscience de situation ?",
      "Informer clairement l’équipe du sérieux de la situation.",
      S(64, 65),
    ],
    [
      "Quel premier élément rend un ordre explicite ?",
      "Nommer son destinataire.",
      S(64, 67),
    ],
    [
      "Pourquoi accompagner un chiffre de son unité ?",
      "Pour éviter une interprétation ou une dose ambiguë.",
      S(66, 67),
    ],
    [
      "Pourquoi limiter les acronymes en crise ?",
      "Ils peuvent être compris différemment selon les professionnels.",
      S(66, 67),
    ],
    [
      "Qu’est-ce qu’une boucle de communication fermée ?",
      "Demande, répétition par le destinataire, confirmation puis annonce d’exécution.",
      S(64, 67),
    ],
    [
      "La communication non verbale influence-t-elle la sécurité ?",
      "Oui ; langage corporel et ton modifient la réception du message.",
      S(67),
    ],
    [
      "À quoi sert une aide cognitive en crise ?",
      "À garantir les étapes clés sans dépendre uniquement de la mémoire.",
      S(68, 76),
    ],
    [
      "Quelle formation prépare à l’usage d’une aide cognitive ?",
      "La simulation avec utilisation réelle du support.",
      S(68, 70),
    ],
    [
      "Quel score obtenait le groupe avec aide cognitive ?",
      "16 actions correctes sur 21.",
      S(70, 75),
    ],
    [
      "Quel score obtenait le groupe travaillant de mémoire ?",
      "8,8 actions sur 21 malgré une formation récente identique.",
      S(70, 75),
    ],
    [
      "Que signifie CMAT ?",
      "Cognitive Aids in Medicine Assessment Tool.",
      S(76),
    ],
    [
      "Quel rôle tient le code reader ?",
      "Il lit l’aide pendant que les autres réalisent les gestes.",
      S(77),
    ],
    [
      "Pourquoi séparer lecture et exécution ?",
      "Pour diminuer la charge cognitive de la personne qui agit.",
      S(77),
    ],
    [
      "Qu’est-ce que la cognition individuelle ?",
      "Les savoirs, savoir-faire et savoir-être internes du sujet.",
      S(78, 79),
    ],
    [
      "Pourquoi la cognition est-elle dite située ?",
      "L’action dépend des interactions avec l’environnement et les autres.",
      S(79, 87),
    ],
    [
      "Quels sont les cinq axes de la cognition située ?",
      "Individuel, environnement, social, anticipation et aide cognitive.",
      S(79, 87),
    ],
    [
      "Comment distribuer la cognition dans le temps ?",
      "Anticiper calculs, doses, matériel et plans de secours.",
      S(80, 81),
    ],
    [
      "Quel calcul illustre l’anticipation pédiatrique ?",
      "Atropine 20 µg/kg : 90 µg pour un enfant de 4,5 kg.",
      S(81),
    ],
    [
      "Comment distribuer la cognition socialement ?",
      "Partager informations, hypothèses, décisions et connaissances dans l’équipe.",
      S(82, 83),
    ],
    [
      "Comment une alarme augmente-t-elle la cognition ?",
      "Elle rend une anomalie perceptible et oriente l’attention vers une action.",
      S(79),
    ],
    [
      "Quel apport cognitif fournit une checklist ?",
      "Une conduite à tenir externe qui évite un rappel intégral de mémoire.",
      S(84, 85),
    ],
    [
      "Que permet la simulation haute fidélité au-delà du geste ?",
      "Observer décision, communication, cohésion et compétences non techniques.",
      S(90, 93),
    ],
    [
      "Quel temps pédagogique explore les déterminants de l’action ?",
      "Le débriefing après la simulation.",
      S(90, 92),
    ],
    [
      "Les bénéfices de la simulation sur les patients sont-ils tous établis ?",
      "Non, les effets cliniques directs restent difficiles à démontrer.",
      S(93, 94),
    ],
    [
      "Quand a été signée la déclaration d’Helsinki sur la sécurité ?",
      "Le 14 juin 2010.",
      S(99, 105),
    ],
    [
      "Avec quel autre texte ne faut-il pas confondre cette déclaration ?",
      "La déclaration éthique de l’Association médicale mondiale.",
      S(100, 102),
    ],
    [
      "Où les normes minimales de monitorage doivent-elles s’appliquer ?",
      "Au bloc opératoire et en salle de réveil.",
      S(104, 107),
    ],
    [
      "Quels protocoles de voie aérienne doivent être disponibles ?",
      "Intubation difficile et échec d’intubation.",
      S(106, 108),
    ],
    [
      "Quel outil OMS la déclaration d’Helsinki soutient-elle ?",
      "La liste de contrôle pour une chirurgie sûre.",
      S(109),
    ],
    [
      "Quelle fréquence de rapport local de sécurité est demandée ?",
      "Un rapport annuel.",
      S(110, 112),
    ],
    [
      "Quelles données alimentent ce rapport ?",
      "Mesures de sécurité, résultats, morbidité, mortalité et incidents critiques.",
      S(110, 112),
    ],
    [
      "Qu’est-ce que le modèle de résilience du risque ?",
      "Une exposition recherchée, dominée par l’expertise et l’atténuation.",
      S(116, 120),
    ],
    [
      "Quel exemple médical correspond au modèle de résilience ?",
      "La chirurgie de sauvetage dans un centre de traumatologie.",
      S(119, 120),
    ],
    [
      "Qu’est-ce que le modèle d’ultrasécurité ?",
      "Une exposition exclue, dominée par les procédures et la prévention.",
      S(121, 122),
    ],
    [
      "Quel exemple de soins relève de l’ultrasécurité ?",
      "La transfusion sanguine.",
      S(121, 122),
    ],
    [
      "Comment fonctionne une organisation hautement fiable ?",
      "Le groupe accepte le risque et s’adapte aux situations imprévues.",
      S(123, 125),
    ],
    [
      "Quel modèle convient à la médecine périopératoire ?",
      "L’organisation hautement fiable centrée sur l’intelligence collective.",
      S(123, 125),
    ],
    [
      "Pourquoi ne pas punir une erreur non intentionnelle ?",
      "La peur la dissimule et empêche l’apprentissage collectif.",
      S(126, 131),
    ],
    [
      "Comment transformer une erreur en barrière future ?",
      "La déclarer, l’analyser puis diffuser les enseignements.",
      S(129, 131),
    ],
    [
      "Pourquoi se méfier d’un consensus apparent ?",
      "La polarisation du groupe peut étouffer une information contradictoire.",
      S(132, 134),
    ],
    [
      "Quel outil fait émerger une opinion minoritaire ?",
      "Un tour de table systématique ou un avocat du diable.",
      S(132, 134),
    ],
    [
      "Quel rythme de communication est le plus efficace ?",
      "Des échanges courts et fréquents plutôt que longs et rares.",
      S(133, 134),
    ],
    [
      "Qu’est-ce qu’une culture de sécurité ?",
      "Des manières de penser et d’agir partagées face au risque.",
      S(135, 136),
    ],
    [
      "Quel marqueur vaut mieux que le seul taux de complications ?",
      "La capacité à sauver après une complication.",
      S(136, 137),
    ],
    [
      "Pourquoi auditer une checklist par observation directe ?",
      "Une case cochée ne garantit pas que les items ont été réellement vérifiés.",
      S(137),
    ],
    [
      "Qui doit participer à l’implantation d’un outil de sécurité ?",
      "Les professionnels de terrain qui l’utiliseront.",
      S(137),
    ],
    [
      "Où réside le savoir dans une organisation complexe ?",
      "Dans les interactions sociales, l’environnement et les ressources externes.",
      S(138, 139),
    ],
    [
      "Que signifie connaître les limites de sa compétence ?",
      "Savoir quand demander une expertise ou utiliser une ressource externe.",
      S(138, 139),
    ],
    [
      "Quelle valeur permet d’accepter une procédure de sécurité ?",
      "L’humilité, qui reconnaît la possibilité de se tromper.",
      S(139),
    ],
    [
      "Quelle valeur garantit l’application quotidienne des règles ?",
      "La discipline.",
      S(139),
    ],
    [
      "Quelle valeur répartit les rôles et les ressources ?",
      "Le travail d’équipe.",
      S(139),
    ],
    [
      "Quel est le premier objectif d’un leadership en crise ?",
      "Énoncer une priorité clinique claire et partageable.",
      S(36, 37),
    ],
    [
      "Que doit annoncer un membre qui termine une action ?",
      "L’exécution et son résultat afin de fermer la boucle.",
      S(64, 67),
    ],
    [
      "Quel antidote organisationnel combat l’ancrage collectif ?",
      "Une réévaluation programmée avec recherche active d’informations nouvelles.",
      S(27, 31),
    ],
    [
      "Pourquoi préparer une dose avant l’induction ?",
      "L’anticipation libère des ressources cognitives pendant l’urgence.",
      S(79, 81),
    ],
    [
      "Que mesure réellement une compétence non technique ?",
      "Un comportement observable qui influence la sécurité de l’action.",
      S(58, 64),
    ],
    [
      "Quel principe distingue culture juste et impunité ?",
      "Analyser l’écart non intentionnel sans tolérer un comportement délibérément dangereux.",
      S(126, 134),
    ],
    [
      "Pourquoi une procédure seule ne suffit-elle pas ?",
      "Son efficacité dépend de l’appropriation, de l’usage réel et de la charge créée.",
      S(24, 25),
    ],
    [
      "Quel réflexe protège face à une situation atypique ?",
      "Ralentir, expliciter les hypothèses et passer à un raisonnement analytique.",
      S(27, 31),
    ],
  ];
  return D.map((x) => card(...x));
}

const T = (text, justification) => [true, text, justification];
const F = (text, justification) => [false, text, justification];
const qcm = (
  enonce,
  sourceBlocks,
  correction_generale,
  items,
  newInformation = null,
) => ({
  enonce: newInformation ? `${newInformation} ${enonce}` : enonce,
  format: "qcm",
  sourceBlocks,
  correction_generale,
  items: items.map(([is_correct, item, justification], i) => ({
    lettre: "ABCDE"[i],
    enonce: item,
    is_correct,
    justification:
      justification.length < 35
        ? `${justification} ${correction_generale}`
        : justification,
  })),
  ...(newInformation ? { newInformation } : {}),
});
const qroc = (
  enonce,
  reponse_attendue,
  sourceBlocks,
  correction_generale,
  newInformation = null,
) => ({
  enonce: newInformation ? `${newInformation} ${enonce}` : enonce,
  format: "qroc",
  reponse_attendue,
  items: [],
  sourceBlocks,
  correction_generale,
  ...(newInformation ? { newInformation } : {}),
});

const IQ = [
  {
    title: "Erreur et complexité",
    questions: [
      qcm(
        "Quelles affirmations définissent utilement l’erreur de soins ?",
        S(3, 15),
        "L’analyse moderne se centre sur les écarts du processus plutôt que sur la seule gravité de l’issue.",
        [
          T(
            "Une omission peut constituer une erreur.",
            "Une action attendue non réalisée crée un écart de processus.",
          ),
          T(
            "Une mauvaise exécution d’un bon plan est une erreur.",
            "Le plan pertinent n’empêche pas une défaillance de réalisation.",
          ),
          T(
            "Un mauvais plan peut conduire à une erreur.",
            "La planification inadéquate appartient au mécanisme de l’erreur.",
          ),
          F(
            "Toute complication prouve une erreur préalable.",
            "Un événement comme l’anaphylaxie peut survenir malgré des soins conformes.",
          ),
          F(
            "Une erreur entraîne nécessairement un dommage.",
            "De nombreux écarts sont interceptés avant tout préjudice.",
          ),
        ],
      ),
      qcm(
        "Quels éléments appartiennent au champ des facteurs humains ?",
        S(8, 15),
        "Le facteur humain étudie un système d’interactions, et non les seules qualités psychologiques d’un soignant.",
        [
          T(
            "Les relations entre professionnels.",
            "La coordination sociale modifie directement le résultat du travail.",
          ),
          T(
            "L’ergonomie des équipements.",
            "Une commande ou une alarme influence la perception et l’action.",
          ),
          T(
            "L’organisation du processus de soins.",
            "Les règles et ressources façonnent les conditions de performance.",
          ),
          T(
            "L’espace dans lequel se déroule l’activité.",
            "La disposition physique facilite ou gêne l’accès aux ressources.",
          ),
          F(
            "La culpabilité morale comme variable principale.",
            "L’approche cherche des mécanismes modifiables plutôt qu’un blâme individuel.",
          ),
        ],
      ),
      qcm(
        "Pourquoi un taux d’erreur inférieur à 1 % reste-t-il préoccupant en réanimation ?",
        S(16, 18),
        "Une très forte fréquence d’activités transforme une faible probabilité unitaire en nombreux écarts cumulés.",
        [
          T(
            "Un patient peut subir environ 178 activités quotidiennes.",
            "Chaque activité ajoute une nouvelle occasion de défaillance.",
          ),
          T(
            "Les interfaces se multiplient avec les intervenants.",
            "Plus de transmissions exigent davantage de coordination fiable.",
          ),
          F(
            "Une activité rare concentre toutes les erreurs.",
            "La complexité provient au contraire de la répétition de nombreuses interactions.",
          ),
          F(
            "Le taux mesuré garantit que chaque erreur est bénigne.",
            "La fréquence ne renseigne pas sur la gravité potentielle d’un écart.",
          ),
          T(
            "La sécurité doit porter sur le système complet.",
            "Une action isolée ne représente qu’une fraction de la trajectoire de soins.",
          ),
        ],
      ),
      qcm(
        "Quelles distinctions structurent une analyse d’événement ?",
        S(19, 25),
        "Risque, incident, accident et erreur sont liés mais ne sont pas synonymes.",
        [
          T(
            "Un risque peut exister sans incident.",
            "L’exposition ne produit pas automatiquement un événement.",
          ),
          T(
            "Un incident peut ne pas atteindre le patient.",
            "Une barrière peut l’intercepter avant le dommage.",
          ),
          F(
            "Tout accident résulte d’une faute intentionnelle.",
            "Un accident peut même survenir sans erreur identifiable.",
          ),
          T(
            "Limiter une erreur réduit une voie vers l’accident.",
            "Diminuer un mécanisme d’écart diminue une partie du risque.",
          ),
          F(
            "Le résultat suffit à reconstituer le processus.",
            "Une issue identique peut suivre des trajectoires très différentes.",
          ),
        ],
      ),
      qcm(
        "Quelles données justifient une action institutionnelle sur la sécurité ?",
        S(3, 4),
        "La fréquence des événements et leur part évitable rendent l’amélioration du système prioritaire.",
        [
          T(
            "Des événements indésirables ont concerné 9,2 % des interventions étudiées.",
            "La revue regroupe huit études et près de 75 000 patients.",
          ),
          T(
            "Environ 43,5 % de ces événements étaient évitables.",
            "Cette proportion suggère une marge importante de prévention.",
          ),
          F(
            "Tous les décès hospitaliers sont évitables.",
            "La maladie naturelle peut conduire au décès malgré des soins adaptés.",
          ),
          F(
            "Seuls les événements mortels méritent une analyse.",
            "Un incident sans dommage peut révéler une barrière fragile.",
          ),
          T(
            "Des définitions variables compliquent les comparaisons.",
            "Un même cas peut être classé différemment selon l’observateur.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Barrières et biais",
    questions: [
      qcm(
        "Que montre le modèle des barrières de James Reason ?",
        S(19, 25),
        "La sécurité résulte d’une succession de défenses imparfaites dont les failles ne doivent pas s’aligner.",
        [
          T(
            "Chaque barrière possède des points faibles.",
            "Aucune défense organisationnelle n’est totalement infaillible.",
          ),
          T(
            "Une seule défense fonctionnelle peut arrêter la trajectoire.",
            "L’interception à un niveau suffit à prévenir l’incident.",
          ),
          T(
            "Les erreurs latentes doivent être recherchées.",
            "Elles restent invisibles jusqu’à leur combinaison avec d’autres failles.",
          ),
          F(
            "Le professionnel placé en dernier porte toute la causalité.",
            "L’événement résulte généralement de facteurs distribués dans le système.",
          ),
          F(
            "Ajouter des règles améliore toujours la sécurité.",
            "Une règle inefficace peut seulement augmenter la charge de travail.",
          ),
        ],
      ),
      qcm(
        "Quelles situations illustrent un biais de confirmation ?",
        S(26, 31),
        "La confirmation sélectionne les données qui confortent l’idée initiale et sous-pondère les contradictions.",
        [
          T(
            "Attribuer toute hypotension à l’anesthésie déjà suspectée.",
            "L’hypothèse favorite filtre les informations ultérieures.",
          ),
          T(
            "Écarter un saignement parce qu’un premier examen était normal.",
            "Une donnée ancienne compatible prend le pas sur l’évolution.",
          ),
          F(
            "Lister trois diagnostics concurrents.",
            "Cette démarche réduit justement la fermeture sur une seule hypothèse.",
          ),
          F(
            "Demander ce qui invaliderait le diagnostic retenu.",
            "La recherche d’une réfutation combat la confirmation.",
          ),
          T(
            "Interpréter chaque nouvelle mesure dans le même sens.",
            "Le tri orienté empêche une révision impartiale du tableau.",
          ),
        ],
      ),
      qcm(
        "Quels comportements signalent un ancrage ?",
        S(27, 31),
        "L’ancrage maintient le cadre initial malgré une évolution qui devrait imposer une nouvelle représentation.",
        [
          T(
            "Poursuivre le même traitement malgré son inefficacité.",
            "L’absence de réponse ne déclenche pas la réévaluation attendue.",
          ),
          T(
            "Ignorer une nouvelle donnée discordante.",
            "L’information menaçante est rejetée au lieu d’être intégrée.",
          ),
          F(
            "Programmer un point de réévaluation.",
            "Ce jalon crée une occasion volontaire de quitter l’interprétation initiale.",
          ),
          T(
            "Décrire la situation avec les mots du diagnostic de départ.",
            "Le langage peut figer la représentation collective.",
          ),
          F(
            "Solliciter l’avis d’un collègue non impliqué.",
            "Un regard neuf aide à rompre le cadre établi.",
          ),
        ],
      ),
      qcm(
        "Quelles décisions relèvent d’un biais de commission ?",
        S(27, 31),
        "Le biais de commission valorise l’action pour elle-même, même lorsque l’abstention serait plus sûre.",
        [
          T(
            "Injecter un médicament sans indication pour ne pas rester inactif.",
            "Le besoin psychologique d’agir remplace l’objectif clinique.",
          ),
          F(
            "Surveiller étroitement avant de traiter une anomalie mineure.",
            "L’abstention raisonnée peut constituer la meilleure stratégie.",
          ),
          T(
            "Multiplier les gestes devant une situation mal comprise.",
            "L’escalade d’actions augmente le risque sans clarifier la cause.",
          ),
          F(
            "Comparer explicitement action et non-action.",
            "Cette comparaison limite la préférence automatique pour l’intervention.",
          ),
          F(
            "Suspendre un traitement devenu inutile.",
            "L’arrêt adapte la conduite à un objectif réévalué.",
          ),
        ],
      ),
      qcm(
        "Comment réduire l’impact des biais au cours d’une crise ?",
        S(26, 31),
        "La verbalisation, la contradiction et le passage volontaire au mode analytique ouvrent la représentation clinique.",
        [
          T(
            "Énoncer le diagnostic de travail.",
            "Une hypothèse explicite devient contestable par l’équipe.",
          ),
          T(
            "Préciser la donnée qui ferait changer de plan.",
            "Un critère de sortie empêche l’adhésion illimitée à l’idée initiale.",
          ),
          T(
            "Demander une hypothèse alternative.",
            "Une autre représentation réduit la fermeture prématurée.",
          ),
          T(
            "Réévaluer à intervalle défini.",
            "Le temps de pause permet d’intégrer l’évolution réelle.",
          ),
          F(
            "Interdire toute intuition clinique.",
            "L’intuition reste utile dans les schémas familiers si elle est contrôlée.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Équipe et ANTS",
    questions: [
      qcm(
        "Quels domaines appartiennent aux compétences non techniques de l’anesthésiste ?",
        S(58, 65),
        "Les compétences non techniques rendent l’expertise mobilisable collectivement dans une situation réelle.",
        [
          T(
            "Gestion des tâches.",
            "Prioriser et distribuer le travail influencent la sécurité.",
          ),
          T(
            "Travail d’équipe.",
            "Coordination et soutien mutuel complètent les gestes individuels.",
          ),
          T(
            "Conscience de la situation.",
            "Percevoir, comprendre et anticiper guide l’action.",
          ),
          T(
            "Prise de décision.",
            "Comparer les options et réévaluer leurs effets est observable.",
          ),
          F(
            "Vitesse d’intubation comme seul domaine.",
            "Il s’agit d’une performance technique, insuffisante à elle seule.",
          ),
        ],
      ),
      qcm(
        "Quelles caractéristiques décrivent l’ANTS ?",
        S(60, 64),
        "L’ANTS transforme des comportements non techniques en observables utilisables pour l’apprentissage.",
        [
          T(
            "Il comprend quinze items.",
            "Les items couvrent les grands domaines de performance collective.",
          ),
          T(
            "Chaque item est coté de 1 à 4.",
            "L’échelle distingue danger, insuffisance, bon niveau et exemplarité.",
          ),
          T(
            "Son score maximal est de 60.",
            "Quinze items à quatre points produisent ce maximum.",
          ),
          F(
            "Il mesure uniquement les connaissances théoriques.",
            "Il évalue des comportements visibles en action.",
          ),
          T(
            "Il peut être utilisé en simulation.",
            "Le scénario rend les comportements observables sans exposer un patient.",
          ),
        ],
      ),
      qcm(
        "Quels comportements améliorent la conscience partagée de la situation ?",
        S(36, 37),
        "Une représentation commune nécessite des messages explicites sur la gravité, les changements et les priorités.",
        [
          T(
            "Annoncer clairement que l’oxygénation devient prioritaire.",
            "La hiérarchie des objectifs oriente toutes les actions.",
          ),
          T(
            "Dire qu’une stratégie a échoué.",
            "Le constat empêche sa répétition silencieuse.",
          ),
          T(
            "Partager les valeurs et leur tendance.",
            "Une donnée dynamique décrit mieux l’évolution qu’un chiffre isolé.",
          ),
          F(
            "Supposer que chacun voit la même chose.",
            "Les membres disposent d’angles et d’informations différents.",
          ),
          F(
            "Réserver les doutes au débriefing.",
            "Une incertitude utile doit être communiquée pendant la décision.",
          ),
        ],
      ),
      qcm(
        "Quelles fonctions relèvent du leadership en crise ?",
        S(36, 37),
        "Le leader organise la cognition collective sans devoir réaliser lui-même tous les gestes.",
        [
          T(
            "Énoncer une priorité commune.",
            "L’équipe doit savoir quel résultat immédiat elle cherche.",
          ),
          T(
            "Attribuer les rôles par leur nom.",
            "Une mission nominative évite les responsabilités diffuses.",
          ),
          T(
            "Demander de l’aide précocement.",
            "Le renfort élargit les ressources avant l’épuisement des options.",
          ),
          T(
            "Organiser une réévaluation.",
            "Le plan doit être confronté à ses effets réels.",
          ),
          F(
            "Conserver seul toutes les informations.",
            "Une information non partagée ne peut soutenir l’équipe.",
          ),
        ],
      ),
      qcm(
        "Que révèle le cas d’Elaine Bromiley ?",
        S(36, 37),
        "Une expertise technique élevée n’empêche pas l’échec si leadership, priorité et communication se désorganisent.",
        [
          T(
            "La voie aérienne difficile a persisté très longtemps.",
            "Trente-cinq minutes d’échec ont entraîné une hypoxie prolongée.",
          ),
          T(
            "La priorisation de l’oxygénation était insuffisante.",
            "Les tentatives ont dominé au détriment de l’objectif vital.",
          ),
          T(
            "La conscience collective de la gravité était altérée.",
            "L’équipe n’a pas réorienté assez tôt la stratégie.",
          ),
          F(
            "Une panne de matériel explique à elle seule l’événement.",
            "Le récit insiste sur les dysfonctionnements humains et collectifs.",
          ),
          F(
            "Le réveil tardif a évité toute séquelle.",
            "La patiente est décédée des conséquences postanoxiques.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Phraséologie",
    questions: [
      qcm(
        "Quelles règles rendent un ordre médical moins ambigu ?",
        S(64, 67),
        "Un ordre fermé associe destinataire, action, objet mesurable et vérification de compréhension.",
        [
          T(
            "Nommer le destinataire.",
            "Une demande adressée à tous risque de n’être prise par personne.",
          ),
          T(
            "Utiliser un verbe d’action précis.",
            "Le comportement attendu doit être directement identifiable.",
          ),
          T(
            "Associer une unité à chaque chiffre.",
            "Une valeur sans unité peut produire une erreur de dose.",
          ),
          F(
            "Accumuler les acronymes pour gagner du temps.",
            "Leur signification varie entre métiers et contextes.",
          ),
          T(
            "Demander une répétition de la consigne.",
            "Le retour permet de détecter une mauvaise compréhension.",
          ),
        ],
      ),
      qcm(
        "Quelles étapes ferment correctement une boucle de communication ?",
        S(64, 67),
        "La boucle n’est close que lorsque demande, compréhension et exécution sont toutes rendues visibles.",
        [
          T(
            "L’émetteur formule une demande nominative.",
            "La responsabilité de réception devient explicite.",
          ),
          T(
            "Le destinataire répète l’ordre.",
            "La reformulation vérifie le contenu réellement entendu.",
          ),
          T(
            "L’émetteur confirme ou corrige.",
            "Une discordance peut être réparée avant l’action.",
          ),
          T(
            "Le destinataire annonce l’exécution.",
            "Le leader sait que la tâche est terminée et en connaît le résultat.",
          ),
          F(
            "Le silence final vaut confirmation.",
            "Une absence de retour laisse l’état de la tâche inconnu.",
          ),
        ],
      ),
      qcm(
        "Quels éléments non verbaux peuvent dégrader un message correct ?",
        S(66, 67),
        "Le langage corporel et le ton modifient la crédibilité, l’urgence perçue et la possibilité de contradiction.",
        [
          T(
            "Un ton hésitant devant une urgence vitale.",
            "La forme peut minimiser la gravité pourtant décrite.",
          ),
          T(
            "Un regard qui exclut le destinataire.",
            "L’absence de contact rend l’adressage incertain.",
          ),
          T(
            "Une posture intimidante face à un junior.",
            "La hiérarchie peut empêcher l’expression d’une alerte.",
          ),
          F(
            "Une reformulation calme et explicite.",
            "Cette attitude sécurise la compréhension sans nier l’urgence.",
          ),
          F(
            "Une annonce brève de la priorité.",
            "La concision structurée facilite l’action collective.",
          ),
        ],
      ),
      qcm(
        "Comment favoriser une contradiction utile dans une équipe hiérarchisée ?",
        S(129, 134),
        "La sécurité exige des mécanismes qui autorisent une hypothèse minoritaire à devenir audible.",
        [
          T(
            "Faire un tour de table nominatif.",
            "Chaque membre dispose d’un espace explicite de parole.",
          ),
          T(
            "Désigner un avocat du diable.",
            "Le rôle légitime la recherche volontaire d’une faille.",
          ),
          F(
            "Demander uniquement l’avis des plus anciens.",
            "L’information pertinente peut appartenir au professionnel le moins senior.",
          ),
          T(
            "Valoriser une question qui remet le plan en cause.",
            "L’attitude interrogative aide à débusquer une incompréhension.",
          ),
          F(
            "Assimiler le consensus à une preuve.",
            "L’accord collectif peut refléter une polarisation plutôt qu’une analyse.",
          ),
        ],
      ),
      qcm(
        "Quels messages sont adaptés à une hémorragie en cours ?",
        S(64, 67),
        "Un message opérationnel décrit une action, une cible mesurable et le retour attendu.",
        [
          F(
            "Quelqu’un peut-il faire quelque chose ?",
            "La demande ne nomme ni personne ni action précise.",
          ),
          T(
            "Marie, injecte un gramme d’acide tranexamique IV.",
            "Destinataire, verbe, dose, unité et voie sont explicités.",
          ),
          T(
            "Paul, annonce la pression toutes les deux minutes.",
            "La mission de surveillance comporte une fréquence définie.",
          ),
          F(
            "Prépare le TXA habituel.",
            "L’abréviation et la dose implicite rendent l’ordre ambigu.",
          ),
          T(
            "Répète la dose avant de l’administrer.",
            "La reformulation intercepte une erreur de compréhension.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Aides cognitives",
    questions: [
      qcm(
        "Quelles conditions rendent une aide cognitive efficace ?",
        S(68, 77),
        "Le support doit être bien conçu, accessible et intégré à un comportement d’équipe entraîné.",
        [
          T(
            "Former les professionnels avant la crise.",
            "La découverte du support en urgence ralentirait son emploi.",
          ),
          T(
            "Le placer à proximité du lieu d’action.",
            "Une ressource inaccessible ne peut augmenter la cognition.",
          ),
          T(
            "Utiliser une structure lisible.",
            "La forme doit guider rapidement vers les actions prioritaires.",
          ),
          F(
            "La réserver au soignant qui réalise les gestes.",
            "Un lecteur distinct peut réduire la charge de l’opérateur.",
          ),
          T(
            "L’évaluer dans une simulation réaliste.",
            "Le test révèle les ambiguïtés et les problèmes d’usage.",
          ),
        ],
      ),
      qcm(
        "Que démontre l’étude simulée sur la toxicité des anesthésiques locaux ?",
        S(69, 75),
        "À connaissances comparables, une ressource externe a presque doublé le nombre d’actions correctement réalisées.",
        [
          T(
            "Les deux groupes avaient reçu la même formation théorique.",
            "La différence ne reposait pas sur un programme de connaissances différent.",
          ),
          T(
            "Le groupe avec aide obtenait 16 sur 21.",
            "Le support a permis de retrouver davantage d’étapes critiques.",
          ),
          T(
            "Le groupe de mémoire obtenait 8,8 sur 21.",
            "Une connaissance récente ne garantit pas son rappel sous pression.",
          ),
          F(
            "L’aide cognitive a supprimé la nécessité de formation.",
            "Le support complète l’apprentissage et ne le remplace pas.",
          ),
          F(
            "Les résultats étaient identiques entre les groupes.",
            "L’écart observé était au contraire majeur.",
          ),
        ],
      ),
      qcm(
        "Quels avantages offre un code reader ?",
        S(76, 77),
        "Le lecteur rend la progression explicite tout en laissant les opérateurs disponibles pour les gestes.",
        [
          T(
            "Il sépare lecture et exécution.",
            "Deux fonctions simultanées ne surchargent pas la même personne.",
          ),
          T(
            "Il annonce les étapes non encore réalisées.",
            "L’équipe visualise les actions restantes.",
          ),
          T(
            "Il peut signaler une omission.",
            "La comparaison au support repère une étape oubliée.",
          ),
          F(
            "Il devient automatiquement chef d’équipe.",
            "Lire la liste ne confère pas la responsabilité du leadership.",
          ),
          F(
            "Il remplace le raisonnement clinique.",
            "La situation doit toujours être interprétée et le support contextualisé.",
          ),
        ],
      ),
      qcm(
        "Quelles fonctions la simulation remplit-elle pour les facteurs humains ?",
        S(90, 94),
        "La simulation rend les comportements visibles, permet leur entraînement et soutient un débriefing structuré.",
        [
          T(
            "Observer la communication en situation dynamique.",
            "Les messages et leurs effets peuvent être rejoués au débriefing.",
          ),
          T(
            "Évaluer les compétences non techniques.",
            "Décision, équipe et conscience de situation deviennent observables.",
          ),
          T(
            "Entraîner l’usage d’une aide cognitive.",
            "Le support doit être manipulé avant l’événement réel.",
          ),
          T(
            "Améliorer la cohésion de l’équipe.",
            "L’expérience partagée facilite coordination et modèles mentaux communs.",
          ),
          F(
            "Prouver automatiquement une baisse de mortalité.",
            "Les effets directs sur les patients restent difficiles à établir.",
          ),
        ],
      ),
      qcm(
        "Quelles qualités le CMAT cherche-t-il à apprécier ?",
        S(76),
        "Une aide cognitive pertinente associe structure logique, caractéristiques physiques adaptées et contenu exploitable.",
        [
          T(
            "La structure de la conduite à tenir.",
            "L’ordre des étapes doit refléter les priorités de la crise.",
          ),
          T(
            "La lisibilité physique du support.",
            "Taille, contraste et disposition conditionnent l’accès rapide.",
          ),
          T(
            "Les caractéristiques fonctionnelles de l’aide.",
            "Le support doit correspondre au mode réel d’utilisation.",
          ),
          F(
            "Le prestige de l’auteur comme seul critère.",
            "L’autorité ne remplace pas une évaluation ergonomique.",
          ),
          F(
            "Le nombre maximal de pages.",
            "La longueur n’est pertinente qu’en fonction de l’usage en action.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Cognition située",
    questions: [
      qcm(
        "Quelles ressources composent la cognition située ?",
        S(78, 89),
        "La performance s’appuie sur l’individu mais aussi sur le temps, l’environnement, les autres et les supports.",
        [
          T(
            "Les savoirs et savoir-faire individuels.",
            "Les ressources internes restent une composante du système.",
          ),
          T(
            "L’anticipation avant l’action.",
            "Une préparation antérieure augmente la capacité disponible en crise.",
          ),
          T(
            "Les connaissances des autres membres.",
            "La communication distribue la cognition socialement.",
          ),
          T(
            "Les aides cognitives accessibles.",
            "Une information externe limite la dépendance à la mémoire.",
          ),
          F(
            "L’isolement décisionnel comme ressource.",
            "Se couper des autres réduit les possibilités de correction.",
          ),
        ],
      ),
      qcm(
        "Quelles actions distribuent la cognition dans le temps ?",
        S(79, 81),
        "L’anticipation transforme un calcul complexe futur en ressource immédiatement disponible.",
        [
          T(
            "Calculer une dose d’atropine avant l’induction.",
            "La charge arithmétique disparaît au moment de la bradycardie.",
          ),
          T(
            "Préparer la dilution correspondante.",
            "Le médicament peut être administré sans étape technique supplémentaire.",
          ),
          T(
            "Énoncer un plan de voie aérienne de secours.",
            "Une stratégie préparée accélère le changement de plan.",
          ),
          F(
            "Attendre l’urgence pour chercher le protocole.",
            "Cette conduite concentre la charge au pire moment.",
          ),
          F(
            "Reporter toute préparation au membre le plus junior.",
            "La délégation sans coordination ne garantit pas la disponibilité réelle.",
          ),
        ],
      ),
      qcm(
        "Quelles situations illustrent une cognition distribuée socialement ?",
        S(82, 85),
        "Le groupe augmente sa performance lorsque les informations individuelles circulent et modifient la décision.",
        [
          T(
            "Un infirmier signale une tendance tensionnelle oubliée.",
            "Une perception individuelle enrichit le modèle collectif.",
          ),
          T(
            "Un anesthésiste demande une hypothèse alternative.",
            "La ressource cognitive d’un collègue corrige une représentation figée.",
          ),
          T(
            "Le chirurgien annonce l’importance du saignement.",
            "L’information du champ opératoire change l’interprétation hémodynamique.",
          ),
          F(
            "Chaque professionnel garde ses données jusqu’à la fin.",
            "La rétention d’information empêche toute distribution sociale.",
          ),
          T(
            "L’équipe discute les options avant de choisir.",
            "La comparaison collective mobilise plusieurs expertises.",
          ),
        ],
      ),
      qcm(
        "Comment l’environnement peut-il augmenter ou réduire la cognition ?",
        S(78, 87),
        "Une interface rend certaines informations et actions évidentes, tandis qu’une mauvaise ergonomie les masque.",
        [
          T(
            "Une alarme hiérarchisée attire l’attention sur une menace.",
            "Le signal oriente la perception vers un changement pertinent.",
          ),
          T(
            "Un bouton clairement identifié suggère l’action attendue.",
            "La commande devient une ressource cognitive située.",
          ),
          F(
            "Des seringues identiques non étiquetées facilitent l’action.",
            "L’indistinction augmente au contraire le risque de substitution.",
          ),
          T(
            "Un chariot standardisé accélère la recherche.",
            "La position constante réduit la charge de localisation.",
          ),
          F(
            "Un écran saturé d’alarmes améliore toujours la vigilance.",
            "Une surcharge peut produire fatigue d’alarme et perte de signal.",
          ),
        ],
      ),
      qcm(
        "Pourquoi reconnaître ses limites constitue-t-il une compétence ?",
        S(136, 139),
        "La compétence inclut la capacité à mobiliser une ressource externe quand l’expertise individuelle ne suffit plus.",
        [
          T(
            "Cela déclenche une demande d’aide adaptée.",
            "Le renfort complète les savoirs et gestes manquants.",
          ),
          T(
            "Cela évite d’assumer seul un acte non maîtrisé.",
            "Une responsabilité excessive expose le patient à une défaillance prévisible.",
          ),
          F(
            "Cela impose de renoncer à toute situation difficile.",
            "Reconnaître une limite permet au contraire d’organiser la réponse.",
          ),
          T(
            "Cela utilise la cognition distribuée.",
            "L’expertise du groupe devient une composante de l’action.",
          ),
          F(
            "Cela diminue nécessairement l’autonomie professionnelle.",
            "L’autonomie sûre comprend l’emploi raisonné des ressources disponibles.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Culture de sécurité",
    questions: [
      qcm(
        "Quels engagements institutionnels figurent dans la déclaration d’Helsinki ?",
        S(99, 115),
        "Le cadre associe normes cliniques, protocoles, mesure des résultats et apprentissage collectif.",
        [
          T(
            "Respecter un monitorage minimal au bloc et en réveil.",
            "La continuité des exigences couvre toute la période périopératoire.",
          ),
          T(
            "Disposer de protocoles pour les crises majeures.",
            "Voie aérienne, anaphylaxie, hémorragie et toxicité locale doivent être préparées.",
          ),
          T(
            "Soutenir la checklist de chirurgie sûre.",
            "La vérification collective constitue une barrière standardisée.",
          ),
          T(
            "Produire un rapport annuel de sécurité.",
            "La mesure locale rend les progrès et les lacunes visibles.",
          ),
          F(
            "Réserver les audits aux autorités extérieures.",
            "Chaque établissement doit contribuer aux audits et notifications reconnus.",
          ),
        ],
      ),
      qcm(
        "Quelles caractéristiques distinguent les trois modèles de gestion du risque ?",
        S(116, 125),
        "Résilience, ultrasécurité et haute fiabilité diffèrent par l’exposition acceptée, le pouvoir et le mode de récupération.",
        [
          T(
            "La résilience valorise l’expertise face au risque recherché.",
            "Le héros et l’atténuation dominent dans les activités exposées.",
          ),
          T(
            "L’ultrasécurité cherche à exclure le risque.",
            "Les procédures et la prévention structurent ce modèle.",
          ),
          T(
            "La haute fiabilité accepte un risque non recherché.",
            "Le groupe se prépare à récupérer les situations imprévues.",
          ),
          F(
            "La médecine périopératoire exclut tout imprévu.",
            "Elle correspond mieux à une organisation hautement fiable.",
          ),
          F(
            "Les trois modèles donnent le même pouvoir aux acteurs.",
            "Experts, régulateurs ou collectif dominent selon le modèle.",
          ),
        ],
      ),
      qcm(
        "Quelles métarègles renforcent une culture d’apprentissage ?",
        S(126, 134),
        "Une organisation fiable protège la déclaration, organise la contradiction et maintient des échanges fréquents.",
        [
          T(
            "Ne pas punir l’erreur non intentionnelle.",
            "La sécurité dépend de la possibilité de révéler les écarts.",
          ),
          T(
            "Diffuser les enseignements d’un incident.",
            "L’expérience d’une équipe devient une barrière pour les autres.",
          ),
          T(
            "Se méfier du consensus apparent.",
            "L’accord peut masquer une polarisation collective.",
          ),
          T(
            "Encourager les communications courtes et fréquentes.",
            "Un flux régulier repère plus tôt erreurs et incompréhensions.",
          ),
          F(
            "Éviter les questions qui ralentissent la décision.",
            "Une attitude interrogative peut précisément débusquer une faille.",
          ),
        ],
      ),
      qcm(
        "Pourquoi une checklist cochée ne prouve-t-elle pas son efficacité ?",
        S(135, 139),
        "La conformité documentaire doit être confrontée aux comportements réellement observés sur le terrain.",
        [
          T(
            "Les items peuvent être validés sans vérification réelle.",
            "La trace ne décrit pas nécessairement l’action accomplie.",
          ),
          T(
            "L’observation directe peut révéler des omissions.",
            "Elle compare la procédure affichée au déroulement effectif.",
          ),
          F(
            "Toute documentation est inutile.",
            "La traçabilité reste nécessaire mais ne suffit pas à l’évaluation.",
          ),
          T(
            "Les utilisateurs doivent participer à l’implantation.",
            "Leur expérience aide à rendre l’outil compatible avec le travail réel.",
          ),
          F(
            "Le taux de cases remplies mesure la capacité à sauver.",
            "Un indicateur de processus ne remplace pas un résultat clinique pertinent.",
          ),
        ],
      ),
      qcm(
        "Quelles valeurs soutiennent l’usage durable des barrières ?",
        S(136, 145),
        "Humilité, discipline et travail d’équipe transforment un outil théorique en pratique quotidienne.",
        [
          T(
            "L’humilité accepte la possibilité de se tromper.",
            "Elle rend supportable l’emploi d’une procédure ou d’un contrôle extérieur.",
          ),
          T(
            "La discipline applique les règles à chaque patient.",
            "La répétition protège contre l’exception devenue habitude.",
          ),
          T(
            "Le travail d’équipe distribue les rôles.",
            "La sécurité ne repose plus sur un individu isolé.",
          ),
          F(
            "L’héroïsme solitaire comme norme.",
            "La complexité dépasse les ressources d’une seule personne.",
          ),
          F(
            "L’improvisation permanente comme preuve d’expertise.",
            "L’adaptation doit s’appuyer sur des barrières et une préparation partagées.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Outils transférés de l’aviation",
    questions: [
      qcm(
        "Quel outil rend possible l’analyse objective d’une intervention enregistrée ?",
        S(38, 57),
        "L’enregistrement inspiré de la boîte noire permet de confronter le souvenir au déroulement réel.",
        [
          F(
            "Le repos de garde.",
            "Il réduit la fatigue sans enregistrer la séquence des événements.",
          ),
          F(
            "Le score ANTS isolé.",
            "Il cote des comportements mais ne produit pas un enregistrement continu.",
          ),
          F(
            "La checklist préopératoire.",
            "Elle guide une vérification prospective et non une relecture complète.",
          ),
          F(
            "Le raisonnement intuitif.",
            "Il décrit un mode cognitif sans constituer un outil de traçage.",
          ),
          T(
            "La boîte noire du bloc.",
            "Le dispositif conserve des données utilisables lors du retour d’expérience.",
          ),
        ],
      ),
      qcm(
        "Quels outils réduisent directement la dépendance à la mémoire individuelle ?",
        S(38, 57),
        "La checklist et la simulation préparent l’action, tandis que l’enregistrement soutient l’apprentissage après l’événement.",
        [
          T(
            "La liste de contrôle.",
            "Elle externalise une séquence de vérifications essentielles.",
          ),
          F(
            "Le culte du héros.",
            "Il concentre au contraire la sécurité sur une expertise individuelle.",
          ),
          F(
            "La punition automatique.",
            "Elle encourage la dissimulation plutôt que le rappel fiable.",
          ),
          F(
            "L’absence de protocole.",
            "Elle augmente la dépendance aux habitudes et à la mémoire.",
          ),
          T(
            "La simulation répétée.",
            "Elle entraîne les conduites jusqu’à les rendre plus disponibles sous pression.",
          ),
        ],
      ),
      qcm(
        "Quels éléments appartiennent au retour d’expérience inspiré des pilotes ?",
        S(52, 57),
        "Le système apprend d’incidents anonymisés puis partage les leçons pour éviter leur répétition.",
        [
          F(
            "Publier le nom du déclarant.",
            "L’exposition personnelle décourage la remontée des événements.",
          ),
          T(
            "Recueillir les incidents.",
            "Les signaux faibles alimentent l’analyse collective.",
          ),
          T(
            "Anonymiser les données.",
            "La protection favorise un récit plus complet.",
          ),
          F(
            "Réserver les résultats à la direction.",
            "L’apprentissage exige une diffusion aux professionnels concernés.",
          ),
          T(
            "Diffuser une information de prévention.",
            "Les équipes peuvent modifier leur pratique avant de rencontrer le même risque.",
          ),
        ],
      ),
      qcm(
        "Quelles évolutions ont répondu aux erreurs liées à la fatigue ?",
        S(33, 49),
        "La régulation des horaires et le repos post-garde traitent la fatigue comme une vulnérabilité du système.",
        [
          F(
            "Allonger les gardes pour augmenter l’expérience.",
            "L’exposition supplémentaire aggrave la baisse de vigilance.",
          ),
          F(
            "Supprimer toute supervision nocturne.",
            "L’isolement ajoute une défaillance aux effets de la fatigue.",
          ),
          F(
            "Punir l’endormissement physiologique.",
            "La sanction ne restaure pas les capacités cognitives.",
          ),
          T(
            "Limiter le temps de travail continu.",
            "La règle réduit l’accumulation de privation de sommeil.",
          ),
          T(
            "Instituer un repos après la garde.",
            "La récupération devient une barrière organisationnelle explicite.",
          ),
        ],
      ),
      qcm(
        "Quelles précautions doivent accompagner le transfert d’un outil industriel vers les soins ?",
        S(38, 57),
        "Un transfert sûr adapte l’outil au travail clinique, forme les utilisateurs et mesure ses effets réels.",
        [
          T(
            "Analyser le contexte d’utilisation.",
            "Les contraintes d’un cockpit et d’un bloc ne sont pas identiques.",
          ),
          F(
            "Copier chaque procédure sans modification.",
            "Une transposition littérale peut créer une charge sans bénéfice.",
          ),
          T(
            "Former les équipes au nouvel usage.",
            "L’appropriation conditionne l’efficacité en situation réelle.",
          ),
          T(
            "Tester les effets sur la charge de travail.",
            "Une défense trop lourde peut générer de nouveaux écarts.",
          ),
          T(
            "Réviser l’outil après retour terrain.",
            "Les utilisateurs révèlent les difficultés non prévues par la conception.",
          ),
        ],
      ),
    ],
  },
];
const buildIq = () =>
  IQ.map((s, i) => ({
    label: `QCM ${i + 1} · ${s.title}`,
    allowed_voies: ["interne"],
    questions: s.questions,
  }));

const DQ = [
  {
    title: "Voie aérienne impossible",
    vignette:
      "Lucie, patiente de 42 ans, est anesthésiée pour une thyroïdectomie. Après l’induction, la laryngoscopie échoue et la ventilation au masque devient difficile. Trois anesthésistes expérimentés sont présents, mais aucun rôle n’a été attribué et chacun propose une nouvelle technique d’intubation.",
    questions: [
      qcm(
        "Quels risques humains sont déjà visibles ?",
        S(36, 37),
        "L’absence de leadership et de priorité commune peut prolonger une hypoxie malgré une équipe techniquement compétente.",
        [
          T(
            "La dilution de la responsabilité.",
            "Trois experts agissent sans coordination explicite.",
          ),
          T(
            "La fixation sur l’intubation.",
            "Le moyen technique risque de remplacer l’objectif d’oxygénation.",
          ),
          T(
            "L’absence de distribution des rôles.",
            "Personne ne pilote clairement temps, oxygénation et options.",
          ),
          F(
            "Un manque certain de savoir anatomique.",
            "Le scénario décrit surtout une organisation défaillante.",
          ),
          F(
            "Une communication fermée déjà efficace.",
            "Aucun ordre nominatif ni retour n’est rapporté.",
          ),
        ],
      ),
      qcm(
        "Quelle annonce doit structurer immédiatement l’équipe ?",
        S(36, 37),
        "Un leader désigné doit nommer l’oxygénation comme priorité et répartir les fonctions critiques.",
        [
          T(
            "Je dirige ; notre priorité est d’oxygéner Lucie.",
            "Cette phrase établit leadership et objectif vital.",
          ),
          T(
            "Paul ventile, Sara surveille la SpO₂ et le temps.",
            "Les missions nominatives réduisent la confusion.",
          ),
          F(
            "Que chacun continue sa meilleure technique.",
            "La concurrence non coordonnée prolongerait l’échec.",
          ),
          F(
            "Nous reparlerons des rôles après l’intubation.",
            "La coordination est nécessaire avant toute nouvelle tentative.",
          ),
          T(
            "Appelez immédiatement un renfort chirurgical.",
            "Une ressource de secours doit être mobilisée avant la dégradation.",
          ),
        ],
        "La SpO₂ passe de 99 à 91 % après plusieurs tentatives.",
      ),
      qcm(
        "Quels éléments doivent imposer un changement de stratégie ?",
        S(27, 31),
        "La tendance de saturation, l’échec répété et la ventilation difficile contredisent le plan initial.",
        [
          T(
            "Une SpO₂ qui continue de baisser.",
            "La trajectoire montre que l’oxygénation n’est pas contrôlée.",
          ),
          T(
            "L’absence d’amélioration après une nouvelle lame.",
            "La répétition sans bénéfice confirme l’échec de la stratégie.",
          ),
          F(
            "Le statut senior des opérateurs.",
            "L’expérience ne transforme pas une technique inefficace en solution.",
          ),
          T(
            "Une ventilation au masque de plus en plus difficile.",
            "La marge de secours respiratoire disparaît.",
          ),
          F(
            "La disponibilité d’autres laryngoscopes.",
            "Le nombre d’outils ne justifie pas des tentatives illimitées.",
          ),
        ],
        "Une quatrième laryngoscopie échoue et la SpO₂ atteint 82 %.",
      ),
      qcm(
        "Quel biais explique la poursuite des laryngoscopies ?",
        S(26, 31),
        "L’ancrage et la confirmation entretiennent un plan devenu incompatible avec l’évolution.",
        [
          T(
            "Un biais d’ancrage.",
            "L’équipe reste liée au plan d’intubation initial.",
          ),
          T(
            "Un biais de confirmation.",
            "Chaque petit signe favorable est utilisé pour justifier une nouvelle tentative.",
          ),
          F(
            "Un biais de commission uniquement absent.",
            "L’escalade d’actions inutiles traduit aussi une préférence pour agir.",
          ),
          T(
            "Une fermeture prématurée sur une solution.",
            "Les options de sauvetage ne sont plus comparées.",
          ),
          F(
            "Un raisonnement analytique complet.",
            "Une analyse réelle aurait intégré l’échec et changé de priorité.",
          ),
        ],
        "Un membre affirme qu’il a presque vu la glotte et demande encore un essai.",
      ),
      qcm(
        "Quelle communication permet à une infirmière de faire entendre l’urgence ?",
        S(64, 67),
        "Une alerte explicite, adressée au leader et répétée si nécessaire, doit rendre la menace impossible à ignorer.",
        [
          T(
            "Docteur Martin, la SpO₂ est à 68 % et baisse.",
            "Le destinataire, la mesure et sa tendance sont explicites.",
          ),
          T(
            "Je demande l’arrêt des tentatives et une voie de sauvetage.",
            "Le verbe d’action relie l’alerte à une conduite attendue.",
          ),
          F(
            "Il faudrait peut-être changer quelque chose.",
            "La formulation atténuée ne transmet pas la gravité.",
          ),
          F(
            "Rester silencieuse car elle n’intube pas.",
            "La conscience de situation appartient à toute l’équipe.",
          ),
          T(
            "Faire répéter la décision prise.",
            "Le retour ferme la boucle et confirme que l’alerte a été intégrée.",
          ),
        ],
        "L’infirmière voit la saturation atteindre 68 % tandis que les médecins discutent.",
      ),
      qcm(
        "Comment une aide cognitive doit-elle être employée maintenant ?",
        S(68, 77),
        "Un lecteur distinct guide les étapes pendant que les autres assurent ventilation et accès de secours.",
        [
          T(
            "Désigner une personne pour lire l’algorithme.",
            "Le code reader conserve la progression visible.",
          ),
          T(
            "Annoncer les étapes déjà accomplies.",
            "La liste évite la répétition des mêmes options.",
          ),
          T(
            "Pointer l’accès invasif de secours au bon moment.",
            "L’outil soutient le passage à la stratégie suivante.",
          ),
          F(
            "Confier la lecture à celui qui ventile au masque.",
            "Cette double tâche surcharge la fonction respiratoire critique.",
          ),
          T(
            "Continuer d’adapter le support à l’état de Lucie.",
            "Une aide cognitive ne remplace jamais l’interprétation clinique.",
          ),
        ],
        "Un algorithme de voie aérienne difficile est affiché au mur mais personne ne le consulte.",
      ),
      qcm(
        "Quels éléments devront être analysés après la stabilisation ?",
        S(19, 25),
        "Le retour d’expérience doit rechercher la trajectoire et les barrières absentes plutôt qu’un unique responsable.",
        [
          T(
            "Le délai avant désignation d’un leader.",
            "Cette latence a entretenu les actions concurrentes.",
          ),
          T(
            "Le nombre de tentatives et leurs critères d’arrêt.",
            "Une barrière explicite aurait limité la persévération.",
          ),
          T(
            "L’accessibilité réelle de l’aide cognitive.",
            "Un support visible mais non utilisé reste une défense inactive.",
          ),
          T(
            "La possibilité pour chacun de signaler le danger.",
            "La hiérarchie influence l’expression des alertes.",
          ),
          F(
            "Le nom du professionnel à punir en priorité.",
            "Le blâme individuel masquerait les vulnérabilités reproductibles.",
          ),
        ],
        "Lucie est finalement oxygénée par une voie de secours et transférée en réanimation.",
      ),
    ],
  },
  {
    title: "Erreur médicamenteuse en garde",
    vignette:
      "Karim, patient de 67 ans en réanimation, reçoit plusieurs perfusions vasoactives. À 4 heures du matin, une interne après vingt heures de travail modifie une seringue tandis que son téléphone sonne et qu’une alarme retentit dans la chambre voisine.",
    questions: [
      qcm(
        "Quels facteurs augmentent le risque d’erreur ?",
        S(16, 25),
        "Fatigue, interruption et multiplicité des activités dégradent la disponibilité cognitive au moment de la prescription.",
        [
          T(
            "La durée de travail prolongée.",
            "Le manque de repos altère attention et décision.",
          ),
          T(
            "L’appel téléphonique pendant la tâche.",
            "L’interruption fragmente la séquence de préparation.",
          ),
          T(
            "Les alarmes concurrentes.",
            "Plusieurs signaux se disputent une capacité limitée.",
          ),
          T(
            "Le nombre de perfusions actives.",
            "Chaque ligne et dose ajoute une interface à contrôler.",
          ),
          F(
            "L’âge de Karim comme cause humaine directe.",
            "Le terrain clinique ne constitue pas le mécanisme organisationnel décrit.",
          ),
        ],
      ),
      qcm(
        "Quelle action sécurise la reprise après l’interruption ?",
        S(24, 25),
        "Une tâche à haut risque doit être reprise depuis un point de contrôle explicite plutôt que continuer de mémoire.",
        [
          T(
            "Suspendre la manipulation de la seringue.",
            "La pause évite une action partiellement consciente.",
          ),
          T(
            "Reprendre la vérification depuis l’identité du médicament.",
            "Le redémarrage contrôlé restaure la séquence complète.",
          ),
          T(
            "Faire contrôler dose et voie par un second professionnel.",
            "Une barrière indépendante intercepte une substitution.",
          ),
          F(
            "Se fier à la position habituelle de la seringue.",
            "La localisation seule ne prouve ni contenu ni concentration.",
          ),
          F(
            "Accélérer pour répondre plus vite au téléphone.",
            "La pression temporelle augmenterait la probabilité d’écart.",
          ),
        ],
        "L’interne ne sait plus si elle a déjà changé la concentration.",
      ),
      qcm(
        "Quel type d’erreur produit une concentration saisie dix fois trop forte ?",
        S(7),
        "La saisie d’une dose erronée est une erreur de commission dans l’exécution de la prescription.",
        [
          F(
            "Une omission pure.",
            "Une action a été réalisée, mais avec une valeur incorrecte.",
          ),
          T(
            "Une commission.",
            "La concentration erronée a été activement saisie.",
          ),
          T(
            "Une erreur d’exécution.",
            "Le but thérapeutique était correct mais la réalisation ne l’était pas.",
          ),
          F(
            "Un accident nécessairement inévitable.",
            "Des contrôles de concentration peuvent intercepter l’écart.",
          ),
          F(
            "Une intention de nuire.",
            "Le contexte décrit une défaillance non intentionnelle.",
          ),
        ],
        "Le contrôle révèle une saisie à 2 mg/mL au lieu de 0,2 mg/mL.",
      ),
      qcm(
        "Quelles barrières réduiraient le risque de répétition ?",
        S(19, 25),
        "Les défenses doivent cibler interruption, identification, saisie et contrôle sans ajouter une procédure aveugle.",
        [
          T(
            "Standardiser les concentrations disponibles.",
            "Moins de variantes réduisent les choix erronés.",
          ),
          T(
            "Créer une zone sans interruption pour la préparation.",
            "La protection de la tâche limite les ruptures de séquence.",
          ),
          T(
            "Afficher clairement nom et concentration.",
            "L’étiquette rend la distinction immédiatement visible.",
          ),
          T(
            "Configurer une limite de dose dans la pompe.",
            "Une alerte pertinente intercepte une valeur extrême.",
          ),
          F(
            "Ajouter un formulaire long non évalué.",
            "Une charge supplémentaire n’est utile que si elle réduit les erreurs.",
          ),
        ],
        "La seringue erronée est interceptée avant son branchement.",
      ),
      qcm(
        "Comment conduire l’échange avec l’interne ?",
        S(126, 134),
        "Une culture juste protège la déclaration d’un écart non intentionnel tout en analysant les conditions qui l’ont favorisé.",
        [
          T(
            "Reconnaître que l’interception doit être déclarée.",
            "Un presque accident renseigne sur une trajectoire active.",
          ),
          T(
            "Explorer fatigue et interruptions sans jugement moral.",
            "Ces facteurs sont modifiables à l’échelle du système.",
          ),
          F(
            "La menacer pour garantir sa vigilance future.",
            "La peur favorise la dissimulation des prochains signaux.",
          ),
          T(
            "Vérifier si la règle de double contrôle est réalisable la nuit.",
            "Une barrière théorique doit être confrontée aux ressources réelles.",
          ),
          F(
            "Clore l’analyse puisqu’aucun dommage n’est survenu.",
            "L’absence de préjudice offre justement une occasion d’apprentissage sûre.",
          ),
        ],
        "L’interne avoue avoir hésité à signaler l’événement par peur d’une sanction.",
      ),
      qcm(
        "Quelle mesure traite directement la fatigue organisationnelle ?",
        S(33, 35),
        "Le repos et la supervision constituent des défenses structurelles contre la dégradation liée aux longues heures.",
        [
          T(
            "Limiter la durée de travail continu.",
            "La régulation réduit l’exposition cognitive à l’épuisement.",
          ),
          T(
            "Garantir un recours senior disponible.",
            "La supervision apporte une ressource lors d’une décision complexe.",
          ),
          F(
            "Demander davantage d’effort individuel.",
            "La volonté ne compense pas durablement la privation de sommeil.",
          ),
          F(
            "Supprimer toutes les alarmes nocturnes.",
            "Les signaux pertinents restent nécessaires à la surveillance.",
          ),
          T(
            "Organiser les tâches critiques aux moments les plus sûrs.",
            "La planification réduit les gestes complexes pendant les creux de vigilance.",
          ),
        ],
        "L’audit montre que trois erreurs nocturnes récentes impliquaient des équipes très fatiguées.",
      ),
      qcm(
        "Quel indicateur vérifier après les changements ?",
        S(24, 25),
        "Une barrière doit être évaluée sur les erreurs réelles et la charge créée, pas seulement sur son adoption administrative.",
        [
          T(
            "Le nombre d’erreurs ou interceptions comparé à la période antérieure.",
            "L’évolution renseigne sur l’effet de sécurité recherché.",
          ),
          T(
            "La fréquence des interruptions pendant la préparation.",
            "Le mécanisme ciblé doit effectivement diminuer.",
          ),
          T(
            "Le temps ajouté aux tâches critiques.",
            "Une surcharge excessive peut créer de nouveaux risques.",
          ),
          F(
            "Le seul nombre de formulaires remplis.",
            "La conformité documentaire ne prouve pas une préparation plus sûre.",
          ),
          T(
            "Le retour qualitatif des équipes de nuit.",
            "Les utilisateurs identifient les contournements et difficultés réelles.",
          ),
        ],
        "Six mois plus tard, l’établissement souhaite savoir si le dispositif fonctionne.",
      ),
    ],
  },
  {
    title: "Toxicité d’un anesthésique local",
    vignette:
      "Nora, patiente de 35 ans, reçoit un bloc périphérique avant chirurgie. Elle présente brutalement des convulsions puis un collapsus. L’équipe connaît théoriquement la toxicité systémique des anesthésiques locaux, mais cet événement n’a jamais été simulé dans le service.",
    questions: [
      qcm(
        "Quels obstacles cognitifs sont prévisibles ?",
        S(68, 77),
        "Un événement rare et complexe surcharge la mémoire de travail malgré des connaissances théoriques récentes.",
        [
          T(
            "L’oubli d’une étape peu pratiquée.",
            "La rareté réduit l’automatisation de la conduite.",
          ),
          T(
            "La désorganisation de l’ordre des actions.",
            "La pression altère la récupération séquentielle en mémoire.",
          ),
          T(
            "La concentration sur un seul geste technique.",
            "Une attention étroite peut masquer les autres priorités.",
          ),
          F(
            "L’absence nécessaire de toute connaissance.",
            "L’équipe peut savoir sans réussir à mobiliser le savoir en crise.",
          ),
          F(
            "L’inutilité certaine d’une aide externe.",
            "Un support est précisément utile quand le rappel de mémoire échoue.",
          ),
        ],
      ),
      qcm(
        "Comment utiliser la fiche de prise en charge ?",
        S(68, 77),
        "Un lecteur dédié doit annoncer les étapes pendant que le leader maintient une vision globale et que les opérateurs agissent.",
        [
          T(
            "Nommer un code reader.",
            "La fonction de lecture devient explicite et continue.",
          ),
          T(
            "Lire les actions dans leur ordre prioritaire.",
            "Le support structure une séquence rarement pratiquée.",
          ),
          F(
            "Demander au masseur cardiaque de lire en même temps.",
            "La double tâche dégraderait une action vitale.",
          ),
          T(
            "Signaler au leader les éléments non réalisés.",
            "L’omission devient visible sans interrompre les gestes.",
          ),
          T(
            "Adapter la liste à l’état réel de Nora.",
            "Le support complète le jugement sans s’y substituer.",
          ),
        ],
        "Une aide cognitive plastifiée est trouvée sur le chariot d’urgence.",
      ),
      qcm(
        "Quel message respecte une boucle fermée ?",
        S(64, 67),
        "La prescription doit être nominative, mesurable, répétée puis confirmée avant administration.",
        [
          T(
            "Élodie, prépare l’émulsion lipidique selon la dose affichée.",
            "La destinataire et l’action sont explicitement nommées.",
          ),
          T(
            "Élodie répète la dose calculée à voix haute.",
            "La reformulation permet de repérer une erreur arithmétique.",
          ),
          T(
            "Le leader confirme la valeur avec son unité.",
            "La validation porte sur un contenu non ambigu.",
          ),
          F(
            "L’émulsion habituelle, vite !",
            "La dose et le destinataire restent indéterminés.",
          ),
          T(
            "Élodie annonce quand la perfusion est débutée.",
            "L’exécution ferme la boucle et actualise la situation.",
          ),
        ],
        "Le code reader arrive à l’étape d’administration de l’émulsion lipidique.",
      ),
      qcm(
        "Pourquoi l’équipe doit-elle annoncer périodiquement la situation ?",
        S(58, 67),
        "Une synthèse répétée maintient une conscience commune lorsque les tâches dispersent l’attention.",
        [
          T(
            "Pour partager rythme, pression et réponse au traitement.",
            "Les tendances guident la décision collective.",
          ),
          T(
            "Pour rappeler la cause suspectée.",
            "Le modèle mental commun limite les actions incohérentes.",
          ),
          F(
            "Pour interrompre chaque geste en cours.",
            "La synthèse doit être brève et compatible avec la continuité des actions.",
          ),
          T(
            "Pour vérifier si une priorité a changé.",
            "Une évolution peut imposer une nouvelle stratégie.",
          ),
          F(
            "Pour remplacer les données du moniteur.",
            "La verbalisation diffuse les mesures sans supprimer leur observation.",
          ),
        ],
        "Après deux minutes, plusieurs membres ignorent si la circulation s’améliore.",
      ),
      qcm(
        "Quel bénéfice attendu justifie un entraînement par simulation ?",
        S(69, 75),
        "La simulation entraîne le passage du savoir aux actions coordonnées et l’usage effectif de l’aide cognitive.",
        [
          T(
            "Rendre les rôles plus rapidement attribués.",
            "La répétition réduit la latence organisationnelle.",
          ),
          T(
            "Apprendre à manipuler le support en action.",
            "L’aide devient familière avant l’événement réel.",
          ),
          T(
            "Observer les défauts de communication.",
            "Le débriefing relie les messages aux comportements produits.",
          ),
          F(
            "Garantir qu’aucune erreur ne surviendra ensuite.",
            "L’entraînement réduit des risques sans rendre le système infaillible.",
          ),
          F(
            "Remplacer l’enseignement pharmacologique.",
            "Les connaissances restent indispensables pour comprendre et adapter la conduite.",
          ),
        ],
        "Nora se stabilise ; le service prépare un programme de formation.",
      ),
      qcm(
        "Quels critères doivent guider la révision de l’aide cognitive ?",
        S(76),
        "La structure, la lisibilité et l’usage réel doivent être testés plutôt que déduits de l’exactitude scientifique seule.",
        [
          T(
            "Un ordre d’actions compatible avec les priorités cliniques.",
            "La séquence doit soutenir la décision sous pression.",
          ),
          T(
            "Des caractères lisibles à distance utile.",
            "Le support peut être consulté sans abandonner le patient.",
          ),
          T(
            "Des doses accompagnées de leurs unités.",
            "La précision réduit les erreurs de calcul et de voie.",
          ),
          F(
            "Le maximum d’informations sur une seule page.",
            "La densité excessive peut masquer les actions essentielles.",
          ),
          T(
            "La compréhension par différents métiers.",
            "L’aide appartient à l’équipe entière, pas à une seule profession.",
          ),
        ],
        "Le débriefing révèle que deux lignes étaient difficiles à lire et qu’une dose prêtait à confusion.",
      ),
      qcm(
        "Quelle conclusion tirer de cet événement sans dommage durable ?",
        S(126, 139),
        "L’interception réussie et les difficultés observées doivent alimenter un apprentissage collectif concret.",
        [
          T(
            "Déclarer l’événement et les facteurs de réussite.",
            "Les barrières efficaces méritent aussi d’être comprises.",
          ),
          T(
            "Diffuser les points d’amélioration à l’équipe.",
            "L’expérience locale devient une ressource partagée.",
          ),
          T(
            "Réévaluer le chariot et le support après modification.",
            "Une correction doit être vérifiée en conditions réalistes.",
          ),
          F(
            "Conserver l’épisode au sein du petit groupe présent.",
            "La rétention empêche les autres équipes d’apprendre.",
          ),
          T(
            "Associer les utilisateurs à la nouvelle version.",
            "Le terrain identifie les contraintes invisibles aux concepteurs.",
          ),
        ],
        "Nora quitte l’hôpital sans séquelle après surveillance.",
      ),
    ],
  },
  {
    title: "Hémorragie et transmission",
    vignette:
      "Olivier, patient de 71 ans, subit une chirurgie hépatique. Un saignement brutal débute. Le chirurgien estime les pertes à voix basse, l’anesthésiste demande « du sang rapidement » sans nommer personne, et deux infirmières pensent chacune que l’autre a appelé le dépôt.",
    questions: [
      qcm(
        "Quelles défaillances expliquent la non-exécution de la demande ?",
        S(64, 67),
        "Un message non adressé et non fermé crée une responsabilité diffuse dont personne ne peut vérifier l’issue.",
        [
          T(
            "L’absence de destinataire nommé.",
            "La demande collective permet à chacun de supposer qu’un autre agit.",
          ),
          T(
            "L’action demandée reste vague.",
            "Le produit, la quantité et le délai ne sont pas explicités.",
          ),
          T(
            "Aucune répétition n’a confirmé la réception.",
            "L’émetteur ignore si le message a été compris.",
          ),
          T(
            "L’exécution n’a pas été annoncée.",
            "Le statut de l’appel reste invisible pour le leader.",
          ),
          F(
            "La présence de deux infirmières suffit à sécuriser la tâche.",
            "Le nombre ne remplace pas une attribution claire.",
          ),
        ],
      ),
      qcm(
        "Quelle formulation est la plus opérationnelle ?",
        S(64, 67),
        "La demande doit relier un professionnel identifié à une action mesurable et à un retour attendu.",
        [
          T(
            "Sophie, appelle le dépôt pour quatre concentrés érythrocytaires en urgence.",
            "Le destinataire, le produit et la quantité sont définis.",
          ),
          T(
            "Répète-moi la commande avant d’appeler.",
            "La reformulation vérifie le contenu transmis.",
          ),
          F(
            "Que quelqu’un fasse venir beaucoup de sang.",
            "La formulation garde destinataire et quantité indéterminés.",
          ),
          F(
            "Préparez ce qu’on prend d’habitude.",
            "Une habitude implicite n’est pas une prescription sûre.",
          ),
          T(
            "Annonce quand le dépôt a confirmé l’envoi.",
            "Le retour permettra d’actualiser le plan transfusionnel.",
          ),
        ],
        "La pression chute à 70/40 mmHg et les pertes atteignent 1 500 mL.",
      ),
      qcm(
        "Comment construire une conscience collective de l’hémorragie ?",
        S(58, 67),
        "Une synthèse brève combine gravité, tendance, actions en cours et prochaines décisions.",
        [
          T(
            "Annoncer les pertes cumulées et leur vitesse.",
            "La tendance différencie un saignement stable d’une accélération.",
          ),
          T(
            "Partager la pression et la réponse au remplissage.",
            "La perfusion devient un objectif visible par tous.",
          ),
          T(
            "Dire quels produits ont été commandés.",
            "L’équipe connaît les ressources attendues et les délais.",
          ),
          F(
            "Limiter l’information au chirurgien et à l’anesthésiste.",
            "Les autres professionnels réalisent des tâches dépendant de la même situation.",
          ),
          T(
            "Fixer l’heure de la prochaine réévaluation.",
            "Un jalon évite que le plan persiste sans contrôle.",
          ),
        ],
        "Le chirurgien annonce désormais une perte de 500 mL en cinq minutes.",
      ),
      qcm(
        "Quel rôle le leader doit-il déléguer pour éviter la surcharge ?",
        S(58, 65),
        "La coordination exige de distribuer surveillance, transfusion, médicaments et traçabilité à des personnes identifiées.",
        [
          T(
            "Un membre suit exclusivement les produits sanguins.",
            "La chaîne de commande et d’arrivée reste visible.",
          ),
          T(
            "Un autre annonce les constantes et leur tendance.",
            "Le leader reçoit une synthèse sans quitter la stratégie globale.",
          ),
          T(
            "Une personne documente les doses et horaires.",
            "La trace évite répétition et omission des traitements.",
          ),
          F(
            "Le leader réalise seul toutes les injections.",
            "Cette concentration des tâches détruit sa vision d’ensemble.",
          ),
          F(
            "Chaque membre choisit spontanément sa mission.",
            "L’auto-attribution peut laisser des fonctions critiques sans responsable.",
          ),
        ],
        "Plusieurs perfusions et traitements doivent maintenant être administrés simultanément.",
      ),
      qcm(
        "Quel biais pourrait conduire à transfuser sans réévaluation ?",
        S(26, 31),
        "La commission favorise la poursuite d’actions parce qu’elles sont disponibles plutôt que parce qu’elles restent indiquées.",
        [
          T(
            "Un biais de commission.",
            "L’action répétée peut devenir automatique malgré le changement clinique.",
          ),
          F(
            "Un biais d’omission nécessairement.",
            "Le risque décrit vient d’un excès d’intervention, non d’une abstention.",
          ),
          T(
            "Un ancrage sur la phase de choc.",
            "La représentation initiale peut persister après contrôle du saignement.",
          ),
          F(
            "Une analyse complète des besoins.",
            "Une réévaluation raisonnée protégerait justement de la surtransfusion.",
          ),
          F(
            "Une absence de toute cognition intuitive.",
            "Les routines rapides peuvent entretenir la conduite sans nouvelle analyse.",
          ),
        ],
        "Après contrôle chirurgical, la pression remonte mais deux culots supplémentaires arrivent.",
      ),
      qcm(
        "Quelle pause décisionnelle est adaptée ?",
        S(27, 31),
        "Une réévaluation analytique doit intégrer les pertes arrêtées, l’état circulatoire et les produits déjà administrés.",
        [
          T(
            "Annoncer que le saignement est contrôlé.",
            "La situation nouvelle doit remplacer le modèle de choc actif.",
          ),
          T(
            "Recalculer les besoins avant chaque produit restant.",
            "L’indication devient individualisée à l’état actuel.",
          ),
          T(
            "Demander un avis contradictoire à l’équipe.",
            "Une seconde lecture limite l’ancrage transfusionnel.",
          ),
          F(
            "Transfuser tout ce qui a été commandé.",
            "La commande antérieure ne suffit pas à maintenir l’indication.",
          ),
          T(
            "Documenter la raison d’administrer ou non chaque unité.",
            "La décision devient explicite et vérifiable.",
          ),
        ],
        "L’hémoglobine et les constantes sont maintenant compatibles avec une surveillance.",
      ),
      qcm(
        "Quels éléments intégrer au débriefing ?",
        S(90, 94),
        "Le débriefing doit relier formulation des messages, répartition des rôles et changements de décision à l’évolution clinique.",
        [
          T(
            "Le premier ordre non nominatif.",
            "Il explique le retard de commande initial.",
          ),
          T(
            "La qualité des boucles fermées ensuite utilisées.",
            "Une amélioration observée mérite d’être consolidée.",
          ),
          T(
            "La transition du choc vers la stabilité.",
            "Le changement de représentation a conditionné l’arrêt des transfusions.",
          ),
          T(
            "Le vécu des professionnels moins seniors.",
            "Ils peuvent révéler des informations retenues par la hiérarchie.",
          ),
          F(
            "Uniquement la quantité totale de sang perdue.",
            "La mesure clinique ne suffit pas à analyser la performance collective.",
          ),
        ],
        "Olivier est stabilisé et l’équipe se réunit avant la fin de garde.",
      ),
    ],
  },
  {
    title: "Anticipation en anesthésie pédiatrique",
    vignette:
      "Maya, patiente de 6 mois pesant 4,5 kg, doit être anesthésiée pour une chirurgie abdominale. Elle est fragile et une bradycardie à l’induction est plausible. Le matériel pédiatrique est disponible, mais aucune dose de secours n’a encore été calculée.",
    questions: [
      qcm(
        "Pourquoi anticiper avant l’induction ?",
        S(78, 87),
        "La préparation distribue la cognition dans le temps et libère la mémoire de travail au moment de l’urgence.",
        [
          T(
            "Le calcul sera plus fiable hors crise.",
            "La pression temporelle et l’hypoxie ne perturberont pas l’arithmétique.",
          ),
          T(
            "La dilution pourra être vérifiée.",
            "Une seconde lecture intercepte une erreur avant l’événement.",
          ),
          T(
            "Le médicament sera immédiatement accessible.",
            "La disponibilité réduit le délai thérapeutique.",
          ),
          F(
            "L’anticipation garantit l’absence de bradycardie.",
            "Elle prépare la réponse sans supprimer le risque clinique.",
          ),
          F(
            "Le poids devient inutile après préparation.",
            "La dose reste fondée sur la masse réelle de Maya.",
          ),
        ],
      ),
      qcm(
        "Quelle dose d’atropine doit être préparée à 20 µg/kg ?",
        S(80, 81),
        "Pour 4,5 kg, la dose calculée est de 90 µg ; elle doit être annoncée avec son unité.",
        [
          T(
            "90 µg.",
            "Le produit de 20 par 4,5 donne quatre-vingt-dix microgrammes.",
          ),
          F("9 µg.", "Cette valeur correspond à une erreur d’un facteur dix."),
          F(
            "900 µg.",
            "Cette dose serait dix fois supérieure au calcul attendu.",
          ),
          T(
            "0,09 mg.",
            "La conversion de 90 microgrammes donne 0,09 milligramme.",
          ),
          F(
            "20 mg.",
            "La valeur reprend le coefficient sans tenir compte du poids ni de l’unité.",
          ),
        ],
        "L’équipe confirme le poids de Maya à 4,5 kg.",
      ),
      qcm(
        "Quelles étapes sécurisent la préparation ?",
        S(64, 81),
        "Calcul, conversion, dilution et volume final doivent être formulés puis contrôlés indépendamment.",
        [
          T(
            "Écrire le calcul complet.",
            "La trace permet de repérer un facteur dix ou une unité erronée.",
          ),
          T(
            "Faire vérifier le résultat par un autre professionnel.",
            "La barrière indépendante ne partage pas nécessairement la même erreur.",
          ),
          T(
            "Étiqueter concentration et volume à injecter.",
            "L’information reste disponible au moment de l’urgence.",
          ),
          F(
            "Retenir uniquement la couleur de la seringue.",
            "La couleur ne constitue pas une identification pharmacologique fiable.",
          ),
          T(
            "Annoncer la dose en microgrammes et en milligrammes.",
            "La double expression peut révéler une conversion incohérente.",
          ),
        ],
        "Une ampoule concentrée impose une dilution avant emploi.",
      ),
      qcm(
        "Comment le leader doit-il répartir les ressources ?",
        S(58, 65),
        "Une préparation collective nomme les responsables de la voie aérienne, des médicaments, du monitorage et du recours.",
        [
          T(
            "Attribuer la surveillance de la fréquence à une personne.",
            "La détection doit rester continue pendant les gestes.",
          ),
          T(
            "Nommer qui injectera l’atropine si besoin.",
            "La responsabilité devient immédiatement actionnable.",
          ),
          T(
            "Vérifier qui appelle du renfort.",
            "Une dégradation ne doit pas retarder la mobilisation d’aide.",
          ),
          F(
            "Supposer que tous connaissent spontanément leur rôle.",
            "Une représentation implicite expose aux doublons et aux omissions.",
          ),
          F(
            "Garder seul la seringue et le plan de secours.",
            "La rétention réduit la cognition partagée de l’équipe.",
          ),
        ],
        "Maya entre en salle et plusieurs nouveaux membres rejoignent l’équipe.",
      ),
      qcm(
        "Quelle communication est adaptée lorsque la fréquence tombe à 70/min ?",
        S(64, 67),
        "La mesure, sa tendance, le destinataire et l’action doivent être annoncés sans détour.",
        [
          T(
            "Docteur Léa, fréquence 70 et en baisse.",
            "Le message rend destinataire et évolution explicites.",
          ),
          T(
            "Administre maintenant 90 µg d’atropine IV.",
            "L’ordre comporte verbe, dose, unité et voie.",
          ),
          T(
            "Répète la dose avant injection.",
            "La reformulation intercepte une erreur sous stress.",
          ),
          T(
            "Annonce quand la seringue est injectée.",
            "Le retour d’exécution ferme la boucle.",
          ),
          F(
            "Donne un peu d’atropine.",
            "La quantité implicite est dangereuse chez un nourrisson.",
          ),
        ],
        "Immédiatement après l’induction, la fréquence cardiaque diminue rapidement.",
      ),
      qcm(
        "Quel élément environnemental peut encore soutenir l’action ?",
        S(78, 87),
        "Un espace standardisé et clairement étiqueté rend les ressources de secours immédiatement perceptibles.",
        [
          T(
            "Une seringue identifiée avec dose et concentration.",
            "L’étiquette réduit la recherche et la confusion.",
          ),
          T(
            "Un chariot pédiatrique organisé de façon constante.",
            "La localisation stable accélère l’accès au matériel.",
          ),
          F(
            "Plusieurs seringues anonymes côte à côte.",
            "L’indistinction favorise une substitution dangereuse.",
          ),
          T(
            "Une alarme réglée à un seuil adapté à Maya.",
            "Le signal doit être pertinent pour le terrain pédiatrique.",
          ),
          F(
            "Un protocole rangé dans un bureau distant.",
            "Une ressource inaccessible n’augmente pas la cognition en crise.",
          ),
        ],
        "La bradycardie répond au traitement et la ventilation reste efficace.",
      ),
      qcm(
        "Quel enseignement diffuser après l’intervention ?",
        S(129, 139),
        "La réussite de l’anticipation doit être transformée en standard reproductible sans devenir une routine aveugle.",
        [
          T(
            "Préparer les doses critiques avant chaque induction pédiatrique.",
            "La distribution temporelle protège lors d’un événement brutal.",
          ),
          T(
            "Conserver un double contrôle des conversions.",
            "Le risque de facteur dix persiste même avec l’expérience.",
          ),
          T(
            "Adapter les seuils et doses à chaque enfant.",
            "Le standard organise la préparation sans supprimer l’individualisation.",
          ),
          F(
            "Utiliser systématiquement la dose de Maya pour tous les nourrissons.",
            "La posologie dépend du poids et du contexte.",
          ),
          T(
            "Intégrer ce point aux briefings d’équipe.",
            "La verbalisation rend la barrière visible et partagée.",
          ),
        ],
        "Le débriefing montre que la seringue préparée a raccourci le délai de traitement.",
      ),
    ],
  },
  {
    title: "Checklist avant chirurgie",
    vignette:
      "Rachid, patient de 58 ans, est installé pour une chirurgie du genou droit. La checklist électronique apparaît comme complétée dans le dossier. Au briefing, une infirmière remarque que le programme mural indique le genou gauche et que le marquage cutané est masqué par le champ.",
    questions: [
      qcm(
        "Quel risque systémique illustre cette discordance ?",
        S(135, 139),
        "Une trace administrative peut donner une fausse assurance lorsque la vérification réelle n’a pas été accomplie.",
        [
          T(
            "La conformité documentaire sans conformité pratique.",
            "La case cochée ne prouve pas que le côté a été comparé.",
          ),
          T(
            "Un accident de latéralité encore interceptable.",
            "La discordance constitue une trajectoire active avant l’incision.",
          ),
          T(
            "Une barrière checklist devenue poreuse.",
            "Le rituel a perdu sa fonction de vérification collective.",
          ),
          F(
            "Une preuve que l’infirmière retarde inutilement le bloc.",
            "Son alerte révèle un risque majeur et pertinent.",
          ),
          F(
            "Une complication inévitable liée au patient.",
            "Le côté opératoire relève d’un processus entièrement contrôlable.",
          ),
        ],
      ),
      qcm(
        "Quelle décision immédiate est adaptée ?",
        S(41, 45),
        "L’équipe doit interrompre le flux et vérifier collectivement identité, intervention et côté avant toute incision.",
        [
          T(
            "Suspendre la préparation opératoire.",
            "La progression doit s’arrêter tant que la discordance persiste.",
          ),
          T(
            "Découvrir le marquage cutané.",
            "Le repère visuel doit être comparé aux autres sources.",
          ),
          T(
            "Interroger Rachid s’il est encore en mesure de répondre.",
            "Le patient constitue une source supplémentaire d’identification.",
          ),
          F(
            "Corriger seulement le programme mural sans discussion.",
            "Une modification isolée ne détermine pas quelle source est correcte.",
          ),
          T(
            "Faire confirmer le côté par le chirurgien et le dossier.",
            "La décision finale doit croiser plusieurs informations indépendantes.",
          ),
        ],
        "L’anesthésie n’a pas encore été induite et Rachid peut répondre.",
      ),
      qcm(
        "Quelle formulation soutient l’alerte de l’infirmière ?",
        S(64, 67),
        "Une assertion claire de sécurité doit nommer la discordance et demander explicitement l’arrêt.",
        [
          T(
            "Je demande un arrêt : les côtés ne concordent pas.",
            "La demande rend la suspension non négociable jusqu’à vérification.",
          ),
          T(
            "Le programme dit gauche, le patient et le dossier disent droit.",
            "Les données contradictoires sont énoncées avec précision.",
          ),
          F(
            "Je suis peut-être un peu inquiète.",
            "L’atténuation peut être ignorée dans une équipe pressée.",
          ),
          T(
            "Docteur, confirmez le côté avant l’induction.",
            "Le destinataire et l’action attendue sont explicites.",
          ),
          F(
            "Attendre silencieusement le time-out final.",
            "La menace connue doit être traitée dès sa découverte.",
          ),
        ],
        "Le chirurgien minimise d’abord l’écart en parlant d’une simple faute de frappe.",
      ),
      qcm(
        "Quel biais collectif menace l’équipe ?",
        S(26, 31),
        "La confirmation et le consensus apparent peuvent faire rechercher une justification au plan au lieu de résoudre la contradiction.",
        [
          T(
            "La recherche sélective d’indices confirmant le côté prévu.",
            "Cette forme de confirmation écarte les sources qui contredisent le programme.",
          ),
          T(
            "Un effet de consensus.",
            "Le silence des autres peut être pris à tort pour un accord.",
          ),
          F(
            "Un raisonnement analytique déjà achevé.",
            "La discordance impose justement une analyse supplémentaire.",
          ),
          T(
            "La préférence pour poursuivre plutôt que suspendre le programme.",
            "Cette commission privilégierait l’action malgré un danger non résolu.",
          ),
          F(
            "Une absence de tout ancrage.",
            "Le programme initial peut figer la représentation du côté opératoire.",
          ),
        ],
        "Deux membres affirment qu’ils ont toujours opéré le côté affiché sur le programme.",
      ),
      qcm(
        "Comment faire émerger toutes les informations ?",
        S(129, 134),
        "Un tour de table nominatif permet à chaque profession de partager sa source et de contredire la majorité.",
        [
          T(
            "Demander à chacun quel côté il a vérifié.",
            "La réponse individuelle ne se fond pas dans un accord de façade.",
          ),
          T(
            "Inviter explicitement une hypothèse alternative.",
            "La contradiction devient une mission légitime.",
          ),
          T(
            "Comparer dossier, consentement, imagerie et marquage.",
            "Les sources indépendantes reconstruisent le processus fiable.",
          ),
          F(
            "Faire voter rapidement à main levée.",
            "Une majorité ne transforme pas une donnée incertaine en vérité clinique.",
          ),
          F(
            "Laisser le membre le plus ancien trancher seul.",
            "Le statut ne remplace pas la concordance des preuves.",
          ),
        ],
        "Le responsable décide de reprendre la vérification depuis le début.",
      ),
      qcm(
        "Que doit analyser l’établissement après l’incident ?",
        S(19, 25),
        "L’analyse cherche pourquoi plusieurs barrières ont laissé passer l’erreur de programme jusqu’à la salle.",
        [
          T(
            "L’origine de la latéralité erronée dans le programme.",
            "La faille de saisie constitue un premier trou de défense.",
          ),
          T(
            "La manière dont la checklist a été validée.",
            "Une vérification prématurée ou fictive a neutralisé une barrière.",
          ),
          T(
            "La visibilité du marquage après installation.",
            "Un repère masqué devient inutilisable au moment critique.",
          ),
          T(
            "La possibilité réelle de suspendre le flux.",
            "La culture hiérarchique conditionne l’efficacité de l’alerte.",
          ),
          F(
            "Uniquement l’identité de la personne ayant saisi le programme.",
            "La focalisation individuelle ignorerait les interceptions manquées.",
          ),
        ],
        "La chirurgie du genou droit est finalement réalisée sans dommage.",
      ),
      qcm(
        "Quel suivi vérifie que la correction fonctionne ?",
        S(135, 139),
        "L’observation directe doit confirmer que l’équipe effectue réellement les comparaisons prévues.",
        [
          T(
            "Observer plusieurs checklists en situation réelle.",
            "Le comportement effectif peut différer de la trace électronique.",
          ),
          T(
            "Mesurer les discordances détectées avant incision.",
            "Les interceptions renseignent sur les trajectoires encore présentes.",
          ),
          T(
            "Interroger les équipes sur les obstacles au time-out.",
            "Le retour terrain révèle les pressions et contournements.",
          ),
          F(
            "Compter seulement les formulaires marqués complets.",
            "Ce chiffre reproduirait l’indicateur qui a masqué l’échec.",
          ),
          T(
            "Associer les utilisateurs à la nouvelle procédure.",
            "Leur implication améliore faisabilité et appropriation.",
          ),
        ],
        "Une nouvelle vérification de latéralité est introduite trois mois plus tard.",
      ),
    ],
  },
  {
    title: "Sepsis et ancrage diagnostique",
    vignette:
      "Sonia, patiente de 64 ans, est hospitalisée après chirurgie abdominale. Une hypotension est attribuée à la vasoplégie postopératoire et traitée par vasopresseur. Le diagnostic est répété à chaque transmission alors que sa douleur augmente et que son abdomen devient tendu.",
    questions: [
      qcm(
        "Quel biais domine la première interprétation ?",
        S(26, 31),
        "L’ancrage sur une vasoplégie initiale empêche d’intégrer des signes nouveaux compatibles avec une complication abdominale.",
        [
          T(
            "Le maintien rigide du diagnostic de vasoplégie initiale.",
            "Cet ancrage résiste aux modifications successives de l’état de Sonia.",
          ),
          T(
            "La valorisation des réponses transitoires au vasopresseur.",
            "Ce tri confirmatoire renforce artificiellement l’hypothèse favorite.",
          ),
          F(
            "Un biais de commission absent.",
            "L’augmentation thérapeutique peut aussi traduire une action automatique.",
          ),
          F(
            "Une analyse différentielle complète.",
            "Les nouvelles causes possibles ne sont pas comparées.",
          ),
          T(
            "Une fermeture prématurée.",
            "La recherche diagnostique s’est arrêtée trop tôt.",
          ),
        ],
      ),
      qcm(
        "Quelle donnée doit déclencher une révision du modèle ?",
        S(27, 31),
        "La douleur croissante et la tension abdominale ne s’expliquent pas par une simple vasoplégie.",
        [
          T(
            "L’aggravation abdominale nouvelle.",
            "Une information discordante doit rouvrir le diagnostic.",
          ),
          T(
            "L’augmentation du besoin en vasopresseur.",
            "L’échec du traitement attendu fragilise l’hypothèse initiale.",
          ),
          F(
            "La répétition du mot vasoplégie dans les transmissions.",
            "La fréquence d’une étiquette ne constitue pas une preuve.",
          ),
          T(
            "L’absence d’amélioration durable.",
            "Une stratégie inefficace impose une réévaluation analytique.",
          ),
          F(
            "Le fait que Sonia soit en postopératoire.",
            "Ce contexte autorise plusieurs complications et non une seule cause.",
          ),
        ],
        "La noradrénaline doit être doublée en une heure.",
      ),
      qcm(
        "Quelle pause cognitive est adaptée ?",
        S(27, 31),
        "L’équipe doit reformuler les faits, produire des alternatives et rechercher les éléments qui les distinguent.",
        [
          T(
            "Décrire les données sans utiliser le mot vasoplégie.",
            "Le langage neutre aide à quitter le cadre initial.",
          ),
          T(
            "Lister hémorragie, sepsis et complication chirurgicale.",
            "Plusieurs hypothèses deviennent comparables.",
          ),
          T(
            "Demander ce qui contredit chaque hypothèse.",
            "La réfutation combat le tri confirmatoire.",
          ),
          F(
            "Augmenter encore le vasopresseur avant toute réflexion.",
            "La poursuite automatique pourrait retarder le traitement causal.",
          ),
          T(
            "Fixer une décision après une réévaluation ciblée.",
            "Le mode analytique doit aboutir à un plan et un suivi.",
          ),
        ],
        "Un senior arrive et demande une synthèse factuelle.",
      ),
      qcm(
        "Comment solliciter l’équipe chirurgicale efficacement ?",
        S(64, 67),
        "Le message doit exposer gravité, évolution, hypothèse alternative et demande d’évaluation immédiate.",
        [
          T(
            "Docteur Bernard, Sonia est à 0,4 µg/kg/min de noradrénaline.",
            "Le destinataire et une mesure de gravité sont précisés.",
          ),
          T(
            "Son abdomen est devenu tendu avec douleur croissante.",
            "Les signes nouveaux expliquent la remise en cause.",
          ),
          T(
            "Je demande une évaluation chirurgicale maintenant.",
            "L’action attendue et son délai sont non ambigus.",
          ),
          F(
            "Elle ne va pas très bien, passez si possible.",
            "La formulation ne transmet ni priorité ni éléments objectifs.",
          ),
          T(
            "Répétez-moi votre heure d’arrivée.",
            "Le retour ferme la boucle sur la réponse attendue.",
          ),
        ],
        "Le chirurgien n’a pas été informé de la modification abdominale.",
      ),
      qcm(
        "Comment la cognition sociale corrige-t-elle ici la décision ?",
        S(82, 85),
        "Les perceptions complémentaires de l’infirmière, du senior et du chirurgien enrichissent une représentation initialement étroite.",
        [
          T(
            "L’infirmière rapporte la progression de la douleur.",
            "Son observation longitudinale apporte une tendance absente du bilan ponctuel.",
          ),
          T(
            "Le chirurgien interprète la tension abdominale.",
            "Une expertise spécifique requalifie la gravité du signe.",
          ),
          T(
            "Le senior compare plusieurs mécanismes de choc.",
            "Une ressource cognitive externe réouvre le raisonnement.",
          ),
          F(
            "Chacun conserve son avis jusqu’au diagnostic final.",
            "La séparation empêcherait précisément la correction collective.",
          ),
          F(
            "La décision appartient exclusivement au premier prescripteur.",
            "Une organisation fiable accepte la révision par le groupe.",
          ),
        ],
        "L’échographie suggère un épanchement intrapéritonéal.",
      ),
      qcm(
        "Quel changement de plan devient prioritaire ?",
        S(31),
        "L’hypothèse hémorragique doit guider simultanément confirmation, soutien circulatoire et contrôle chirurgical.",
        [
          T(
            "Préparer une reprise chirurgicale urgente.",
            "Le traitement causal ne doit pas être retardé.",
          ),
          T(
            "Activer la stratégie transfusionnelle adaptée.",
            "Le soutien doit correspondre au mécanisme désormais probable.",
          ),
          F(
            "Maintenir uniquement l’escalade de vasopresseur.",
            "Cette action ne contrôle pas la perte sanguine.",
          ),
          T(
            "Réévaluer la réponse à chaque intervention.",
            "La nouvelle stratégie reste soumise à l’évolution réelle.",
          ),
          F(
            "Considérer l’épisode comme une confirmation de vasoplégie.",
            "Les données convergent maintenant vers une autre cause.",
          ),
        ],
        "L’hémoglobine chute et le chirurgien confirme une forte suspicion d’hémorragie.",
      ),
      qcm(
        "Quelle prévention viser dans les transmissions futures ?",
        S(129, 139),
        "Une transmission sûre sépare faits, interprétation et incertitudes afin de ne pas propager un ancrage.",
        [
          T(
            "Annoncer les tendances objectives avant le diagnostic supposé.",
            "Les données restent disponibles pour une lecture indépendante.",
          ),
          T(
            "Préciser les éléments discordants.",
            "La contradiction ne disparaît pas sous l’étiquette principale.",
          ),
          T(
            "Dire quand et pourquoi le plan sera réévalué.",
            "Un jalon empêche une hypothèse de devenir permanente.",
          ),
          F(
            "Répéter le diagnostic sans mentionner son degré de certitude.",
            "Cette pratique transforme une hypothèse en fait collectif.",
          ),
          T(
            "Encourager le receveur à poser une question.",
            "L’attitude interrogative révèle les zones mal comprises.",
          ),
        ],
        "Sonia est opérée à temps et récupère après le contrôle du saignement.",
      ),
    ],
  },
  {
    title: "Revue d’un incident sans dommage",
    vignette:
      "Thomas, patient de 55 ans, a reçu pendant dix minutes une perfusion d’antibiotique destinée à un autre patient. L’erreur est détectée avant réaction clinique. Le professionnel concerné veut corriger discrètement le dossier, tandis que le cadre propose une revue collective.",
    questions: [
      qcm(
        "Pourquoi analyser cet incident malgré l’absence de dommage ?",
        S(7, 25),
        "Un écart intercepté révèle une trajectoire active et offre une occasion d’agir avant un accident futur.",
        [
          T(
            "Le processus de soins a dévié.",
            "L’erreur existe indépendamment du résultat immédiat.",
          ),
          T(
            "Les mêmes failles peuvent atteindre un autre patient.",
            "L’absence de dommage actuel ne ferme pas la trajectoire future.",
          ),
          T(
            "Une barrière a fonctionné tardivement.",
            "Comprendre l’interception aide à la renforcer ou à l’avancer.",
          ),
          F(
            "L’antibiotique était forcément sans risque.",
            "Une absence de réaction chez Thomas ne prédit pas les conséquences possibles.",
          ),
          F(
            "Seuls les décès justifient une revue.",
            "Les presque accidents sont des signaux précieux et moins coûteux humainement.",
          ),
        ],
      ),
      qcm(
        "Quelle attitude relève d’une culture juste ?",
        S(126, 134),
        "La déclaration d’une erreur non intentionnelle doit être protégée afin d’examiner les comportements et le système sans dissimulation.",
        [
          T(
            "Informer Thomas selon les règles de l’établissement.",
            "La transparence respecte le patient et la traçabilité.",
          ),
          T(
            "Déclarer l’incident critique.",
            "Le signal entre dans le système d’apprentissage.",
          ),
          T(
            "Distinguer erreur involontaire et acte délibéré.",
            "La réponse doit être proportionnée à la nature du comportement.",
          ),
          F(
            "Effacer la trace pour protéger l’équipe.",
            "La dissimulation empêche l’analyse et fragilise la confiance.",
          ),
          T(
            "Soutenir le professionnel impliqué.",
            "Un accompagnement favorise un récit complet et un apprentissage réel.",
          ),
        ],
        "Thomas reste asymptomatique après information et surveillance.",
      ),
      qcm(
        "Quelles questions reconstruisent la trajectoire ?",
        S(19, 25),
        "L’analyse recherche comment prescription, identification, préparation et administration ont successivement laissé passer l’écart.",
        [
          T(
            "Comment les deux patients ont-ils été identifiés ?",
            "La confusion peut débuter à l’interface d’identité.",
          ),
          T(
            "Où les poches étaient-elles placées et étiquetées ?",
            "L’environnement peut rendre la substitution facile.",
          ),
          T(
            "Quelle interruption a précédé le branchement ?",
            "Une rupture de tâche peut expliquer la perte de séquence.",
          ),
          T(
            "Quelle barrière a finalement détecté l’erreur ?",
            "L’interception fournit une défense à comprendre et consolider.",
          ),
          F(
            "Qui mérite d’être publiquement désigné ?",
            "Le blâme ne reconstitue pas les mécanismes reproductibles.",
          ),
        ],
        "La revue révèle deux poches presque identiques déposées sur le même chariot.",
      ),
      qcm(
        "Quelles corrections agissent sur l’environnement ?",
        S(78, 87),
        "La disposition et l’étiquetage doivent rendre la bonne action plus évidente et la substitution plus difficile.",
        [
          T(
            "Séparer physiquement les traitements par patient.",
            "La distance crée une barrière perceptible avant la prise.",
          ),
          T(
            "Utiliser une étiquette très visible avec deux identifiants.",
            "L’information d’identité accompagne la poche jusqu’au branchement.",
          ),
          T(
            "Standardiser le rangement du chariot.",
            "Une organisation constante diminue les recherches improvisées.",
          ),
          F(
            "Demander seulement à chacun d’être plus vigilant.",
            "L’attention individuelle reste limitée dans le même environnement trompeur.",
          ),
          T(
            "Prévoir un contrôle au lit du patient.",
            "La dernière interface compare la poche à l’identité réelle.",
          ),
        ],
        "L’équipe souhaite modifier le circuit dès la semaine suivante.",
      ),
      qcm(
        "Comment éviter un faux consensus sur la solution ?",
        S(129, 134),
        "Une discussion structurée doit faire entendre les contraintes et les effets indésirables possibles de chaque option.",
        [
          T(
            "Faire parler successivement pharmacie, infirmiers et médecins.",
            "Chaque métier voit une partie différente du circuit.",
          ),
          T(
            "Demander quelle nouvelle erreur chaque solution pourrait créer.",
            "La contradiction teste la robustesse de la barrière.",
          ),
          F(
            "Adopter l’idée du cadre sans discussion pour gagner du temps.",
            "L’autorité ne garantit ni faisabilité ni efficacité.",
          ),
          T(
            "Tester le nouveau circuit sur un petit périmètre.",
            "L’expérimentation révèle les effets réels avant généralisation.",
          ),
          F(
            "Considérer toute objection comme une résistance au changement.",
            "Une objection peut signaler une vulnérabilité pertinente.",
          ),
        ],
        "Trois solutions concurrentes sont proposées lors de la réunion.",
      ),
      qcm(
        "Quels indicateurs évaluer après le changement ?",
        S(24, 25),
        "L’efficacité combine réduction des erreurs, emploi réel de la barrière et absence de surcharge dangereuse.",
        [
          T(
            "Le nombre de substitutions et de presque accidents.",
            "L’indicateur cible directement le risque initial.",
          ),
          T(
            "Le taux de contrôle au lit réellement observé.",
            "La pratique vaut davantage que la case déclarative.",
          ),
          T(
            "Le temps supplémentaire par administration.",
            "Une charge trop forte peut encourager le contournement.",
          ),
          F(
            "Uniquement le nombre d’affiches posées.",
            "La diffusion d’un support ne prouve pas son effet sur l’action.",
          ),
          T(
            "Les difficultés rapportées par les utilisateurs.",
            "Le retour terrain détecte rapidement une barrière impraticable.",
          ),
        ],
        "Le protocole pilote fonctionne depuis un mois.",
      ),
      qcm(
        "Quelles valeurs rendent l’amélioration durable ?",
        S(136, 145),
        "Humilité, discipline et équipe doivent se traduire par des comportements répétés après la fin de l’attention initiale.",
        [
          T(
            "Admettre que chacun peut confondre deux poches.",
            "L’humilité justifie des défenses au-delà de la vigilance personnelle.",
          ),
          T(
            "Réaliser le contrôle pour chaque patient.",
            "La discipline empêche les exceptions banalisées.",
          ),
          T(
            "S’autoriser mutuellement à interrompre une administration.",
            "Le travail d’équipe protège contre l’erreur individuelle.",
          ),
          F(
            "Réserver la vérification aux nouveaux professionnels.",
            "L’expérience n’annule pas la faillibilité humaine.",
          ),
          T(
            "Réexaminer régulièrement les incidents résiduels.",
            "Une culture apprenante adapte ses barrières à l’évolution du système.",
          ),
        ],
        "Six mois plus tard, aucun dommage n’est survenu mais deux écarts ont encore été interceptés.",
      ),
    ],
  },
];
const buildDq = () =>
  DQ.map((s, i) => ({
    label: `DP QCM ${i + 1} · ${s.title}`,
    allowed_voies: ["interne"],
    vignette: s.vignette,
    questions: s.questions,
  }));

const IR = [
  {
    title: "Processus et accident",
    questions: [
      qroc(
        "Quel mot désigne une action attendue qui n’a pas été réalisée ?",
        "omission",
        S(7),
        "L’omission constitue un écart du processus même si aucun dommage n’en résulte.",
      ),
      qroc(
        "Quel mécanisme décrit l’emploi d’un plan inadapté à l’objectif ?",
        "erreur de planification|mauvais plan",
        S(7),
        "La bonne exécution d’une stratégie erronée reste une erreur de processus.",
      ),
      qroc(
        "Quelle proportion des événements chirurgicaux étudiés était évitable ?",
        "43,5 %",
        S(3, 4),
        "La part évitable rend l’action sur le système et ses barrières prioritaire.",
      ),
      qroc(
        "Combien d’activités quotidiennes étaient relevées par patient en réanimation ?",
        "178",
        S(16, 18),
        "La multiplication des interactions explique l’impact cumulé d’un taux d’erreur faible.",
      ),
      qroc(
        "Quel résultat clinique peut survenir sans erreur préalable ?",
        "un accident|une complication non évitable",
        S(22),
        "Une anaphylaxie illustre un accident possible malgré un processus de soins conforme.",
      ),
    ],
  },
  {
    title: "Barrières et biais",
    questions: [
      qroc(
        "Que symbolisent les trous des tranches de gruyère ?",
        "les failles des barrières de sécurité",
        S(21, 24),
        "L’accident traverse le système lorsque plusieurs défaillances deviennent simultanément perméables.",
      ),
      qroc(
        "Quel biais privilégie les données compatibles avec l’idée initiale ?",
        "biais de confirmation",
        S(26, 29),
        "La recherche volontaire d’un élément contradictoire limite ce filtrage sélectif.",
      ),
      qroc(
        "Quel biais maintient un plan malgré des informations nouvelles ?",
        "biais d’ancrage",
        S(27, 31),
        "Une réévaluation programmée aide à intégrer l’évolution au lieu de préserver le cadre ancien.",
      ),
      qroc(
        "Quel biais pousse à traiter uniquement pour ne pas rester inactif ?",
        "biais de commission",
        S(27, 31),
        "L’action ne devient justifiée qu’après comparaison de son bénéfice avec l’abstention.",
      ),
      qroc(
        "Quel mode de raisonnement compare plusieurs hypothèses ?",
        "raisonnement analytique",
        S(31),
        "Il ralentit volontairement la décision afin d’examiner données, options et conséquences.",
      ),
    ],
  },
  {
    title: "Compétences d’équipe",
    questions: [
      qroc(
        "Combien de domaines principaux regroupe l’ANTS ?",
        "4|quatre",
        S(58, 64),
        "Gestion des tâches, équipe, situation et décision structurent les comportements observables.",
      ),
      qroc(
        "Quel total maximal peut obtenir un professionnel à l’ANTS ?",
        "60",
        S(60, 64),
        "Quinze items cotés jusqu’à quatre points donnent un maximum de soixante.",
      ),
      qroc(
        "Quel domaine ANTS apprécie perception, compréhension et anticipation ?",
        "conscience de la situation",
        S(60, 65),
        "Partager la gravité et les tendances permet de construire une représentation collective.",
      ),
      qroc(
        "Quelle fonction doit fixer les priorités pendant une crise ?",
        "leadership|leader",
        S(36, 37),
        "Le leader conserve une vision globale, répartit les rôles et organise les réévaluations.",
      ),
      qroc(
        "Quelle cible vitale a été insuffisamment priorisée dans le cas Bromiley ?",
        "oxygénation",
        S(36, 37),
        "La succession des tentatives d’intubation a prolongé une hypoxie majeure.",
      ),
    ],
  },
  {
    title: "Communication",
    questions: [
      qroc(
        "Quel élément doit précéder un ordre pour éviter la responsabilité diffuse ?",
        "le nom du destinataire|un destinataire nommé",
        S(64, 67),
        "Une mission adressée à une personne identifiable ne peut être supposée prise par un autre.",
      ),
      qroc(
        "Que doit faire le destinataire après avoir reçu un ordre critique ?",
        "le répéter|reformuler l’ordre",
        S(64, 67),
        "La répétition expose immédiatement une erreur de compréhension ou d’unité.",
      ),
      qroc(
        "Que doit annoncer le destinataire après avoir agi ?",
        "l’exécution et son résultat",
        S(64, 67),
        "Le retour actualise l’état de la tâche et clôt la boucle de communication.",
      ),
      qroc(
        "Quel dispositif donne une parole explicite à chaque membre ?",
        "tour de table",
        S(129, 134),
        "L’expression nominative fait apparaître les informations minoritaires masquées par le groupe.",
      ),
      qroc(
        "Quel rythme d’échanges favorise la détection d’une incompréhension ?",
        "communications courtes et fréquentes",
        S(133, 134),
        "Des mises à jour rapprochées corrigent plus tôt un modèle mental divergent.",
      ),
    ],
  },
  {
    title: "Aides cognitives",
    questions: [
      qroc(
        "Qui lit la conduite à tenir pendant que les autres agissent ?",
        "code reader|lecteur de l’aide cognitive",
        S(76, 77),
        "La séparation entre lecture et gestes diminue la charge cognitive des opérateurs.",
      ),
      qroc(
        "Quel score sur 21 obtenait le groupe muni d’une aide cognitive ?",
        "16 sur 21|16/21",
        S(69, 75),
        "Le support a presque doublé l’exécution correcte par rapport au travail de mémoire.",
      ),
      qroc(
        "Quel outil évalue la conception d’une aide cognitive médicale ?",
        "CMAT",
        S(76),
        "Il examine structure, propriétés physiques et caractéristiques fonctionnelles du support.",
      ),
      qroc(
        "Quelle méthode entraîne l’emploi réel d’une aide avant une crise ?",
        "simulation",
        S(68, 70),
        "L’entraînement révèle ambiguïtés, problèmes d’accès et difficultés de coordination.",
      ),
      qroc(
        "Quel temps de la simulation analyse les comportements et décisions ?",
        "débriefing",
        S(90, 92),
        "Les participants relient communication, raisonnement, actions et conséquences observées.",
      ),
    ],
  },
  {
    title: "Cognition située",
    questions: [
      qroc(
        "Quel axe cognitif consiste à préparer un calcul avant l’urgence ?",
        "anticipation|distribution temporelle",
        S(79, 81),
        "La préparation antérieure rend la dose immédiatement disponible lorsque la charge augmente.",
      ),
      qroc(
        "Quel axe mobilise les connaissances des autres professionnels ?",
        "distribution sociale|cognition sociale",
        S(82, 85),
        "Une communication efficace transforme des ressources individuelles en performance collective.",
      ),
      qroc(
        "Quelle dose d’atropine correspond à 20 µg/kg pour 4,5 kg ?",
        "90 µg|0,09 mg",
        S(81),
        "Le calcul anticipé évite une conversion sous pression lors d’une bradycardie.",
      ),
      qroc(
        "Quel axe fournit une conduite sans rappel intégral de mémoire ?",
        "aide cognitive",
        S(84, 85),
        "Le support externe augmente la cognition disponible au moment de l’action.",
      ),
      qroc(
        "Combien d’axes structurent le modèle de cognition située ?",
        "5|cinq",
        S(78, 87),
        "Individu, environnement, social, anticipation et aide cognitive forment la grille.",
      ),
    ],
  },
  {
    title: "Institutions et risque",
    questions: [
      qroc(
        "En quelle année la déclaration d’Helsinki sur la sécurité a-t-elle été signée ?",
        "2010",
        S(99, 105),
        "Le texte européen fixe un cadre commun de sécurité périopératoire.",
      ),
      qroc(
        "À quelle fréquence un service doit-il produire son bilan local de sécurité ?",
        "annuellement|chaque année",
        S(110, 112),
        "Le rapport rend visibles mesures, résultats, morbidité et mortalité.",
      ),
      qroc(
        "Quel modèle cherche à exclure l’exposition au risque ?",
        "ultrasécurité",
        S(121, 122),
        "Les régulateurs, les procédures et la prévention dominent ce modèle.",
      ),
      qroc(
        "Quel modèle accepte le risque et s’appuie sur l’intelligence du groupe ?",
        "organisation hautement fiable|haute fiabilité|HFO",
        S(123, 125),
        "La récupération des imprévus repose sur l’adaptabilité collective.",
      ),
      qroc(
        "Quel exemple de soins illustre l’ultrasécurité ?",
        "transfusion sanguine",
        S(121, 122),
        "La transfusion cherche à prévenir le risque par des procédures strictes et répétées.",
      ),
    ],
  },
  {
    title: "Culture d’apprentissage",
    questions: [
      qroc(
        "Quelle erreur doit devenir une source d’apprentissage plutôt qu’une sanction ?",
        "erreur non intentionnelle",
        S(126, 131),
        "La non-punition favorise déclaration, analyse et diffusion des enseignements.",
      ),
      qroc(
        "Quel rôle contradicteur peut être institué lors d’une décision collective ?",
        "avocat du diable",
        S(132, 134),
        "Ce rôle légitime la recherche d’une faille dans le plan majoritaire.",
      ),
      qroc(
        "Quel indicateur reflète mieux la performance que le taux brut de complications ?",
        "capacité à sauver",
        S(135, 137),
        "La récupération après une complication décrit l’efficacité réelle du système de soins.",
      ),
      qroc(
        "Quelles trois valeurs soutiennent la checklist selon Gawande ?",
        "humilité, discipline et travail d’équipe",
        S(138, 139),
        "Elles permettent d’accepter, répéter et partager les barrières de sécurité.",
      ),
      qroc(
        "Quelle méthode vérifie qu’une checklist est réellement exécutée ?",
        "observation directe",
        S(135, 137),
        "Une trace cochée peut masquer une vérification incomplète des items.",
      ),
    ],
  },
];
const buildIr = () =>
  IR.map((s, i) => ({
    label: `QROC ${i + 1} · ${s.title}`,
    allowed_voies: ["externe"],
    questions: s.questions,
  }));

const DR = [
  {
    title: "Hypotension après induction",
    vignette:
      "Aline, patiente de 73 ans, devient hypotendue après l’induction d’une anesthésie générale. Le médecin conclut immédiatement à l’effet du propofol. La pression remonte brièvement sous vasopresseur, puis redescend malgré des doses croissantes.",
    questions: [
      qroc(
        "Quel biais favorise le diagnostic initial unique ?",
        "biais d’ancrage",
        S(26, 31),
        "La première interprétation risque de persister même lorsque la réponse attendue disparaît.",
      ),
      qroc(
        "Quelle évolution doit imposer une réanalyse ?",
        "échec du vasopresseur|hypotension persistante",
        S(27, 31),
        "L’absence d’effet durable contredit une cause pharmacologique simple.",
        "La pression retombe à 65/35 mmHg malgré trois bolus.",
      ),
      qroc(
        "Quel mode de raisonnement faut-il activer ?",
        "raisonnement analytique",
        S(31),
        "Il compare plusieurs mécanismes au lieu de poursuivre automatiquement le traitement initial.",
        "Une tachycardie et une pâleur apparaissent.",
      ),
      qroc(
        "Quelle hypothèse chirurgicale doit être recherchée ?",
        "hémorragie",
        S(31),
        "La tachycardie, la pâleur et l’hypotension réfractaire sont compatibles avec une perte sanguine.",
        "Le chirurgien signale un saignement inhabituel dans le champ.",
      ),
      qroc(
        "Quelle demande rend l’alerte transfusionnelle opérationnelle ?",
        "ordre nominatif avec produit, quantité et délai",
        S(64, 67),
        "Un destinataire identifié doit répéter puis annoncer l’exécution de la commande.",
        "Le besoin de produits sanguins devient urgent.",
      ),
      qroc(
        "Quel comportement collectif évite une nouvelle fixation ?",
        "réévaluation programmée|point de situation répété",
        S(58, 65),
        "Un jalon partagé confronte régulièrement le plan à la réponse réelle.",
        "Après transfusion, la pression se stabilise et le saignement diminue.",
      ),
      qroc(
        "Quel élément doit figurer dans le débriefing ?",
        "retard de changement diagnostique|persistance de l’ancrage",
        S(90, 94),
        "Relier l’hypothèse initiale aux données ignorées permet de construire une contre-mesure.",
        "Aline quitte le bloc stable après contrôle de l’hémorragie.",
      ),
    ],
  },
  {
    title: "Antibiotique presque administré au mauvais patient",
    vignette:
      "Benoît, patient de 61 ans hospitalisé en soins intensifs, voit arriver une poche d’antibiotique portant le nom de son voisin. Une aide-soignante remarque la discordance avant le branchement, mais le médicament avait déjà franchi la pharmacie et le contrôle infirmier initial.",
    questions: [
      qroc(
        "Comment qualifier l’événement avant tout dommage ?",
        "presque accident|incident intercepté",
        S(19, 23),
        "Une barrière tardive a interrompu une trajectoire qui pouvait atteindre Benoît.",
      ),
      qroc(
        "Quelle barrière a finalement fonctionné ?",
        "vérification de l’identité au lit",
        S(19, 23),
        "La comparaison au patient réel a stoppé la substitution.",
        "L’aide-soignante avait demandé à Benoît son identité.",
      ),
      qroc(
        "Quel modèle illustre l’échec successif des contrôles antérieurs ?",
        "modèle du gruyère|modèle de Reason",
        S(21, 24),
        "Plusieurs failles alignées ont laissé progresser la mauvaise poche jusqu’à la chambre.",
        "L’audit retrouve une erreur d’impression puis une validation trop rapide.",
      ),
      qroc(
        "Quelle réponse culturelle favorise un récit complet ?",
        "ne pas punir l’erreur non intentionnelle|culture juste",
        S(126, 131),
        "La protection de la déclaration permet d’explorer toutes les conditions contributives.",
        "La préparatrice craint une sanction et hésite à participer à la revue.",
      ),
      qroc(
        "Quelle modification environnementale sépare les traitements ?",
        "rangement distinct par patient",
        S(78, 87),
        "La séparation physique rend la substitution moins probable avant même la lecture de l’étiquette.",
        "Deux poches voisines avaient été placées dans le même bac.",
      ),
      qroc(
        "Quelle méthode teste la faisabilité du nouveau circuit ?",
        "simulation|test pilote",
        S(90, 94),
        "Un essai réaliste montre les contournements, délais et ambiguïtés avant généralisation.",
        "Un circuit avec bacs individualisés est proposé.",
      ),
      qroc(
        "Quel indicateur ne suffit pas pour conclure au succès ?",
        "nombre de formulaires remplis|conformité documentaire seule",
        S(135, 137),
        "L’observation de l’usage réel doit compléter la trace administrative.",
        "Après trois mois, tous les contrôles sont cochés dans le dossier.",
      ),
    ],
  },
  {
    title: "Arrêt cardiaque en radiologie",
    vignette:
      "Chloé, patiente de 48 ans, présente un arrêt cardiaque dans une salle de radiologie éloignée du bloc. L’équipe locale connaît les gestes de réanimation, mais le chariot est organisé différemment et aucun briefing n’a été réalisé.",
    questions: [
      qroc(
        "Quelle ressource environnementale mal standardisée augmente la charge ?",
        "organisation du chariot d’urgence",
        S(78, 87),
        "La recherche d’un matériel inhabituellement placé mobilise une cognition nécessaire aux gestes vitaux.",
      ),
      qroc(
        "Quelle fonction doit être attribuée dès l’arrivée des renforts ?",
        "leadership|chef d’équipe",
        S(58, 65),
        "Un leader fixe les priorités et distribue les actions dans une équipe recomposée.",
        "Quatre professionnels arrivent simultanément sans savoir qui dirige.",
      ),
      qroc(
        "Quelle technique vérifie la compréhension d’une dose ?",
        "boucle de communication fermée|répétition-confirmation",
        S(64, 67),
        "La dose est répétée avec son unité puis confirmée avant injection.",
        "Une prescription d’adrénaline est émise dans le bruit.",
      ),
      qroc(
        "Qui peut lire l’algorithme pendant la réanimation ?",
        "code reader|lecteur dédié",
        S(76, 77),
        "Un membre suit la liste sans cumuler massage ou ventilation.",
        "Une fiche d’arrêt cardiaque est fixée au chariot.",
      ),
      qroc(
        "Quel type d’entraînement prépare cette coordination intersite ?",
        "simulation in situ",
        S(90, 94),
        "L’exercice dans la vraie salle teste accès, chariot, rôles et communications.",
        "La circulation reprend mais le matériel a été trouvé avec retard.",
      ),
      qroc(
        "Quel avantage apporte un chariot standardisé ?",
        "réduction de la recherche et de la charge cognitive",
        S(78, 87),
        "Une disposition constante rend l’action attendue plus rapide et plus fiable.",
        "Le débriefing compare ce chariot à celui du bloc.",
      ),
      qroc(
        "Quel apprentissage doit être diffusé au-delà de la radiologie ?",
        "retour d’expérience anonymisé",
        S(54, 55),
        "D’autres sites éloignés peuvent corriger la même vulnérabilité avant un accident.",
        "La revue retrouve trois organisations différentes dans l’hôpital.",
      ),
    ],
  },
  {
    title: "Fatigue d’une interne",
    vignette:
      "Diane, patiente de 19 ans, est admise la nuit pour fièvre et agitation. L’interne qui l’évalue termine une garde prolongée, hésite sur le diagnostic et n’arrive pas à joindre immédiatement son senior. Elle prescrit un traitement sédatif puis s’occupe d’une autre urgence.",
    questions: [
      qroc(
        "Quel facteur organisationnel dégrade son jugement ?",
        "fatigue|manque de repos",
        S(33, 35),
        "Une durée de travail prolongée altère attention, mémoire et capacité de réévaluation.",
      ),
      qroc(
        "Quelle ressource doit être accessible face à l’incertitude ?",
        "supervision senior|médecin senior",
        S(33, 35),
        "Le recours à une expertise externe fait partie d’une prise en charge compétente.",
        "Diane devient plus agitée malgré le premier traitement.",
      ),
      qroc(
        "Quel biais peut faire interpréter l’agitation comme une preuve du diagnostic initial ?",
        "biais de confirmation",
        S(26, 29),
        "Le même signe est relu dans le sens attendu au lieu d’ouvrir une hypothèse toxique ou neurologique.",
        "L’interne conserve l’étiquette de trouble fonctionnel.",
      ),
      qroc(
        "Quelle conduite rompt l’ancrage ?",
        "formuler des hypothèses alternatives",
        S(27, 31),
        "Une nouvelle liste diagnostique force l’intégration des données incompatibles.",
        "Une hyperthermie et une rigidité apparaissent.",
      ),
      qroc(
        "Quel message transmet correctement la gravité au senior ?",
        "message nominatif avec signes objectifs et demande immédiate",
        S(64, 67),
        "Température, rigidité, évolution et besoin de renfort doivent être explicites.",
        "Le senior rappelle enfin le service.",
      ),
      qroc(
        "Quelle réforme structurelle réduit ce risque ?",
        "limitation du temps de travail|repos de garde",
        S(33, 35),
        "Le repos traite le déterminant organisationnel plutôt que d’exiger une vigilance illimitée.",
        "L’analyse révèle plusieurs gardes dépassant vingt heures.",
      ),
      qroc(
        "Pourquoi inclure les presque accidents liés à la fatigue dans le bilan ?",
        "détecter une vulnérabilité récurrente",
        S(110, 112),
        "Le rapport annuel peut transformer des épisodes dispersés en signal institutionnel.",
        "Diane récupère après une prise en charge adaptée sans séquelle.",
      ),
    ],
  },
  {
    title: "Préparation d’une bradycardie",
    vignette:
      "Émile, patient de 3 ans pesant 15 kg, doit subir une anesthésie en urgence pour une complication abdominale. Le terrain et le geste exposent à une bradycardie. L’équipe dispose d’atropine, mais la concentration de l’ampoule nécessite une dilution et aucun calcul n’a encore été préparé avant son arrivée en salle.",
    questions: [
      qroc(
        "Quel axe cognitif consiste à calculer la dose avant l’induction ?",
        "anticipation|distribution temporelle",
        S(79, 81),
        "Le calcul préparé augmente la capacité disponible si la fréquence chute brutalement.",
      ),
      qroc(
        "Quelle dose correspond à 20 µg/kg pour 15 kg ?",
        "300 µg|0,3 mg",
        S(81),
        "Vingt multiplié par quinze donne trois cents microgrammes.",
        "Le poids d’Émile est vérifié à 15 kg.",
      ),
      qroc(
        "Quelle barrière intercepte une erreur de conversion ?",
        "double contrôle indépendant",
        S(19, 25),
        "Un second calcul peut détecter un facteur dix avant l’administration.",
        "Une première feuille mentionne par erreur 3 mg.",
      ),
      qroc(
        "Quelle information doit figurer sur la seringue ?",
        "nom, concentration et dose ou volume",
        S(64, 67),
        "Une étiquette complète rend le produit exploitable sans dépendre de la mémoire.",
        "La dilution correcte est préparée avant l’entrée en salle.",
      ),
      qroc(
        "Quelle formulation déclenche l’injection sans ambiguïté ?",
        "ordre nominatif avec dose, unité et voie",
        S(64, 67),
        "Le destinataire répète 300 µg IV puis annonce l’administration.",
        "La fréquence tombe soudainement à 55/min.",
      ),
      qroc(
        "Quel élément montre que la boucle est close ?",
        "annonce de l’exécution et de la réponse",
        S(64, 67),
        "Le leader sait que la dose est injectée et peut suivre son effet.",
        "La fréquence remonte à 100/min après traitement.",
      ),
      qroc(
        "Quel support institutionnalise cette anticipation ?",
        "checklist de briefing|aide cognitive préinduction",
        S(68, 77),
        "Le support rappelle de calculer les médicaments critiques pour chaque patient.",
        "Le service veut reproduire cette préparation sans figer les doses.",
      ),
    ],
  },
  {
    title: "Décision collective en réanimation",
    vignette:
      "Farah, patiente de 76 ans en défaillance multiviscérale, ne répond plus au traitement. Une réunion rassemble réanimateur, chirurgien, infirmière et proches. Tous semblent approuver une nouvelle escalade, mais l’infirmière a observé une dégradation rapide et reste hésitante.",
    questions: [
      qroc(
        "Quel risque collectif peut masquer son désaccord ?",
        "consensus apparent|polarisation du groupe",
        S(132, 134),
        "La force du groupe peut inhiber une information minoritaire pourtant pertinente.",
      ),
      qroc(
        "Quel dispositif donne à chacun un temps de parole ?",
        "tour de table nominatif",
        S(132, 134),
        "Chaque membre exprime ses observations avant que la décision ne se ferme.",
        "Le réanimateur demande un avis successif à chaque participant.",
      ),
      qroc(
        "Quelle contribution spécifique apporte l’infirmière ?",
        "évolution longitudinale de Farah|tendance clinique",
        S(82, 83),
        "Sa présence continue fournit des données que les évaluations ponctuelles peuvent manquer.",
        "Elle décrit une perte d’autonomie et des signes de souffrance croissants.",
      ),
      qroc(
        "Quel mode de raisonnement compare escalade et abstention ?",
        "raisonnement analytique",
        S(31),
        "Bénéfices, risques, objectifs et option de non-escalade doivent être explicitement confrontés.",
        "Le pronostic est reformulé avec les nouvelles informations.",
      ),
      qroc(
        "Quel biais pousserait à ajouter un traitement sans bénéfice attendu ?",
        "biais de commission",
        S(31),
        "L’action peut rassurer l’équipe sans améliorer le résultat pour Farah.",
        "Une nouvelle procédure invasive est proposée uniquement pour ne pas renoncer.",
      ),
      qroc(
        "Quelle communication doit être partagée avec les proches ?",
        "objectifs, options et incertitudes",
        S(58, 67),
        "Un modèle mental commun repose sur des faits compréhensibles et une décision explicitée.",
        "L’équipe conclut que la procédure ne correspond plus aux objectifs de soins.",
      ),
      qroc(
        "Quelle ressource transforme cette réunion en apprentissage futur ?",
        "débriefing|retour d’expérience",
        S(90, 94),
        "Analyser la manière dont la voix minoritaire a modifié la décision renforce la culture collective.",
        "Farah reçoit ensuite des soins proportionnés à ses objectifs.",
      ),
    ],
  },
  {
    title: "Checklist de salle d’opération",
    vignette:
      "Gabriel, patient de 46 ans, est installé pour une chirurgie urgente. La checklist est habituellement récitée rapidement par une seule personne. Ce jour-là, une allergie antibiotique est inscrite dans le dossier mais absente du programme et inconnue de l’anesthésiste.",
    questions: [
      qroc(
        "Quelle fonction de la checklist a échoué ?",
        "partage collectif des informations critiques",
        S(41, 45),
        "Une récitation non interactive ne construit pas de conscience commune du risque.",
      ),
      qroc(
        "Quelle donnée doit interrompre l’antibioprophylaxie prévue ?",
        "allergie antibiotique documentée",
        S(41, 45),
        "La discordance doit être résolue avant toute administration.",
        "L’infirmière lit l’allergie pendant le time-out.",
      ),
      qroc(
        "Quelle formulation sécurise l’arrêt ?",
        "alerte explicite demandant de suspendre l’injection",
        S(64, 67),
        "Le risque, le destinataire et l’action attendue doivent être nommés.",
        "La seringue est déjà connectée mais pas injectée.",
      ),
      qroc(
        "Quel mécanisme vérifie le nouvel antibiotique choisi ?",
        "boucle fermée|répétition-confirmation",
        S(64, 67),
        "Le nom et la dose sont répétés puis confirmés avant administration.",
        "Une alternative est prescrite après vérification.",
      ),
      qroc(
        "Comment contrôler l’utilisation réelle de la checklist ?",
        "observation directe",
        S(135, 137),
        "La présence d’une case ne prouve pas une participation ni une vérification effectives.",
        "Le dossier électronique affichait pourtant la checklist complète.",
      ),
      qroc(
        "Qui doit participer à sa révision ?",
        "utilisateurs de terrain|équipe pluridisciplinaire",
        S(135, 139),
        "Les professionnels identifient les pressions, ambiguïtés et contournements du travail réel.",
        "Le service prépare une nouvelle modalité de time-out.",
      ),
      qroc(
        "Quelles valeurs garantissent son maintien quotidien ?",
        "humilité, discipline et travail d’équipe",
        S(138, 139),
        "Accepter l’erreur possible, répéter la règle et partager les rôles rendent la barrière durable.",
        "Six mois plus tard, aucune nouvelle injection allergène n’a été signalée.",
      ),
    ],
  },
  {
    title: "Implantation d’une aide cognitive",
    vignette:
      "Hélène, patiente de 52 ans, présente une anaphylaxie au bloc. Une aide cognitive récente est disponible sur une tablette, mais le personnel ignore le mot de passe et revient à une prise en charge de mémoire. L’évolution est favorable après plusieurs hésitations.",
    questions: [
      qroc(
        "Pourquoi le support n’a-t-il pas constitué une barrière ?",
        "il était inaccessible|absence d’accès opérationnel",
        S(68, 77),
        "Une ressource techniquement présente mais inutilisable reste un trou dans la défense.",
      ),
      qroc(
        "Quelle méthode aurait révélé ce problème avant l’événement ?",
        "simulation in situ",
        S(68, 70),
        "L’usage réel dans la salle aurait exposé immédiatement le verrouillage.",
        "Le mot de passe n’avait jamais été testé pendant un exercice.",
      ),
      qroc(
        "Qui doit lire l’aide pendant que les traitements sont administrés ?",
        "code reader|lecteur dédié",
        S(76, 77),
        "La lecture continue protège les opérateurs d’une double tâche.",
        "Une version papier est ensuite ajoutée au chariot.",
      ),
      qroc(
        "Quel outil guide l’évaluation ergonomique du support ?",
        "CMAT",
        S(76),
        "Structure, propriétés physiques et caractéristiques fonctionnelles doivent être examinées.",
        "L’équipe constate que le texte de la version papier est très dense.",
      ),
      qroc(
        "Quel résultat de simulation montre l’intérêt d’une aide accessible ?",
        "16/21 contre 8,8/21",
        S(69, 75),
        "Une ressource externe a presque doublé les étapes accomplies à connaissances égales.",
        "La direction demande une justification pédagogique du projet.",
      ),
      qroc(
        "Quel type d’informations recueillir pendant le test ?",
        "omissions, temps d’accès et compréhension",
        S(68, 77),
        "L’évaluation doit porter sur l’action réelle, pas seulement sur l’exactitude du contenu.",
        "Trois équipes testent le support dans des scénarios différents.",
      ),
      qroc(
        "Quel suivi garantit l’apprentissage institutionnel ?",
        "audit et retour d’expérience régulier",
        S(110, 112),
        "Les incidents, usages et résultats alimentent une amélioration continue du dispositif.",
        "La nouvelle aide est déployée dans tous les secteurs anesthésiques.",
      ),
    ],
  },
];
const buildDr = () =>
  DR.map((s, i) => ({
    label: `DP QROC ${i + 1} · ${s.title}`,
    allowed_voies: ["externe"],
    vignette: s.vignette,
    questions: s.questions,
  }));


function validateSourceBlocks(extract, content) {
  const valid = new Set(
    (extract.blocs || []).filter((b) => b.id).map((b) => b.id),
  );
  const visit = (v) => {
    if (!v || typeof v !== "object") return;
    if (Array.isArray(v)) {
      v.forEach(visit);
      return;
    }
    if (v.sourceBlocks)
      for (const id of v.sourceBlocks)
        if (!valid.has(id)) throw new Error(`sourceBlock absent: ${id}`);
    Object.values(v).forEach(visit);
  };
  visit(content);
}
export function buildChapter33(extract) {
  const fiche = buildFiche(),
    flashcards = buildFlashcards(),
    series = [...buildIq(), ...buildDq(), ...buildIr(), ...buildDr()];
  const result = { fiche, flashcards, series };
  validateSourceBlocks(extract, result);
  return result;
}
export default buildChapter33;
