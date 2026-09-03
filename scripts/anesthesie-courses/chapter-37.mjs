// Chapitre 37 — contenu éditorial rédigé exclusivement depuis extract.json.
const row = (concept, bullets, sourceBlocks, imageValue = null) => ({
  concept,
  bullets,
  sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
  ...(imageValue ? { image: imageValue } : {}),
});

const image = (path, caption, sourceCaption, cropBottomMm = 0) => ({
  path,
  caption,
  sourceCaption,
  position: "after",
  size: "large",
  layout: "full_width",
  containsText: true,
  ...(cropBottomMm ? { cropBottomMm } : {}),
});

const I = {
  afferents: image("img/img_001.png", "Fibres afférentes sensitives : calibre, myélinisation et fonction", "Les nerfs afférents sensitifs"),
  gate: image("img/img_002.png", "Le portillon spinal intègre afférences nociceptives, tactiles et contrôle descendant", "FIGURE 37.1 Lathéorie du portillon", 16),
  pathways: image("img/img_003.png", "Voies ascendantes et système inhibiteur descendant", "Voies ascendantes et descendantes inhibitrices de la douleur"),
  soup: image("img/img_004.png", "La soupe inflammatoire abaisse le seuil d’activation du nocicepteur", "FIGURE 37.3 La soupe inflammatoire périphérique"),
  axon: image("img/img_005.png", "Le réflexe d’axone étend l’inflammation neurogène autour de la lésion", "FIGURE 37.4 Leréflexe d'axone"),
  synapse: image("img/img_006.png", "Transmission glutamatergique et sensibilisation à la première synapse", "Transmission de la douleur à la jonction des neurones sensitifs"),
  ladder: image("img/img_007.png", "Paliers antalgiques et principe d’association synergique", "FIGURE 37.6 Lessites d'action des analgésiques"),
  targets: image("img/img_008.png", "Cibles synaptiques des principales classes analgésiques", "Sites d’action des analgésiques"),
};




function buildFiche() {
  const parts = [
    {
      title: "Distinguer douleur et nociception",
      sections: [
        {
          title: "Définir l’expérience douloureuse",
          rows: [
            row("Douleur", [
              "La douleur est une expérience sensitive et émotionnelle désagréable associée à une lésion réelle ou potentielle, ou décrite en ces termes.",
              { text: "Elle ne se réduit jamais au signal nociceptif.", children: ["Dimension sensorielle : localisation, intensité et qualité", "Dimension affective : caractère déplaisant", "Dimension cognitive : mémoire, évaluation et contexte"] },
            ], ["b00003", "b00039"]),
            row("Nociception", [
              "La nociception traduit un stimulus menaçant en influx nerveux puis le transmet de la périphérie vers le système nerveux central.",
              "Elle peut exister sans douleur consciente ; inversement, une douleur peut être amplifiée par l’émotion, l’attention et la mémoire.",
            ], ["b00003", "b00009", "b00039"]),
            row("Enjeu périopératoire", [
              "Une douleur postopératoire sévère non contrôlée perturbe la physiologie, accroît la morbidité et favorise la chronicisation.",
              { text: "Comprendre les voies guide une analgésie multimodale.", children: ["Agir à plusieurs étages de la transmission", "Maximiser l’analgésie", "Limiter les effets indésirables de chaque classe"] },
            ], ["b00004", "b00005"]),
          ],
        },
        {
          title: "Situer la maturation des voies",
          rows: [
            row("Calendrier fœtal", [
              { text: "Les structures se mettent en place par étapes.", children: ["Nocicepteurs périoraux dès la 7e semaine", "Extension cutanéo-muqueuse vers la 20e semaine", "Corne dorsale en développement dès la 6e semaine", "Réseau myélinisé jusqu’au tronc et au thalamus vers la 30e semaine"] },
              "Les connexions thalamo-corticales apparaissent entre les 21e et 28e semaines, rendant possible une perception consciente.",
            ], "b00007"),
            row("Conséquence", [
              "Le prématuré peut posséder les composantes périphériques, spinales, thalamiques et corticales nécessaires à la nociception et à la perception.",
              "Toute procédure potentiellement douloureuse justifie donc une prévention analgésique adaptée au terme et au contexte.",
            ], "b00007"),
            row("Perception possible", [
              "La migration des neurones corticaux vers le système thalamique rend possible l’intégration consciente entre les 21e et 28e semaines.",
              "Le terme gestationnel ne doit donc jamais servir seul à nier la capacité de ressentir un geste nocif.",
            ], "b00007"),
          ],
        },
        {
          title: "Décomposer l’intégration nociceptive",
          rows: [
            row("Quatre opérations", [
              { text: "Le message douloureux suit quatre étapes interdépendantes.", children: ["Transduction : stimulus nocif converti en potentiel d’action", "Transmission : propagation par les neurones de premier, deuxième puis troisième ordre", "Modulation : amplification ou inhibition du message", "Perception : intégration somatosensitive, limbique et cognitive"] },
            ], ["b00011", "b00012", "b00013", "b00014", "b00015", "b00016", "b00017", "b00018", "b00019"]),
            row("Trois neurones", [
              "Le premier neurone relie le nocicepteur à la corne dorsale ; le deuxième croise puis monte vers le thalamus ; le troisième projette vers les cortex.",
              "La voie n’est pas un câble passif : chaque relais trie, module et peut se plastifier.",
            ], ["b00009", "b00020", "b00027", "b00038", "b00039"]),
            row("Perception distribuée", [
              "Le thalamus distribue le troisième neurone vers des réseaux somatosensitifs, insulaires, cingulaires et préfrontaux.",
              "L’étape finale associe discrimination, affect, mémoire et évaluation du stimulus.",
            ], "b00039"),
          ],
        },
      ],
    },
    {
      title: "Conduire le signal de la périphérie au cortex",
      sections: [
        {
          title: "Transduire le stimulus périphérique",
          rows: [
            row("Nocicepteurs", [
              "Les terminaisons nerveuses libres détectent des stimuli mécaniques, thermiques ou chimiques de forte intensité dans peau, muscle, os et conjonctif.",
              "Les afférences viscérales cheminent avec les nerfs sympathiques, parasympathiques et splanchniques.",
            ], "b00020"),
            row("Fibres Aδ", [
              "Petites et faiblement myélinisées, elles conduisent plus vite que les fibres C.",
              "Elles véhiculent la première douleur : aiguë, perçante, rapide et bien localisée.",
            ], "b00020", I.afferents),
            row("Fibres C", [
              "Petites et non myélinisées, elles assurent une conduction lente.",
              "Elles portent la seconde douleur : sourde, brûlante, profonde et mal localisée.",
            ], "b00020"),
            row("Premier neurone", [
              "Son corps cellulaire siège dans le ganglion spinal ; l’axone central pénètre par la racine dorsale.",
              "Certaines fibres montent ou descendent d’un à deux métamères dans le tractus de Lissauer avant de gagner la corne dorsale.",
            ], ["b00020", "b00023", "b00024", "b00025", "b00026"]),
          ],
        },
        {
          title: "Intégrer le signal dans la corne dorsale",
          rows: [
            row("Lames de Rexed", [
              "Les afférences nociceptives terminent surtout dans les couches I, II et V de la corne dorsale.",
              { text: "Chaque couche contribue différemment.", children: ["I–II : stimuli nociceptifs et thermiques", "II : substantia gelatinosa, riche en circuits inhibiteurs et récepteurs opioïdes", "V : convergence des afférences somatiques et viscérales"] },
            ], ["b00020", "b00027"]),
            row("Douleur référée", [
              "La convergence viscéro-somatique sur les neurones de couche V explique qu’une atteinte viscérale soit perçue dans un territoire cutané.",
              "La localisation ressentie n’identifie donc pas toujours le tissu lésé.",
            ], "b00027"),
            row("Portillon", [
              { text: "Le passage vers le deuxième neurone dépend de la balance excitation–inhibition.", children: ["Fibres Aδ et C : ouverture du portillon", "Fibres tactiles Aβ : fermeture", "Voies descendantes : inhibition modulable par le contexte"] },
              "Frotter une zone douloureuse ou utiliser un TENS recrute les afférences tactiles et réduit le message nociceptif.",
            ], ["b00027", "b00028", "b00029"], I.gate),
            row("Deuxième neurone", [
              { text: "Trois profils fonctionnels coexistent.", children: ["Neurones nociceptifs spécifiques", "Neurones à large spectre, codant l’intensité", "Neurones non nociceptifs participant à l’inhibition"] },
            ], ["b00032", "b00033", "b00034", "b00035", "b00036", "b00037"]),
          ],
        },
        {
          title: "Monter vers les centres supérieurs",
          rows: [
            row("Voie latérale", [
              "La voie néospinothalamique gagne le noyau ventral postérolatéral puis le cortex somatosensitif primaire.",
              "Elle porte surtout l’analyse sensitivo-discriminative : siège, intensité et qualité.",
            ], "b00038"),
            row("Voie médiale", [
              "La voie paléospinothalamique projette vers le thalamus médial, le cortex somatosensitif secondaire, l’insula et le cortex cingulaire.",
              "Elle contribue aux dimensions autonome et affective de la douleur.",
            ], "b00038"),
            row("Voie spinoréticulaire", [
              "Elle traverse la formation réticulée vers le thalamus et l’hypothalamus et produit une perception diffuse et déplaisante.",
              "À la différence de la voie spinothalamique, son organisation somatotopique est faible.",
            ], "b00038"),
            row("Matrice cérébrale", [
              { text: "La perception résulte d’un réseau distribué.", children: ["Cortex somatosensitifs : discrimination", "Insula et cingulaire antérieur : affect", "Préfrontal et pariétal : mémoire, attention et évaluation"] },
              "Cette intégration explique la variabilité interindividuelle à stimulus identique.",
            ], "b00039", I.pathways),
          ],
        },
      ],
    },
    {
      title: "Moduler le message et comprendre la plasticité",
      sections: [
        {
          title: "Activer les voies inhibitrices descendantes",
          rows: [
            row("Origine", [
              "La substance grise périaqueducale reçoit cortex, thalamus, hypothalamus et collatérales spinothalamiques.",
              "Elle active le noyau raphé magnus, dont les axones descendent vers les couches II et III de la corne dorsale.",
            ], ["b00040", "b00041", "b00042"]),
            row("Trois freins", [
              { text: "Le contrôle descendant réduit la transmission de trois manières.", children: ["Inhibition directe des neurones de la corne dorsale", "Inhibition des axones excitateurs", "Activation d’interneurones inhibiteurs"] },
              "La modulation descendante relie émotions, attention et expérience antérieure au signal spinal.",
            ], ["b00042", "b00043", "b00044"]),
            row("Portée fonctionnelle", [
              "La stimulation de la substance grise périaqueducale produit une analgésie profonde, illustrant la puissance du contrôle descendant.",
              "Ce circuit module sans cesse le passage spinal plutôt que d’intervenir seulement après la perception.",
            ], ["b00040", "b00042"]),
          ],
        },
        {
          title: "Installer une sensibilisation périphérique",
          rows: [
            row("Soupe inflammatoire", [
              "Une lésion libère K+, H+, histamine, bradykinine et autres médiateurs issus des cellules lésées ou inflammatoires.",
              "Ces médiateurs activent et sensibilisent le nocicepteur, abaissant son seuil de dépolarisation.",
            ], ["b00048", "b00051", "b00053"], I.soup),
            row("Canaux sodiques", [
              "L’inflammation augmente les canaux sodiques résistants à la tétrodotoxine.",
              "Le seuil baisse et les courants dépolarisants augmentent : le nocicepteur répond plus facilement et plus fortement.",
            ], ["b00053", "b00056"]),
            row("COX", [
              "COX-1 est constitutive dans tube digestif, rein et plaquettes ; COX-2 est aussi induite par l’inflammation.",
              "La voie de l’acide arachidonique produit prostaglandines, prostacycline et thromboxane qui sensibilisent le nocicepteur.",
            ], ["b00058", "b00061"]),
            row("Boucle neuro-immune", [
              { text: "Nocicepteurs et immunité s’amplifient mutuellement.", children: ["Nocicepteurs peptidergiques : récepteur NGF, substance P et CGRP", "Cytokines IL-1, IL-6, IL-8 et TNF-α", "NGF/Trk et BDNF : relais vers la sensibilisation centrale"] },
            ], "b00058"),
            row("Réflexe d’axone", [
              "La substance P et le CGRP libérés par les branches périphériques étendent rougeur, chaleur, douleur et tuméfaction aux tissus voisins.",
              "Cette inflammation neurogène explique l’hyperalgésie secondaire autour de la zone lésée.",
            ], ["b00051", "b00052", "b00058", "b00059"], I.axon),
          ],
        },
        {
          title: "Installer une sensibilisation centrale",
          rows: [
            row("AMPA", [
              "Le glutamate libéré par le premier neurone active rapidement les récepteurs AMPA postsynaptiques.",
              "La dépolarisation du deuxième neurone transmet le message vers les centres supraspinaux.",
            ], "b00063"),
            row("NMDA", [
              { text: "Une stimulation forte et répétée lève le bloc magnésium du canal NMDA.", children: ["Phosphorylation du récepteur", "Entrée de calcium postsynaptique", "Hyperexcitabilité et amplification durable"] },
              "Ce mécanisme participe au risque de chronicisation d’une douleur aiguë intense.",
            ], "b00063"),
            row("Présynapse", [
              "L’entrée de calcium par les canaux voltage-dépendants déclenche l’exocytose de glutamate.",
              "Réduire ce calcium présynaptique diminue la quantité de neurotransmetteur disponible.",
            ], "b00063"),
            row("Glie", [
              "Microglie et astrocytes interagissent avec les neurones sensoriels et contribuent au maintien d’une hyperexcitabilité centrale.",
              "La chronicisation associe donc plasticité neuronale et réponse neuro-immune.",
            ], "b00063", I.synapse),
          ],
        },
      ],
    },
    {
      title: "Relier chaque analgésique à sa cible",
      sections: [
        {
          title: "Construire une stratégie multimodale",
          rows: [
            row("Paliers", [
              { text: "Les paliers classent les antalgiques selon la puissance requise.", children: ["Palier 1 : non opioïdes", "Palier 2 : opioïdes faibles", "Palier 3 : opioïdes forts"] },
              "Associer des mécanismes complémentaires permet une synergie et réduit l’exposition à une classe unique.",
            ], ["b00068", "b00069", "b00071"], I.ladder),
            row("Cartographie", [
              "L’analgésie peut agir sur l’inflammation périphérique, la conduction axonale, la libération présynaptique ou les récepteurs postsynaptiques.",
              "Le choix devient rationnel quand la cible correspond au mécanisme dominant et au terrain du patient.",
            ], ["b00067", "b00070", "b00073"], I.targets),
            row("Synergie", [
              "Une association de paliers ou de classes n’est utile que si elle combine des mécanismes distincts et compatibles avec le terrain.",
              "L’objectif est de réduire la transmission globale tout en évitant l’escalade d’un agent unique.",
            ], ["b00069", "b00070", "b00071"]),
          ],
        },
        {
          title: "Freiner inflammation et conduction",
          rows: [
            row("AINS", [
              "Aspirine et AINS inhibent les cyclooxygénases et diminuent les prostaglandines périphériques.",
              { text: "La non-sélectivité explique les principaux effets indésirables.", children: ["Irritation gastrique", "Atteinte rénale", "Inhibition plaquettaire"] },
            ], "b00076"),
            row("Paracétamol", [
              "Son action est surtout centrale et son mécanisme reste pluriel : systèmes sérotoninergique, prostaglandines, cannabinoïdes et vanilloïdes.",
              "Il complète l’analgésie sans reproduire entièrement le profil périphérique des AINS.",
            ], "b00076"),
            row("Anesthésiques locaux", [
              "Ils pénètrent dans la fibre puis bloquent de l’intérieur les canaux sodiques, interrompant réversiblement le potentiel d’action.",
              { text: "Ils peuvent être administrés à plusieurs niveaux.", children: ["Infiltration ou instillation", "Bloc périnerveux", "Voie neuraxiale"] },
            ], "b00078"),
          ],
        },
        {
          title: "Moduler la synapse spinale",
          rows: [
            row("Opioïdes", [
              "Les récepteurs μ couplés à Gi inhibent les canaux calciques présynaptiques et réduisent la libération de glutamate.",
              "En postsynaptique, ils augmentent la sortie de K+ et hyperpolarisent le deuxième neurone.",
            ], "b00080"),
            row("Anti-NMDA", [
              "Kétamine, protoxyde d’azote et dextrométhorphane réduisent l’activation NMDA et l’entrée calcique postsynaptique.",
              "Ils ciblent l’hyperexcitabilité et la sensibilisation centrale.",
            ], ["b00081", "b00082"]),
            row("Gabapentinoïdes", [
              "Gabapentine et prégabaline inhibent l’entrée de calcium présynaptique.",
              "Moins de vésicules fusionnent avec la membrane : la libération de glutamate et l’activation AMPA diminuent.",
            ], ["b00083", "b00084", "b00085"]),
            row("Agonistes α2", [
              "Clonidine et dexmédétomidine activent des récepteurs α2 couplés aux protéines G, très représentés dans la corne dorsale.",
              "La modulation des canaux Ca2+ et K+ hyperpolarise les neurones et freine la convergence nociceptive.",
            ], ["b00086", "b00087"]),
          ],
        },
      ],
    },
    {
      title: "Raisonner de la clinique au mécanisme",
      sections: [
        {
          title: "Prévenir l’amplification périopératoire",
          rows: [
            row("Avant l’incision", [
              "Identifier le terrain, l’intensité attendue et les voies accessibles permet de couvrir transduction, conduction et modulation avant l’afflux nociceptif.",
              "Une stratégie anticipée limite la répétition des décharges susceptibles d’activer NMDA.",
            ], ["b00004", "b00063", "b00067"]),
            row("Après l’incision", [
              "Réévaluer douleur, fonction et effets indésirables distingue analgésie insuffisante, neuropathie, inflammation et sensibilisation.",
              "L’escalade aveugle d’une seule classe ignore les relais qui entretiennent le signal.",
            ], ["b00004", "b00067", "b00100"]),
            row("Chronicisation", [
              { text: "Une douleur aiguë sévère et prolongée expose à la plasticité.", children: ["Sensibilisation périphérique : seuil nociceptif abaissé", "Sensibilisation centrale : synapse hyperexcitable", "Composante affective et cognitive : perception amplifiée"] },
            ], ["b00004", "b00009", "b00039", "b00056", "b00063"]),
          ],
        },
        {
          title: "Éviter les raccourcis",
          rows: [
            row("Signal ≠ expérience", [
              "Un potentiel d’action nociceptif n’est pas une mesure directe de la douleur vécue.",
              "La communication du patient, le contexte émotionnel et le retentissement fonctionnel restent indispensables.",
            ], ["b00003", "b00039"]),
            row("Cible ≠ prescription", [
              "Connaître une cible moléculaire n’abolit ni contre-indications ni effets indésirables liés au terrain.",
              "L’analgésie multimodale est une combinaison raisonnée, pas une accumulation automatique.",
            ], ["b00004", "b00076", "b00078", "b00080"]),
            row("Douleur référée", [
              "Une douleur projetée résulte d’une convergence spinale, non d’une migration de la lésion.",
              "Elle doit conduire à rechercher l’origine viscérale cohérente avec le territoire somatique perçu.",
            ], "b00027"),
          ],
        },
      ],
    },
  ];

  const sourceBlocks = [...new Set(parts.flatMap((p) => p.sections.flatMap((s) => s.rows.flatMap((r) => r.sourceBlocks))))];
  return {
    matiere: "Anesthésie-Réanimation",
    title: "Les bases neurophysiologiques de la douleur",
    year: "2025-2026",
    coverSubtitle: "Du nocicepteur à la perception : comprendre les relais pour raisonner l’analgésie multimodale",
    sourceBlocks,
    parts,
    imageOmissions: [],
    imageException: { reason: "Les huit visuels source sont complémentaires et nécessaires à la compréhension des fibres, voies, sensibilisations et cibles thérapeutiques." },
    synthesis: {
      compactLayout: true,
      chiffres: {
        headers: ["Repère", "Valeur"],
        rows: [
          ["Début des nocicepteurs", "7e semaine, région périorale"],
          ["Extension cutanéo-muqueuse", "20e semaine"],
          ["Connexions thalamo-corticales", "21e à 28e semaine"],
          ["Réseau myélinisé jusqu’au thalamus", "Vers la 30e semaine"],
          ["Fibres Aδ", "2–5 μm ; 5–15 m/s"],
          ["Fibres C", "< 2 μm ; 0,5–2 m/s"],
          ["Lames nociceptives majeures", "I, II et V"],
          ["Relais du message", "3 neurones ; 4 étapes"],
        ],
      },
      tables: [
        { title: "Relais et fonction", headers: ["Niveau", "Fonction dominante"], rows: [
          ["Périphérie", "Transduction et sensibilisation inflammatoire"],
          ["Corne dorsale", "Portillon, convergence et plasticité"],
          ["Thalamus", "Relais vers les réseaux corticaux"],
          ["Cortex", "Discrimination, affect et cognition"],
          ["Tronc cérébral", "Contrôle inhibiteur descendant"],
        ] },
        { title: "Classes et cibles", headers: ["Classe", "Cible principale"], rows: [
          ["AINS", "COX et prostaglandines périphériques"],
          ["Anesthésiques locaux", "Canaux Na+ axonaux"],
          ["Opioïdes", "Ca2+ présynaptique et K+ postsynaptique"],
          ["Anti-NMDA", "Entrée Ca2+ postsynaptique"],
          ["Gabapentinoïdes", "Canaux Ca2+ présynaptiques"],
          ["Agonistes α2", "Hyperpolarisation spinale"],
        ] },
      ],
      keyPoints: [
        "La douleur associe une expérience sensitive, affective et cognitive ; elle dépasse la nociception.",
        "Transduction, transmission, modulation et perception structurent le raisonnement.",
        "Les fibres Aδ portent la douleur rapide ; les fibres C la douleur lente.",
        "La corne dorsale est le carrefour majeur du portillon et de la plasticité.",
        "La voie latérale discrimine ; les voies médiale et spinoréticulaire portent affect et diffusion.",
        "La soupe inflammatoire sensibilise la périphérie ; NMDA entretient la sensibilisation centrale.",
        "Les voies descendantes freinent la transmission dans les lames II et III.",
        "L’analgésie multimodale associe des cibles complémentaires avec une surveillance adaptée.",
      ],
      eclair: [
        "Douleur : expérience sensitive et émotionnelle ; nociception : codage et transmission du stimulus.",
        "Quatre étapes : transduction, transmission, modulation, perception.",
        "Trois neurones : ganglion spinal, corne dorsale, thalamus puis cortex.",
        "Aδ : douleur rapide et localisée ; C : douleur lente, brûlante et diffuse.",
        "Lames I–II : nociception ; lame V : convergence viscéro-somatique et douleur référée.",
        "Le portillon se ferme par Aβ et les voies descendantes.",
        "Substance grise périaqueducale puis raphé magnus : frein descendant.",
        "Soupe inflammatoire, SP, CGRP et COX-2 : sensibilisation périphérique.",
        "AMPA transmet vite ; NMDA et Ca2+ installent hyperexcitabilité et chronicisation.",
        "AINS, locaux, opioïdes, anti-NMDA, gabapentinoïdes et α2 agissent à des relais distincts.",
      ],
    },
  };
}

const fc = (recto, verso, sourceBlocks) => ({ recto, verso, sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks] });

function buildFlashcards() {
  return [
    fc("Comment définir la douleur ?", "Une expérience sensitive et émotionnelle désagréable liée à une lésion réelle ou potentielle.", "b00003"),
    fc("Comment définir la nociception ?", "La transduction et la transmission neurologiques d’un stimulus nocif vers le système central.", "b00003"),
    fc("Pourquoi douleur et nociception ne sont-elles pas synonymes ?", "La douleur ajoute des dimensions affective, cognitive et contextuelle au signal nociceptif.", ["b00003", "b00039"]),
    fc("Quel risque suit une douleur postopératoire sévère ?", "Une morbidité accrue et un risque de chronicisation douloureuse.", "b00004"),
    fc("Quel est l’objectif d’une analgésie multimodale ?", "Agir sur plusieurs relais pour augmenter l’analgésie et limiter les effets indésirables.", ["b00004", "b00005"]),
    fc("Quand apparaissent les nocicepteurs périoraux ?", "Dès la 7e semaine de gestation.", "b00007"),
    fc("Quand les nocicepteurs couvrent-ils peau et muqueuses ?", "Vers la 20e semaine de gestation.", "b00007"),
    fc("Quand débute le développement de la corne dorsale ?", "Dès la 6e semaine de gestation.", "b00007"),
    fc("Quand le réseau sensitif atteint-il tronc et thalamus ?", "Vers la 30e semaine, sous forme d’un réseau myélinisé.", "b00007"),
    fc("Quand se forment les connexions thalamo-corticales ?", "Entre les 21e et 28e semaines de gestation.", "b00007"),
    fc("Quelles sont les quatre étapes de la douleur ?", "Transduction, transmission, modulation et perception.", ["b00012", "b00013", "b00014", "b00016", "b00018"]),
    fc("Qu’est-ce que la transduction ?", "La conversion d’un stimulus nociceptif en potentiel d’action.", "b00013"),
    fc("Qu’est-ce que la transmission ?", "L’acheminement du potentiel d’action de la périphérie vers le système nerveux central.", ["b00014", "b00015"]),
    fc("Qu’est-ce que la modulation ?", "L’amplification ou l’inhibition de la transmission nociceptive afférente.", ["b00016", "b00017"]),
    fc("Qu’est-ce que la perception ?", "L’intégration somatosensitive, limbique et cognitive de l’information nociceptive.", ["b00018", "b00019", "b00039"]),
    fc("Combien de neurones comporte la voie ascendante principale ?", "Trois neurones successifs, de la périphérie au cortex via moelle et thalamus.", "b00009"),
    fc("Quels stimuli activent les nocicepteurs ?", "Des stimuli mécaniques, thermiques ou chimiques de forte intensité.", "b00020"),
    fc("Quelle est la structure d’un nocicepteur périphérique ?", "Une terminaison nerveuse libre, sans organe récepteur encapsulé.", "b00020"),
    fc("Où trouve-t-on les nocicepteurs somatiques ?", "Dans la peau, les muscles, les os et les tissus conjonctifs.", "b00020"),
    fc("Par quelles voies cheminent les afférences viscérales ?", "Par les nerfs sympathiques, parasympathiques et splanchniques.", "b00020"),
    fc("Quelle fibre transmet la première douleur ?", "La fibre Aδ, peu myélinisée et relativement rapide.", "b00020"),
    fc("Comment est la première douleur ?", "Aiguë, perçante, rapide et bien localisée.", "b00020"),
    fc("Quelle fibre transmet la seconde douleur ?", "La fibre C, petite, amyélinique et lente.", "b00020"),
    fc("Comment est la seconde douleur ?", "Sourde, brûlante, profonde et mal localisée.", "b00020"),
    fc("Quel est le diamètre des fibres Aδ ?", "Environ 2 à 5 μm.", ["b00020", "b00021"]),
    fc("Quelle est la vitesse des fibres Aδ ?", "Environ 5 à 15 m/s.", ["b00020", "b00021"]),
    fc("Quel est le diamètre des fibres C ?", "Inférieur à 2 μm.", ["b00020", "b00021"]),
    fc("Quelle est la vitesse des fibres C ?", "Environ 0,5 à 2 m/s.", ["b00020", "b00021"]),
    fc("Où siège le corps du premier neurone nociceptif ?", "Dans le ganglion spinal ou rachidien.", "b00020"),
    fc("Par quelle racine entre le premier neurone ?", "Par la racine dorsale du nerf spinal.", "b00020"),
    fc("Que permet le tractus de Lissauer ?", "Une ascension ou descente de un à deux métamères avant l’entrée dans la corne dorsale.", ["b00023", "b00024", "b00025"]),
    fc("Quelles lames reçoivent surtout les afférences nociceptives ?", "Les lames I, II et V de la corne dorsale.", ["b00020", "b00027"]),
    fc("Quel autre nom porte la lame II ?", "La substantia gelatinosa.", "b00027"),
    fc("Pourquoi la lame II est-elle un carrefour inhibiteur ?", "Elle concentre interneurones, récepteurs opioïdes et contrôle descendant.", "b00027"),
    fc("Quelle lame explique la douleur référée ?", "La lame V, où convergent afférences viscérales et somatiques.", "b00027"),
    fc("Qu’est-ce qu’une douleur référée ?", "Une douleur perçue dans un territoire somatique partageant un relais spinal avec un viscère.", "b00027"),
    fc("Qu’énonce la théorie du portillon ?", "Le passage nociceptif dépend de la balance entre afférences excitatrices et inhibitrices.", ["b00027", "b00029"]),
    fc("Quelles fibres ouvrent le portillon ?", "Les fibres nociceptives Aδ et C.", ["b00028", "b00029"]),
    fc("Quelles fibres ferment le portillon ?", "Les fibres tactiles Aβ et les voies descendantes inhibitrices.", "b00029"),
    fc("Pourquoi frotter une zone douloureuse soulage-t-il ?", "La stimulation Aβ renforce l’inhibition spinale du message nociceptif.", "b00029"),
    fc("Quel est le principe antalgique du TENS ?", "Recruter les afférences tactiles pour fermer le portillon spinal.", "b00029"),
    fc("Quels neurones répondent seulement aux stimuli nocifs ?", "Les neurones nociceptifs spécifiques.", ["b00032", "b00033"]),
    fc("Que sont les neurones wide dynamic range ?", "Des neurones à large spectre dont la fréquence code l’intensité du stimulus.", ["b00034", "b00035"]),
    fc("Quel est le rôle des neurones non nociceptifs ?", "Participer à l’inhibition de la nociception sans transmettre directement la douleur.", ["b00036", "b00037"]),
    fc("Où croisent les voies ascendantes douloureuses ?", "Dans la moelle, avant de monter dans le cordon antérolatéral controlatéral.", ["b00027", "b00038"]),
    fc("Où projette la voie néospinothalamique ?", "Vers le VPL thalamique puis le cortex somatosensitif primaire.", "b00038"),
    fc("Quelle dimension porte la voie latérale ?", "La dimension sensitivo-discriminative de la douleur.", "b00038"),
    fc("Où projette la voie paléospinothalamique ?", "Vers thalamus médial, cortex S2, insula et cortex cingulaire.", "b00038"),
    fc("Quelle dimension porte la voie médiale ?", "Les dimensions autonome et affective de la douleur.", "b00038"),
    fc("Quel est le rôle de la voie spinoréticulaire ?", "Produire une perception diffuse et déplaisante via formation réticulée et hypothalamus.", "b00038"),
    fc("La voie spinoréticulaire est-elle somatotopique ?", "Peu, contrairement à la voie spinothalamique.", "b00038"),
    fc("Quel relais précède le troisième neurone ?", "Le thalamus, dans ses noyaux médial et latéral.", "b00039"),
    fc("Quels cortex discriminent la douleur ?", "Les cortex somatosensitifs primaire et secondaire.", "b00039"),
    fc("Quels cortex portent l’affect douloureux ?", "L’insula et le cortex cingulaire antérieur.", "b00039"),
    fc("Quel cortex participe à l’évaluation cognitive ?", "Le cortex préfrontal, avec certaines régions pariétales.", "b00039"),
    fc("Pourquoi la douleur varie-t-elle entre individus ?", "Parce que discrimination, émotion, mémoire et contexte sont intégrés par un réseau distribué.", "b00039"),
    fc("Quelles régions fondent le contrôle descendant ?", "La substance grise périaqueducale et le noyau raphé magnus.", ["b00040", "b00041"]),
    fc("Où se situe la substance grise périaqueducale ?", "Dans le mésencéphale.", "b00042"),
    fc("Quelles entrées reçoit la substance grise périaqueducale ?", "Cortex, thalamus, hypothalamus et collatérales spinothalamiques.", "b00042"),
    fc("Où projette le noyau raphé magnus ?", "Dans les couches II et III de la corne dorsale.", "b00042"),
    fc("Quels sont les trois freins descendants ?", "Inhibition neuronale directe, frein des axones excitateurs et activation d’interneurones inhibiteurs.", ["b00042", "b00043", "b00044"]),
    fc("Qu’est-ce que la soupe inflammatoire ?", "L’ensemble des ions et médiateurs libérés autour d’une lésion tissulaire.", ["b00048", "b00051"]),
    fc("Quels ions participent à la soupe inflammatoire ?", "Les ions K+ et H+ libérés dans le tissu lésé.", ["b00048", "b00051"]),
    fc("Quels médiateurs activent le nocicepteur lésé ?", "Notamment histamine, bradykinine, prostaglandines, substance P et CGRP.", ["b00048", "b00051", "b00058", "b00061"]),
    fc("Qu’est-ce que la sensibilisation périphérique ?", "L’abaissement du seuil et l’augmentation de la réponse du nocicepteur inflammatoire.", ["b00053", "b00056"]),
    fc("Que deviennent les canaux TTX résistants en inflammation ?", "Leur nombre augmente, renforçant les courants sodiques dépolarisants.", ["b00053", "b00056"]),
    fc("Qu’est-ce que l’inflammation neurogène ?", "L’extension inflammatoire autour de la lésion par un réflexe d’axone.", ["b00051", "b00052"]),
    fc("Quels peptides entretiennent le réflexe d’axone ?", "La substance P et le CGRP.", ["b00058", "b00059"]),
    fc("Que caractérise un nocicepteur peptidergique ?", "Un récepteur au NGF et une production de substance P et de CGRP.", "b00058"),
    fc("Que caractérise un nocicepteur non peptidergique ?", "Un récepteur au GDNF sans production de substance P ni de CGRP.", "b00058"),
    fc("Quel facteur neurotrophique participe à la sensibilisation centrale ?", "Le BDNF, stimulé notamment par les voies Trk.", "b00058"),
    fc("Quelles cytokines pro-inflammatoires sont citées ?", "IL-1, IL-6, IL-8 et TNF-α.", "b00058"),
    fc("Quelle COX est induite par l’inflammation ?", "La COX-2, également présente de façon constitutive.", "b00058"),
    fc("Où la COX-1 est-elle constitutive ?", "Dans le tube digestif, les reins et à la surface plaquettaire.", "b00058"),
    fc("Quel substrat utilisent les cyclooxygénases ?", "L’acide arachidonique des cellules lésées.", "b00061"),
    fc("Quel récepteur transmet rapidement le glutamate ?", "Le récepteur AMPA postsynaptique.", "b00063"),
    fc("Quel récepteur porte la sensibilisation centrale ?", "Le récepteur NMDA postsynaptique.", "b00063"),
    fc("Pourquoi NMDA est-il initialement silencieux ?", "Son canal est bloqué par un ion magnésium.", "b00063"),
    fc("Que lève le bloc magnésium du NMDA ?", "Une dépolarisation répétée avec phosphorylation du récepteur.", "b00063"),
    fc("Quel ion entre après activation NMDA ?", "Le calcium, qui accroît l’excitabilité du deuxième neurone.", "b00063"),
    fc("Quel lien unit NMDA et chronicisation ?", "L’entrée de Ca2+ renforce durablement la transmission et la sensibilisation centrale.", "b00063"),
    fc("Quel est le rôle du Ca2+ présynaptique ?", "Déclencher la fusion des vésicules et la libération de glutamate.", "b00063"),
    fc("Quel rôle jouent microglie et astrocytes ?", "Ils contribuent à la transmission et au maintien de l’hyperexcitabilité centrale.", "b00063"),
    fc("Quels sont les trois paliers antalgiques ?", "Non opioïdes, opioïdes faibles puis opioïdes forts.", ["b00069", "b00071"]),
    fc("Quel principe associe les paliers entre eux ?", "Une association synergique de mécanismes complémentaires.", "b00071"),
    fc("Quelle enzyme ciblent aspirine et AINS ?", "La cyclooxygénase ou prostaglandine synthase.", "b00076"),
    fc("Quel effet analgésique ont les AINS ?", "Ils réduisent l’inflammation et la sensibilisation périphériques par baisse des prostaglandines.", "b00076"),
    fc("Quels effets indésirables dérivent de COX-1 ?", "Irritation gastrique, atteinte rénale et inhibition plaquettaire.", "b00076"),
    fc("Où agit surtout le paracétamol ?", "Au niveau central, par plusieurs systèmes encore incomplètement élucidés.", "b00076"),
    fc("Quels systèmes participent à l’effet du paracétamol ?", "Sérotoninergique, prostaglandines, cannabinoïde et vanilloïde.", "b00076"),
    fc("Quelle cible ont les anesthésiques locaux ?", "Les canaux sodiques axonaux, bloqués de l’intérieur de la fibre.", "b00078"),
    fc("L’effet d’un anesthésique local est-il réversible ?", "Oui, il interrompt réversiblement la progression du potentiel d’action.", "b00078"),
    fc("Quelles voies d’administration locales sont citées ?", "Infiltration, instillation, bloc périnerveux et voie neuraxiale.", "b00078"),
    fc("Quels paramètres différencient les anesthésiques locaux ?", "Liposolubilité, pKa et liaison aux protéines.", "b00078"),
    fc("Quel est le principal récepteur opioïde cité ?", "Le récepteur μ, couplé aux protéines G inhibitrices.", "b00080"),
    fc("Quel effet présynaptique ont les opioïdes ?", "Ils inhibent les canaux Ca2+ et réduisent la libération de glutamate.", "b00080"),
    fc("Quel effet postsynaptique ont les opioïdes ?", "Ils augmentent la sortie de K+ et hyperpolarisent le deuxième neurone.", "b00080"),
    fc("Quels agents anti-NMDA sont cités ?", "Kétamine, protoxyde d’azote et dextrométhorphane.", ["b00081", "b00082"]),
    fc("Quel effet ont les anti-NMDA ?", "Ils réduisent l’entrée de Ca2+ et l’hyperexcitabilité postsynaptique.", "b00082"),
    fc("Quels médicaments sont des gabapentinoïdes ?", "La gabapentine et la prégabaline.", "b00084"),
    fc("Quelle cible ont les gabapentinoïdes ?", "Les canaux calciques présynaptiques du premier neurone sensitif.", "b00084"),
    fc("Quel effet final ont les gabapentinoïdes ?", "Moins de libération de glutamate et donc moins d’activation AMPA.", ["b00084", "b00085"]),
    fc("Quels agonistes α2 sont cités ?", "La clonidine et la dexmédétomidine.", "b00087"),
    fc("Où les récepteurs α2 sont-ils particulièrement représentés ?", "Dans la corne dorsale de la moelle épinière.", "b00087"),
    fc("Comment les agonistes α2 freinent-ils la douleur ?", "Ils modulent Ca2+ et K+, hyperpolarisent les neurones et bloquent la convergence nociceptive.", "b00087"),
    fc("Quel mécanisme explique l’hyperalgésie secondaire ?", "La sensibilisation périphérique et l’inflammation neurogène autour de la lésion.", ["b00051", "b00052", "b00056"]),
    fc("Quel mécanisme explique une réponse durable après le stimulus ?", "La sensibilisation centrale avec activation NMDA et plasticité synaptique.", "b00063"),
    fc("Pourquoi traiter tôt une douleur aiguë intense ?", "Pour limiter les décharges répétées et l’installation d’une sensibilisation centrale.", ["b00004", "b00063"]),
    fc("Pourquoi associer anesthésie régionale et antalgiques systémiques ?", "Ils interrompent des relais distincts de conduction, inflammation et modulation centrale.", ["b00067", "b00078"]),
    fc("Quel relais est bloqué par un bloc nerveux ?", "La conduction axonale périphérique par inhibition des canaux sodiques.", "b00078"),
    fc("Quel relais est ciblé par un AINS ?", "La transduction et la sensibilisation inflammatoires périphériques.", "b00076"),
    fc("Quel relais est ciblé par la kétamine ?", "La sensibilisation centrale dépendante des récepteurs NMDA.", "b00082"),
    fc("Quel relais est ciblé par la prégabaline ?", "La libération présynaptique de glutamate dépendante du calcium.", "b00084"),
    fc("Quel relais est ciblé par un opioïde spinal ?", "La synapse nociceptive par inhibition pré- et postsynaptique.", "b00080"),
    fc("Pourquoi une douleur viscérale est-elle mal localisée ?", "Elle emprunte des afférences diffuses et converge avec des territoires somatiques.", ["b00020", "b00027", "b00038"]),
    fc("Quelle voie contribue au caractère déplaisant diffus ?", "La voie spinoréticulaire.", "b00038"),
    fc("Quelle structure relie contexte psychologique et inhibition ?", "Le système descendant issu du cortex, du thalamus et du tronc cérébral.", ["b00009", "b00040"]),
    fc("La corne dorsale est-elle un simple relais ?", "Non. Elle intègre afférences, interneurones, glie et contrôle descendant.", "b00027"),
    fc("Que code la fréquence d’un neurone à large spectre ?", "L’intensité du stimulus douloureux.", "b00035"),
    fc("Pourquoi une même lésion peut-elle être vécue différemment ?", "La perception dépend de réseaux sensoriels, affectifs, cognitifs et descendants.", ["b00039", "b00040"]),
    fc("Quelle notion unit douleur aiguë et douleur chronique ?", "La plasticité neuronale induite par une transmission nociceptive persistante.", "b00009"),
    fc("Quel est le dernier niveau de la transmission douloureuse ?", "L’intégration corticale des informations sensitives, cognitives et émotionnelles.", "b00039"),
    fc("Quelle règle résume la pharmacologie antalgique ?", "Choisir plusieurs cibles cohérentes avec le mécanisme sans addition automatique de traitements.", ["b00067", "b00070"]),
    fc("Quel est le but final de comprendre la neurophysiologie ?", "Mieux sélectionner les analgésiques selon leur site d’action et prévenir la chronicisation.", ["b00004", "b00067", "b00100"]),
  ];
}

const it = (enonce, is_correct, justification) => ({ enonce, is_correct, justification });
const QCM_ORDERS = [
  [0, 1, 2, 3, 4], [1, 3, 0, 4, 2], [2, 0, 4, 1, 3], [3, 4, 1, 2, 0], [4, 2, 3, 0, 1],
  [0, 2, 4, 3, 1], [1, 4, 2, 0, 3], [2, 3, 1, 4, 0], [3, 0, 4, 1, 2], [4, 1, 0, 2, 3],
  [0, 3, 1, 4, 2], [2, 4, 0, 3, 1], [4, 0, 3, 1, 2], [1, 2, 3, 4, 0], [3, 1, 4, 0, 2],
];
let qcmIndex = 0;
const qcm = (enonce, items, sourceBlocks, correction_generale, newInformation = null) => {
  const order = QCM_ORDERS[qcmIndex % QCM_ORDERS.length];
  qcmIndex += 1;
  return {
    format: "qcm",
    enonce: newInformation ? `${newInformation} ${enonce}` : enonce,
    sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
    correction_generale,
    items: order.map((sourceIndex, index) => ({ ...items[sourceIndex], lettre: "ABCDE"[index] })),
    ...(newInformation ? { newInformation } : {}),
  };
};
const qroc = (enonce, reponse_attendue, sourceBlocks, correction_generale, newInformation = null) => ({
  format: "qroc",
  enonce: newInformation ? `${newInformation} ${enonce}` : enonce,
  reponse_attendue,
  sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
  correction_generale,
  ...(newInformation ? { newInformation } : {}),
});

const ISOLATED_QCM = [
  { title: "Définitions et développement", questions: [
    qcm("Quelles propositions caractérisent correctement la douleur ?", [
      it("Sa dimension sensitive est traitée par le cortex cingulaire antérieur.", false, "L’aspect sensitif et discriminatif relève des cortex somatosensitifs primaire et secondaire, le cingulaire antérieur portant la dimension affective."),
      it("Elle comporte une dimension émotionnelle.", true, "Le caractère désagréable et affectif est indissociable de l’expérience."),
      it("Elle équivaut strictement à la nociception.", false, "La nociception ne résume pas l’expérience consciente, affective et cognitive."),
      it("Sa définition exige une lésion tissulaire objectivée par l’imagerie.", false, "La définition retient une lésion réelle ou potentielle, ou une expérience décrite en ces termes, sans preuve lésionnelle obligatoire."),
      it("Elle est identique entre deux patients exposés au même stimulus.", false, "Le contexte et l’intégration corticale créent une variabilité interindividuelle."),
    ], ["b00003", "b00039"], "La douleur est une expérience multidimensionnelle ; le signal nociceptif n’en est qu’un déterminant."),
    qcm("Comment la nociception se caractérise-t-elle du stimulus au système central ?", [
      it("Elle débute par la transduction du stimulus.", true, "Le nocicepteur convertit l’énergie nocive en potentiel d’action."),
      it("Son deuxième neurone a son corps cellulaire dans le ganglion spinal.", false, "Le ganglion spinal héberge le corps du premier neurone, celui de deuxième ordre naissant dans la corne dorsale."),
      it("Elle est un simple câble dépourvu de modulation.", false, "La corne dorsale et le système descendant modulent continuellement le message."),
      it("Sa modulation descendante naît des lames I et V de la moelle.", false, "Le contrôle descendant provient de la substance grise périaqueducale et du noyau raphé magnus, les lames spinales étant réceptrices."),
      it("Elle exige toujours une perception consciente.", false, "Un traitement nociceptif peut survenir sans expérience consciente rapportée."),
    ], ["b00009", "b00012", "b00039"], "La nociception associe codage, transmission et modulation dynamique, sans être synonyme de douleur perçue."),
    qcm("Quelles étapes appartiennent à l’intégration douloureuse ?", [
      it("Myélinisation.", false, "La myélinisation conditionne la vitesse de conduction des fibres afférentes, hors du cadre des quatre étapes décrites."),
      it("Dégranulation mastocytaire.", false, "Les mastocytes alimentent la soupe inflammatoire périphérique, phénomène tissulaire distinct des quatre opérations de l’intégration."),
      it("Somatotopie.", false, "La somatotopie décrit l’organisation de la voie spinothalamique, elle ne figure pas parmi les quatre opérations retenues."),
      it("Perception.", true, "Elle intègre le message dans les réseaux corticaux."),
      it("Osmorégulation.", false, "L’osmorégulation ne constitue pas une étape de l’expérience douloureuse."),
    ], ["b00012", "b00013", "b00014", "b00016", "b00018"], "Le cadre utile comporte quatre opérations : transduction, transmission, modulation et perception."),
    qcm("Quels jalons chronologiques décrivent le développement fœtal des voies douloureuses ?", [
      it("Les nocicepteurs périoraux apparaissent vers la 7e semaine.", true, "Le développement périphérique débute précocement dans cette région."),
      it("La couverture cutanéo-muqueuse est atteinte vers la 20e semaine.", true, "L’extension périphérique est alors largement constituée."),
      it("Les connexions thalamo-corticales se forment entre 21 et 28 semaines.", true, "Ce relais permet l’accès aux réseaux de perception consciente."),
      it("La corne dorsale commence à se former seulement après la naissance.", false, "Son développement débute dès la 6e semaine de gestation."),
      it("Le réseau myélinisé atteint thalamus et tronc vers la 30e semaine.", true, "Cette échéance complète l’extension ascendante décrite."),
    ], "b00007", "Les voies nociceptives se construisent précocement, bien avant le terme de la grossesse."),
    qcm("Pourquoi la physiologie de la douleur est-elle centrale en anesthésie ?", [
      it("Elle aide à prévenir la douleur postopératoire.", true, "L’anesthésiste intervient avant, pendant et après le geste."),
      it("Elle permet d’affirmer que l’intensité perçue est proportionnelle à l’étendue de la lésion.", false, "Le traitement cortical, affectif et cognitif du message explique une grande variabilité interindividuelle indépendante de la lésion."),
      it("Elle supprime tout besoin d’évaluer le patient.", false, "La physiologie ne remplace jamais l’évaluation clinique répétée."),
      it("Elle éclaire le risque de chronicisation.", true, "Une douleur aiguë sévère peut installer une plasticité durable."),
      it("Elle justifie d’utiliser systématiquement toutes les classes antalgiques.", false, "Une combinaison doit rester adaptée au mécanisme et au terrain."),
    ], ["b00004", "b00005", "b00009"], "La neurophysiologie soutient une prévention ciblée de la douleur postopératoire et le suivi du risque de chronicisation."),
  ] },
  { title: "Fibres et premier neurone", questions: [
    qcm("Quelles caractéristiques décrivent les nocicepteurs périphériques ?", [
      it("Ce sont des terminaisons nerveuses libres.", true, "Ils ne possèdent pas d’organe sensoriel encapsulé."),
      it("Ils répondent à des stimuli mécaniques de forte intensité.", true, "Les déformations menaçant le tissu peuvent les activer."),
      it("Ils répondent à des stimuli thermiques nocifs.", true, "La chaleur ou le froid intense peuvent être transduits."),
      it("Ils sont absents des muscles et des os.", false, "Ils sont présents dans peau, muscle, os et tissus conjonctifs."),
      it("Ils peuvent répondre à des stimuli chimiques.", true, "Les médiateurs chimiques d’une lésion activent la terminaison."),
    ], "b00020", "Les nocicepteurs sont des terminaisons libres polymodales distribuées dans de nombreux tissus."),
    qcm("Quel profil anatomofonctionnel distingue les fibres Aδ ?", [
      it("Elles véhiculent la sensation tactile fine du toucher discriminatif.", false, "Le toucher discriminatif emprunte les grosses fibres Aβ myélinisées, les Aδ restant des fibres nociceptives et thermiques."),
      it("Elles véhiculent une douleur rapide et localisée.", true, "Elles portent la première douleur aiguë et perçante."),
      it("Leur vitesse est inférieure à celle des fibres C.", false, "Elles conduisent plus vite que les fibres C amyéliniques."),
      it("Leur diamètre est d’environ 2 à 5 μm.", true, "Le tableau source les situe dans cette plage."),
      it("Elles sont responsables de la seconde douleur brûlante.", false, "Cette seconde douleur est portée surtout par les fibres C."),
    ], ["b00020", "b00021"], "Les Aδ sont de petit calibre, peu myélinisées, relativement rapides et responsables de la première douleur."),
    qcm("Quel profil anatomofonctionnel distingue les fibres C ?", [
      it("Elles sont amyéliniques.", true, "L’absence de myéline contribue à leur conduction lente."),
      it("Elles transmettent une douleur sourde et brûlante.", true, "Elles véhiculent la seconde douleur, moins localisée."),
      it("Elles véhiculent la première douleur immédiate et bien localisée.", false, "La première douleur rapide et perçante emprunte les fibres Aδ myélinisées, les fibres C portant la seconde."),
      it("Elles ont un diamètre supérieur à 20 μm.", false, "Leur diamètre est inférieur à 2 μm."),
      it("Elles sont plus rapides que les Aβ.", false, "Les Aβ myélinisées conduisent bien plus vite."),
    ], ["b00020", "b00021"], "Les fibres C sont petites, non myélinisées et transmettent la douleur tardive, diffuse et brûlante."),
    qcm("Quel trajet suit le premier neurone nociceptif ?", [
      it("Son corps cellulaire siège dans le ganglion spinal.", true, "Le ganglion contient le noyau du neurone primaire."),
      it("Il entre dans la moelle par la racine dorsale.", true, "L’axone central gagne la corne postérieure."),
      it("Il fait synapse avec le troisième neurone dans le noyau ventral postérolatéral.", false, "Le premier neurone se termine dans la corne dorsale, le relais thalamique ventral postérolatéral concernant le deuxième."),
      it("Il croise toujours dans le thalamus.", false, "Le croisement concerne surtout le deuxième neurone dans la moelle."),
      it("Une partie des fibres C peut entrer par la racine ventrale.", true, "Le texte décrit cette exception anatomique minoritaire."),
    ], ["b00020", "b00023", "b00024", "b00025", "b00026"], "Le premier neurone relie la terminaison périphérique à la corne dorsale, parfois après un trajet dans Lissauer."),
    qcm("Quelles afférences véhiculent la nociception viscérale ?", [
      it("Les fibres Aβ cutanées de gros calibre.", false, "Ces grosses fibres transmettent le tact et ferment plutôt le portillon, elles ne portent pas le message viscéral."),
      it("Les cordons postérieurs de la moelle.", false, "Les cordons postérieurs véhiculent le tact épicritique et la proprioception, la nociception viscérale empruntant la voie spinothalamique antérolatérale."),
      it("Les nerfs splanchniques.", true, "Ils constituent une voie viscérale classique."),
      it("Uniquement les nerfs moteurs somatiques.", false, "La nociception viscérale ne dépend pas exclusivement des efférences motrices."),
      it("Aucune fibre C.", false, "Les fibres C sont majeures dans la douleur viscérale lente."),
    ], "b00020", "Les afférences viscérales utilisent des trajets autonomes et splanchniques, souvent riches en fibres C."),
  ] },
  { title: "Corne dorsale et portillon", questions: [
    qcm("Quelles lames médullaires reçoivent surtout les afférences nociceptives ?", [
      it("La lame IX de la corne antérieure.", false, "La lame IX regroupe les motoneurones de la corne antérieure, hors du champ des afférences nociceptives."),
      it("La lame II.", true, "La substantia gelatinosa est un site majeur d’intégration."),
      it("La lame VII, principal site de terminaison des fibres C.", false, "Les afférences nociceptives périphériques se terminent principalement dans les lames I, II et V."),
      it("Exclusivement la lame X.", false, "Les terminaisons dominantes sont I, II et V."),
      it("Toutes les fibres se terminent dans le cortex sans relais spinal.", false, "La corne dorsale est le premier relais central."),
    ], ["b00020", "b00027"], "Les lames I, II et V concentrent l’essentiel des afférences nociceptives périphériques."),
    qcm("Quels éléments font de la lame II un carrefour inhibiteur spinal ?", [
      it("Elle est appelée substantia gelatinosa.", true, "Cette dénomination correspond à la deuxième lame de Rexed."),
      it("Elle reçoit des afférences inhibitrices Aβ.", true, "Ces afférences participent à la fermeture du portillon."),
      it("Elle est riche en récepteurs opioïdes.", true, "Elle constitue une cible majeure de modulation spinale."),
      it("Elle ne contient aucun interneurone.", false, "Les interneurones y jouent un rôle central."),
      it("Elle reçoit le contrôle descendant.", true, "Les projections du tronc cérébral atteignent notamment ce niveau."),
    ], "b00027", "La substantia gelatinosa est un carrefour inhibiteur riche en interneurones, afférences Aβ et récepteurs opioïdes."),
    qcm("Quelles propositions expliquent la douleur référée ?", [
      it("Elle s’explique par une convergence viscéro-somatique située dans le noyau ventral postérolatéral.", false, "La convergence responsable de la douleur référée siège dans la corne dorsale, à l’étage de la lame V."),
      it("Le cerveau peut attribuer le message viscéral à un territoire somatique.", true, "La convergence rend l’origine réelle ambiguë."),
      it("La lésion viscérale migre réellement vers la peau.", false, "La projection est perceptive, non anatomique."),
      it("Elle traduit une conduction antidromique du message viscéral vers la peau.", false, "La conduction antidromique décrit le réflexe d’axone de l’inflammation neurogène, phénomène distinct de la projection perceptive."),
      it("Elle exclut une atteinte viscérale.", false, "Elle doit au contraire faire rechercher une origine viscérale cohérente."),
    ], "b00027", "La douleur référée découle d’une convergence viscéro-somatique et d’une attribution centrale imparfaite."),
    qcm("Comment la théorie du portillon explique-t-elle la modulation segmentaire ?", [
      it("Les fibres Aδ et C favorisent l’ouverture.", true, "Leur activation augmente le transfert nociceptif."),
      it("Les fibres Aβ favorisent la fermeture.", true, "Les afférences tactiles recrutent des circuits inhibiteurs."),
      it("Le contrôle descendant peut fermer le portillon.", true, "Les voies du tronc cérébral modulent le relais spinal."),
      it("Les interneurones de la corne dorsale en constituent le support anatomique.", true, "La modulation se fait principalement au niveau spinal, où la présence d’interneurones justifie la théorie de Melzack et Wall."),
      it("Le TENS peut exploiter ce mécanisme.", true, "La stimulation sensitive réduit la transmission nociceptive."),
    ], ["b00027", "b00028", "b00029"], "Le portillon résulte de la balance entre afférences nociceptives, tactiles et modulation descendante."),
    qcm("Quels types de neurones de deuxième ordre sont décrits ?", [
      it("Des neurones nociceptifs spécifiques.", true, "Ils répondent aux stimuli nocifs de forte intensité."),
      it("Des neurones de premier ordre logés dans le ganglion spinal.", false, "Le ganglion spinal contient les neurones de premier ordre, alors que ceux de deuxième ordre ont leur corps dans la corne dorsale."),
      it("Des neurones impliqués dans l’inhibition de la nociception.", true, "Ce troisième type décrit dans la corne dorsale freine la transmission sans véhiculer lui-même le message nociceptif."),
      it("Uniquement des motoneurones α.", false, "Les motoneurones ne constituent pas ces trois profils sensoriels."),
      it("Des neurones dont aucun n’est modulable.", false, "Leur activité dépend de multiples influences excitatrices et inhibitrices."),
    ], ["b00032", "b00033", "b00034", "b00035", "b00036", "b00037"], "La corne dorsale contient des neurones spécifiques, à large spectre et non nociceptifs."),
  ] },
  { title: "Voies ascendantes et perception", questions: [
    qcm("Quel trajet et quelle fonction définissent la voie néospinothalamique ?", [
      it("Elle appartient à la voie spinothalamique latérale.", true, "Elle constitue sa composante discriminative."),
      it("Elle relaie dans le thalamus médial avant d’atteindre l’insula.", false, "Le relais médial et l’insula appartiennent à la voie paléospinothalamique, la voie latérale gagnant le noyau ventral postérolatéral."),
      it("Elle porte l’essentiel de la composante affective et autonome.", false, "La dimension affective et autonome relève de la voie médiale, la voie néospinothalamique restant sensitivo-discriminative."),
      it("Elle est totalement dépourvue d’organisation somatotopique.", false, "La voie spinothalamique est organisée somatotopiquement."),
      it("Elle projette exclusivement vers le cervelet.", false, "Son relais majeur est thalamo-cortical."),
    ], "b00038", "La voie latérale transmet surtout l’aspect sensitivo-discriminatif vers le VPL et le cortex S1."),
    qcm("Quel trajet et quelle fonction définissent la voie paléospinothalamique ?", [
      it("Elle projette vers le thalamus médial.", true, "Ce relais dessert les réseaux affectifs."),
      it("Elle atteint l’insula.", true, "L’insula contribue à l’expérience affective."),
      it("Elle projette sur le noyau ventral postérolatéral puis sur le cortex somatosensitif primaire.", false, "Ce trajet ventral postérolatéral vers S1 définit la voie néospinothalamique latérale."),
      it("Elle porte uniquement la discrimination fine.", false, "Elle porte surtout dimensions autonome et affective."),
      it("Elle est une voie descendante motrice.", false, "Il s’agit d’une voie ascendante nociceptive."),
    ], "b00038", "La voie médiale distribue le signal vers les réseaux autonomes et affectifs."),
    qcm("Quelles propositions décrivent la voie spinoréticulaire ?", [
      it("Elle emprunte le cordon postérieur homolatéral de la moelle.", false, "Les neurones de deuxième ordre montent dans la portion antérolatérale de la moelle controlatérale."),
      it("Elle projette vers thalamus et hypothalamus.", true, "Elle participe aux réponses diffuses et autonomes."),
      it("Elle produit une perception diffuse et déplaisante.", true, "Sa faible somatotopie rend la localisation imprécise."),
      it("Elle est plus somatotopique que la voie spinothalamique.", false, "Elle est au contraire peu organisée."),
      it("Elle n’a aucun lien avec l’éveil.", false, "La formation réticulée relie nociception et état d’activation."),
    ], "b00038", "La voie spinoréticulaire est diffuse, peu somatotopique et connectée aux réponses autonomes et d’éveil."),
    qcm("Quels réseaux corticaux participent à la douleur ?", [
      it("Les cortex somatosensitifs primaire et secondaire.", true, "Ils analysent localisation et caractéristiques du stimulus."),
      it("L’insula.", true, "Elle contribue à l’intégration affective et viscérale."),
      it("Le cortex cingulaire antérieur.", true, "Il participe au caractère pénible et motivationnel."),
      it("Le cortex préfrontal.", true, "Il intervient dans mémoire, attention et évaluation."),
      it("Aucune région pariétale.", false, "Certaines régions pariétales contribuent à l’aspect cognitif."),
    ], "b00039", "La perception douloureuse mobilise un réseau sensoriel, affectif et cognitif distribué."),
    qcm("Quelles dimensions expliquent la variabilité de la douleur ?", [
      it("La dimension discriminative.", true, "Elle décrit intensité, qualité et localisation."),
      it("La dimension affective.", true, "Elle module le caractère déplaisant."),
      it("La mémoire du stimulus.", true, "Le cortex préfrontal participe à l’évaluation fondée sur l’expérience."),
      it("Le contexte psychologique.", true, "Il influence les voies descendantes et la perception."),
      it("Uniquement le diamètre des fibres C.", false, "La perception ne dépend pas d’un seul paramètre périphérique."),
    ], ["b00009", "b00039", "b00040"], "Une douleur vécue résulte du signal périphérique et de son intégration sensorielle, affective et cognitive."),
  ] },
  { title: "Contrôle descendant", questions: [
    qcm("Quelles structures participent au contrôle descendant ?", [
      it("La substance grise périaqueducale.", true, "Elle organise une analgésie descendante majeure."),
      it("Le noyau raphé magnus.", true, "Le raphé envoie ses axones inhibiteurs vers les relais de la corne dorsale."),
      it("Le cortex et l’hypothalamus.", true, "Ils fournissent des entrées à la substance grise périaqueducale."),
      it("Uniquement le ganglion spinal.", false, "Le ganglion ne constitue pas l’origine du contrôle descendant."),
      it("Les collatérales spinothalamiques.", true, "Elles informent la substance grise périaqueducale du message ascendant."),
    ], ["b00040", "b00041", "b00042"], "Le contrôle descendant relie cortex, thalamus, hypothalamus, substance grise périaqueducale et raphé."),
    qcm("Quel rôle occupe la substance grise périaqueducale dans l’analgésie descendante ?", [
      it("Elle se situe dans le mésencéphale.", true, "Cette substance grise entoure l’aqueduc au sein du mésencéphale."),
      it("Sa stimulation peut produire une analgésie profonde.", true, "Elle active les circuits inhibiteurs descendants."),
      it("Elle reçoit des informations corticales.", true, "Le cortex influence ainsi la modulation de la douleur."),
      it("Elle projette sans relais uniquement vers le muscle.", false, "Elle recrute notamment le noyau raphé magnus."),
      it("Elle reçoit des collatérales spinothalamiques.", true, "Le signal ascendant participe à l’activation du contrôle."),
    ], "b00042", "La substance grise périaqueducale intègre des entrées supérieures et nociceptives puis active le raphé."),
    qcm("Comment les voies descendantes inhibent-elles la transmission ?", [
      it("Par un blocage des canaux sodiques de l’axone périphérique.", false, "Le blocage des canaux sodiques axonaux définit l’action des anesthésiques locaux, le contrôle descendant agissant à l’étage spinal."),
      it("Par inhibition d’axones excitateurs.", true, "Elles diminuent l’afflux synaptique excitateur."),
      it("Par activation d’interneurones inhibiteurs.", true, "Elles renforcent les circuits locaux de freinage."),
      it("Par destruction des nocicepteurs périphériques.", false, "La modulation est fonctionnelle, non destructrice."),
      it("Par une libération de substance P dans la corne dorsale.", false, "La substance P est libérée par les afférences primaires et facilite la transmission, les voies descendantes utilisant plutôt noradrénaline et sérotonine."),
    ], ["b00042", "b00043", "b00044"], "Le contrôle descendant agit directement, présynaptiquement et via les interneurones inhibiteurs."),
    qcm("Quels facteurs peuvent modifier le portillon spinal ?", [
      it("Une activation des motoneurones α de la corne antérieure.", false, "Les motoneurones de la corne antérieure commandent le muscle et restent étrangers à la balance excitation-inhibition du portillon."),
      it("Une activation des fibres C.", true, "Elle favorise l’ouverture et l’excitation."),
      it("Le contrôle cortical descendant.", true, "L’attention et le contexte peuvent moduler la voie descendante."),
      it("Un TENS.", true, "Il exploite la stimulation sensitive périphérique."),
      it("La glycémie seule, indépendamment de toute voie neurale.", false, "Elle ne représente pas un mécanisme direct du portillon décrit."),
    ], ["b00027", "b00029", "b00040"], "Le portillon est ajusté par afférences nociceptives, tactiles et contrôle descendant."),
    qcm("Pourquoi le système descendant est-il cliniquement important ?", [
      it("Il relie le contexte psychologique au signal spinal.", true, "Les entrées corticales peuvent modifier l’inhibition."),
      it("Il repose sur des projections directes du cervelet vers la corne dorsale.", false, "Les voies inhibitrices descendantes proviennent de la substance grise périaqueducale et du noyau raphé magnus."),
      it("Il explique une part de la variabilité interindividuelle.", true, "Son activation diffère selon attention, émotion et expérience."),
      it("Il supprime toujours complètement la douleur.", false, "Il module le signal sans garantir une analgésie totale."),
      it("Il agit en aval et en amont du deuxième neurone spinal.", true, "Les effets pré- et postsynaptiques sont complémentaires."),
    ], ["b00009", "b00040", "b00042", "b00094"], "Le système descendant est un frein variable, influencé par les centres supérieurs et accessible à la modulation thérapeutique."),
  ] },
  { title: "Sensibilisation périphérique et centrale", questions: [
    qcm("Quels éléments appartiennent à la soupe inflammatoire ?", [
      it("Les ions K+ et H+.", true, "Ils sont libérés par le tissu lésé et activent les nocicepteurs."),
      it("L’histamine.", true, "La dégranulation mastocytaire la libère localement."),
      it("La bradykinine.", true, "Elle fait partie des médiateurs algogènes périphériques."),
      it("Des prostaglandines.", true, "La voie COX les génère à partir de l’acide arachidonique."),
      it("Des médiateurs libérés indirectement par la dégranulation des mastocytes.", true, "Les cellules lésées libèrent directement une partie des médiateurs, la dégranulation en apportant d’autres par voie indirecte."),
    ], ["b00048", "b00051", "b00061"], "La lésion crée un environnement ionique et inflammatoire qui active puis sensibilise le nocicepteur."),
    qcm("Quelles propositions décrivent la sensibilisation périphérique ?", [
      it("Le seuil de dépolarisation du nocicepteur baisse.", true, "Le nocicepteur déclenche alors un potentiel pour une stimulation plus faible."),
      it("Les courants sodiques dépolarisants augmentent.", true, "L’augmentation des canaux TTX résistants renforce la réponse."),
      it("Le message nociceptif est amplifié.", true, "Une stimulation identique produit davantage de décharges."),
      it("Les récepteurs au NGF y participent via les tyrosines kinases TrkA ou TrkB.", true, "Le nerve growth factor sensibilise la terminaison en se couplant à TrkA ou TrkB, TrkB stimulant la production de BDNF."),
      it("Elle est favorisée par l’inflammation.", true, "Les médiateurs modifient canaux et récepteurs du nocicepteur."),
    ], ["b00053", "b00056"], "L’inflammation rend la terminaison périphérique hyperexcitable en abaissant son seuil et renforçant ses courants."),
    qcm("Comment l’inflammation neurogène s’étend-elle autour d’une lésion ?", [
      it("Elle s’étend par un réflexe d’axone.", true, "Les branches périphériques propagent localement le signal."),
      it("La substance P y participe.", true, "Elle active vaisseaux, mastocytes et nocicepteurs voisins."),
      it("Le CGRP y participe.", true, "Ce peptide entretient vasodilatation et inflammation."),
      it("Elle gagne en tache d’huile des zones initialement non lésées.", true, "L’inflammation initiale diffuse autour de la plaie vers des territoires cutanés indemnes."),
      it("Elle peut contribuer à l’hyperalgésie secondaire.", true, "Le territoire autour de la lésion devient plus sensible."),
    ], ["b00051", "b00052", "b00058", "b00059"], "Le réflexe d’axone et les neuropeptides étendent l’inflammation et la sensibilité au-delà de la lésion."),
    qcm("Quelles propositions décrivent l’activation NMDA ?", [
      it("Le canal est initialement bloqué par Mg2+.", true, "Ce bloc rend le récepteur silencieux au repos."),
      it("Une dépolarisation répétée lève le bloc.", true, "L’activation AMPA répétée favorise cette levée."),
      it("Elle dépend de la fixation de la substance P sur le récepteur AMPA.", false, "Les récepteurs AMPA lient le glutamate, la substance P agissant sur le récepteur neurokinine 1."),
      it("Elle réduit durablement toute transmission.", false, "Elle amplifie au contraire le signal et la plasticité."),
      it("Elle se produit sur la terminaison présynaptique du premier neurone.", false, "Les récepteurs NMDA impliqués dans la sensibilisation sont postsynaptiques, portés par le deuxième neurone."),
    ], "b00063", "L’activation NMDA transforme une transmission répétée en hyperexcitabilité calcique durable."),
    qcm("Quels acteurs contribuent à la sensibilisation centrale ?", [
      it("Les récepteurs AMPA et NMDA.", true, "AMPA dépolarise puis NMDA amplifie la transmission."),
      it("Le calcium présynaptique.", true, "Il commande la libération de glutamate."),
      it("Les canaux sodiques résistants à la tétrodotoxine du nocicepteur.", false, "Leur augmentation caractérise la sensibilisation périphérique de la terminaison, à distance de la synapse spinale."),
      it("Les astrocytes.", true, "Ils interagissent avec les neurones sensoriels."),
      it("Uniquement les plaquettes circulantes.", false, "La sensibilisation centrale implique synapse et glie du système nerveux."),
    ], "b00063", "La sensibilisation centrale associe transmission glutamatergique, flux calciques, plasticité neuronale et activation gliale."),
  ] },
  { title: "Cibles pharmacologiques", questions: [
    qcm("Comment les AINS réduisent-ils la sensibilisation périphérique et quels risques en découlent ?", [
      it("Ils inhibent les cyclooxygénases.", true, "Ils réduisent la synthèse des prostaglandines."),
      it("Ils diminuent la sensibilisation périphérique.", true, "La baisse des prostaglandines réduit l’inflammation algogène."),
      it("L’inhibition de COX-1 explique des effets gastriques.", true, "COX-1 protège notamment la muqueuse digestive."),
      it("Ils n’ont aucun effet rénal ni plaquettaire.", false, "Ces effets sont classiques avec l’inhibition de COX-1."),
      it("Ils agissent uniquement sur le récepteur NMDA.", false, "Leur cible principale est la cyclooxygénase."),
    ], "b00076", "Les AINS freinent les prostaglandines mais leur non-sélectivité explique toxicités digestive, rénale et plaquettaire."),
    qcm("Comment les anesthésiques locaux interrompent-ils la conduction nociceptive ?", [
      it("Ils bloquent les canaux sodiques de l’intérieur.", true, "La molécule doit pénétrer dans la fibre pour atteindre sa cible."),
      it("Ils interrompent réversiblement le potentiel d’action.", true, "La conduction reprend après élimination du produit."),
      it("Ils peuvent être injectés en périnerveux.", true, "C’est le principe des blocs nerveux."),
      it("Ils peuvent être utilisés en neuraxial.", true, "Rachianesthésie et péridurale sont citées."),
      it("Leur pKa et leur liposolubilité modifient leur profil pharmacologique.", true, "Liposolubilité, constante d’ionisation et liaison protéique différencient les anesthésiques locaux entre eux."),
    ], "b00078", "Les anesthésiques locaux interrompent la conduction axonale à différents niveaux périphériques ou neuraxiaux."),
    qcm("Quels effets synaptiques ont les opioïdes μ ?", [
      it("Ils inhibent des canaux Ca2+ présynaptiques.", true, "Moins de calcium réduit l’exocytose de glutamate."),
      it("Ils diminuent la libération de glutamate.", true, "L’afférence excite moins le deuxième neurone."),
      it("Ils augmentent la sortie de K+ postsynaptique.", true, "La perte de potassium hyperpolarise le deuxième neurone et réduit sa réponse."),
      it("Ils sont couplés à une protéine G inhibitrice.", true, "Le récepteur μ utilise une signalisation Gi."),
      it("Leur récepteur est le plus commun des récepteurs opioïdes décrits.", true, "Le récepteur μ est présenté comme le type le plus fréquent parmi les cibles opioïdes."),
    ], "b00080", "Les opioïdes freinent la synapse à la fois avant et après la fente synaptique."),
    qcm("Quelles propositions concernent les anti-NMDA ?", [
      it("La kétamine appartient à cette classe.", true, "Elle module négativement le récepteur NMDA."),
      it("Le protoxyde d’azote est cité.", true, "Il possède une composante anti-NMDA."),
      it("Le dextrométhorphane est cité.", true, "Il réduit également l’activation NMDA."),
      it("Ils réduisent le flux calcique entrant postsynaptique.", true, "Le blocage du récepteur NMDA diminue l’entrée de calcium et l’hyperexcitabilité du deuxième neurone."),
      it("Ils ciblent l’hyperexcitabilité centrale.", true, "Leur intérêt mécanistique concerne la sensibilisation."),
    ], ["b00081", "b00082"], "Les anti-NMDA diminuent le flux calcique postsynaptique et la sensibilisation centrale."),
    qcm("Quelles propositions décrivent les gabapentinoïdes et agonistes α2 ?", [
      it("Les gabapentinoïdes réduisent l’entrée de Ca2+ présynaptique.", true, "Ils limitent ainsi l’exocytose du glutamate."),
      it("La prégabaline est un gabapentinoïde.", true, "Elle partage ce mécanisme avec la gabapentine."),
      it("La clonidine est un agoniste α2.", true, "Elle active des récepteurs inhibiteurs spinaux."),
      it("La dexmédétomidine est un agoniste α2.", true, "Elle agit sur des récepteurs couplés aux protéines G."),
      it("Les agonistes α2 dépolarisent systématiquement le neurone.", false, "Ils favorisent au contraire son hyperpolarisation."),
    ], ["b00084", "b00085", "b00086", "b00087"], "Gabapentinoïdes et α2 réduisent la transmission par des mécanismes calciques et d’hyperpolarisation complémentaires."),
  ] },
  { title: "Raisonnement multimodal", questions: [
    qcm("Quels principes définissent une analgésie multimodale raisonnée ?", [
      it("Additionner deux anti-inflammatoires non stéroïdiens pour renforcer l’effet.", false, "Cumuler deux inhibiteurs des cyclooxygénases multiplie les risques digestifs, rénaux et plaquettaires sans gain analgésique proportionné."),
      it("Considérer qu’une seule classe suffit dès lors qu’elle agit au niveau spinal.", false, "Un agent spinal laisse échapper la transduction périphérique et les dimensions affectives de la perception."),
      it("Choisir la classe d’après le seul palier OMS atteint.", false, "Le palier ordonne les puissances, mais le choix dépend du mécanisme dominant et du terrain."),
      it("Cumuler automatiquement tous les paliers.", false, "La multimodalité n’est pas une addition sans indication."),
      it("Réévaluer la réponse clinique.", true, "L’efficacité et la tolérance guident l’ajustement."),
    ], ["b00004", "b00067", "b00069", "b00070"], "La multimodalité combine des mécanismes pertinents, surveillés et ajustés au patient."),
    qcm("Quelles cibles appartiennent à la périphérie ?", [
      it("Les canaux calciques présynaptiques de la première synapse.", false, "Ces canaux siègent à la terminaison centrale du premier neurone, dans la corne dorsale."),
      it("Les canaux sodiques axonaux.", true, "Les anesthésiques locaux interrompent la conduction."),
      it("La substantia gelatinosa riche en récepteurs opioïdes.", false, "Cette lame II appartient à la corne dorsale, donc à l’étage spinal et non à la périphérie."),
      it("Le cortex cingulaire uniquement.", false, "Il appartient aux réseaux centraux affectifs."),
      it("Les récepteurs NMDA du deuxième neurone.", false, "Ces récepteurs sont postsynaptiques dans la corne dorsale, donc une cible spinale et non périphérique."),
    ], ["b00048", "b00058", "b00076", "b00078"], "La périphérie offre des cibles inflammatoires, trophiques et de conduction axonale."),
    qcm("Quelles cibles appartiennent à la synapse spinale ?", [
      it("Les canaux Ca2+ présynaptiques.", true, "Ils déterminent la libération de glutamate."),
      it("La cyclooxygénase-2 induite dans le tissu lésé.", false, "L’induction de COX-2 par les cytokines se produit dans le tissu périphérique lésé."),
      it("Les récepteurs NMDA.", true, "Ils portent l’amplification calcique."),
      it("Les récepteurs opioïdes.", true, "Ils inhibent pré- et postsynaptiquement."),
      it("Uniquement la COX-1 gastrique.", false, "Cette cible est périphérique et viscérale, non spécifique de la synapse."),
    ], ["b00063", "b00066", "b00080", "b00082", "b00084"], "La première synapse concentre des cibles majeures de transmission et de plasticité."),
    qcm("Quels éléments favorisent la chronicisation d’une douleur aiguë ?", [
      it("Une stimulation nociceptive forte et répétée.", true, "Elle active progressivement les mécanismes NMDA."),
      it("Une sensibilisation périphérique persistante.", true, "Le nocicepteur continue d’envoyer un message amplifié."),
      it("Une conduction rapide par les fibres Aβ myélinisées.", false, "Les afférences Aβ véhiculent le tact et renforcent l’inhibition segmentaire plutôt que l’amplification."),
      it("Un blocage complet des récepteurs NMDA pendant la phase aiguë.", false, "Moduler négativement les récepteurs NMDA réduit l’hyperexcitabilité et donc le risque de chronicisation."),
      it("Une inhibition descendante toujours maximale.", false, "Un frein maximal s’opposerait plutôt à l’amplification."),
    ], ["b00004", "b00009", "b00056", "b00063"], "La chronicisation résulte d’une plasticité nourrie par l’afflux périphérique et l’hyperexcitabilité centrale."),
    qcm("Quels réflexes évitent un raisonnement réducteur sur la douleur ?", [
      it("Distinguer douleur rapportée et nociception.", true, "L’expérience ne se résume pas au signal."),
      it("Considérer qu’une douleur projetée traduit une lésion réellement située dans le territoire perçu.", false, "La projection est perceptive et résulte d’une convergence spinale, la lésion restant à son siège d’origine."),
      it("Intégrer affect et cognition.", true, "Ils modulent directement la perception."),
      it("Déduire l’intensité uniquement de la lésion visible.", false, "Le retentissement varie selon le patient et le contexte."),
      it("Réévaluer après chaque intervention.", true, "La réponse permet de tester le mécanisme supposé."),
    ], ["b00003", "b00027", "b00039"], "Un raisonnement complet unit mécanisme, expérience rapportée, territoire, contexte et réponse au traitement."),
  ] },
];

function buildIsolatedQcm() {
  return ISOLATED_QCM.map((series, index) => ({
    label: `QCM ${index + 1} · ${series.title}`,
    allowed_voies: ["interne"],
    questions: series.questions,
  }));
}

const DP_QCM = [
  {
    title: "Prématuré exposé à un geste invasif",
    vignette: "Un nouveau-né prématuré à 27 semaines d’aménorrhée, hospitalisé en réanimation néonatale, doit subir au lit un drainage thoracique urgent. Cet enfant réagit déjà aux manipulations par des grimaces et des variations cardiorespiratoires. Un membre de l’équipe estime néanmoins que ses voies douloureuses sont trop immatures pour justifier une analgésie ; l’anesthésiste doit argumenter la conduite avant le geste.",
    questions: [
      qcm("Quels éléments doivent guider la discussion initiale ?", [
        it("Le développement de la corne dorsale débute seulement après 34 semaines.", false, "Les voies sensitives de la corne dorsale commencent à se développer dès la 6e semaine de gestation."),
        it("Les connexions thalamo-corticales peuvent être présentes.", true, "Elles se forment entre les 21e et 28e semaines."),
        it("La perception est impossible avant 40 semaines.", false, "Les structures nécessaires sont présentes bien avant le terme."),
        it("Le geste constitue un stimulus mécanique et tissulaire nociceptif.", true, "Le drainage active les terminaisons libres mécano- et chimiosensibles."),
        it("L’absence de verbalisation exclut toute douleur.", false, "La communication verbale n’est pas nécessaire à la nociception."),
      ], ["b00003", "b00007", "b00020"], "À 27 semaines, les voies périphériques et thalamo-corticales peuvent transmettre une expérience douloureuse."),
      qcm("Quelles structures périphériques sont activées par l’incision ?", [
        it("Des terminaisons nerveuses libres.", true, "Elles constituent les nocicepteurs cutanés."),
        it("Des fibres Aδ.", true, "Elles transmettent la première douleur rapide."),
        it("Des fibres C.", true, "Elles transmettent la douleur tardive et brûlante."),
        it("Des nocicepteurs polymodaux des tissus conjonctifs pariétaux.", true, "Les nocicepteurs sont présents dans la peau, les muscles, les os et les tissus conjonctifs traversés par le drainage."),
        it("Des récepteurs sensibles aux médiateurs chimiques.", true, "La lésion libère une soupe inflammatoire activatrice."),
      ], ["b00020", "b00048"], "L’incision active des nocicepteurs libres et leurs fibres Aδ et C.", "Le drainage est préparé sous guidage, avec incision cutanée puis dilatation intercostale."),
      qcm("Quelles différences entre fibres Aδ et C sont pertinentes ?", [
        it("Les Aδ sont plus rapides.", true, "Leur faible myélinisation accélère la conduction."),
        it("Les C sont non myélinisées.", true, "L’absence de myéline explique leur conduction lente de 0,5 à 2 m/s."),
        it("Les Aδ donnent une douleur mieux localisée.", true, "Elles portent la première douleur aiguë."),
        it("Les C conduisent à plus de 40 m/s.", false, "Leur vitesse est environ 0,5 à 2 m/s."),
        it("Les C contribuent à une sensation brûlante tardive.", true, "C’est la seconde douleur classique."),
      ], ["b00020", "b00021"], "Aδ transmet vite la douleur aiguë ; C transmet lentement une douleur diffuse et brûlante.", "À la stimulation, une réponse cardiovasculaire immédiate précède une agitation plus prolongée."),
      qcm("Quels mécanismes peuvent amplifier la douleur autour du drain ?", [
        it("Une inhibition segmentaire renforcée par les fibres Aβ.", false, "Le recrutement des fibres Aβ ferme le portillon et diminue plutôt la transmission nociceptive."),
        it("L’activation des récepteurs NMDA de la terminaison cutanée.", false, "Les récepteurs NMDA impliqués sont postsynaptiques dans la corne dorsale, à distance de la peau."),
        it("L’augmentation des canaux sodiques TTX résistants.", true, "Elle abaisse le seuil de dépolarisation."),
        it("Une disparition complète des prostaglandines.", false, "La lésion en augmente la production via COX."),
        it("La substance P et le CGRP.", true, "Ces peptides entretiennent l’inflammation neurogène."),
      ], ["b00051", "b00053", "b00056", "b00058"], "La sensibilisation périphérique associe médiateurs, neuropeptides et excitabilité accrue du nocicepteur.", "Deux heures après le geste, la peau voisine devient rouge et hypersensible."),
      qcm("Quels relais spinaux participent au message ?", [
        it("Les lames I et II.", true, "Elles reçoivent les afférences nociceptives et thermiques."),
        it("La lame V à convergence viscéro-somatique.", true, "Cette couche reçoit aussi des afférences nociceptives à large convergence."),
        it("Des interneurones inhibiteurs.", true, "Ils modulent le passage vers le deuxième neurone."),
        it("Aucun récepteur opioïde.", false, "La substantia gelatinosa en est riche."),
        it("Le noyau ventral postérolatéral du thalamus.", false, "Ce noyau thalamique est un relais supraspinal, situé au-delà de la corne dorsale."),
      ], ["b00027", "b00042"], "La corne dorsale intègre afférences nociceptives, interneurones et contrôle descendant.", "Malgré l’immobilisation, les réponses autonomes persistent lors des soins du drain."),
      qcm("Quels principes justifient une analgésie adaptée ?", [
        it("Prévenir l’afflux nociceptif répétitif.", true, "Les décharges répétées favorisent l’hyperexcitabilité centrale."),
        it("Associer des mécanismes complémentaires.", true, "Une multimodalité adaptée couvre plusieurs relais."),
        it("Considérer la présence de nocicepteurs cutanéo-muqueux dès la 20e semaine.", true, "L’extension des nocicepteurs à toutes les surfaces cutanées et muqueuses est acquise vers la 20e semaine de gestation."),
        it("Réévaluer par des signes comportementaux et physiologiques.", true, "Le patient ne peut verbaliser son expérience."),
        it("Adapter les traitements au terme et au terrain.", true, "La maturité modifie tolérance et pharmacologie sans nier la douleur."),
      ], ["b00004", "b00007", "b00063"], "La prise en charge prévient l’afflux répété, combine les cibles et suit des indicateurs adaptés.", "L’équipe décide d’une analgésie procédurale et d’une surveillance structurée."),
      qcm("Quelles conclusions doivent figurer dans la transmission ?", [
        it("Le prématuré possède des voies nociceptives fonctionnelles.", true, "Le développement décrit le permet à ce terme."),
        it("L’absence de parole ne permet pas de conclure à l’absence de douleur.", true, "La verbalisation n’est pas le critère physiologique."),
        it("Une prévention multimodale est rationnelle.", true, "Elle limite transduction, conduction et amplification."),
        it("La douleur n’a aucun effet sur la morbidité.", false, "Une douleur mal traitée peut perturber la physiologie."),
        it("La réévaluation reste indispensable.", true, "La réponse et la tolérance doivent guider l’ajustement."),
      ], ["b00004", "b00007"], "Le dossier doit acter la capacité nociceptive, la stratégie préventive et la réévaluation.", "Après le geste, les constantes se stabilisent et les soins suivants sont anticipés."),
    ],
  },
  {
    title: "Incision inflammatoire et douleur secondaire",
    vignette: "Une patiente de 42 ans est revue six heures après une laparotomie non compliquée. Malgré le traitement initial, elle décrit une brûlure intense autour de l’incision et supporte difficilement le contact du drap. La zone est rouge, chaude et hypersensible au-delà des berges, sans instabilité hémodynamique ni anomalie profonde évidente ; l’équipe cherche le mécanisme dominant avant d’adapter l’analgésie.",
    questions: [
      qcm("Quels mécanismes expliquent le tableau initial ?", [
        it("Une soupe inflammatoire périphérique.", true, "La lésion libère ions et médiateurs algogènes."),
        it("Une libération médullaire d’histamine par les interneurones spinaux.", false, "L’histamine provient de la dégranulation mastocytaire au site lésé, non des interneurones de la corne dorsale."),
        it("Une inflammation neurogène.", true, "Le réflexe d’axone étend la réponse."),
        it("Une disparition des fibres C.", false, "Ces fibres participent à la douleur brûlante prolongée."),
        it("Une absence totale de plasticité.", false, "La transmission persistante peut modifier le système."),
      ], ["b00048", "b00051", "b00056", "b00059"], "La lésion déclenche une inflammation chimique et neurogène responsable d’une sensibilisation périphérique."),
      qcm("Quels médiateurs locaux sont plausibles ?", [
        it("K+ et H+.", true, "Les cellules lésées les libèrent dans le milieu."),
        it("Histamine.", true, "Les mastocytes en sont une source locale."),
        it("Bradykinine.", true, "Elle active directement les terminaisons nociceptives."),
        it("Prostaglandines.", true, "COX transforme l’acide arachidonique en prostanoïdes."),
        it("Thromboxane A2.", true, "La cyclooxygénase dégrade l’acide arachidonique des cellules lésées en prostaglandines, en thromboxane et en sérotonine."),
      ], ["b00048", "b00051", "b00061"], "Ions, amines, kinines et prostaglandines forment l’environnement algogène périphérique.", "L’examen confirme une inflammation locale sans collection ni complication chirurgicale."),
      qcm("Quels acteurs entretiennent l’extension de l’hypersensibilité ?", [
        it("Le magnésium bloquant le canal NMDA.", false, "Le magnésium obstrue le canal au repos et freine l’amplification, sa levée conditionnant la sensibilisation."),
        it("Le CGRP.", true, "Il contribue à vasodilatation et inflammation neurogène."),
        it("Un réflexe d’axone dans les branches voisines.", true, "Cette conduction antidromique propage localement la libération de neuropeptides."),
        it("Le NGF.", true, "Il sensibilise via les récepteurs Trk."),
        it("Une fermeture complète du portillon.", false, "Une inhibition totale réduirait plutôt la transmission."),
      ], ["b00051", "b00052", "b00058", "b00059"], "Le réflexe d’axone, le CGRP et le NGF étendent et entretiennent la sensibilisation périphérique.", "La douleur est maintenant provoquée par un contact léger autour de l’incision."),
      qcm("Quelle cible est cohérente pour réduire la composante inflammatoire ?", [
        it("La cyclooxygénase.", true, "Son inhibition réduit la synthèse des prostaglandines."),
        it("La prostaglandine synthase.", true, "Il s’agit d’un autre nom fonctionnel de la COX."),
        it("Les canaux sodiques par un bloc régional.", true, "Interrompre la conduction complète la stratégie."),
        it("Les cytokines pro-inflammatoires qui induisent la COX-2.", true, "Les cytokines IL-1, IL-6, IL-8 et le TNF-alpha induisent la cyclooxygénase de type 2 à l’origine des prostaglandines locales."),
        it("Une approche multimodale.", true, "Elle associe réduction de transduction et de conduction."),
      ], ["b00076", "b00078"], "AINS et anesthésie régionale ciblent respectivement inflammation et conduction.", "La fonction rénale est normale et aucune contre-indication plaquettaire ou digestive n’est identifiée."),
      qcm("Quels risques doivent rester associés à l’inhibition de COX-1 ?", [
        it("Irritation gastrique.", true, "COX-1 participe à la protection digestive."),
        it("Dépression respiratoire dose-dépendante.", false, "La dépression respiratoire relève des agonistes opioïdes et non de l’inhibition des cyclooxygénases."),
        it("Inhibition plaquettaire.", true, "Le thromboxane dépend de la voie COX."),
        it("Activation obligatoire des récepteurs μ.", false, "Ce n’est pas le mécanisme des AINS."),
        it("Aucun effet hors du site douloureux.", false, "L’inhibition enzymatique est systémique."),
      ], "b00076", "La cible anti-inflammatoire implique des risques digestifs, rénaux et plaquettaires à intégrer au terrain.", "Une dose d’AINS est envisagée en complément du paracétamol et de l’analgésie régionale."),
      qcm("Quels signes feraient craindre une sensibilisation centrale ?", [
        it("Une douleur disproportionnée et persistante.", true, "Elle suggère une hyperexcitabilité au-delà de la lésion."),
        it("Une extension de la zone douloureuse.", true, "La plasticité spinale peut élargir le champ récepteur du deuxième neurone."),
        it("Une réponse à des stimulations normalement peu nocives.", true, "La synapse hyperexcitable transforme alors un faible stimulus en douleur."),
        it("Une disparition de toute réponse au glutamate.", false, "Le glutamate reste le transmetteur majeur."),
        it("Une douleur strictement limitée aux berges de l’incision.", false, "Une douleur circonscrite au site lésé oriente vers une composante périphérique, la sensibilisation centrale élargissant le territoire."),
      ], "b00063", "Une douleur persistante, étendue et déclenchée par des faibles stimuli évoque une sensibilisation centrale.", "À J2, la douleur reste très élevée malgré la réduction des signes inflammatoires locaux."),
      qcm("Quelle stratégie limite la chronicisation ?", [
        it("Contrôler précocement la douleur intense.", true, "Cela réduit l’afflux répétitif vers la synapse."),
        it("Maintenir plusieurs cibles adaptées.", true, "La multimodalité limite l’escalade d’une seule classe."),
        it("Réévaluer fonction et territoire douloureux.", true, "L’évolution teste le mécanisme supposé."),
        it("Ignorer la composante émotionnelle.", false, "Elle participe à la perception et au risque persistant."),
        it("Réserver toute analgésie à la phase chronique.", false, "La prévention commence pendant la phase aiguë."),
      ], ["b00004", "b00039", "b00063", "b00067"], "Une prise en charge précoce, multimodale et réévaluée limite les déterminants périphériques, centraux et affectifs.", "Un suivi est organisé car la patiente décrit une anxiété importante et une limitation fonctionnelle."),
    ],
  },
  {
    title: "Douleur viscérale projetée",
    vignette: "Un patient de 61 ans est évalué au réveil d’une chirurgie abdominale haute. Il signale une douleur gênante de l’épaule alors que la cicatrice est peu sensible et que le membre supérieur n’a subi aucun traumatisme. La mobilisation passive de l’articulation reste complète et l’examen orthopédique est normal. L’équipe doit relier cette localisation trompeuse aux voies nociceptives avant de multiplier les examens locaux.",
    questions: [
      qcm("Quelles hypothèses neurophysiologiques sont pertinentes ?", [
        it("Une convergence viscéro-somatique.", true, "Les afférences partagent des neurones de deuxième ordre."),
        it("Une douleur référée.", true, "La perception est attribuée à un territoire somatique."),
        it("Une lésion obligatoire de l’articulation.", false, "L’examen normal et le contexte orientent vers une projection."),
        it("Un rôle de la lame V.", true, "Cette lame reçoit des afférences viscérales et somatiques."),
        it("Une absence totale de nociception viscérale.", false, "La chirurgie abdominale peut activer les afférences viscérales."),
      ], "b00027", "La douleur d’épaule peut être une projection viscérale liée à la convergence sur la lame V."),
      qcm("Quelles voies transportent les afférences viscérales ?", [
        it("Les afférences viscérales cheminant avec le sympathique.", true, "Le système sympathique véhicule une part majeure du message viscéral abdominal."),
        it("Les afférences associées aux voies parasympathiques.", true, "Ces fibres autonomes participent aussi au retour sensitif viscéral."),
        it("Les trajets splanchniques abdominaux.", true, "Les nerfs splanchniques constituent une voie afférente viscérale importante."),
        it("Des afférences convergeant sur la lame V médullaire.", true, "Cette lame reçoit à la fois des messages viscéraux et des entrées somatiques non nociceptives, base de la douleur référée."),
        it("Des fibres lentes mal localisées.", true, "Les fibres C contribuent à la diffusion de la douleur viscérale."),
      ], "b00020", "Les afférences viscérales cheminent avec les voies autonomes et splanchniques, souvent par fibres C.", "Une distension sous-diaphragmatique postopératoire est mise en évidence."),
      qcm("Quelles caractéristiques soutiennent une douleur viscérale ?", [
        it("Une localisation imprécise.", true, "Les voies viscérales sont peu discriminantes."),
        it("Un caractère profond.", true, "La seconde douleur est souvent décrite ainsi."),
        it("Une projection somatique.", true, "La convergence explique le territoire trompeur."),
        it("Une transmission majoritaire par des fibres amyéliniques lentes.", true, "Les fibres C non myélinisées dominent le message viscéral et expliquent sa lenteur."),
        it("Une dimension autonome possible.", true, "Les voies médiale et spinoréticulaire atteignent hypothalamus et réseaux autonomes."),
      ], ["b00020", "b00027", "b00038"], "La douleur viscérale est profonde, diffuse, souvent autonome et susceptible d’être projetée.", "Le patient présente aussi nausée, sueurs et malaise lors des pics douloureux."),
      qcm("Quelles voies ascendantes peuvent contribuer au caractère déplaisant ?", [
        it("La voie paléospinothalamique.", true, "Ses projections insulaires et cingulaires portent la dimension affective."),
        it("La voie spinoréticulaire.", true, "Elle produit une perception diffuse et désagréable."),
        it("L’insula et le cortex cingulaire.", true, "Ils intègrent la dimension affective."),
        it("Le thalamus médial d’où part le neurone de troisième ordre.", true, "Les projections de deuxième ordre se terminent dans les noyaux thalamiques médial et latéral, origine du troisième neurone."),
        it("L’hypothalamus via la formation réticulée.", true, "Ce relais participe aux réponses autonomes."),
      ], ["b00038", "b00039"], "Les voies médiales et spinoréticulaires relient le signal aux réseaux affectifs et autonomes.", "L’intensité sensorielle baisse, mais le patient décrit toujours une expérience très pénible."),
      qcm("Quels éléments doivent être intégrés à l’évaluation ?", [
        it("Le territoire perçu.", true, "Il reste utile même s’il ne localise pas la lésion."),
        it("La certitude d’une lésion de la coiffe des rotateurs.", false, "L’examen articulaire est normal et la douleur régresse avec la cause viscérale, ce qui écarte une atteinte de la coiffe."),
        it("Une somatotopie viscérale précise permettant de localiser l’organe atteint.", false, "La voie viscérale est peu discriminante, ce qui empêche une localisation précise de l’organe."),
        it("Le seul examen de l’épaule.", false, "Il ne suffit pas à expliquer la douleur référée."),
        it("La réponse au traitement de la cause viscérale.", true, "Elle teste l’hypothèse mécanistique."),
      ], ["b00003", "b00027", "b00039"], "Le raisonnement associe territoire, contexte, réponses autonomes et évolution après traitement causal.", "La décompression abdominale améliore rapidement la douleur de l’épaule."),
      qcm("Quelles interventions sont cohérentes avec une stratégie multimodale ?", [
        it("Considérer la douleur d’épaule comme un motif d’immobilisation prolongée du membre.", false, "La projection somatique ne relève pas d’une atteinte articulaire et l’immobilisation prolongée expose à des complications inutiles."),
        it("Remplacer le traitement de la cause par une sédation continue.", false, "La sédation masque l’expression de la douleur sans supprimer l’afflux nociceptif d’origine viscérale."),
        it("Utiliser un bloc si une composante somatique existe.", true, "La conduction pariétale peut être interrompue séparément."),
        it("Augmenter automatiquement un opioïde sans réévaluation.", false, "Le mécanisme causal doit être corrigé et la tolérance suivie."),
        it("Prescrire un anti-inflammatoire à forte dose pour bloquer la COX-1.", false, "Les faibles doses bloquent déjà la COX-1 responsable des effets indésirables, l’effet analgésique passant par la COX-2."),
      ], ["b00004", "b00067", "b00070", "b00078", "b00080"], "La multimodalité commence par le traitement de la source et ajoute des cibles pertinentes selon les composantes.", "Après correction de la distension, persiste une douleur pariétale modérée à l’incision."),
      qcm("Quelles leçons retenir de cette évolution ?", [
        it("La localisation ressentie peut tromper sur l’origine.", true, "La convergence produit une projection somatique."),
        it("Plusieurs composantes peuvent coexister.", true, "Viscérale et pariétale peuvent répondre différemment."),
        it("La réponse au traitement aide à distinguer les mécanismes.", true, "La disparition de la projection après décompression est informative."),
        it("Toute douleur d’épaule postopératoire est orthopédique.", false, "Le contexte doit faire rechercher une origine viscérale."),
        it("L’expérience douloureuse reste multidimensionnelle.", true, "Affect, autonomie et discrimination s’intègrent."),
      ], ["b00003", "b00027", "b00039"], "La projection, la coexistence des mécanismes et la réponse ciblée structurent le raisonnement clinique.", "La douleur pariétale répond ensuite au traitement local sans récidive de la douleur projetée."),
    ],
  },
  {
    title: "Douleur aiguë et sensibilisation centrale",
    vignette: "Un patient de 54 ans présente depuis une laparotomie une douleur postopératoire très intense, continue depuis vingt-quatre heures malgré des doses répétées d’un seul antalgique. La zone douloureuse s’élargit progressivement et un contact léger devient pénible autour de la cicatrice. L’examen ne retrouve pas de complication chirurgicale immédiate ; l’équipe redoute une amplification centrale liée à la répétition des influx.",
    questions: [
      qcm("Quels mécanismes sont à envisager ?", [
        it("Une stimulation nociceptive répétée.", true, "L’afflux persistant active la plasticité."),
        it("Une sensibilisation périphérique.", true, "La lésion inflammatoire abaisse le seuil local."),
        it("Une hyperexcitabilité centrale en cours d’installation.", true, "L’extension et la persistance évoquent une plasticité de la synapse spinale."),
        it("Une inhibition descendante nécessairement maximale.", false, "Le contrôle peut être insuffisant ou variable."),
        it("Un risque de chronicisation.", true, "La douleur postopératoire sévère est associée à ce risque."),
      ], ["b00004", "b00009", "b00056", "b00063"], "Une douleur intense et persistante peut alimenter des sensibilisations périphérique puis centrale."),
      qcm("Quel événement synaptique initie la transmission rapide ?", [
        it("La libération de glutamate.", true, "Le premier neurone libère ce neurotransmetteur."),
        it("L’activation AMPA.", true, "Elle dépolarise rapidement le deuxième neurone."),
        it("L’entrée présynaptique de Ca2+.", true, "Elle déclenche l’exocytose des vésicules."),
        it("Le bloc complet des canaux calciques.", false, "Cela réduirait la libération de glutamate."),
        it("Une dépolarisation postsynaptique.", true, "L’activation AMPA dépolarise la membrane et prépare la levée du bloc NMDA."),
      ], "b00063", "Le calcium présynaptique libère le glutamate, qui active AMPA et dépolarise le deuxième neurone.", "Les épisodes douloureux se répètent à chaque mobilisation malgré un traitement intermittent."),
      qcm("Comment le récepteur NMDA devient-il actif ?", [
        it("Son activation ferme les canaux calciques du deuxième neurone.", false, "L’ouverture du récepteur NMDA laisse entrer le calcium dans le deuxième neurone et accentue la transmission."),
        it("Un ion calcium obstrue son canal jusqu’à la dépolarisation.", false, "C’est un ion magnésium qui bloque le canal au repos, le calcium entrant une fois ce bloc levé."),
        it("Il siège sur la terminaison présynaptique du premier neurone.", false, "Ce récepteur canal se situe en postsynaptique, les canaux calciques voltage-dépendants occupant la face présynaptique."),
        it("Son ouverture précède l’activation des récepteurs AMPA par le glutamate.", false, "L’activation exagérée des récepteurs AMPA par le glutamate précède et conditionne celle des récepteurs NMDA."),
        it("La phosphorylation du récepteur permet le déplacement de l’ion magnésium.", true, "Cette activation par phosphorylation chasse le magnésium du canal et ouvre la voie au calcium."),
      ], "b00063", "La dépolarisation répétée lève le Mg2+, active NMDA et laisse entrer le Ca2+ postsynaptique.", "Le patient décrit désormais une douleur déclenchée par le simple contact du drap."),
      qcm("Quels acteurs non neuronaux peuvent entretenir l’état ?", [
        it("Une microglie activée dans la corne dorsale.", true, "Ses médiateurs peuvent renforcer et maintenir la transmission nociceptive."),
        it("Des mastocytes de la corne dorsale libérant de l’histamine.", false, "Les mastocytes dégranulent au site tissulaire lésé, la composante non neuronale spinale reposant sur la microglie et les astrocytes."),
        it("Des cellules immunitaires spinales.", true, "La corne dorsale comporte une composante neuro-immune."),
        it("Uniquement les érythrocytes.", false, "Ils ne constituent pas les acteurs centraux décrits."),
        it("Le BDNF issu des voies neurotrophiques.", true, "Ce médiateur favorise des modifications associées à la sensibilisation centrale."),
      ], ["b00027", "b00058", "b00063"], "La plasticité centrale implique neurones, microglie, astrocytes et médiateurs trophiques.", "La douleur persiste alors que l’examen de la plaie ne montre aucune complication évolutive."),
      qcm("Quelles classes ciblent directement cette synapse ?", [
        it("Les anti-NMDA.", true, "Ils réduisent le flux calcique postsynaptique."),
        it("Les inhibiteurs des cyclooxygénases agissant sur le tissu lésé.", false, "Leur cible enzymatique est périphérique et réduit la production de prostaglandines au site inflammatoire."),
        it("Les opioïdes.", true, "Ils inhibent la synapse avant et après la fente."),
        it("Les anesthésiques locaux uniquement par COX-1.", false, "Ils ciblent surtout les canaux Na+ axonaux."),
        it("Les agonistes α2.", true, "Ils hyperpolarisent les circuits de la corne dorsale."),
      ], ["b00080", "b00082", "b00084", "b00087"], "Anti-NMDA, opioïdes et agonistes α2 agissent sur des composantes distinctes de la première synapse spinale.", "L’équipe souhaite désormais cibler spécifiquement les mécanismes pré- et postsynaptiques responsables de l’hyperexcitabilité."),
      qcm("Quels principes corrigent l’échec d’une monothérapie ?", [
        it("Combiner des cibles périphériques et centrales complémentaires.", true, "La transmission comporte plusieurs relais simultanément actifs."),
        it("Réduire l’afflux périphérique.", true, "Un bloc ou un traitement inflammatoire diminue la source."),
        it("Cibler l’hyperexcitabilité centrale.", true, "NMDA et calcium synaptique sont des mécanismes pertinents."),
        it("Renforcer le contrôle inhibiteur descendant.", true, "Certains antalgiques visent à renforcer le pouvoir inhibiteur des voies descendantes sur la transmission spinale."),
        it("Réévaluer le territoire douloureux.", true, "L’évolution permet de suivre la sensibilisation."),
      ], ["b00004", "b00067", "b00070", "b00076", "b00078", "b00082"], "Une stratégie multimodale réduit la source, bloque la conduction et freine l’amplification centrale.", "Une équipe douleur met en place une analgésie régionale et plusieurs adjuvants adaptés au terrain."),
      qcm("Quels critères indiqueraient une amélioration mécanistique ?", [
        it("Une réduction de l’extension douloureuse.", true, "Le champ hypersensible se normalise."),
        it("Une augmentation de la surface d’allodynie mécanique.", false, "L’élargissement du territoire allodynique traduit une sensibilisation qui progresse."),
        it("Une meilleure mobilisation.", true, "Le retentissement fonctionnel s’améliore."),
        it("Une augmentation nécessaire de tous les médicaments.", false, "Une amélioration permet plutôt d’ajuster à la baisse."),
        it("Une diminution de la douleur spontanée.", true, "L’activité hyperexcitable de fond se réduit."),
      ], ["b00004", "b00063"], "La régression de l’allodynie, du territoire et du handicap témoigne d’un contrôle de la sensibilisation.", "À 48 heures, la douleur spontanée et la zone d’allodynie diminuent, permettant la marche."),
    ],
  },
  {
    title: "Bloc régional et relais nociceptifs",
    vignette: "Une patiente de 36 ans sans comorbidité majeure doit subir une chirurgie programmée du membre supérieur, réputée douloureuse au réveil. Une anesthésie locorégionale est prévue en complément de l’anesthésie générale et d’antalgiques systémiques. Avant l’intervention, l’équipe cartographie les relais accessibles — transduction, conduction et synapse — afin de construire une stratégie multimodale cohérente plutôt qu’une simple juxtaposition de traitements.",
    questions: [
      qcm("Quels objectifs mécanistiques justifient le bloc ?", [
        it("Interrompre la conduction axonale périphérique.", true, "Le bloc empêche le potentiel d’action d’atteindre la moelle."),
        it("Réduire l’afflux nociceptif spinal.", true, "Moins de décharges atteignent la première synapse."),
        it("Limiter l’activation répétée de NMDA.", true, "La prévention de l’afflux réduit le risque d’hyperexcitabilité."),
        it("Détruire définitivement le nerf.", false, "Un bloc anesthésique adapté interrompt temporairement la conduction sans neurolyse."),
        it("Compléter d’autres cibles antalgiques.", true, "Le bloc s’intègre à une multimodalité."),
      ], ["b00004", "b00063", "b00078"], "Le bloc réversible réduit la conduction, l’afflux spinal et l’amplification centrale."),
      qcm("Quelles propriétés de l’anesthésique local sont exactes ?", [
        it("Sa puissance dépend surtout de son affinité pour les récepteurs opioïdes spinaux.", false, "Liposolubilité, pKa et liaison protéique gouvernent son profil, le récepteur opioïde relevant d’une autre classe."),
        it("Il bloque le canal sodique depuis la face externe de la membrane.", false, "L’anesthésique local doit d’abord entrer dans la cellule nerveuse pour bloquer le canal sodique de l’intérieur."),
        it("Son effet est réversible.", true, "La conduction revient après décroissance de la concentration."),
        it("Il ouvre les récepteurs NMDA.", false, "Ce n’est pas son mécanisme principal."),
        it("Liposolubilité, pKa et liaison protéique modifient son profil.", true, "Ces propriétés distinguent les molécules."),
      ], "b00078", "L’anesthésique local traverse la membrane puis bloque réversiblement le canal Na+ interne.", "Le bloc est réalisé en injection périnerveuse sans complication immédiate."),
      qcm("Quels messages seraient préférentiellement interrompus ?", [
        it("La première douleur portée par Aδ.", true, "Le bloc empêche la conduction de ces petites fibres."),
        it("La seconde douleur portée par C.", true, "Les fibres C sont également bloquées."),
        it("Le potentiel d’action afférent.", true, "C’est la cible fonctionnelle directe."),
        it("Les afférences des terminaisons libres du territoire infiltré.", true, "Les terminaisons libres du territoire infiltré cessent d’envoyer leur message vers la moelle."),
        it("L’afflux nociceptif vers la corne dorsale.", true, "La synapse reçoit moins de glutamate."),
      ], ["b00020", "b00078"], "Le bloc interrompt les afférences Aδ et C avant leur arrivée dans la corne dorsale.", "Après injection, la patiente ne ressent plus le froid ni la piqûre dans le territoire opératoire."),
      qcm("Pourquoi maintenir d’autres antalgiques malgré le bloc ?", [
        it("Le bloc peut être incomplet ou s’estomper.", true, "La couverture périphérique varie dans le temps."),
        it("L’inflammation locale persiste.", true, "Le bloc ne supprime pas la production de prostaglandines."),
        it("La perception comporte des dimensions centrales.", true, "Affect et cognition ne sont pas supprimés par le seul bloc."),
        it("La multimodalité permet une synergie.", true, "Des relais différents sont couverts."),
        it("Le paracétamol agit surtout par un mécanisme central.", true, "Son effet analgésique est décrit comme plus central que périphérique, plusieurs systèmes y participant."),
      ], ["b00004", "b00039", "b00067", "b00069", "b00078"], "Un bloc couvre la conduction mais pas toute l’inflammation ni la perception ; les adjuvants restent ciblés.", "Un schéma de paracétamol et d’anti-inflammatoire est proposé en l’absence de contre-indication."),
      qcm("Quels mécanismes complètent le bloc dans ce schéma ?", [
        it("Le paracétamol agit surtout au centre.", true, "Son action n’est pas celle du canal Na+ périphérique."),
        it("L’AINS réduit les prostaglandines.", true, "Il freine la sensibilisation périphérique."),
        it("Les deux traitements reproduisent exactement le bloc.", false, "Paracétamol et AINS n’agissent pas sur le canal sodique ciblé par le bloc."),
        it("L’association vise une synergie.", true, "Elle couvre conduction et inflammation."),
        it("La surveillance rénale et digestive reste pertinente.", true, "Elle accompagne l’emploi d’un AINS."),
      ], "b00076", "Paracétamol et AINS complètent la conduction bloquée par des actions centrales et anti-inflammatoires.", "La chirurgie se déroule sans douleur et avec une faible consommation d’opioïde."),
      qcm("Quels signes évoqueraient la levée du bloc ?", [
        it("Le retour de la sensibilité thermique.", true, "Les afférences sensitives reprennent leur conduction."),
        it("Une paralysie motrice qui s’approfondit progressivement.", false, "La levée du bloc s’accompagne d’une récupération motrice, non d’un approfondissement de la paralysie."),
        it("Une douleur brûlante secondaire.", true, "Les fibres C reprennent aussi leur transmission."),
        it("La disparition définitive de toute fonction nerveuse.", false, "Le retour progressif est attendu après un bloc réversible."),
        it("Une diminution progressive de l’intensité douloureuse spontanée.", false, "La reprise de la conduction nociceptive fait remonter l’intensité douloureuse plutôt qu’elle ne la réduit."),
      ], ["b00020", "b00078"], "La récupération sensorielle annonce le retour des voies Aδ et C et impose d’anticiper le relais.", "Douze heures plus tard, la sensibilité revient progressivement et la douleur augmente."),
      qcm("Quels principes assurent une transition sûre ?", [
        it("Administrer le relais avant la douleur maximale.", true, "L’anticipation évite un afflux nociceptif brutal."),
        it("Attendre la disparition complète du bloc avant toute prescription systémique.", false, "Le relais doit être administré avant la levée complète pour éviter une rupture d’analgésie."),
        it("Doubler systématiquement la dose d’opioïde à la levée du bloc.", false, "La titration doit suivre l’intensité mesurée et la tolérance, un doublement systématique exposant à un surdosage."),
        it("Ignorer les effets indésirables puisque le bloc est levé.", false, "La surveillance dépend des agents systémiques."),
        it("Assimiler la disparition du bloc moteur à la fin de la douleur.", false, "La récupération motrice précède ou accompagne le retour des afférences nociceptives, sans marquer la fin de la douleur."),
      ], ["b00004", "b00067", "b00078"], "L’anticipation, l’éducation et la réévaluation évitent une rupture d’analgésie à la levée du bloc.", "Le relais est pris avant la disparition complète du bloc et la douleur reste contrôlée."),
    ],
  },
  {
    title: "Terrain à risque et choix des classes",
    vignette: "Un homme de 78 ans, insuffisant rénal chronique et traité au long cours par antiagrégant, doit être opéré d’une fracture douloureuse. Son terrain expose à des effets indésirables digestifs, rénaux et hémostatiques, tandis qu’une douleur postopératoire importante est prévisible. L’équipe souhaite limiter l’exposition à une classe unique et discuter des cibles périphériques, axonales et spinales compatibles avec une surveillance rapprochée.",
    questions: [
      qcm("Quels principes doivent précéder la prescription ?", [
        it("Retenir que l’effet analgésique des AINS s’obtient dès les plus faibles doses.", false, "Les faibles doses bloquent la COX-1 et ses effets indésirables, l’effet antalgique exigeant l’inhibition de la COX-2."),
        it("Intégrer le risque rénal et plaquettaire.", true, "Le terrain conditionne l’usage des AINS."),
        it("Considérer la COX-2 comme purement constitutive et sans induction inflammatoire.", false, "La COX-2 est à la fois constitutive et inductible par l’inflammation, à la différence de la COX-1."),
        it("Utiliser automatiquement un AINS à forte dose.", false, "Le risque rénal et plaquettaire impose la prudence."),
        it("Tenir le paracétamol pour un inhibiteur puissant des cyclooxygénases périphériques.", false, "Le paracétamol n’aurait que de faibles propriétés inhibitrices des cyclooxygénases et un effet plutôt central."),
      ], ["b00004", "b00067", "b00076"], "Le choix relie mécanisme, bénéfice attendu et vulnérabilités rénale, digestive et plaquettaire."),
      qcm("Pourquoi un AINS pose-t-il problème ici ?", [
        it("COX-1 participe à l’homéostasie rénale.", true, "Son inhibition peut aggraver la fonction rénale."),
        it("COX-1 intervient dans la fonction plaquettaire.", true, "L’inhibition peut majorer le risque hémorragique."),
        it("Il existe un risque digestif.", true, "La protection gastrique dépend en partie des prostaglandines."),
        it("Les AINS n’agissent jamais sur la douleur inflammatoire.", false, "C’est précisément leur bénéfice antalgique."),
        it("Le terrain doit modifier la balance bénéfice-risque.", true, "La cible pertinente ne suffit pas à autoriser la prescription."),
      ], "b00076", "L’inhibition des COX peut être efficace mais expose ce patient à des complications rénales, plaquettaires et digestives.", "La créatinine est supérieure à sa valeur habituelle et l’hémoglobine baisse après l’intervention."),
      qcm("Quelles alternatives mécanistiques restent possibles ?", [
        it("Une anesthésie régionale adaptée.", true, "Elle bloque la conduction sans dépendre de COX."),
        it("Le paracétamol.", true, "Son mécanisme surtout central diffère des AINS."),
        it("Un opioïde titré si nécessaire.", true, "Il freine la synapse mais exige une surveillance."),
        it("Un anti-NMDA selon le contexte.", true, "Il cible la sensibilisation centrale."),
        it("Ignorer toute analgésie.", false, "La douleur sévère expose à des complications et à la chronicisation."),
      ], ["b00004", "b00076", "b00078", "b00080", "b00082"], "Plusieurs relais peuvent être ciblés sans recourir automatiquement à l’inhibition des COX.", "Un bloc régional et du paracétamol sont instaurés ; une titration de secours est prévue."),
      qcm("Quels effets synaptiques explique la titration opioïde ?", [
        it("Moins de Ca2+ présynaptique.", true, "La baisse calcique réduit la fusion vésiculaire et l’exocytose du glutamate."),
        it("Moins de glutamate dans la fente.", true, "Le deuxième neurone est moins excité."),
        it("Une augmentation de la libération de substance P par le premier neurone.", false, "Le récepteur μ réduit l’entrée calcique présynaptique et donc la libération des neurotransmetteurs excitateurs."),
        it("Une stimulation de COX-2.", false, "Le récepteur μ module les canaux ioniques sans stimuler la cyclooxygénase."),
        it("Une activation des récepteurs NMDA du deuxième neurone.", false, "Le récepteur μ recrute une protéine G inhibitrice, il n’ouvre pas le canal NMDA postsynaptique."),
      ], "b00080", "L’opioïde inhibe la synapse nociceptive en pré- et postsynaptique via le récepteur μ.", "Lors de la première mobilisation, une faible titration opioïde est administrée sous surveillance et améliore rapidement la douleur dynamique."),
      qcm("Pourquoi éviter une escalade opioïde isolée ?", [
        it("Une dose plus élevée d’opioïde interrompt la conduction axonale du message.", false, "L’interruption de la conduction axonale relève des anesthésiques locaux, l’opioïde agissant sur la synapse spinale."),
        it("La conduction peut être traitée séparément.", true, "Un bloc réduit l’afflux sans augmenter l’opioïde."),
        it("La multimodalité épargne une classe.", true, "Des cibles complémentaires réduisent la dose nécessaire."),
        it("La perception est totalement indépendante de la dose.", false, "L’opioïde modifie la transmission mais sa réponse doit être évaluée."),
        it("L’escalade opioïde supprime la production périphérique de prostaglandines.", false, "Les prostaglandines dépendent de la voie des cyclooxygénases, que l’opioïde ne modifie pas."),
      ], ["b00004", "b00067", "b00078", "b00080"], "L’épargne opioïde repose sur la réduction de la source et de la conduction par des cibles complémentaires.", "La douleur augmente lors de la mobilisation mais reste faible au repos."),
      qcm("Quel ajustement correspond à cette douleur provoquée ?", [
        it("Renforcer l’anticipation avant mobilisation.", true, "La mobilisation déclenche un pic nociceptif prévisible qui peut être prétraité."),
        it("Évaluer la couverture du bloc.", true, "Une zone non couverte peut expliquer la douleur dynamique."),
        it("Ajouter automatiquement un AINS malgré l’aggravation rénale.", false, "Le risque est désormais défavorable."),
        it("Programmer une perfusion continue d’opioïde pour couvrir les pics de mobilisation.", false, "Une exposition continue augmente la dose totale sans mieux couvrir un pic prévisible, que l’anticipation ponctuelle traite mieux."),
        it("Réévaluer la fonction après intervention.", true, "La mobilisation est un critère clinique majeur."),
      ], ["b00004", "b00067", "b00076", "b00078", "b00080"], "La douleur dynamique appelle anticipation, contrôle du bloc et secours titré plutôt qu’une prescription indifférenciée.", "Le bloc est complété et une faible dose de secours permet la kinésithérapie."),
      qcm("Quelles conclusions résument la stratégie ?", [
        it("Le choix de la classe dépend du seul mécanisme, indépendamment du terrain.", false, "Une classe mécanistiquement pertinente peut être contre-indiquée par une vulnérabilité rénale ou digestive."),
        it("L’efficacité analgésique se juge sur la seule cotation au repos.", false, "La douleur dynamique et la capacité de mobilisation renseignent davantage sur l’efficacité réelle."),
        it("Une fonction rénale stabilisée autorise à reconduire indéfiniment l’AINS sans contrôle.", false, "L’exposition prolongée impose un suivi rénal, digestif et plaquettaire répété."),
        it("Les AINS sont dépourvus de risques rénaux.", false, "Le rein est une cible de leurs effets indésirables."),
        it("La stratégie doit être réévaluée.", true, "L’évolution conjointe de la douleur et du terrain impose des ajustements répétés."),
      ], ["b00004", "b00067", "b00076"], "Une analgésie sûre associe mécanisme, terrain, épargne de dose et objectif fonctionnel.", "La fonction rénale se stabilise et le patient marche avec une douleur acceptable."),
    ],
  },
  {
    title: "Douleur neuropathique après chirurgie",
    vignette: "Trois semaines après une thoracotomie, une patiente de 57 ans décrit des brûlures, des décharges électriques et une douleur déclenchée par le simple effleurement près de la cicatrice. La plaie est cicatrisée, sans rougeur ni collection, mais la gêne perturbe le sommeil et la mobilisation du bras. L’équipe doit distinguer conduction périphérique anormale, portillon spinal et sensibilisation centrale avant de choisir les adjuvants.",
    questions: [
      qcm("Quels éléments suggèrent une composante neuropathique et centrale ?", [
        it("Des brûlures.", true, "Elles sont compatibles avec une activité des petites fibres et une neuropathie."),
        it("Des décharges électriques.", true, "Elles évoquent une activité nerveuse ectopique."),
        it("Un soulagement complet obtenu par le seul anti-inflammatoire.", false, "Une composante neuropathique répond mal aux seuls inhibiteurs des cyclooxygénases."),
        it("Une douleur strictement proportionnelle à l’inflammation visible.", false, "Le tableau dépasse les signes tissulaires locaux."),
        it("Une persistance au-delà de la phase postopératoire immédiate.", true, "Elle fait craindre une plasticité durable."),
      ], ["b00004", "b00009", "b00056", "b00063"], "Brûlures, décharges et allodynie persistante évoquent une atteinte nerveuse et une sensibilisation centrale."),
      qcm("Quels mécanismes peuvent suivre une lésion nerveuse ?", [
        it("Une augmentation de l’excitabilité périphérique.", true, "Les canaux sodiques peuvent favoriser des décharges ectopiques."),
        it("Une sensibilisation limitée à la terminaison périphérique, sans participation spinale.", false, "La lésion nerveuse associe décharges ectopiques périphériques et amplification spinale glutamatergique et gliale."),
        it("Une activation NMDA.", true, "L’entrée calcique NMDA amplifie durablement l’excitabilité du deuxième neurone."),
        it("Une participation de la glie.", true, "Microglie et astrocytes peuvent maintenir le signal."),
        it("Une disparition complète des voies nociceptives.", false, "Le problème est une hyperexcitabilité, non une extinction."),
      ], ["b00053", "b00056", "b00063"], "La neuropathie peut associer ectopie périphérique, glutamate, NMDA et activation gliale.", "L’examen retrouve une zone hypoesthésique bordée d’une allodynie mécanique."),
      qcm("Quel rôle joue un neurone à large spectre ?", [
        it("Il reçoit des afférences Aβ, Aδ et C.", true, "Sa convergence explique une réponse à plusieurs modalités."),
        it("Il peut coder l’intensité par sa fréquence.", true, "Son activité augmente avec le stimulus."),
        it("Il peut contribuer à l’allodynie après plasticité.", true, "Une afférence tactile peut alors activer une voie douloureuse."),
        it("Il est exclusivement moteur.", false, "Il s’agit d’un neurone sensoriel de deuxième ordre."),
        it("Il est insensible à toute modulation.", false, "Le portillon et le contrôle descendant modifient son activité."),
      ], ["b00034", "b00035", "b00027"], "Le neurone à large spectre intègre plusieurs fibres et peut transformer un toucher en signal douloureux après sensibilisation.", "Un effleurement déclenche une douleur disproportionnée sans nouvelle lésion."),
      qcm("Quelles cibles sont cohérentes pour cette composante ?", [
        it("Les canaux sodiques TTX résistants du cortex somatosensitif.", false, "Ces canaux sodiques appartiennent à la membrane du nocicepteur périphérique et non au cortex."),
        it("Les récepteurs NMDA postsynaptiques hyperactifs.", true, "Leur inhibition cible directement l’hyperexcitabilité centrale."),
        it("Les canaux calciques voltage-dépendants du muscle squelettique.", false, "Les canaux calciques utiles ici sont ceux de la terminaison présynaptique du premier neurone sensitif."),
        it("Uniquement COX-1 plaquettaire.", false, "La douleur neuropathique ne se résume pas aux prostaglandines."),
        it("Le réflexe d’axone de la peau cicatricielle.", false, "Le réflexe d’axone concerne l’extension inflammatoire périphérique, distincte de la composante neuropathique visée ici."),
      ], ["b00040", "b00080", "b00082", "b00084"], "La composante neuropathique appelle des cibles synaptiques et modulatrices plutôt qu’une seule action anti-inflammatoire.", "L’équipe envisage un traitement adjuvant plutôt qu’une simple augmentation de l’AINS."),
      qcm("Comment agit un gabapentinoïde dans ce contexte ?", [
        it("Il inhibe la cyclooxygénase-2 induite par les cytokines.", false, "L’inhibition de COX-2 caractérise les anti-inflammatoires non stéroïdiens."),
        it("Il se fixe sur le récepteur μ couplé à une protéine G inhibitrice.", false, "Le récepteur μ est la cible des opioïdes, les gabapentinoïdes modulant les canaux calciques présynaptiques."),
        it("Il réduit l’activation AMPA postsynaptique.", true, "La baisse du glutamate disponible limite l’occupation des récepteurs AMPA."),
        it("Il bloque directement les canaux sodiques comme un anesthésique local.", false, "Le gabapentinoïde module les canaux calciques sans produire de bloc axonal sodique."),
        it("Il agit sur le récepteur postsynaptique NMDA en déplaçant le magnésium.", false, "Le gabapentinoïde agit en présynaptique sur les canaux calciques, le déplacement du magnésium relevant de l’activation NMDA."),
      ], ["b00084", "b00085"], "Les gabapentinoïdes réduisent le calcium présynaptique, la libération de glutamate et l’activation AMPA.", "La prégabaline est introduite avec une surveillance de la tolérance."),
      qcm("Quels éléments non pharmacologiques restent à intégrer ?", [
        it("L’éducation sur le mécanisme.", true, "Elle réduit les interprétations catastrophiques et soutient l’adhésion."),
        it("L’évaluation fonctionnelle.", true, "Le handicap mesure le retentissement réel."),
        it("La composante émotionnelle.", true, "Insula, cingulaire et préfrontal participent à la douleur."),
        it("Le suivi de la réponse au traitement et de ses effets indésirables.", true, "La réponse antalgique et la tolérance guident les ajustements dans la durée."),
        it("Le territoire neurologique.", true, "Il aide à documenter l’atteinte nerveuse."),
      ], ["b00003", "b00039"], "La prise en charge unit mécanisme, fonction, affect, éducation et suivi du territoire.", "La patiente craint une lésion progressive malgré une cicatrice normale."),
      qcm("Quels signes témoigneraient d’une évolution favorable ?", [
        it("Une diminution de l’allodynie.", true, "Le toucher redevient moins douloureux."),
        it("Une réduction du territoire brûlant.", true, "Le recul du territoire témoigne d’une régression de l’hyperexcitabilité."),
        it("Une meilleure utilisation du membre et du thorax.", true, "La fonction reflète le bénéfice clinique."),
        it("Une extension des décharges électriques.", false, "L’élargissement du territoire électrique indiquerait au contraire une aggravation."),
        it("Une baisse du retentissement émotionnel.", true, "La dimension affective est une composante réelle de l’amélioration."),
      ], ["b00003", "b00039", "b00063"], "La régression de l’allodynie, du territoire, du handicap et de la détresse signe une amélioration globale.", "Après plusieurs semaines, le contact vestimentaire est mieux toléré et le sommeil s’améliore."),
    ],
  },
  {
    title: "Patient ventilé et modulation descendante",
    vignette: "Un patient de 66 ans, ventilé en réanimation après une chirurgie majeure, est stable au repos sous sédation légère mais présente tachycardie, grimaces et raidissement lors des aspirations trachéales. Il ne peut pas communiquer verbalement et les soins doivent être répétés plusieurs fois par jour. L’équipe veut différencier sédation et analgésie, objectiver la réponse nociceptive puis anticiper les gestes suivants sans provoquer de surtraitement.",
    questions: [
      qcm("Quelles propositions structurent l’évaluation initiale ?", [
        it("La sédation profonde garantit à elle seule le contrôle de la nociception.", false, "La sédation supprime l’expression sans bloquer la transmission nociceptive."),
        it("Les signes comportementaux sont pertinents.", true, "Grimaces et réactions aux soins renseignent l’expérience."),
        it("Une tachycardie isolée affirme à elle seule une douleur.", false, "Les variations hémodynamiques manquent de spécificité et demandent une interprétation contextuelle."),
        it("La perception associe des dimensions sensitive, affective et cognitive.", true, "Le traitement cortical intègre discrimination, affect et évaluation du stimulus."),
        it("Un score verbal simple suffit chez ce patient non communicant.", false, "Une autoévaluation verbale est inutilisable ici, l’évaluation reposant sur des indicateurs comportementaux et physiologiques."),
      ], ["b00003", "b00004", "b00039"], "Chez le patient non communicant, l’expérience douloureuse reste multidimensionnelle et s’évalue sur le comportement et le contexte."),
      qcm("Quelles fibres participent au soin trachéal douloureux ?", [
        it("Les fibres Aβ de gros calibre pour la douleur brûlante retardée.", false, "La douleur brûlante retardée est portée par les fibres C amyéliniques, les Aβ transmettant le tact."),
        it("Les fibres C pour la douleur prolongée.", true, "Elles prolongent une sensation diffuse et brûlante."),
        it("Les afférences crâniennes ou spinales selon le territoire.", true, "Les nocicepteurs empruntent ces nerfs somatiques."),
        it("Uniquement les fibres motrices efférentes.", false, "La douleur dépend d’afférences sensitives."),
        it("Les corpuscules encapsulés de la muqueuse trachéale.", false, "Les nocicepteurs sont des terminaisons nerveuses libres, dépourvues d’organe encapsulé."),
      ], "b00020", "Le geste active des nocicepteurs libres et des afférences Aδ puis C.", "Une aspiration profonde déclenche une réponse immédiate suivie d’une agitation prolongée."),
      qcm("Quels relais expliquent la réponse autonome et affective ?", [
        it("La composante paléospinothalamique médiale.", true, "Elle porte les dimensions autonome et affective de ce soin."),
        it("Le trajet spinoréticulaire vers l’hypothalamus.", true, "Le relais réticulaire explique la réponse végétative diffuse."),
        it("L’insula intégrant le retentissement viscéro-affectif.", true, "Ce cortex participe à l’expérience interne et émotionnelle."),
        it("Le cingulaire antérieur codant le caractère pénible.", true, "Son activation contribue à la motivation d’évitement du geste."),
        it("Le noyau thalamique médial relayant vers ces réseaux.", true, "Le thalamus médial reçoit la voie paléospinothalamique et projette vers les cortex affectifs."),
      ], ["b00038", "b00039"], "Les voies médiales relient le stimulus aux réponses autonomes et au caractère déplaisant.", "Les réponses végétatives persistent malgré une sédation légère."),
      qcm("Quels circuits peuvent inhiber le signal ?", [
        it("La substance grise périaqueducale mésencéphalique.", true, "Elle organise le contrôle descendant à partir des entrées supérieures."),
        it("Le relais inhibiteur du noyau raphé magnus.", true, "Ses fibres descendantes atteignent les lames II et III de la corne dorsale."),
        it("Des interneurones inhibiteurs spinaux.", true, "Leur activation diminue le passage du message vers le deuxième neurone."),
        it("Les fibres tactiles Aβ.", true, "Elles peuvent renforcer l’inhibition locale."),
        it("Une destruction du thalamus.", false, "L’analgésie physiologique ne repose pas sur une lésion cérébrale."),
      ], ["b00027", "b00029", "b00040", "b00042"], "Le frein associe afférences tactiles, interneurones et système périaqueducal-raphé.", "L’équipe regroupe les soins, explique le geste et applique une stimulation cutanée non douloureuse."),
      qcm("Quels mécanismes pharmacologiques peuvent compléter cette prévention ?", [
        it("Un opioïde augmente la libération présynaptique de glutamate.", false, "Le récepteur μ inhibe les canaux calciques présynaptiques et diminue la libération de glutamate."),
        it("Un agoniste α2 agit surtout en bloquant les canaux sodiques axonaux.", false, "Les agonistes α2 activent des récepteurs couplés aux protéines G qui hyperpolarisent les neurones convergents de la corne dorsale."),
        it("Un anti-NMDA peut réduire l’hyperexcitabilité.", true, "Il limite l’entrée calcique postsynaptique."),
        it("Un AINS détruit les fibres C.", false, "Il réduit les prostaglandines sans détruire les fibres."),
        it("Un anti-inflammatoire non stéroïdien bloque la transmission à la première synapse.", false, "Les inhibiteurs des cyclooxygénases réduisent la production périphérique de prostaglandines, la synapse spinale relevant d’autres cibles."),
      ], ["b00076", "b00080", "b00082", "b00087"], "Opioïdes, α2 et anti-NMDA freinent des relais distincts mais exigent une titration contextualisée.", "Une analgésie anticipée est administrée avant le soin suivant."),
      qcm("Quels critères comparent l’efficacité entre deux soins ?", [
        it("Une augmentation de la fréquence des aspirations trachéales.", false, "Multiplier les gestes nociceptifs accroît l’afflux douloureux sans renseigner sur l’efficacité antalgique."),
        it("Une élévation de la pression artérielle pendant le soin.", false, "Une poussée hypertensive per-procédure évoque un contrôle insuffisant plutôt qu’une amélioration."),
        it("Une profondeur de sédation plus importante entre les soins.", false, "La sédation ne mesure pas le contrôle nociceptif et peut masquer l’expression de la douleur."),
        it("L’absence de toute surveillance respiratoire.", false, "Les traitements peuvent imposer une surveillance accrue."),
        it("La possibilité de poursuivre le soin sans détresse.", true, "L’objectif fonctionnel du geste est atteint."),
      ], ["b00003", "b00004"], "Le bénéfice se juge sur comportement, physiologie, récupération et faisabilité du soin.", "Lors du soin suivant, les grimaces et la tachycardie sont nettement réduites."),
      qcm("Quelles conclusions doivent guider la suite ?", [
        it("Réserver l’analgésie aux seuls gestes provoquant une réaction visible.", false, "Un geste nociceptif justifie une prévention même en l’absence de réaction comportementale marquée."),
        it("Réévaluer même en l’absence de parole.", true, "Les indicateurs indirects permettent un suivi."),
        it("Standardiser une dose unique d’opioïde pour tous les soins.", false, "L’intensité du geste, le terrain et la réponse imposent une titration individualisée."),
        it("Assimiler sédation et analgésie.", false, "La sédation ne garantit pas le contrôle nociceptif."),
        it("Considérer qu’un protocole écrit dispense de réévaluer chaque soin.", false, "Le protocole encadre la prescription, la réévaluation restant nécessaire à chaque geste."),
      ], ["b00003", "b00004", "b00063"], "Une prise en charge fiable anticipe, distingue analgésie et sédation, réévalue et documente la réponse.", "Le protocole individualisé est intégré aux prescriptions de soins répétitifs."),
    ],
  },
];

function buildDpQcm() {
  return DP_QCM.map((series, index) => ({
    label: `DP QCM ${index + 1} · ${series.title}`,
    allowed_voies: ["interne"],
    vignette: series.vignette,
    questions: series.questions,
  }));
}

const ISOLATED_QROC = [
  { title: "Définitions et étapes", questions: [
    qroc("Quelles deux dimensions sont indissociables dans la définition de la douleur ?", "sensitive et émotionnelle|sensorielle et affective", "b00003", "La douleur n’est pas un signal pur : elle associe sensation et caractère déplaisant."),
    qroc("Quel terme désigne la conversion d’un stimulus nocif en potentiel d’action ?", "transduction", "b00013", "La transduction est la première étape de la nociception."),
    qroc("Citez les quatre étapes de l’intégration douloureuse.", "transduction, transmission, modulation et perception", ["b00012", "b00013", "b00014", "b00016", "b00018"], "Ces quatre opérations structurent la voie du stimulus à l’expérience."),
    qroc("Entre quelles semaines se forment les connexions thalamo-corticales ?", "entre la 21e et la 28e semaine", "b00007", "Ce relais rend possible l’accès aux réseaux corticaux de perception."),
    qroc("Quel risque à long terme est associé à une douleur postopératoire sévère ?", "la chronicisation douloureuse|une douleur chronique", "b00004", "Une douleur aiguë intense et persistante favorise la plasticité du système."),
  ] },
  { title: "Fibres et premier neurone", questions: [
    qroc("Quelle fibre transmet la première douleur rapide ?", "la fibre Aδ|la fibre A delta", "b00020", "Sa faible myélinisation permet une conduction plus rapide que celle des fibres C."),
    qroc("Quelle fibre transmet la seconde douleur brûlante ?", "la fibre C", "b00020", "Cette fibre amyélinique conduit lentement une douleur diffuse."),
    qroc("Où siège le corps cellulaire du premier neurone nociceptif ?", "dans le ganglion spinal|dans le ganglion rachidien", "b00020", "Le neurone primaire relie le nocicepteur à la corne dorsale."),
    qroc("Quel tractus permet un trajet d’un à deux métamères avant la corne dorsale ?", "le tractus de Lissauer", ["b00023", "b00024", "b00025"], "Certaines afférences y montent ou descendent avant leur relais."),
    qroc("Quel type anatomique de terminaison est un nocicepteur ?", "une terminaison nerveuse libre", "b00020", "Il ne possède pas d’organe encapsulé spécialisé."),
  ] },
  { title: "Corne dorsale", questions: [
    qroc("Quelles trois lames reçoivent surtout les afférences nociceptives ?", "I, II et V|lames 1, 2 et 5", ["b00020", "b00027"], "Ces couches concentrent les relais nociceptifs majeurs."),
    qroc("Comment se nomme la lame II de la corne dorsale ?", "substantia gelatinosa|substance gélatineuse", "b00027", "Cette couche est riche en circuits inhibiteurs et récepteurs opioïdes."),
    qroc("Quelle lame explique la convergence viscéro-somatique ?", "la lame V|la lame 5", "b00027", "Elle reçoit afférences viscérales et somatiques."),
    qroc("Quel phénomène clinique résulte de cette convergence ?", "la douleur référée|la douleur projetée", "b00027", "Le cerveau attribue un message viscéral à un territoire somatique."),
    qroc("Quel nom porte le modèle de Melzack et Wall ?", "la théorie du portillon|gate control", ["b00027", "b00029"], "Il décrit la balance entre excitation et inhibition dans la corne dorsale."),
  ] },
  { title: "Voies et cortex", questions: [
    qroc("Quel noyau thalamique reçoit la voie néospinothalamique ?", "le noyau ventral postérolatéral|le VPL", "b00038", "Ce relais projette ensuite vers le cortex somatosensitif primaire."),
    qroc("Quelle dimension porte surtout la voie spinothalamique latérale ?", "la dimension sensitivo-discriminative", "b00038", "Elle code localisation, intensité et qualité."),
    qroc("Quelle voie donne une perception diffuse et déplaisante ?", "la voie spinoréticulaire", "b00038", "Sa faible somatotopie et ses relais réticulaires expliquent ce profil."),
    qroc("Quels deux cortex portent surtout la dimension affective ?", "l’insula et le cortex cingulaire antérieur", "b00039", "Ils contribuent au caractère désagréable de la douleur."),
    qroc("Quel cortex participe à mémoire et évaluation du stimulus ?", "le cortex préfrontal", "b00039", "Il relie l’expérience actuelle aux représentations cognitives."),
  ] },
  { title: "Modulation descendante", questions: [
    qroc("Quelles deux structures du tronc cérébral fondent l’inhibition descendante ?", "substance grise périaqueducale et noyau raphé magnus", ["b00040", "b00041"], "Elles organisent le frein descendant vers la corne dorsale."),
    qroc("Dans quelles lames projette le noyau raphé magnus ?", "les lames II et III|les couches 2 et 3", "b00042", "Ses axones y modulent le premier relais nociceptif."),
    qroc("Quelle fibre tactile favorise la fermeture du portillon ?", "la fibre Aβ|la fibre A bêta", "b00029", "Elle recrute les circuits inhibiteurs de la substantia gelatinosa."),
    qroc("Quel dispositif antalgique exploite la stimulation sensitive périphérique ?", "le TENS|la neurostimulation électrique transcutanée", "b00029", "Il renforce l’inhibition segmentaire du message."),
    qroc("Citez un des trois modes d’action du contrôle descendant.", "inhibition directe|inhibition des axones excitateurs|activation des interneurones inhibiteurs", ["b00042", "b00043", "b00044"], "Le frein agit à la fois sur la cellule, la présynapse et les interneurones."),
  ] },
  { title: "Sensibilisations", questions: [
    qroc("Comment nomme-t-on l’ensemble des médiateurs libérés autour d’une lésion ?", "la soupe inflammatoire", ["b00048", "b00051"], "Ions, histamine, bradykinine et prostaglandines activent les nocicepteurs."),
    qroc("Quels deux neuropeptides entretiennent l’inflammation neurogène ?", "substance P et CGRP", "b00058", "Ils sont libérés par les nocicepteurs peptidergiques."),
    qroc("Quel mécanisme étend l’inflammation aux tissus voisins ?", "le réflexe d’axone", ["b00051", "b00052", "b00059"], "Les branches périphériques propagent la libération de neuropeptides."),
    qroc("Quel ion bloque le canal NMDA au repos ?", "le magnésium|Mg2+", "b00063", "Le magnésium obture le canal au repos ; une dépolarisation répétée lève ce bloc."),
    qroc("Quel ion entre dans le deuxième neurone après activation NMDA ?", "le calcium|Ca2+", "b00063", "Cette entrée soutient hyperexcitabilité et plasticité."),
  ] },
  { title: "Cibles pharmacologiques", questions: [
    qroc("Quelle enzyme est ciblée par les AINS ?", "la cyclooxygénase|la COX", "b00076", "Son inhibition réduit la synthèse des prostaglandines."),
    qroc("Quelle cible axonale bloquent les anesthésiques locaux ?", "les canaux sodiques|les canaux Na+", "b00078", "Le bloc interne interrompt réversiblement le potentiel d’action."),
    qroc("Quel récepteur opioïde est principalement décrit ?", "le récepteur μ|le récepteur mu", "b00080", "Ce récepteur couplé à Gi inhibe la synapse nociceptive."),
    qroc("Citez un agent anti-NMDA.", "kétamine|protoxyde d’azote|dextrométhorphane", ["b00081", "b00082"], "Ces agents réduisent le flux calcique postsynaptique."),
    qroc("Quels deux médicaments sont des gabapentinoïdes ?", "gabapentine et prégabaline", "b00084", "Ils réduisent l’entrée de calcium présynaptique."),
  ] },
  { title: "Analgésie multimodale", questions: [
    qroc("Quel est le principal effet présynaptique d’un opioïde μ ?", "la diminution de l’entrée de calcium et de la libération de glutamate", "b00080", "La terminaison primaire libère moins de neurotransmetteur excitateur."),
    qroc("Quel est le principal effet postsynaptique d’un opioïde μ ?", "l’ouverture des canaux potassiques et l’hyperpolarisation", "b00080", "La sortie de K+ rend le deuxième neurone moins excitable."),
    qroc("Quelle cible présynaptique utilisent les gabapentinoïdes ?", "les canaux calciques voltage-dépendants", "b00084", "La baisse du Ca2+ réduit l’exocytose du glutamate."),
    qroc("Citez les deux agonistes α2 décrits.", "clonidine et dexmédétomidine", "b00087", "Ils hyperpolarisent les circuits de la corne dorsale."),
    qroc("Quel principe distingue multimodalité et simple accumulation ?", "l’association raisonnée de cibles complémentaires", ["b00004", "b00067", "b00070"], "Chaque traitement doit répondre à un relais utile et au terrain."),
  ] },
];

function buildIsolatedQroc() {
  return ISOLATED_QROC.map((series, index) => ({
    label: `QROC ${index + 1} · ${series.title}`,
    allowed_voies: ["externe"],
    questions: series.questions,
  }));
}

const DP_QROC = [
  {
    title: "Ponction répétée chez un prématuré",
    vignette: "Un prématuré de 25 semaines d’aménorrhée, stable en couveuse, subit plusieurs prélèvements capillaires quotidiens au talon. Cet enfant présente des grimaces et une agitation prolongée après certains soins, alors qu’aucune prévention systématique n’est prescrite. L’équipe souhaite expliquer la maturation des voies, suivre les réponses comportementales et physiologiques, puis construire un protocole adapté à chaque geste répété avec ses parents.",
    questions: [
      qroc("À partir de quel terme les connexions thalamo-corticales commencent-elles à exister ?", "à partir de la 21e semaine|vers 21 semaines", "b00007", "Elles se mettent en place entre 21 et 28 semaines."),
      qroc("Quel type de terminaison cutanée transduit la ponction ?", "une terminaison nerveuse libre|un nocicepteur", "b00020", "Le nocicepteur cutané convertit le stimulus mécanique en potentiel d’action.", "La peau du talon est intacte mais la ponction déclenche une réaction immédiate."),
      qroc("Quelle fibre explique la réponse aiguë et rapide ?", "la fibre Aδ|A delta", "b00020", "Cette fibre peu myélinisée porte la première douleur.", "Une grimace et une accélération cardiaque apparaissent dès l’aiguille."),
      qroc("Quelle fibre explique la réaction plus lente et prolongée ?", "la fibre C", "b00020", "La fibre C amyélinique porte la seconde douleur brûlante et diffuse.", "L’agitation persiste après le retrait de l’aiguille."),
      qroc("Quel mécanisme spinal peut diminuer le passage du message ?", "la fermeture du portillon|l’activation d’interneurones inhibiteurs", ["b00027", "b00029"], "Les afférences tactiles et le contrôle descendant renforcent l’inhibition.", "Une stimulation tactile douce est appliquée autour du talon avant le geste suivant."),
      qroc("Pourquoi faut-il éviter la répétition non prévenue des gestes ?", "pour limiter la sensibilisation centrale|pour éviter l’activation NMDA", ["b00004", "b00063"], "Les décharges répétées peuvent lever le bloc magnésium du NMDA.", "Les soins sont regroupés mais plusieurs ponctions restent nécessaires."),
      qroc("Quel principe général doit guider le protocole ?", "une analgésie préventive multimodale et réévaluée", ["b00004", "b00067"], "Plusieurs relais doivent être couverts avec une surveillance adaptée au terme.", "Après mise en place du protocole, les réactions comportementales et physiologiques diminuent."),
    ],
  },
  {
    title: "Hyperalgésie autour d’une cicatrice",
    vignette: "À J1 d’une laparotomie, une patiente de 44 ans décrit une douleur brûlante et une hypersensibilité qui déborde largement les berges de l’incision. La plaie est sèche, mais la peau voisine est rouge et chaude et le simple contact du vêtement devient pénible. L’équipe doit distinguer sensibilisation périphérique, inflammation neurogène et début d’amplification centrale afin de cibler le traitement et la surveillance.",
    questions: [
      qroc("Comment nomme-t-on l’abaissement du seuil des nocicepteurs autour de la lésion ?", "la sensibilisation périphérique", ["b00053", "b00056"], "Les médiateurs inflammatoires rendent la terminaison plus excitable."),
      qroc("Quel ensemble chimique déclenche cette sensibilisation ?", "la soupe inflammatoire", ["b00048", "b00051"], "Ions, histamine, bradykinine et prostaglandines activent la terminaison.", "La plaie est rouge et chaude sans signe d’infection profonde."),
      qroc("Quel mécanisme étend l’inflammation en tache d’huile ?", "le réflexe d’axone", ["b00051", "b00052", "b00059"], "La libération périphérique de neuropeptides atteint les tissus voisins.", "La zone hypersensible s’étend alors que la lésion reste limitée à l’incision."),
      qroc("Quels deux peptides participent à cette inflammation neurogène ?", "substance P et CGRP", "b00058", "Les nocicepteurs peptidergiques produisent ces deux médiateurs.", "La peau périphérique devient rouge et douloureuse au contact."),
      qroc("Quelle enzyme doit être inhibée pour réduire les prostaglandines ?", "la cyclooxygénase|la COX", "b00076", "Les AINS ciblent cette voie de l’acide arachidonique.", "La fonction rénale et l’hémostase permettent un anti-inflammatoire."),
      qroc("Quel mécanisme fait craindre une chronicisation si la douleur reste intense ?", "la sensibilisation centrale par activation NMDA", "b00063", "L’entrée postsynaptique de Ca2+ entretient l’hyperexcitabilité.", "À J2, un simple effleurement provoque encore une douleur majeure."),
      qroc("Quel principe thérapeutique associer à la cible inflammatoire ?", "une analgésie multimodale|associer des cibles complémentaires", ["b00004", "b00067", "b00070"], "La réduction de l’inflammation doit être complétée par des actions sur conduction et synapse.", "Une stratégie régionale et systémique réduit ensuite le territoire douloureux."),
    ],
  },
  {
    title: "Douleur d’épaule d’origine viscérale",
    vignette: "Après une chirurgie sous-diaphragmatique, un patient de 63 ans ressent une douleur isolée de l’épaule, mal systématisée et associée à des nausées. Aucune traction du membre n’a été rapportée, la mobilisation reste libre et l’examen articulaire est normal. L’équipe s’interroge sur une origine viscérale projetée et doit expliquer les relais médullaires, autonomes et corticaux avant de rechercher puis traiter la cause.",
    questions: [
      qroc("Quel phénomène explique cette localisation trompeuse ?", "une douleur référée|une douleur projetée", "b00027", "Un viscère et un territoire somatique convergent sur le même relais spinal."),
      qroc("Quelle lame médullaire porte surtout cette convergence ?", "la lame V|la lame 5", "b00027", "Elle reçoit à la fois afférences viscérales et somatiques.", "Une distension viscérale est suspectée sous le diaphragme."),
      qroc("Par quels nerfs cheminent les afférences viscérales ?", "sympathiques, parasympathiques et splanchniques", "b00020", "Ces voies autonomes transportent le message vers la moelle.", "La douleur s’accompagne de nausées et de sueurs."),
      qroc("Quelle voie ascendante contribue à la réponse autonome diffuse ?", "la voie spinoréticulaire", "b00038", "Elle projette via la formation réticulée vers thalamus et hypothalamus.", "La localisation reste imprécise malgré une intensité élevée."),
      qroc("Quels deux cortex contribuent au caractère déplaisant ?", "l’insula et le cortex cingulaire antérieur", "b00039", "Ils intègrent la dimension affective de la douleur.", "Le patient décrit surtout une expérience pénible et angoissante."),
      qroc("Quel geste teste le mécanisme causal ?", "traiter ou décomprimer la cause viscérale", ["b00027", "b00067"], "La disparition de la projection après correction confirme l’hypothèse.", "La distension abdominale est corrigée et la douleur de l’épaule chute."),
      qroc("Quelle autre composante doit être recherchée ensuite ?", "une douleur somatique pariétale|une douleur de l’incision", ["b00020", "b00027"], "Viscéral et somatique peuvent coexister et nécessiter des cibles distinctes.", "Une douleur localisée persiste uniquement sur la cicatrice."),
    ],
  },
  {
    title: "Portillon et mobilisation douloureuse",
    vignette: "Un patient de 52 ans débute la rééducation après une chirurgie du genou. La cicatrice est saine, mais les mobilisations déclenchent une douleur rapide suivie d’une brûlure plus diffuse qui limite les exercices. Le kinésithérapeute propose une stimulation électrique transcutanée produisant des paresthésies non douloureuses autour de l’articulation. L’équipe doit préciser ce que le portillon peut moduler et ce qu’il ne traite pas.",
    questions: [
      qroc("Quel modèle neurophysiologique justifie le TENS ?", "la théorie du portillon|gate control", ["b00027", "b00029"], "La stimulation tactile recrute une inhibition segmentaire."),
      qroc("Quelle fibre sensitive est principalement recherchée par cette stimulation ?", "la fibre Aβ|A bêta", "b00029", "Les afférences tactiles Aβ favorisent la fermeture du portillon.", "La stimulation produit des paresthésies non douloureuses autour du genou."),
      qroc("Dans quelle région médullaire se situe ce portillon ?", "la corne dorsale|la substantia gelatinosa", "b00027", "Le premier relais spinal intègre excitation et inhibition.", "La stimulation est appliquée sur le même territoire segmentaire que la douleur."),
      qroc("Quelles fibres nociceptives favorisent l’ouverture du portillon ?", "les fibres Aδ et C", ["b00028", "b00029"], "Leurs décharges excitent les neurones de deuxième ordre.", "La flexion forcée déclenche une douleur rapide puis brûlante."),
      qroc("Quel autre système peut fermer le portillon ?", "le système inhibiteur descendant", ["b00029", "b00040"], "Il projette depuis le tronc cérébral vers la corne dorsale.", "L’explication du geste et la diminution de l’anxiété améliorent aussi la tolérance."),
      qroc("Quelle limite impose une douleur inflammatoire persistante ?", "traiter aussi la source périphérique|associer une cible anti-inflammatoire", ["b00048", "b00076"], "Le TENS module le relais sans supprimer les prostaglandines de la lésion.", "Le genou reste chaud et inflammatoire après l’exercice."),
      qroc("Quel principe résume la prise en charge finale ?", "associer modulation segmentaire et traitement causal dans une stratégie multimodale", ["b00004", "b00067"], "Le portillon complète mais ne remplace pas les autres cibles.", "Le patient progresse avec TENS, traitement de l’inflammation et mobilisation adaptée."),
    ],
  },
  {
    title: "Douleur persistante et réseaux corticaux",
    vignette: "Deux mois après une chirurgie, une patiente de 48 ans garde une douleur d’intensité modérée mais très invalidante, aggravée par l’attention portée à la zone et par l’anxiété anticipatoire. La cicatrice est consolidée et aucun événement local n’explique à lui seul le retentissement sur le sommeil, la marche et la reprise du travail. L’évaluation doit relier discrimination sensorielle, affect, mémoire et modulation descendante sans nier la douleur vécue.",
    questions: [
      qroc("Pourquoi la nociception seule n’explique-t-elle pas ce retentissement ?", "la douleur intègre des dimensions affective et cognitive", ["b00003", "b00039"], "L’expérience vécue dépend de réseaux dépassant la voie sensorielle."),
      qroc("Quels cortex codent surtout la dimension discriminative ?", "les cortex somatosensitifs primaire et secondaire", "b00039", "Ils analysent localisation, intensité et qualité.", "La patiente localise précisément la douleur mais la juge très menaçante."),
      qroc("Quels réseaux codent surtout la dimension affective ?", "l’insula et le cortex cingulaire antérieur", ["b00038", "b00039"], "Ils participent au caractère pénible et émotionnel.", "L’anxiété augmente nettement le caractère désagréable."),
      qroc("Quel cortex intervient dans mémoire et évaluation du stimulus ?", "le cortex préfrontal", ["b00009", "b00039"], "Il met en relation douleur, attente et expérience passée.", "La patiente anticipe une douleur majeure avant chaque mouvement."),
      qroc("Quel système relie ces centres à la modulation spinale ?", "le système inhibiteur descendant", ["b00009", "b00040"], "Les centres supérieurs influencent substance grise périaqueducale et raphé.", "Une stratégie attentionnelle réduit la douleur pendant un exercice identique."),
      qroc("Quel mécanisme central peut maintenir l’hypersensibilité ?", "l’activation NMDA et la sensibilisation centrale", "b00063", "La plasticité synaptique prolonge le signal au-delà de la lésion initiale.", "Un toucher léger reste douloureux sur un territoire élargi."),
      qroc("Quel objectif doit compléter la baisse du score douloureux ?", "l’amélioration fonctionnelle et émotionnelle", ["b00003", "b00039"], "La douleur est multidimensionnelle et doit être suivie dans ses conséquences.", "Le programme vise sommeil, marche et réduction de la peur du mouvement."),
    ],
  },
  {
    title: "Échec partiel d’une infiltration locale",
    vignette: "Chez une patiente de 39 ans, une infiltration d’anesthésique local soulage nettement la composante superficielle d’une cicatrice, mais une douleur profonde et brûlante persiste pendant la mobilisation. La zone douloureuse dépasse le territoire anesthésié et reste sensible à un contact léger. L’équipe doit interpréter cet échec partiel en distinguant conduction axonale, libération présynaptique et hyperexcitabilité postsynaptique.",
    questions: [
      qroc("Quelle cible l’infiltration bloque-t-elle ?", "les canaux sodiques axonaux|les canaux Na+", "b00078", "L’anesthésique local interrompt réversiblement la conduction."),
      qroc("Pourquoi le blocage est-il dit réversible ?", "la conduction reprend lorsque le produit quitte sa cible", "b00078", "Le nerf n’est pas détruit par une anesthésie locale adaptée.", "La sensibilité cutanée disparaît puis revient plusieurs heures plus tard."),
      qroc("Quelle fibre explique la douleur brûlante persistante ?", "la fibre C", "b00020", "Elle transmet la seconde douleur lente, profonde et mal localisée.", "La douleur superficielle a disparu mais une brûlure profonde demeure."),
      qroc("Quel mécanisme central peut expliquer la persistance malgré le bloc périphérique ?", "une sensibilisation centrale|une activation NMDA", "b00063", "La synapse peut rester hyperexcitable après un afflux antérieur prolongé.", "La zone douloureuse dépasse maintenant le territoire infiltré."),
      qroc("Quelle classe réduit le calcium présynaptique et le glutamate ?", "les gabapentinoïdes|gabapentine|prégabaline", ["b00084", "b00085"], "Ils diminuent l’exocytose excitatrice à la première synapse.", "Un adjuvant central est discuté devant la composante neuropathique."),
      qroc("Quelle classe réduit le flux calcique postsynaptique NMDA ?", "les anti-NMDA|la kétamine", "b00082", "Elle freine l’hyperexcitabilité du deuxième neurone.", "La douleur reste majeure malgré une réduction de la libération présynaptique."),
      qroc("Quel principe explique l’association de ces approches ?", "l’analgésie multimodale|le ciblage de relais complémentaires", ["b00067", "b00070"], "Conduction, présynapse et postsynapse sont des cibles distinctes.", "La combinaison adaptée améliore la mobilisation sans escalade d’une seule classe."),
    ],
  },
  {
    title: "Choix antalgique chez un patient fragile",
    vignette: "Un patient de 81 ans, insuffisant rénal chronique et traité par antiagrégant, doit recevoir une analgésie postopératoire après chirurgie osseuse. Il est fragile mais autonome avant la fracture et l’objectif fonctionnel est une mobilisation précoce sans majorer le risque digestif, rénal ou hémorragique. L’équipe dispose d’une technique régionale et souhaite organiser une épargne médicamenteuse fondée sur des cibles complémentaires.",
    questions: [
      qroc("Quelle enzyme ciblent les AINS ?", "la cyclooxygénase|la COX", "b00076", "L’inhibition diminue les prostaglandines périphériques."),
      qroc("Quels trois risques de COX-1 sont particulièrement pertinents ?", "gastrique, rénal et plaquettaire", ["b00058", "b00076"], "Ils rendent l’AINS défavorable sur ce terrain.", "La créatinine augmente et le patient reçoit un antiagrégant."),
      qroc("Quelle classe peut interrompre la conduction sans inhiber COX ?", "les anesthésiques locaux|l’anesthésie régionale", "b00078", "Le bloc anesthésique cible les canaux sodiques axonaux sans modifier la voie COX.", "Un bloc périphérique est techniquement réalisable."),
      qroc("Quel effet présynaptique a un opioïde μ ?", "il réduit le calcium et la libération de glutamate", "b00080", "La terminaison primaire excite moins le deuxième neurone.", "Une titration de secours est nécessaire lors de la mobilisation."),
      qroc("Quel effet postsynaptique a ce même opioïde ?", "il augmente la sortie de potassium et hyperpolarise le neurone", ["b00063", "b00080"], "La transmission du potentiel d’action diminue.", "La dose minimale efficace est recherchée."),
      qroc("Quel non-opioïde central peut compléter le bloc ?", "le paracétamol|l’acétaminophène", ["b00039", "b00076"], "Son action est surtout centrale et diffère de celle des AINS.", "L’AINS est finalement évité en raison du terrain."),
      qroc("Quel principe justifie cette combinaison ?", "l’épargne par analgésie multimodale", ["b00004", "b00067"], "Des cibles complémentaires réduisent l’exposition à une classe risquée.", "La marche est possible avec bloc, paracétamol et faible secours titré."),
    ],
  },
  {
    title: "Transmission synaptique au fil d’un oral EVC",
    vignette: "Lors d’un oral clinique, un candidat analyse le dossier d’un patient de 50 ans dont la douleur aiguë reste intense après des stimulations répétées autour d’une incision. Le territoire sensible s’étend malgré le contrôle de la cause locale et le jury lui demande pourquoi le signal peut devenir persistant. Il doit reconstruire la première synapse, de la libération du glutamate à l’activation NMDA, puis relier chaque étape à une cible thérapeutique.",
    questions: [
      qroc("Quel neurotransmetteur excite la première synapse nociceptive ?", "le glutamate", "b00063", "Le premier neurone le libère dans la corne dorsale."),
      qroc("Quel récepteur assure d’abord la dépolarisation rapide ?", "le récepteur AMPA", ["b00063", "b00066"], "Son activation prépare la levée du bloc NMDA.", "Les stimulations sont fortes et répétées."),
      qroc("Quel ion bouche initialement le canal NMDA ?", "le magnésium|Mg2+", ["b00063", "b00064"], "Le canal est silencieux tant que ce bloc persiste.", "La dépolarisation postsynaptique devient soutenue."),
      qroc("Quel ion entre après activation du NMDA ?", "le calcium|Ca2+", ["b00062", "b00063"], "Il déclenche des modifications durables de l’excitabilité.", "Le bloc magnésium est levé et le récepteur phosphorylé."),
      qroc("Quelle classe agit en amont sur le calcium présynaptique ?", "les gabapentinoïdes", "b00084", "Les gabapentinoïdes réduisent l’entrée calcique puis la libération de glutamate.", "Le candidat doit proposer une cible avant la fente synaptique."),
      qroc("Quelle classe agit directement sur le récepteur postsynaptique ?", "les anti-NMDA|la kétamine", "b00082", "Elle réduit l’entrée calcique et l’hyperexcitabilité.", "Une seconde cible postsynaptique est demandée."),
      qroc("Quel phénomène global relie cette cascade à la chronicisation ?", "la sensibilisation centrale|la plasticité neuronale", ["b00009", "b00063"], "Une synapse hyperexcitable maintient et amplifie la douleur.", "Le candidat conclut en reliant glutamate, NMDA, glie et persistance douloureuse."),
    ],
  },
];

function buildDpQroc() {
  return DP_QROC.map((series, index) => ({
    label: `DP QROC ${index + 1} · ${series.title}`,
    allowed_voies: ["externe"],
    vignette: series.vignette,
    questions: series.questions,
  }));
}


function validateSourceBlocks(extract, content) {
  const valid = new Set((extract.blocs || []).map((block) => block.id).filter(Boolean));
  const visit = (value) => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value.sourceBlocks)) {
      for (const id of value.sourceBlocks) if (!valid.has(id)) throw new Error(`Chapitre 37 : bloc source inconnu ${id}`);
    }
    if (Array.isArray(value)) value.forEach(visit);
    else Object.values(value).forEach(visit);
  };
  visit(content);
}

export function buildChapter37(extract) {
  const result = {
    fiche: buildFiche(),
    flashcards: buildFlashcards(),
    series: [...buildIsolatedQcm(), ...buildDpQcm(), ...buildIsolatedQroc(), ...buildDpQroc()],
  };
  validateSourceBlocks(extract, result);
  return result;
}

export default buildChapter37;
