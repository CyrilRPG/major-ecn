// Chapitre 08 - Sécurité en salle d’opération : positionnement du patient.
// Module éditorial autonome, fondé exclusivement sur extract.json.

const src = (...ids) => ids;
const n2 = (text, ...children) => ({ text, children });
const row = (concept, bullets, sourceBlocks, image) => ({ concept, bullets, sourceBlocks, ...(image ? { image } : {}) });
const fullImage = (path, caption, sourceCaption, extra = {}) => ({
  path, position: 'after', size: 'large', layout: 'full_width', containsText: true,
  caption, sourceCaption, ...extra,
});

const IMAGES = {
  dorsal: fullImage('img/img_001.png', 'Appuis et alignement en décubitus dorsal', 'FIGURE 8.1 Position de décubitus dorsal'),
  lithotomie: fullImage('img/img_002.png', 'Angles et appuis protecteurs en position de lithotomie', 'FIGURE 8.2 Position de lithotomie'),
  lateral: fullImage('img/img_003.png', 'Stabilisation et dégagement axillaire en décubitus latéral', 'FIGURE 8.3 Position de décubitus latéral'),
  ventral: fullImage('img/img_004.png', 'Appuis, dégagement abdominal et protection faciale en décubitus ventral', 'FIGURE 8.4 Position de décubitus ventral'),
  wilson: fullImage('img/img_005.png', 'Support Wilson réglable pour chirurgie rachidienne', 'FIGURE 8.5 Support Wilson'),
  jackson: fullImage('img/img_006.png', 'Table Jackson et accès radiologique du rachis', "FIGURE 8.6 Table d'opération Jackson"),
  assise: fullImage('img/img_007.png', 'Position semi-assise : neutralité cervicale et points d’appui', 'FIGURE 8.7 Position semi-assise'),
};

function buildFiche() {
  const parts = [
    {
      title: 'Comprendre la lésion pour mieux la prévenir',
      sections: [
        {
          title: 'Le positionnement est un acte collectif de sécurité',
          rows: [
            row('Compromis opératoire', [
              n2('Arbitrer entre deux exigences simultanées',
                'Offrir l’exposition nécessaire au geste chirurgical.',
                'Préserver nerfs, peau, perfusion, ventilation et stabilité du patient.'),
              'Sous anesthésie, douleur et inconfort ne déclenchent plus les mouvements protecteurs spontanés : chaque appui devient une responsabilité de l’équipe.',
            ], src('b00003')),
            row('Responsabilité partagée', [
              'Anesthésiologiste, chirurgien et personnel paramédical planifient ensemble les étapes, les changements de table et les moyens de stabilisation.',
              'La qualité repose sur une installation préparée, exécutée avec assez de personnel et vérifiée pendant toute l’intervention.',
            ], src('b00003', 'b00010', 'b00090', 'b00092', 'b00093')),
            row('Niveau de preuve', [
              'Les recommandations préventives proviennent surtout de rapports de cas et d’études rétrospectives ; elles réduisent le risque sans garantir son abolition.',
              'La prévention reste donc individualisée et associée à une surveillance clinique répétée.',
            ], src('b00003', 'b00090')),
          ],
        },
        {
          title: 'Compression, étirement, ischémie : un continuum',
          rows: [
            row('Trois mécanismes intriqués', [
              n2('Une contrainte mécanique devient une lésion neurovasculaire',
                'Un étirement léger interrompt d’abord la perfusion du nerf.',
                'Une traction plus forte déchire le tissu intraneural et peut provoquer hémorragie ou nécrose.',
                'Une compression durable augmente la pression veineuse puis l’œdème intraneural.'),
              'Une inflammation systémique avec microvasculite peut s’ajouter aux mécanismes mécaniques.',
            ], src('b00005')),
            row('Gravité croissante', [
              'La compression modérée peut produire un bloc de conduction réversible ; sa persistance peut interrompre la conduction axonale pendant des heures à des semaines.',
              'La compression soutenue expose à une atteinte de la myéline puis à une dégénérescence axonale.',
            ], src('b00005')),
            row('Terrain vulnérable', [
              'Diabète, artériopathie périphérique, poids extrême, neuropathie préexistante, arthrite, éthylisme et sexe masculin augmentent la susceptibilité.',
              'Hypothermie et durée opératoire prolongée ajoutent un risque peropératoire.',
            ], src('b00006', 'b00094')),
            row('Prévention mécanique', [
              'Éviter les pressions directes sur les nerfs superficiels et répartir les charges sur de larges surfaces moelleuses.',
              'Tester la tolérance chez le patient éveillé et corriger toute position douloureuse avant l’induction.',
            ], src('b00007', 'b00009')),
          ],
        },
      ],
    },
    {
      title: 'Préparer, mobiliser et tracer',
      sections: [
        {
          title: 'Avant tout mouvement de table',
          rows: [
            row('Plan d’installation', [
              n2('Préparer la manœuvre avant l’induction',
                'Définir étapes, rôles, points d’arrêt et matériel.',
                'Réunir un effectif compétent suffisant pour contrôler chaque segment.'),
              'Connaître les mouvements possibles de la table et les charges maximales autorisées selon son angulation et son orientation.',
            ], src('b00010')),
            row('Prévenir la chute', [
              'Les positions extrêmes, notamment en chirurgie robotique, exigent courroies, support antidérapant et contrôle de chaque segment corporel.',
              'Toute inclinaison importante est réalisée progressivement après vérification de la fixation du tronc, de la tête et des membres.',
            ], src('b00010', 'b00030')),
            row('Maintenir le monitorage', [
              'Anesthésie générale et neuraxiale altèrent tonus vasculaire, retour veineux et autorégulation : les changements de position deviennent des périodes hémodynamiques à risque.',
              'Minimiser les interruptions de monitorage et réévaluer immédiatement pression, oxygénation, ventilation et perfusion après chaque mouvement.',
            ], src('b00011')),
            row('Tracer ce qui protège', [
              'Documenter la position, les appuis, les accessoires, les contrôles périodiques et les modifications effectuées.',
              'Cette traçabilité soutient la continuité des soins, l’évaluation de la qualité et l’analyse médico-légale.',
            ], src('b00011', 'b00088')),
          ],
        },
        {
          title: 'Tête, cou et yeux : préserver l’axe et la perfusion',
          rows: [
            row('Neutralité cervicale', [
              n2('Maintenir l’axe autant que l’exposition le permet',
                'Éviter rotation, flexion et hyperextension prolongées.',
                'En flexion, conserver deux doigts entre menton et thorax.'),
            ], src('b00013')),
            row('Mouvements à haut risque', [
              'Une rotation marquée réduit potentiellement les flux carotidien et vertébral et étire le plexus brachial controlatéral si le bras est abducté.',
              'Hyperflexion et hyperextension peuvent léser moelle ou racines cervicales, surtout en position assise ou ventrale.',
            ], src('b00013')),
            row('Mobilisation coordonnée', [
              'Ne jamais forcer l’extension à l’intubation, notamment sur rachis dégénératif.',
              'Lors du passage dorsal-latéral ou dorsal-ventral, l’anesthésiologiste maintient habituellement tête et colonne pendant que l’équipe déplace le corps en bloc.',
            ], src('b00014', 'b00015', 'b00016')),
            row('Protection cornéenne', [
              'Garder les paupières fermées, supprimer toute pression oculaire et empêcher la chlorhexidine d’atteindre la cornée.',
              'Une exposition ou une contamination peut entraîner abrasion, érosion ou lésion permanente.',
            ], src('b00017', 'b00018')),
          ],
        },
      ],
    },
    {
      title: 'Décubitus dorsal et positions dérivées',
      sections: [
        {
          title: 'Protéger respiration, plexus et nerf ulnaire',
          rows: [
            row('Conséquence respiratoire', [
              'Le décubitus dorsal réduit la capacité résiduelle fonctionnelle d’environ 20 % par rapport à la station debout ; l’induction la diminue encore d’environ 20 %.',
              'Obésité et curarisation accentuent la fermeture des petites voies aériennes ; une PEP peut réduire l’effet shunt associé.',
            ], src('b00020')),
            row('Membres supérieurs', [
              n2('Limiter les contraintes sur le plexus brachial',
                'Maintenir l’abduction à moins de 90°.',
                'Éviter de tourner la tête à l’opposé du bras abducté.',
                'Stabiliser le bras pour empêcher sa chute hors de l’appui.'),
              'En abduction, placer l’avant-bras en position neutre ou en supination ; en adduction, garder la paume tournée vers le tronc.',
            ], src('b00021', 'b00022', 'b00094')),
            row('Nerf ulnaire', [
              'Protéger la gouttière cubitale et éviter une flexion du coude supérieure à 90°.',
              'Le brassard de pression se place au-dessus de la fosse antécubitale pour ne pas comprimer les nerfs ulnaire, médian et radial.',
            ], src('b00021', 'b00022')),
            row('Appuis inférieurs', [
              'Un coussin sous les genoux réduit la lordose et les tensions lombaires, coxo-fémorales et fémorotibiales.',
              'Occiput, coudes, région lombaire et talons reposent sur des surfaces larges et souples.',
            ], src('b00023', 'b00024', 'b00025', 'b00030'), IMAGES.dorsal),
          ],
        },
        {
          title: 'Trendelenburg et hyperextension lombaire',
          rows: [
            row('Hyperextension prudente', [
              'L’hyperextension lombaire utilisée pour certaines prostatectomies ne doit pas dépasser 15° en raison de cas d’ischémie médullaire et de paraplégie.',
            ], src('b00026')),
            row('Trendelenburg', [
              n2('La bascule tête basse redistribue volumes et pressions',
                'Retour veineux, pression veineuse centrale et pression veineuse pulmonaire augmentent.',
                'Le drainage veineux cérébral diminue, avec hausse des pressions intracrânienne et intraoculaire.',
                'Capacité résiduelle fonctionnelle et compliance respiratoire diminuent.'),
              'Éviter cette position en cas d’hypertension intracrânienne et anticiper une aggravation respiratoire chez le patient obèse.',
            ], src('b00027', 'b00030')),
            row('Empêcher le glissement', [
              'Proscrire les supports au-dessus des épaules, responsables de compression sus-claviculaire et d’étirement plexique.',
              'Préférer matelas antidérapant ou matelas à billes, bras en adduction, courroies et stabilisation de la tête.',
            ], src('b00030')),
            row('Trendelenburg inversé', [
              'La bascule tête haute diminue le retour veineux et peut faire chuter la pression artérielle.',
              'Incliner progressivement sous contrôle rapproché des signes vitaux.',
            ], src('b00027', 'b00030')),
          ],
        },
      ],
    },
    {
      title: 'Lithotomie et décubitus latéral',
      sections: [
        {
          title: 'Lithotomie : symétrie, perfusion et nerfs de la jambe',
          rows: [
            row('Angles de référence', [
              n2('Construire une lithotomie symétrique sans amplitude forcée',
                'Hanche fléchie de 60 à 170° et genou de 90 à 120°.',
                'Angle entre les cuisses inférieur ou égal à 90°.',
                'Rotation externe de hanche réduite au minimum.'),
              'Élever et abaisser les deux jambes simultanément pour éviter la torsion lombaire.',
            ], src('b00032', 'b00033', 'b00034', 'b00035', 'b00036'), IMAGES.lithotomie),
            row('Transition hémodynamique', [
              'L’élévation des jambes augmente retour veineux et débit cardiaque mais diminue la compliance respiratoire.',
              'Le retour en décubitus dorsal produit l’effet inverse et expose à une hypotension qu’il faut anticiper.',
            ], src('b00034', 'b00035', 'b00036')),
            row('Nerfs exposés', [
              'La flexion excessive de hanche peut comprimer le nerf fémoral sous le ligament inguinal.',
              'Le support de jambe peut comprimer le nerf fibulaire commun autour de la tête de la fibula ; sciatique, obturateur et cutané latéral de cuisse sont aussi exposés.',
            ], src('b00039')),
            row('Compartiment et extrémités', [
              'Un membre élevé au-dessus du cœur perd de la pression de perfusion tandis que l’appui augmente la pression tissulaire : ischémie, œdème et rhabdomyolyse deviennent possibles.',
              'Vérifier que les doigts ne se trouvent pas dans la zone de fermeture de la table avant son redressement.',
            ], src('b00039')),
            row('Table de traction', [
              'Sur table orthopédique, protéger périnée et organes génitaux du support cylindrique et surveiller la traction du membre fracturé.',
              'Une compression prolongée peut léser le nerf pudendal et abolir la sensibilité pénienne.',
            ], src('b00040')),
          ],
        },
        {
          title: 'Décubitus latéral : alignement, aisselle et déséquilibre V/Q',
          renderChunks: [1, 3],
          rows: [
            row('Stabilisation', [
              n2('Stabiliser sans créer un nouvel appui dangereux',
                'Fléchir hanche et genou du membre dépendant.',
                'Caler thorax antérieur et dos, puis séparer les jambes par des coussins.'),
              'Soutenir la tête dans l’axe en dégageant l’oreille et l’œil dépendants.',
            ], src('b00042', 'b00046', 'b00047'), IMAGES.lateral),
            row('Dégagement axillaire', [
              'Placer un rouleau sous le thorax pour libérer plexus brachial et vaisseaux axillaires sans pousser directement vers l’aisselle.',
              'Installer le bras non dépendant légèrement fléchi et proné sur support ; maintenir le bras dépendant étendu, neutre ou supiné.',
            ], src('b00042', 'b00046', 'b00047')),
            row('Ventilation-perfusion', [
              'La gravité dirige la perfusion vers le poumon dépendant, alors que la ventilation mécanique favorise le poumon non dépendant.',
              'Ce désaccord ventilation-perfusion peut diminuer l’oxygénation artérielle.',
            ], src('b00043', 'b00048')),
            row('Traction de l’épaule', [
              'En arthroscopie, limiter la force de suspension et garder l’abduction sous 90°.',
              'Une légère flexion et une légère rotation interne réduisent la tension du plexus brachial.',
            ], src('b00049', 'b00050')),
          ],
        },
      ],
    },
    {
      title: 'Décubitus ventral : sécuriser une position à haut risque',
      sections: [
        {
          title: 'Libérer abdomen, voies aériennes et points d’appui',
          rows: [
            row('Dégagement abdominal', [
              n2('Une compression abdominale retentit sur deux systèmes',
                'Le diaphragme remonte : CRF et compliance diminuent, pressions ventilatoires et altération gazeuse augmentent.',
                'La pression se transmet aux plexus veineux vertébraux et majore les saignements rachidiens.'),
              'Des supports longitudinaux entre épaules et crêtes iliaques libèrent l’abdomen ; chez la femme, déplacer les seins médialement et vers le haut sans appui direct.',
            ], src('b00052', 'b00053')),
            row('Membres et nerfs', [
              'Si les bras sont au-dessus de la tête, maintenir abduction sous 90°, éviter tension d’épaule, flexion excessive du coude et compression ulnaire en pronation.',
              'L’adduction des bras le long du corps réduit souvent l’étirement plexique ; protéger aussi le nerf cutané latéral de cuisse près de l’épine iliaque antérosupérieure.',
            ], src('b00054')),
            row('Face et appuis', [
              'Contrôler front, menton, épaules, coudes, crêtes iliaques, genoux, seins et organes génitaux.',
              'Un coussin troué, un support en fer à cheval ou un Mayfield stabilise la tête ; yeux et nez restent totalement libres.',
            ], src('b00055', 'b00059', 'b00060', 'b00061'), IMAGES.ventral),
            row('Voie aérienne inaccessible', [
              'Fixer solidement la sonde trachéale et garder une civière disponible pour un retournement urgent en cas d’extubation avec ventilation impossible.',
              'Avant l’extubation, rechercher un œdème facial ou des voies aériennes après position prolongée.',
            ], src('b00070', 'b00071', 'b00072', 'b00073')),
          ],
        },
        {
          title: 'Prévenir la perte visuelle postopératoire',
          rows: [
            row('Deux mécanismes', [
              'Une pression directe sur le globe peut occlure l’artère centrale de la rétine.',
              'Une oxygénation insuffisante du nerf optique produit une neuropathie ischémique antérieure ou postérieure, souvent bilatérale.',
            ], src('b00056')),
            row('Facteurs de risque', [
              'Chirurgie rachidienne longue, pertes sanguines importantes, obésité, anémie, athérosclérose, diabète et hypertension augmentent le risque.',
              'Congestion veineuse oculaire et hypotension diminuent ensemble la pression de perfusion de l’œil.',
            ], src('b00056', 'b00062', 'b00063', 'b00064')),
            row('Mesures protectrices', [
              n2('Préserver la pression de perfusion oculaire',
                'Éviter l’hypotension contrôlée et individualiser la cible de pression artérielle.',
                'Maintenir la tête neutre et légèrement au-dessus du cœur.',
                'Éviter toute pression oculaire et choisir un seuil transfusionnel adapté.'),
              'Pour une procédure très complexe, discuter un fractionnement et examiner précocement la vision après l’intervention.',
            ], src('b00065')),
          ],
        },
        {
          title: 'Supports rachidiens et retournement',
          rows: [
            row('Support Wilson', [
              n2('Adapter la courbure à l’objectif rachidien',
                'Deux demi-lunes longitudinales soutiennent le thorax.',
                'Le réglage ouvre les espaces intervertébraux en réduisant la lordose lombaire.'),
            ], src('b00066', 'b00067'), IMAGES.wilson),
            row('Position genupectorale', [
              'Le dégagement abdominal est supérieur à celui d’un appui ventral continu.',
              'La contrepartie est un report important du poids sur les genoux, qui exigent une protection renforcée.',
            ], src('b00066', 'b00067')),
            row('Table Jackson', [
              'Le cadre articulé offre un accès radiologique et autorise différentes installations avec une rotation longitudinale à 360°.',
              'Les piliers limitent l’accès anesthésique ; le retournement en sandwich exige une communication ordonnée entre tous les intervenants.',
            ], src('b00070', 'b00071', 'b00074', 'b00076', 'b00077'), IMAGES.jackson),
          ],
        },
      ],
    },
    {
      title: 'Position assise et conduite devant une complication',
      sections: [
        {
          title: 'Assise et semi-assise : perfusion cérébrale sous surveillance',
          rows: [
            row('Indications et installation', [
              'La position assise expose bien fosse postérieure et rachis cervical mais son risque d’embolie gazeuse et d’instabilité a réduit son usage.',
              'Pour l’épaule, la semi-assise élève le tronc d’environ 40° ; la tête neutre et stable est contrôlée périodiquement malgré les tractions chirurgicales.',
            ], src('b00079', 'b00081', 'b00083', 'b00084'), IMAGES.assise),
            row('Hypotension de verticalisation', [
              n2('Compenser la baisse de retour veineux',
                'L’anesthésie émousse les réflexes autonomes de verticalisation.',
                'Remplissage adapté, bandes élastiques et élévation progressive limitent la chute.',
                'Un vasopresseur restaure la pression lorsque les mesures initiales ne suffisent pas.'),
            ], src('b00080', 'b00085')),
            row('Gradient hydrostatique', [
              'La pression mesurée au bras surestime la pression reçue par le cerveau lorsque la tête est surélevée.',
              'Référencer la mesure au tragus, niveau approximatif du cercle de Willis, pour garantir une pression de perfusion cérébrale adéquate.',
            ], src('b00085', 'b00094')),
            row('Cou et voies aériennes', [
              'Une flexion cervicale prolongée peut obstruer les drainages veineux et lymphatique, provoquer un œdème lingual et compliquer l’extubation.',
              'L’hyperflexion a aussi été associée à des tétraplégies par étirement médullaire et compression vasculaire cervicale.',
            ], src('b00086')),
          ],
        },
        {
          title: 'Objectiver et documenter une neuropathie',
          rows: [
            row('Bilan initial', [
              n2('Objectiver avant de conclure au mécanisme',
                'Décrire déficit, facteurs de risque, chronologie, symptômes initiaux et évolution.',
                'Réaliser un examen neurologique complet.',
                'Solliciter une consultation spécialisée.'),
            ], src('b00088')),
            row('Temporalité de l’électromyographie', [
              'Les signes de dénervation apparaissent après trois à quatre semaines.',
              'Une EMG précoce recherche une atteinte antérieure ; une EMG vers quatre semaines objective mieux la lésion récente.',
            ], src('b00088')),
            row('Dernière vérification', [
              'Réexaminer périodiquement position, appuis, yeux, voies aériennes, perfusion distale et stabilité, surtout lors des procédures longues.',
              'Un geste simple répété au bon moment prévient qu’un déplacement ou une compression ne reste occulté.',
            ], src('b00090', 'b00094')),
          ],
        },
      ],
    },
  ];

  const sourceBlocks = [...new Set(parts.flatMap((part) => part.sections.flatMap((section) => section.rows.flatMap((item) => item.sourceBlocks))))];
  return {
    matiere: 'Anesthésie-Réanimation',
    title: 'Sécurité en salle d’opération: positionnement du patient',
    year: '2026-2027',
    coverSubtitle: 'Prévenir les lésions nerveuses, oculaires et physiologiques liées aux positions opératoires',
    sourceBlocks,
    parts,
    synthesis: {
      compactLayout: true,
      chiffres: {
        headers: ['Repère', 'Valeur à retenir'],
        rows: [
          ['Abduction de l’épaule', '< 90°'],
          ['Flexion du coude', '< 90°'],
          ['Espace menton-thorax', 'Deux doigts'],
          ['CRF en décubitus dorsal', '−20 %, puis encore −20 % après induction'],
          ['Hyperextension lombaire', 'Éviter > 15°'],
          ['Semi-assise pour l’épaule', 'Tronc ≈ 40°'],
          ['EMG récente', 'Interprétable vers 3 à 4 semaines'],
        ],
      },
      tables: [
        {
          title: 'Risques dominants selon la position',
          headers: ['Position', 'Vigilance prioritaire'],
          rows: [
            ['Dorsale', 'CRF, plexus brachial, ulnaire, talons et cornée'],
            ['Lithotomie', 'Symétrie, nerf fibulaire commun, compartiment, hypotension au décours'],
            ['Latérale', 'Aisselle dépendante, oreille, œil, plexus et déséquilibre V/Q'],
            ['Ventrale', 'Abdomen libre, yeux, voie aérienne, pression oculaire et points d’appui'],
            ['Assise', 'Retour veineux, pression cérébrale, neutralité cervicale et œdème lingual'],
          ],
        },
        {
          title: 'Réflexe de prévention',
          headers: ['Moment', 'Action'],
          rows: [
            ['Avant induction', 'Tester la tolérance, identifier le terrain et répartir les rôles'],
            ['Avant mouvement', 'Fixer patient, voie aérienne, lignes, tête et membres'],
            ['Après mouvement', 'Contrôler ventilation, pression, perfusion, yeux et appuis'],
            ['Pendant chirurgie', 'Répéter les vérifications et documenter les modifications'],
            ['Après complication', 'Objectiver, examiner, dater, tracer et orienter'],
          ],
        },
      ],
      keyPoints: [
        'Sous anesthésie, les mécanismes protecteurs liés à la douleur et à l’inconfort disparaissent.',
        'Compression, étirement et ischémie se combinent sur un continuum allant du bloc réversible à la lésion axonale.',
        'La tête reste neutre et l’abduction des membres supérieurs demeure inférieure à 90°.',
        'La lithotomie exige une mobilisation simultanée des deux jambes et la protection de la tête fibulaire.',
        'En décubitus latéral, le rouleau thoracique dégage l’aisselle sans la comprimer.',
        'En décubitus ventral, libérer l’abdomen réduit à la fois les pressions ventilatoires et les saignements rachidiens.',
        'Toute pression directe sur le globe oculaire est proscrite, particulièrement lors des chirurgies rachidiennes longues.',
        'En position assise, la pression artérielle cérébrale se raisonne au niveau du tragus.',
      ],
      eclair: [
        'Planifier chaque installation et disposer d’un effectif suffisant avant le premier mouvement.',
        'Tester la position chez le patient éveillé quand cela est possible.',
        'Maintenir deux doigts entre le menton et le thorax en flexion cervicale.',
        'Garder l’épaule et le coude en dessous de 90° et protéger la gouttière ulnaire.',
        'Ne jamais utiliser d’appui sus-claviculaire pour empêcher un glissement en Trendelenburg.',
        'Élever et abaisser ensemble les jambes placées en lithotomie.',
        'Libérer abdomen, yeux, nez, seins et organes génitaux en décubitus ventral.',
        'Fixer la sonde trachéale et préparer un retournement urgent en position ventrale.',
        'Référencer la pression au tragus en position assise ou semi-assise.',
        'Devant une neuropathie, examiner, documenter et programmer l’EMG au moment pertinent.',
      ],
    },
  };
}

const card = (recto, verso, sourceBlocks) => ({ recto, verso, sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks] });

function buildFlashcards() {
  return [
    card('Pourquoi une mauvaise position reste-t-elle silencieuse sous anesthésie ?', 'Les mécanismes protecteurs liés à la douleur et à l’inconfort sont abolis.', 'b00003'),
    card('Qui partage la responsabilité du positionnement opératoire ?', 'Anesthésiologiste, chirurgien et personnel paramédical.', 'b00003'),
    card('Quels objectifs doit concilier une position chirurgicale ?', 'Exposition optimale du site et réduction maximale des complications.', 'b00003'),
    card('Quels mécanismes se combinent dans une neuropathie de position ?', 'Compression, ischémie, étirement et parfois inflammation microvasculaire.', 'b00005'),
    card('Que peut provoquer un étirement nerveux léger ?', 'Une interruption de la perfusion du nerf.', 'b00005'),
    card('Que peut provoquer un étirement nerveux important ?', 'Déchirure intraneurale, hémorragie et nécrose.', 'b00005'),
    card('Quelle lésion produit souvent une compression nerveuse légère ?', 'Un bloc de conduction réversible par interruption de perfusion.', 'b00005'),
    card('Pourquoi une compression plus forte crée-t-elle un œdème intraneural ?', 'Elle augmente la pression veineuse du nerf.', 'b00005'),
    card('Quelle conséquence menace après compression nerveuse soutenue ?', 'Atteinte de la myéline puis dégénérescence axonale.', 'b00005'),
    card('Quels terrains favorisent les neuropathies de position ?', 'Diabète, artériopathie, poids extrême, neuropathie, arthrite et éthylisme.', 'b00006'),
    card('Quel facteur démographique augmente le risque de neuropathie ?', 'Le sexe masculin.', 'b00006'),
    card('Quels facteurs peropératoires majorent les neuropathies ?', 'Hypothermie et durée prolongée de chirurgie.', 'b00006'),
    card('Comment répartir les points de pression ?', 'Sur de grandes surfaces moelleuses.', 'b00007'),
    card('Quand tester idéalement la tolérance d’une position ?', 'Avant l’induction, chez le patient encore éveillé.', 'b00009'),
    card('Que faut-il définir avant de positionner un patient ?', 'Les étapes, les rôles, le matériel et l’effectif nécessaire.', 'b00010'),
    card('Pourquoi connaître la charge maximale d’une table ?', 'Elle varie avec l’angulation et l’orientation du plateau.', 'b00010'),
    card('Quel danger augmentent les positions robotiques extrêmes ?', 'La chute du patient hors de la table.', 'b00010'),
    card('Pourquoi les changements de position déstabilisent-ils davantage sous anesthésie ?', 'Tonus vasculaire, retour veineux et autorégulation sont altérés.', 'b00011'),
    card('Que doit contenir la traçabilité du positionnement ?', 'Position, accessoires, appuis, contrôles et modifications.', 'b00011'),
    card('Quelle position cervicale rechercher en toute chirurgie ?', 'Une position neutre de la tête et du cou.', 'b00013'),
    card('Quel espace conserver en flexion cervicale ?', 'L’équivalent de deux doigts entre menton et thorax.', 'b00013'),
    card('Quel plexus est étiré par rotation de tête opposée au bras abducté ?', 'Le plexus brachial controlatéral.', 'b00013'),
    card('Quels flux peuvent diminuer lors d’une forte rotation cervicale ?', 'Les flux carotidien et vertébral.', 'b00013'),
    card('Qui maintient habituellement tête et rachis pendant un retournement ?', 'L’anesthésiologiste.', ['b00014', 'b00016']),
    card('Pourquoi ne jamais forcer l’extension à l’intubation ?', 'Elle peut léser un rachis cervical dégénératif ou vulnérable.', 'b00014'),
    card('Comment protéger la cornée pendant l’anesthésie ?', 'Maintenir les paupières fermées et éviter pression ou antiseptique.', ['b00017', 'b00018']),
    card('Quel antiseptique est toxique pour la cornée ?', 'La chlorhexidine.', 'b00017'),
    card('De combien la CRF baisse-t-elle en décubitus dorsal ?', 'Environ 20 % par rapport à la station debout.', 'b00020'),
    card('Quel effet l’induction ajoute-t-elle sur la CRF en position dorsale ?', 'Une baisse supplémentaire d’environ 20 %.', 'b00020'),
    card('Quel réglage peut corriger l’effet shunt lié à la fermeture des petites voies ?', 'Une pression expiratoire positive.', 'b00020'),
    card('Quelle limite d’abduction protège le plexus brachial ?', 'Une abduction strictement inférieure à 90°.', 'b00021'),
    card('Quelle flexion du coude faut-il éviter ?', 'Une flexion supérieure à 90°.', 'b00021'),
    card('Où le nerf ulnaire est-il vulnérable au coude ?', 'Dans la gouttière entre olécrane et épicondyle médial.', 'b00021'),
    card('Quelle incidence de neuropathie ulnaire était rapportée après chirurgie non cardiaque ?', 'Environ 0,5 % chez 1 502 adultes.', 'b00021'),
    card('Comment orienter l’avant-bras lorsque le bras est abducté ?', 'En position neutre ou en supination.', 'b00022'),
    card('Comment orienter la main lorsque le bras longe le corps ?', 'Paume tournée vers le tronc du patient.', 'b00022'),
    card('Où placer le brassard par rapport au pli du coude ?', 'Au-dessus de la fosse antécubitale.', 'b00022'),
    card('Pourquoi placer un coussin sous les genoux en décubitus dorsal ?', 'Pour limiter lordose et tensions lombaires, coxales et fémorotibiales.', ['b00023', 'b00025']),
    card('Quels appuis surveiller en décubitus dorsal ?', 'Occiput, coudes, région lombaire et talons.', 'b00030'),
    card('Quelle hyperextension lombaire faut-il éviter ?', 'Une hyperextension supérieure à 15°.', 'b00026'),
    card('Quel effet le Trendelenburg a-t-il sur le retour veineux ?', 'Il augmente le retour veineux systémique.', 'b00027'),
    card('Pourquoi éviter le Trendelenburg en hypertension intracrânienne ?', 'Il diminue le drainage veineux cérébral et augmente la pression intracrânienne.', 'b00027'),
    card('Quel effet respiratoire produit le Trendelenburg ?', 'Une baisse de CRF et de compliance respiratoire.', 'b00027'),
    card('Pourquoi proscrire les épaulières en Trendelenburg ?', 'Elles compriment et étirent les plexus brachial et cervical.', 'b00030'),
    card('Quel dispositif limite le glissement sans comprimer les épaules ?', 'Un matelas antidérapant ou un matelas à billes.', 'b00030'),
    card('Quel effet hémodynamique produit le Trendelenburg inversé ?', 'Une baisse de retour veineux et de pression artérielle.', 'b00030'),
    card('Quelles chirurgies utilisent couramment la lithotomie ?', 'Chirurgies gynécologiques, urologiques, coliques, rectales et anales.', 'b00032'),
    card('Quelle flexion de hanche est décrite en lithotomie ?', 'Entre 60 et 170°.', 'b00032'),
    card('Quelle flexion de genou est décrite en lithotomie ?', 'Entre 90 et 120°.', 'b00032'),
    card('Quel angle maximal garder entre les cuisses en lithotomie ?', '90° ou moins.', 'b00032'),
    card('Comment mobiliser les jambes en lithotomie ?', 'Les élever et les abaisser simultanément.', ['b00033', 'b00036']),
    card('Quel effet produit l’élévation des jambes sur le débit cardiaque ?', 'Elle augmente retour veineux et débit cardiaque.', 'b00034'),
    card('Quel effet respiratoire produit la lithotomie ?', 'Une diminution de la compliance du système respiratoire.', 'b00034'),
    card('Que prévoir lors de l’abaissement des jambes ?', 'Une baisse du retour veineux et de la pression artérielle.', ['b00035', 'b00036']),
    card('Quel nerf est comprimé sous le ligament inguinal en forte flexion de hanche ?', 'Le nerf fémoral.', 'b00039'),
    card('Où le nerf fibulaire commun est-il comprimé en lithotomie ?', 'Autour de la tête de la fibula, contre le support.', 'b00039'),
    card('Pourquoi la lithotomie favorise-t-elle un syndrome de compartiment ?', 'Perfusion réduite du membre élevé et pression accrue sur le support.', 'b00039'),
    card('Quelle complication musculaire peut suivre un syndrome de compartiment ?', 'Une rhabdomyolyse.', 'b00039'),
    card('Pourquoi contrôler les mains avant de redresser la table ?', 'Des doigts peuvent être coincés et amputés par la partie mobile.', 'b00039'),
    card('Quel nerf peut être lésé par le support périnéal d’une table de traction ?', 'Le nerf pudendal.', 'b00040'),
    card('Quelles chirurgies utilisent le décubitus latéral ?', 'Thorax, rein, hanche et autres chirurgies du membre inférieur.', 'b00042'),
    card('Comment stabiliser le membre inférieur dépendant en décubitus latéral ?', 'Par flexion de la hanche et du genou.', 'b00042'),
    card('Que doit dégager le coussin de tête en décubitus latéral ?', 'L’oreille dépendante et le côté de l’œil ipsilatéral.', 'b00042'),
    card('Où placer le rouleau axillaire en décubitus latéral ?', 'Sous le thorax, sans pression céphalique directe dans l’aisselle.', 'b00042'),
    card('Comment orienter le bras dépendant en décubitus latéral ?', 'En extension, supination ou position neutre.', 'b00042'),
    card('Quel poumon reçoit préférentiellement la perfusion en décubitus latéral ?', 'Le poumon dépendant.', 'b00043'),
    card('Quel poumon reçoit préférentiellement la ventilation mécanique latérale ?', 'Le poumon non dépendant.', ['b00043', 'b00048']),
    card('Pourquoi l’oxygénation peut-elle baisser en décubitus latéral ?', 'Perfusion et ventilation se distribuent vers des poumons opposés.', ['b00043', 'b00048']),
    card('Comment réduire la tension plexique lors d’une traction d’épaule ?', 'Limiter traction et abduction, avec légère flexion et rotation interne.', ['b00049', 'b00050']),
    card('Pourquoi libérer l’abdomen en décubitus ventral ?', 'Pour préserver CRF et compliance et limiter les saignements rachidiens.', 'b00052'),
    card('Comment la compression abdominale augmente-t-elle le saignement rachidien ?', 'Elle transmet la pression aux plexus veineux vertébraux.', 'b00052'),
    card('Comment orienter les seins en décubitus ventral ?', 'Médialement et vers le haut, sans appui direct.', ['b00052', 'b00053']),
    card('Quel nerf cutané est exposé près de l’épine iliaque antérosupérieure ?', 'Le nerf cutané latéral de la cuisse.', 'b00054'),
    card('Quels appuis surveiller en décubitus ventral ?', 'Front, menton, épaules, coudes, crêtes iliaques, genoux et organes génitaux.', ['b00055', 'b00061']),
    card('Quels dispositifs peuvent stabiliser la tête en décubitus ventral ?', 'Coussin troué, support en fer à cheval ou Mayfield.', 'b00055'),
    card('Quelle incidence maximale de perte visuelle est rapportée après chirurgie spinale ventrale ?', 'Jusqu’à 0,2 %.', 'b00056'),
    card('Quels sont les deux mécanismes majeurs de cécité après chirurgie ventrale ?', 'Occlusion de l’artère rétinienne et neuropathie ischémique optique.', 'b00056'),
    card('Comment une pression externe peut-elle léser la rétine ?', 'Elle augmente la pression oculaire et peut occlure l’artère centrale.', 'b00056'),
    card('Quels facteurs opératoires favorisent la perte visuelle en position ventrale ?', 'Durée prolongée et pertes sanguines importantes.', ['b00056', 'b00062']),
    card('Quels terrains favorisent la neuropathie ischémique optique ?', 'Obésité, anémie, athérosclérose, diabète et hypertension.', ['b00062', 'b00064']),
    card('Comment positionner la tête pour préserver la perfusion oculaire ?', 'Neutre et légèrement au-dessus du cœur.', 'b00065'),
    card('Pourquoi éviter l’hypotension contrôlée chez un patient à risque visuel ?', 'Elle réduit la pression de perfusion du nerf optique.', 'b00065'),
    card('Quand examiner précocement la vision après chirurgie ?', 'Après chirurgie ventrale à haut risque de perte visuelle.', 'b00065'),
    card('Comment le support Wilson ouvre-t-il les espaces lombaires ?', 'Ses demi-lunes réglables réduisent la lordose lombaire.', 'b00066'),
    card('Quel inconvénient possède la position genupectorale ?', 'Une grande part du poids repose sur les genoux.', ['b00066', 'b00067']),
    card('Quel avantage radiologique offre la table Jackson ?', 'Un accès optimal au rachis et une rotation longitudinale à 360°.', 'b00070'),
    card('Quelle limite anesthésique présente la table Jackson ?', 'Ses piliers entravent l’accès au patient.', 'b00070'),
    card('Que préparer en cas d’extubation accidentelle en position ventrale ?', 'Un retournement urgent et une civière disponible à proximité.', 'b00072'),
    card('Que rechercher avant extubation après décubitus ventral prolongé ?', 'Un œdème du visage et des voies aériennes.', 'b00073'),
    card('Pourquoi la position assise est-elle moins utilisée en neurochirurgie ?', 'Risque d’embolie gazeuse et d’instabilité hémodynamique.', 'b00079'),
    card('Quelle élévation du tronc utilise la semi-assise pour l’épaule ?', 'Environ 40°.', 'b00079'),
    card('Pourquoi contrôler périodiquement la tête en chirurgie d’épaule assise ?', 'Les tractions peuvent la déplacer hors de la position neutre.', 'b00079'),
    card('Pourquoi la pression chute-t-elle lors du passage en position assise ?', 'Le retour veineux baisse et les réflexes autonomes sont émoussés.', ['b00080', 'b00085']),
    card('Comment prévenir l’hypotension de position assise ?', 'Remplissage, bandes élastiques, élévation graduelle et vasopresseurs.', ['b00080', 'b00085']),
    card('À quel niveau référencer la pression artérielle en position assise ?', 'Au tragus, niveau approximatif du cercle de Willis.', 'b00085'),
    card('Pourquoi la pression au bras trompe-t-elle en position assise ?', 'Le gradient hydrostatique rend la pression cérébrale plus basse.', 'b00085'),
    card('Quelle complication linguale provoque l’hyperflexion assise ?', 'Un œdème par obstruction des drainages veineux et lymphatique.', 'b00086'),
    card('Quelle complication médullaire a été rapportée après hyperflexion assise ?', 'Une tétraplégie.', 'b00086'),
    card('Que documenter devant une neuropathie postopératoire ?', 'Risques, chronologie, mécanisme, symptômes initiaux et évolution.', 'b00088'),
    card('Quel examen clinique réaliser devant une atteinte nerveuse ?', 'Un examen neurologique complet.', 'b00088'),
    card('Quand les signes EMG de dénervation apparaissent-ils ?', 'Après trois à quatre semaines.', 'b00088'),
    card('Que peut montrer une EMG réalisée très tôt ?', 'Une atteinte nerveuse préexistante.', 'b00088'),
    card('Quand objectiver au mieux une lésion nerveuse récente par EMG ?', 'Environ quatre semaines après l’apparition du déficit.', 'b00088'),
    card('À quel rythme contrôler une position pendant une longue chirurgie ?', 'Périodiquement et après chaque mouvement de table.', ['b00090', 'b00094']),
    card('Quel principe résume la sécurité du positionnement ?', 'Planifier, coordonner, protéger, surveiller et tracer.', ['b00090', 'b00092', 'b00093']),
  ];
}

const qcm = (enonce, sourceBlocks, correction_generale, items, newInformation) => ({
  enonce: newInformation ? `${newInformation} ${enonce}` : enonce,
  format: 'qcm', sourceBlocks, correction_generale,
  ...(newInformation ? { newInformation } : {}),
  items: items.map(([is_correct, itemEnonce, justification], index) => ({
    lettre: 'ABCDE'[index], enonce: itemEnonce, is_correct, justification,
  })),
});

const qroc = (enonce, reponse_attendue, sourceBlocks, correction_generale, newInformation) => ({
  enonce: newInformation ? `${newInformation} ${enonce}` : enonce,
  format: 'qroc', reponse_attendue, sourceBlocks, correction_generale, items: [],
  ...(newInformation ? { newInformation } : {}),
});

const QCM_SERIES = [
  {
    label: 'QCM — Série 1 · Mécanismes et terrain neurologique', allowed_voies: ['interne'], questions: [
      qcm('Quels mécanismes participent à une neuropathie périphérique liée au positionnement ?', src('b00005'), 'La lésion mécanique associe souvent interruption de perfusion, contrainte tissulaire et œdème ; une inflammation microvasculaire peut s’y ajouter.', [
        [false, 'L’absence complète de toute compression locale.', 'Sans contrainte mécanique ni atteinte inflammatoire, ce mécanisme de position n’est pas constitué.'],
        [true, 'L’étirement prolongé du tissu nerveux.', 'La traction compromet d’abord la perfusion avant de déchirer les structures intraneurales.'],
        [true, 'L’ischémie de la microcirculation nerveuse.', 'La baisse d’apport sanguin constitue une voie commune de souffrance du nerf.'],
        [false, 'Une hyperoxie artérielle isolée.', 'Une PaO2 élevée sans contrainte locale n’explique pas la neuropathie de position.'],
        [true, 'Une microvasculite inflammatoire systémique.', 'L’inflammation peut contribuer à certaines neuropathies sans mécanisme purement mécanique.'],
      ]),
      qcm('Quelles évolutions sont compatibles avec une compression nerveuse croissante ?', src('b00005'), 'L’intensité et la durée de la pression font progresser la lésion du bloc fonctionnel réversible vers l’atteinte myélinique et axonale.', [
        [true, 'Un bloc de conduction réversible après compression légère.', 'Une interruption transitoire de perfusion peut suspendre la transmission sans destruction axonale.'],
        [true, 'Un œdème intraneural après élévation de la pression veineuse.', 'Le drainage veineux entravé augmente le volume et la pression à l’intérieur du nerf.'],
        [false, 'Une récupération toujours immédiate dès le retrait de l’appui.', 'La conduction peut rester altérée plusieurs heures ou semaines après une pression importante.'],
        [true, 'Une atteinte de la myéline si la compression persiste.', 'La gaine devient vulnérable lorsque la contrainte n’est pas levée.'],
        [true, 'Une dégénérescence axonale dans les formes sévères.', 'Une pression soutenue peut dépasser le stade fonctionnel et léser l’axone.'],
      ]),
      qcm('Quels éléments préopératoires majorent le risque de neuropathie de position ?', src('b00006', 'b00094'), 'Le dépistage doit rechercher vulnérabilité vasculaire, métabolique, neurologique et anatomique avant de choisir les appuis.', [
        [false, 'Une glycémie normale sans antécédent métabolique.', 'Ce profil ne correspond pas au diabète identifié comme facteur de vulnérabilité.'],
        [true, 'Une artériopathie périphérique.', 'Une perfusion déjà limitée rend le tissu nerveux moins tolérant à la compression.'],
        [true, 'Une atteinte neurologique préexistante.', 'Un nerf antérieurement lésé dispose d’une marge fonctionnelle réduite.'],
        [true, 'Un poids situé à l’un des deux extrêmes.', 'Maigreur majeure ou obésité modifient les appuis et la tolérance tissulaire.'],
        [true, 'Un éthylisme chronique.', 'Cette exposition est associée à une susceptibilité accrue aux neuropathies périphériques.'],
      ]),
      qcm('Quelles mesures générales diminuent les contraintes nerveuses ?', src('b00007', 'b00009'), 'La prévention combine test de tolérance, suppression des pressions focales et répartition des charges sur des matériaux adaptés.', [
        [true, 'Installer si possible le patient avant l’induction.', 'Le sujet éveillé peut signaler une douleur ou une position anatomiquement intolérable.'],
        [true, 'Répartir le poids sur une surface large.', 'La même force appliquée sur une plus grande zone diminue la pression locale.'],
        [false, 'Placer un appui ferme directement sur tout nerf palpable.', 'Les nerfs superficiels doivent au contraire être dégagés de la pression directe.'],
        [true, 'Employer un matelas comportant une couche moelleuse.', 'Le matériau déformable disperse les points de charge.'],
        [false, 'Considérer la curarisation comme une protection contre les appuis.', 'L’absence de mouvement augmente le besoin de prévention, elle ne protège aucun tissu.'],
      ]),
      qcm('Quelles affirmations encadrent la responsabilité du positionnement ?', src('b00003', 'b00010', 'b00090'), 'La sécurité dépend d’une action interprofessionnelle organisée qui concilie accès opératoire et protection du patient anesthésié.', [
        [true, 'Le chirurgien participe au choix de l’exposition nécessaire.', 'Le geste prévu détermine les contraintes indispensables et leurs alternatives.'],
        [true, 'L’anesthésiologiste protège notamment tête, voies aériennes et physiologie.', 'Ces éléments restent sous surveillance anesthésique lors des mobilisations.'],
        [true, 'Le personnel paramédical prend part à l’installation coordonnée.', 'La mobilisation sûre demande assez d’intervenants formés et synchronisés.'],
        [false, 'La responsabilité cesse dès que les champs stériles sont posés.', 'La position doit être contrôlée périodiquement jusqu’à la fin de l’intervention.'],
        [false, 'L’absence de plainte exclut un appui dangereux sous anesthésie.', 'Douleur et mouvements protecteurs sont précisément abolis chez le patient anesthésié.'],
      ]),
    ],
  },
  {
    label: 'QCM — Série 2 · Préparation et mobilisations', allowed_voies: ['interne'], questions: [
      qcm('Que faut-il organiser avant une installation complexe ?', src('b00010'), 'Une mobilisation sûre commence par un scénario partagé, un matériel compatible avec la table et un effectif capable de contrôler chaque segment.', [
        [true, 'Décomposer les principales étapes du positionnement.', 'Une séquence explicite réduit les actions simultanées non coordonnées.'],
        [true, 'Vérifier le nombre et la compétence des intervenants.', 'Le poids et les dispositifs ne peuvent être contrôlés par une équipe insuffisante.'],
        [false, 'Découvrir les commandes de table pendant le basculement.', 'Le fonctionnement du plateau doit être maîtrisé avant tout mouvement.'],
        [true, 'Connaître la charge maximale pour l’angulation prévue.', 'La capacité autorisée change selon l’orientation et la géométrie de la table.'],
        [true, 'Prévoir la stabilisation contre une chute.', 'Les inclinaisons extrêmes créent une composante de glissement importante.'],
      ]),
      qcm('Pourquoi un changement de position constitue-t-il une période physiologique à risque ?', src('b00011'), 'Les effets hydrostatiques s’ajoutent aux modifications induites par les anesthésies générale ou neuraxiale, justifiant un suivi continu.', [
        [true, 'Le retour veineux peut varier brutalement.', 'La redistribution gravitationnelle modifie immédiatement la précharge.'],
        [true, 'Le tonus vasculaire est altéré par l’anesthésie.', 'La vasodilatation limite la compensation aux changements hydrostatiques.'],
        [true, 'Les mécanismes d’autorégulation peuvent être moins efficaces.', 'La perfusion des organes devient plus dépendante de la pression mesurée.'],
        [false, 'Le monitorage peut être interrompu sans conséquence pendant la mobilisation.', 'Cette phase dynamique exige au contraire la continuité des paramètres vitaux.'],
        [false, 'Seule la position finale influence l’hémodynamique.', 'La transition elle-même peut provoquer hypotension ou congestion avant stabilisation.'],
      ]),
      qcm('Quels éléments doivent être consignés au dossier anesthésique ?', src('b00011', 'b00088'), 'Une trace exploitable relie installation, moyens de protection, surveillance et éventuel déficit postopératoire.', [
        [true, 'La position effectivement utilisée.', 'Le nom de la position situe les contraintes générales auxquelles le patient a été exposé.'],
        [true, 'Les accessoires de protection mis en place.', 'Appuis et coussins documentent les moyens préventifs appliqués.'],
        [true, 'Les modifications survenues pendant l’intervention.', 'Un déplacement ou une nouvelle inclinaison peut modifier le mécanisme de lésion.'],
        [false, 'Uniquement le nom du chirurgien.', 'Cette donnée ne décrit ni les appuis ni la chronologie de l’installation.'],
        [true, 'Les contrôles répétés lors d’une chirurgie longue.', 'La répétition des vérifications atteste la surveillance active de la position.'],
      ]),
      qcm('Quelles précautions protègent le rachis cervical lors d’un retournement ?', src('b00013', 'b00014', 'b00015', 'b00016'), 'Le déplacement doit conserver l’axe tête-cou-tronc, avec une personne dédiée à la tête et des gestes synchronisés.', [
        [true, 'Attribuer le maintien de la tête à l’anesthésiologiste.', 'Il contrôle simultanément l’alignement cervical et les voies aériennes.'],
        [true, 'Déplacer le tronc en coordination avec la tête.', 'Une rotation dissociée impose torsion et traction aux structures cervicales.'],
        [false, 'Forcer l’extension pour faciliter chaque manipulation.', 'Une extension imposée peut léser un rachis dégénératif.'],
        [true, 'Éviter les amplitudes extrêmes prolongées.', 'Flexion, extension et rotation maximales favorisent atteintes médullaires ou radiculaires.'],
        [false, 'Laisser la tête suivre librement le poids du corps.', 'La tête doit être contrôlée et non ballotée pendant le mouvement.'],
      ]),
      qcm('Quelles mesures protègent les yeux au bloc opératoire ?', src('b00017', 'b00018', 'b00055', 'b00065'), 'La cornée et le globe doivent être isolés de l’exposition, des toxiques et de toute pression directe, puis réévalués selon la position.', [
        [true, 'Maintenir les paupières fermées.', 'La fermeture prévient dessiccation, abrasion et érosion cornéennes.'],
        [true, 'Écarter la chlorhexidine de la surface oculaire.', 'Cet antiseptique peut produire des dommages cornéens permanents.'],
        [true, 'Vérifier le dégagement des yeux en décubitus ventral.', 'Un déplacement du support facial peut créer une pression non visible pendant la chirurgie.'],
        [false, 'Accepter une pression douce sur le globe si la paupière est fermée.', 'La fermeture ne protège pas la circulation rétinienne d’une compression externe.'],
        [true, 'Contrôler périodiquement l’absence de contact.', 'La position initialement correcte peut se modifier au cours d’une procédure longue.'],
      ]),
    ],
  },
  {
    label: 'QCM — Série 3 · Décubitus dorsal et Trendelenburg', allowed_voies: ['interne'], questions: [
      qcm('Quels effets respiratoires accompagnent le décubitus dorsal sous anesthésie générale ?', src('b00020'), 'La baisse de CRF liée à la position puis à l’induction favorise la fermeture des petites voies aériennes et l’effet shunt.', [
        [true, 'Une diminution initiale de CRF d’environ 20 % par rapport à la station debout.', 'Le poids des structures thoracoabdominales réduit le volume pulmonaire de repos.'],
        [true, 'Une baisse supplémentaire d’environ 20 % après l’induction.', 'La perte de tonus ajoute une réduction précoce du volume téléexpiratoire.'],
        [false, 'Une augmentation constante de la compliance chez le patient obèse.', 'L’obésité aggrave la réduction de CRF et ne garantit aucune amélioration mécanique.'],
        [true, 'Un effet shunt si la CRF passe sous le volume de fermeture.', 'Des unités perfusées ne participent plus correctement à l’oxygénation.'],
        [true, 'Une amélioration possible sous PEP.', 'La pression téléexpiratoire aide à maintenir ouvertes les petites voies.'],
      ]),
      qcm('Comment installer les membres supérieurs en décubitus dorsal ?', src('b00021', 'b00022'), 'La protection associe abduction limitée, orientation adaptée des avant-bras, coudes dégagés et bras solidement stabilisés.', [
        [true, 'Limiter l’abduction des épaules à moins de 90°.', 'Cette limite réduit traction et compression du plexus brachial.'],
        [false, 'Tourner la tête à l’opposé d’un bras largement abducté.', 'Cette combinaison augmente l’étirement des racines plexiques.'],
        [true, 'Supiner ou neutraliser l’avant-bras sur un appui latéral.', 'Cette orientation évite une pression directe sur la gouttière ulnaire.'],
        [true, 'Orienter la paume vers le tronc si le bras est en adduction.', 'La position neutre limite la rotation et protège le coude.'],
        [true, 'Fixer le bras pour qu’il ne tombe pas hors de la table.', 'Une chute peut tracter l’épaule et léser le membre supérieur.'],
      ]),
      qcm('Quels éléments protègent le nerf ulnaire et les autres nerfs du coude ?', src('b00021', 'b00022'), 'Le nerf ulnaire est superficiel en arrière de l’épicondyle médial ; l’angle du coude, l’appui et le brassard sont donc contrôlés.', [
        [true, 'Éviter une flexion du coude supérieure à 90°.', 'La flexion marquée augmente étirement et compression dans la gouttière cubitale.'],
        [true, 'Rembourrer la région de l’olécrane.', 'Une surface souple réduit la pression focale sur le trajet superficiel.'],
        [false, 'Placer le brassard sur la fosse antécubitale.', 'Cette localisation peut comprimer les nerfs ulnaire, médian et radial.'],
        [true, 'Positionner le brassard au-dessus du pli du coude.', 'La manchette libère ainsi les structures nerveuses de la fosse.'],
        [false, 'Prononcer systématiquement l’avant-bras en abduction.', 'La supination ou la neutralité est privilégiée pour limiter la compression ulnaire.'],
      ]),
      qcm('Quels changements produit la position de Trendelenburg ?', src('b00027', 'b00030'), 'La bascule tête basse augmente les pressions veineuses centrales et céphaliques tout en dégradant les volumes respiratoires.', [
        [true, 'Une augmentation du retour veineux systémique.', 'Le sang des membres inférieurs se déplace vers le thorax.'],
        [true, 'Une élévation des pressions intracrânienne et intraoculaire.', 'Le drainage veineux de la tête est défavorisé par la déclivité.'],
        [false, 'Une amélioration systématique de la compliance respiratoire.', 'Le diaphragme est repoussé vers le thorax et la compliance diminue.'],
        [true, 'Une réduction de la capacité résiduelle fonctionnelle.', 'La position accentue la compression pulmonaire, surtout chez le patient obèse.'],
        [false, 'Une indication privilégiée en hypertension intracrânienne.', 'La congestion veineuse peut aggraver une pression intracrânienne déjà élevée.'],
      ]),
      qcm('Comment stabiliser un patient en Trendelenburg prononcé ?', src('b00030'), 'La prévention du glissement repose sur l’adhérence, les sangles et le contrôle segmentaire, sans pression sus-claviculaire.', [
        [true, 'Employer un matelas antidérapant.', 'La friction limite le déplacement du tronc sans concentrer une force sur les épaules.'],
        [true, 'Privilégier les bras en adduction.', 'Cette disposition réduit le risque plexique dans une forte déclivité.'],
        [false, 'Bloquer les épaules par deux appuis rigides sus-claviculaires.', 'Ces supports exposent à la compression du plexus brachial.'],
        [true, 'Sangler les membres et vérifier leur stabilité.', 'Les changements d’inclinaison peuvent mobiliser séparément bras et jambes.'],
        [true, 'Stabiliser la tête contre le ballottement latéral.', 'Des coussins en mousse évitent les mouvements cervicaux incontrôlés.'],
      ]),
    ],
  },
  {
    label: 'QCM — Série 4 · Lithotomie', allowed_voies: ['interne'], questions: [
      qcm('Quels repères appartiennent à une installation correcte en lithotomie ?', src('b00032', 'b00033'), 'La géométrie doit rester symétrique, avec rotation externe minimale et mobilisation simultanée des deux membres.', [
        [true, 'Une flexion de hanche comprise entre 60 et 170°.', 'Cette plage décrit l’installation usuelle, à adapter sans flexion excessive.'],
        [true, 'Une flexion du genou comprise entre 90 et 120°.', 'Le genou fléchi place la jambe sur son support sans imposer une extension.'],
        [true, 'Un angle entre les cuisses ne dépassant pas 90°.', 'Limiter l’abduction réduit les contraintes articulaires et nerveuses.'],
        [false, 'Une rotation externe maximale de la hanche.', 'La rotation doit au contraire rester minimale.'],
        [true, 'Une élévation simultanée des deux jambes.', 'La symétrie prévient une torsion de la colonne lombaire.'],
      ]),
      qcm('Quelles variations surviennent lors des transitions de lithotomie ?', src('b00034', 'b00035', 'b00036'), 'Élever les jambes centralise le volume sanguin ; les abaisser produit le mouvement inverse et peut provoquer une hypotension.', [
        [true, 'Le retour veineux augmente pendant l’élévation.', 'Le sang des membres inférieurs rejoint le compartiment thoracique.'],
        [true, 'Le débit cardiaque peut augmenter une fois les jambes levées.', 'La précharge accrue favorise le volume éjecté si le cœur le tolère.'],
        [true, 'La compliance respiratoire diminue dans la position.', 'Les cuisses et le contenu abdominal limitent davantage le déplacement diaphragmatique.'],
        [false, 'La pression artérielle monte nécessairement lors de l’abaissement.', 'La diminution de précharge expose au contraire à une chute tensionnelle.'],
        [true, 'Une surveillance hémodynamique accompagne le retour en décubitus dorsal.', 'La transition inverse doit être anticipée et traitée si elle devient symptomatique.'],
      ]),
      qcm('Quels nerfs peuvent être lésés en lithotomie ?', src('b00039'), 'Les supports et les angles de hanche exposent plusieurs troncs du plexus lombosacré, particulièrement le fémoral et le fibulaire commun.', [
        [true, 'Le nerf fémoral sous le ligament inguinal.', 'Une forte flexion de hanche peut l’y comprimer.'],
        [true, 'Le nerf fibulaire commun à la tête de la fibula.', 'Son trajet superficiel est directement exposé au support de jambe.'],
        [true, 'Le nerf sciatique.', 'Une traction ou une position extrême du membre peut affecter ce tronc.'],
        [true, 'Le nerf obturateur.', 'Il fait partie des atteintes décrites avec cette position.'],
        [false, 'Le nerf facial par contact avec l’étrier.', 'Le visage n’est pas en relation anatomique avec les supports des membres inférieurs.'],
      ]),
      qcm('Quels éléments favorisent un syndrome de compartiment en lithotomie ?', src('b00039'), 'La diminution de pression artérielle au niveau du membre élevé et la compression locale du support réduisent ensemble la perfusion tissulaire.', [
        [true, 'La jambe maintenue au-dessus du niveau du cœur.', 'Le gradient hydrostatique diminue la pression de perfusion distale.'],
        [true, 'Une pression prolongée contre le support.', 'La pression extrinsèque augmente la pression dans les loges musculaires.'],
        [true, 'Une intervention de longue durée.', 'Le temps prolonge ischémie et œdème dans un compartiment fermé.'],
        [false, 'Une mobilisation simultanée des deux jambes.', 'Cette précaution prévient surtout la torsion lombaire et ne crée pas le syndrome.'],
        [true, 'Une évolution possible vers la rhabdomyolyse.', 'La nécrose musculaire ischémique libère le contenu des fibres lésées.'],
      ]),
      qcm('Quels dangers spécifiques doivent être recherchés autour d’une table de lithotomie ou de traction ?', src('b00039', 'b00040'), 'Les parties mobiles et les supports périnéaux exposent à des traumatismes évitables par un contrôle visuel avant chaque manipulation.', [
        [true, 'Des doigts coincés lors du redressement de la table.', 'La jonction mobile peut emprisonner une main restée sous le plateau.'],
        [true, 'Une compression des organes génitaux par le support périnéal.', 'Le cylindre de contre-appui concentre une force importante sur le pelvis.'],
        [true, 'Une atteinte du nerf pudendal.', 'Une perte de sensibilité pénienne a été décrite après compression périnéale.'],
        [false, 'Une obligation de placer le support cylindrique sans rembourrage.', 'La zone doit être protégée et la pression minimisée.'],
        [false, 'Une sécurité acquise dès que la traction osseuse est correcte.', 'Alignement du fémur et protection des tissus doivent être surveillés séparément.'],
      ]),
    ],
  },
  {
    label: 'QCM — Série 5 · Décubitus latéral', allowed_voies: ['interne'], questions: [
      qcm('Quels éléments stabilisent un patient en décubitus latéral ?', src('b00042', 'b00046', 'b00047'), 'L’installation combine calage du tronc, flexion du membre dépendant, séparation des jambes et soutien axial de la tête.', [
        [true, 'Des appuis contre le thorax antérieur et le dos.', 'Ils empêchent le patient de rouler vers l’avant ou l’arrière.'],
        [true, 'Une flexion de hanche et de genou de la jambe dépendante.', 'Cette géométrie élargit la base de soutien du bassin.'],
        [true, 'Des coussins entre les membres inférieurs.', 'Ils séparent les saillies osseuses et protègent le nerf fibulaire.'],
        [false, 'Une rotation cervicale maximale vers la table.', 'La tête doit rester alignée avec la colonne.'],
        [true, 'Un dégagement de l’oreille dépendante.', 'L’oreille superficielle est vulnérable à une pression prolongée.'],
      ]),
      qcm('Comment protéger le paquet vasculonerveux axillaire dépendant ?', src('b00042'), 'Le support doit soulever le thorax juste sous l’aisselle pour libérer celle-ci, jamais la comprimer directement.', [
        [true, 'Placer un rouleau sous le thorax.', 'Le soulèvement thoracique crée un espace libre au creux axillaire.'],
        [false, 'Pousser le support en direction céphalique dans l’aisselle.', 'Cette pression comprimerait plexus brachial et vaisseaux axillaires.'],
        [true, 'Vérifier le pouls et la perfusion du membre dépendant.', 'Un contrôle distal peut révéler une compression vasculaire occultée.'],
        [true, 'Garder le bras dépendant étendu, neutre ou supiné.', 'Cette orientation limite les contraintes sur l’ulnaire et le plexus.'],
        [false, 'Confondre le rouleau thoracique avec un coussin axillaire direct.', 'La protection vient du dégagement, non d’un appui dans le creux.'],
      ]),
      qcm('Comment se distribuent ventilation et perfusion en décubitus latéral anesthésié ?', src('b00043', 'b00048'), 'La perfusion gravitationnelle favorise le poumon inférieur tandis que la ventilation mécanique se dirige davantage vers le poumon supérieur.', [
        [true, 'La perfusion prédomine dans le poumon dépendant.', 'La gravité augmente le débit sanguin vers les régions déclives.'],
        [true, 'La ventilation mécanique prédomine dans le poumon non dépendant.', 'La compliance relative favorise l’insufflation du poumon supérieur.'],
        [false, 'Ventilation et perfusion restent parfaitement appariées.', 'Leur divergence crée précisément une anomalie du rapport V/Q.'],
        [true, 'L’oxygénation artérielle peut se dégrader.', 'Une partie du débit traverse des zones moins ventilées.'],
        [false, 'Le poumon dépendant devient toujours non perfusé.', 'Il reçoit au contraire la plus grande part du débit pulmonaire.'],
      ]),
      qcm('Quelles positions des membres supérieurs sont appropriées en décubitus latéral ?', src('b00042', 'b00047'), 'Les deux bras sont portés devant le patient, chacun sur un appui qui respecte coude, épaule, nerf ulnaire et perfusion.', [
        [true, 'Le bras non dépendant légèrement fléchi et proné sur un support.', 'Cette installation évite sa traction vers le bas.'],
        [true, 'Le bras dépendant en extension et supination ou neutralité.', 'La face ulnaire du coude reste moins comprimée.'],
        [false, 'Le bras supérieur suspendu sans appui pendant toute la chirurgie.', 'Le poids du membre exercerait une traction continue sur l’épaule.'],
        [true, 'Une protection moelleuse des coudes.', 'Les saillies osseuses et le nerf ulnaire sont exposés des deux côtés.'],
        [false, 'Une abduction forcée au-delà de l’amplitude confortable.', 'Une contrainte extrême augmente le risque plexique.'],
      ]),
      qcm('Comment limiter les neuropathies lors d’une arthroscopie d’épaule en position latérale ?', src('b00049', 'b00050'), 'La traction nécessaire doit rester minimale et être associée à une géométrie d’épaule qui relâche le plexus brachial.', [
        [true, 'Réduire la force de traction sur le membre opéré.', 'La suspension prolongée transmet la contrainte aux nerfs du membre supérieur.'],
        [true, 'Maintenir l’abduction sous 90°.', 'Une amplitude plus grande augmente l’étirement plexique.'],
        [true, 'Ajouter une légère flexion de l’épaule.', 'La flexion modérée diminue la tension du plexus.'],
        [true, 'Utiliser une légère rotation interne.', 'Cette orientation contribue à relâcher les structures nerveuses.'],
        [false, 'Augmenter la traction si une paresthésie apparaît.', 'Un signe neurologique impose de réduire la contrainte, non de l’accentuer.'],
      ]),
    ],
  },
  {
    label: 'QCM — Série 6 · Décubitus ventral et voie aérienne', allowed_voies: ['interne'], questions: [
      qcm('Pourquoi faut-il dégager l’abdomen en décubitus ventral ?', src('b00052', 'b00053'), 'Un abdomen libre protège à la fois la mécanique respiratoire, le retour veineux rachidien et les tissus mammaires.', [
        [true, 'Pour préserver la capacité résiduelle fonctionnelle.', 'La compression abdominale repousse les viscères contre le diaphragme.'],
        [true, 'Pour limiter les pressions de ventilation.', 'Une meilleure compliance demande moins de pression pour délivrer le même volume.'],
        [true, 'Pour réduire la congestion des plexus veineux vertébraux.', 'La pression abdominale se transmet aux veines rachidiennes communicantes.'],
        [true, 'Pour diminuer les saignements de chirurgie spinale.', 'Une moindre pression veineuse réduit le suintement du champ opératoire.'],
        [false, 'Pour augmenter la lordose lors de toute chirurgie lombaire.', 'L’exposition rachidienne recherche souvent une réduction de lordose.'],
      ]),
      qcm('Quels points doivent être contrôlés sur la face en position ventrale ?', src('b00055', 'b00059', 'b00060', 'b00061'), 'La tête neutre repose sur un dispositif stable qui libère totalement yeux et nez et répartit la charge sur des zones tolérantes.', [
        [true, 'L’absence de pression sur les globes oculaires.', 'Une compression peut interrompre la perfusion rétinienne.'],
        [true, 'La perméabilité des narines.', 'Le support ne doit pas obstruer le nez ni gêner le passage d’air.'],
        [true, 'La neutralité de la colonne cervicale.', 'Une flexion prolongée expose moelle, racines et voies aériennes.'],
        [false, 'Un appui direct obligatoire sur le menton.', 'Le menton est un point de pression à protéger, non une cible imposée.'],
        [true, 'La stabilité du coussin troué ou du fer à cheval.', 'Un déplacement secondaire peut mettre soudainement l’œil en contact.'],
      ]),
      qcm('Comment installer les membres en décubitus ventral ?', src('b00054'), 'La position réduit les contraintes d’épaule et de coude et protège le nerf cutané latéral de cuisse contre les appuis pelviens.', [
        [true, 'Garder l’abduction des bras inférieure à 90°.', 'Cette limite protège le plexus brachial même lorsque les bras sont céphaliques.'],
        [false, 'Fléchir au maximum les coudes en pronation.', 'Cette combinaison augmente compression et étirement du nerf ulnaire.'],
        [true, 'Envisager les bras en adduction, paumes vers le patient.', 'Cette variante peut réduire l’étirement plexique.'],
        [true, 'Placer des coussins sous les jambes pour fléchir légèrement les genoux.', 'Les appuis diminuent la pression sur les genoux et les pieds.'],
        [true, 'Dégager la région proche de l’épine iliaque antérosupérieure.', 'Le nerf cutané latéral de cuisse y devient superficiel et compressible.'],
      ]),
      qcm('Quelles précautions concernent la sonde trachéale en décubitus ventral ?', src('b00072', 'b00073'), 'L’accès difficile rend toute perte de voie aérienne critique ; la prévention et le scénario de retournement doivent être prêts avant l’incident.', [
        [true, 'Renforcer la fixation de la sonde avant le retournement.', 'Une extubation accidentelle est plus difficile à traiter face contre table.'],
        [true, 'Garder une civière immédiatement disponible.', 'Elle permet de remettre rapidement le patient en décubitus dorsal.'],
        [true, 'Préparer une manœuvre coordonnée de retournement urgent.', 'La réintubation peut exiger un accès facial complet.'],
        [false, 'Attendre une désaturation profonde avant de mobiliser.', 'Une ventilation impossible impose une action précoce.'],
        [true, 'Rechercher un œdème des voies aériennes avant extubation.', 'La déclivité prolongée favorise une tuméfaction faciale et laryngée.'],
      ]),
      qcm('Quelles caractéristiques distinguent les supports rachidiens décrits ?', src('b00066', 'b00067', 'b00070', 'b00071'), 'Wilson modifie la courbure lombaire par deux appuis longitudinaux ; Jackson facilite imagerie et rotation mais complique l’accès anesthésique.', [
        [true, 'Le support Wilson comporte deux demi-lunes réglables.', 'Leur courbure s’adapte au patient et à l’ouverture intervertébrale recherchée.'],
        [true, 'La position genupectorale libère bien l’abdomen.', 'L’appui thoracique et pelvien laisse les viscères moins comprimés.'],
        [false, 'La position genupectorale supprime toute pression sur les genoux.', 'Une grande part du poids est au contraire reportée sur eux.'],
        [true, 'La table Jackson permet une rotation longitudinale à 360°.', 'Le cadre articulé autorise un retournement en sandwich.'],
        [true, 'Les piliers Jackson peuvent gêner l’accès au patient.', 'Les extrémités de la table limitent la proximité de l’anesthésiologiste.'],
      ]),
    ],
  },
  {
    label: 'QCM — Série 7 · Risque visuel', allowed_voies: ['interne'], questions: [
      qcm('Quels mécanismes expliquent une perte visuelle après chirurgie spinale ventrale ?', src('b00056', 'b00062'), 'La cécité peut résulter soit d’une obstruction artérielle rétinienne par pression locale, soit d’une perfusion insuffisante du nerf optique.', [
        [true, 'Une occlusion de l’artère centrale de la rétine.', 'Une pression externe peut arrêter le débit dans ce vaisseau.'],
        [true, 'Une neuropathie ischémique optique antérieure.', 'La partie antérieure du nerf peut souffrir d’un apport insuffisant en oxygène.'],
        [true, 'Une neuropathie ischémique optique postérieure.', 'Le segment rétrobulbaire peut également subir une ischémie.'],
        [false, 'Une abrasion cornéenne comme cause habituelle de cécité bilatérale permanente.', 'L’abrasion est douloureuse mais ne correspond pas au mécanisme profond décrit.'],
        [true, 'Une baisse de perfusion oculaire associant hypotension et congestion veineuse.', 'Les deux phénomènes réduisent le gradient qui nourrit les structures optiques.'],
      ]),
      qcm('Quels patients présentent un risque accru de neuropathie ischémique optique ?', src('b00056', 'b00062', 'b00063', 'b00064'), 'Le risque combine terrain vasculaire ou métabolique, diminution du transport d’oxygène et exposition opératoire prolongée ou hémorragique.', [
        [true, 'Un patient obèse opéré longtemps du rachis.', 'Obésité et durée figurent parmi les associations rapportées.'],
        [true, 'Un patient anémique avec pertes sanguines importantes.', 'La baisse de contenu artériel en oxygène menace le nerf optique.'],
        [true, 'Un patient diabétique et hypertendu.', 'Ces maladies vasculaires diminuent la réserve microcirculatoire.'],
        [false, 'Un patient sans perte sanguine lors d’une procédure très brève comme profil le plus typique.', 'Ce contexte ne réunit pas les facteurs opératoires majeurs décrits.'],
        [false, 'Une intervention brève sans anémie ni perte sanguine comme profil maximal.', 'Ce scénario ne cumule pas les principaux facteurs opératoires rapportés.'],
      ]),
      qcm('Quelles mesures réduisent le risque de perte visuelle en décubitus ventral ?', src('b00065'), 'La stratégie vise à maintenir le gradient de perfusion oculaire, le transport d’oxygène et l’absence de pression externe.', [
        [true, 'Éviter une hypotension contrôlée chez le patient à risque.', 'Une pression artérielle trop basse réduit directement l’apport au nerf optique.'],
        [true, 'Maintenir la tête neutre et un peu plus haute que le cœur.', 'Cette position diminue la congestion veineuse oculaire.'],
        [true, 'Choisir un seuil transfusionnel individualisé.', 'Le maintien du transport d’oxygène dépend du terrain et des pertes.'],
        [true, 'Envisager de fractionner une procédure complexe.', 'Réduire la durée continue d’exposition peut limiter le risque cumulé.'],
        [false, 'Comprimer périodiquement le globe pour vérifier son tonus.', 'Aucune pression directe n’est acceptable sur l’œil.'],
      ]),
      qcm('Que faut-il organiser après une chirurgie rachidienne ventrale à haut risque ?', src('b00065'), 'Une évaluation visuelle précoce accélère la reconnaissance d’un déficit et l’accès à une expertise ophtalmologique.', [
        [true, 'Interroger le patient sur sa vision dès que possible.', 'Un déficit doit être identifié avant qu’il ne reste méconnu plusieurs heures.'],
        [true, 'Comparer les deux yeux.', 'Les atteintes peuvent être bilatérales mais aussi asymétriques.'],
        [true, 'Contacter rapidement un ophtalmologiste en cas d’anomalie.', 'Une prise en charge spécialisée précoce permet d’objectiver le mécanisme.'],
        [false, 'Attendre systématiquement plusieurs semaines avant tout examen.', 'Le contrôle postopératoire est encouragé précocement chez les patients à risque.'],
        [false, 'Attribuer toute baisse visuelle à une simple sécheresse cornéenne.', 'Une plainte après chirurgie ventrale doit faire rechercher une atteinte rétinienne ou optique.'],
      ]),
      qcm('Quelles données chiffrées sont rapportées sur la perte visuelle en position ventrale ?', src('b00056'), 'Même rare, cette complication est grave : les séries rapportées soulignent la prédominance de la neuropathie optique et des formes bilatérales.', [
        [true, 'Une incidence pouvant atteindre 0,2 % après chirurgie spinale.', 'Cette estimation haute rappelle que le risque n’est pas purement théorique.'],
        [true, 'Une neuropathie ischémique optique dans 89 % d’une série de 93 cas.', 'Ce mécanisme dominait largement les pertes visuelles analysées.'],
        [true, 'Une atteinte bilatérale dans 66 % des cas de cette série.', 'La fréquence des formes des deux côtés renforce la gravité fonctionnelle.'],
        [false, 'Une récupération complète garantie dans toutes les formes.', 'Les pertes décrites peuvent être permanentes.'],
        [false, 'Une occlusion rétinienne comme seul mécanisme possible.', 'La neuropathie ischémique optique constitue l’autre mécanisme majeur.'],
      ]),
    ],
  },
  {
    label: 'QCM — Série 8 · Position assise et complications', allowed_voies: ['interne'], questions: [
      qcm('Quels risques ont limité l’usage de la position assise en neurochirurgie ?', src('b00079', 'b00080', 'b00085'), 'L’exposition chirurgicale favorable doit être mise en balance avec embolie gazeuse, baisse de précharge et risque de perfusion cérébrale insuffisante.', [
        [true, 'Une embolie gazeuse veineuse.', 'La position expose des veines opératoires à une pression subatmosphérique.'],
        [true, 'Une instabilité hémodynamique.', 'La verticalisation réduit le retour veineux.'],
        [true, 'Une ischémie cérébrale.', 'La pression au niveau de la tête peut devenir insuffisante malgré une mesure brachiale acceptable.'],
        [false, 'Une augmentation constante du retour veineux.', 'Le sang s’accumule plutôt dans les membres inférieurs.'],
        [false, 'Une impossibilité d’exposer la fosse postérieure.', 'Cette position procure justement une excellente exposition neurochirurgicale.'],
      ]),
      qcm('Comment installer un patient en semi-assise pour chirurgie de l’épaule ?', src('b00079', 'b00083', 'b00084'), 'L’élévation modérée du tronc s’accompagne d’un calage latéral, d’une tête neutre et de points d’appui protégés.', [
        [true, 'Élever le tronc d’environ 40°.', 'Cette inclinaison caractérise la variante en chaise longue décrite.'],
        [true, 'Déplacer le tronc vers le côté opéré sans perdre sa stabilité.', 'Ce décalage dégage l’épaule mais augmente le besoin de fixation.'],
        [true, 'Stabiliser la tête en position neutre.', 'Les tractions chirurgicales peuvent mobiliser le cou à l’insu de l’équipe.'],
        [true, 'Surveiller occiput, coudes et talons.', 'Ces saillies supportent une pression prolongée dans cette installation.'],
        [false, 'Laisser la tête libre pour accompagner les mouvements de l’épaule.', 'Une mobilité non contrôlée expose au déplacement cervical.'],
      ]),
      qcm('Quelles mesures préviennent l’hypotension lors du passage en position assise ?', src('b00080', 'b00085'), 'La stratégie soutient le volume central, ralentit la transition et restaure le tonus vasculaire si nécessaire.', [
        [true, 'Assurer un remplissage volémique adapté.', 'Une précharge suffisante limite la chute du débit après verticalisation.'],
        [true, 'Placer des bandes élastiques aux membres inférieurs.', 'La compression réduit l’accumulation sanguine dans les jambes.'],
        [true, 'Élever progressivement le tronc.', 'Une transition lente laisse le temps d’identifier et corriger la baisse tensionnelle.'],
        [true, 'Utiliser un vasopresseur si nécessaire.', 'Le médicament compense la vasodilatation et soutient la pression.'],
        [false, 'Interrompre le monitorage pendant la montée de table.', 'La phase de changement exige une surveillance renforcée.'],
      ]),
      qcm('Comment évaluer correctement la pression de perfusion cérébrale en position assise ?', src('b00085', 'b00094'), 'Le gradient hydrostatique entre bras et tête impose de référencer la mesure au niveau approximatif du cercle de Willis.', [
        [true, 'Placer le transducteur au niveau du tragus.', 'Ce repère approche la hauteur de la circulation intracrânienne.'],
        [false, 'Interpréter sans correction une pression mesurée au bras.', 'La pression cérébrale est plus basse lorsque la tête se situe au-dessus du brassard.'],
        [true, 'Tenir compte de la hauteur entre cœur et tête.', 'Chaque élévation crée une différence hydrostatique significative.'],
        [true, 'Éviter une cible cérébrale insuffisante malgré une PAM brachiale rassurante.', 'Une valeur périphérique normale peut masquer une hypoperfusion cérébrale.'],
        [false, 'Référencer le zéro au niveau des pieds.', 'Ce repère surestimerait encore davantage la pression disponible au cerveau.'],
      ]),
      qcm('Quelle conduite adopter devant une neuropathie postopératoire ?', src('b00088'), 'Le déficit doit être daté, objectivé et suivi ; le moment de l’EMG dépend de la question diagnostique.', [
        [true, 'Réaliser un examen neurologique complet.', 'La topographie clinique oriente vers le nerf et le niveau atteints.'],
        [true, 'Documenter facteurs de risque, chronologie et évolution.', 'Ces éléments aident à comprendre le mécanisme et à suivre la récupération.'],
        [true, 'Demander un avis neurologique.', 'L’expertise spécialisée précise le bilan et le pronostic.'],
        [false, 'Considérer qu’une EMG à J1 prouve une dénervation récente.', 'Les signes musculaires nouveaux apparaissent seulement après trois à quatre semaines.'],
        [true, 'Répéter ou programmer l’EMG vers quatre semaines pour la lésion récente.', 'Les modifications de dénervation apparaissent après trois à quatre semaines.'],
      ]),
    ],
  },
];

const DP_QCM_SERIES = [
  {
    label: 'DP QCM 1 · Prostatectomie robotique en Trendelenburg', allowed_voies: ['interne'],
    vignette: 'Un homme de 68 ans, obèse et hypertendu, doit subir une prostatectomie robotique. L’intervention nécessite un Trendelenburg prononcé pendant plusieurs heures. Il est anesthésié, curarisé et ne peut signaler aucun inconfort. L’équipe prépare la table, les moyens de fixation et la surveillance des effets céphaliques et respiratoires de la déclivité.',
    questions: [
      qcm('Quels risques doivent être anticipés avant l’installation ?', src('b00006', 'b00010', 'b00027', 'b00030'), 'Obésité, durée et forte angulation cumulent risques de glissement, neuropathie, congestion céphalique et dégradation respiratoire.', [
        [true, 'Une aggravation de la baisse de compliance respiratoire.', 'L’obésité et la déclivité repoussent davantage le diaphragme vers le thorax.'],
        [true, 'Une augmentation des pressions intracrânienne et intraoculaire.', 'Le drainage veineux céphalique devient moins favorable tête basse.'],
        [true, 'Une chute du patient lors des mouvements de table.', 'La composante de glissement augmente avec l’angulation extrême.'],
        [true, 'Une neuropathie favorisée par la durée opératoire.', 'La contrainte prolongée augmente l’exposition des nerfs et des tissus.'],
        [false, 'Une amélioration garantie de l’oxygénation par la position.', 'La CRF et la compliance diminuent, surtout chez l’obèse.'],
      ]),
      qcm('Quelles mesures de fixation sont appropriées ?', src('b00010', 'b00030'), 'La stabilisation doit empêcher le glissement sans concentrer la pression sur les creux sus-claviculaires.', [
        [true, 'Utiliser un matelas antidérapant sous le patient.', 'L’adhérence répartie évite un arrêt focal du corps par les épaules.'],
        [true, 'Placer les bras en adduction et les sécuriser.', 'Cette position protège mieux le plexus lors d’une forte déclivité.'],
        [false, 'Appuyer deux butées rigides au-dessus des clavicules.', 'Ces épaulières peuvent comprimer directement le plexus brachial.'],
        [true, 'Sangler le tronc et les membres sans créer de point focal.', 'Les courroies limitent les déplacements indépendants des segments.'],
        [true, 'Vérifier les charges autorisées pour l’angulation choisie.', 'La capacité de la table dépend de son orientation réelle.'],
      ], 'La table sera inclinée à 30° tête basse après mise en place des trocarts.'),
      qcm('Comment interpréter ces modifications ?', src('b00020', 'b00027'), 'La déclivité et le pneumopéritoine réduisent le volume pulmonaire disponible ; une PEP peut restaurer partiellement l’ouverture des petites voies.', [
        [true, 'La baisse de compliance est cohérente avec la compression diaphragmatique.', 'Le contenu abdominal se déplace vers le thorax en position tête basse.'],
        [true, 'La fermeture de petites voies peut créer un effet shunt.', 'Des unités perfusées cessent d’être correctement ventilées.'],
        [false, 'La position garantit une baisse des pressions ventilatoires.', 'Les pressions augmentent lorsque la compliance se dégrade.'],
        [true, 'Une PEP peut améliorer l’oxygénation.', 'Elle aide à maintenir ouvertes les unités proches du volume de fermeture.'],
        [true, 'L’obésité accentue le mécanisme.', 'Le poids abdominal réduit davantage la CRF.'],
      ], 'Après le basculement, les pressions inspiratoires augmentent et la saturation passe de 99 à 93 %.'),
      qcm('Quelles explications sont plausibles ?', src('b00027'), 'La congestion veineuse de la tête accompagne le Trendelenburg et peut augmenter les pressions intracrânienne et oculaire.', [
        [true, 'Le drainage veineux cérébral est ralenti.', 'La déclivité gêne le retour du sang depuis le crâne.'],
        [true, 'La pression intraoculaire peut s’élever.', 'La congestion veineuse se transmet au compartiment oculaire.'],
        [false, 'La déclivité diminue toujours la pression intracrânienne.', 'L’effet attendu est une augmentation par réduction du drainage.'],
        [true, 'Une hypertension intracrânienne préalable aurait constitué une contre-indication relative forte.', 'La position aggrave un gradient déjà défavorable.'],
        [false, 'La rougeur exclut tout effet hémodynamique central.', 'Elle traduit justement une redistribution veineuse céphalique.'],
      ], 'Deux heures plus tard, le visage devient congestif et les conjonctives sont œdématiées.'),
      qcm('Quels contrôles sont indiqués ?', src('b00017', 'b00018', 'b00030'), 'Une position prolongée doit être réinspectée : protection cornéenne, absence de pression oculaire, stabilité de la tête et intégrité des fixations.', [
        [true, 'Vérifier que les paupières restent fermées.', 'L’œdème et les mouvements peuvent déplacer la protection initiale.'],
        [true, 'Rechercher toute pression exercée par un dispositif sur les yeux.', 'La congestion rend le globe encore plus vulnérable à une force externe.'],
        [true, 'Contrôler la stabilité de la tête.', 'Les inclinaisons latérales peuvent provoquer un ballottement cervical.'],
        [true, 'Réexaminer sangles et position des bras.', 'Un glissement progressif peut créer une traction plexique secondaire.'],
        [false, 'Attendre le réveil pour examiner les appuis.', 'La prévention exige une correction pendant que l’exposition se poursuit.'],
      ], 'Lors d’une pause chirurgicale, l’équipe peut accéder brièvement à la tête et aux membres.'),
      qcm('Quelles mesures accompagnent cette transition ?', src('b00030'), 'La remontée doit être graduelle sous surveillance car la redistribution sanguine inverse les effets du Trendelenburg.', [
        [true, 'Redresser progressivement le plateau.', 'Une transition lente limite les variations brutales de précharge.'],
        [true, 'Surveiller étroitement la pression artérielle.', 'La fin de la centralisation veineuse peut faire apparaître une hypotension.'],
        [true, 'Contrôler la fixation pendant le mouvement.', 'Les vecteurs de glissement changent au cours de la remontée.'],
        [false, 'Retirer toutes les sangles avant de relever la table.', 'Le patient doit rester stabilisé jusqu’au retour complet à une position sûre.'],
        [false, 'Considérer que l’hémodynamique ne change qu’après le réveil.', 'La redistribution survient immédiatement pendant le basculement.'],
      ], 'À la fin de la chirurgie, la table revient du Trendelenburg vers l’horizontale.'),
      qcm('Quels éléments doivent être inscrits dans le dossier ?', src('b00011', 'b00090'), 'La traçabilité relie position, durée, moyens de protection, contrôles répétés et réactions physiologiques observées.', [
        [true, 'L’angulation et la durée du Trendelenburg.', 'Ces données quantifient l’exposition à la déclivité.'],
        [true, 'Le type de matelas et les sangles utilisés.', 'Les accessoires démontrent la stratégie de stabilisation.'],
        [true, 'Les vérifications des yeux, de la tête et des bras.', 'Elles attestent une surveillance active des zones à risque.'],
        [true, 'Les modifications respiratoires survenues après bascule.', 'La chronologie aide à attribuer le retentissement à la position.'],
        [false, 'Uniquement la mention « position correcte ».', 'Une formule générale ne précise ni appuis, ni durée, ni contrôles.'],
      ], 'En salle de réveil, aucun déficit n’est constaté et l’équipe complète la feuille d’anesthésie.'),
    ],
  },
  {
    label: 'DP QCM 2 · Lithotomie prolongée et douleur de jambe', allowed_voies: ['interne'],
    vignette: 'Une femme de 59 ans doit subir une chirurgie pelvienne estimée à six heures en position de lithotomie. Elle est diabétique et présente une artériopathie modérée. Deux supports de jambe sont préparés. L’équipe veut limiter les contraintes lombaires, les compressions nerveuses et la baisse de perfusion des membres inférieurs.',
    questions: [
      qcm('Quels éléments augmentent son risque de complication de position ?', src('b00006', 'b00032', 'b00039'), 'Le terrain vasculonerveux et la durée prévue réduisent la tolérance des membres aux appuis et à la baisse de pression de perfusion.', [
        [true, 'Le diabète.', 'Une neuropathie ou microangiopathie peut rendre les nerfs moins résistants.'],
        [true, 'L’artériopathie périphérique.', 'Le débit distal possède déjà une réserve limitée.'],
        [true, 'La durée opératoire de six heures.', 'Une contrainte prolongée favorise neuropathie et syndrome de compartiment.'],
        [false, 'Le sexe féminin comme facteur isolé établi.', 'Le sexe masculin, et non féminin, figure dans la liste de risque générale.'],
        [true, 'L’élévation durable des jambes.', 'Le gradient hydrostatique diminue la pression de perfusion dans le membre.'],
      ]),
      qcm('Quelles règles d’installation doivent être respectées ?', src('b00032', 'b00033', 'b00034'), 'Les angles restent modérés et symétriques ; les deux jambes sont mobilisées ensemble pour protéger bassin et colonne.', [
        [true, 'Fléchir les genoux entre 90 et 120°.', 'Cette plage correspond à la position décrite pour les supports.'],
        [true, 'Limiter l’angle entre les cuisses à 90°.', 'Une abduction plus importante augmente les contraintes pelviennes.'],
        [true, 'Réduire au minimum la rotation externe des hanches.', 'La rotation forcée ajoute une tension articulaire et nerveuse.'],
        [true, 'Soulever les deux membres simultanément.', 'Une élévation asymétrique tord le rachis lombaire.'],
        [false, 'Installer une jambe entièrement avant de toucher l’autre.', 'Cette séquence crée précisément une torsion du bassin et du dos.'],
      ], 'Après induction, quatre personnes se répartissent de part et d’autre de la table pour lever les jambes.'),
      qcm('Quels changements faut-il anticiper ?', src('b00034', 'b00035', 'b00036'), 'Le passage en lithotomie centralise le sang et gêne la mécanique thoracoabdominale ; le retour à plat produira l’inverse.', [
        [true, 'Une augmentation du retour veineux.', 'L’élévation des membres transfère du volume vers le thorax.'],
        [true, 'Une hausse possible du débit cardiaque.', 'La précharge accrue peut augmenter le volume éjecté.'],
        [true, 'Une diminution de la compliance respiratoire.', 'La flexion des cuisses favorise le déplacement abdominal vers le diaphragme.'],
        [false, 'Une chute tensionnelle obligatoire dès l’élévation.', 'La baisse de pression est surtout anticipée lors de l’abaissement.'],
        [true, 'Une surveillance lors des deux transitions.', 'La mise en position et le retour à plat modifient rapidement la physiologie.'],
      ], 'Les deux jambes sont élevées ; la pression artérielle augmente légèrement tandis que les pressions ventilatoires montent.'),
      qcm('Quelles compressions faut-il rechercher ?', src('b00039'), 'Le trajet superficiel du nerf fibulaire commun sur la tête de la fibula le rend particulièrement vulnérable aux supports de jambe.', [
        [true, 'Un appui sur la tête de la fibula.', 'Le nerf fibulaire commun contourne cette zone osseuse superficielle.'],
        [true, 'Une flexion de hanche excessivement prononcée.', 'Le nerf fémoral peut être comprimé sous le ligament inguinal.'],
        [false, 'Une compression du nerf facial par l’étrier de jambe.', 'Ce nerf ne traverse pas le membre inférieur.'],
        [true, 'Une pression localisée du mollet contre le support.', 'Elle augmente la pression des compartiments musculaires.'],
        [true, 'Une perfusion distale diminuée par la hauteur du membre.', 'La jambe au-dessus du cœur reçoit une pression artérielle plus faible.'],
      ], 'Au contrôle de la troisième heure, le bord externe du support appuie nettement contre la tête de la fibula droite.'),
      qcm('Quelles actions sont adaptées ?', src('b00039'), 'La prévention d’un syndrome de compartiment impose de supprimer la pression focale et de rechercher des signes de perfusion ou de tension tissulaire anormales.', [
        [true, 'Repositionner immédiatement le support.', 'La contrainte sur la fibula et le mollet doit être levée sans délai.'],
        [true, 'Palper les loges de la jambe si elles sont accessibles.', 'Une tension croissante peut annoncer un œdème compartimental.'],
        [true, 'Évaluer la perfusion distale.', 'Pouls, température et coloration renseignent sur le débit du membre.'],
        [false, 'Augmenter la pression du support pour stabiliser la jambe.', 'Une force supplémentaire aggraverait l’ischémie locale.'],
        [true, 'Documenter la correction et poursuivre des contrôles rapprochés.', 'Le temps d’exposition déjà écoulé justifie une surveillance répétée.'],
      ], 'La jambe droite paraît plus tendue que la gauche et le pied devient plus froid.'),
      qcm('Quelles précautions prendre lors du retour à plat ?', src('b00035', 'b00036', 'b00039'), 'L’abaissement simultané protège le rachis et retire brutalement du volume central ; mains et doigts doivent aussi être dégagés des parties mobiles.', [
        [true, 'Abaisser les deux jambes en même temps.', 'La symétrie évite une torsion lombaire en sens inverse.'],
        [true, 'Anticiper une baisse de pression artérielle.', 'Le sang se redistribue vers les membres inférieurs.'],
        [true, 'Vérifier la position des mains avant de redresser le plateau.', 'Les doigts peuvent être coincés dans la jonction mobile de la table.'],
        [false, 'Retirer le monitorage jusqu’à la fin de la manœuvre.', 'La transition hémodynamique doit être observée en continu.'],
        [true, 'Préparer un traitement si l’hypotension devient significative.', 'La baisse de précharge peut nécessiter une correction immédiate.'],
      ], 'À la fin de l’intervention, le chirurgien demande l’abaissement rapide des jambes et le redressement de la partie distale de la table.'),
      qcm('Quelle conduite postopératoire est justifiée ?', src('b00039', 'b00088'), 'Une douleur disproportionnée avec déficit moteur après longue lithotomie impose un bilan urgent de syndrome de compartiment et de neuropathie.', [
        [true, 'Examiner la motricité et la sensibilité du pied.', 'La topographie aide à distinguer atteinte fibulaire et souffrance musculaire.'],
        [true, 'Rechercher une douleur à l’étirement passif.', 'Ce signe soutient une hyperpression dans les loges.'],
        [true, 'Alerter rapidement l’équipe chirurgicale.', 'Un syndrome de compartiment menace muscle et nerf et ne doit pas attendre.'],
        [false, 'Attribuer la faiblesse à l’anesthésie sans examen.', 'Le contexte cumule des facteurs spécifiques de lésion de position.'],
        [true, 'Tracer la chronologie, les appuis et les corrections effectuées.', 'Ces informations éclairent le mécanisme et le suivi neurologique.'],
      ], 'Au réveil, la patiente décrit une douleur intense de la jambe droite et relève difficilement le pied.'),
    ],
  },
  {
    label: 'DP QCM 3 · Lobectomie en décubitus latéral', allowed_voies: ['interne'],
    vignette: 'Un homme de 72 ans doit subir une lobectomie droite en décubitus latéral gauche. Il présente une maladie pulmonaire chronique modérée. Après induction, l’équipe prépare le calage du tronc, les deux membres supérieurs, la tête et le rouleau thoracique destiné à dégager l’aisselle dépendante.',
    questions: [
      qcm('Quels points appartiennent à une installation latérale sûre ?', src('b00042', 'b00046', 'b00047'), 'La stabilité globale ne doit pas se faire au prix d’une compression de l’oreille, de l’œil, de l’aisselle ou des nerfs superficiels.', [
        [true, 'Fléchir hanche et genou de la jambe dépendante.', 'Cette configuration participe au calage du bassin.'],
        [true, 'Séparer les jambes par des coussins.', 'Le rembourrage évite le contact direct des saillies osseuses.'],
        [true, 'Maintenir la tête alignée avec le rachis.', 'La neutralité prévient traction cervicale et plexique.'],
        [true, 'Dégager l’oreille et le côté de l’œil dépendants.', 'Ces structures superficielles subissent facilement une pression prolongée.'],
        [false, 'Laisser le thorax sans calage antérieur ni postérieur.', 'Des appuis sont nécessaires pour empêcher la rotation du patient.'],
      ]),
      qcm('Comment corriger ce montage ?', src('b00042'), 'Le rouleau doit agir sous le thorax afin de soulever le corps et libérer l’aisselle, sans force dirigée vers le paquet vasculonerveux.', [
        [true, 'Reculer le rouleau vers la paroi thoracique.', 'Le support crée alors un espace au creux axillaire.'],
        [false, 'Le pousser plus profondément dans l’aisselle.', 'Cette manœuvre augmente la compression plexique et vasculaire.'],
        [true, 'Contrôler la perfusion du bras dépendant.', 'Une anomalie distale peut révéler une compression des vaisseaux axillaires.'],
        [true, 'Réévaluer la position après fixation définitive du tronc.', 'Le calage peut déplacer le support secondairement.'],
        [false, 'Accepter une pression directe si le rouleau est souple.', 'Même moelleuse, une force céphalique dans l’aisselle reste dangereuse.'],
      ], 'Juste avant l’incision, le rouleau mousse est palpé directement dans le creux axillaire gauche.'),
      qcm('Quels mécanismes expliquent cette évolution ?', src('b00043', 'b00048'), 'En latéral, la perfusion descend vers le poumon inférieur alors que la ventilation mécanique préfère le poumon supérieur, créant un déséquilibre V/Q.', [
        [true, 'Le poumon dépendant reçoit davantage de perfusion.', 'La gravité dirige le débit sanguin vers les zones déclives.'],
        [true, 'Le poumon non dépendant reçoit davantage de ventilation.', 'Sa mécanique sous pression positive favorise son insufflation.'],
        [true, 'Une partie du sang traverse des unités relativement peu ventilées.', 'Cette perfusion mal appariée diminue l’oxygénation artérielle.'],
        [false, 'La perfusion est abolie dans le poumon inférieur.', 'Elle y prédomine au lieu de disparaître.'],
        [false, 'La position latérale assure toujours un appariement optimal.', 'Le décalage entre les deux distributions constitue une limite connue.'],
      ], 'Après mise en position et début de la ventilation, la saturation baisse progressivement de 98 à 91 %.'),
      qcm('Quelles anomalies faut-il corriger ?', src('b00042', 'b00047'), 'Le bras dépendant doit rester étendu et neutre ou supiné, tandis que le bras supérieur repose devant le patient sans traction d’épaule.', [
        [true, 'La pronation forcée du bras dépendant.', 'Elle expose davantage la région ulnaire au contact de la table.'],
        [true, 'La flexion excessive du coude inférieur.', 'L’angle marqué comprime le nerf dans la gouttière cubitale.'],
        [true, 'L’absence de support du bras non dépendant.', 'Le poids du membre supérieur tire sur l’épaule et le plexus.'],
        [false, 'La présence d’un coussin sous le coude supérieur.', 'Un appui moelleux correctement placé protège la saillie osseuse.'],
        [true, 'Une tension visible de l’épaule droite.', 'Le membre doit être rapproché d’une amplitude confortable.'],
      ], 'Au contrôle des membres, le bras gauche dépendant est très fléchi et proné ; le bras droit pend en avant de son support.'),
      qcm('Quelle conduite protège le plexus brachial ?', src('b00049', 'b00050'), 'La suspension d’épaule doit employer la traction la plus faible compatible avec l’exposition et garder une géométrie qui relâche le plexus.', [
        [true, 'Limiter la force de traction.', 'La tension appliquée au bras se transmet directement aux structures nerveuses.'],
        [true, 'Conserver une abduction inférieure à 90°.', 'Au-delà, le plexus subit un étirement accru.'],
        [true, 'Conserver un discret degré de flexion glénohumérale.', 'Cette géométrie rapproche les insertions et relâche le trajet plexique.'],
        [true, 'Choisir une légère rotation interne.', 'Elle participe à une orientation moins tendue du plexus.'],
        [false, 'Augmenter la suspension pour empêcher tout mouvement.', 'La stabilité ne justifie pas une traction nerveuse excessive.'],
      ], 'Pour améliorer l’accès à l’épaule, le chirurgien propose de suspendre davantage le membre supérieur droit.'),
      qcm('Quelles causes positionnelles sont plausibles ?', src('b00042', 'b00047'), 'Une compression persistante de l’aisselle ou un calage thoracique déplacé peut compromettre le plexus ou les vaisseaux du bras dépendant.', [
        [true, 'Le rouleau thoracique a migré vers l’aisselle.', 'Un support déplacé peut comprimer le paquet vasculonerveux.'],
        [true, 'Le calage antérieur exerce une pression sur le thorax et l’épaule.', 'Une force mal répartie peut modifier la perfusion ou la position du membre.'],
        [true, 'Le membre inférieur de table a tourné sous le tronc.', 'Une rotation du corps peut coincer l’épaule dépendante.'],
        [false, 'Le simple fait que le bras supérieur soit rembourré.', 'Un appui protecteur sans contrainte n’explique pas la variation distale.'],
        [true, 'Une vérification immédiate de tous les appuis est nécessaire.', 'La correction du mécanisme précède toute conclusion neurologique.'],
      ], 'À la quatrième heure, le signal pléthysmographique du bras gauche devient faible alors que la pression systémique reste stable.'),
      qcm('Quels contrôles effectuer avant le transfert ?', src('b00014', 'b00016', 'b00090'), 'Le retour dorsal est un second positionnement : il exige maintien cervical, coordination et examen des zones précédemment dépendantes.', [
        [true, 'Attribuer une personne au contrôle de la tête et de la sonde.', 'La mobilisation en bloc protège axe cervical et voie aérienne.'],
        [true, 'Inspecter l’oreille, l’œil et l’épaule gauches.', 'Ces structures ont supporté la déclivité et les appuis.'],
        [true, 'Comparer la perfusion et la motricité des deux bras au réveil.', 'Une asymétrie peut révéler une complication de position.'],
        [false, 'Retourner le patient sans synchronisation puisque la chirurgie est terminée.', 'Le risque mécanique persiste pendant toute mobilisation.'],
        [true, 'Tracer la position du rouleau et les corrections effectuées.', 'La chronologie devient essentielle si un déficit apparaît.'],
      ], 'La lobectomie se termine et l’équipe prépare le retour en décubitus dorsal.'),
    ],
  },
  {
    label: 'DP QCM 4 · Chirurgie rachidienne et menace visuelle', allowed_voies: ['interne'],
    vignette: 'Une femme de 64 ans, obèse, diabétique et anémique, doit subir une arthrodèse lombaire longue en décubitus ventral. Des pertes sanguines importantes sont possibles. L’équipe choisit des supports longitudinaux, planifie la position de la tête et discute une stratégie de perfusion oculaire.',
    questions: [
      qcm('Quels facteurs augmentent son risque de perte visuelle ?', src('b00056', 'b00062', 'b00063', 'b00064'), 'Terrain vasculaire, obésité, anémie, durée et hémorragie constituent un profil cumulé de neuropathie ischémique optique.', [
        [true, 'L’obésité.', 'Elle est associée aux cas de neuropathie optique après chirurgie spinale.'],
        [true, 'Une microangiopathie diabétique connue.', 'L’atteinte vasculaire chronique réduit la réserve perfusionnelle du nerf optique.'],
        [true, 'L’anémie préopératoire.', 'Le contenu artériel en oxygène est déjà diminué avant toute perte.'],
        [true, 'La durée prévue de l’arthrodèse.', 'L’exposition prolongée augmente congestion et temps d’hypoperfusion.'],
        [false, 'L’absence prévue de toute perte sanguine pendant une procédure brève.', 'Ce scénario ne correspond ni au risque hémorragique ni à la longue durée annoncés.'],
      ]),
      qcm('Quelles vérifications sont nécessaires ?', src('b00055', 'b00059', 'b00060', 'b00061'), 'Le support facial doit maintenir le cou neutre et garder yeux et nez entièrement libres ; tous les appuis ventraux sont contrôlés.', [
        [true, 'Confirmer l’absence de contact avec les globes oculaires.', 'Une pression directe peut occlure l’artère centrale de la rétine.'],
        [true, 'Vérifier la perméabilité des narines.', 'Le coussin ne doit pas obstruer le nez.'],
        [true, 'Maintenir le rachis cervical en position neutre.', 'La flexion excessive menace moelle, racines et drainage veineux.'],
        [true, 'Inspecter menton, seins, crêtes iliaques et genoux.', 'Ces zones figurent parmi les principaux points de compression.'],
        [false, 'Tolérer un appui oculaire léger si la pression artérielle est normale.', 'La perfusion rétinienne peut être interrompue malgré une pression systémique correcte.'],
      ], 'Après le retournement, la tête repose dans un coussin troué et les appuis sont accessibles.'),
      qcm('Pourquoi faut-il corriger cette situation ?', src('b00052', 'b00053'), 'La compression abdominale dégrade la compliance et transmet une pression aux plexus veineux vertébraux, ce qui augmente les saignements.', [
        [true, 'Le diaphragme est repoussé vers le thorax.', 'La pression viscérale diminue les volumes pulmonaires.'],
        [true, 'La capacité résiduelle fonctionnelle peut baisser.', 'Le volume téléexpiratoire diminue quand l’abdomen n’est pas libre.'],
        [true, 'Les pressions de ventilation peuvent augmenter.', 'Une compliance réduite exige davantage de pression pour le même volume.'],
        [true, 'La congestion veineuse rachidienne peut majorer le saignement.', 'Les veines abdominales communiquent avec les plexus vertébraux.'],
        [false, 'Une compression abdominale améliore l’exposition par diminution du saignement.', 'Le mécanisme veineux produit au contraire l’effet opposé.'],
      ], 'Une hausse des pressions ventilatoires apparaît et l’abdomen est comprimé contre la table.'),
      qcm('Quelles adaptations sont cohérentes ?', src('b00065'), 'La préservation du nerf optique repose sur une pression artérielle suffisante, une moindre congestion veineuse et un transport d’oxygène adapté.', [
        [true, 'Éviter l’hypotension contrôlée.', 'Une baisse volontaire de pression réduirait la perfusion optique.'],
        [true, 'Individualiser la cible de pression artérielle à la hausse.', 'Le risque vasculaire justifie une marge perfusionnelle plus importante.'],
        [true, 'Maintenir la tête légèrement au-dessus du cœur.', 'Cette relation facilite le drainage veineux oculaire.'],
        [true, 'Réévaluer le seuil transfusionnel pendant l’hémorragie.', 'L’anémie sévère diminue l’oxygénation du nerf optique.'],
        [false, 'Abaisser la tête sous le cœur pour congestionner l’œil.', 'La congestion augmente la pression veineuse et réduit le gradient de perfusion.'],
      ], 'Après quatre heures et des pertes abondantes, l’hémoglobine baisse et la pression artérielle devient limite.'),
      qcm('Quels contrôles sont prioritaires ?', src('b00055', 'b00065'), 'Même sans accès visuel permanent, l’équipe doit vérifier régulièrement l’absence de pression, la neutralité et la hauteur de la tête.', [
        [true, 'Contrôler de nouveau les deux yeux.', 'Le coussin peut se déplacer avec l’œdème ou les manipulations.'],
        [true, 'Vérifier la neutralité cervicale.', 'Une rotation secondaire peut gêner drainage et perfusion.'],
        [true, 'S’assurer que la tête reste au-dessus du cœur.', 'La hauteur contribue à réduire la pression veineuse intraoculaire.'],
        [false, 'Reporter tout contrôle oculaire jusqu’au lendemain.', 'Le mécanisme préventif doit être corrigé avant la fin de l’exposition.'],
        [true, 'Rechercher un gonflement facial.', 'L’œdème signale une congestion et peut déplacer les appuis.'],
      ], 'Le chirurgien marque une pause avant la dernière étape ; le visage est plus œdématié qu’au début.'),
      qcm('Quelles options réduisent l’exposition au risque ?', src('b00065'), 'Lorsque la durée et les pertes deviennent majeures, le fractionnement de la procédure peut compléter les mesures de perfusion.', [
        [true, 'Discuter l’arrêt après une étape chirurgicale sûre.', 'Le fractionnement limite la durée continue d’exposition ventrale.'],
        [true, 'Corriger l’anémie selon le terrain.', 'Un transport d’oxygène suffisant protège les tissus ischémiques.'],
        [true, 'Maintenir une pression artérielle adaptée.', 'Le gradient de perfusion optique dépend de la pression d’amont.'],
        [false, 'Poursuivre coûte que coûte malgré une instabilité croissante.', 'La balance bénéfice-risque doit être réévaluée en cas d’exposition extrême.'],
        [false, 'Ajouter une pression directe sur les yeux pour limiter leur œdème.', 'Toute compression oculaire est dangereuse.'],
      ], 'La durée prévue est dépassée de trois heures et une seconde phase opératoire pourrait être différée.'),
      qcm('Quelles actions postopératoires sont appropriées ?', src('b00065'), 'Une plainte visuelle après chirurgie ventrale à haut risque exige une évaluation immédiate et un avis spécialisé.', [
        [true, 'Tester séparément la vision de chaque œil.', 'L’atteinte peut être bilatérale ou asymétrique.'],
        [true, 'Alerter sans délai l’ophtalmologiste.', 'La cause doit être objectivée précocement.'],
        [true, 'Documenter pression, anémie, durée et pertes sanguines.', 'Ces expositions éclairent le mécanisme ischémique probable.'],
        [false, 'Rassurer sans examen en attribuant la plainte aux anesthésiques.', 'Le contexte impose d’exclure une complication visuelle permanente.'],
        [true, 'Rechercher aussi une pression rétinienne ou une lésion cornéenne.', 'Plusieurs mécanismes oculaires doivent être distingués cliniquement.'],
      ], 'Au réveil, la patiente signale une vision très floue des deux yeux.'),
    ],
  },
  {
    label: 'DP QCM 5 · Extubation accidentelle en position ventrale', allowed_voies: ['interne'],
    vignette: 'Un homme de 47 ans est opéré d’une fracture vertébrale en décubitus ventral sur table Jackson. La sonde trachéale est initialement fixée, mais les piliers de la table limitent l’accès au visage. Une civière est disponible dans la salle et l’équipe a répété le scénario de retournement urgent.',
    questions: [
      qcm('Quelles mesures préparatoires sont essentielles ?', src('b00070', 'b00071', 'b00072'), 'La difficulté d’accès impose une fixation renforcée, une stratégie d’équipe explicite et le matériel nécessaire au retour dorsal immédiat.', [
        [true, 'Vérifier solidement la fixation de la sonde.', 'Une perte de voie aérienne est particulièrement grave face contre table.'],
        [true, 'Garder une civière à proximité immédiate.', 'Elle reçoit le patient lors d’un retournement en urgence.'],
        [true, 'Attribuer les rôles avant l’incident.', 'Une séquence connue évite des mouvements contradictoires autour de la table.'],
        [true, 'Tenir compte des piliers qui entravent l’accès.', 'La géométrie Jackson ralentit l’approche de la tête.'],
        [false, 'Supposer qu’une réintubation ventrale sera toujours rapide.', 'L’accès au visage est limité et rend le contrôle trachéal plus difficile.'],
      ]),
      qcm('Quelles interprétations sont justes ?', src('b00011', 'b00072'), 'La disparition du capnogramme après traction du circuit fait suspecter une perte de connexion ou une extubation ; l’accès difficile commande une action immédiate.', [
        [true, 'Une déconnexion du circuit doit être recherchée.', 'La traction peut séparer un raccord sans déplacer la sonde.'],
        [true, 'Une extubation accidentelle est possible.', 'Le déplacement de la sonde explique l’absence de CO2 expiré.'],
        [false, 'La position ventrale rend l’événement sans gravité.', 'La réintubation y est plus difficile et tout retard menace l’oxygénation.'],
        [true, 'La ventilation manuelle doit être testée immédiatement.', 'Elle permet de vérifier la perméabilité et la position de la voie aérienne.'],
        [false, 'Il faut attendre plusieurs minutes pour confirmer au saturomètre.', 'La saturation peut rester transitoirement normale malgré une ventilation absente.'],
      ], 'Pendant une mobilisation du cadre, le circuit est tiré et le capnogramme disparaît brutalement.'),
      qcm('Quelles décisions sont prioritaires ?', src('b00010', 'b00072'), 'Une ventilation impossible exige le retour dorsal coordonné pour rétablir rapidement un accès complet aux voies aériennes.', [
        [true, 'Annoncer l’urgence à toute l’équipe.', 'Le retournement requiert l’arrêt du geste et une action synchronisée.'],
        [true, 'Préparer immédiatement la civière.', 'Elle permet de recevoir le patient après libération du cadre.'],
        [true, 'Contrôler tête et colonne pendant le retournement.', 'Le traumatisme rachidien impose un alignement strict malgré l’urgence.'],
        [false, 'Poursuivre la chirurgie jusqu’au prochain temps opératoire.', 'La priorité vitale est la restauration de la ventilation.'],
        [true, 'Retirer ou sécuriser les dispositifs susceptibles de s’arracher.', 'Lignes et drainages ne doivent pas créer une seconde complication pendant le mouvement.'],
      ], 'La ventilation manuelle ne produit aucun mouvement thoracique et l’auscultation est silencieuse.'),
      qcm('Comment organiser la manœuvre ?', src('b00014', 'b00015', 'b00016', 'b00071', 'b00072'), 'Le patient est déplacé en bloc, avec une personne dédiée à la tête et une coordination verbale avant chaque étape.', [
        [true, 'L’anesthésiologiste maintient la tête et les voies aériennes.', 'Il protège simultanément l’axe cervical et contrôle l’accès facial.'],
        [true, 'Un leader donne les ordres de déplacement.', 'Une commande unique synchronise les intervenants.'],
        [true, 'Le tronc et le bassin tournent en bloc.', 'Une torsion segmentaire pourrait aggraver la lésion rachidienne.'],
        [false, 'Chaque membre est déplacé à son propre rythme.', 'Des mouvements désynchronisés déstabilisent le corps et les lignes.'],
        [true, 'La table et la civière sont rapprochées avant le transfert.', 'La distance minimale réduit le temps sans ventilation.'],
      ], 'Le cadre est libéré et six personnes se placent autour du patient pour le retourner.'),
      qcm('Quelles actions suivent le retour dorsal ?', src('b00014', 'b00072'), 'Une fois l’accès restauré, dégagement, oxygénation et intubation priment, puis la cause mécanique est analysée.', [
        [true, 'Ouvrir et aspirer les voies aériennes si nécessaire.', 'Des sécrétions ou un dispositif déplacé peuvent gêner la ventilation.'],
        [true, 'Ventiler au masque avec oxygène.', 'Cette étape restaure rapidement une oxygénation pendant la réintubation.'],
        [true, 'Réintuber la trachée.', 'Une voie aérienne sécurisée est nécessaire pour reprendre une ventilation contrôlée.'],
        [false, 'Replacer immédiatement le patient en ventral avant confirmation.', 'La position ne doit être reprise qu’après stabilisation complète.'],
        [true, 'Vérifier la nouvelle fixation et le capnogramme.', 'La position correcte de la sonde doit être objectivée.'],
      ], 'Le patient est maintenant en décubitus dorsal ; la saturation baisse à 82 % mais le visage est accessible.'),
      qcm('Que faut-il réévaluer avant de poursuivre ?', src('b00070', 'b00071', 'b00072'), 'La reprise en ventral ne se discute qu’après correction de la cause, sécurisation renforcée et nouvelle préparation collective.', [
        [true, 'La cause de l’arrachement du circuit.', 'Comprendre la traction évite sa répétition.'],
        [true, 'Le cheminement et la longueur disponible des tuyaux.', 'Une boucle sans tension accompagne mieux la rotation de la table.'],
        [true, 'Le plan d’accès malgré les piliers Jackson.', 'L’équipe doit savoir comment atteindre rapidement la tête.'],
        [true, 'La stabilité hémodynamique et respiratoire du patient.', 'Aucune réinstallation complexe ne doit débuter sur un patient instable.'],
        [false, 'Le seul souhait de reprendre rapidement l’intervention.', 'La sécurité de la voie aérienne prime sur le calendrier chirurgical.'],
      ], 'Après réintubation, l’oxygénation se normalise et le chirurgien souhaite reprendre l’arthrodèse.'),
      qcm('Quels éléments guideront l’extubation finale ?', src('b00073'), 'Une position ventrale prolongée peut produire un œdème facial et des voies aériennes, imposant une évaluation rigoureuse avant retrait de la sonde.', [
        [true, 'La présence d’un œdème du visage.', 'Elle suggère une congestion pouvant toucher les voies aériennes.'],
        [true, 'L’examen des voies aériennes.', 'La perméabilité doit être assurée après une longue déclivité.'],
        [true, 'La durée totale passée en ventral.', 'Le temps favorise l’accumulation d’œdème.'],
        [false, 'Une extubation automatique dès la fin de la suture.', 'La décision dépend de l’évaluation clinique, pas du seul temps chirurgical.'],
        [true, 'La possibilité de différer l’extubation si le doute persiste.', 'Conserver la sonde protège contre une obstruction prévisible.'],
      ], 'Après plusieurs heures supplémentaires, le visage est nettement gonflé en fin d’intervention.'),
    ],
  },
  {
    label: 'DP QCM 6 · Arthroplastie d’épaule en semi-assise', allowed_voies: ['interne'],
    vignette: 'Une femme de 76 ans doit subir une arthroplastie d’épaule en position semi-assise. Elle est traitée pour hypertension et présente une sténose carotidienne modérée. Le tronc sera élevé à environ 40° et décalé vers le côté opéré. L’équipe veut préserver la stabilité, la neutralité cervicale et la perfusion cérébrale.',
    questions: [
      qcm('Quels risques doivent être anticipés ?', src('b00079', 'b00080', 'b00085', 'b00086'), 'La verticalisation combine baisse de retour veineux, gradient cœur-tête et risque cervical, particulièrement chez une patiente vasculaire.', [
        [true, 'Une hypotension lors de l’élévation du tronc.', 'Le sang s’accumule dans les membres inférieurs.'],
        [true, 'Une pression cérébrale inférieure à la pression brachiale.', 'La tête est située au-dessus du site habituel de mesure.'],
        [true, 'Un déplacement de la tête pendant les tractions chirurgicales.', 'Les mouvements de l’épaule peuvent mobiliser le support cervical.'],
        [true, 'Une ischémie cérébrale si la pression est insuffisante.', 'La maladie carotidienne réduit la réserve perfusionnelle.'],
        [false, 'Une augmentation garantie de la précharge après verticalisation.', 'Le retour veineux diminue en position assise.'],
      ]),
      qcm('Quelles mesures préventives sont adaptées ?', src('b00079', 'b00080', 'b00085'), 'La transition progressive associe soutien du volume, compression des jambes, contrôle de la tête et possibilité de vasopresseur.', [
        [true, 'Élever le tronc graduellement.', 'Une montée lente permet d’identifier la baisse tensionnelle.'],
        [true, 'Adapter le remplissage volémique.', 'Une précharge suffisante limite la diminution du débit.'],
        [true, 'Mettre des bandes élastiques aux membres inférieurs.', 'Elles réduisent la stase veineuse dans les jambes.'],
        [true, 'Stabiliser la tête dans un support approprié.', 'La neutralité doit persister pendant toute la chirurgie.'],
        [false, 'Décaler le tronc sans vérifier les sangles.', 'Le dégagement de l’épaule peut rendre le patient instable.'],
      ], 'Après induction, la patiente est déplacée progressivement vers la position de chaise longue.'),
      qcm('Comment interpréter cette discordance ?', src('b00085', 'b00094'), 'La différence de hauteur explique une pression réelle plus basse au cercle de Willis que celle mesurée au bras.', [
        [true, 'Le gradient hydrostatique diminue la pression au niveau cérébral.', 'La colonne de sang entre cœur et tête crée une perte de pression.'],
        [true, 'Le transducteur doit être référencé au tragus.', 'Ce repère approche la hauteur du cercle de Willis.'],
        [false, 'La pression brachiale garantit une perfusion cérébrale suffisante.', 'Elle surestime la valeur disponible dans la tête surélevée.'],
        [true, 'La cible doit tenir compte de la sténose carotidienne.', 'Une circulation compromise tolère moins bien l’hypotension.'],
        [false, 'Le niveau des pieds serait un meilleur zéro cérébral.', 'Ce choix accroîtrait l’erreur de hauteur au lieu de la corriger.'],
      ], 'La pression moyenne est à 70 mmHg au bras, mais le transducteur placé au tragus indique 52 mmHg.'),
      qcm('Quelles actions sont cohérentes ?', src('b00080', 'b00085'), 'Une pression cérébrale basse associée à un signe de souffrance impose de soutenir immédiatement pression et retour veineux.', [
        [true, 'Administrer un vasopresseur.', 'La vasoconstriction restaure rapidement la pression de perfusion.'],
        [true, 'Réduire temporairement l’élévation du tronc.', 'La diminution du gradient hydrostatique améliore le retour et la pression cérébrale.'],
        [true, 'Réévaluer la volémie.', 'Une précharge insuffisante peut participer à l’hypotension.'],
        [false, 'Poursuivre sans correction parce que la pression brachiale reste supérieure à 65.', 'Le cerveau reçoit la pression mesurée au niveau de la tête.'],
        [true, 'Vérifier la position et la calibration du transducteur.', 'Une mesure fiable est indispensable avant et pendant le traitement.'],
      ], 'Quelques minutes plus tard, l’activité neurologique surveillée se modifie et la pression au tragus reste basse.'),
      qcm('Que faut-il contrôler immédiatement ?', src('b00079'), 'Les tractions sur l’épaule peuvent entraîner une rotation ou une flexion cervicale malgré une installation initialement neutre.', [
        [true, 'L’alignement du nez, du menton et du sternum.', 'Ces repères cliniques détectent une rotation secondaire.'],
        [true, 'La fixation du support de tête.', 'Un dispositif desserré permet des mouvements répétés.'],
        [true, 'L’absence de pression sur l’oreille et l’occiput.', 'Le déplacement peut créer un nouveau point d’appui.'],
        [false, 'Laisser la tête suivre le bras pour réduire la traction chirurgicale.', 'La neutralité cervicale doit être préservée indépendamment du geste.'],
        [true, 'Répéter ces vérifications périodiquement.', 'Les forces opératoires persistent tout au long de la procédure.'],
      ], 'Pendant la préparation glénoïdienne, la traction du chirurgien déplace légèrement la tête hors du support.'),
      qcm('Quelles complications sont liées à cette position cervicale ?', src('b00013', 'b00086'), 'L’hyperflexion prolongée menace drainage lingual, moelle et circulation cervicale ; elle doit être corrigée avant qu’un déficit ne s’installe.', [
        [true, 'Un œdème marqué de la langue.', 'La flexion obstrue les voies veineuses et lymphatiques.'],
        [true, 'Une difficulté d’extubation.', 'La tuméfaction linguale peut compromettre la perméabilité des voies aériennes.'],
        [true, 'Une souffrance médullaire cervicale.', 'Étirement et compression vasculaire ont été associés à une tétraplégie.'],
        [true, 'Une réduction de l’espace menton-thorax.', 'L’équivalent de deux doigts ne serait plus respecté.'],
        [false, 'Une protection accrue du plexus brachial.', 'L’amplitude extrême ne constitue pas une mesure protectrice.'],
      ], 'Avant la fermeture, le menton est presque au contact du thorax depuis une durée indéterminée.'),
      qcm('Quels critères doivent être vérifiés avant extubation ?', src('b00086'), 'Après flexion prolongée, l’examen recherche surtout un œdème lingual ou des voies aériennes susceptible de rendre l’extubation dangereuse.', [
        [true, 'Le volume et la mobilité de la langue.', 'Une tuméfaction peut obstruer le pharynx après retrait de la sonde.'],
        [true, 'La perméabilité globale des voies aériennes.', 'L’examen doit estimer la sécurité respiratoire post-extubation.'],
        [true, 'La durée de la flexion cervicale.', 'Une exposition longue augmente la probabilité d’œdème.'],
        [false, 'La seule qualité de la suture cutanée.', 'La fermeture opératoire ne renseigne pas sur l’œdème pharyngé.'],
        [true, 'La possibilité de différer l’extubation si l’examen est inquiétant.', 'Maintenir la voie aérienne sécurisée évite une obstruction prévisible.'],
      ], 'Au retour à l’horizontale, la langue apparaît gonflée après cette chirurgie prolongée.'),
    ],
  },
  {
    label: 'DP QCM 7 · Déficit ulnaire après chirurgie abdominale', allowed_voies: ['interne'],
    vignette: 'Un homme de 61 ans, diabétique et consommateur chronique d’alcool, a subi une colectomie de cinq heures en décubitus dorsal. Les deux bras étaient sur des appuis latéraux. Au réveil, il décrit un engourdissement de l’auriculaire et de l’annulaire gauches avec faiblesse de la main.',
    questions: [
      qcm('Quels éléments soutiennent un risque de neuropathie de position ?', src('b00006', 'b00021'), 'Le terrain, le sexe masculin, la durée et la topographie ulnaire constituent un ensemble compatible avec une lésion périopératoire.', [
        [true, 'Une neuropathie diabétique possible avant l’intervention.', 'Le diabète fragilise nerfs périphériques et microcirculation.'],
        [true, 'L’éthylisme chronique.', 'Il figure parmi les facteurs de susceptibilité neurologique.'],
        [true, 'Le sexe masculin.', 'La neuropathie ulnaire postopératoire est rapportée majoritairement chez les hommes.'],
        [true, 'Une chirurgie de cinq heures.', 'Le temps prolonge toute compression non détectée.'],
        [false, 'La position dorsale exclut une atteinte ulnaire.', 'Le nerf est précisément exposé au coude dans cette installation.'],
      ]),
      qcm('Quels mécanismes peuvent expliquer le déficit ?', src('b00005', 'b00021'), 'La compression de la gouttière cubitale et la flexion marquée du coude peuvent associer ischémie, œdème et étirement du nerf.', [
        [true, 'Une pression directe sur le nerf ulnaire au coude.', 'Son trajet superficiel le rend vulnérable contre un appui dur.'],
        [true, 'Une flexion du coude supérieure à 90°.', 'Elle étire le nerf et le comprime dans la gouttière cubitale.'],
        [true, 'Une interruption de la perfusion intraneurale.', 'La compression légère peut déjà bloquer la conduction.'],
        [true, 'Un œdème intraneural après stase veineuse.', 'Une pression plus forte entrave le drainage du nerf.'],
        [false, 'Une hyperextension lombaire comme cause directe de la main ulnaire.', 'Ce mécanisme ne correspond pas à la topographie du déficit.'],
      ], 'La feuille peropératoire indique que le coude gauche était fléchi à environ 110° sous un drap épais.'),
      qcm('Quels autres éléments d’installation faut-il vérifier ?', src('b00021', 'b00022'), 'L’orientation de l’avant-bras, le rembourrage, le brassard et la stabilité du bras permettent de reconstituer la contrainte ulnaire.', [
        [true, 'La position de l’avant-bras sur l’appui.', 'Une pronation peut exposer davantage la région ulnaire.'],
        [true, 'La présence d’un coussin au niveau du coude.', 'L’absence de rembourrage augmente la pression locale.'],
        [true, 'La localisation du brassard de pression.', 'Une manchette trop basse peut comprimer plusieurs nerfs du coude.'],
        [true, 'La survenue d’un déplacement du bras hors de l’appui.', 'Une chute aurait pu tracter épaule et plexus.'],
        [false, 'La couleur du drap chirurgical.', 'Elle n’apporte aucune information mécanique ou neurologique.'],
      ], 'L’équipe reconstitue l’installation à partir des notes et du matériel encore présent en salle.'),
      qcm('Que doit comprendre l’évaluation initiale ?', src('b00088'), 'Le déficit doit être objectivé par un examen neurologique complet, une chronologie précise et un avis spécialisé.', [
        [true, 'Une cartographie sensitive de la main.', 'Elle permet de vérifier la distribution ulnaire.'],
        [true, 'Une évaluation motrice des muscles intrinsèques.', 'La faiblesse précise la sévérité et la topographie fonctionnelle.'],
        [true, 'La recherche d’un déficit neurologique antérieur.', 'Une atteinte préexistante modifie l’interprétation postopératoire.'],
        [true, 'Une consultation en neurologie.', 'L’expertise guide le bilan électrophysiologique et le suivi.'],
        [false, 'Une absence totale de documentation pour éviter une conclusion prématurée.', 'La traçabilité détaillée est au contraire recommandée.'],
      ], 'Le déficit persiste après disparition complète des effets anesthésiques.'),
      qcm('Que peut apporter cet examen à ce moment ?', src('b00006', 'b00088'), 'Avant l’apparition des signes de dénervation récente, l’EMG précoce sert surtout à identifier une anomalie antérieure à l’intervention.', [
        [true, 'La détection d’une neuropathie préexistante.', 'Une anomalie déjà constituée peut être visible immédiatement.'],
        [false, 'La datation certaine d’une dénervation apparue il y a deux jours.', 'Les changements récents demandent plusieurs semaines.'],
        [true, 'Un point de comparaison pour un contrôle ultérieur.', 'Le tracé initial aide à suivre l’évolution électrophysiologique.'],
        [false, 'La garantie d’un examen normal si le déficit est réel.', 'Une lésion ancienne ou un trouble de conduction peuvent déjà être détectables.'],
        [true, 'Une interprétation conjointe avec l’examen clinique.', 'L’électrophysiologie ne remplace pas la topographie neurologique.'],
      ], 'Une électromyographie est demandée quarante-huit heures après l’intervention.'),
      qcm('Pourquoi choisir ce délai ?', src('b00005', 'b00088'), 'Les signes électromyographiques de dénervation apparaissent après trois à quatre semaines, ce qui rend ce contrôle adapté à une lésion récente.', [
        [true, 'La dénervation musculaire devient alors objectivable.', 'Les modifications électriques nécessitent un temps biologique d’installation.'],
        [true, 'Le contrôle peut distinguer une évolution récente du tracé initial.', 'Comparer les examens renforce la datation de l’atteinte.'],
        [false, 'Le nerf ne peut jamais récupérer avant quatre semaines.', 'La temporalité EMG ne fixe pas à elle seule le délai clinique de récupération.'],
        [true, 'Le suivi clinique reste nécessaire entre les deux examens.', 'Force, sensibilité et douleur évoluent indépendamment du calendrier technique.'],
        [false, 'Une EMG tardive remplace toute consultation neurologique.', 'L’interprétation et la prise en charge demeurent spécialisées.'],
      ], 'Le neurologue programme un second examen environ quatre semaines après le début du déficit.'),
      qcm('Quels éléments doivent figurer dans le rapport final ?', src('b00011', 'b00088'), 'Un rapport utile rassemble terrain, installation, chronologie, mécanisme envisagé, constat initial et évolution documentée.', [
        [true, 'Les facteurs de risque du patient.', 'Ils contextualisent la vulnérabilité du nerf.'],
        [true, 'Le moment précis d’apparition des symptômes.', 'La temporalité aide à distinguer atteinte antérieure et périopératoire.'],
        [true, 'Le mécanisme probable de compression ou d’étirement.', 'L’hypothèse doit être reliée à la position reconstituée.'],
        [true, 'Les résultats neurologiques et électromyographiques successifs.', 'Ils objectivent la sévérité et l’évolution.'],
        [false, 'Une attribution certaine sans mention des incertitudes.', 'Les mécanismes restent souvent multifactoriels et le niveau de preuve limité.'],
      ], 'Un mois plus tard, l’équipe qualité analyse le cas et prépare un retour d’expérience.'),
    ],
  },
  {
    label: 'DP QCM 8 · Fracture du fémur sur table de traction', allowed_voies: ['interne'],
    vignette: 'Un homme de 35 ans doit subir une réduction ouverte d’une fracture du fémur droit sur table de traction. La jambe gauche sera placée en lithotomie, le pied droit fixé dans une bottine et un support cylindrique périnéal assurera la contre-traction. L’équipe vérifie les mains, le pelvis et les organes génitaux avant de mobiliser la table.',
    questions: [
      qcm('Quels risques sont propres à cette installation ?', src('b00039', 'b00040'), 'La traction et le support périnéal ajoutent au risque nerveux de lithotomie des dangers de compression pudendale, génitale et digitale.', [
        [true, 'Une compression du nerf pudendal.', 'Le support cylindrique transmet la contre-traction au périnée.'],
        [true, 'Une lésion des organes génitaux.', 'Une pression concentrée peut atteindre tissus mous et sensibilité pénienne.'],
        [true, 'Une torsion lombaire si la jambe saine est déplacée seule.', 'La mobilisation asymétrique entraîne une rotation du bassin.'],
        [true, 'Un coincement des doigts dans une partie mobile de table.', 'Le redressement du plateau peut emprisonner une main mal placée.'],
        [false, 'Une absence totale de risque neurologique chez un adulte jeune.', 'La mécanique de compression existe indépendamment de l’âge.'],
      ]),
      qcm('Quelles corrections sont appropriées ?', src('b00040'), 'Le support doit assurer la contre-traction avec la pression minimale nécessaire, largement rembourrée et éloignée des structures génitales.', [
        [true, 'Recentrer le cylindre contre les structures osseuses du pelvis.', 'Un appui mieux réparti évite une force focale sur les tissus mous.'],
        [true, 'Ajouter un rembourrage large.', 'La surface plus grande diminue la pression locale.'],
        [true, 'Dégager complètement les organes génitaux.', 'Ils ne doivent pas être coincés entre patient et support.'],
        [false, 'Augmenter immédiatement la traction avant correction.', 'Une force accrue aggraverait la compression périnéale.'],
        [true, 'Documenter la position après nouvelle vérification.', 'La traçabilité doit décrire l’accessoire qui porte la contre-force.'],
      ], 'Après installation, le cylindre appuie directement sur le périnée et les organes génitaux sont partiellement coincés.'),
      qcm('Quelles précautions accompagnent la traction ?', src('b00040'), 'La traction doit aligner la fracture sans créer de compression excessive du pied, du périnée ou des nerfs périphériques.', [
        [true, 'Vérifier le maintien du pied dans la bottine.', 'Un glissement modifie la force et crée des appuis imprévus.'],
        [true, 'Contrôler régulièrement la contre-pression périnéale.', 'La traction prolongée peut faire migrer le bassin contre le support.'],
        [true, 'Évaluer la perfusion distale de la jambe tractée.', 'La fixation et la force appliquée peuvent compromettre le débit du membre.'],
        [false, 'Considérer l’alignement radiologique comme l’unique critère.', 'La protection neurovasculaire doit être vérifiée indépendamment.'],
        [true, 'Limiter la force à celle nécessaire à la réduction.', 'Une tension supplémentaire augmente le risque sans bénéfice osseux certain.'],
      ], 'La réduction nécessite une traction croissante pendant que le contrôle radiologique guide l’alignement.'),
      qcm('Quels mécanismes pourraient l’expliquer ?', src('b00040'), 'Une pression périnéale prolongée peut léser le nerf pudendal et altérer la sensibilité génitale.', [
        [true, 'Une compression du nerf pudendal contre le cylindre.', 'Ce nerf innerve la sensibilité du périnée et du pénis.'],
        [true, 'Une pression excessive de contre-traction.', 'La force tissulaire augmente avec la traction appliquée au membre.'],
        [true, 'Une durée prolongée sans réévaluation du support.', 'Le temps convertit une contrainte tolérable en lésion.'],
        [false, 'Une compression du nerf facial.', 'La topographie génitale ne correspond pas à ce nerf crânien.'],
        [false, 'Une atteinte rétinienne expliquant l’anesthésie pénienne.', 'Les voies oculaires n’innervent pas le périnée.'],
      ], 'Après plusieurs heures, le bassin a glissé vers le cylindre malgré la fixation initiale.'),
      qcm('Que faut-il vérifier avant cette manœuvre ?', src('b00039'), 'La partie mobile de la table peut coincer les doigts ; un contrôle visuel des deux mains précède tout redressement.', [
        [true, 'La position de chaque main du patient.', 'Une main en bord de plateau peut pénétrer dans la charnière.'],
        [true, 'La position des doigts des intervenants.', 'Le personnel peut également se blesser au niveau des zones articulées.'],
        [true, 'Le dégagement des câbles et tubulures.', 'Un dispositif pris dans le mouvement peut s’arracher ou comprimer le patient.'],
        [false, 'Le retrait du monitorage avant le changement.', 'Les paramètres restent nécessaires pendant la transition.'],
        [true, 'Une annonce verbale avant d’actionner la table.', 'Tous les intervenants peuvent confirmer que leur zone est libre.'],
      ], 'En fin de chirurgie, la portion distale du plateau doit être redressée près de la main gauche.'),
      qcm('Quelles actions sont indiquées ?', src('b00035', 'b00036', 'b00039'), 'Le retour doit être symétrique et surveillé, avec anticipation de la redistribution veineuse et protection de la colonne.', [
        [true, 'Abaisser simultanément les membres inférieurs.', 'La symétrie réduit la torsion du rachis lombaire.'],
        [true, 'Surveiller une chute de pression artérielle.', 'Le volume sanguin quitte le thorax lorsque les jambes redescendent.'],
        [true, 'Soutenir chaque jambe jusqu’à la position finale.', 'Le poids des membres ne doit pas entraîner de mouvement brutal.'],
        [false, 'Libérer une seule jambe et laisser l’autre en traction.', 'Cette asymétrie impose une torsion du bassin.'],
        [true, 'Réévaluer les nerfs et la perfusion après la transition.', 'Un contrôle final recherche une conséquence occultée des supports.'],
      ], 'La jambe saine doit quitter la lithotomie et la traction du membre fracturé est relâchée.'),
      qcm('Quelle prise en charge est appropriée ?', src('b00040', 'b00088'), 'Le déficit sensitif compatible avec le pudendal doit être objectivé, documenté et orienté vers une évaluation neurologique.', [
        [true, 'Réaliser un examen neurologique ciblé et complet.', 'La topographie distingue nerf pudendal et autres atteintes pelviennes.'],
        [true, 'Documenter position du support, force et durée de traction.', 'Ces éléments reconstituent l’exposition mécanique.'],
        [true, 'Rechercher un trouble urinaire ou sexuel associé.', 'Le territoire pudendal ne se limite pas à la sensibilité cutanée.'],
        [false, 'Nier le lien possible puisque la fracture est correctement réduite.', 'Le succès orthopédique n’exclut pas une complication de position.'],
        [true, 'Organiser un suivi spécialisé si le déficit persiste.', 'Une atteinte nerveuse nécessite surveillance et éventuel bilan électrophysiologique.'],
      ], 'Au réveil, le patient décrit une perte complète de sensibilité du pénis sans douleur de jambe.'),
    ],
  },
];

const QROC_SERIES = [
  {
    label: 'QROC — Série 1 · Mécanismes et facteurs de risque', allowed_voies: ['externe'], questions: [
      qroc('Quels sont les trois mécanismes mécaniques majeurs d’une neuropathie de position ?', 'Compression, ischémie et étirement', src('b00005'), 'Ces mécanismes sont souvent associés plutôt qu’isolés.'),
      qroc('Quelle conséquence peut avoir un étirement nerveux léger ?', 'Interruption de la perfusion nerveuse|Ischémie du nerf', src('b00005'), 'La microcirculation est compromise avant la rupture des structures intraneurales.'),
      qroc('Quel mécanisme provoque l’œdème intraneural sous forte compression ?', 'Augmentation de la pression veineuse|Stase veineuse intraneurale', src('b00005'), 'Le drainage veineux entravé augmente la pression dans le nerf.'),
      qroc('Quels deux facteurs peropératoires majorent les neuropathies périphériques ?', 'Hypothermie et durée de chirurgie', src('b00006'), 'Le refroidissement et le temps d’exposition augmentent la vulnérabilité nerveuse.'),
      qroc('Quel facteur démographique est associé aux neuropathies de position ?', 'Sexe masculin', src('b00006'), 'Les hommes figurent parmi les groupes plus fréquemment atteints.'),
    ],
  },
  {
    label: 'QROC — Série 2 · Tête, cou et membre supérieur', allowed_voies: ['externe'], questions: [
      qroc('Quel espace minimal conserver entre menton et thorax en flexion cervicale ?', 'Deux doigts|Équivalent de deux doigts', src('b00013'), 'Ce repère simple prévient l’hyperflexion cervicale.'),
      qroc('Quel plexus est étiré par une rotation de tête opposée à un bras abducté ?', 'Plexus brachial controlatéral|Plexus brachial', src('b00013'), 'Rotation cervicale et abduction éloignent les deux extrémités du plexus.'),
      qroc('Quelle abduction maximale de l’épaule ne faut-il pas dépasser ?', '90°|90 degrés', src('b00021'), 'Maintenir le bras sous cette limite réduit la traction plexique.'),
      qroc('Quelle orientation choisir pour un avant-bras abducté ?', 'Supination ou position neutre', src('b00022'), 'Cette orientation protège la gouttière ulnaire de l’appui direct.'),
      qroc('Où placer le brassard par rapport à la fosse antécubitale ?', 'Au-dessus de la fosse antécubitale|Au-dessus du pli du coude', src('b00022'), 'La manchette ne doit pas comprimer les nerfs du coude.'),
    ],
  },
  {
    label: 'QROC — Série 3 · Décubitus dorsal et déclivités', allowed_voies: ['externe'], questions: [
      qroc('De combien la CRF baisse-t-elle en décubitus dorsal par rapport à la station debout ?', 'Environ 20 %|20 %', src('b00020'), 'Le volume pulmonaire de repos diminue dès le passage en position horizontale.'),
      qroc('Quel réglage ventilatoire peut corriger l’effet shunt lié à la fermeture des petites voies ?', 'PEP|Pression expiratoire positive', src('b00020'), 'La pression téléexpiratoire aide à maintenir les unités ouvertes.'),
      qroc('Quelle hyperextension lombaire faut-il éviter lors de certaines prostatectomies ?', 'Plus de 15°|Hyperextension > 15°', src('b00026'), 'Des complications médullaires ont été rapportées au-delà de cette amplitude.'),
      qroc('Quelle condition neurologique fait éviter le Trendelenburg ?', 'Hypertension intracrânienne|HTIC', src('b00027'), 'La tête basse augmente congestion veineuse et pression intracrânienne.'),
      qroc('Quel support faut-il proscrire pour empêcher le glissement en Trendelenburg ?', 'Épaulières sus-claviculaires|Supports au-dessus des épaules', src('b00030'), 'Ils compriment le plexus brachial et étirent le plexus cervical.'),
    ],
  },
  {
    label: 'QROC — Série 4 · Lithotomie et traction', allowed_voies: ['externe'], questions: [
      qroc('Comment mobiliser les deux jambes lors d’une lithotomie ?', 'Simultanément|En même temps', src('b00033', 'b00036'), 'La symétrie évite une torsion du rachis lombaire.'),
      qroc('Quel nerf est comprimé au niveau de la tête de la fibula ?', 'Nerf fibulaire commun|Nerf péronier commun', src('b00039'), 'Son trajet superficiel le met au contact du support de jambe.'),
      qroc('Quel nerf peut être comprimé sous le ligament inguinal en flexion de hanche ?', 'Nerf fémoral', src('b00039'), 'Une flexion prononcée réduit l’espace sous le ligament inguinal.'),
      qroc('Quelle atteinte musculaire systémique peut compliquer l’ischémie d’une loge ?', 'Rhabdomyolyse', src('b00039'), 'L’ischémie prolongée provoque une destruction des fibres musculaires.'),
      qroc('Quel nerf menace le support périnéal d’une table de traction ?', 'Nerf pudendal|Nerf honteux', src('b00040'), 'La contre-traction prolongée peut abolir la sensibilité génitale.'),
    ],
  },
  {
    label: 'QROC — Série 5 · Décubitus latéral', allowed_voies: ['externe'], questions: [
      qroc('Vers quel poumon la gravité dirige-t-elle surtout le débit sanguin en position latérale ?', 'Poumon dépendant', src('b00043'), 'La gravité dirige le débit sanguin vers le poumon déclive.'),
      qroc('Quel poumon reçoit préférentiellement la ventilation mécanique en décubitus latéral ?', 'Poumon non dépendant', src('b00043', 'b00048'), 'Sous pression positive, le poumon supérieur est souvent davantage insufflé.'),
      qroc('Où placer le rouleau destiné à libérer l’aisselle dépendante ?', 'Sous le thorax|Sous la paroi thoracique', src('b00042'), 'Le rouleau soulève le thorax sans appuyer directement dans l’aisselle.'),
      qroc('Quelle structure oculaire faut-il dégager du côté dépendant ?', 'Œil dépendant|Portion latérale de l’œil ipsilatéral', src('b00042'), 'Le coussin de tête ne doit exercer aucune pression sur le globe.'),
      qroc('Quelles deux orientations d’épaule réduisent la tension plexique sous traction ?', 'Légère flexion et légère rotation interne', src('b00049', 'b00050'), 'Ces ajustements diminuent la distance imposée au plexus brachial.'),
    ],
  },
  {
    label: 'QROC — Série 6 · Décubitus ventral', allowed_voies: ['externe'], questions: [
      qroc('Pourquoi dégager l’abdomen en position ventrale ?', 'Préserver la ventilation et réduire les saignements rachidiens', src('b00052'), 'La compression diminue la compliance et augmente la pression veineuse vertébrale.'),
      qroc('Quelle neuropathie sensitive menace un appui sur l’épine iliaque antérosupérieure ?', 'Nerf cutané latéral de la cuisse|Nerf fémoral cutané latéral', src('b00054'), 'Son trajet superficiel le rend sensible aux supports pelviens.'),
      qroc('Quels deux dispositifs souples peuvent supporter la tête en ventral ?', 'Coussin troué ou support en fer à cheval', src('b00055'), 'Ils stabilisent le visage tout en libérant les yeux et le nez.'),
      qroc('Quel équipement doit rester disponible en cas d’extubation accidentelle en ventral ?', 'Une civière', src('b00072'), 'Elle permet le retournement urgent en décubitus dorsal.'),
      qroc('Que rechercher avant extubation après un décubitus ventral prolongé ?', 'Œdème du visage et des voies aériennes', src('b00073'), 'La congestion peut compromettre la perméabilité après retrait de la sonde.'),
    ],
  },
  {
    label: 'QROC — Série 7 · Perte visuelle et supports rachidiens', allowed_voies: ['externe'], questions: [
      qroc('Quels sont les deux mécanismes principaux de cécité après chirurgie spinale ventrale ?', 'Occlusion de l’artère centrale de la rétine et neuropathie ischémique optique', src('b00056'), 'Pression directe et hypoperfusion optique produisent deux tableaux distincts.'),
      qroc('Quelle incidence maximale de perte visuelle est rapportée après chirurgie spinale ?', '0,2 %', src('b00056'), 'La complication reste rare mais peut être définitive et bilatérale.'),
      qroc('Comment positionner la tête pour favoriser la perfusion oculaire ?', 'Neutre et légèrement au-dessus du cœur', src('b00065'), 'Cette hauteur limite la congestion veineuse oculaire.'),
      qroc('Quel support réglable réduit la lordose lombaire en position ventrale ?', 'Support Wilson', src('b00066'), 'Ses deux demi-lunes ouvrent les espaces intervertébraux.'),
      qroc('Quelle table permet une rotation longitudinale à 360° ?', 'Table Jackson', src('b00070'), 'Son cadre articulé autorise un retournement en sandwich.'),
    ],
  },
  {
    label: 'QROC — Série 8 · Position assise et neuropathie', allowed_voies: ['externe'], questions: [
      qroc('Quelle élévation du tronc est utilisée en semi-assise pour l’épaule ?', 'Environ 40°|40 degrés', src('b00079'), 'Cette inclinaison correspond à la position de chaise longue décrite.'),
      qroc('À quel repère mesurer la pression artérielle en position assise ?', 'Tragus de l’oreille|Niveau du cercle de Willis', src('b00085'), 'Le zéro cérébral corrige le gradient hydrostatique cœur-tête.'),
      qroc('Quelle complication linguale peut suivre une flexion cervicale prolongée ?', 'Œdème de la langue|Œdème lingual', src('b00086'), 'La flexion entrave les drainages lymphatique et veineux.'),
      qroc('Après quel délai les signes EMG de dénervation apparaissent-ils ?', 'Trois à quatre semaines|3 à 4 semaines', src('b00088'), 'Une étude trop précoce ne date pas correctement une lésion récente.'),
      qroc('Que recherche surtout une EMG réalisée précocement ?', 'Une atteinte nerveuse préexistante', src('b00088'), 'Les anomalies nouvelles de dénervation ne sont pas encore constituées.'),
    ],
  },
];

const DP_QROC_SERIES = [
  {
    label: 'DP QROC 1 · Thyroïdectomie et hyperextension cervicale', allowed_voies: ['externe'],
    vignette: 'Une femme de 58 ans doit subir une thyroïdectomie. Elle présente une arthrose cervicale connue mais aucun déficit neurologique. L’équipe prévoit une extension du cou pour exposer la glande et souhaite éviter une traction excessive de la colonne ou une lésion cornéenne.',
    questions: [
      qroc('Quelle position cervicale doit rester la référence hors nécessité chirurgicale ?', 'Position neutre|Tête et cou neutres', src('b00013'), 'La neutralité limite les contraintes prolongées sur moelle, racines et vaisseaux.'),
      qroc('Quel appui doit impérativement rester soutenu ?', 'Occiput', src('b00003', 'b00013'), 'Soutenir l’occiput évite que le poids de la tête n’exerce une traction cervicale.', 'Un coussin est glissé sous les épaules pour obtenir l’extension nécessaire.'),
      qroc('Quelle règle faut-il appliquer à ce geste ?', 'Ne jamais forcer l’extension|Extension douce', src('b00014'), 'Un rachis dégénératif peut être lésé par une amplitude imposée brutalement.', 'La laryngoscopie exige davantage d’extension que prévu et une résistance cervicale est ressentie.'),
      qroc('Quel mécanisme vasculaire faut-il envisager ?', 'Diminution du flux carotidien ou vertébral', src('b00011', 'b00013'), 'Une rotation majeure peut réduire la perfusion par les artères cervicales.', 'Après installation, la tête est aussi tournée fortement vers la droite.'),
      qroc('Quel plexus risque alors d’être étiré ?', 'Plexus brachial gauche|Plexus brachial controlatéral', src('b00013', 'b00021'), 'La rotation opposée au bras abducté éloigne les extrémités du plexus.', 'Le bras gauche est simultanément abducté sur un appui latéral.'),
      qroc('Quelle protection simple doit être rétablie ?', 'Fermeture des paupières|Protection cornéenne', src('b00017', 'b00018'), 'Une cornée exposée sous anesthésie risque abrasion et érosion.', 'En cours de chirurgie, le pansement de l’œil gauche s’est décollé et la paupière est entrouverte.'),
      qroc('Quelle conduite cervicale adopter à la fin de l’exposition ?', 'Retour progressif en position neutre', src('b00013', 'b00014'), 'La tête doit être réalignée sans mouvement forcé avant le réveil.', 'Avant l’émergence, le champ opératoire est retiré et le cou peut être mobilisé.'),
    ],
  },
  {
    label: 'DP QROC 2 · Obésité et décubitus dorsal', allowed_voies: ['externe'],
    vignette: 'Un homme de 54 ans avec obésité sévère est anesthésié pour une chirurgie abdominale en décubitus dorsal. Ses membres supérieurs sont placés sur des appuis et ses jambes restent en extension. L’équipe anticipe les conséquences respiratoires et les points de pression d’une intervention de quatre heures.',
    questions: [
      qroc('Quelle variable pulmonaire diminue en passant de la station debout au décubitus dorsal ?', 'Capacité résiduelle fonctionnelle|CRF', src('b00020'), 'La position horizontale réduit le volume pulmonaire de repos.'),
      qroc('Quelle baisse supplémentaire approximative faut-il attendre ?', 'Environ 20 %|20 % supplémentaires', src('b00006', 'b00020'), 'L’induction et la perte de tonus ajoutent une seconde diminution de CRF.', 'L’anesthésie générale est induite chez ce patient obèse et une curarisation complète est obtenue.'),
      qroc('Quel mécanisme explique l’hypoxémie ?', 'Effet shunt par fermeture des petites voies', src('b00011', 'b00020'), 'Si la CRF passe sous le volume de fermeture, des unités restent perfusées sans ventilation suffisante.', 'La saturation baisse pendant ce changement physiologique alors que l’auscultation est symétrique et la sonde bien positionnée.'),
      qroc('Quel réglage peut améliorer cette situation ?', 'PEP|Pression expiratoire positive', src('b00020'), 'La PEP maintient ouvertes davantage d’unités en fin d’expiration.', 'Un recrutement est réalisé et l’équipe cherche un réglage téléexpiratoire protecteur.'),
      qroc('Quel nerf du coude est menacé ?', 'Nerf ulnaire', src('b00021'), 'La flexion marquée et l’appui sur la gouttière cubitale compriment le nerf.', 'Le coude droit est découvert fléchi à 105° contre le bord dur de l’appui.'),
      qroc('Où faut-il déplacer le brassard ?', 'Au-dessus de la fosse antécubitale|Au-dessus du pli du coude', src('b00022'), 'Cette position libère les nerfs ulnaire, médian et radial.', 'Le brassard gauche chevauche la fosse antécubitale.'),
      qroc('Quel coussin réduit la tension lombaire ?', 'Coussin sous les genoux', src('b00023', 'b00024', 'b00025'), 'La légère flexion diminue la lordose et les tensions de hanche et de genou.', 'Après la chirurgie, l’équipe cherche à prévenir une douleur lombaire liée à la perte de tonus.'),
    ],
  },
  {
    label: 'DP QROC 3 · Neurochirurgie en position assise', allowed_voies: ['externe'],
    vignette: 'Un homme de 44 ans doit subir une chirurgie de la fosse postérieure en position assise. Il n’a pas de maladie cardiovasculaire connue. L’équipe prépare la verticalisation, le support de tête et la mesure de pression artérielle adaptée à la hauteur du cerveau.',
    questions: [
      qroc('Quelle complication gazeuse est spécifiquement redoutée ?', 'Embolie gazeuse|Embolie aérienne', src('b00079'), 'La position assise est historiquement associée à l’entrée d’air dans la circulation veineuse.'),
      qroc('Quel mécanisme explique la chute tensionnelle ?', 'Diminution du retour veineux|Accumulation sanguine dans les jambes', src('b00080'), 'La verticalisation redistribue le volume vers les membres inférieurs.', 'Pendant l’élévation du tronc, la pression artérielle baisse rapidement.'),
      qroc('Quel moyen mécanique peut limiter cette accumulation ?', 'Bandes élastiques des membres inférieurs|Compression élastique', src('b00080', 'b00085'), 'La compression des jambes soutient le volume central.', 'La volémie semble correcte mais la pression reste sensible aux changements d’inclinaison.'),
      qroc('À quel repère faut-il mettre le zéro de pression ?', 'Tragus de l’oreille|Cercle de Willis', src('b00085'), 'Ce niveau approche la hauteur de la circulation cérébrale.', 'Le brassard au bras affiche une pression moyenne rassurante malgré la tête très surélevée.'),
      qroc('Quel repère clinique simple manque ?', 'Espace de deux doigts entre menton et thorax', src('b00013'), 'Ce contrôle détecte une hyperflexion cervicale.', 'La tête est fixée en flexion et le menton touche presque le thorax.'),
      qroc('Quel œdème faut-il rechercher ?', 'Œdème de la langue|Œdème lingual', src('b00086'), 'La flexion prolongée obstrue les drainages veineux et lymphatique.', 'Après plusieurs heures, la cavité buccale paraît encombrée au retrait du champ.'),
      qroc('Quelle évaluation précède l’extubation ?', 'Évaluation rigoureuse des voies aériennes', src('b00086'), 'Un œdème lingual important peut provoquer une obstruction après retrait de la sonde.', 'La chirurgie est terminée mais la langue reste tuméfiée.'),
    ],
  },
  {
    label: 'DP QROC 4 · Chirurgie mammaire en décubitus ventral', allowed_voies: ['externe'],
    vignette: 'Une femme de 49 ans est installée en décubitus ventral pour une chirurgie postérieure prolongée. Des supports longitudinaux sont placés du thorax aux crêtes iliaques. L’équipe doit libérer l’abdomen, protéger les seins et contrôler les principaux points d’appui.',
    questions: [
      qroc('Quel espace corporel doit rester libre entre les supports ?', 'Abdomen', src('b00052'), 'Le dégagement abdominal préserve mécanique respiratoire et drainage veineux rachidien.'),
      qroc('Quelle conséquence ventilatoire faut-il suspecter ?', 'Diminution de la compliance|Baisse de la CRF', src('b00052'), 'La pression abdominale repousse les viscères contre le diaphragme.', 'Après retournement, les pressions ventilatoires augmentent nettement.'),
      qroc('Quel effet sur le champ rachidien faut-il anticiper ?', 'Augmentation des saignements|Congestion veineuse vertébrale', src('b00052'), 'La pression abdominale se transmet aux plexus veineux vertébraux.', 'Le chirurgien note en parallèle un saignement diffus plus important.'),
      qroc('Dans quel sens faut-il les déplacer ?', 'Médialement et vers le haut|Médialement et céphaliquement', src('b00052', 'b00053'), 'Cette orientation est mieux tolérée que leur refoulement latéral par les supports.', 'Le bord médial des deux seins est comprimé après un déplacement latéral.'),
      qroc('Quel nerf cutané peut être comprimé ici ?', 'Nerf cutané latéral de la cuisse|Nerf fémoral cutané latéral', src('b00054'), 'Il chemine superficiellement près de l’épine iliaque antérosupérieure.', 'Un appui pelvien presse fortement la région proche de l’épine iliaque antérosupérieure.'),
      qroc('Quel type de support rigide peut stabiliser la tête ?', 'Support de Mayfield|Mayfield', src('b00055'), 'Les pointes crâniennes maintiennent la tête sans appui facial.', 'Le coussin facial ne permet pas de garantir le dégagement des yeux.'),
      qroc('Quel examen postopératoire précoce est indispensable si le risque est élevé ?', 'Évaluation de la vision|Examen visuel', src('b00065'), 'Une atteinte optique ou rétinienne doit être identifiée rapidement.', 'La durée et les pertes sanguines ont finalement été importantes.'),
    ],
  },
  {
    label: 'DP QROC 5 · Laparoscopie et hypertension intracrânienne', allowed_voies: ['externe'],
    vignette: 'Une femme de 66 ans doit subir une chirurgie laparoscopique pelvienne. Elle a un antécédent de tumeur cérébrale avec hypertension intracrânienne encore symptomatique. Le chirurgien demande un Trendelenburg marqué pour améliorer la vision du pelvis.',
    questions: [
      qroc('Quel effet la tête basse a-t-elle sur le retour veineux systémique ?', 'Augmentation du retour veineux', src('b00027'), 'Le sang des membres inférieurs est déplacé vers le thorax.'),
      qroc('Quelle pression cérébrale risque d’augmenter ?', 'Pression intracrânienne|PIC', src('b00011', 'b00027'), 'La déclivité ralentit le drainage veineux cérébral.', 'La table est inclinée et la congestion faciale apparaît rapidement.'),
      qroc('Quelle décision positionnelle est la plus sûre ?', 'Éviter ou réduire le Trendelenburg', src('b00003', 'b00027'), 'Une hypertension intracrânienne préalable rend la tête basse particulièrement dangereuse.', 'L’équipe rappelle l’hypertension intracrânienne active et reconsidère le compromis avec l’exposition chirurgicale.'),
      qroc('Quel autre compartiment subit une hausse de pression ?', 'Compartiment intraoculaire|Pression intraoculaire', src('b00017', 'b00018', 'b00027'), 'La congestion veineuse céphalique se transmet aux yeux.', 'Les conjonctives deviennent œdématiées malgré des paupières fermées et protégées.'),
      qroc('Quel effet respiratoire explique cette alarme ?', 'Diminution de la compliance respiratoire', src('b00020', 'b00027'), 'La bascule tête basse déplace le diaphragme et réduit le volume thoracique.', 'La pression inspiratoire augmente avec une baisse des volumes pulmonaires sans obstruction du circuit.'),
      qroc('Quel moyen de stabilisation faut-il privilégier ?', 'Matelas antidérapant|Matelas à billes', src('b00030'), 'Il évite le glissement sans comprimer la région sus-claviculaire.', 'Une position moins inclinée est retenue mais le patient glisse légèrement.'),
      qroc('Comment redresser le patient ?', 'Progressivement sous surveillance des signes vitaux', src('b00030'), 'La redistribution veineuse peut provoquer une baisse de pression artérielle.', 'À la fin, la table doit revenir rapidement en position horizontale.'),
    ],
  },
  {
    label: 'DP QROC 6 · Incident de table en lithotomie', allowed_voies: ['externe'],
    vignette: 'Une femme de 41 ans subit une chirurgie gynécologique en lithotomie. Les jambes sont installées sur des supports et la partie distale de la table est abaissée. La chirurgie est courte mais plusieurs changements de position sont nécessaires.',
    questions: [
      qroc('Quelle rotation de hanche doit rester minimale ?', 'Rotation externe', src('b00032'), 'Une rotation externe importante ajoute une contrainte inutile aux hanches et aux nerfs.'),
      qroc('Quelle mobilisation protège la colonne lombaire ?', 'Élévation simultanée des deux jambes', src('b00033'), 'Une manœuvre symétrique évite la torsion du bassin.', 'Le premier changement nécessite de replacer les jambes en hauteur.'),
      qroc('Quel nerf faut-il dégager du support ?', 'Nerf fibulaire commun|Nerf péronier commun', src('b00039'), 'Il est superficiel autour de la tête de la fibula.', 'Le support gauche appuie sur la tête de la fibula.'),
      qroc('Quelle variation tensionnelle faut-il anticiper ?', 'Baisse de la pression artérielle|Hypotension', src('b00035', 'b00036'), 'L’abaissement des jambes diminue le retour veineux.', 'Les deux membres sont ensuite ramenés vers le décubitus dorsal.'),
      qroc('Quelle zone faut-il vérifier avant ce redressement ?', 'Position des mains et des doigts', src('b00039'), 'La charnière peut coincer les extrémités et causer une amputation.', 'La partie distale de la table doit être relevée près du bras droit.'),
      qroc('Quelle complication grave peut survenir dans cette zone ?', 'Amputation digitale|Écrasement des doigts', src('b00039'), 'Des amputations ont été rapportées lors du redressement de table.', 'Un doigt reste engagé près de la charnière lorsque le moteur de la table est brièvement actionné.'),
      qroc('Quel contenu doit être ajouté au dossier ?', 'Description de la position, de l’incident et des contrôles', src('b00011'), 'Une trace précise soutient suivi clinique et analyse de qualité.', 'La main est finalement intacte après arrêt immédiat du mouvement.'),
    ],
  },
  {
    label: 'DP QROC 7 · Néphrectomie en décubitus latéral', allowed_voies: ['externe'],
    vignette: 'Un homme de 63 ans est placé en décubitus latéral droit pour une néphrectomie gauche. La jambe inférieure est fléchie, les jambes sont séparées par un coussin et la tête repose sur un support. Le rouleau thoracique et les membres supérieurs doivent encore être ajustés.',
    questions: [
      qroc('Quel membre inférieur doit être fléchi pour stabiliser le bassin ?', 'Membre inférieur dépendant|Jambe droite', src('b00042'), 'La flexion de la hanche et du genou inférieurs stabilise la position.'),
      qroc('Quelle structure superficielle faut-il dégager sous la tête ?', 'Oreille dépendante|Oreille droite', src('b00042', 'b00047'), 'Une pression prolongée peut léser le pavillon auriculaire.', 'Le support de tête replie l’oreille droite contre le crâne.'),
      qroc('Où faut-il replacer le rouleau ?', 'Sous le thorax, hors de l’aisselle', src('b00042'), 'Le thorax doit être soulevé sans compression céphalique du creux axillaire.', 'Le rouleau est palpé directement dans l’aisselle dépendante.'),
      qroc('Quelle orientation choisir pour ce bras ?', 'Extension et supination ou position neutre', src('b00021', 'b00042'), 'Cette position limite la pression sur le nerf ulnaire.', 'Le bras dépendant est très fléchi et proné sur la table.'),
      qroc('Quel poumon reçoit le plus de perfusion ?', 'Poumon dépendant|Poumon droit', src('b00043'), 'La gravité dirige le débit sanguin vers le poumon inférieur.', 'Après induction, l’équipe analyse la répartition des échanges gazeux.'),
      qroc('Quel mécanisme explique la désaturation ?', 'Inadéquation ventilation-perfusion|Déséquilibre V/Q', src('b00043', 'b00048'), 'La perfusion va vers le poumon dépendant tandis que la ventilation favorise l’autre.', 'La saturation diminue malgré une ventilation mécanique bilatérale.'),
      qroc('Quels appuis dépendants faut-il inspecter en priorité ?', 'Oreille, coude, thorax et genou dépendants', src('b00047'), 'Ces zones supportent directement le poids en position latérale.', 'Avant le retour dorsal, la chirurgie est terminée et toutes les zones déclives redeviennent accessibles.'),
    ],
  },
  {
    label: 'DP QROC 8 · Neuropathie après position genupectorale', allowed_voies: ['externe'],
    vignette: 'Un homme de 57 ans a subi une chirurgie lombaire longue en position genupectorale sur un support Wilson. L’abdomen était bien dégagé, mais une grande partie du poids reposait sur les genoux. Au réveil, il présente une faiblesse et des paresthésies d’un membre inférieur.',
    questions: [
      qroc('Quel avantage respiratoire offre la position genupectorale ?', 'Dégagement de l’abdomen', src('b00066', 'b00067'), 'L’abdomen libre favorise volumes pulmonaires et compliance.'),
      qroc('Quel point d’appui est particulièrement exposé ?', 'Genoux', src('b00066', 'b00067', 'b00090'), 'La variante genupectorale reporte une forte proportion du poids sur eux.', 'Le compte rendu note une durée de sept heures sans contrôle périodique ni changement de position.'),
      qroc('Quels trois mécanismes mécaniques peuvent l’expliquer ?', 'Compression, ischémie et étirement', src('b00005'), 'Une neuropathie de position associe souvent plusieurs contraintes.', 'Le déficit persiste après disparition complète du bloc neuromusculaire.'),
      qroc('Quel examen clinique faut-il réaliser ?', 'Examen neurologique complet', src('b00088'), 'La topographie motrice et sensitive oriente vers le nerf atteint.', 'Une asymétrie franche est confirmée en salle de réveil.'),
      qroc('Que recherche principalement cet examen précoce ?', 'Atteinte nerveuse préexistante', src('b00006', 'b00088'), 'La dénervation récente ne devient visible qu’après plusieurs semaines.', 'Une électromyographie est réalisée deux jours après la chirurgie pour rechercher une vulnérabilité antérieure.'),
      qroc('Quand répéter l’électromyographie ?', 'Environ quatre semaines|Après 3 à 4 semaines', src('b00005', 'b00088'), 'Ce délai permet d’objectiver les changements de dénervation récents.', 'Le premier tracé ne montre pas de lésion ancienne, tandis que le mécanisme compressif reste plausible.'),
      qroc('Quels éléments doit contenir le rapport ?', 'Facteurs de risque, chronologie, mécanisme, symptômes et évolution', src('b00088', 'b00090'), 'Une documentation complète permet le suivi et l’analyse du positionnement.', 'Le déficit est finalement retenu comme probablement périopératoire lors de la revue de qualité.'),
    ],
  },
];

export function buildChapter08(extract) {
  void extract;
  const series = structuredClone([...QCM_SERIES, ...DP_QCM_SERIES, ...QROC_SERIES, ...DP_QROC_SERIES]);
  return {
    fiche: buildFiche(),
    flashcards: buildFlashcards(),
    series,
  };
}

export default buildChapter08;
