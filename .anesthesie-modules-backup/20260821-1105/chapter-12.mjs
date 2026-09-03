const row = (concept, bullets, sourceBlocks, image = null) => ({
  concept,
  bullets,
  sourceBlocks,
  ...(image ? { image } : {}),
});
const fullImage = (path, caption, sourceCaption = null) => ({
  path,
  position: "after",
  size: "large",
  layout: "full_width",
  containsText: true,
  caption,
  ...(sourceCaption ? { sourceCaption } : {}),
});

const IMAGES = {
  complicationsA: fullImage(
    "img/img_001.png",
    "Complications peranesthésiques : prévention et traitement immédiat",
    "TABLEAU 12.1 Les principales causes de complications peranesthésiques",
  ),
  complicationsB: fullImage("img/img_002.png", null),
  ring: fullImage(
    "img/img_003.png",
    "Gravité d’une hypersensibilité selon Ring et Messmer",
    "TABLEAU 12.2 Description des signes cliniques observés aux différents degrés de la classification de Ring et Messmer modifiée",
  ),
  allergensA: fullImage(
    "img/img_004.png",
    "Agents les plus souvent impliqués dans l’hypersensibilité périopératoire",
    "TABLEAU 12.3 Principaux agents responsables d'accidents d'hypersensibilité périanesthésique",
  ),
  allergensB: fullImage("img/img_005.png", null),
  betaLactam: fullImage("img/img_006.png", null),
  anaphylaxisCare: fullImage(
    "img/img_007.png",
    "Traitement gradué d’une hypersensibilité grave",
    "TABLEAU 12.4 Description des principaux paramètres du traitement curatif en cas de réaction d’hypersensibilité grave",
  ),
  hmTriggers: fullImage(
    "img/img_008.png",
    "Médicaments déclencheurs d’une hyperthermie maligne",
    "TABLEAU 12.5 Agents déclencheurs de l'hyperthermie maligne",
  ),
  hmSigns: fullImage(
    "img/img_009.png",
    "Signes cliniques et biologiques d’une crise d’hyperthermie maligne",
    "TABLEAU 12.6 Signes et symptômes d'une crise d'hyperthermie maligne",
  ),
  hmCare: fullImage(
    "img/img_010.png",
    "Algorithme de traitement d’une crise d’hyperthermie maligne",
    "FIGURE 12.2 Traitement de la crise catabolique de l'hyperthermie maligne",
  ),
  hmScore: fullImage(
    "img/img_011.png",
    "Éléments du score clinique d’hyperthermie maligne",
    "TABLEAU 12.7 Échelle du registre nord-américain de l’hyperthermie maligne",
  ),
  hmProbability: fullImage(
    "img/img_012.png",
    "Probabilité clinique d’hyperthermie maligne selon le score",
    "TABLEAU 12.8 Échelle du registre nord-américain de l'hyperthermie maligne",
  ),
  awarenessRisks: fullImage(
    "img/img_013.png",
    "Facteurs de risque d’éveil avec mémorisation",
    "TABLEAU 12.9 Facteurs de risque d'éveil sous anesthésie",
  ),
  brice: fullImage(
    "img/img_014.png",
    "Questions structurées du questionnaire de Brice",
    "TABLEAU 12.10 Questionnaire de Brice",
  ),
};

function buildFiche() {
  const parts = [
    {
      title:
        "Mesurer le risque sans confondre anesthésie et parcours opératoire",
      sections: [
        {
          title: "Lire les données de sécurité avec méthode",
          rows: [
            row(
              "Progrès historique",
              [
                "La mortalité directement liée à l’anesthésie a été divisée par environ dix entre 1980 et 2000 en France.",
                "Ce résultat repose sur l’évaluation préopératoire, le monitorage standardisé, la SSPI, la formation et l’organisation.",
              ],
              ["b00004", "b00011", "b00012"],
            ),
            row(
              "Dénominateur mouvant",
              [
                {
                  text: "Une incidence n’est interprétable qu’avec son contexte.",
                  children: [
                    "Population et gravité du terrain",
                    "Nature et urgence de la chirurgie",
                    "Durée du suivi postopératoire",
                    "Pratiques et ressources du système de soins",
                  ],
                },
                "L’augmentation des actes non chirurgicaux et mini-invasifs abaisse mécaniquement certaines moyennes.",
              ],
              ["b00005", "b00006", "b00007"],
            ),
            row(
              "Technique anesthésique",
              [
                "Les données ne permettent pas d’attribuer un bénéfice majeur et constant à l’ALR sur la mortalité ou le cancer.",
                "L’effet du terrain et de la chirurgie dépasse le plus souvent celui de la technique anesthésique.",
              ],
              ["b00008", "b00009", "b00010"],
            ),
            row(
              "Extrêmes du risque",
              [
                {
                  text: "La chirurgie ambulatoire mineure expose à une mortalité globale proche de 1 pour 100 000.",
                  children: [
                    "La qualité perçue, la douleur et les NVPO deviennent alors des critères centraux",
                    "L’élargissement de l’ambulatoire à des patients complexes impose une vigilance renouvelée",
                  ],
                },
                "Après chirurgie majeure urgente chez un patient âgé et fragile, la mortalité globale peut atteindre 15 à 20 %.",
              ],
              ["b00009", "b00010"],
            ),
          ],
        },
        {
          title: "Passer d’une logique individuelle à une sécurité de système",
          rows: [
            row(
              "Médecine périopératoire",
              [
                "La sécurité se construit avant, pendant et après l’intervention.",
                "Le patient, l’anesthésiste, le chirurgien et les autres professionnels partagent information, objectifs et décisions.",
              ],
              ["b00011", "b00012", "b00013", "b00014"],
            ),
            row(
              "Complication versus causalité",
              [
                "Les complications d’organe atteignent 30 à 50 % après certaines chirurgies majeures.",
                "Une association temporelle avec l’anesthésie ne prouve pas sa responsabilité ; inflammation, chirurgie et terrain doivent être distingués.",
              ],
              ["b00016", "b00017", "b00018"],
            ),
            row(
              "Levier directement modifiable",
              [
                "Une ventilation protectrice peropératoire réduit complications pulmonaires, réintubation et recours à la ventilation non invasive.",
                "Chaque mesure préventive doit cibler un mécanisme établi plutôt qu’un risque abstrait.",
              ],
              ["b00019"],
            ),
            row(
              "Cartographie opérationnelle",
              [
                "Dépression respiratoire, intubation difficile, bronchospasme, inhalation, hypotension, lésion neurologique et erreur médicamenteuse exigent des barrières dédiées.",
                "Cécité, anaphylaxie, hyperthermie maligne et mémorisation nécessitent des conduites spécifiques.",
              ],
              ["b00020", "b00021", "b00022", "b00025", "b00026"],
              IMAGES.complicationsA,
            ),
            row(
              "Risques rares mais structurants",
              [
                "La rareté ne dispense ni de la préparation ni de l’aide cognitive.",
                "Le positionnement, la protection oculaire et l’identification des patients à risque réduisent des événements évitables.",
              ],
              ["b00020", "b00021", "b00022", "b00025", "b00026"],
              IMAGES.complicationsB,
            ),
            row(
              "Analyse systémique",
              [
                {
                  text: "Un événement sentinelle appelle une analyse des causes racines.",
                  children: [
                    "Médicaments nombreux et potentiellement létaux",
                    "Ampoules ou présentations proches",
                    "Fatigue, stress et interruptions de tâche",
                    "Transmission ou récupération imparfaite",
                  ],
                },
                "L’objectif est de renforcer les barrières, pas de rechercher un coupable unique.",
              ],
              ["b00027"],
            ),
          ],
        },
      ],
    },
    {
      title: "Reconnaître et traiter l’hypersensibilité périopératoire",
      sections: [
        {
          title: "Identifier le syndrome malgré une présentation incomplète",
          renderChunks: [3, 2],
          rows: [
            row(
              "Deux mécanismes",
              [
                "Une hypersensibilité peut être allergique, médiée notamment par IgE ou IgG, ou non allergique par libération/activation de médiateurs.",
                "L’anaphylaxie désigne une réaction rapide et grave, quel que soit le mécanisme.",
              ],
              ["b00040", "b00041"],
            ),
            row(
              "Temporalité",
              [
                "La majorité survient en quelques minutes et avant deux heures.",
                "Des réactions retardées, surtout cutanées, peuvent apparaître plusieurs heures ou jours après l’exposition.",
              ],
              ["b00040"],
            ),
            row(
              "Grades cliniques",
              [
                {
                  text: "La gravité progresse de manifestations cutanéo-muqueuses isolées vers la défaillance vitale.",
                  children: [
                    "Grade I : signes cutanéo-muqueux",
                    "Grade II : atteinte modérée multiviscérale",
                    "Grade III : menace vitale",
                    "Grade IV : arrêt cardio-respiratoire",
                  ],
                },
              ],
              ["b00041", "b00042"],
              IMAGES.ring,
            ),
            row(
              "Présentation au bloc",
              [
                {
                  text: "L’hypotension est le signe initial le plus fréquent, mais l’expression dépend de l’organe dominant.",
                  children: [
                    "Tachycardie ou bradycardie lorsque l’atteinte circulatoire prédomine",
                    "Bronchospasme et désaturation lorsque l’atteinte respiratoire domine",
                  ],
                },
                "Les signes cutanés peuvent manquer au début et apparaître secondairement.",
              ],
              ["b00044"],
            ),
            row(
              "Réfractarité",
              [
                "Une persistance du choc plus de dix minutes malgré un traitement recommandé définit l’anaphylaxie réfractaire.",
                {
                  text: "Plusieurs terrains sont associés aux formes létales.",
                  children: [
                    "Classe ASA élevée",
                    "Obésité",
                    "Traitement bêtabloquant ou inhibiteur de l’enzyme de conversion",
                  ],
                },
              ],
              ["b00045", "b00047"],
            ),
          ],
        },
        {
          title: "Retrouver l’agent et éviter les exclusions infondées",
          rows: [
            row(
              "Épidémiologie utile",
              [
                "Les formes graves sont proches d’un cas pour 10 000 anesthésies générales.",
                "La mortalité européenne rapportée atteint environ 3 à 4 % des accidents anaphylactiques.",
                "L’incidence observée varie avec les produits employés et les pratiques nationales.",
              ],
              ["b00046", "b00047"],
            ),
            row(
              "Agents dominants",
              [
                {
                  text: "Curares et antibiotiques restent les causes principales.",
                  children: [
                    "Les curares demeurent la première cause dans de nombreux pays, surtout les aminostéroïdes",
                    "Les antibiotiques occupent souvent le deuxième rang, avec une prédominance des pénicillines",
                  ],
                },
                "Sugammadex, chlorhexidine et colorants ont pris une place croissante selon les pratiques et les pays.",
              ],
              ["b00048", "b00049", "b00050", "b00053", "b00054"],
              IMAGES.allergensA,
            ),
            row(
              "Agents moins fréquents",
              [
                "Latex, AINS, colloïdes, produits sanguins, opioïdes, anesthésiques et protamine restent possibles.",
                "Un anesthésique local est exceptionnellement responsable et doit être testé avant une exclusion définitive.",
              ],
              ["b00048", "b00049", "b00050", "b00053", "b00054"],
              IMAGES.allergensB,
            ),
            row(
              "Chlorhexidine cachée",
              [
                "Elle se trouve dans antiseptiques, compresses, gels urétraux, dentifrices et cathéters imprégnés.",
                "Une réaction retardée après l’induction ne doit pas la faire écarter.",
              ],
              ["b00054"],
            ),
            row(
              "Bêta-lactamine suspectée",
              [
                "Une étiquette non vérifiée expose à une antibioprophylaxie alternative parfois moins efficace.",
                "La consultation d’allergo-anesthésie organise tests cutanés ou de provocation selon le type et la gravité de l’histoire.",
              ],
              [
                "b00055",
                "b00056",
                "b00057",
                "b00058",
                "b00059",
                "b00060",
                "b00061",
                "b00062",
                "b00063",
                "b00064",
                "b00065",
              ],
              IMAGES.betaLactam,
            ),
            row(
              "Orienter l’exploration",
              [
                "Une histoire bénigne ancienne, non prurigineuse ou faite de symptômes non spécifiques relève volontiers d’une provocation encadrée.",
                "Une urticaire, un rash mal caractérisé ou une histoire traitée comme grave conduit d’abord aux tests cutanés.",
              ],
              ["b00055", "b00056", "b00057", "b00058", "b00065"],
            ),
          ],
        },
        {
          title: "Traiter d’abord ce qui tue",
          rows: [
            row(
              "Mesures communes",
              [
                "Arrêter l’agent suspect, appeler de l’aide, administrer O2, sécuriser les voies aériennes et disposer d’une aide cognitive.",
                "Prélever la tryptase sans retarder adrénaline ni remplissage.",
              ],
              ["b00068", "b00070"],
            ),
            row(
              "Grade I",
              [
                "Le retrait de l’agent et le traitement symptomatique suffisent habituellement.",
                "L’adrénaline n’est pas recommandée en l’absence d’atteinte respiratoire ou circulatoire.",
              ],
              ["b00068"],
            ),
            row(
              "Grades II et III",
              [
                {
                  text: "L’adrénaline IV est titrée à la gravité et à la réponse.",
                  children: [
                    "Grade II : bolus de 10 à 20 µg",
                    "Grade III : bolus initial de 50 µg",
                    "Échec sans aggravation : 100 puis 200 µg espacés",
                  ],
                },
                "Un bolus rapide de cristalloïde restaure le secteur vasculaire très déplété.",
              ],
              ["b00068", "b00070"],
              IMAGES.anaphylaxisCare,
            ),
            row(
              "Grade IV et choc réfractaire",
              [
                "Commencer le massage cardiaque et administrer 1 mg d’adrénaline.",
                "Après fortes doses cumulées, envisager noradrénaline continue ; le glucagon est discuté sous bêtabloquant.",
              ],
              ["b00070"],
            ),
            row(
              "Après stabilisation",
              [
                "Surveiller au moins six heures après récupération clinique.",
                "Tracer les produits et horaires, orienter en allergo-anesthésie et remettre des consignes d’éviction provisoires.",
              ],
              [
                "b00068",
                "b00070",
                "b00079",
                "b00080",
                "b00081",
                "b00082",
                "b00083",
                "b00084",
              ],
            ),
          ],
        },
      ],
    },
    {
      title: "Interrompre une crise d’hyperthermie maligne",
      sections: [
        {
          title: "Comprendre le déclenchement et reconnaître tôt",
          rows: [
            row(
              "Mécanisme",
              [
                "L’HM est une myopathie génétique du muscle strié, habituellement silencieuse.",
                "Une libération calcique incontrôlée par le récepteur ryanodine produit contracture, hypermétabolisme et rhabdomyolyse.",
              ],
              ["b00086"],
            ),
            row(
              "Transmission et susceptibilité",
              [
                "La transmission est le plus souvent autosomique dominante ; des mutations spontanées existent.",
                "La prévalence est estimée entre 1/5 000 et 1/10 000.",
              ],
              ["b00090", "b00091"],
            ),
            row(
              "Déclencheurs",
              [
                "Les anesthésiques volatils et la succinylcholine sont les déclencheurs reconnus.",
                "Anesthésiques locaux, agents IV et protoxyde d’azote sont compatibles avec une technique sans déclencheur.",
              ],
              ["b00086", "b00087", "b00136"],
              IMAGES.hmTriggers,
            ),
            row(
              "Signal précoce",
              [
                "Une hausse progressive inexpliquée du CO2 expiré est le signe le plus précoce.",
                "La rigidité est plus spécifique mais inconstante ; l’hyperthermie peut être tardive.",
              ],
              ["b00093", "b00094", "b00095"],
            ),
            row(
              "Syndrome constitué",
              [
                {
                  text: "La crise associe hypermétabolisme et destruction musculaire.",
                  children: [
                    "Hypercapnie, tachycardie et instabilité",
                    "Rigidité, rhabdomyolyse et hyperkaliémie",
                    "Acidose mixte, hyperthermie et myoglobinurie",
                    "Arythmie, CIVD, SDRA ou insuffisance rénale",
                  ],
                },
              ],
              ["b00095", "b00096", "b00097", "b00099"],
              IMAGES.hmSigns,
            ),
            row(
              "Récidive",
              [
                "Une rechute est possible sans nouvelle exposition.",
                "La surveillance intensive et le dantrolène d’entretien couvrent les 24 à 48 premières heures.",
              ],
              ["b00100", "b00112", "b00113", "b00114"],
            ),
          ],
        },
        {
          title: "Exécuter simultanément traitement spécifique et réanimation",
          rows: [
            row(
              "Déclenchement de la procédure",
              [
                "Cesser immédiatement le volatile ou la succinylcholine, appeler de l’aide et préparer le dantrolène.",
                "Ventiler avec O2 à 100 % et un débit de gaz frais supérieur à 10 L/min.",
              ],
              ["b00102", "b00103"],
            ),
            row(
              "Dantrolène",
              [
                {
                  text: "Administrer 2,5 mg/kg IV toutes les cinq minutes.",
                  children: [
                    "Poursuivre jusqu’à régression de l’hypercapnie, rigidité, tachycardie, température et acidose",
                    "Dose cumulée initiale maximale : 10 mg/kg",
                    "Chaque flacon de 20 mg est dilué dans 60 mL d’eau stérile",
                  ],
                },
              ],
              ["b00103", "b00104"],
            ),
            row(
              "Bilan et monitorage",
              [
                "Prélever gaz, électrolytes, glycémie, créatinine, CK, myoglobine, NFS-plaquettes et coagulation.",
                "Poser une sonde urinaire et viser une diurèse supérieure à 2 mL/kg/h.",
              ],
              ["b00104", "b00105", "b00106"],
            ),
            row(
              "Corrections associées",
              [
                "Traiter acidose et hyperkaliémie ; le calcium n’est donné que pour une arythmie sévère liée à l’hyperkaliémie.",
                "Éviter les inhibiteurs calciques avec le dantrolène ; la lidocaïne est utilisable pour une arythmie ventriculaire.",
              ],
              ["b00106"],
            ),
            row(
              "Décontamination et refroidissement",
              [
                "Remplacer circuit et chaux sodée si le temps le permet ou utiliser des filtres au charbon activé.",
                "Refroidir si la température continue de monter et arrêter vers 38 °C.",
              ],
              ["b00107", "b00111"],
            ),
            row(
              "Algorithme complet",
              [
                "Le traitement initial, les corrections, la réanimation intensive et le suivi familial doivent être anticipés.",
                "La rapidité du dantrolène conditionne le pronostic.",
              ],
              [
                "b00102",
                "b00103",
                "b00104",
                "b00105",
                "b00106",
                "b00107",
                "b00108",
                "b00110",
                "b00111",
                "b00112",
                "b00113",
                "b00114",
              ],
              IMAGES.hmCare,
            ),
          ],
        },
        {
          title: "Confirmer, différencier et prévenir une nouvelle crise",
          rows: [
            row(
              "Diagnostic différentiel",
              [
                "Sepsis, crise thyréotoxique, phéochromocytome, rhabdomyolyse, syndrome malin des neuroleptiques et anaphylaxie peuvent mimer l’HM.",
                "En cas de doute aigu, traiter d’abord l’HM, entité la plus rapidement létale.",
              ],
              ["b00115", "b00116", "b00117"],
            ),
            row(
              "Score clinique",
              [
                {
                  text: "Le score NAMHR agrège des processus cliniques et biologiques concordants.",
                  children: [
                    "Rigidité musculaire",
                    "Lyse musculaire",
                    "Acidose respiratoire",
                    "Hyperthermie",
                    "Atteinte cardiaque",
                    "Histoire familiale",
                  ],
                },
                "Il estime la probabilité d’un épisode, mais ne remplace pas le traitement urgent.",
              ],
              [
                "b00119",
                "b00120",
                "b00121",
                "b00122",
                "b00124",
                "b00125",
                "b00126",
                "b00127",
                "b00128",
                "b00129",
                "b00130",
              ],
              IMAGES.hmScore,
            ),
            row(
              "Probabilité graduée",
              [
                "Le total classe l’événement de presque jamais à presque certain.",
                "Un épisode suggestif conduit à une exploration spécialisée.",
              ],
              ["b00119", "b00120", "b00121", "b00131"],
              IMAGES.hmProbability,
            ),
            row(
              "Test de référence",
              [
                "Le test de contracture halothane-caféine sur biopsie musculaire est sensible mais invasif et peu disponible.",
                "Les tests génétiques ne couvrent pas toutes les mutations.",
              ],
              ["b00119", "b00120", "b00121", "b00133"],
            ),
            row(
              "Anesthésie d’un patient susceptible",
              [
                {
                  text: "Construire une anesthésie sans agent déclencheur.",
                  children: [
                    "ALR ou anesthésie IV possibles",
                    "Retirer les vaporisateurs, changer circuit et chaux, purger selon la machine",
                    "Monitorer CO2 expiré et température",
                    "Disposer immédiatement de 10 mg/kg de dantrolène",
                  ],
                },
                "La prophylaxie systématique par dantrolène n’est plus indiquée.",
              ],
              ["b00134", "b00135", "b00136", "b00137", "b00138", "b00139"],
            ),
            row(
              "Ambulatoire encadré",
              [
                "L’ambulatoire est possible après une technique sûre, avec observation 2 à 4 heures en SSPI.",
                "Une personne responsable surveille 24 heures et un recours anesthésique doit rester accessible.",
              ],
              ["b00140"],
            ),
          ],
        },
      ],
    },
    {
      title:
        "Prévenir, diagnostiquer et accompagner la conscience sous anesthésie",
      sections: [
        {
          title: "Distinguer inconscience, amnésie et mémorisation",
          rows: [
            row(
              "Complication à fort impact",
              [
                {
                  text: "Un épisode avec douleur ou paralysie peut entraîner une séquelle psychique durable.",
                  children: [
                    "Anxiété et hypervigilance",
                    "Cauchemars ou flashbacks",
                    "Évitement des soins",
                    "Syndrome de stress post-traumatique",
                  ],
                },
                "Prévenir, reconnaître et accompagner font partie intégrante du traitement.",
              ],
              ["b00160", "b00174", "b00175", "b00176"],
            ),
            row(
              "Neurophysiologie",
              [
                "Les hypnotiques GABAergiques désorganisent les intégrations cortico-corticale et thalamo-corticale.",
                "Aucun moniteur ne distingue à lui seul, avec certitude, conscience et inconscience.",
              ],
              ["b00161"],
            ),
            row(
              "Cause dominante",
              [
                {
                  text: "Le sous-dosage hypnotique est la cause la plus fréquente.",
                  children: [
                    "Dose limitée par l’instabilité hémodynamique",
                    "Intubation difficile après la dose d’induction",
                    "Tolérance ou besoin pharmacodynamique accru",
                    "Défaut du vaporisateur, de la pompe ou de la tubulure",
                  ],
                },
              ],
              ["b00162"],
            ),
            row(
              "Facteurs de risque",
              [
                "Obésité, curare, voie aérienne difficile, antécédent, urgence, césarienne, chirurgie cardiothoracique et TIVA augmentent le risque.",
                "L’anticipation permet de sécuriser la délivrance de l’hypnotique.",
              ],
              ["b00163", "b00164"],
              IMAGES.awarenessRisks,
            ),
            row(
              "Conscience sans souvenir",
              [
                "La technique de l’avant-bras isolé détecte une réponse motrice malgré le curare systémique.",
                "Une conscience sans remémoration est plus fréquente que l’éveil mémorisé, dont l’incidence atteint 0,1 à 0,2 % chez les sujets à risque.",
              ],
              ["b00166", "b00171"],
            ),
          ],
        },
        {
          title: "Surveiller et prévenir sans déléguer le jugement",
          rows: [
            row(
              "Volatils",
              [
                {
                  text: "La concentration expirée confirme la délivrance d’un agent volatil.",
                  children: [
                    "Programmer une alarme sous 0,7 MAC",
                    "Vérifier vaporisateur et circuit si le seuil est franchi",
                  ],
                },
                "Le BIS n’a pas montré de supériorité sur une surveillance structurée de la concentration expirée.",
              ],
              ["b00172"],
            ),
            row(
              "Monitorage neurologique ciblé",
              [
                "Il n’est pas recommandé systématiquement chez les patients sans facteur de risque.",
                "Il se discute chez les sujets sélectionnés, notamment lors d’une TIVA avec curarisation.",
              ],
              ["b00172"],
            ),
            row(
              "Prévention active",
              [
                {
                  text: "Vérifier toute la chaîne de délivrance hypnotique.",
                  children: [
                    "Vaporisateur et concentration expirée",
                    "Pousse-seringue et seringue correcte",
                    "Tubulure, connexion et perméabilité veineuse",
                  ],
                },
                "Préparer une dose hypnotique supplémentaire lors d’une voie aérienne difficile ou d’un allègement prévu.",
              ],
              ["b00162", "b00173"],
            ),
            row(
              "Suspicion peropératoire",
              [
                "Une activation sympathique avec agent expiré faible fait rechercher une anesthésie insuffisante.",
                "Un bolus de propofol 0,5 mg/kg ou de midazolam 0,05 mg/kg peut être administré, avec communication rassurante au patient.",
              ],
              ["b00174"],
            ),
          ],
        },
        {
          title: "Rechercher le souvenir et prévenir la séquelle psychique",
          rows: [
            row(
              "Questionnaire de Brice",
              [
                {
                  text: "Explorer la mémoire périopératoire sans suggérer de scénario.",
                  children: [
                    "Dernier souvenir avant l’endormissement",
                    "Premier souvenir après le réveil",
                    "Rêves éventuels",
                    "Perceptions entre endormissement et réveil",
                  ],
                },
                "La formulation structurée évite de réduire l’entretien à une question fermée.",
              ],
              ["b00166", "b00167", "b00169", "b00170"],
              IMAGES.brice,
            ),
            row(
              "Entretien médical",
              [
                "Rencontrer le patient après la récupération initiale, écouter sans nier ni suggérer.",
                "Reconnaître l’expérience et exprimer du regret ne constitue pas une admission de faute.",
              ],
              ["b00174"],
            ),
            row(
              "Suivi",
              [
                {
                  text: "Organiser un accompagnement proportionné à la détresse.",
                  children: [
                    "Entretien anesthésique de restitution",
                    "Soutien psychologique ou psychiatrique",
                    "Suivi après la sortie",
                  ],
                },
                "La thérapie cognitivo-comportementale peut traiter les symptômes persistants de stress post-traumatique.",
              ],
              ["b00174", "b00175", "b00176"],
            ),
          ],
        },
      ],
    },
  ];

  return {
    matiere: "Anesthésie-Réanimation",
    title: "Complications et sécurité en anesthésie",
    year: "2026-2027",
    coverSubtitle:
      "Prévention systémique, anaphylaxie, hyperthermie maligne et conscience peropératoire",
    imageOmissions: [],
    sourceBlocks: [
      ...new Set(
        parts.flatMap((part) =>
          part.sections.flatMap((section) =>
            section.rows.flatMap((item) => item.sourceBlocks),
          ),
        ),
      ),
    ],
    parts,
    synthesis: {
      compactLayout: true,
      chiffres: {
        headers: ["Repère", "Valeur utile"],
        rows: [
          ["Mortalité ambulatoire mineure", "Environ 1/100 000"],
          ["Mortalité chirurgie majeure fragile urgente", "Jusqu’à 15–20 %"],
          ["Anaphylaxie grave", "Environ 1/10 000 anesthésies générales"],
          ["Anaphylaxie réfractaire", "Choc persistant > 10 min"],
          ["Dantrolène initial", "2,5 mg/kg toutes les 5 min"],
          ["Dose cumulée initiale", "10 mg/kg"],
          ["Débit de gaz frais en HM", "> 10 L/min"],
          ["Diurèse cible en HM", "> 2 mL/kg/h"],
          ["Éveil mémorisé à haut risque", "0,1 à 0,2 %"],
          ["Alarme volatile", "< 0,7 MAC"],
        ],
      },
      tables: [
        {
          title: "Crises peranesthésiques",
          headers: ["Signal", "Réflexe immédiat"],
          rows: [
            [
              "Hypotension + bronchospasme après injection",
              "Arrêt agent, O2, adrénaline titrée, cristalloïdes",
            ],
            [
              "CO2 expiré croissant + rigidité",
              "Arrêt déclencheurs, O2 haut débit, dantrolène",
            ],
            [
              "Activation sympathique + hypnotique faible",
              "Vérifier délivrance, renforcer hypnotique, communiquer",
            ],
            [
              "Événement rare ou erreur",
              "Stabiliser puis analyser les causes racines",
            ],
          ],
        },
        {
          title: "Séquences à ne pas inverser",
          headers: ["Situation", "Ordre sûr"],
          rows: [
            [
              "Anaphylaxie",
              "Adrénaline et remplissage avant bilan allergologique",
            ],
            ["HM", "Dantrolène et ventilation avant confirmation diagnostique"],
            [
              "Suspicion d’éveil",
              "Corriger l’anesthésie puis documenter et suivre",
            ],
            [
              "Allergie bêta-lactamine non urgente",
              "Évaluer avant d’exclure durablement la molécule",
            ],
          ],
        },
      ],
      keyPoints: [
        "Le risque périopératoire dépend d’abord du terrain, de l’urgence et de la chirurgie.",
        "Une complication rare exige une organisation prête avant sa survenue.",
        "L’anaphylaxie peut débuter sans signe cutané ; l’adrénaline ne doit pas attendre.",
        "L’agent causal doit être exploré pour éviter une éviction médicamenteuse infondée.",
        "L’hypercapnie inexpliquée est le signe le plus précoce d’hyperthermie maligne.",
        "Le dantrolène est administré immédiatement, avant toute confirmation spécialisée.",
        "Le monitorage de profondeur ne remplace jamais la vérification de la délivrance hypnotique.",
        "Après un éveil mémorisé, écoute, reconnaissance et suivi préviennent l’aggravation psychique.",
      ],
      eclair: [
        "Sécurité : mesurer le contexte, pas seulement une incidence.",
        "Événement rare : aide cognitive, rôles distribués, simulation.",
        "Anaphylaxie : hypotension fréquente, peau parfois normale au début.",
        "Grades II–III : adrénaline IV titrée et cristalloïdes rapides.",
        "HM : volatils et succinylcholine sont les déclencheurs reconnus.",
        "HM : CO2 expiré croissant avant la fièvre.",
        "Dantrolène : 2,5 mg/kg toutes les 5 min, maximum initial 10 mg/kg.",
        "HM : éviter les inhibiteurs calciques avec le dantrolène.",
        "Éveil : sous-dosage hypnotique en première intention.",
        "Brice + entretien empathique + suivi psychologique après suspicion.",
      ],
    },
  };
}

const card = (recto, verso, sourceBlocks) => ({
  recto,
  verso,
  sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
});

function buildFlashcards() {
  return [
    card(
      "De quel facteur la mortalité anesthésique française a-t-elle diminué entre 1980 et 2000 ?",
      "D’environ un facteur dix.",
      "b00004",
    ),
    card(
      "Pourquoi une incidence périopératoire ne se compare-t-elle pas isolément ?",
      "Population, acte, urgence, suivi et système de soins changent le dénominateur.",
      ["b00005", "b00006", "b00007"],
    ),
    card(
      "Quel effet a un suivi postopératoire plus long sur la mortalité mesurée ?",
      "Il augmente le nombre d’événements attribués à la période opératoire.",
      "b00007",
    ),
    card(
      "L’ALR réduit-elle avec certitude la mortalité globale ?",
      "Non, un éventuel bénéfice paraît faible et les données restent contradictoires.",
      ["b00008", "b00025"],
    ),
    card(
      "Quel est l’ordre de grandeur de la mortalité après chirurgie ambulatoire mineure ?",
      "Environ un décès pour 100 000 actes.",
      "b00009",
    ),
    card(
      "Quels critères dominent la qualité en chirurgie ambulatoire à très faible risque ?",
      "Douleur, NVPO, organisation, relation soignante et perception du patient.",
      "b00009",
    ),
    card(
      "Quelle mortalité peut atteindre une chirurgie urgente chez un patient âgé fragile ?",
      "Environ 15 à 20 %.",
      "b00010",
    ),
    card(
      "Quels déterminants dominent la mortalité après chirurgie majeure ?",
      "Le terrain, la pathologie sous-jacente, l’urgence et la chirurgie.",
      "b00010",
    ),
    card(
      "Quelles organisations ont consolidé la sécurité anesthésique ?",
      "Évaluation préopératoire, monitorage standardisé, SSPI et formation.",
      ["b00011", "b00012", "b00026"],
    ),
    card(
      "Quel modèle remplace une activité anesthésique en silo ?",
      "La médecine périopératoire et le parcours de soins pluridisciplinaire.",
      ["b00012", "b00013"],
    ),
    card(
      "Quel rôle le patient joue-t-il dans la sécurité périopératoire ?",
      "Il participe aux soins grâce à une information et une communication adaptées.",
      ["b00013", "b00014"],
    ),
    card(
      "Quelle incidence peuvent atteindre les complications d’organe après chirurgie majeure ?",
      "Environ 30 à 50 %.",
      "b00016",
    ),
    card(
      "Pourquoi ne pas attribuer automatiquement un trouble cognitif à l’anesthésique ?",
      "Neuro-inflammation, terrain et agressivité chirurgicale peuvent prédominer.",
      ["b00017", "b00018"],
    ),
    card(
      "Quel réglage anesthésique réduit les complications pulmonaires postopératoires ?",
      "Une ventilation peropératoire protectrice.",
      "b00019",
    ),
    card(
      "Qu’est-ce qu’un événement sentinelle ?",
      "Un événement grave ou révélateur appelant une analyse systémique détaillée.",
      "b00027",
    ),
    card(
      "Quel est le but d’une analyse des causes racines ?",
      "Identifier les défaillances du système et renforcer les barrières de sécurité.",
      "b00027",
    ),
    card(
      "Pourquoi l’anesthésie est-elle exposée aux erreurs médicamenteuses ?",
      "Produits nombreux, rapides, puissants et parfois présentés dans des ampoules proches.",
      "b00027",
    ),
    card(
      "Quels facteurs humains favorisent une erreur au bloc ?",
      "Fatigue, stress, interruptions de tâche et transmissions imparfaites.",
      "b00027",
    ),
    card(
      "Quelle barrière prévient une erreur de seringue ?",
      "Étiquetage précis, code couleur, rangement standardisé et contrôle croisé.",
      ["b00020", "b00022"],
    ),
    card(
      "Quel réflexe suit une dépression respiratoire postanesthésique ?",
      "Assistance ventilatoire, oxygène et antagonisation adaptée si nécessaire.",
      ["b00020", "b00022"],
    ),
    card(
      "Quelle prévention réduit l’inhalation de liquide gastrique ?",
      "Jeûne adapté, évaluation du risque et stratégie d’induction appropriée.",
      ["b00020", "b00022"],
    ),
    card(
      "Quelle prévention protège le nerf périphérique au bloc ?",
      "Positionnement correct et limitation des pressions ou étirements prolongés.",
      ["b00020", "b00022"],
    ),
    card(
      "Quelle logique convient aux complications anesthésiques très rares ?",
      "Préparation, aide cognitive, simulation et analyse systémique après l’événement.",
      ["b00020", "b00027"],
    ),
    card(
      "Que mesure-t-on surtout en chirurgie mineure à très faible mortalité ?",
      "La qualité des soins et l’expérience rapportée par le patient.",
      ["b00009", "b00037", "b00038"],
    ),

    card(
      "Qu’est-ce qu’une hypersensibilité périopératoire allergique ?",
      "Une réaction immunologique, notamment médiée par les IgE ou les IgG.",
      "b00040",
    ),
    card(
      "Qu’est-ce qu’une hypersensibilité périopératoire non allergique ?",
      "Une activation de médiateurs sans mécanisme immunologique spécifique.",
      "b00040",
    ),
    card(
      "Quand survient la majorité des hypersensibilités liées à l’anesthésie ?",
      "En quelques minutes et avant deux heures.",
      "b00040",
    ),
    card(
      "Que signifie le terme anaphylaxie ?",
      "Une hypersensibilité rapide et grave, allergique ou non.",
      "b00041",
    ),
    card(
      "Que caractérise le grade I de Ring et Messmer ?",
      "Des signes cutanéo-muqueux sans atteinte respiratoire ou circulatoire.",
      "b00042",
    ),
    card(
      "Que caractérise le grade II de Ring et Messmer ?",
      "Une atteinte multiviscérale modérée, avec hypotension ou bronchospasme modéré.",
      "b00042",
    ),
    card(
      "Que caractérise le grade III de Ring et Messmer ?",
      "Une atteinte menaçant la vie : choc, bronchospasme sévère ou arythmie.",
      "b00042",
    ),
    card(
      "Que caractérise le grade IV de Ring et Messmer ?",
      "Un arrêt cardiaque ou respiratoire.",
      "b00042",
    ),
    card(
      "Quel est le signe initial le plus fréquent d’anaphylaxie au bloc ?",
      "L’hypotension.",
      "b00044",
    ),
    card(
      "Les signes cutanés excluent-ils l’anaphylaxie s’ils manquent au début ?",
      "Non, ils sont souvent retardés et peuvent apparaître secondairement.",
      "b00044",
    ),
    card(
      "Quelle fréquence atteint le bronchospasme pendant une anaphylaxie ?",
      "Environ 36 % à un moment de l’épisode.",
      "b00044",
    ),
    card(
      "Comment définir une anaphylaxie réfractaire ?",
      "Un choc non corrigé après plus de dix minutes de traitement recommandé.",
      "b00045",
    ),
    card(
      "Quel est l’ordre de grandeur d’une anaphylaxie grave ?",
      "Environ un cas pour 10 000 anesthésies générales.",
      "b00047",
    ),
    card(
      "Quelle mortalité européenne est rapportée après anaphylaxie périopératoire ?",
      "Environ 3 à 4 % des accidents anaphylactiques.",
      "b00047",
    ),
    card(
      "Quels terrains sont associés aux décès par anaphylaxie ?",
      "ASA élevé, obésité, bêtabloquant ou inhibiteur de l’enzyme de conversion.",
      "b00047",
    ),
    card(
      "Quels agents dominent l’anaphylaxie périopératoire ?",
      "Les curares et les antibiotiques.",
      ["b00048", "b00050"],
    ),
    card(
      "Pourquoi le latex est-il devenu une cause rare au bloc ?",
      "Son retrait des dispositifs et la modification de fabrication des gants.",
      "b00048",
    ),
    card(
      "Quel agent d’antagonisation peut provoquer une anaphylaxie ?",
      "Le sugammadex.",
      "b00049",
    ),
    card(
      "Pourquoi une sensibilisation préalable au sugammadex est-elle plausible ?",
      "Les cyclodextrines sont présentes dans aliments, médicaments et cosmétiques.",
      ["b00049", "b00053"],
    ),
    card(
      "Quelle place occupe la chlorhexidine parmi les causes récentes ?",
      "Une cause croissante, souvent après curares et antibiotiques.",
      "b00054",
    ),
    card(
      "Où peut se cacher la chlorhexidine ?",
      "Antiseptiques, compresses, gels urétraux, dentifrices et cathéters imprégnés.",
      "b00054",
    ),
    card(
      "Pourquoi explorer une étiquette d’allergie aux bêta-lactamines ?",
      "Une éviction injustifiée expose à une prophylaxie moins adaptée et plus infectiogène.",
      ["b00055", "b00077", "b00078"],
    ),
    card(
      "Quels tests explorent une suspicion de bêta-lactamine ?",
      "Tests cutanés ou tests de provocation selon l’histoire et la gravité.",
      ["b00056", "b00065"],
    ),
    card(
      "Quel traitement suffit souvent pour une réaction de grade I ?",
      "Arrêt de l’agent et traitement symptomatique, sans adrénaline systématique.",
      "b00068",
    ),
    card(
      "Quelle dose d’adrénaline IV est proposée au grade II ?",
      "Un bolus titré de 10 à 20 µg.",
      "b00070",
    ),
    card(
      "Quelle dose d’adrénaline IV est proposée d’emblée au grade III ?",
      "Un bolus de 50 µg.",
      "b00070",
    ),
    card(
      "Comment escalader l’adrénaline au grade III sans aggravation clinique ?",
      "Répéter 100 puis 200 µg IV à environ deux minutes d’intervalle.",
      "b00070",
    ),
    card(
      "Quelle dose d’adrénaline accompagne le massage au grade IV ?",
      "Un milligramme IV selon la réanimation de l’arrêt cardiaque.",
      "b00070",
    ),
    card(
      "Quel soluté utiliser rapidement dans le choc anaphylactique ?",
      "Des cristalloïdes en bolus rapides et répétés.",
      ["b00070", "b00081", "b00082"],
    ),
    card(
      "Quel traitement discuter si l’anaphylaxie résiste sous bêtabloquant ?",
      "Le glucagon intraveineux.",
      "b00070",
    ),
    card(
      "Quel prélèvement biologique documente une dégranulation mastocytaire ?",
      "La tryptase, prélevée sans retarder le traitement.",
      "b00070",
    ),
    card(
      "Combien de temps surveiller après récupération d’une réaction grave ?",
      "Au moins six heures.",
      "b00070",
    ),

    card(
      "Qu’est-ce que l’hyperthermie maligne ?",
      "Une crise hypercatabolique du muscle strié chez un sujet génétiquement susceptible.",
      "b00086",
    ),
    card(
      "Quel canal est principalement impliqué dans l’HM ?",
      "Le récepteur à la ryanodine du réticulum sarcoplasmique.",
      "b00086",
    ),
    card(
      "Quel est le mode habituel de transmission de l’HM ?",
      "Autosomique dominant.",
      "b00090",
    ),
    card(
      "Quelle est la prévalence estimée de susceptibilité à l’HM ?",
      "Environ 1/5 000 à 1/10 000.",
      "b00090",
    ),
    card(
      "Quelles maladies sont clairement associées à la susceptibilité HM ?",
      "Le syndrome de King-Denborough et la myopathie à central core.",
      "b00091",
    ),
    card(
      "Quels anesthésiques déclenchent une HM ?",
      "Les agents volatils et la succinylcholine.",
      ["b00086", "b00087"],
    ),
    card(
      "Un anesthésique local peut-il déclencher une HM ?",
      "Non, amides et esters sont utilisables chez un sujet susceptible.",
      "b00136",
    ),
    card(
      "Quel est le signe le plus précoce d’une crise d’HM ?",
      "Une augmentation progressive et inexpliquée du CO2 expiré.",
      "b00095",
    ),
    card(
      "Quel signe est le plus spécifique d’HM ?",
      "La rigidité musculaire, malgré son caractère inconstant.",
      ["b00116", "b00147", "b00148"],
    ),
    card(
      "La fièvre est-elle toujours le premier signe d’HM ?",
      "Non, elle peut être tardive ; l’hypercapnie précède souvent l’hyperthermie.",
      "b00095",
    ),
    card(
      "Quels troubles acido-basiques produit une HM sévère ?",
      "Une acidose mixte respiratoire et métabolique.",
      "b00096",
    ),
    card(
      "Quelle valeur de CK peut être observée après une HM sévère ?",
      "Souvent plus de 20 000 UI après 24 heures.",
      "b00096",
    ),
    card(
      "Quelles complications majeures suit une HM sévère ?",
      "Arythmie, IRA, CIVD, SDRA, coma et rhabdomyolyse.",
      "b00096",
    ),
    card(
      "Une crise d’HM peut-elle récidiver sans nouvelle exposition ?",
      "Oui, une rechute est possible dans les heures suivantes.",
      "b00100",
    ),
    card(
      "Quelle est la première action devant une HM suspectée ?",
      "Arrêter immédiatement tous les agents déclencheurs et appeler de l’aide.",
      "b00102",
    ),
    card(
      "Quel gaz et quel débit utiliser devant une HM ?",
      "Oxygène à 100 % avec débit de gaz frais supérieur à 10 L/min.",
      "b00103",
    ),
    card(
      "Comment diluer un flacon de 20 mg de dantrolène ?",
      "Dans 60 mL d’eau stérile.",
      "b00103",
    ),
    card(
      "Quelle dose initiale de dantrolène administrer ?",
      "2,5 mg/kg IV toutes les cinq minutes.",
      "b00104",
    ),
    card(
      "Quelle dose cumulée initiale de dantrolène viser au maximum ?",
      "Dix milligrammes par kilogramme.",
      "b00104",
    ),
    card(
      "Quels signes guident l’efficacité du dantrolène ?",
      "Baisse du CO2, de la rigidité, tachycardie, température et acidose.",
      "b00104",
    ),
    card(
      "Quel bilan prélever pendant une crise d’HM ?",
      "Gaz, ions, glycémie, créatinine, CK, myoglobine, NFS-plaquettes et coagulation.",
      "b00104",
    ),
    card(
      "Quelle diurèse viser lors d’une crise d’HM ?",
      "Plus de 2 mL/kg/h.",
      "b00106",
    ),
    card(
      "Comment traiter l’acidose de l’HM ?",
      "Hyperventilation et bicarbonate de sodium selon le bilan.",
      "b00106",
    ),
    card(
      "Quand administrer du calcium pour l’hyperkaliémie d’une HM ?",
      "Seulement si une arythmie sévère est reliée à l’hyperkaliémie.",
      "b00106",
    ),
    card(
      "Quels antiarythmiques éviter avec le dantrolène ?",
      "Les inhibiteurs calciques, qui exposent à hyperkaliémie et dépression myocardique.",
      "b00106",
    ),
    card(
      "Quel antiarythmique ventriculaire reste utilisable dans l’HM ?",
      "La lidocaïne.",
      "b00106",
    ),
    card(
      "Quel dispositif réduit les traces de volatile dans le circuit ?",
      "Des filtres au charbon activé.",
      "b00107",
    ),
    card(
      "À quelle température interrompre le refroidissement direct ?",
      "Autour de 38 °C.",
      "b00111",
    ),
    card(
      "Quelle dose d’entretien de dantrolène peut être poursuivie ?",
      "1 mg/kg toutes les six heures pendant 24 à 48 heures.",
      ["b00112", "b00113"],
    ),
    card(
      "Combien de temps surveiller une crise d’HM en soins intensifs ?",
      "Au moins 24 à 48 heures selon le contrôle et le risque de récidive.",
      "b00114",
    ),
    card(
      "Quels diagnostics imitent une HM hypermétabolique ?",
      "Sepsis, thyrotoxicose, phéochromocytome et syndrome malin des neuroleptiques.",
      ["b00116", "b00117"],
    ),
    card(
      "Que faire si le diagnostic différentiel d’HM reste incertain en urgence ?",
      "Traiter d’abord l’HM, la cause la plus rapidement létale.",
      "b00116",
    ),
    card(
      "Quel test confirme une susceptibilité à l’HM ?",
      "Le test de contracture à l’halothane et à la caféine sur muscle.",
      ["b00119", "b00120"],
    ),
    card(
      "Pourquoi le dépistage par biopsie musculaire n’est-il pas systématique ?",
      "Le test est invasif, peu disponible et la maladie rare.",
      "b00120",
    ),
    card(
      "À quoi sert le score clinique NAMHR ?",
      "À estimer la probabilité qu’un événement soit une crise d’HM.",
      ["b00120", "b00122", "b00131"],
    ),
    card(
      "Pourquoi un test génétique négatif n’exclut-il pas toute HM ?",
      "Plus de 400 mutations existent et toutes ne sont pas détectées.",
      "b00133",
    ),
    card(
      "Faut-il donner du dantrolène prophylactique à tout sujet susceptible ?",
      "Non, une technique sans déclencheur suffit habituellement.",
      "b00136",
    ),
    card(
      "Comment préparer la machine pour un patient susceptible à l’HM ?",
      "Retirer vaporisateurs, changer circuit et chaux, puis purger selon le modèle.",
      "b00137",
    ),
    card(
      "Quels monitorages sont indispensables chez un patient susceptible HM ?",
      "CO2 expiré et température corporelle, en plus du monitorage standard.",
      "b00139",
    ),
    card(
      "Quelle réserve de dantrolène doit être immédiatement disponible ?",
      "Une réserve complète correspondant à 10 mg/kg de poids corporel.",
      "b00139",
    ),
    card(
      "Combien de temps observer en SSPI un patient HM après technique sûre ?",
      "Environ deux à quatre heures.",
      "b00140",
    ),
    card(
      "Quelle surveillance à domicile prévoir après ambulatoire chez un patient HM ?",
      "Une personne responsable pendant au moins 24 heures.",
      "b00140",
    ),

    card(
      "Quels objectifs cérébraux complète l’anesthésie générale ?",
      "Inconscience, amnésie, anxiolyse et contrôle de la nociception.",
      "b00160",
    ),
    card(
      "Pourquoi l’éveil mémorisé est-il une complication majeure ?",
      "Il peut entraîner douleur, détresse et syndrome de stress post-traumatique.",
      ["b00160", "b00174"],
    ),
    card(
      "Quel mécanisme cortical est associé aux hypnotiques GABAergiques ?",
      "Une déconnexion des réseaux cortico-corticaux et thalamo-corticaux.",
      "b00161",
    ),
    card(
      "Un moniteur peut-il prouver à lui seul l’inconscience ?",
      "Non, aucun appareil ne remplace le jugement anesthésique.",
      "b00161",
    ),
    card(
      "Quelle est la cause la plus fréquente d’éveil sous anesthésie ?",
      "Le sous-dosage en agent hypnotique.",
      "b00162",
    ),
    card(
      "Pourquoi une intubation difficile favorise-t-elle l’éveil ?",
      "La dose initiale s’épuise si aucun renfort hypnotique n’est administré.",
      "b00162",
    ),
    card(
      "Quels défauts techniques peuvent causer un éveil ?",
      "Vaporisateur, pousse-seringue, tubulure ou connexion défaillants.",
      "b00162",
    ),
    card(
      "Quels facteurs de risque individuels d’éveil faut-il rechercher ?",
      "Obésité, antécédent, tolérance aux substances et voie aérienne difficile.",
      ["b00162", "b00163"],
    ),
    card(
      "Quelles chirurgies sont à haut risque d’éveil ?",
      "Urgence, césarienne, chirurgie cardiothoracique et traumatologique.",
      ["b00163", "b00164"],
    ),
    card(
      "Pourquoi un curare augmente-t-il le risque de non-détection ?",
      "Il abolit le mouvement qui pourrait révéler une conscience.",
      "b00163",
    ),
    card(
      "Qu’est-ce que la technique de l’avant-bras isolé ?",
      "Un garrot précurare conserve un mouvement volontaire d’une main.",
      "b00166",
    ),
    card(
      "Quel est l’ordre de grandeur d’éveil mémorisé chez un patient à risque ?",
      "Environ 0,1 à 0,2 %.",
      "b00171",
    ),
    card(
      "Quelle incidence spontanément déclarée a été observée au Royaume-Uni ?",
      "Environ un cas pour 19 600 anesthésies.",
      "b00171",
    ),
    card(
      "Quelle concentration expirée doit déclencher une alarme de volatile ?",
      "Une concentration inférieure à 0,7 MAC.",
      "b00172",
    ),
    card(
      "Quand envisager un monitorage neurologique de profondeur ?",
      "Chez un patient sélectionné à risque, surtout en TIVA avec curarisation.",
      "b00172",
    ),
    card(
      "Quel renfort hypnotique peut traiter une suspicion peropératoire ?",
      "Propofol 0,5 mg/kg ou midazolam 0,05 mg/kg.",
      "b00174",
    ),
    card(
      "Que dire au patient conscient pendant la correction ?",
      "Que la situation est reconnue et en cours de correction.",
      "b00174",
    ),
    card(
      "À quoi sert le questionnaire de Brice ?",
      "À rechercher rétrospectivement un souvenir explicite de la période anesthésique.",
      ["b00166", "b00167"],
    ),
    card(
      "Quelle attitude adopter lors de l’entretien après éveil suspecté ?",
      "Écouter avec empathie, ne pas nier l’expérience et éviter les questions suggestives.",
      "b00174",
    ),
    card(
      "Exprimer du regret équivaut-il à reconnaître une faute ?",
      "Non, reconnaître l’expérience ne constitue pas une admission médicolégale.",
      "b00174",
    ),
    card(
      "Quel suivi proposer après un éveil mémorisé ?",
      "Un suivi anesthésique et psychologique ou psychiatrique organisé.",
      ["b00174", "b00176"],
    ),
    card(
      "Quels symptômes évoquent un stress post-traumatique après éveil ?",
      "Hypervigilance, anxiété, cauchemars, flashbacks et évitement.",
      ["b00174", "b00175", "b00176"],
    ),
    card(
      "Quelle thérapie peut traiter les séquelles persistantes d’éveil ?",
      "La thérapie cognitivo-comportementale.",
      "b00176",
    ),
  ];
}

const qcm = (
  enonce,
  sourceBlocks,
  correction_generale,
  items,
  newInformation,
) => ({
  enonce: newInformation ? `${newInformation} ${enonce}` : enonce,
  format: "qcm",
  sourceBlocks,
  correction_generale,
  ...(newInformation ? { newInformation } : {}),
  items: items.map(([is_correct, itemEnonce, justification], index) => ({
    lettre: "ABCDE"[index],
    enonce: itemEnonce,
    is_correct,
    justification,
  })),
});
const qroc = (
  enonce,
  reponse_attendue,
  sourceBlocks,
  correction_generale,
  newInformation,
) => ({
  enonce: newInformation ? `${newInformation} ${enonce}` : enonce,
  format: "qroc",
  reponse_attendue,
  sourceBlocks,
  correction_generale,
  items: [],
  ...(newInformation ? { newInformation } : {}),
});
const T = (text, why) => [true, text, why];
const F = (text, why) => [false, text, why];
const src = (...blocks) => blocks;

const QCM_SERIES = [
  {
    label: "QCM — Série 1 · Mesure du risque et parcours",
    allowed_voies: ["interne"],
    questions: [
      qcm(
        "Quels éléments ont durablement amélioré la sécurité anesthésique ?",
        src("b00004", "b00011", "b00012"),
        "La baisse du risque résulte d’un ensemble cohérent de règles, d’organisations et de compétences, et non d’un seul médicament.",
        [
          T(
            "La standardisation du monitorage.",
            "Elle permet la détection précoce des défaillances peranesthésiques.",
          ),
          T(
            "La surveillance postanesthésique organisée.",
            "La SSPI prolonge la sécurité au-delà de la salle d’opération.",
          ),
          F(
            "La suppression de l’évaluation préopératoire.",
            "Cette évaluation constitue au contraire une barrière structurante.",
          ),
          T(
            "La formation des équipes.",
            "Les compétences techniques et non techniques réduisent les erreurs.",
          ),
          F(
            "L’abandon de tout protocole partagé.",
            "La standardisation pertinente soutient la fiabilité collective.",
          ),
        ],
      ),
      qcm(
        "Pourquoi les chiffres de mortalité périopératoire sont-ils difficiles à comparer ?",
        src("b00005", "b00006", "b00007"),
        "Population, type d’acte, pays et horizon de suivi modifient profondément le numérateur comme le dénominateur.",
        [
          T(
            "La durée du suivi change le nombre d’événements recensés.",
            "Un suivi prolongé enregistre davantage de décès postopératoires.",
          ),
          T(
            "Les actes non chirurgicaux modifient le risque moyen.",
            "Ils incluent souvent des procédures de faible gravité.",
          ),
          F(
            "Le contexte socioéconomique n’influence jamais le résultat.",
            "Les écarts entre pays démontrent son impact majeur.",
          ),
          T(
            "La mini-invasion peut améliorer certains résultats.",
            "Une moindre agression chirurgicale diminue des complications.",
          ),
          F(
            "Une incidence garde le même sens dans toute population.",
            "Le profil des patients conditionne directement son interprétation.",
          ),
        ],
      ),
      qcm(
        "Quelles propositions décrivent correctement le risque ambulatoire ?",
        src("b00009"),
        "En chirurgie ambulatoire mineure, la mortalité est extrêmement faible ; qualité, symptômes et organisation deviennent les principaux critères d’évaluation.",
        [
          T(
            "La mortalité globale est proche de 1/100 000 actes.",
            "Cet ordre de grandeur illustre la rareté extrême du décès.",
          ),
          T(
            "Les NVPO restent un indicateur de qualité pertinent.",
            "Un événement mineur peut fortement dégrader l’expérience du patient.",
          ),
          F(
            "Un acte complexe chez un patient fragile garde toujours le même risque.",
            "L’élargissement des indications modifie le profil de sécurité.",
          ),
          T(
            "Le retard de sortie peut révéler un défaut organisationnel.",
            "La qualité comprend aussi la fluidité du parcours.",
          ),
          F(
            "Seule la mortalité mérite d’être mesurée.",
            "À très faible mortalité, les résultats centrés patient dominent.",
          ),
        ],
      ),
      qcm(
        "Quels facteurs expliquent le risque élevé après chirurgie majeure ?",
        src("b00008", "b00010"),
        "L’urgence, l’âge, la fragilité, la maladie causale et l’ampleur opératoire dominent ; l’anesthésie peut contribuer sans tout expliquer.",
        [
          T(
            "Une intervention urgente.",
            "Elle réduit l’optimisation préalable et reflète souvent une maladie sévère.",
          ),
          T(
            "La fragilité du patient.",
            "Une faible réserve physiologique limite la tolérance à l’agression.",
          ),
          F(
            "La seule utilisation d’une anesthésie générale.",
            "La technique n’explique pas à elle seule la mortalité globale.",
          ),
          T(
            "Une hypotension peropératoire mal contrôlée.",
            "Elle peut aggraver une vulnérabilité d’organe préexistante.",
          ),
          F(
            "L’absence de toute pathologie sous-jacente.",
            "La maladie causale est au contraire un déterminant essentiel.",
          ),
        ],
      ),
      qcm(
        "Que recouvre la médecine périopératoire moderne ?",
        src("b00011", "b00012", "b00013", "b00014"),
        "Elle organise une continuité interprofessionnelle centrée sur le patient avant, pendant et après l’intervention.",
        [
          T(
            "Une prise en charge sur l’ensemble du parcours.",
            "Le risque ne s’arrête ni à l’induction ni au réveil.",
          ),
          T(
            "Une coopération avec les chirurgiens.",
            "Les décisions complémentaires nécessitent un projet partagé.",
          ),
          T(
            "Une participation active du patient.",
            "Information et adhésion améliorent la sécurité et la satisfaction.",
          ),
          F(
            "Une activité anesthésique isolée du reste des soins.",
            "Le fonctionnement en silo est précisément remis en cause.",
          ),
          F(
            "Une responsabilité limitée aux médicaments anesthésiques.",
            "La démarche inclut prévention et organisation périopératoires.",
          ),
        ],
      ),
    ],
  },
  {
    label: "QCM — Série 2 · Sécurité de système et complications",
    allowed_voies: ["interne"],
    questions: [
      qcm(
        "Quelles affirmations évitent une attribution causale abusive ?",
        src("b00016", "b00017", "b00018"),
        "Une complication postopératoire doit être analysée avec le terrain, l’inflammation et l’agression chirurgicale avant d’être imputée à l’anesthésie.",
        [
          T(
            "Une association temporelle ne prouve pas une causalité.",
            "La complication peut résulter de plusieurs mécanismes concomitants.",
          ),
          F(
            "Tout trouble cognitif est un effet direct des hypnotiques.",
            "La neuro-inflammation et la chirurgie peuvent être prépondérantes.",
          ),
          T(
            "Les complications d’organe peuvent atteindre 30 à 50 %.",
            "Cette fréquence concerne certaines chirurgies majeures.",
          ),
          F(
            "L’ALR est la cause habituelle des complications neurologiques obstétricales.",
            "L’acte ou l’accouchement sont plus souvent responsables.",
          ),
          T(
            "Le risque doit être décomposé par mécanisme.",
            "Cette analyse oriente une prévention réellement ciblée.",
          ),
        ],
      ),
      qcm(
        "Quels bénéfices sont associés à une ventilation protectrice ?",
        src("b00019"),
        "Le réglage ventilatoire peropératoire peut réduire des complications pulmonaires graves et leurs traitements de recours.",
        [
          T(
            "Une réduction des complications pulmonaires postopératoires.",
            "La ventilation limite le volutraumatisme et l’atélectasie.",
          ),
          T(
            "Une diminution des réintubations.",
            "La fonction respiratoire postopératoire est mieux préservée.",
          ),
          T(
            "Un moindre recours à la ventilation non invasive.",
            "La prévention limite les décompensations respiratoires secondaires.",
          ),
          F(
            "Une suppression de tout risque chirurgical.",
            "Elle ne corrige ni le terrain ni l’agression opératoire.",
          ),
          F(
            "Un bénéfice obtenu par hyperpression systématique.",
            "La protection repose sur des réglages adaptés, pas excessifs.",
          ),
        ],
      ),
      qcm(
        "Quelles barrières réduisent les erreurs médicamenteuses ?",
        src("b00020", "b00022", "b00027"),
        "Étiquetage, présentation standardisée, contrôle croisé et maîtrise des interruptions sécurisent une chaîne médicamenteuse très exposée.",
        [
          T(
            "Étiqueter immédiatement chaque seringue.",
            "L’identification réduit les substitutions lors d’une urgence.",
          ),
          T(
            "Standardiser le rangement des plateaux.",
            "Une disposition constante limite la recherche sous stress.",
          ),
          F(
            "Conserver des ampoules très proches sans distinction.",
            "La ressemblance augmente les erreurs de sélection.",
          ),
          T(
            "Réduire les interruptions pendant la préparation.",
            "Une tâche interrompue favorise omission et double administration.",
          ),
          F(
            "Se fier uniquement à la mémoire de l’opérateur.",
            "Une barrière indépendante est nécessaire pour une action létale.",
          ),
        ],
      ),
      qcm(
        "Que caractérise une analyse des causes racines ?",
        src("b00027"),
        "Elle reconstruit l’événement dans son système de travail pour corriger les conditions qui ont permis l’erreur.",
        [
          T(
            "Elle examine les transmissions et l’organisation.",
            "Les interfaces sont des zones fréquentes de défaillance.",
          ),
          T(
            "Elle analyse fatigue et charge cognitive.",
            "Les facteurs humains modifient la performance réelle.",
          ),
          F(
            "Elle se limite à désigner le dernier intervenant.",
            "Une approche punitive masque les causes profondes.",
          ),
          T(
            "Elle cherche des barrières correctives durables.",
            "Le retour d’expérience doit modifier le système.",
          ),
          F(
            "Elle exige des milliers de cas avant toute action.",
            "Un seul événement sentinelle peut suffire à apprendre.",
          ),
        ],
      ),
      qcm(
        "Quelles associations complication-prévention sont cohérentes ?",
        src("b00020", "b00022", "b00025", "b00026"),
        "Chaque complication dispose de barrières spécifiques qui doivent être préparées avant l’induction.",
        [
          T(
            "Intubation difficile — stratégie et matériel anticipés.",
            "La préparation réduit hypoxie et gestes répétés.",
          ),
          T(
            "Cécité positionnelle — protection oculaire et appuis contrôlés.",
            "Pression et hypoperfusion sont des mécanismes évitables.",
          ),
          F(
            "Inhalation — suppression universelle du jeûne.",
            "Le jeûne et l’évaluation du risque restent des barrières.",
          ),
          T(
            "Lésion neurologique — positionnement documenté.",
            "La limitation de l’étirement protège les nerfs périphériques.",
          ),
          F(
            "Hypotension — absence de monitorage tensionnel.",
            "La surveillance permet au contraire une correction rapide.",
          ),
        ],
      ),
    ],
  },
  {
    label: "QCM — Série 3 · Reconnaître l’anaphylaxie",
    allowed_voies: ["interne"],
    questions: [
      qcm(
        "Quelles propositions définissent l’hypersensibilité périopératoire ?",
        src("b00040", "b00041"),
        "Le syndrome peut être immunologique ou non, et prend le nom d’anaphylaxie lorsqu’il devient rapidement grave.",
        [
          T(
            "Une réaction IgE-médiée est allergique.",
            "Elle implique une reconnaissance immunologique spécifique.",
          ),
          T(
            "Une libération mastocytaire non spécifique peut être non allergique.",
            "Le tableau clinique peut pourtant être identique.",
          ),
          F(
            "Toute réaction retardée est une anaphylaxie.",
            "Les réactions tardives sont souvent cutanées sans défaillance vitale.",
          ),
          T(
            "L’anaphylaxie peut être allergique ou non.",
            "Le terme décrit la gravité et la rapidité clinique.",
          ),
          F(
            "Le mécanisme doit être prouvé avant de traiter.",
            "La prise en charge urgente précède l’exploration étiologique.",
          ),
        ],
      ),
      qcm(
        "Quels signes appartiennent au grade II de Ring et Messmer ?",
        src("b00041", "b00042"),
        "Le grade II associe une atteinte multiviscérale modérée sans menace vitale immédiate.",
        [
          T(
            "Une hypotension modérée.",
            "Une atteinte circulatoire limitée définit ce niveau.",
          ),
          T(
            "Un bronchospasme modéré.",
            "La gêne respiratoire reste sans défaillance imminente.",
          ),
          T(
            "Des signes cutanéo-muqueux.",
            "Ils peuvent accompagner les manifestations viscérales.",
          ),
          F(
            "Un arrêt cardiaque.",
            "Un arrêt circulatoire ou respiratoire correspond précisément au grade IV.",
          ),
          F(
            "Une atteinte exclusivement cutanée.",
            "Ce tableau isolé relève du grade I.",
          ),
        ],
      ),
      qcm(
        "Quels éléments suggèrent une anaphylaxie sévère au bloc ?",
        src("b00044", "b00045"),
        "La brutalité, le choc, le bronchospasme et l’atteinte rythmique doivent alerter même si la peau paraît normale.",
        [
          T(
            "Une hypotension immédiatement après injection.",
            "C’est le signe inaugural le plus fréquent.",
          ),
          T(
            "Un bronchospasme brutal.",
            "Il peut révéler une atteinte respiratoire menaçante.",
          ),
          F(
            "L’absence initiale d’urticaire exclut le diagnostic.",
            "Les signes cutanés apparaissent souvent secondairement.",
          ),
          T(
            "Une bradycardie associée au choc.",
            "Elle peut accompagner une forme très sévère.",
          ),
          F(
            "Une évolution toujours lente sur plusieurs jours.",
            "La majorité des formes graves apparaît en quelques minutes.",
          ),
        ],
      ),
      qcm(
        "Quelles données épidémiologiques sont cohérentes avec l’anaphylaxie périopératoire ?",
        src("b00046", "b00047"),
        "Les estimations sont variables, mais les formes graves sont proches de 1/10 000 AG avec une mortalité non nulle.",
        [
          T(
            "L’incidence publiée varie selon les méthodes.",
            "Les définitions et la détection diffèrent entre enquêtes.",
          ),
          T(
            "Une forme grave survient environ une fois sur 10 000 AG.",
            "Cet ordre de grandeur structure la préparation.",
          ),
          F(
            "L’allergie aux anesthésiques locaux est fréquente.",
            "Elle est décrite comme plus qu’exceptionnelle.",
          ),
          T(
            "La mortalité européenne rapportée atteint 3 à 4 %.",
            "Le décès reste possible malgré la rareté du syndrome.",
          ),
          F(
            "Le terrain n’influence pas le pronostic.",
            "ASA, obésité et certains traitements aggravent le risque.",
          ),
        ],
      ),
      qcm(
        "Quand parle-t-on d’anaphylaxie réfractaire ?",
        src("b00045", "b00047"),
        "La persistance du choc au-delà de dix minutes malgré une adrénaline et un remplissage appropriés impose une escalade thérapeutique.",
        [
          T(
            "Quand le choc persiste plus de dix minutes sous traitement efficace.",
            "Cette durée est le repère proposé par la source.",
          ),
          F(
            "Dès la première plaque d’urticaire isolée.",
            "Une manifestation cutanée seule ne définit pas la réfractarité.",
          ),
          T(
            "Après vérification des doses et du remplissage.",
            "Une insuffisance thérapeutique doit être corrigée avant de conclure.",
          ),
          T(
            "Elle peut nécessiter une perfusion de noradrénaline.",
            "Un vasopresseur continu est discuté après fortes doses d’adrénaline.",
          ),
          F(
            "Elle interdit toute adrénaline supplémentaire.",
            "L’adrénaline reste centrale et doit être titrée.",
          ),
        ],
      ),
    ],
  },
  {
    label: "QCM — Série 4 · Allergènes et exploration",
    allowed_voies: ["interne"],
    questions: [
      qcm(
        "Quels produits sont des causes majeures ou émergentes d’anaphylaxie ?",
        src("b00048", "b00049", "b00050", "b00053", "b00054"),
        "Curares et antibiotiques dominent, tandis que sugammadex et chlorhexidine illustrent l’évolution des expositions.",
        [
          T(
            "Les curares.",
            "Ils restent la première cause dans de nombreuses enquêtes.",
          ),
          T(
            "Les antibiotiques.",
            "Les bêta-lactamines sont particulièrement impliquées.",
          ),
          T(
            "La chlorhexidine.",
            "Son usage diffus en fait une cause émergente.",
          ),
          F(
            "Le protoxyde d’azote comme cause habituelle.",
            "Il n’appartient pas aux principaux agents rapportés.",
          ),
          T(
            "Le sugammadex.",
            "Une utilisation intensive a révélé un risque significatif.",
          ),
        ],
      ),
      qcm(
        "Quelles affirmations concernent le latex ?",
        src("b00048", "b00050"),
        "Le latex, autrefois fréquent, a fortement reculé grâce à une modification environnementale et matérielle du bloc.",
        [
          T(
            "Il était une cause importante dans les années 1980.",
            "L’usage massif des gants avait accru les expositions.",
          ),
          T(
            "Son retrait des dispositifs a réduit l’incidence.",
            "La prévention primaire a modifié l’épidémiologie.",
          ),
          F(
            "Il est devenu la première cause actuelle partout.",
            "Il est désormais exceptionnel dans plusieurs pays.",
          ),
          T(
            "Spina-bifida et sondages répétés exposaient classiquement.",
            "Ces patients cumulaient des contacts précoces et répétés.",
          ),
          F(
            "Une éviction environnementale est inutile.",
            "La baisse observée démontre son efficacité.",
          ),
        ],
      ),
      qcm(
        "Pourquoi rechercher une exposition à la chlorhexidine ?",
        src("b00054"),
        "La chlorhexidine est omniprésente et son administration tissulaire peut être décalée de l’induction.",
        [
          T(
            "Elle peut être contenue dans un gel urétral.",
            "L’exposition muqueuse peut déclencher une réaction retardée.",
          ),
          T(
            "Des cathéters peuvent en être imprégnés.",
            "Une libération progressive complique la chronologie.",
          ),
          T(
            "Elle est présente dans certaines compresses.",
            "Une voie périphérique peut donc être le point d’exposition.",
          ),
          F(
            "Elle n’existe que dans le savon chirurgical.",
            "Ses sources sont bien plus nombreuses.",
          ),
          F(
            "Une réaction tardive l’exclut formellement.",
            "Son absorption peut précisément retarder l’anaphylaxie.",
          ),
        ],
      ),
      qcm(
        "Quelle conduite convient devant une étiquette d’allergie aux bêta-lactamines ?",
        src("b00055", "b00056", "b00065", "b00077", "b00078", "b00079"),
        "L’histoire doit être qualifiée et, hors urgence, explorée pour préserver une prophylaxie antibiotique efficace.",
        [
          T(
            "Rechercher la nature exacte de la réaction.",
            "Un symptôme isolé non spécifique ne prouve pas une allergie.",
          ),
          T(
            "Adresser en allergo-anesthésie si le doute persiste.",
            "La consultation organise une exploration adaptée.",
          ),
          F(
            "Interdire définitivement toute bêta-lactamine sans évaluation.",
            "Cette éviction peut augmenter le risque infectieux.",
          ),
          T(
            "Utiliser des tests cutanés pour certaines histoires.",
            "Ils sont pertinents notamment pour une réaction immédiate.",
          ),
          F(
            "Faire un test de provocation malgré un antécédent grave sans précaution.",
            "La gravité conditionne strictement l’indication.",
          ),
        ],
      ),
      qcm(
        "Quelles affirmations concernent les agents moins souvent impliqués ?",
        src("b00050", "b00053"),
        "Plusieurs produits rares restent possibles ; l’exploration doit éviter les exclusions empiriques trop larges.",
        [
          T(
            "Les colloïdes peuvent provoquer une hypersensibilité.",
            "Les gélatines sont plus souvent impliquées que les amidons.",
          ),
          T(
            "La protamine peut être responsable.",
            "Son mécanisme est variable et le risque reste exceptionnel.",
          ),
          F(
            "Les anesthésiques locaux sont une cause courante.",
            "Ils sont exceptionnellement responsables.",
          ),
          T(
            "Les opioïdes donnent souvent une histaminolibération non allergique.",
            "Un tableau cutané ne signifie donc pas toujours IgE.",
          ),
          F(
            "Les produits sanguins sont impossibles à incriminer.",
            "Ils peuvent provoquer une réaction, bien que rarement.",
          ),
        ],
      ),
    ],
  },
  {
    label: "QCM — Série 5 · Traitement de l’anaphylaxie",
    allowed_voies: ["interne"],
    questions: [
      qcm(
        "Quelles actions sont prioritaires devant une anaphylaxie sévère ?",
        src("b00068", "b00070"),
        "L’arrêt de l’agent, l’oxygénation, l’appel d’aide, l’adrénaline titrée et le remplissage sont simultanés.",
        [
          T(
            "Interrompre l’administration du produit suspect.",
            "La poursuite de l’exposition aggrave la libération de médiateurs.",
          ),
          T(
            "Administrer de l’oxygène à forte concentration.",
            "La défaillance respiratoire et circulatoire menace l’oxygénation.",
          ),
          T(
            "Titrer rapidement l’adrénaline IV.",
            "Elle corrige vasoplégie, œdème et bronchospasme.",
          ),
          F(
            "Attendre la tryptase avant de traiter.",
            "Le prélèvement ne doit jamais retarder l’adrénaline.",
          ),
          T(
            "Donner des bolus rapides de cristalloïdes.",
            "La fuite capillaire provoque une hypovolémie majeure.",
          ),
        ],
      ),
      qcm(
        "Comment adapter l’adrénaline aux grades cliniques ?",
        src("b00068", "b00070"),
        "La dose augmente avec la gravité : pas de routine au grade I, microbolus au grade II–III, dose d’arrêt au grade IV.",
        [
          T(
            "Grade I : pas d’adrénaline systématique.",
            "Les manifestations isolées répondent souvent au retrait causal.",
          ),
          T(
            "Grade II : 10 à 20 µg IV titrés.",
            "Cette microdose traite une atteinte modérée.",
          ),
          T(
            "Grade III : 50 µg IV initialement.",
            "Le choc ou bronchospasme sévère exige une dose supérieure.",
          ),
          F(
            "Grade IV : 50 µg uniquement.",
            "Un arrêt cardiaque requiert 1 mg selon la réanimation.",
          ),
          F(
            "Même dose fixe quel que soit le poids ou la réponse.",
            "La titration clinique reste essentielle.",
          ),
        ],
      ),
      qcm(
        "Quelles mesures concernent un choc anaphylactique réfractaire ?",
        src("b00070"),
        "Après adrénaline et remplissage optimisés, vasopresseur continu et traitements contextuels deviennent nécessaires.",
        [
          T(
            "Envisager une perfusion de noradrénaline.",
            "Elle soutient le tonus vasculaire si les bolus échouent.",
          ),
          T(
            "Administrer du glucagon sous bêtabloquant.",
            "Il stimule le cœur par une voie indépendante des récepteurs bêta.",
          ),
          F(
            "Retirer toute voie veineuse.",
            "Un accès fiable est indispensable aux médicaments et liquides.",
          ),
          T(
            "Chercher un bronchospasme persistant.",
            "Un bêta2-mimétique peut compléter l’adrénaline.",
          ),
          F(
            "Interdire le remplissage vasculaire.",
            "La fuite capillaire justifie souvent de grands volumes.",
          ),
        ],
      ),
      qcm(
        "Quels examens et documents organiser après stabilisation ?",
        src("b00070", "b00079"),
        "Le bilan confirme l’activation, reconstruit la chronologie et prépare une exploration allergologique sûre.",
        [
          T(
            "Prélever une tryptase selon le protocole.",
            "Sa cinétique soutient le diagnostic de dégranulation.",
          ),
          T(
            "Noter tous les produits et heures d’administration.",
            "La chronologie aide à hiérarchiser les suspects.",
          ),
          T(
            "Programmer une consultation d’allergo-anesthésie.",
            "L’identification de l’agent conditionne les anesthésies futures.",
          ),
          F(
            "Étiqueter allergique à tous les médicaments utilisés.",
            "Une éviction globale serait dangereuse et injustifiée.",
          ),
          F(
            "Détruire le dossier de l’événement.",
            "La traçabilité constitue une barrière pour l’avenir.",
          ),
        ],
      ),
      qcm(
        "Quelles propositions décrivent le suivi immédiat ?",
        src("b00070", "b00080", "b00081", "b00082", "b00083", "b00084"),
        "Après récupération, une surveillance prolongée et un retour d’expérience complètent le traitement aigu.",
        [
          T(
            "Surveiller au moins six heures après récupération.",
            "Une récidive ou une dégradation secondaire reste possible.",
          ),
          T(
            "Former les équipes par simulation.",
            "La rareté de l’événement limite l’apprentissage clinique spontané.",
          ),
          F(
            "Autoriser une sortie immédiate après le dernier bolus.",
            "La stabilité initiale ne garantit pas l’absence de récidive.",
          ),
          T(
            "Remettre des consignes provisoires d’éviction ciblée.",
            "Elles protègent jusqu’au bilan spécialisé.",
          ),
          F(
            "Considérer le remplissage comme accessoire dans le choc.",
            "La restauration volémique est un axe majeur.",
          ),
        ],
      ),
    ],
  },
  {
    label: "QCM — Série 6 · Reconnaître l’hyperthermie maligne",
    allowed_voies: ["interne"],
    questions: [
      qcm(
        "Quelles affirmations décrivent la physiopathologie de l’HM ?",
        src("b00086", "b00090"),
        "Une susceptibilité musculaire génétique entraîne une libération calcique incontrôlée et un hypermétabolisme déclenché.",
        [
          T(
            "Le récepteur ryanodine est principalement impliqué.",
            "Ce canal contrôle la libération calcique sarcoplasmique.",
          ),
          T(
            "La transmission est souvent autosomique dominante.",
            "Une histoire familiale doit donc être recherchée.",
          ),
          F(
            "La maladie est toujours symptomatique au repos.",
            "La myopathie est habituellement silencieuse hors exposition.",
          ),
          T(
            "La contracture musculaire alimente le catabolisme.",
            "La consommation d’ATP produit chaleur, CO2 et acidose.",
          ),
          F(
            "Le mécanisme principal est une allergie IgE.",
            "Il s’agit d’un trouble du couplage excitation-contraction.",
          ),
        ],
      ),
      qcm(
        "Quels agents peuvent déclencher une crise d’HM ?",
        src("b00086", "b00087", "b00136"),
        "Les seuls déclencheurs anesthésiques reconnus sont les volatils et le curare dépolarisant succinylcholine.",
        [
          T(
            "Le sévoflurane.",
            "Il appartient aux anesthésiques volatils déclencheurs.",
          ),
          T(
            "La succinylcholine.",
            "Ce bloqueur dépolarisant peut provoquer une crise.",
          ),
          F(
            "Le propofol.",
            "Une anesthésie intraveineuse est utilisable chez le sujet susceptible.",
          ),
          F(
            "La lidocaïne locale.",
            "Les anesthésiques locaux ne déclenchent pas l’HM.",
          ),
          T(
            "Le desflurane.",
            "Tous les agents halogénés actuels sont concernés.",
          ),
        ],
      ),
      qcm(
        "Quels signes orientent précocement vers une HM ?",
        src("b00093", "b00094", "b00095"),
        "L’hypercapnie inexpliquée et la tachycardie précèdent souvent rigidité et hyperthermie ; un tableau incomplet reste possible.",
        [
          T(
            "Une élévation progressive du CO2 expiré.",
            "C’est le signal le plus précoce sous ventilation constante.",
          ),
          T(
            "Une tachycardie sans autre explication.",
            "Elle accompagne l’augmentation rapide du métabolisme.",
          ),
          F(
            "Une température normale exclut la crise.",
            "Une température encore normale ne rassure pas, car la fièvre peut apparaître tardivement.",
          ),
          T(
            "Une rigidité musculaire.",
            "Elle est spécifique mais inconstante.",
          ),
          F(
            "Une hypocapnie persistante spontanée.",
            "La production de CO2 augmente au contraire fortement.",
          ),
        ],
      ),
      qcm(
        "Quelles anomalies biologiques peuvent accompagner une HM sévère ?",
        src("b00096", "b00097"),
        "La destruction musculaire et l’hypermétabolisme produisent acidose, hyperkaliémie, CK élevée, myoglobine et coagulopathie.",
        [
          T(
            "Une acidose respiratoire et métabolique.",
            "CO2 excessif et lactate contribuent conjointement.",
          ),
          T(
            "Une CK supérieure à 20 000 UI à 24 heures.",
            "La rhabdomyolyse peut être massive.",
          ),
          T("Une myoglobinurie.", "La myoglobine libérée menace le rein."),
          F(
            "Une hypokaliémie constante.",
            "La lyse musculaire provoque plutôt une hyperkaliémie.",
          ),
          T(
            "Une coagulation intravasculaire disséminée.",
            "Elle complique les crises fulminantes.",
          ),
        ],
      ),
      qcm(
        "Quels diagnostics peuvent mimer l’HM ?",
        src("b00115", "b00116", "b00117"),
        "Plusieurs états hypermétaboliques ou de choc ressemblent à l’HM ; la rigidité et la chronologie orientent.",
        [
          T("Un choc septique.", "Fièvre et instabilité peuvent être proches."),
          T(
            "Une crise thyréotoxique.",
            "Elle entraîne hypermétabolisme et tachycardie.",
          ),
          T(
            "Un phéochromocytome.",
            "L’excès catécholaminergique mime une crise peropératoire.",
          ),
          F(
            "Une simple cataracte.",
            "Elle ne produit ni hypercapnie ni rhabdomyolyse.",
          ),
          T(
            "Un syndrome malin des neuroleptiques.",
            "Son évolution plus lente aide à le distinguer.",
          ),
        ],
      ),
    ],
  },
  {
    label: "QCM — Série 7 · Traiter et prévenir l’HM",
    allowed_voies: ["interne"],
    questions: [
      qcm(
        "Quelles actions doivent être immédiates devant une HM ?",
        src("b00102", "b00103"),
        "La suppression des déclencheurs, l’oxygénation hyperventilée et la préparation du dantrolène démarrent sans attendre.",
        [
          T(
            "Arrêter le volatile.",
            "La poursuite de l’exposition entretient la libération calcique.",
          ),
          T(
            "Ventiler avec O2 à 100 %.",
            "La forte production de CO2 exige une ventilation très augmentée.",
          ),
          T(
            "Utiliser un débit frais supérieur à 10 L/min.",
            "Ce débit élimine rapidement le volatile résiduel.",
          ),
          F(
            "Attendre une température à 41 °C.",
            "Le traitement débute dès l’hypercapnie inexpliquée.",
          ),
          T(
            "Appeler immédiatement du renfort.",
            "La préparation du dantrolène mobilise plusieurs personnes.",
          ),
        ],
      ),
      qcm(
        "Quelles affirmations concernent le dantrolène ?",
        src("b00103", "b00104"),
        "Le dantrolène bloque la libération calcique, doit être reconstitué rapidement et répété jusqu’au contrôle clinique.",
        [
          T(
            "La dose est 2,5 mg/kg IV toutes les cinq minutes.",
            "Cette répétition poursuit le contrôle de la crise.",
          ),
          T(
            "La dose cumulée initiale peut atteindre 10 mg/kg.",
            "Une réponse insuffisante impose de poursuivre les bolus.",
          ),
          T(
            "Un flacon de 20 mg requiert 60 mL d’eau stérile.",
            "Cette dilution explique le besoin d’une équipe dédiée.",
          ),
          F(
            "Il est administré uniquement après la biopsie.",
            "Le diagnostic est clinique et le traitement urgent.",
          ),
          F(
            "Il active le récepteur ryanodine.",
            "Il freine au contraire la libération calcique.",
          ),
        ],
      ),
      qcm(
        "Quels éléments composent la réanimation associée ?",
        src("b00104", "b00105", "b00106"),
        "La prise en charge corrige acidose, hyperkaliémie et rhabdomyolyse tout en surveillant les défaillances.",
        [
          T(
            "Poser une sonde urinaire.",
            "La diurèse guide la protection rénale.",
          ),
          T(
            "Viser plus de 2 mL/kg/h de diurèse.",
            "Ce débit limite l’impact de la myoglobinurie.",
          ),
          T(
            "Prélever CK, myoglobine et coagulation.",
            "Ces examens quantifient lyse musculaire et CIVD.",
          ),
          F(
            "Donner systématiquement un inhibiteur calcique.",
            "L’association au dantrolène est dangereuse.",
          ),
          T(
            "Traiter l’acidose selon les gaz du sang.",
            "Hyperventilation et bicarbonate sont adaptés au bilan.",
          ),
        ],
      ),
      qcm(
        "Quelles mesures préviennent une récidive ou une exposition résiduelle ?",
        src("b00107", "b00111", "b00112", "b00113", "b00114"),
        "Le circuit est décontaminé, le patient refroidi sans excès et le dantrolène poursuivi sous surveillance intensive.",
        [
          T(
            "Utiliser des filtres au charbon activé.",
            "Ils adsorbent les traces d’agents halogénés.",
          ),
          T(
            "Arrêter le refroidissement autour de 38 °C.",
            "Poursuivre favoriserait une hypothermie iatrogène.",
          ),
          T(
            "Poursuivre parfois 1 mg/kg toutes les six heures.",
            "L’entretien couvre un risque de récidive.",
          ),
          F(
            "Renvoyer immédiatement le patient à domicile.",
            "Une surveillance en soins intensifs 24 à 48 heures est requise.",
          ),
          T(
            "Remplacer chaux sodée et circuit si possible.",
            "Ils peuvent contenir du volatile résiduel.",
          ),
        ],
      ),
      qcm(
        "Comment préparer un sujet susceptible à l’HM ?",
        src("b00136", "b00137", "b00138", "b00139", "b00140"),
        "Une technique sans déclencheur, une machine préparée et une capacité de traitement immédiat rendent l’anesthésie possible.",
        [
          T(
            "Utiliser une anesthésie intraveineuse.",
            "Les agents IV sont compatibles avec la susceptibilité.",
          ),
          T(
            "Retirer les vaporisateurs.",
            "Cette action évite une administration accidentelle.",
          ),
          F(
            "Administrer toujours du dantrolène prophylactique.",
            "La prophylaxie systématique n’est plus recommandée.",
          ),
          T(
            "Disposer de 10 mg/kg de dantrolène.",
            "La dose nécessaire doit être immédiatement accessible.",
          ),
          T(
            "Surveiller CO2 expiré et température.",
            "Ces paramètres détectent les premiers signes.",
          ),
        ],
      ),
    ],
  },
  {
    label: "QCM — Série 8 · Conscience sous anesthésie",
    allowed_voies: ["interne"],
    questions: [
      qcm(
        "Quels mécanismes favorisent un éveil sous anesthésie ?",
        src("b00161", "b00162"),
        "Le sous-dosage hypnotique résulte d’une contrainte clinique, d’un besoin accru ou d’une défaillance de délivrance.",
        [
          T(
            "Une réduction d’hypnotique pour instabilité hémodynamique.",
            "La crainte d’une dépression circulatoire peut conduire au sous-dosage.",
          ),
          T(
            "Une intubation difficile prolongée.",
            "La dose initiale peut s’épuiser avant le renfort.",
          ),
          T(
            "Une tolérance chronique aux substances psychoactives.",
            "Les besoins hypnotiques peuvent être augmentés.",
          ),
          F(
            "Une pompe parfaitement connectée et contrôlée.",
            "Elle constitue une barrière plutôt qu’une cause.",
          ),
          T(
            "Un vaporisateur vide ou mal utilisé.",
            "Le patient ne reçoit alors pas la concentration prévue.",
          ),
        ],
      ),
      qcm(
        "Quels facteurs majorent le risque d’éveil mémorisé ?",
        src("b00163", "b00164"),
        "Le risque augmente quand l’hypnotique est limité, sa délivrance moins mesurable ou les mouvements masqués par le curare.",
        [
          T(
            "Une césarienne.",
            "Les contraintes materno-fœtales peuvent limiter les doses.",
          ),
          T(
            "Une chirurgie d’urgence.",
            "L’instabilité impose parfois une anesthésie volontairement légère.",
          ),
          T(
            "L’utilisation de bloqueurs neuromusculaires.",
            "La paralysie masque un signe majeur de conscience.",
          ),
          F(
            "Une procédure sans facteur de risque et sans curare.",
            "Sans facteur reconnu ni paralysie, ce contexte est comparativement moins exposé à la mémorisation.",
          ),
          T(
            "Un antécédent personnel d’éveil.",
            "Il doit conduire à une stratégie préventive renforcée.",
          ),
        ],
      ),
      qcm(
        "Quelles affirmations concernent les outils de monitorage ?",
        src("b00161", "b00166", "b00172"),
        "Aucun dispositif ne prouve l’inconscience ; le monitorage neurologique et les concentrations expirées sont des aides contextuelles.",
        [
          T(
            "Le BIS traite un EEG frontal.",
            "Il fournit un indice dérivé, non une mesure directe de conscience.",
          ),
          F(
            "Le BIS remplace le jugement clinique.",
            "Aucun appareil ne distingue sûrement conscience et inconscience.",
          ),
          T(
            "Une alarme sous 0,7 MAC est une barrière utile.",
            "Elle détecte une concentration volatile insuffisante.",
          ),
          T(
            "La technique de l’avant-bras isolé teste une réponse motrice.",
            "Elle conserve une main non curarisée.",
          ),
          F(
            "Le monitorage neurologique est obligatoire chez tout patient.",
            "Son usage préventif est individualisé.",
          ),
        ],
      ),
      qcm(
        "Quelle conduite adopter devant une suspicion peropératoire ?",
        src("b00173", "b00174"),
        "Il faut vérifier la délivrance, renforcer l’hypnose et reconnaître la situation auprès du patient sans retarder la correction.",
        [
          T(
            "Contrôler pousse-seringue ou vaporisateur.",
            "Une défaillance de délivrance est une cause réversible.",
          ),
          T(
            "Administrer du propofol 0,5 mg/kg.",
            "Cette dose est proposée comme renfort hypnotique.",
          ),
          T(
            "Parler au patient pour annoncer la correction.",
            "La reconnaissance réduit la détresse immédiate.",
          ),
          F(
            "Attendre le réveil sans modifier l’anesthésie.",
            "La conscience potentielle doit être interrompue immédiatement.",
          ),
          F(
            "Augmenter seulement le curare.",
            "La paralysie aggraverait une conscience non traitée.",
          ),
        ],
      ),
      qcm(
        "Quels éléments appartiennent au suivi d’un éveil mémorisé ?",
        src("b00166", "b00167", "b00174", "b00175", "b00176"),
        "Le diagnostic structuré, l’écoute empathique et le suivi psychologique préviennent l’isolement et les séquelles post-traumatiques.",
        [
          T(
            "Utiliser le questionnaire de Brice.",
            "Il explore les souvenirs avant, pendant et après l’anesthésie.",
          ),
          T(
            "Écouter sans nier l’expérience.",
            "La négation peut aggraver le traumatisme.",
          ),
          F(
            "Suggérer au patient un scénario précis.",
            "La mémoire reconstructive expose aux faux souvenirs.",
          ),
          T(
            "Proposer un soutien psychologique.",
            "Douleur et paralysie peuvent conduire à un stress post-traumatique.",
          ),
          F(
            "Considérer les cauchemars comme toujours bénins.",
            "Ils peuvent appartenir à une séquelle durable.",
          ),
        ],
      ),
    ],
  },
];

const DP_QCM_SERIES = [
  {
    label: "DP QCM 1 · Choc après induction",
    allowed_voies: ["interne"],
    vignette:
      "Une femme de 58 ans reçoit céfazoline puis rocuronium pour une colectomie. Deux minutes après l’induction, la pression chute à 55/28 mmHg, la fréquence cardiaque atteint 128/min et la ventilation devient difficile. Le champ opératoire n’est pas commencé.",
    questions: [
      qcm(
        "Quelles hypothèses doivent être prioritaires ?",
        src("b00040", "b00041", "b00044"),
        "La chronologie après injection, le choc et le bronchospasme rendent l’anaphylaxie hautement probable.",
        [
          T(
            "Anaphylaxie périopératoire.",
            "Le tableau brutal suit deux produits fréquemment impliqués.",
          ),
          F(
            "Hémorragie chirurgicale massive.",
            "Aucune incision ni perte n’a encore eu lieu.",
          ),
          T(
            "Erreur médicamenteuse à vérifier.",
            "Toute crise impose de contrôler les produits réellement injectés.",
          ),
          F(
            "Réaction cutanée bénigne isolée.",
            "La défaillance circulatoire et respiratoire est sévère.",
          ),
          T(
            "Hypersensibilité allergique ou non allergique.",
            "Le mécanisme précis n’est pas requis pour traiter.",
          ),
        ],
      ),
      qcm(
        "Quelles actions démarrez-vous immédiatement ?",
        src("b00068", "b00070"),
        "La prise en charge simultanée associe arrêt du suspect, aide, oxygène, adrénaline et remplissage.",
        [
          T(
            "Appeler du renfort.",
            "La crise exige plusieurs actions concomitantes.",
          ),
          T(
            "Administrer O2 à 100 %.",
            "L’oxygénation est menacée par le bronchospasme et le choc.",
          ),
          T(
            "Injecter de l’adrénaline IV titrée.",
            "Elle est le traitement causal urgent du grade III.",
          ),
          F(
            "Attendre l’urticaire.",
            "Les signes cutanés peuvent être retardés.",
          ),
          T(
            "Perfuser rapidement des cristalloïdes.",
            "La fuite capillaire entraîne une déplétion vasculaire.",
          ),
        ],
        "Des ronchis diffus apparaissent, sans éruption cutanée visible.",
      ),
      qcm(
        "Quelle gravité et quelle dose initiale sont cohérentes ?",
        src("b00042", "b00070"),
        "Le choc associé à un bronchospasme menaçant correspond au grade III et justifie 50 µg IV initialement.",
        [
          F("Grade I.", "Une atteinte cutanée isolée définirait ce grade."),
          F(
            "Grade II avec 10 µg seulement.",
            "La menace vitale classe le tableau au grade III.",
          ),
          T(
            "Grade III.",
            "Hypotension profonde et bronchospasme menacent la vie.",
          ),
          T(
            "Adrénaline 50 µg IV initialement.",
            "C’est la dose proposée pour ce niveau.",
          ),
          F(
            "Absence d’adrénaline.",
            "Elle serait dangereusement inadaptée au choc.",
          ),
        ],
        "La pression reste à 52/26 mmHg et la SpO2 tombe à 88 %.",
      ),
      qcm(
        "Comment poursuivre devant l’absence d’amélioration ?",
        src("b00045", "b00070"),
        "L’adrénaline s’escalade rapidement, le remplissage continue et une perfusion vasopressive peut devenir nécessaire.",
        [
          T(
            "Répéter 100 puis 200 µg IV selon la réponse.",
            "L’escalade est prévue sans aggravation clinique.",
          ),
          T(
            "Poursuivre les bolus de cristalloïdes.",
            "La restauration volémique reste indispensable.",
          ),
          F(
            "Administrer uniquement un antihistaminique.",
            "Il ne corrige ni choc ni bronchospasme sévère.",
          ),
          T(
            "Préparer une perfusion de noradrénaline.",
            "Elle est discutée après de fortes doses cumulées.",
          ),
          F(
            "Retirer le monitorage.",
            "La titration nécessite une surveillance continue.",
          ),
        ],
        "Après plusieurs microbolus et 1,5 L de cristalloïdes, le choc persiste depuis douze minutes.",
      ),
      qcm(
        "Quels facteurs peuvent contribuer à la réfractarité ?",
        src("b00047", "b00070"),
        "Le terrain cardiovasculaire et le bêtablocage peuvent réduire la réponse habituelle aux catécholamines.",
        [
          T(
            "Un traitement bêtabloquant.",
            "Il peut limiter la réponse adrénergique.",
          ),
          T("Une classe ASA élevée.", "Elle est associée aux formes létales."),
          T("Une obésité.", "Elle figure parmi les terrains défavorables."),
          F(
            "Une absence de signes cutanés.",
            "Elle ne détermine pas la réponse hémodynamique.",
          ),
          T(
            "Un remplissage encore insuffisant.",
            "La fuite liquidienne peut être majeure.",
          ),
        ],
        "Le dossier révèle obésité, cardiopathie et traitement par propranolol.",
      ),
      qcm(
        "Quels traitements additionnels sont plausibles ?",
        src("b00070"),
        "Sous bêtabloquant, le glucagon peut compléter une vasopression continue sans remplacer l’adrénaline.",
        [
          T("Glucagon IV.", "Il agit indépendamment des récepteurs bêta."),
          T(
            "Noradrénaline continue.",
            "Elle soutient une vasoplégie réfractaire.",
          ),
          F(
            "Inhibiteur calcique en première intention.",
            "Il risque d’aggraver l’instabilité.",
          ),
          T(
            "Bronchodilatateur si bronchospasme persistant.",
            "Il complète le traitement respiratoire.",
          ),
          F(
            "Arrêt de toute adrénaline par principe.",
            "Même avec les traitements associés, l’adrénaline demeure le médicament central de la crise.",
          ),
        ],
        "Le bronchospasme persiste et la pression reste basse malgré l’escalade.",
      ),
      qcm(
        "Quelles mesures organiser après stabilisation ?",
        src("b00070", "b00079"),
        "Tryptase, chronologie, consultation spécialisée et surveillance prolongée préparent une anesthésie future sûre.",
        [
          T(
            "Prélever une tryptase.",
            "Elle documente l’activation mastocytaire.",
          ),
          T(
            "Tracer chaque produit et son horaire.",
            "La chronologie hiérarchise les suspects.",
          ),
          T(
            "Surveiller au moins six heures.",
            "Une récidive reste possible après récupération.",
          ),
          F(
            "Interdire à vie tous les antibiotiques et curares.",
            "L’exploration doit identifier précisément le responsable.",
          ),
          T(
            "Adresser en allergo-anesthésie.",
            "Des tests spécialisés sécuriseront la suite.",
          ),
        ],
        "L’hémodynamique et la ventilation se normalisent après quarante minutes.",
      ),
    ],
  },
  {
    label: "DP QCM 2 · Suspicion d’allergie aux bêta-lactamines",
    allowed_voies: ["interne"],
    vignette:
      "Un homme de 43 ans doit être opéré dans six semaines d’une prothèse de hanche. Son dossier mentionne « allergie pénicilline » après une éruption durant l’enfance, sans autre précision. La céfazoline serait l’antibioprophylaxie de référence.",
    questions: [
      qcm(
        "Quelles informations faut-il rechercher ?",
        src("b00055", "b00056", "b00065"),
        "La date, la chronologie, le phénotype et la gravité déterminent la vraisemblance et le type d’exploration.",
        [
          T(
            "Le délai entre prise et symptômes.",
            "Il distingue réaction immédiate et retardée.",
          ),
          T(
            "La présence de signes respiratoires ou circulatoires.",
            "Ils caractérisent une réaction grave.",
          ),
          T(
            "Une réexposition tolérée depuis.",
            "Elle peut fortement diminuer la probabilité d’allergie.",
          ),
          F(
            "La couleur des comprimés seulement.",
            "Cette donnée ne caractérise pas le mécanisme.",
          ),
          T(
            "Les comptes rendus anciens disponibles.",
            "Une documentation objective réduit l’incertitude.",
          ),
        ],
      ),
      qcm(
        "Quelle conduite est la plus pertinente ?",
        src("b00055", "b00077", "b00078", "b00079"),
        "Une chirurgie programmée permet une consultation spécialisée avant de modifier l’antibioprophylaxie.",
        [
          T(
            "Programmer une consultation d’allergo-anesthésie avant la chirurgie.",
            "Le délai disponible permet une évaluation spécialisée complète avant le choix prophylactique.",
          ),
          F(
            "Éviter définitivement toute bêta-lactamine.",
            "Une étiquette non confirmée expose à une alternative moins efficace.",
          ),
          T(
            "Maintenir l’intervention programmée après bilan.",
            "L’exploration peut préserver le choix de référence.",
          ),
          F(
            "Administrer la céfazoline sans aucune analyse.",
            "Le risque doit être clarifié avant l’exposition.",
          ),
          T(
            "Informer le patient des enjeux infectieux.",
            "La décision partage bénéfices et risques.",
          ),
        ],
        "Le patient ne décrit ni dyspnée, ni malaise, ni hospitalisation lors de l’épisode.",
      ),
      qcm(
        "Quels tests peuvent être discutés ?",
        src("b00056", "b00065"),
        "Une histoire non grave peut relever de tests cutanés ou de provocation encadrée selon l’évaluation spécialisée.",
        [
          T("Tests cutanés.", "Ils explorent une sensibilisation immédiate."),
          T(
            "Test de provocation supervisé.",
            "Il peut lever le doute dans une histoire compatible et non grave.",
          ),
          F(
            "Injection non surveillée à domicile.",
            "Une réexposition doit être médicalement encadrée.",
          ),
          F(
            "Tryptase basale comme preuve unique.",
            "Elle ne confirme pas une allergie ancienne spécifique.",
          ),
          T(
            "Analyse détaillée de l’histoire avant tout test.",
            "Le phénotype guide l’examen choisi.",
          ),
        ],
        "La consultation conclut à une histoire familiale isolée et un rash ancien peu spécifique.",
      ),
      qcm(
        "Quelles conclusions sont raisonnables si les tests sont négatifs ?",
        src("b00056", "b00065", "b00078"),
        "Des tests négatifs correctement conduits peuvent permettre de lever l’étiquette et d’utiliser la prophylaxie optimale.",
        [
          T(
            "L’allergie peut être écartée selon le protocole.",
            "Le bilan spécialisé a une valeur décisionnelle.",
          ),
          T(
            "La céfazoline peut redevenir envisageable.",
            "L’éviction injustifiée n’est plus nécessaire.",
          ),
          F(
            "Tous les antibiotiques restent interdits.",
            "La conclusion est au contraire rassurante.",
          ),
          T(
            "Le dossier doit être mis à jour.",
            "Une ancienne mention ambiguë ne doit pas persister.",
          ),
          F(
            "Le patient doit conserver une alerte fausse.",
            "Elle exposerait encore à des substitutions inutiles.",
          ),
        ],
        "Tests cutanés et provocation sont négatifs sans symptôme.",
      ),
      qcm(
        "Quel bénéfice est attendu de cette dé-étiquetage ?",
        src("b00077", "b00078"),
        "Le patient reçoit une prophylaxie mieux adaptée, avec moins de risque infectieux lié aux alternatives.",
        [
          T(
            "Accès à l’antibioprophylaxie de référence.",
            "Le choix repose à nouveau sur l’indication chirurgicale.",
          ),
          T(
            "Réduction d’alternatives potentiellement moins efficaces.",
            "Certaines substitutions augmentent le risque infectieux.",
          ),
          F(
            "Suppression de toute surveillance peropératoire.",
            "Une réaction reste toujours possible avec tout médicament.",
          ),
          T(
            "Meilleure traçabilité future.",
            "Le résultat objectif remplace une mention imprécise.",
          ),
          F(
            "Garantie de tolérance à tous les médicaments.",
            "Le bilan ne concerne que les molécules explorées.",
          ),
        ],
        "L’équipe confirme l’utilisation de céfazoline pour l’intervention.",
      ),
      qcm(
        "Que faire le jour de l’intervention ?",
        src("b00040", "b00068"),
        "Une administration standard reste surveillée comme toute exposition périopératoire, sans protocole d’éviction supplémentaire.",
        [
          T(
            "Administrer la dose indiquée au moment prévu.",
            "Le bilan négatif a levé l’éviction et rétabli l’indication de la prophylaxie de référence.",
          ),
          T(
            "Conserver le monitorage habituel.",
            "Toute injection peut rarement provoquer une réaction.",
          ),
          F(
            "Prétraiter systématiquement par adrénaline.",
            "Une prophylaxie catécholaminergique est injustifiée.",
          ),
          F(
            "Remplacer malgré tout par un antibiotique moins adapté.",
            "Cela annulerait le bénéfice du bilan.",
          ),
          T(
            "Documenter la bonne tolérance.",
            "La donnée consolide le dossier futur.",
          ),
        ],
        "La céfazoline est injectée sous monitorage, sans événement immédiat.",
      ),
      qcm(
        "Quelle information remettre au patient ?",
        src("b00077", "b00078", "b00079"),
        "Le compte rendu doit expliquer que l’étiquette a été levée et préciser les molécules testées et tolérées.",
        [
          T(
            "Le résultat écrit du bilan.",
            "Il évite la réapparition de l’ancienne mention.",
          ),
          T(
            "Le nom des bêta-lactamines tolérées.",
            "La précision facilite les prescriptions futures.",
          ),
          F(
            "Une carte d’allergie universelle non justifiée.",
            "Elle contredirait le bilan négatif.",
          ),
          T(
            "La nécessité de signaler toute nouvelle réaction.",
            "Une tolérance actuelle n’abolit pas tout risque ultérieur.",
          ),
          F(
            "L’interdiction de toute antibiothérapie.",
            "Après un bilan négatif et une dose tolérée, aucune donnée ne justifie une interdiction antibiotique globale.",
          ),
        ],
        "Le patient quitte l’hôpital après une évolution simple.",
      ),
    ],
  },
  {
    label: "DP QCM 3 · Hyperthermie maligne peropératoire",
    allowed_voies: ["interne"],
    vignette:
      "Un homme de 24 ans, sans antécédent connu, est anesthésié par sévoflurane et succinylcholine pour une appendicite. Après vingt minutes, le CO2 expiré passe de 35 à 68 mmHg malgré une ventilation inchangée et la fréquence cardiaque atteint 145/min.",
    questions: [
      qcm(
        "Quelles données font suspecter une HM ?",
        src("b00086", "b00095"),
        "L’exposition à deux déclencheurs et l’hypercapnie inexpliquée précoce imposent de traiter une HM.",
        [
          T(
            "Utilisation de sévoflurane.",
            "Un volatile est un déclencheur reconnu.",
          ),
          T(
            "Injection de succinylcholine.",
            "Le curare dépolarisant peut déclencher la crise.",
          ),
          T(
            "Hausse rapide du CO2 expiré.",
            "Sous ventilation inchangée, cette élévation constitue le signal le plus précoce de la crise.",
          ),
          F(
            "Absence initiale de fièvre.",
            "Elle n’exclut pas une crise débutante.",
          ),
          T("Tachycardie inexpliquée.", "Elle accompagne l’hypermétabolisme."),
        ],
      ),
      qcm(
        "Quelles actions sont immédiates ?",
        src("b00102", "b00103"),
        "Il faut interrompre les déclencheurs, hyperventiler en oxygène pur, appeler de l’aide et préparer le dantrolène.",
        [
          T("Arrêter le sévoflurane.", "Il entretient la libération calcique."),
          T(
            "Hyperventiler immédiatement avec de l’oxygène pur.",
            "La production massive de CO2 impose une ventilation très supérieure au réglage antérieur.",
          ),
          T(
            "Augmenter le débit frais au-delà de 10 L/min.",
            "Il élimine rapidement le volatile du circuit.",
          ),
          F(
            "Attendre une CK élevée.",
            "Le traitement ne doit pas attendre le laboratoire.",
          ),
          T(
            "Demander le chariot d’HM.",
            "Le dantrolène doit être reconstitué sans délai.",
          ),
        ],
        "Une rigidité généralisée apparaît et la température atteint 39,2 °C.",
      ),
      qcm(
        "Comment administrer le dantrolène ?",
        src("b00103", "b00104"),
        "La dose de 2,5 mg/kg est répétée toutes les cinq minutes jusqu’au contrôle, avec une cible cumulative initiale de 10 mg/kg.",
        [
          T(
            "2,5 mg/kg IV initialement.",
            "C’est la dose curative recommandée.",
          ),
          T(
            "Répéter toutes les cinq minutes.",
            "La crise exige une titration rapprochée.",
          ),
          T(
            "Diluer 20 mg dans 60 mL d’eau stérile.",
            "La reconstitution correcte est indispensable.",
          ),
          F(
            "Limiter toujours à une seule dose.",
            "Plusieurs bolus sont souvent requis.",
          ),
          T(
            "Poursuivre jusqu’à amélioration du CO2 et de la rigidité.",
            "La diminution conjointe du CO2 et de la rigidité objective la réponse au dantrolène répété.",
          ),
        ],
        "Le patient pèse 80 kg ; le dantrolène est disponible.",
      ),
      qcm(
        "Quels examens et dispositifs sont indiqués ?",
        src("b00104", "b00105", "b00106"),
        "Le bilan recherche acidose, rhabdomyolyse, hyperkaliémie et CIVD, tandis que la sonde mesure la protection rénale.",
        [
          T(
            "Gaz du sang et électrolytes.",
            "Ils quantifient acidose et hyperkaliémie.",
          ),
          T(
            "CK et myoglobine.",
            "Leur élévation quantifie la destruction musculaire et le risque rénal associé.",
          ),
          T(
            "NFS-plaquettes et coagulation.",
            "Plaquettes et coagulogramme dépistent une CIVD susceptible de compliquer une crise fulminante.",
          ),
          T("Sonde urinaire.", "La diurèse devient une cible thérapeutique."),
          F(
            "Aucun contrôle glycémique.",
            "La glycémie fait partie du bilan et du traitement insulinique.",
          ),
        ],
        "Le gaz montre une acidose mixte et la kaliémie est à 6,7 mmol/L.",
      ),
      qcm(
        "Quelles corrections sont appropriées ?",
        src("b00106"),
        "Hyperventilation, bicarbonate et insuline-glucose corrigent acidose et hyperkaliémie ; le calcium est réservé à l’arythmie sévère.",
        [
          T(
            "Poursuivre l’hyperventilation.",
            "Elle réduit l’hypercapnie et l’acidose respiratoire.",
          ),
          T(
            "Administrer du bicarbonate selon le bilan.",
            "Il contribue à corriger acidose et kaliémie.",
          ),
          T(
            "Utiliser insuline-glucose si nécessaire.",
            "Le potassium est transféré dans la cellule.",
          ),
          F(
            "Associer de routine un bloqueur calcique au dantrolène.",
            "Cette combinaison favorise une hyperkaliémie et une dépression sévère de la contractilité myocardique.",
          ),
          T(
            "Viser une diurèse > 2 mL/kg/h.",
            "Elle protège contre la myoglobinurie.",
          ),
        ],
        "Des extrasystoles ventriculaires apparaissent sans collapsus.",
      ),
      qcm(
        "Quelles mesures limitent l’exposition et l’hyperthermie ?",
        src("b00107", "b00111"),
        "Le circuit est décontaminé et le refroidissement actif interrompu lorsque la température approche 38 °C.",
        [
          T(
            "Poser des filtres au charbon activé.",
            "Ils adsorbent le volatile résiduel.",
          ),
          T(
            "Changer circuit et chaux si possible.",
            "Ces éléments peuvent relarguer l’agent.",
          ),
          T(
            "Refroidir activement si la température monte.",
            "L’hyperthermie aggrave les lésions.",
          ),
          F(
            "Poursuivre le refroidissement jusqu’à 34 °C.",
            "Le refroidissement est interrompu autour de 38 °C afin de ne pas provoquer une hypothermie secondaire.",
          ),
          F(
            "Réintroduire le sévoflurane après amélioration.",
            "Toute nouvelle exposition est proscrite.",
          ),
        ],
        "Après 10 mg/kg de dantrolène, le CO2 et la rigidité diminuent ; la température est à 38,3 °C.",
      ),
      qcm(
        "Quelle surveillance ultérieure est nécessaire ?",
        src("b00112", "b00113", "b00114"),
        "Une récidive possible justifie soins intensifs, contrôles répétés et dantrolène d’entretien pendant 24 à 48 heures.",
        [
          T(
            "Admission en soins intensifs.",
            "Les complications multiviscérales nécessitent une surveillance rapprochée.",
          ),
          T(
            "Contrôler CK, rein et coagulation.",
            "Rhabdomyolyse, IRA et CIVD peuvent être retardées.",
          ),
          T(
            "Envisager 1 mg/kg de dantrolène toutes les six heures.",
            "Un entretien est possible si la crise est mal contrôlée.",
          ),
          F(
            "Sortie immédiate de SSPI.",
            "Une récidive sans nouvelle exposition impose au contraire une surveillance intensive prolongée.",
          ),
          T(
            "Organiser un avis spécialisé ultérieur.",
            "Le diagnostic et le risque familial doivent être établis.",
          ),
        ],
        "Le patient est stable après l’intervention mais la CK continue d’augmenter.",
      ),
    ],
  },
  {
    label: "DP QCM 4 · Patient susceptible à l’HM",
    allowed_voies: ["interne"],
    vignette:
      "Une femme de 31 ans doit subir une arthroscopie ambulatoire du genou. Son frère a présenté une crise d’hyperthermie maligne confirmée et plusieurs apparentés n’ont jamais été explorés. La patiente n’a jamais été anesthésiée, ne présente aucun symptôme musculaire et souhaite conserver la possibilité d’un retour à domicile le soir même.",
    questions: [
      qcm(
        "Quelles conclusions préopératoires sont justes ?",
        src("b00090", "b00133", "b00136"),
        "L’absence de symptôme ne rassure pas devant une transmission dominante et une histoire familiale au premier degré.",
        [
          T(
            "La patiente doit être considérée susceptible.",
            "Une apparentée au premier degré peut porter la mutation.",
          ),
          F(
            "L’absence de myopathie clinique exclut le risque.",
            "La maladie est souvent silencieuse.",
          ),
          T(
            "Un avis spécialisé est indiqué.",
            "Il précisera test et stratégie familiale.",
          ),
          T(
            "La chirurgie reste possible.",
            "Une technique sans déclencheur est réalisable.",
          ),
          F(
            "La succinylcholine est sans danger chez elle.",
            "La succinylcholine est précisément le bloqueur neuromusculaire dépolarisant déclencheur reconnu.",
          ),
        ],
      ),
      qcm(
        "Quelles techniques sont compatibles ?",
        src("b00136"),
        "ALR et anesthésie intraveineuse sont possibles sans volatile ni curare dépolarisant.",
        [
          T(
            "Anesthésie locorégionale pour cette arthroscopie.",
            "Amides et esters locaux sont compatibles avec la susceptibilité à l’hyperthermie maligne.",
          ),
          T("TIVA au propofol.", "Les hypnotiques IV sont utilisables."),
          F(
            "Sévoflurane à faible MAC.",
            "Toute exposition volatile est évitée.",
          ),
          F(
            "Succinylcholine pour l’intubation.",
            "Le bloqueur dépolarisant est interdit.",
          ),
          T(
            "Protoxyde d’azote si indiqué.",
            "Il n’est pas un déclencheur reconnu.",
          ),
        ],
        "La patiente préfère une anesthésie générale courte.",
      ),
      qcm(
        "Comment préparer la machine ?",
        src("b00137", "b00138"),
        "La machine doit être débarrassée des sources de volatile et purgée selon son modèle.",
        [
          T(
            "Déposer tous les vaporisateurs avant l’arrivée de la patiente.",
            "Leur retrait physique empêche une activation accidentelle d’un agent halogéné déclencheur.",
          ),
          T(
            "Installer un circuit et une chaux neufs.",
            "Ils éliminent une source résiduelle.",
          ),
          T(
            "Purger avec O2 à haut débit selon le fabricant.",
            "Le temps requis dépend de la machine.",
          ),
          T(
            "Utiliser des filtres à charbon si le protocole le prévoit.",
            "Les filtres adsorbent les traces halogénées et accélèrent la décontamination du circuit préparé.",
          ),
          F(
            "Remplir le vaporisateur avant induction.",
            "Cela recréerait un risque évitable.",
          ),
        ],
        "Le bloc a utilisé du desflurane plus tôt dans la journée.",
      ),
      qcm(
        "Quels moyens doivent être prêts ?",
        src("b00139"),
        "La détection précoce et le traitement immédiat nécessitent capnographie, température, gros accès et réserve de dantrolène.",
        [
          T("Capnographie continue.", "Le CO2 est le signal le plus précoce."),
          T(
            "Température corporelle.",
            "Sa surveillance continue détecte l’évolution thermique de l’état hypercatabolique.",
          ),
          T(
            "Voie veineuse de gros calibre.",
            "Elle permet d’administrer rapidement traitement et liquides.",
          ),
          T(
            "Dantrolène disponible à 10 mg/kg.",
            "La réserve doit couvrir une crise complète.",
          ),
          F(
            "Aucun soluté refroidi.",
            "Une réserve de liquides froids doit être prévue.",
          ),
        ],
        "L’équipe réalise une check-list spécifique avant l’entrée en salle.",
      ),
      qcm(
        "Faut-il administrer du dantrolène préventif ?",
        src("b00136"),
        "Une technique rigoureusement sans déclencheur ne nécessite pas de prophylaxie médicamenteuse habituelle.",
        [
          F(
            "Oui chez tout apparenté.",
            "La prophylaxie systématique n’est plus indiquée.",
          ),
          T(
            "Non si la technique exclut les déclencheurs.",
            "La prévention repose sur l’éviction et la préparation.",
          ),
          F(
            "Oui pour autoriser ensuite un volatile.",
            "Le dantrolène ne rend pas le sévoflurane acceptable.",
          ),
          T(
            "Le garder immédiatement accessible.",
            "Une crise rare doit pouvoir être traitée.",
          ),
          F(
            "Le supprimer du bloc puisque le risque est faible.",
            "Sa disponibilité constitue une exigence de sécurité.",
          ),
        ],
        "La patiente demande si elle recevra du dantrolène avant l’induction.",
      ),
      qcm(
        "Quelles conditions rendent l’ambulatoire possible ?",
        src("b00140"),
        "Après anesthésie sûre, l’ambulatoire requiert observation, accompagnement, proximité d’un centre et recours anesthésique.",
        [
          T(
            "Observation 2 à 4 heures en SSPI.",
            "Ce délai recherche un événement précoce.",
          ),
          T(
            "Accompagnant pendant 24 heures.",
            "Une surveillance responsable est requise.",
          ),
          T(
            "Domicile proche d’un centre capable de traiter.",
            "La proximité d’un établissement équipé garantit un recours rapide si des signes apparaissent à domicile.",
          ),
          F(
            "Isolement complet la première nuit.",
            "Il contredit l’exigence d’accompagnement.",
          ),
          T(
            "Accès téléphonique anesthésique continu.",
            "Un avis doit être joignable en cas de signe.",
          ),
        ],
        "L’anesthésie et la chirurgie se déroulent sans incident.",
      ),
      qcm(
        "Quelle suite familiale est pertinente ?",
        src("b00119", "b00120", "b00121", "b00133"),
        "Le centre expert peut proposer test de contracture ou génétique selon la mutation familiale et conseiller les apparentés.",
        [
          T(
            "Documenter la susceptibilité présumée.",
            "Elle doit être visible lors de toute anesthésie future.",
          ),
          T(
            "Discuter un test génétique ciblé.",
            "Une mutation familiale connue facilite l’analyse.",
          ),
          T(
            "Envisager le test halothane-caféine.",
            "Il reste l’examen fonctionnel de référence.",
          ),
          F(
            "Rassurer tous les apparentés sans bilan.",
            "La transmission dominante impose une information.",
          ),
          F(
            "Conclure à l’absence de risque après une anesthésie sûre.",
            "Une exposition sans déclencheur ne teste pas la susceptibilité.",
          ),
        ],
        "La patiente souhaite savoir comment confirmer son statut et informer ses enfants.",
      ),
    ],
  },
  {
    label: "DP QCM 5 · Suspicion de conscience sous TIVA",
    allowed_voies: ["interne"],
    vignette:
      "Un homme de 49 ans est opéré d’une laparotomie urgente sous anesthésie intraveineuse totale avec rocuronium. Il consomme quotidiennement des opioïdes depuis plusieurs années. Une heure après l’incision, alors que le patient est encore paralysé, la pression artérielle et la fréquence cardiaque augmentent brutalement sans saignement nouveau.",
    questions: [
      qcm(
        "Quels facteurs augmentent son risque d’éveil ?",
        src("b00162", "b00163", "b00164"),
        "Urgence, TIVA, curare et tolérance aux opioïdes cumulent plusieurs mécanismes de sous-dosage et de non-détection.",
        [
          T(
            "La chirurgie urgente.",
            "L’instabilité peut conduire à limiter les hypnotiques.",
          ),
          T(
            "La TIVA.",
            "Aucune concentration expirée ne confirme la délivrance.",
          ),
          T("Le rocuronium.", "La paralysie masque le mouvement volontaire."),
          T(
            "La consommation chronique d’opioïdes.",
            "Une tolérance peut majorer les besoins anesthésiques.",
          ),
          F(
            "L’âge de 49 ans protège totalement.",
            "Aucun âge n’annule les facteurs présents.",
          ),
        ],
      ),
      qcm(
        "Quelles vérifications sont prioritaires ?",
        src("b00162", "b00173", "b00174"),
        "Avant d’attribuer les signes au stimulus, il faut vérifier pompe, seringue, tubulure, accès et profondeur.",
        [
          T(
            "Fonctionnement du pousse-seringue.",
            "Une panne interrompt la délivrance hypnotique.",
          ),
          T(
            "Connexion de la tubulure.",
            "Une déconnexion explique un sous-dosage soudain.",
          ),
          T(
            "Perméabilité de la voie veineuse.",
            "Une extravasation empêche l’arrivée du propofol.",
          ),
          F(
            "Renforcer uniquement la paralysie par une nouvelle dose de rocuronium.",
            "Une curarisation supplémentaire masquerait la conscience sans restaurer l’inconscience du patient.",
          ),
          T(
            "Évaluer les autres causes d’activation sympathique.",
            "Douleur et hypovolémie restent des diagnostics différentiels.",
          ),
        ],
        "L’écran signale une pression d’occlusion intermittente sur la ligne de propofol.",
      ),
      qcm(
        "Quelle conduite immédiate est adaptée ?",
        src("b00174"),
        "La délivrance est rétablie et un hypnotique de secours est administré sans attendre une preuve de conscience.",
        [
          T("Corriger l’occlusion.", "La cause mécanique doit être supprimée."),
          T(
            "Administrer propofol 0,5 mg/kg.",
            "Cette dose renforce rapidement l’hypnose.",
          ),
          T(
            "Parler au patient de façon rassurante.",
            "Une conscience possible mérite reconnaissance et orientation.",
          ),
          F(
            "Attendre la fin de la chirurgie.",
            "Le risque psychique augmente avec la durée.",
          ),
          F(
            "Interrompre tout hypnotique.",
            "Cette action aggraverait la complication.",
          ),
        ],
        "Une fuite est retrouvée ; le patient reste curarisé et ne peut bouger.",
      ),
      qcm(
        "Quel monitorage peut compléter la prévention ?",
        src("b00161", "b00172"),
        "En TIVA curarisée à risque, un monitorage neurologique peut aider sans remplacer la surveillance de la perfusion.",
        [
          T(
            "Un indice dérivé de l’EEG.",
            "Il peut détecter une tendance vers un allègement.",
          ),
          F(
            "Une alarme de MAC expirée comme seule solution.",
            "Une TIVA ne produit aucune concentration expirée ; une alarme de MAC ne peut donc pas surveiller sa délivrance.",
          ),
          T(
            "La surveillance continue de la pompe.",
            "La délivrance reste la première barrière.",
          ),
          F(
            "Le BIS prouve toujours l’inconscience.",
            "Un indice EEG reste probabiliste et ne constitue jamais une preuve absolue d’inconscience.",
          ),
          T(
            "Une stratégie individualisée.",
            "Le cumul de facteurs justifie le monitorage ciblé.",
          ),
        ],
        "Après correction, un moniteur EEG frontal est posé et l’hémodynamique se normalise.",
      ),
      qcm(
        "Quels éléments rechercher au réveil ?",
        src("b00166", "b00167"),
        "Le questionnaire de Brice explore souvenirs, perceptions et rêves sans suggérer un scénario.",
        [
          T(
            "Dernier souvenir avant l’endormissement.",
            "Ce dernier souvenir situe le début de la période au cours de laquelle l’amnésie devait être obtenue.",
          ),
          T(
            "Premier souvenir au réveil.",
            "Ce premier souvenir situe la fin de la période anesthésique à explorer avec le patient.",
          ),
          T(
            "Perceptions entre les deux.",
            "Elles recherchent une mémoire explicite peropératoire.",
          ),
          T(
            "Rêves pendant la procédure.",
            "Ils peuvent être décrits sans prouver un éveil.",
          ),
          F(
            "Imposer au patient le récit d’une douleur.",
            "Une question suggestive peut créer un faux souvenir.",
          ),
        ],
        "En SSPI, le patient dit avoir entendu des voix et ressenti une pression abdominale.",
      ),
      qcm(
        "Quelle attitude médicale adopter ?",
        src("b00174"),
        "L’entretien doit reconnaître le récit, expliquer l’investigation et éviter toute négation ou suggestion.",
        [
          T(
            "Écouter le patient sans l’interrompre.",
            "Un récit libre réduit le risque de suggestion.",
          ),
          T(
            "Reconnaître que l’expérience est prise au sérieux.",
            "La validation limite l’isolement traumatique.",
          ),
          F(
            "Dire que cela est impossible sous anesthésie.",
            "La négation peut aggraver la souffrance.",
          ),
          T(
            "Exprimer un regret empathique.",
            "Cela n’équivaut pas à une admission de faute.",
          ),
          T(
            "Documenter précisément les faits.",
            "Le dossier soutient l’analyse et le suivi.",
          ),
        ],
        "Le patient décrit une paralysie angoissante mais aucune douleur intense.",
      ),
      qcm(
        "Quelle prise en charge ultérieure est indiquée ?",
        src("b00174", "b00175", "b00176"),
        "Le risque de stress post-traumatique justifie soutien spécialisé et suivi, même si les symptômes initiaux sont modérés.",
        [
          T(
            "Proposer une consultation psychologique.",
            "Une intervention précoce peut réduire les séquelles.",
          ),
          T(
            "Organiser un suivi anesthésique.",
            "L’analyse de l’événement doit être restituée.",
          ),
          T(
            "Rechercher cauchemars et évitement.",
            "Ils sont des symptômes de stress post-traumatique.",
          ),
          F(
            "Clore le dossier dès la sortie.",
            "Les manifestations peuvent apparaître secondairement.",
          ),
          T(
            "Envisager une thérapie cognitivo-comportementale.",
            "Elle peut traiter des symptômes persistants.",
          ),
        ],
        "Une semaine plus tard, il rapporte insomnie, flashbacks et peur des soins.",
      ),
    ],
  },
  {
    label: "DP QCM 6 · Erreur médicamenteuse sentinelle",
    allowed_voies: ["interne"],
    vignette:
      "Au cours d’une anesthésie jusque-là stable, une seringue non étiquetée est injectée par erreur. Le patient devient immédiatement apnéique et profondément hypotendu. Deux ampoules de morphine et de vasodilatateur étaient côte à côte sur un plateau dont l’organisation varie selon les salles, tandis qu’un appel avait interrompu la préparation.",
    questions: [
      qcm(
        "Quelles actions initiales sont appropriées ?",
        src("b00020", "b00022", "b00027"),
        "La priorité est la stabilisation ABC et l’identification rapide du produit réellement injecté.",
        [
          T(
            "Assister immédiatement la ventilation.",
            "L’apnée provoquée par le produit impose une assistance immédiate avant toute analyse de l’erreur.",
          ),
          T(
            "Soutenir la pression artérielle.",
            "La perfusion d’organe doit être restaurée.",
          ),
          T(
            "Conserver ampoules et seringue pour identification.",
            "Les éléments matériels aident au diagnostic.",
          ),
          F(
            "Chercher d’abord un responsable.",
            "La sécurité du patient précède l’analyse.",
          ),
          T(
            "Mobiliser une seconde équipe pour la ventilation et l’identification du produit.",
            "La crise médicamenteuse impose plusieurs actions simultanées qu’un opérateur seul ne peut conduire sûrement.",
          ),
        ],
      ),
      qcm(
        "Quels facteurs ont favorisé l’erreur ?",
        src("b00027"),
        "La seringue non étiquetée, la proximité des produits et l’absence de barrière indépendante ont rendu la substitution possible.",
        [
          T(
            "L’absence d’étiquette.",
            "Le contenu n’était plus identifiable au moment de l’injection.",
          ),
          T(
            "Le rangement côte à côte.",
            "La proximité favorise une sélection erronée.",
          ),
          F(
            "Le monitorage continu.",
            "Il a permis de détecter la conséquence.",
          ),
          T(
            "L’absence de double contrôle.",
            "Une vérification indépendante aurait pu intercepter l’erreur.",
          ),
          F(
            "La seule fragilité du patient.",
            "Elle module la gravité mais ne crée pas la substitution.",
          ),
        ],
        "La caméra de salle confirme que la préparation a été interrompue par un appel téléphonique.",
      ),
      qcm(
        "Quel rôle joue l’interruption de tâche ?",
        src("b00027", "b00035", "b00036"),
        "Une interruption fragmente la séquence de préparation et favorise reprise au mauvais produit ou oubli d’étiquetage.",
        [
          T(
            "Elle augmente la charge cognitive.",
            "L’opérateur doit reconstruire l’étape en cours.",
          ),
          T(
            "Elle favorise l’omission d’une barrière.",
            "L’étiquetage peut être oublié à la reprise.",
          ),
          F(
            "Elle améliore toujours la précision.",
            "Son effet est généralement délétère dans une tâche critique.",
          ),
          T(
            "Elle doit être limitée pendant la préparation.",
            "Une zone ou période protégée sécurise le processus.",
          ),
          F(
            "Elle rend inutile tout standard de rangement.",
            "Les barrières cumulées restent nécessaires.",
          ),
        ],
        "Le patient est stabilisé après ventilation, naloxone et vasopresseur.",
      ),
      qcm(
        "Quelle analyse doit suivre ?",
        src("b00027", "b00029", "b00030", "b00031"),
        "Une analyse des causes racines reconstruit l’organisation, les facteurs humains et les barrières manquantes.",
        [
          T(
            "Reconstituer la chronologie.",
            "Elle situe les points de rupture successifs.",
          ),
          T(
            "Examiner le stockage des ampoules.",
            "La présentation a contribué à la confusion.",
          ),
          T(
            "Étudier les interruptions et la charge de travail.",
            "Ces facteurs influencent la performance.",
          ),
          F(
            "Sanctionner sans analyser le système.",
            "La punition seule ne prévient pas la récidive.",
          ),
          T(
            "Associer les professionnels concernés.",
            "Le retour d’expérience doit être collectif.",
          ),
        ],
        "La réunion révèle que les plateaux diffèrent selon chaque salle.",
      ),
      qcm(
        "Quelles corrections sont pertinentes ?",
        src("b00020", "b00022", "b00027"),
        "La standardisation, l’étiquetage immédiat et la séparation des produits renforcent plusieurs barrières complémentaires.",
        [
          T(
            "Standardiser tous les plateaux.",
            "Une disposition constante réduit les erreurs sous stress.",
          ),
          T(
            "Étiqueter avant de quitter la seringue.",
            "Le contenu reste toujours identifiable.",
          ),
          T(
            "Séparer les médicaments à haut risque.",
            "La distance limite la confusion visuelle.",
          ),
          F(
            "Tolérer les seringues anonymes si la salle est calme.",
            "L’étiquetage doit rester constant dans toute salle, indépendamment du calme apparent de la situation.",
          ),
          T(
            "Mettre en place un double contrôle ciblé.",
            "Une seconde vérification intercepte les produits critiques.",
          ),
        ],
        "Le service souhaite également réduire les appels pendant la préparation.",
      ),
      qcm(
        "Comment traiter les interruptions ?",
        src("b00027", "b00033", "b00034"),
        "Une tâche médicamenteuse critique doit être protégée, avec relais pour les communications non urgentes.",
        [
          T(
            "Créer une zone de préparation protégée.",
            "Un signal visuel peut décourager les interruptions.",
          ),
          T(
            "Déléguer les appels non urgents.",
            "L’opérateur termine la séquence sans rupture.",
          ),
          F(
            "Interdire tout appel d’urgence.",
            "Une vraie urgence doit évidemment être transmise.",
          ),
          T(
            "Reprendre la check-list après toute rupture.",
            "Le redémarrage structuré évite une étape manquée.",
          ),
          F(
            "Compter sur l’expérience seule.",
            "Même un expert reste vulnérable aux interruptions.",
          ),
        ],
        "Le patient récupère sans séquelle et demande ce qui sera changé.",
      ),
      qcm(
        "Quelle communication est adaptée ?",
        src("b00012", "b00013", "b00027"),
        "Une information transparente décrit l’événement, ses conséquences, le suivi et les actions correctives.",
        [
          T(
            "Expliquer factuellement ce qui est connu.",
            "La transparence soutient la confiance.",
          ),
          T(
            "Présenter le suivi clinique prévu.",
            "Le patient doit connaître les conséquences recherchées.",
          ),
          T(
            "Décrire les mesures de prévention décidées.",
            "Le retour d’expérience montre l’apprentissage collectif.",
          ),
          F(
            "Nier l’injection erronée.",
            "La dissimulation détruit la relation et la sécurité.",
          ),
          F(
            "Accuser publiquement une personne isolée.",
            "L’analyse a montré des causes systémiques multiples.",
          ),
        ],
        "Une synthèse écrite est préparée pour le patient et la commission qualité.",
      ),
    ],
  },
  {
    label: "DP QCM 7 · Hypercapnie en SSPI après HM fruste",
    allowed_voies: ["interne"],
    vignette:
      "Une patiente adolescente de 16 ans opérée d’une scoliose sous anesthésie volatile arrive en SSPI avec une tachycardie inexpliquée. Sa température est à 37,8 °C, le CO2 expiré augmente progressivement malgré une ventilation minute accrue et une rigidité massétérine discrète est notée par l’infirmière.",
    questions: [
      qcm(
        "Quelles interprétations sont justes ?",
        src("b00093", "b00094", "b00095"),
        "Une HM fruste peut apparaître avec un seul signe majeur ; l’absence d’hyperthermie franche ne doit pas rassurer.",
        [
          T(
            "L’hypercapnie progressive est alarmante.",
            "Elle est le signal le plus précoce.",
          ),
          T(
            "La rigidité massétérine renforce la suspicion.",
            "La rigidité est spécifique quoique inconstante.",
          ),
          F("37,8 °C exclut l’HM.", "La température peut monter tardivement."),
          T(
            "Une exposition volatile est pertinente.",
            "Elle fournit un déclencheur reconnu.",
          ),
          F(
            "Une crise doit toujours être fulminante.",
            "Une crise peut rester fruste et ne présenter qu’une hypercapnie progressive ou une rigidité discrète.",
          ),
        ],
      ),
      qcm(
        "Quelle conduite initiale est sûre ?",
        src("b00102", "b00103", "b00116"),
        "En cas de doute, la létalité potentielle justifie d’arrêter le déclencheur et de traiter immédiatement l’HM.",
        [
          T(
            "Arrêter toute exposition volatile résiduelle.",
            "La source déclenchante doit disparaître.",
          ),
          T(
            "Ventiler à O2 100 % à haut débit.",
            "Cela traite l’hypercapnie et élimine le volatile.",
          ),
          T(
            "Préparer le dantrolène.",
            "Le traitement spécifique ne doit pas être retardé.",
          ),
          F(
            "Attendre la culture sanguine.",
            "Le diagnostic différentiel ne retarde pas le traitement.",
          ),
          T(
            "Appeler une équipe de renfort.",
            "La crise exige une organisation rapide.",
          ),
        ],
        "Le gaz du sang montre pH 7,19, PaCO2 élevée et lactate augmenté.",
      ),
      qcm(
        "Quels diagnostics différentiels doivent être envisagés ?",
        src("b00116", "b00117"),
        "Sepsis, thyrotoxicose, phéochromocytome et autres hypermétabolismes sont recherchés parallèlement.",
        [
          T(
            "Un sepsis aigu hypermétabolique.",
            "L’infection sévère peut associer hyperthermie, tachycardie et instabilité circulatoire.",
          ),
          T(
            "Une décompensation thyréotoxique.",
            "L’excès d’hormones thyroïdiennes produit tachycardie, chaleur et hypermétabolisme.",
          ),
          T(
            "Une crise catécholaminergique de phéochromocytome.",
            "Une décharge catécholaminergique peut mimer le tableau.",
          ),
          F(
            "Une allergie alimentaire chronique isolée.",
            "Elle n’explique pas ce syndrome aigu.",
          ),
          T(
            "Une rhabdomyolyse d’autre cause.",
            "Elle partage hyperkaliémie et myoglobinurie.",
          ),
        ],
        "La CK initiale est modérément élevée et la kaliémie passe à 5,9 mmol/L.",
      ),
      qcm(
        "Quels éléments du score clinique peuvent s’accumuler ?",
        src("b00120", "b00122"),
        "Rigidité, lyse musculaire, acidose, hyperthermie et histoire familiale sont des processus pondérés par le NAMHR.",
        [
          T(
            "Rigidité musculaire.",
            "La rigidité généralisée ou massétérine pondère le premier processus du score clinique.",
          ),
          T("CK élevée.", "Elle contribue au processus de lyse musculaire."),
          T(
            "Hypercapnie inappropriée.",
            "Elle participe au processus d’acidose respiratoire.",
          ),
          T(
            "Tachycardie sinusale nouvelle sans stimulus identifiable.",
            "Elle ajoute un indicateur d’atteinte cardiaque.",
          ),
          F(
            "Une radiographie normale.",
            "Le score NAMHR ne comporte aucun critère radiographique parmi ses processus pondérés.",
          ),
        ],
        "Le dantrolène fait chuter le CO2 et la tachycardie.",
      ),
      qcm(
        "Comment interpréter cette réponse ?",
        src("b00104", "b00120"),
        "L’amélioration sous dantrolène soutient la probabilité clinique mais n’établit pas seule la susceptibilité génétique.",
        [
          T(
            "Elle renforce la suspicion d’HM.",
            "Le mécanisme ciblé répond au médicament spécifique.",
          ),
          F(
            "Elle prouve à elle seule la mutation.",
            "Le statut génétique nécessite une exploration.",
          ),
          T(
            "Le score clinique doit intégrer tous les signes.",
            "La probabilité repose sur l’ensemble de l’événement.",
          ),
          F(
            "Elle autorise une nouvelle exposition volatile.",
            "Le risque futur doit être considéré.",
          ),
          T(
            "Une consultation spécialisée reste nécessaire.",
            "Le diagnostic définitif et familial doit être organisé.",
          ),
        ],
        "La patiente est transférée en réanimation pour surveillance.",
      ),
      qcm(
        "Quelles complications rechercher pendant 24 à 48 heures ?",
        src("b00096", "b00100", "b00114"),
        "La récidive et les conséquences de la rhabdomyolyse ou de l’hyperthermie peuvent être retardées.",
        [
          T(
            "Une insuffisance rénale aiguë.",
            "La myoglobinurie est néphrotoxique.",
          ),
          T("Une CIVD.", "La crise sévère active la coagulation."),
          T(
            "Une récidive hypermétabolique.",
            "Elle peut survenir sans nouveau déclencheur.",
          ),
          T(
            "Un SDRA.",
            "La défaillance respiratoire fait partie des complications.",
          ),
          F(
            "Une guérison certaine après une heure.",
            "La surveillance prolongée reste indispensable.",
          ),
        ],
        "L’évolution reste favorable ; la famille rapporte un décès anesthésique inexpliqué chez un oncle.",
      ),
      qcm(
        "Quelle démarche diagnostique familiale proposer ?",
        src("b00119", "b00120", "b00121", "b00133"),
        "L’événement et l’histoire familiale justifient un centre expert, un test fonctionnel et éventuellement une analyse génétique ciblée.",
        [
          T(
            "Évaluer la patiente en centre HM.",
            "L’expertise guide le diagnostic et la famille.",
          ),
          T(
            "Discuter une biopsie pour test de contracture.",
            "Il confirme la susceptibilité avec forte sensibilité.",
          ),
          T(
            "Rechercher une mutation familiale si possible.",
            "Un résultat peut faciliter le dépistage des apparentés.",
          ),
          F(
            "Classer l’événement sans suite.",
            "Le risque concerne les anesthésies futures et la parenté.",
          ),
          T(
            "Informer les apparentés du risque potentiel.",
            "La transmission est souvent autosomique dominante.",
          ),
        ],
        "Un courrier de sortie provisoire recommande une anesthésie sans déclencheur.",
      ),
    ],
  },
  {
    label: "DP QCM 8 · Éveil mémorisé après césarienne",
    allowed_voies: ["interne"],
    vignette:
      "Une femme de 36 ans subit une césarienne en extrême urgence sous anesthésie générale avec curare, dans un contexte d’instabilité maternelle. Au lendemain de l’intervention, la patiente rapporte avoir entendu l’équipe, ressenti l’incision et vécu une paralysie angoissante sans pouvoir signaler qu’elle était consciente.",
    questions: [
      qcm(
        "Quels facteurs rendent ce récit plausible ?",
        src("b00162", "b00163", "b00164", "b00171"),
        "Césarienne urgente et curarisation sont des contextes reconnus de sous-dosage et de mémorisation.",
        [
          T(
            "La césarienne.",
            "Les doses peuvent être limitées avant l’extraction.",
          ),
          T(
            "L’urgence.",
            "Elle réduit le temps de préparation et d’optimisation.",
          ),
          T("Le bloc neuromusculaire.", "Il masque les mouvements de défense."),
          F(
            "La paralysie prouve l’absence de conscience.",
            "Elle empêche seulement la réponse motrice.",
          ),
          T(
            "Le souvenir auditif et douloureux.",
            "Il correspond à une mémoire explicite peropératoire.",
          ),
        ],
      ),
      qcm(
        "Comment conduire le premier entretien ?",
        src("b00166", "b00167", "b00174"),
        "Le récit libre et le questionnaire de Brice explorent l’épisode sans le nier ni suggérer des détails.",
        [
          T(
            "Demander le dernier souvenir avant le sommeil.",
            "Cette question situe le début de la période d’amnésie et facilite la reconstruction chronologique.",
          ),
          T(
            "Demander le premier souvenir au réveil.",
            "Cette question complète la chronologie.",
          ),
          T(
            "Explorer les perceptions entre les deux.",
            "Le patient décrit spontanément sons, douleur ou paralysie.",
          ),
          F(
            "Affirmer que le récit est impossible.",
            "Nier un récit cohérent isole la patiente et peut majorer durablement sa détresse psychologique.",
          ),
          F(
            "Suggérer les paroles exactes entendues.",
            "La mémoire reconstructive expose aux faux positifs.",
          ),
        ],
        "Elle décrit précisément une conversation vérifiable dans le dossier opératoire.",
      ),
      qcm(
        "Quelle attitude relationnelle est correcte ?",
        src("b00174"),
        "L’équipe doit reconnaître l’expérience, écouter avec empathie et expliquer qu’une analyse est engagée.",
        [
          T(
            "Prendre le récit au sérieux.",
            "La validation réduit le sentiment d’abandon.",
          ),
          T(
            "Formuler un regret explicite face à l’expérience vécue.",
            "Cette reconnaissance empathique valide la souffrance sans préjuger une responsabilité juridique.",
          ),
          T(
            "Expliquer les vérifications prévues.",
            "Une démarche transparente soutient la confiance.",
          ),
          F(
            "Minimiser car la chirurgie est terminée.",
            "Les conséquences psychiques peuvent être majeures.",
          ),
          F(
            "Éviter toute trace dans le dossier.",
            "La documentation est indispensable au suivi.",
          ),
        ],
        "L’analyse montre une concentration expirée inférieure à 0,7 MAC pendant plusieurs minutes.",
      ),
      qcm(
        "Quelles barrières auraient pu détecter l’allègement ?",
        src("b00172", "b00173"),
        "Une alarme de concentration et une anticipation hypnotique adaptée à l’urgence auraient réduit la durée du sous-dosage.",
        [
          T(
            "Une alarme sous 0,7 MAC.",
            "Elle signale une concentration volatile insuffisante.",
          ),
          T(
            "Une vérification répétée du vaporisateur.",
            "Elle confirme la délivrance effective.",
          ),
          T(
            "Une dose hypnotique supplémentaire anticipée.",
            "Elle couvre un délai d’intubation ou d’extraction.",
          ),
          F(
            "Une dose supplémentaire de curare seule.",
            "Elle masque la réaction sans restaurer l’inconscience.",
          ),
          T(
            "Un monitorage neurologique ciblé.",
            "Il peut compléter les autres barrières chez un patient à risque.",
          ),
        ],
        "La patiente présente des cauchemars et refuse de fermer les yeux.",
      ),
      qcm(
        "Quels symptômes de stress post-traumatique rechercher ?",
        src("b00174", "b00175", "b00176"),
        "Hyperstimulation, sommeil perturbé, reviviscences et évitement sont des manifestations typiques.",
        [
          T("Des flashbacks.", "Ils font revivre involontairement l’épisode."),
          T("Une hypervigilance.", "Elle traduit une activation persistante."),
          T(
            "Des comportements d’évitement.",
            "Le patient fuit les rappels de l’événement.",
          ),
          T(
            "Des cauchemars.",
            "Ils perturbent le sommeil après le traumatisme.",
          ),
          F(
            "Une amélioration immédiate obligatoire.",
            "Les symptômes peuvent durer ou apparaître secondairement.",
          ),
        ],
        "Elle accepte de rencontrer un psychologue avant la sortie.",
      ),
      qcm(
        "Quelle prise en charge proposer ?",
        src("b00174", "b00176"),
        "Un soutien précoce, un suivi programmé et une thérapie adaptée sont indiqués après détresse peropératoire.",
        [
          T(
            "Consultation psychologique ou psychiatrique.",
            "Elle évalue la sévérité et initie le soutien.",
          ),
          T(
            "Suivi anesthésique dédié.",
            "L’analyse et les explications doivent être poursuivies.",
          ),
          T(
            "Thérapie cognitivo-comportementale si symptômes persistants.",
            "Elle traite les mécanismes du traumatisme.",
          ),
          F(
            "Simple conseil d’oublier.",
            "Cette injonction invalide la souffrance.",
          ),
          T(
            "Planifier un contact après la sortie.",
            "Les symptômes peuvent évoluer dans le temps.",
          ),
        ],
        "Un mois plus tard, les flashbacks diminuent mais l’anxiété persiste.",
      ),
      qcm(
        "Quelles informations préparer pour une future anesthésie ?",
        src("b00163", "b00172", "b00173"),
        "L’antécédent doit être visible et conduire à une stratégie de délivrance hypnotique renforcée et vérifiée.",
        [
          T(
            "Documenter l’antécédent dans le dossier.",
            "Il constitue un facteur de risque reconnu.",
          ),
          T(
            "Prévoir un monitorage adapté au type d’anesthésie.",
            "Concentration expirée ou EEG peuvent renforcer la surveillance.",
          ),
          T(
            "Vérifier les systèmes d’administration.",
            "Une délivrance fiable reste la première barrière.",
          ),
          F(
            "Éviter toute anesthésie à vie.",
            "Une anesthésie future peut être sécurisée.",
          ),
          T(
            "Informer l’équipe avant l’induction.",
            "Une stratégie partagée prévient la répétition.",
          ),
        ],
        "La patiente demande si elle pourra être anesthésiée de nouveau sans revivre l’épisode.",
      ),
    ],
  },
];

const QROC_SERIES = [
  {
    label: "QROC — Série 1 · Épidémiologie et parcours",
    allowed_voies: ["externe"],
    questions: [
      qroc(
        "Quelle ampleur de réduction de la mortalité anesthésique a été observée en France entre 1980 et 2000 ?",
        "10|facteur 10|dix",
        src("b00004"),
        "L’enquête française rapporte une division approximative par dix.",
      ),
      qroc(
        "Quel est l’ordre de grandeur de la mortalité en chirurgie ambulatoire mineure ?",
        "1/100 000|un décès pour 100 000",
        src("b00009"),
        "Le décès est exceptionnel, ce qui déplace l’évaluation vers la qualité.",
      ),
      qroc(
        "Jusqu’à quel pourcentage peut monter la mortalité globale d’une chirurgie urgente chez un sujet âgé fragile ?",
        "15 à 20 %|15-20 %",
        src("b00010"),
        "Ce risque global reflète surtout terrain, pathologie et chirurgie.",
      ),
      qroc(
        "Quel modèle organise les soins avant, pendant et après la chirurgie ?",
        "médecine périopératoire|parcours de soins périopératoire",
        src("b00012", "b00013"),
        "La médecine périopératoire remplace une activité isolée en silo.",
      ),
      qroc(
        "Quelle proportion peuvent atteindre les complications d’organe après chirurgie majeure ?",
        "30 à 50 %|30-50 %",
        src("b00016"),
        "Ces complications fréquentes sont distinctes des rares décès anesthésiques directs.",
      ),
    ],
  },
  {
    label: "QROC — Série 2 · Sécurité et système",
    allowed_voies: ["externe"],
    questions: [
      qroc(
        "Quelle méthode analyse en profondeur un événement sentinelle ?",
        "analyse des causes racines|analyse cause racine",
        src("b00027"),
        "Elle recherche les conditions systémiques qui ont permis l’événement.",
      ),
      qroc(
        "Quel réglage peropératoire réduit les complications pulmonaires ?",
        "ventilation protectrice|ventilation peropératoire protectrice",
        src("b00019"),
        "Une stratégie ventilatoire protectrice réduit notamment réintubation et VNI.",
      ),
      qroc(
        "Quelle action immédiate sécurise une seringue préparée ?",
        "étiquetage immédiat|étiqueter immédiatement la seringue",
        src("b00020", "b00027"),
        "Une seringue ne doit jamais être laissée sans identification.",
      ),
      qroc(
        "Quel facteur humain fragmente dangereusement une préparation médicamenteuse ?",
        "interruption de tâche|interruptions de tâche",
        src("b00027"),
        "L’interruption favorise omission, confusion et reprise à la mauvaise étape.",
      ),
      qroc(
        "Quel est l’objectif d’un retour d’expérience après erreur ?",
        "renforcer les barrières de sécurité|prévenir la récidive",
        src("b00027"),
        "L’analyse doit produire une correction durable du système.",
      ),
    ],
  },
  {
    label: "QROC — Série 3 · Diagnostic d’anaphylaxie",
    allowed_voies: ["externe"],
    questions: [
      qroc(
        "Quel signe inaugure le plus souvent une anaphylaxie périopératoire ?",
        "hypotension|chute tensionnelle",
        src("b00044"),
        "L’hypotension est le symptôme initial le plus fréquent.",
      ),
      qroc(
        "Quel grade de Ring et Messmer correspond à un arrêt cardiorespiratoire ?",
        "grade IV|IV|4",
        src("b00042"),
        "Le grade IV désigne l’arrêt cardiaque ou respiratoire.",
      ),
      qroc(
        "Après quel délai de choc traité parle-t-on d’anaphylaxie réfractaire ?",
        "plus de 10 minutes|10 minutes|> 10 min",
        src("b00045"),
        "La définition suppose un traitement recommandé correctement conduit.",
      ),
      qroc(
        "À quelle fréquence approximative survient une anaphylaxie périopératoire grave ?",
        "1/10 000|un cas pour 10 000",
        src("b00047"),
        "Les formes graves sont proches d’un cas pour dix mille anesthésies générales.",
      ),
      qroc(
        "Quel signe visible peut manquer au début d’une anaphylaxie ?",
        "signes cutanés|éruption cutanée|urticaire",
        src("b00044"),
        "Les signes cutanés apparaissent souvent secondairement.",
      ),
    ],
  },
  {
    label: "QROC — Série 4 · Agents et allergologie",
    allowed_voies: ["externe"],
    questions: [
      qroc(
        "Quelles deux classes dominent l’anaphylaxie périopératoire ?",
        "curares et antibiotiques|antibiotiques et curares",
        src("b00048", "b00050"),
        "Ces deux familles restent les principales responsables.",
      ),
      qroc(
        "Quel antagoniste du curare peut lui-même provoquer une anaphylaxie ?",
        "sugammadex",
        src("b00049"),
        "Le sugammadex est une cyclodextrine synthétique potentiellement allergisante.",
      ),
      qroc(
        "Quel antiseptique est une cause émergente souvent cachée ?",
        "chlorhexidine",
        src("b00054"),
        "Elle est présente dans de nombreux dispositifs et produits.",
      ),
      qroc(
        "Quelle consultation est indiquée devant une allergie périopératoire suspectée ?",
        "consultation d’allergo-anesthésie|allergo-anesthésie",
        src("b00079"),
        "Elle hiérarchise les suspects et programme les tests.",
      ),
      qroc(
        "Quel risque augmente si une fausse allergie aux bêta-lactamines impose une alternative ?",
        "risque infectieux postopératoire|infection postopératoire",
        src("b00077", "b00078"),
        "Une antibioprophylaxie moins adaptée peut augmenter les infections.",
      ),
    ],
  },
  {
    label: "QROC — Série 5 · Traitement de l’anaphylaxie",
    allowed_voies: ["externe"],
    questions: [
      qroc(
        "Quel est le médicament prioritaire d’une anaphylaxie grave ?",
        "adrénaline|épinéphrine",
        src("b00068", "b00070"),
        "L’adrénaline corrige vasoplégie, œdème et bronchospasme.",
      ),
      qroc(
        "Quelle dose IV initiale d’adrénaline est proposée au grade III ?",
        "50 µg|50 microgrammes",
        src("b00070"),
        "Le grade III menaçant la vie reçoit initialement 50 microgrammes IV.",
      ),
      qroc(
        "Quelle dose d’adrénaline accompagne un arrêt anaphylactique ?",
        "1 mg|un milligramme",
        src("b00070"),
        "Le grade IV relève des doses de réanimation cardiopulmonaire.",
      ),
      qroc(
        "Quel médicament discuter sous bêtabloquant en choc réfractaire ?",
        "glucagon",
        src("b00070"),
        "Le glucagon agit indépendamment des récepteurs bêta.",
      ),
      qroc(
        "Quel biomarqueur prélever après stabilisation d’une anaphylaxie ?",
        "tryptase|tryptase sérique",
        src("b00070"),
        "La tryptase documente l’activation mastocytaire sans retarder le traitement.",
      ),
    ],
  },
  {
    label: "QROC — Série 6 · Reconnaissance de l’HM",
    allowed_voies: ["externe"],
    questions: [
      qroc(
        "Quel canal musculaire est principalement impliqué dans l’HM ?",
        "récepteur ryanodine|RYR1",
        src("b00086"),
        "Une libération calcique sarcoplasmique incontrôlée déclenche la crise.",
      ),
      qroc(
        "Quels deux types d’agents déclenchent l’HM ?",
        "anesthésiques volatils et succinylcholine|volatils et curare dépolarisant",
        src("b00086", "b00087"),
        "Les volatils et la succinylcholine sont les déclencheurs reconnus.",
      ),
      qroc(
        "Quel est le signe le plus précoce d’HM ?",
        "hypercapnie inexpliquée|augmentation du CO2 expiré",
        src("b00095"),
        "Une hausse progressive du CO2 expiré précède souvent la fièvre.",
      ),
      qroc(
        "Quel signe est le plus spécifique d’HM malgré son inconstance ?",
        "rigidité musculaire|rigidité",
        src("b00116", "b00147", "b00148"),
        "La rigidité est plus spécifique que l’hyperthermie.",
      ),
      qroc(
        "Quel mode de transmission est habituel dans l’HM ?",
        "autosomique dominant|transmission autosomique dominante",
        src("b00090"),
        "La parenté au premier degré doit donc être informée.",
      ),
    ],
  },
  {
    label: "QROC — Série 7 · Traitement et prévention de l’HM",
    allowed_voies: ["externe"],
    questions: [
      qroc(
        "Quelle dose initiale de dantrolène faut-il administrer ?",
        "2,5 mg/kg|2.5 mg/kg",
        src("b00104"),
        "La dose est répétée toutes les cinq minutes selon la réponse.",
      ),
      qroc(
        "Quelle dose cumulée initiale de dantrolène peut être atteinte ?",
        "10 mg/kg|dix mg/kg",
        src("b00104"),
        "Le traitement est poursuivi jusqu’au contrôle ou 10 mg/kg.",
      ),
      qroc(
        "Quel débit de gaz frais utiliser pendant une crise d’HM ?",
        "> 10 L/min|plus de 10 L/min",
        src("b00103"),
        "Un très haut débit élimine le volatile et aide à contrôler le CO2.",
      ),
      qroc(
        "Quelle diurèse faut-il viser pendant une crise d’HM ?",
        "> 2 mL/kg/h|plus de 2 mL/kg/h",
        src("b00106"),
        "Cette cible protège le rein exposé à la myoglobine.",
      ),
      qroc(
        "Quel test fonctionnel confirme une susceptibilité à l’HM ?",
        "test de contracture halothane-caféine|test halothane caféine",
        src("b00119", "b00120"),
        "Le test sur biopsie musculaire reste la référence fonctionnelle.",
      ),
    ],
  },
  {
    label: "QROC — Série 8 · Conscience sous anesthésie",
    allowed_voies: ["externe"],
    questions: [
      qroc(
        "Quel mécanisme médicamenteux explique le plus souvent un épisode d’éveil peropératoire ?",
        "sous-dosage hypnotique|sous-titrage hypnotique",
        src("b00162"),
        "Une dose insuffisante ou mal délivrée est le mécanisme dominant.",
      ),
      qroc(
        "Quel seuil de MAC expirée peut déclencher une alarme préventive ?",
        "0,7 MAC|0.7 MAC",
        src("b00172"),
        "Une concentration inférieure à 0,7 MAC doit alerter.",
      ),
      qroc(
        "Quel questionnaire recherche un éveil mémorisé en postopératoire ?",
        "questionnaire de Brice|Brice",
        src("b00166", "b00167"),
        "Il structure l’exploration des souvenirs périopératoires.",
      ),
      qroc(
        "Quel bolus de propofol est proposé devant une suspicion peropératoire ?",
        "0,5 mg/kg|0.5 mg/kg",
        src("b00174"),
        "Ce renfort hypnotique est administré après vérification de la délivrance.",
      ),
      qroc(
        "Quelle séquelle psychique majeure faut-il dépister ?",
        "syndrome de stress post-traumatique|SSPT|PTSD",
        src("b00174", "b00175", "b00176"),
        "Douleur et paralysie peuvent entraîner un syndrome post-traumatique.",
      ),
    ],
  },
];

const DP_QROC_SERIES = [
  {
    label: "DP QROC 1 · Anaphylaxie retardée à la chlorhexidine",
    allowed_voies: ["externe"],
    vignette:
      "Une femme de 62 ans est anesthésiée pour une chirurgie urologique. L’induction avec propofol, rocuronium et céfazoline est bien tolérée. Quinze minutes après la pose d’une sonde urinaire, elle devient hypotendue et bronchospastique.",
    questions: [
      qroc(
        "Quel diagnostic syndromique faut-il retenir en premier ?",
        "anaphylaxie périopératoire|anaphylaxie",
        src("b00040", "b00041", "b00044"),
        "Le choc et le bronchospasme aigus définissent une hypersensibilité grave.",
      ),
      qroc(
        "Quel agent caché faut-il particulièrement suspecter ?",
        "chlorhexidine",
        src("b00054"),
        "Un gel urétral peut exposer secondairement à la chlorhexidine.",
        "Le gel urétral utilisé pour la sonde contient de la chlorhexidine.",
      ),
      qroc(
        "Quel grade de Ring et Messmer correspond au tableau ?",
        "grade III|III|3",
        src("b00042"),
        "Le choc associé à un bronchospasme sévère menace le pronostic vital.",
        "La pression est à 48/25 mmHg et la SpO2 à 86 %.",
      ),
      qroc(
        "Quelle dose initiale d’adrénaline IV est proposée ?",
        "50 µg|50 microgrammes",
        src("b00070"),
        "Le grade III justifie un premier bolus IV de 50 microgrammes.",
        "L’accès veineux fonctionne et aucun arrêt cardiaque n’est présent.",
      ),
      qroc(
        "Quel remplissage faut-il associer ?",
        "bolus rapides de cristalloïdes|cristalloïdes rapides",
        src("b00070", "b00081"),
        "La fuite capillaire impose une expansion vasculaire rapide et répétée.",
        "La pression ne s’améliore que transitoirement après le premier bolus.",
      ),
      qroc(
        "Quel dosage sanguin doit être organisé sans retarder les soins ?",
        "tryptase sérique|tryptase",
        src("b00070"),
        "La tryptase aide à confirmer l’activation mastocytaire.",
        "La patiente se stabilise après l’escalade d’adrénaline.",
      ),
      qroc(
        "Quelle consultation doit être programmée avant une nouvelle anesthésie ?",
        "consultation d’allergo-anesthésie|allergo-anesthésie",
        src("b00079"),
        "Elle testera les agents et précisera les évictions futures.",
        "Le dossier recense tous les produits et leurs horaires.",
      ),
    ],
  },
  {
    label: "DP QROC 2 · Choc après sugammadex",
    allowed_voies: ["externe"],
    vignette:
      "Un homme de 50 ans reçoit du sugammadex en fin d’anesthésie générale, après une intervention sans incident et une curarisation au rocuronium. Deux minutes plus tard, le patient présente une urticaire généralisée, une tachycardie et une chute tensionnelle modérée, sans bronchospasme ni difficulté ventilatoire.",
    questions: [
      qroc(
        "Quelle classe d’événement médicamenteux évoquez-vous ?",
        "réaction d’hypersensibilité|hypersensibilité périopératoire",
        src("b00040", "b00049"),
        "Le sugammadex peut provoquer une hypersensibilité immédiate.",
      ),
      qroc(
        "Quel grade clinique correspond à cette atteinte modérée multiviscérale ?",
        "grade II|II|2",
        src("b00042"),
        "Peau, tachycardie et hypotension modérée correspondent au grade II.",
        "La pression reste à 82/48 mmHg, sans signe de menace vitale.",
      ),
      qroc(
        "Quelle dose d’adrénaline IV peut être titrée initialement ?",
        "10 à 20 µg|10-20 microgrammes",
        src("b00070"),
        "Le grade II peut recevoir des microbolus IV de 10 à 20 microgrammes.",
        "L’hypotension persiste malgré l’arrêt de l’exposition.",
      ),
      qroc(
        "Quel soluté faut-il administrer en bolus ?",
        "cristalloïde|cristalloïdes",
        src("b00070"),
        "Un cristalloïde rapide restaure le volume circulant effectif.",
        "La réponse au premier microbolus d’adrénaline est partielle.",
      ),
      qroc(
        "Quelle structure chimique du sugammadex peut expliquer une sensibilisation préalable ?",
        "cyclodextrine",
        src("b00049", "b00053"),
        "Les cyclodextrines sont présentes dans des produits courants.",
        "Le patient affirme n’avoir jamais reçu ce médicament.",
      ),
      qroc(
        "Combien de temps au minimum faut-il le surveiller après récupération ?",
        "6 heures|six heures|au moins 6 heures",
        src("b00070"),
        "Une surveillance d’au moins six heures est recommandée après récupération.",
        "Les constantes se normalisent et l’éruption régresse.",
      ),
      qroc(
        "Quel document clinique est indispensable pour l’exploration ?",
        "chronologie des produits administrés|liste horodatée des produits",
        src("b00070", "b00079"),
        "La liste horodatée hiérarchise précisément les agents suspects.",
        "Le patient est informé de la nécessité d’un bilan spécialisé.",
      ),
    ],
  },
  {
    label: "DP QROC 3 · HM fruste au réveil",
    allowed_voies: ["externe"],
    vignette:
      "Un patient de 17 ans arrive en SSPI après une anesthésie générale entretenue au desflurane. Il reste tachycarde sans douleur évidente et son CO2 expiré augmente malgré une ventilation minute progressivement accrue. Sa température est à 38,0 °C et aucune infection n’était suspectée avant l’intervention.",
    questions: [
      qroc(
        "Quel diagnostic grave doit être traité sans attendre ?",
        "hyperthermie maligne|HM",
        src("b00095"),
        "Une hypercapnie progressive après volatile est le signal précoce majeur.",
      ),
      qroc(
        "Quel signe musculaire renforcerait spécifiquement la suspicion ?",
        "rigidité musculaire|rigidité",
        src("b00116", "b00147", "b00148"),
        "La rigidité est spécifique bien qu’inconstante.",
        "Une rigidité massétérine puis généralisée apparaît.",
      ),
      qroc(
        "Quel médicament spécifique faut-il préparer immédiatement ?",
        "dantrolène",
        src("b00102"),
        "Le dantrolène inhibe la libération calcique musculaire.",
        "L’équipe arrête toute exposition résiduelle au volatile.",
      ),
      qroc(
        "Quelle dose doit être injectée toutes les cinq minutes ?",
        "2,5 mg/kg|2.5 mg/kg",
        src("b00104"),
        "Les bolus de 2,5 mg/kg sont répétés selon la réponse.",
        "Le CO2 continue d’augmenter sous O2 à 100 %.",
      ),
      qroc(
        "Quel débit urinaire faut-il viser ?",
        "> 2 mL/kg/h|plus de 2 mL/kg/h",
        src("b00106"),
        "La cible protège le rein contre la myoglobinurie.",
        "La CK et la myoglobine augmentent rapidement.",
      ),
      qroc(
        "À quelle température faut-il interrompre le refroidissement actif ?",
        "environ 38 °C|38 °C",
        src("b00111"),
        "Le refroidissement est arrêté autour de 38 °C pour éviter l’hypothermie.",
        "Après traitement, la température redescend depuis 40,1 °C.",
      ),
      qroc(
        "Combien de temps faut-il surveiller le risque de récidive en réanimation ?",
        "24 à 48 heures|24-48 heures",
        src("b00112", "b00114"),
        "Une récidive est possible sans nouvelle exposition.",
        "Le patient est stable après une dose cumulée de 10 mg/kg.",
      ),
    ],
  },
  {
    label: "DP QROC 4 · Dépistage familial de l’HM",
    allowed_voies: ["externe"],
    vignette:
      "Une femme de 27 ans consulte avant une chirurgie abdominale programmée. Sa mère a survécu à une hyperthermie maligne et porte une mutation familiale identifiée. La patiente n’a jamais été anesthésiée, n’a aucun symptôme musculaire et souhaite comprendre son risque ainsi que les conséquences pour l’anesthésie prévue.",
    questions: [
      qroc(
        "Quel mode de transmission explique son risque ?",
        "autosomique dominant|transmission autosomique dominante",
        src("b00090"),
        "Une apparentée au premier degré peut porter la susceptibilité.",
      ),
      qroc(
        "Quel type de test moléculaire est particulièrement pertinent ?",
        "test génétique ciblé|recherche de la mutation familiale",
        src("b00133"),
        "Une mutation familiale connue permet une recherche ciblée.",
        "Le laboratoire peut rechercher précisément la mutation maternelle.",
      ),
      qroc(
        "Quel test fonctionnel sur muscle peut confirmer la susceptibilité ?",
        "test de contracture halothane-caféine|test halothane caféine",
        src("b00119", "b00120"),
        "Le test de contracture reste la référence fonctionnelle.",
        "Le test génétique n’est pas disponible avant la date opératoire.",
      ),
      qroc(
        "Quel type d’anesthésie générale peut être proposé ?",
        "anesthésie intraveineuse totale|TIVA|anesthésie IV sans déclencheur",
        src("b00136"),
        "Une anesthésie intraveineuse totale évite les volatils et la succinylcholine, qui sont les déclencheurs reconnus.",
        "La chirurgie ne peut pas être réalisée sous ALR seule.",
      ),
      qroc(
        "Quel élément de la machine doit être retiré ?",
        "vaporisateurs|vaporisateur",
        src("b00137"),
        "Le retrait empêche une administration accidentelle de volatile.",
        "La salle est préparée selon le protocole HM.",
      ),
      qroc(
        "Quelle quantité de dantrolène doit être immédiatement disponible ?",
        "10 mg/kg|dix mg/kg",
        src("b00139"),
        "La réserve doit couvrir la dose cumulée initiale complète.",
        "La patiente pèse 60 kg et la pharmacie vérifie le stock.",
      ),
      qroc(
        "Quelle durée d’observation en SSPI est proposée après une technique sûre ?",
        "2 à 4 heures|2-4 heures",
        src("b00140"),
        "L’ambulatoire reste possible sous conditions après deux à quatre heures.",
        "L’intervention se déroule sans aucun signe de crise.",
      ),
    ],
  },
  {
    label: "DP QROC 5 · Allègement lors d’une intubation difficile",
    allowed_voies: ["externe"],
    vignette:
      "Un homme de 70 ans avec faible réserve cardiaque est induit pour une chirurgie digestive urgente. Après curarisation, plusieurs tentatives d’intubation prolongent la séquence alors que l’oxygénation reste maintenue. La dose hypnotique initiale date de huit minutes et aucun renfort n’a encore été administré au patient.",
    questions: [
      qroc(
        "Quel risque cérébral faut-il anticiper ?",
        "conscience sous anesthésie|éveil sous anesthésie",
        src("b00162"),
        "Le retard après une dose initiale favorise un allègement involontaire.",
      ),
      qroc(
        "Quelle est la cause la plus fréquente de cette complication ?",
        "sous-dosage hypnotique|sous-titrage hypnotique",
        src("b00162"),
        "La dose hypnotique devient insuffisante pendant la prise en charge prolongée.",
        "La pression limite la possibilité d’une forte dose supplémentaire.",
      ),
      qroc(
        "Quelle dose de propofol peut être administrée devant une suspicion ?",
        "0,5 mg/kg|0.5 mg/kg",
        src("b00174"),
        "Un bolus de 0,5 mg/kg est proposé comme renfort hypnotique.",
        "Une tachycardie et une hypertension apparaissent malgré le curare.",
      ),
      qroc(
        "Quelle information verbale faut-il donner au patient potentiellement conscient ?",
        "la situation est reconnue et corrigée|nous savons et corrigeons la situation",
        src("b00174"),
        "La reconnaissance immédiate peut limiter la détresse.",
        "L’équipe administre le renfort hypnotique et poursuit l’oxygénation.",
      ),
      qroc(
        "Quel facteur masque le mouvement volontaire ?",
        "bloc neuromusculaire|curare|curarisation",
        src("b00163"),
        "La paralysie empêche le patient de signaler sa conscience.",
        "Le TOF reste nul pendant la séquence.",
      ),
      qroc(
        "Quel questionnaire utiliser au réveil ?",
        "questionnaire de Brice|Brice",
        src("b00166", "b00167"),
        "Le questionnaire explore méthodiquement les souvenirs périopératoires.",
        "Le patient rapporte un souvenir auditif fragmentaire en SSPI.",
      ),
      qroc(
        "Quel suivi proposer si le souvenir est confirmé ?",
        "suivi psychologique ou psychiatrique|soutien psychologique",
        src("b00174", "b00176"),
        "Un accompagnement précoce recherche et traite les séquelles.",
        "Le patient décrit une forte détresse liée à l’impossibilité de bouger.",
      ),
    ],
  },
  {
    label: "DP QROC 6 · Diagnostic postopératoire d’éveil",
    allowed_voies: ["externe"],
    vignette:
      "Après une chirurgie cardiaque sous anesthésie générale avec curarisation, une patiente affirme avoir entendu la scie sternale et ressenti une pression thoracique. Elle n’avait pas pu bouger, avait cru qu’elle allait mourir et n’en a parlé à l’équipe que quarante-huit heures plus tard, lors d’une visite de suivi.",
    questions: [
      qroc(
        "Quel diagnostic doit être envisagé ?",
        "éveil sous anesthésie avec remémoration|conscience sous anesthésie mémorisée",
        src("b00160", "b00166"),
        "Un souvenir explicite peropératoire avec paralysie est compatible avec un éveil.",
      ),
      qroc(
        "Quel facteur opératoire de son dossier augmente le risque ?",
        "chirurgie cardiothoracique|chirurgie cardiaque",
        src("b00163", "b00164"),
        "La chirurgie cardiothoracique fait partie des contextes à risque.",
        "Le dossier confirme une anesthésie volontairement légère sous curare.",
      ),
      qroc(
        "Quelle question de Brice explore le début de la période ?",
        "dernier souvenir avant de s’endormir|dernière chose avant l’endormissement",
        src("b00167"),
        "Elle borne le début de l’amnésie anesthésique.",
        "L’anesthésiste conduit un entretien structuré non suggestif.",
      ),
      qroc(
        "Quelle attitude faut-il éviter pendant l’entretien ?",
        "nier l’expérience|questions suggestives|nier ou suggérer",
        src("b00174"),
        "Négation et suggestion peuvent aggraver la souffrance ou fausser le récit.",
        "Le récit reste cohérent et concorde avec les horaires opératoires.",
      ),
      qroc(
        "Quel trouble psychique majeur doit être dépisté ?",
        "syndrome de stress post-traumatique|SSPT|PTSD",
        src("b00174", "b00175"),
        "Paralysie et détresse favorisent un syndrome post-traumatique.",
        "Elle rapporte cauchemars, hypervigilance et évitement.",
      ),
      qroc(
        "Quelle thérapie peut être proposée si les symptômes persistent ?",
        "thérapie cognitivo-comportementale|TCC",
        src("b00176"),
        "La TCC est une option pour les séquelles persistantes.",
        "Une consultation spécialisée confirme des symptômes durables.",
      ),
      qroc(
        "Quel élément doit figurer dans son dossier pour l’avenir ?",
        "antécédent d’éveil sous anesthésie|antécédent de conscience sous anesthésie",
        src("b00163", "b00173"),
        "L’antécédent impose une stratégie préventive renforcée.",
        "La patiente demande comment sécuriser une future intervention.",
      ),
    ],
  },
  {
    label: "DP QROC 7 · Analyse d’une erreur de seringue",
    allowed_voies: ["externe"],
    vignette:
      "En salle d’opération, une ampoule de vasopresseur est confondue avec un opioïde au cours d’une anesthésie stable. Le patient présente immédiatement une poussée hypertensive sévère avec trouble du rythme. Les deux ampoules ont un aspect proche, la seringue n’est pas étiquetée et le plateau n’est pas standardisé entre les salles.",
    questions: [
      qroc(
        "Quelle priorité précède toute analyse qualité ?",
        "stabiliser le patient|traitement immédiat du patient",
        src("b00020", "b00027"),
        "La prise en charge clinique de l’événement reste prioritaire.",
      ),
      qroc(
        "Quel type d’événement qualité cet accident représente-t-il ?",
        "événement sentinelle|événement indésirable grave",
        src("b00027", "b00028", "b00029"),
        "Une erreur potentiellement létale justifie une analyse systémique.",
        "Le patient est stabilisé sans séquelle.",
      ),
      qroc(
        "Quelle méthode faut-il déclencher ?",
        "analyse des causes racines|analyse cause racine",
        src("b00027", "b00030", "b00031"),
        "Elle reconstruit les facteurs humains et organisationnels.",
        "La direction souhaite comprendre comment l’erreur a franchi les barrières.",
      ),
      qroc(
        "Quelle barrière manque au niveau de la seringue ?",
        "étiquetage précis|étiquette de seringue",
        src("b00020", "b00027"),
        "Une seringue étiquetée reste identifiable jusqu’à l’injection.",
        "La seringue utilisée ne portait aucun nom.",
      ),
      qroc(
        "Quelle correction concerne le plateau ?",
        "standardisation du rangement|plateau standardisé",
        src("b00020", "b00022", "b00027"),
        "Une disposition constante diminue les confusions sous stress.",
        "Chaque salle possède actuellement une organisation différente.",
      ),
      qroc(
        "Quel facteur humain faut-il réduire pendant la préparation ?",
        "interruptions de tâche|interruption de tâche",
        src("b00027", "b00035", "b00036"),
        "Une préparation protégée évite la reprise à une mauvaise étape.",
        "L’opérateur avait répondu à deux appels pendant la préparation.",
      ),
      qroc(
        "Quel est le but ultime des mesures décidées ?",
        "prévenir la récidive|renforcer les barrières de sécurité",
        src("b00027", "b00033", "b00034"),
        "Le retour d’expérience doit rendre le système plus résilient.",
        "Un plan d’action est présenté au patient et aux équipes.",
      ),
    ],
  },
  {
    label: "DP QROC 8 · Maintenir la sécurité d’un parcours complexe",
    allowed_voies: ["externe"],
    vignette:
      "Un homme de 84 ans fragile doit être opéré en urgence d’une occlusion intestinale. Le patient présente une insuffisance cardiaque et rénale, une autonomie déjà réduite et un risque respiratoire élevé. L’équipe discute avec lui et sa famille son risque global, les objectifs de soins, les mesures peropératoires et l’organisation postopératoire.",
    questions: [
      qroc(
        "Quel déterminant domine son risque global : technique ou terrain-chirurgie ?",
        "terrain et chirurgie|terrain, urgence et chirurgie",
        src("b00010"),
        "Chez ce patient, fragilité, urgence et chirurgie dominent le risque.",
      ),
      qroc(
        "Quel concept organise une action continue avant et après l’opération ?",
        "médecine périopératoire|parcours de soins",
        src("b00012", "b00013"),
        "La médecine périopératoire coordonne toutes les phases.",
        "Le gériatre, le chirurgien et l’anesthésiste élaborent un plan partagé.",
      ),
      qroc(
        "Quelle stratégie ventilatoire réduit les complications pulmonaires ?",
        "ventilation protectrice|ventilation peropératoire protectrice",
        src("b00019"),
        "Une ventilation protectrice est un levier directement modifiable.",
        "L’intervention longue expose à une défaillance respiratoire.",
      ),
      qroc(
        "Quel lieu doit être anticipé pour la surveillance immédiate ?",
        "SSPI puis soins intensifs|réanimation|unité de soins intensifs",
        src("b00011", "b00012"),
        "La destination postopératoire doit correspondre au risque d’organe.",
        "Le patient nécessite un monitorage hémodynamique prolongé.",
      ),
      qroc(
        "Quel acteur doit participer aux décisions et aux objectifs ?",
        "le patient|patient et personne de confiance",
        src("b00013", "b00014"),
        "La communication favorise compréhension et adhésion.",
        "Le patient est conscient et accompagné de sa personne de confiance.",
      ),
      qroc(
        "Quel type d’indicateur faut-il éviter d’attribuer automatiquement à l’anesthésie ?",
        "toute complication postopératoire|complication d’organe",
        src("b00016", "b00018"),
        "La causalité doit intégrer inflammation, terrain et chirurgie.",
        "Une confusion postopératoire apparaît sans déficit focal.",
      ),
      qroc(
        "Quel cadre doit analyser l’ensemble du devenir ?",
        "parcours périopératoire pluridisciplinaire|prise en charge multidisciplinaire",
        src("b00012", "b00013"),
        "La continuité pluridisciplinaire reste la réponse au risque complexe.",
        "L’évolution est favorable après adaptation coordonnée des soins.",
      ),
    ],
  },
];

export function buildChapter12(extract) {
  const available = new Set((extract?.blocs || []).map((block) => block.id));
  const fiche = buildFiche();
  const flashcards = buildFlashcards();
  const series = [
    ...QCM_SERIES,
    ...DP_QCM_SERIES,
    ...QROC_SERIES,
    ...DP_QROC_SERIES,
  ];
  const allRefs = [
    ...fiche.sourceBlocks,
    ...flashcards.flatMap((item) => item.sourceBlocks),
    ...series.flatMap((serie) =>
      serie.questions.flatMap((question) => question.sourceBlocks),
    ),
  ];
  const missing = [...new Set(allRefs.filter((id) => !available.has(id)))];
  if (missing.length)
    throw new Error(
      `Chapitre 12 : blocs source inconnus : ${missing.join(", ")}`,
    );
  return { fiche, flashcards, series };
}
